# container for CRU chat
import os
import re
from flask import Flask, json, jsonify,request
from flask_sqlalchemy import SQLAlchemy
from dataclasses import dataclass
from flask_cors import CORS
from sqlalchemy import desc, asc

from datetime import datetime, time

from functions import bad_request


app = Flask(__name__)

# retreive secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password =  os.environ.get("db_password")
db_endpoint =  os.environ.get("db_endpoint")

db_name = "chat"

SQLAlchemy_DATABASE_URI = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLAlchemy_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle' : 299}

db = SQLAlchemy(app)

CORS(app)

class ChatHistory (db.Model):
    __tablename__ = "chat_history"

    sender_ID = db.Column(db.Integer, primary_key = True)
    recipient_ID = db.Column(db.Integer, primary_key = True)
    class_ID = db.Column(db.Integer, primary_key = True)
    message = db.Column(db.String(300))
    time_stamp = db.Column(db.DateTime, primary_key = True)
    view_status = db.Column(db.Integer)

    def __init__(self, sender_ID = None, recipient_ID = None, class_ID = None, message = None, time_stamp = None, view_status = None):
        self.sender_ID = sender_ID
        self.recipient_ID = recipient_ID
        self.class_ID = class_ID
        self.message = message
        self.time_stamp = time_stamp
        self.view_status = view_status
        

    def to_json(self):
        return {
            "sender_ID" : self.sender_ID,
            "recipient_ID" : self.recipient_ID,
            "class_ID" : self.class_ID,
            "message" : self.message,
            "time_stamp" : self.time_stamp,
            "view_status" : self.view_status
        }

def checkChat(sender_ID, recipient_ID, class_ID):
    return ChatHistory.query.filter_by(sender_ID = int(sender_ID), recipient_ID = int(recipient_ID), class_ID = int(class_ID)).first()

def close_session(db:SQLAlchemy):
    db.session.close()

@app.route('/chat/messages', methods= ['GET', 'POST', 'PUT'])
def chat_message():
    # get all message by learner and class ID
    if request.method == "GET":
        sender_ID = request.args.get("sender_ID")
        recipient_ID = request.args.get('recipient_ID')
        class_ID = request.args.get("class_ID")

        sender_chat_history = ChatHistory.query.filter_by(class_ID = class_ID, sender_ID = sender_ID, recipient_ID = recipient_ID).all()

        recipient_chat_history = ChatHistory.query.filter_by(class_ID = class_ID, sender_ID = recipient_ID, recipient_ID = sender_ID).all()
  

        chat_history_combined = sender_chat_history + recipient_chat_history

        sorted_chat = sorted(chat_history_combined, key=lambda x: x.time_stamp, reverse=True)

        close_session(db);
        return jsonify({
            "code" : 200,
            "data" : {
                "messages": [chat.to_json() for chat in sorted_chat],
               
            }
        }),200

    # update view status by sender, recipient and class ID
    if request.method == "PUT":
        data = request.json
        sender_ID = data['sender_ID']
        class_ID = data['class_ID']
        recipient_ID = data['recipient_ID']

        if checkChat(sender_ID, recipient_ID, class_ID,) is not None:
            print("not none")
            db.session.query(ChatHistory).filter_by(sender_ID = sender_ID, class_ID = class_ID, recipient_ID = recipient_ID).update({
                "view_status" : 1
            })
        
            db.session.commit()
            close_session(db);

            return jsonify({
                "code" : 200,
                "data" : {
                    "message" : "view statuses updated"
                }
            }),200
        return bad_request("chat does not exist")


    # insert new chat
    if request.method == "POST":
        current_date_time = datetime.now()
        data = request.json
        message = data['message']
        sender_ID = data['sender_ID']
        recipient_ID = data['recipient_ID']
        class_ID = data['class_ID']

        # date_time_formatted = f"{current_date_time.year}-{current_date_time.month}-{current_date_time.day} {current_date_time.hour}:{current_date_time.minute}:{current_date_time.second}"

        chat = ChatHistory(
            sender_ID = sender_ID,
             recipient_ID = recipient_ID,
             class_ID = class_ID,
              message = message, 
        time_stamp = datetime.now(),
        view_status = 0
        )
        db.session.add(chat)
        db.session.commit()

        
        #close_session(db);
        return jsonify({
            "code" : 200,
            "data" : {
                "message" : "message created"
            },
            "input" : chat.to_json()
        }),200

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")





