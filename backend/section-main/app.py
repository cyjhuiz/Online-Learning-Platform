from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import boto3
from datetime import datetime
from flask_cors import CORS
import requests
import os

# retrieve secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password = os.environ.get("db_password")
db_endpoint = os.environ.get("db_endpoint")

db_name = "section"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)
CORS(app)

s3_client = boto3.client(
    's3', 
    aws_access_key_id=os.environ.get("aws_access_key_id"),
    aws_secret_access_key=os.environ.get("aws_secret_access_key")
    )

class Section(db.Model):
    __tablename__ = 'section'

    section_ID= db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_ID = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(20), nullable=False)
    ranking = db.Column(db.Integer, nullable=False)
    has_content = db.Column(db.Boolean, nullable=False)
    has_quiz = db.Column(db.Boolean, nullable=False)
    section_contents = db.relationship("Section_content", backref="section", lazy="select", cascade="all, delete-orphan")

    def __init__(self, section_ID, class_ID, title, ranking, has_content, has_quiz):
        self.section_ID = section_ID
        self.class_ID = class_ID
        self.title = title
        self.ranking = ranking
        self.has_content = has_content
        self.has_quiz = has_quiz

    def json(self):
        return {
            "section_ID": self.section_ID,
            "class_ID": self.class_ID, 
            "title": self.title,
            "ranking": self.ranking, 
            "has_content": self.has_content,
            "has_quiz": self.has_quiz,
            }



class Section_content(db.Model):
    __tablename__ = 'section_content'

    content_ID= db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_ID = db.Column(db.Integer, db.ForeignKey("section.section_ID"))
    description = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(80), nullable=False)
    content_type = db.Column(db.String(20), nullable=False)
    content_views = db.relationship("Content_view", backref="section_content", lazy="select", cascade="all, delete-orphan")

    def __init__(self, content_ID, section_ID, description, url, content_type):
        self.content_ID = content_ID
        self.section_ID = section_ID
        self.description = description
        self.url = url
        self.content_type = content_type

    def json(self):
        return {
            "content_ID": self.content_ID,
            "section_ID": self.section_ID, 
            "description": self.description,
            "url": self.url,
            "content_type": self.content_type,
            }


class Content_view(db.Model):
    __tablename__ = 'content_view'

    content_ID= db.Column(db.Integer, db.ForeignKey("section_content.content_ID"))
    learner_ID = db.Column(db.Integer, nullable=False)
    section_ID = db.Column(db.Integer, nullable=False)

    __table_args__ = (
    db.PrimaryKeyConstraint(
        content_ID, learner_ID,
        ),
    )
    
    def __init__(self, content_ID, learner_ID, section_ID):
        self.content_ID = content_ID
        self.learner_ID = learner_ID
        self.section_ID = section_ID

    def json(self):
        return {
            "content_ID": self.content_ID,
            "learner_ID": self.learner_ID, 
            "section_ID": self.section_ID,
            }

@app.route("/section")
def get_all_sections():
    section_list = Section.query.all()

    try:
        if request.args.get("class_ID") and request.args.get("learner_ID"):
            class_ID = request.args.get("class_ID")
            learner_ID = request.args.get("learner_ID")

            section_list = Section.query.filter_by(class_ID=class_ID).order_by(Section.ranking.asc())
            section_json_list = [ section.json() for section in section_list]
            res = requests.get(f"https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result?learner_ID={learner_ID}&class_ID={class_ID}")
            if res.status_code != 200:
                return jsonify(
                    {
                        "code": 400,
                        "message": "An error occurred while fetching the associated quiz results for unlocking the sections."
                    }
                ), 400

            data = res.json()["data"]
            quiz_result_list = data["quiz_results"]

            next_section_ranking_to_unlock = None 
            for section in section_json_list:
                is_locked = True
                passed_current_quiz = False
                
                current_section_ranking = section["ranking"]
                if current_section_ranking == 1:
                    is_locked = False

                for quiz_result in quiz_result_list:
                    if section["section_ID"] == quiz_result["section_ID"] and quiz_result["has_passed"] == True:
                        next_section_ranking_to_unlock = section["ranking"] + 1
                        is_locked = False

                if current_section_ranking == next_section_ranking_to_unlock:
                    is_locked = False

                section["is_locked"] = is_locked

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "sections": [section for section in section_json_list]
                    }
                }
            )
            
        elif request.args.get("class_ID"):
            class_ID = request.args.get("class_ID")
            section_list = Section.query.filter_by(class_ID=class_ID).order_by(Section.ranking.asc())
        
        else:
            section_list = Section.query.all()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "sections": [ section.json() for section in section_list]
                }
            }
        )

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the sections."
            }
        ), 400



@app.route("/section/<string:section_ID>")
def get_section_by_section_ID(section_ID):

    try:
        section = Section.query.filter_by(section_ID=section_ID).first()

        if section:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section": section.json()
                    }
                }
            )
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "Section not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the section."
            }
        ), 400

@app.route("/section", methods=['POST'])
def create_section():

    try:
        data = request.get_json()
        title = data["title"]
        class_ID = data["class_ID"]

        if (Section.query.filter_by(title=title, class_ID=class_ID).first()):
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "title": title
                    },
                    "message": "Section title already exists in current class."
                }
            ), 400


        latest_section = Section.query.filter_by(class_ID=class_ID).order_by(Section.ranking.desc()).first()
        latest_section_ranking = latest_section.ranking if latest_section else 0
        section = Section(section_ID=None, class_ID=class_ID, title=title, ranking=latest_section_ranking+1, has_content=False, has_quiz=False)
        
        db.session.add(section)
        db.session.commit()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "section": section.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "title": title
                },
                "message": "An error occurred creating the section."
            }
        ), 400



        



@app.route("/section/<string:section_ID>", methods=['PUT'])
def update_section(section_ID):

    try:
        section = Section.query.filter_by(section_ID=section_ID).first()
        if section:
            data = request.get_json()

            if "title" in data.keys():
                section.title = data["title"]

            if "has_content" in data.keys():
                section.has_content = data["has_content"]
                
            if "has_quiz" in data.keys():
                section.has_quiz = data["has_quiz"]


            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section" : section.json()
                        }
                }
            )

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "section_ID": section_ID
                    },
                    "message": "section_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "title": title
                },
                "message": "An error occurred updating the section."
            }
        ), 400

@app.route("/section/<string:section_ID>", methods=['DELETE'])
def delete_section(section_ID):

    try:
        section = Section.query.filter_by(section_ID=section_ID).first()
        if section:
            db.session.delete(section)

            class_ID = section.class_ID
            class_section_list = Section.query.filter_by(class_ID=class_ID).order_by(Section.ranking.asc())

            ranking = 1
            for section in class_section_list:
                section.ranking = ranking
                ranking += 1
                
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section_ID": section_ID
                    }
                }
            ), 200
        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "section_ID": section_ID
                    },
                    "message": "section_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "section_ID": section_ID
                },
                "message": "An error occurred deleting the section."
            }
        ), 400


# ==== Section_content === #
@app.route("/section/<string:section_ID>/content")
def get_all_section_content_by_section_ID(section_ID):

    try:
        section = Section.query.filter_by(section_ID=section_ID).first()
        if section:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section_contents": [ section_content.json() for section_content in section.section_contents ]
                    }
                }
            )
        else: 
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section_ID": section_ID
                    },
                    "message": "Section does not exist."
                }
            )
    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "section_ID": section_ID
                },
                "message": "An error occurred fetching the section contents."
            }
        ), 400





@app.route("/section/content", methods=['POST'])
def create_section_content():

    try:
        data = request.form
        section_ID = data["section_ID"]

        url = None
        if data["content_type"] == "video":
            url = data["url"]

        elif data["content_type"] == "file":
            file = request.files["url"]
            filename = file.filename
            folder_name = "section_ID_" + str(section_ID)
            key = folder_name + "/" + filename
            url = f"https://spm-lms-s3.s3.amazonaws.com/{key}"

            # upload file to s3 bucket
            s3_client.upload_fileobj(file, Bucket='spm-lms-s3', Key=key, ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type})

        section_content = Section_content(
            content_ID = None,
            section_ID = section_ID, 
            description = data["description"],
            url = url,
            content_type = data["content_type"],
        )
        db.session.add(section_content)

        section = Section.query.filter_by(section_ID=section_ID).first()
        section.has_content = True

        db.session.commit()
            
        return jsonify(
            {
                "code": 200,
                "data": {
                    "section_content" : section_content.json()
                    }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "section_ID": data["section_ID"]
                },
                "message": "An error occurred creating the section content."
            }
        ), 400



@app.route("/section/<string:section_ID>/content/<string:content_ID>", methods=['PUT'])
def update_section_content(section_ID, content_ID):

    try:
        section_content = Section_content.query.filter_by(section_ID=section_ID, content_ID=content_ID).first()
        if section_content:
            data = request.form

            if "description" in data.keys():
                section_content.description = data["description"]
            
            
            if ("url" in data.keys() or "url" in request.files) and "content_type" in data.keys():

                url = None
                if data["content_type"] == "video":

                    if section_content.content_type == "file":
                        key = section_content.url.split(".com/")[1]
                        s3_client.delete_object(Bucket='spm-lms-s3', Key=key)

                    section_content.content_type = data["content_type"]
                    section_content.url = data["url"]

                elif data["content_type"] == "file":

                    # if content was a file, get filename and delete file
                    if section_content.content_type == "file":
                        key = section_content.url.split(".com/")[1]
                        s3_client.delete_object(Bucket='spm-lms-s3', Key=key)

                    # get naming variables based on previously known section content url
                    file = request.files["url"]
                    filename = file.filename
                    folder_name = "section_ID_" + str(section_ID)
                    key = folder_name + "/" + filename

                    # upload update file
                    s3_client.upload_fileobj(file, Bucket='spm-lms-s3', Key=key, ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type})
                    section_content.url = f"https://spm-lms-s3.s3.amazonaws.com/{key}"

                section_content.content_type = data["content_type"]

            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "section_content" : section_content.json()
                    }
                }
            )

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "content_ID": content_ID,
                        "section_ID": section_ID
                    },
                    "message": "Section content not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "content_ID": content_ID,
                    "section_ID": section_ID
                },
                "message": "An error occurred updating the section content."
            }
        ), 400


@app.route("/section/<string:section_ID>/content/<string:content_ID>", methods=['DELETE'])
def delete_section_content(section_ID,content_ID):

    try:
        section_content = Section_content.query.filter_by(section_ID=section_ID, content_ID=content_ID).first()

        if section_content:

            if section_content.content_type == "file":
                key = section_content.url.split(".com/")[1]
                s3_client.delete_object(Bucket='spm-lms-s3', Key=key)
            db.session.delete(section_content)

            section_content_list = Section_content.query.filter_by(section_ID=section_ID)
            if section_content_list.count() == 0:
                section = Section.query.filter_by(section_ID=section_ID).first()
                section.has_content = False

            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "content_ID": content_ID,
                        "section_ID": section_ID
                    }
                }
            )
        return jsonify(
            {
                "code": 400,
                "data": {
                    "content_ID": content_ID,
                    "section_ID": section_ID
                },
                "message": "Section content not found."
            }
        ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "content_ID": content_ID,
                    "section_ID": section_ID
                },
                "message": "An error occurred deleting the section content."
            }
        ), 400

# === section content views ===
@app.route("/section/<string:section_ID>/content/view")
def get_all_section_content_views_by_learner_ID(section_ID):

    try:
        if request.args.get("learner_ID"):
            learner_ID = request.args.get("learner_ID")
            content_view_list = Content_view.query.filter_by(section_ID=section_ID, learner_ID=learner_ID)

            if content_view_list:
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "content_views": [ content_view.json() for content_view in content_view_list ]
                        }
                    }
                )

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while retrieving the section content views."
            }
        ), 400

@app.route("/section/<string:section_ID>/content/<string:content_ID>/view")
def get_section_content_view_by_learner_ID(section_ID, content_ID):

    try:
        if request.args.get("learner_ID"):
            learner_ID = request.args.get("learner_ID")
            content_view = Content_view.query.filter_by(section_ID=section_ID, content_ID=content_ID, learner_ID=learner_ID).first()

            if content_view:
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "content_view": content_view.json()
                        }
                    }
                )
            
            else:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "learner_ID": learner_ID,
                            "content_ID": content_ID,
                        },
                        "message": "Learner has not viewed the content yet"
                    }
                )

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the section content views."
            }
        ), 400
    

@app.route("/section/<string:section_ID>/content/<string:content_ID>/view", methods=['POST'])
def create_section_content_view(section_ID, content_ID):

    try:
        data = request.get_json()

        learner_ID = data["learner_ID"]

        content_view = Content_view(content_ID=content_ID, learner_ID=learner_ID, section_ID=section_ID)

        if (Content_view.query.filter_by(content_ID=content_ID, learner_ID=learner_ID).first()):
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "learner_ID": learner_ID,
                        "content_ID": content_ID
                    },
                    "message": f"Content view record for learner #{learner_ID} already exists."
                }
            ), 400

        db.session.add(content_view)
        db.session.commit()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "content_view": content_view.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "content_ID": content_ID,
                    "learner_ID": learner_ID,
                },
                "message": "An error occurred while creating the content view record."
            }
        ), 400

@app.route("/section/<string:section_ID>/content/<string:content_ID>/view", methods=['DELETE'])
def delete_section_content_view(section_ID, content_ID):
    try:
        if request.args.get("learner_ID"):
            learner_ID = request.args.get("learner_ID")
            content_view = Content_view.query.filter_by(content_ID=content_ID, learner_ID=learner_ID, section_ID=section_ID).first()
            if content_view:
                db.session.delete(content_view)

                db.session.commit()
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "learner_ID": learner_ID,
                            "content_ID": content_ID
                        }
                    }
                )
            else:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "learner_ID": learner_ID,
                            "content_ID": content_ID
                        },
                        "message": "Content view record not found."
                    }
                ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "content_ID": content_ID,
                    "learner_ID": learner_ID,
                },
                "message": "An error occurred while deleting the content view record."
            }
        ), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")
