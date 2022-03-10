from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt

import sys
import os

import requests
import aiohttp
import asyncio

# retreive secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password = os.environ.get("db_password")
db_endpoint = os.environ.get("db_endpoint")

db_name = "user"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)
CORS(app)
bcrypt = Bcrypt(app)

User_role = db.Table('user_role', db.metadata,
    db.Column("user_ID", db.Integer, db.ForeignKey("user.user_ID")),
    db.Column("role_ID", db.Integer, db.ForeignKey("role.role_ID"))
)

class Role(db.Model):
    __tablename__ = 'role'

    role_ID= db.Column(db.Integer, nullable=False, primary_key=True)
    role= db.Column(db.String, nullable=False)

    def __init__(self, role_ID, role):
        self.role_ID = role_ID
        self.role = role

    def json(self):
        return {
        "role_ID": self.role_ID,
        "role": self.role,
        }

        
class User(db.Model):
    __tablename__ = 'user'

    user_ID= db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(40), nullable=False)
    name = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)
    job_title = db.Column(db.String(20), nullable=False)
    department = db.Column(db.String(40), nullable=False)
    roles = db.relationship("Role", secondary=User_role, backref="users", lazy="select")
    learner_completed = db.relationship("Learner_completed", backref="user", lazy="select")

    def __init__(self, user_ID, email, name, password, job_title, department):
        self.user_ID = user_ID
        self.email = email
        self.name = name
        self.password = password
        self.job_title = job_title
        self.department = department

    def json(self):
        return {
            "user_ID": self.user_ID,
            "email": self.email, 
            "name": self.name,
            "password": self.password,
            "job_title": self.job_title, 
            "department": self.department,
            "roles": [ role.role for role in self.roles ] 
            }


class Learner_completed(db.Model):
    __tablename__ = 'learner_completed'

    learner_ID= db.Column(db.Integer, db.ForeignKey("user.user_ID"))
    course_ID= db.Column(db.Integer, nullable=False)
    class_ID= db.Column(db.Integer, nullable=False)
    status= db.Column(db.String, nullable=False)

    __table_args__ = (
    db.PrimaryKeyConstraint(
        learner_ID, course_ID,
        ),
    )

    def __init__(self, learner_ID, course_ID, class_ID, status):
        self.learner_ID = learner_ID
        self.course_ID = course_ID
        self.class_ID = class_ID
        self.status = status

    def json(self):
        return {
            "learner_ID": self.learner_ID,
            "course_ID": self.course_ID,
            "class_ID": self.class_ID,
            "status": self.status
            }

@app.route("/user")
def get_all_users():

    try:
        user_list = User.query.all()
        return jsonify(
            {
                "code": 200,
                "data": {
                    "users": [user.json() for user in user_list]
                }
            }
        ), 200
    
    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching users."
            }
        ), 400


@app.route("/user/<string:user_ID>")
def get_user_by_id(user_ID):

    try:
        user = User.query.filter_by(user_ID=user_ID).first()
        
        if user:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "user": user.json()
                        }
                }
            )
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "User not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "user_ID": user_ID
                },
                "message": "An error occurred while fetching the user."
            }
        ), 400


@app.route("/user", methods=['POST'])
def create_user():
    data = request.get_json()

    email = data["email"]
    name = data["name"]
    password = data["password"]
    job_title = data["job_title"]
    department = data["department"]

    hashed_password = bcrypt.generate_password_hash(password)
    try:
        last_user_ID = User.query.all()[-1].user_ID if len(User.query.all()) != 0 else 0
        user = User(user_ID = last_user_ID + 1, email=email, name=name, password=hashed_password, job_title=job_title, department=department)

        if (User.query.filter_by(email=email).first()):
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "email": email
                    },
                    "message": "Email already exists."
                }
            ), 400

        
        learner_role = Role.query.filter_by(role="learner").first()
        user.roles.append(learner_role)
        db.session.add(user)
        db.session.commit()

        user_login_details = user.json()
        del user_login_details["password"]

        return jsonify(
            {
                "code": 200,
                "data": {
                    "user_login_details": user_login_details
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while creating the user."
            }
        ), 400

        

@app.route("/user/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]

    try:
        user = User.query.filter_by(email=email).first()
        password_is_valid = bcrypt.check_password_hash(user.password, password)
        if user and password_is_valid:
            user_login_details = user.json()
            del user_login_details["password"]
            return jsonify(
                {
                    "code": 200,
                    "data": { 
                        "user_login_details" : user_login_details 
                    }
                }
            ), 200
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "Incorrect login details, please try again."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "email": email
                },
                "message": "An error occurred while logging in."
            }
        ), 400



@app.route("/user/<string:user_ID>", methods=['PUT'])
def update_user(user_ID):

    try:
        user = User.query.filter_by(user_ID=user_ID).first()
        if user:
            data = request.get_json()

            if "email" in data.keys():
                email = data["email"]
                if (User.query.filter_by(email=email).first()):
                    return jsonify(
                        {
                            "code": 400,
                            "data": {
                                "email": email
                            },
                            "message": "Email already exists."
                        }
                    ), 400

                user.email = data["email"]

            if "password" in data.keys():
                password = data["password"]
                hashed_password = bcrypt.generate_password_hash(password)
                user.password = hashed_password
            
            if "name" in data.keys():
                user.name = data["name"]

            if "job_title" in data.keys():
                user.job_title = data["job_title"]

            if "department" in data.keys():
                user.department = data["department"]
                

            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": user.json()
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "user_ID": user_ID
                    },
                    "message": "user_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "user_ID": user_ID
                },
                "message": "An error occurred while updating the user."
            }
        ), 400


@app.route("/user/<string:user_ID>", methods=['DELETE'])
def delete_user(user_ID):

    try:
        user = User.query.filter_by(user_ID=user_ID).first()
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "user_ID": user_ID
                    }
                }
            ), 200

        else:    
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "user_ID": user_ID
                    },
                    "message": "user_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "user_ID": user_ID
                },
                "message": "An error occurred while deleting the user."
            }
        ), 400



# === learner_completed

@app.route("/user/learner_completed")
def get_all_learner_completed():

    try:
        learner_completed_list = Learner_completed.query.all()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "learner_completed": [ learner_completed.json() for learner_completed in learner_completed_list ]
                }
            }
        )

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the users."
            }
        ), 400


@app.route("/user/<string:learner_ID>/learner_completed")
def get_all_learner_completed_by_learner_ID(learner_ID):
    try:
        if request.args.get("course_ID"):
            course_ID= request.args.get("course_ID")
            learner_completed = Learner_completed.query.filter_by(learner_ID=learner_ID, course_ID=course_ID).first()
            
            if learner_completed:
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "learner_completed": learner_completed.json()
                        }
                    }
                ), 200

            else:
                return jsonify({
                    "code": 400,
                    "message": "Learner completion record not found"
                }), 400

        else:
            learner_completed_list = Learner_completed.query.filter_by(learner_ID=learner_ID)

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "learner_completed": [ learner_completed.json() for learner_completed in learner_completed_list ]
                    }
                }
            ), 200
    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the learner compelted records."
            }
        ), 400


@app.route("/user/<string:learner_ID>/learner_completed", methods=['POST'])
def create_learner_completed(learner_ID):
    data = request.get_json()

    course_ID = data["course_ID"]
    class_ID = data["class_ID"]
    status = data["status"]

    try:
        learner_completed = Learner_completed(learner_ID=learner_ID, course_ID=course_ID, class_ID=class_ID, status=status)

        if (Learner_completed.query.filter_by(learner_ID=learner_ID, course_ID=course_ID).first()):
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "learner_ID": learner_ID,
                        "course_ID": course_ID
                    },
                    "message": f"Learner completion record for course #{course_ID} already exists."
                }
            ), 400

        
        db.session.add(learner_completed)
        db.session.commit()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "learner_completed": learner_completed.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "learner_ID": learner_ID,
                    "course_ID": course_ID
                },
                "message": "An error occurred creating the learner completion record."
            }
        ), 400

@app.route("/user/<string:learner_ID>/learner_completed", methods=['PUT'])
def update_learner_completed(learner_ID):
    data = request.get_json()

    try:
        if request.args.get("course_ID"):
            course_ID = request.args.get("course_ID")
            if not(Learner_completed.query.filter_by(learner_ID=learner_ID, course_ID=course_ID).first()):
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "learner_ID": learner_ID,
                            "course_ID": course_ID
                        },
                        "message": f"Learner completion record for course #{course_ID} does not exist."
                    }
                ), 400

            learner_completed = Learner_completed.query.filter_by(learner_ID=learner_ID, course_ID=course_ID).first()
            
            if "status" in data.keys():
                learner_completed.status = data["status"]
            

            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "learner_completed": learner_completed.json()
                    }
                }
            ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "learner_ID": learner_ID,
                },
                "message": "An error occurred updating the learner completion record."
            }
        ), 400


@app.route("/user/<string:learner_ID>/learner_completed", methods=['DELETE'])
def delete_learner_completed(learner_ID):

    try:
        if request.args.get("course_ID"):
            course_ID = request.args.get("course_ID")
            learner_completed = Learner_completed.query.filter_by(learner_ID=learner_ID, course_ID=course_ID).first()
            if learner_completed:
                db.session.delete(learner_completed)

                db.session.commit()
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "learner_ID": learner_ID,
                            "course_ID": course_ID
                        }
                    }
                ), 200

            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "learner_ID": learner_ID,
                        "course_ID": course_ID
                    },
                    "message": "Learner completed record not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "learner_ID": learner_ID,
                },
                "message": "An error occurred deleting the learner completion record."
            }
        ), 400

# helper functions for @app.route("/user/course_eligibility")
def get_course_trainer_IDs_from_class_list(class_list):
    course_trainer_ID_list = []
    for current_class in class_list:
        course_trainer_ID_list.append(current_class["trainer_ID"])
    return course_trainer_ID_list

async def get_class_user_IDs_from_class_ID(session, class_ID):
    class_user_ID_list = []
    url = f"https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/{class_ID}"
    async with session.get(url) as response:
        res = await response.json()
        data = res["data"]
        user_list = data["users"] if "users" in data.keys() else []
        class_user_ID_list = [ user["user_ID"] for user in user_list ]
    
    return class_user_ID_list


async def get_class_user_IDs_from_class_list(class_list):
    collated_class_user_ID_list = []
    course_class_ID_list = []
    for current_class in class_list:
        if current_class["class_status"] != "RETIRED":
            course_class_ID_list.append(current_class["class_ID"])

    async with aiohttp.ClientSession() as session:
        tasks = []
        for class_ID in course_class_ID_list:
            task = asyncio.ensure_future(get_class_user_IDs_from_class_ID(session, class_ID))
            tasks.append(task)
        
        task_results = await asyncio.gather(*tasks)
        for result in task_results:
            collated_class_user_ID_list.extend(result)

    return collated_class_user_ID_list

# continuation of API routes
@app.route("/user/course_eligibility")
def get_all_eligible_class_enrollment_users_by_course_ID():

    try:
        if request.args.get("course_ID"):
            course_ID = request.args.get("course_ID")

            # Get list of course preqrequisite IDs for current course
            res = requests.get(f"https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID={course_ID}")
            if res.status_code !=200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "course_ID": course_ID,
                        },
                        "message": "An error occurred while getting the course prerequisites."
                    }
                ), 400

            data = res.json()["data"]
            course_prerequisite_list = data["course"]["prerequisites"]
            course_prerequisite_ID_list = [ course_prerequisite["course_ID"] for course_prerequisite in course_prerequisite_list ]

            # Get list of trainer IDs and class_user IDs for current course
            res = requests.get(f"https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID={course_ID}")
            if res.status_code != 200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "course_ID": course_ID,
                        },
                        "message": f"An error occurred while getting the list of classes in course #{course_ID}."
                    }
                ), 400

            data = res.json()["data"]
            class_list = data["classes"] if "classes" in data.keys() else [] 
            course_trainer_ID_list = get_course_trainer_IDs_from_class_list(class_list)

            if sys.platform.startswith('win32'):
                asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
            class_user_ID_list = asyncio.run(get_class_user_IDs_from_class_list(class_list))
            
            
            # Get all eligible users who have yet to complete course but have fulfilled the prerequisites
            user_candidate_list = User.query.filter(
                User.user_ID.notin_(class_user_ID_list),
                User.user_ID.notin_(course_trainer_ID_list), 
            )

            eligible_user_list = []
            for user in user_candidate_list:
                is_eligible = True

                has_completed_course = False
                num_fulfilled_prerequisites = 0
                for learner_completed in user.learner_completed:
                    if learner_completed.course_ID == course_ID and learner_completed.status == "COMPLETED":
                        has_completed_course = True

                    elif learner_completed.course_ID in course_prerequisite_ID_list:
                        num_fulfilled_prerequisites += 1

                fulfilled_prerequisites = num_fulfilled_prerequisites == len(course_prerequisite_ID_list)
                if has_completed_course or not(fulfilled_prerequisites):
                    is_eligible = False

                if is_eligible:
                    eligible_user_list.append(user)

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "eligible_users": [ user.json() for user in eligible_user_list ]
                    }
                }
            ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "learner_ID": learner_ID,
                },
                "message": "An error occurred while getting the learner course eligibility."
            }
        ), 400

@app.route("/user/class_progress")
def get_learner_class_progress_by_class_ID():
    try:
        if request.args.get("class_ID"):
            class_ID = request.args.get("class_ID")
            
            class_user_ID_list = []
            res = requests.get(f"https://class-container-7ii64z76zq-uc.a.run.app/class/class_user/{class_ID}")
            if res.status_code !=200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "class_ID": class_ID,
                        },
                        "message": "An error occurred while getting the list of class users."
                    }
                ), 400

           

            data = res.json()["data"]
            class_user_ID_list = [ user["user_ID"] for user in data["users"] ]
            class_user_ID_list.sort()


            class_user_info_list = User.query.filter(
                User.user_ID.in_(class_user_ID_list),
            ).order_by(User.user_ID.asc())


            section_list = []
            res = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID={class_ID}")
            if res.status_code !=200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "class_ID": class_ID,
                        },
                        "message": "An error occurred while getting the list of sections."
                    }
                ), 400
            data = res.json()["data"]
            section_list = data["sections"]
            section_list.sort(key=lambda section_obj : section_obj["ranking"])

       
            quiz_result = []
            res = requests.get( f"https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result?class_ID={class_ID}")
            if res.status_code !=200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "class_ID": class_ID,
                        },
                        "message": "An error occurred while getting the quiz results for the associated class."
                    }
                ), 400


            data = res.json()["data"]
            quiz_result_list = data["quiz_results"]
            quiz_result_list.sort(key=lambda quiz_result_obj : quiz_result_obj["learner_ID"])

            learner_progress_list = []
            quiz_result_idx = 0
            for i in range(len(class_user_ID_list)):
                learner_progress = {
                    "final_quiz": {
                        "quiz_score": None,
                        "has_passed": None
                    }
                }

                current_user_ID = class_user_ID_list[i]
                learner_progress["user_ID"] = current_user_ID

                users_name = class_user_info_list[i].name
                learner_progress["name"] = users_name

                next_user_ID = current_user_ID
                last_attempted_section = 1
                final_quiz_score = None
                while next_user_ID == current_user_ID and quiz_result_idx < len(quiz_result_list):
                    quiz_result = quiz_result_list[quiz_result_idx]

                    if quiz_result["section_ID"] == -1:
                        learner_progress["final_quiz"]["quiz_score"] = quiz_result["quiz_score"]
                        learner_progress["final_quiz"]["has_passed"] = quiz_result["has_passed"]

                    if quiz_result["learner_ID"] == current_user_ID and quiz_result["has_passed"] == 1:
                        last_attempted_section += 1
                    quiz_result_idx += 1

                    if quiz_result_idx < len(quiz_result_list):
                        next_user_ID = quiz_result_list[quiz_result_idx]["learner_ID"]
                    

                section_idx = last_attempted_section-1
                if section_idx > len(section_list) - 1:
                    section_idx = len(section_list) - 1

                section = section_list[section_idx]
                learner_progress["last_attempted_section"] = section["title"]

                learner_progress_list.append(learner_progress)

            return { 
                "code": 200,
                "data": learner_progress_list 
                }
    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while getting the learner progress."
            }
        ), 400

        
if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")

