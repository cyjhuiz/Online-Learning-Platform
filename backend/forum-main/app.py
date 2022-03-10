from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from flask_cors import CORS
import requests
import os

# retrieve secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password = os.environ.get("db_password")
db_endpoint = os.environ.get("db_endpoint")

db_name = "forum"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)
CORS(app)


class Forum_thread(db.Model):
    __tablename__ = 'forum_thread'

    thread_ID= db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_ID = db.Column(db.Integer, nullable=False)
    thread_title = db.Column(db.String(255), nullable=False)
    thread_date = db.Column(db.String(100), nullable=False)
    creator_ID = db.Column(db.Integer, nullable=False)
    creator_name = db.Column(db.String(255), nullable=False)
    posts = db.relationship("Post", backref="forum_thread", lazy="select", cascade="all, delete-orphan")

    def __init__(self, thread_ID, class_ID, thread_title, thread_date, creator_ID, creator_name):
        self.thread_ID = thread_ID
        self.class_ID = class_ID
        self.thread_title = thread_title
        self.thread_date = thread_date
        self.creator_ID = creator_ID
        self.creator_name = creator_name

    def json(self):
        return {
            "thread_ID": self.thread_ID,
            "class_ID": self.class_ID, 
            "thread_title": self.thread_title,
            "thread_date": self.thread_date,
            "creator_ID": self.creator_ID,
            "creator_name": self.creator_name,
            "num_thread_replies": len(self.posts)
            }


class Post(db.Model):
    __tablename__ = 'post'

    post_ID= db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
    thread_ID = db.Column(db.Integer, db.ForeignKey("forum_thread.thread_ID"))
    post_date = db.Column(db.String(100), nullable=False)
    post_content = db.Column(db.String(500), nullable=False)
    creator_ID = db.Column(db.Integer, nullable=False)
    creator_name = db.Column(db.String(255), nullable=False)
    post_likes = db.relationship("Post_like", backref="post", lazy="select", cascade="all, delete-orphan")
    replies = db.relationship("Reply", backref='post', lazy="select", cascade="all, delete-orphan")
    
    def __init__(self, post_ID, thread_ID, post_date, post_content, creator_ID, creator_name):
        self.post_ID = post_ID
        self.thread_ID = thread_ID
        self.post_date = post_date
        self.post_content = post_content
        self.creator_ID = creator_ID
        self.creator_name = creator_name

    def json(self):
        return {
            "post_ID": self.post_ID,
            "thread_ID": self.thread_ID, 
            "post_date": self.post_date,
            "post_content": self.post_content,
            "creator_ID": self.creator_ID,
            "creator_name": self.creator_name,
            "num_post_likes": len(self.post_likes),
            "num_post_replies": len(self.replies),
            "post_likes": [ post_like.user_ID for post_like in self.post_likes ],
            "replies": [ reply.json() for reply in self.replies ]
            }

class Reply(db.Model):
    __tablename__ = 'reply'

    reply_ID= db.Column(db.Integer, nullable=False, primary_key=True, autoincrement=True)
    post_ID = db.Column(db.Integer, db.ForeignKey("post.post_ID"))
    reply_date = db.Column(db.String(100), nullable=False)
    reply_content = db.Column(db.String(500), nullable=False)
    creator_ID = db.Column(db.Integer, nullable=False)
    creator_name = db.Column(db.String(255), nullable=False)
    reply_likes = db.relationship("Reply_like", backref="reply", lazy="select", cascade="all, delete-orphan")
    
    def __init__(self, reply_ID, post_ID, reply_date, reply_content, creator_ID, creator_name):
        self.reply_ID = reply_ID
        self.post_ID = post_ID
        self.reply_date = reply_date
        self.reply_content = reply_content
        self.creator_ID = creator_ID
        self.creator_name = creator_name

    def json(self):
        return {
            "reply_ID": self.reply_ID,
            "post_ID": self.post_ID, 
            "reply_date": self.reply_date,
            "reply_content": self.reply_content,
            "creator_ID": self.creator_ID,
            "creator_name": self.creator_name,
            "num_reply_likes": len(self.reply_likes),
            "reply_likes": [ reply_like.user_ID for reply_like in self.reply_likes ],
            }

class Post_like(db.Model):
    __tablename__ = 'post_like'

    user_ID= db.Column(db.Integer, nullable=False)
    post_ID = db.Column(db.Integer, db.ForeignKey("post.post_ID"))

    __table_args__ = (
    db.PrimaryKeyConstraint(
        user_ID, post_ID,
        ),
    )

    def __init__(self, user_ID, post_ID):
        self.user_ID = user_ID
        self.post_ID = post_ID

    def json(self):
        return {
            "user_ID": self.user_ID,
            "post_ID": self.post_ID, 
            }


class Reply_like(db.Model):
    __tablename__ = 'reply_like'

    user_ID= db.Column(db.Integer, nullable=False)
    reply_ID = db.Column(db.Integer, db.ForeignKey("reply.reply_ID"))

    __table_args__ = (
    db.PrimaryKeyConstraint(
        user_ID, reply_ID,
        ),
    )

    
    def __init__(self, user_ID, reply_ID):
        self.user_ID = user_ID
        self.reply_ID = reply_ID

    def json(self):
        return {
            "user_ID": self.user_ID,
            "reply_ID": self.reply_ID
            }



@app.route("/forum_thread")
def get_all_forum_threads():

    try:
        if request.args.get("class_ID"):
            class_ID = request.args.get("class_ID")
            forum_thread_list = Forum_thread.query.filter_by(class_ID=class_ID)
            
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "forum_threads": [ forum_thread.json() for forum_thread in forum_thread_list]
                    }
                }
            ), 200
        else:
            forum_thread_list = Forum_thread.query.all()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "forum_threads": [ forum_thread.json() for forum_thread in forum_thread_list]
                    }
                }
            ), 200
    
    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the forum threads."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>")
def get_forum_thread_by_ID(thread_ID):

    try:
        forum_thread = Forum_thread.query.filter_by(thread_ID=thread_ID).first()
        
        if forum_thread:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "forum_thread": forum_thread.json()
                        }
                }
            )
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "Forum thread not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "thread_ID": thread_ID
                },
                "message": "An error occurred while fetching the forum thread."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>")
def get_post_by_thread_ID_and_forum_ID(thread_ID, post_ID):

    try:
        post = Post.query.filter_by(thread_ID=thread_ID, post_ID=post_ID).first()
        
        if post:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "post": post.json()
                        }
                }
            )
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "Post not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while fetching the post."
            }
        ), 400


@app.route("/forum_thread", methods=['POST'])
def create_forum_thread():

    try:
        data = request.get_json()
        class_ID = data["class_ID"]
        thread_title = data["thread_title"]
        creator_ID = data["creator_ID"]
        creator_name = data["creator_name"]
        thread_date = datetime.now() + timedelta(hours = 8)
        thread_date = thread_date.strftime("%Y-%m-%d %H:%M:%S")

        forum_thread = Forum_thread(thread_ID=None, class_ID=class_ID, thread_title=thread_title, thread_date=thread_date, creator_ID=creator_ID, creator_name=creator_name)

        db.session.add(forum_thread)
        db.session.commit()
        return jsonify(
            {
                "code": 200,
                "data": {
                    "forum_thread": forum_thread.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred creating the forum thread."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>", methods=['PUT'])
def update_forum_thread_by_ID(thread_ID):

    try:
        forum_thread = Forum_thread.query.filter_by(thread_ID=thread_ID).first()
        if forum_thread:
            data = request.get_json()

            if "thread_title" in data.keys():
                forum_thread.thread_title = data["thread_title"]         

            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": forum_thread.json()
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "thread_ID": thread_ID
                    },
                    "message": "thread_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "thread_ID": thread_ID
                },
                "message": "An error occurred while updating the forum thread."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>", methods=['DELETE'])
def delete_forum_thread_by_ID(thread_ID):

    try:
        forum_thread = Forum_thread.query.filter_by(thread_ID=thread_ID).first()
        if forum_thread:
            db.session.delete(forum_thread)
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "thread_ID": thread_ID
                    }
                }
            ), 200
        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "thread_ID": thread_ID
                    },
                    "message": "thread_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "thread_ID": thread_ID
                },
                "message": "An error occurred deleting the thread."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post")
def get_posts_by_thread_ID(thread_ID):

    try:
        forum_thread = Forum_thread.query.filter_by(thread_ID=thread_ID).first()
        if forum_thread:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "posts": [ post.json() for post in forum_thread.posts ]
                    }
                }
            )
        else: 
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "thread_ID": thread_ID
                    },
                    "message": "Forum thread does not exist."
                }
            )
    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "thread_ID": thread_ID
                },
                "message": "An error occurred fetching the thread's posts."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>")
def get_post_by_thread_ID_and_post_ID(thread_ID, post_ID):

    try:
        post = Post.query.filter_by(thread_ID=thread_ID, post_ID=post_ID).first()
        
        if post:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "post": post.json()
                        }
                }
            )
        else:
            return jsonify(
                {
                    "code": 400,
                    "message": "Post not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while fetching the post."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>/post", methods=['POST'])
def create_post(thread_ID):

    try:
        data = request.get_json()
        post_date = datetime.now() + timedelta(hours = 8)
        post_date = post_date.strftime("%Y-%m-%d %H:%M:%S")
        post_content = data["post_content"]
        creator_ID = data["creator_ID"]
        creator_name = data["creator_name"]

        post = Post(post_ID=None, thread_ID=thread_ID, post_date=post_date, post_content=post_content, creator_ID=creator_ID, creator_name=creator_name)
        db.session.add(post)
        db.session.commit()
        return jsonify(
        {
            "code": 200,
            "data": {
                "post": post.json()
            }
        }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "thread_ID": thread_ID
                },
                "message": "An error occurred while creating the post."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>", methods=['PUT'])
def update_post(thread_ID, post_ID):

    try:
        post = Post.query.filter_by(thread_ID=thread_ID, post_ID=post_ID).first()
        if post:
            data = request.get_json()

            if "post_content" in data.keys():
                post.post_content = data["post_content"]
                
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": post.json()
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "post_ID": post_ID
                    },
                    "message": "post_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while updating the post."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>", methods=['DELETE'])
def delete_post(thread_ID, post_ID):

    try:
        post = Post.query.filter_by(thread_ID=thread_ID, post_ID=post_ID).first()
        if post:
            db.session.delete(post)
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "post_ID": post_ID
                    }
                }
            ), 200

        else:    
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "post_ID": post_ID
                    },
                    "message": "post_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while deleting the post."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/reply", methods=['POST'])
def create_reply(thread_ID, post_ID):

    try:
        data = request.get_json()
        creator_ID = data["creator_ID"]
        creator_name = data["creator_name"]
        reply_date = datetime.now() + timedelta(hours = 8)
        reply_date = reply_date.strftime("%Y-%m-%d %H:%M:%S")
        reply_content = data["reply_content"]

        reply = Reply(reply_ID=None, post_ID=post_ID, reply_date=reply_date, reply_content=reply_content, creator_ID=creator_ID, creator_name=creator_name)

        db.session.add(reply)
        db.session.commit()
        return jsonify(
            {
                "code": 200,
                "data": {
                    "reply": reply.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred creating post reply."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/reply/<string:reply_ID>", methods=['PUT'])
def update_reply(thread_ID, post_ID, reply_ID):

    try:
        reply = Reply.query.filter_by(reply_ID=reply_ID, post_ID=post_ID).first()
        if reply:
            data = request.get_json()
            if "reply_content" in data.keys():
                reply.reply_content = data["reply_content"]
                
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": reply.json()
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "reply_ID": reply_ID
                    },
                    "message": "reply_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "reply_ID": reply_ID
                },
                "message": "An error occurred while updating the reply."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/reply/<string:reply_ID>", methods=['DELETE'])
def delete_reply(thread_ID, post_ID, reply_ID):

    try:

        reply = Reply.query.filter_by(reply_ID=reply_ID, post_ID=post_ID).first()
        if reply:
            db.session.delete(reply)
            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "reply_ID": reply_ID
                    }
                }
            ), 200

        else:    
            return jsonify(
                {
                    "code": 400,
                    "message": "User has not replied to the post yet."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while deleting user's reply."
            }
        ), 400

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/post_like", methods=['POST'])
def create_post_like(thread_ID, post_ID):

    try:
        data = request.get_json()
        user_ID = data["user_ID"]
        post_like = Post_like.query.filter_by(user_ID=user_ID, post_ID=post_ID).first()
        if post_like:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "post_ID": post_ID
                    },
                    "message": "User already liked the post."
                }
            ), 400

        else:
            post_like = Post_like(user_ID=user_ID, post_ID=post_ID)
            db.session.add(post_like)
            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "post_like": post_like.json()
                    }
                }
            ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred adding post's like."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/post_like", methods=['DELETE'])
def delete_post_like(thread_ID, post_ID):

    try:
        if request.args.get("user_ID"):
            user_ID = request.args.get("user_ID")
            post_like = Post_like.query.filter_by(user_ID=user_ID, post_ID=post_ID).first()
            if post_like:
                db.session.delete(post_like)
                db.session.commit()
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "post_like": post_like.json()
                        }
                    }
                ), 200

            else:    
                return jsonify(
                    {
                        "code": 400,
                        "message": "User has not liked the post yet."
                    }
                ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "post_ID": post_ID
                },
                "message": "An error occurred while removing the post's like."
            }
        ), 400        

@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/reply/<string:reply_ID>/reply_like", methods=['POST'])
def create_reply_like(thread_ID, post_ID, reply_ID):

    try:
        data = request.get_json()
        user_ID = data["user_ID"]
        reply_like = Reply_like.query.filter_by(user_ID=user_ID, reply_ID=reply_ID).first()
        if reply_like:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "reply_ID": reply_ID
                    },
                    "message": "User already liked the reply."
                }
            ), 400

        else:
            reply_like = Reply_like(user_ID=user_ID, reply_ID=reply_ID)
            db.session.add(reply_like)
            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "reply_like": reply_like.json()
                    }
                }
            ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "reply_ID": reply_ID
                },
                "message": "An error occurred adding reply like."
            }
        ), 400


@app.route("/forum_thread/<string:thread_ID>/post/<string:post_ID>/reply/<string:reply_ID>/reply_like", methods=['DELETE'])
def delete_reply_like(thread_ID, post_ID, reply_ID):

    try:
        if request.args.get("user_ID"):
            user_ID = request.args.get("user_ID")
            reply_like = Reply_like.query.filter_by(user_ID=user_ID, reply_ID=reply_ID).first()
            if reply_like:
                db.session.delete(reply_like)
                db.session.commit()
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "reply_like": reply_like.json()
                        }
                    }
                ), 200

            else:    
                return jsonify(
                    {
                        "code": 400,
                        "message": "User has not liked the reply yet."
                    }
                ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "reply_ID": reply_ID
                },
                "message": "An error occurred while removing reply like."
            }
        ), 400     
        
if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")