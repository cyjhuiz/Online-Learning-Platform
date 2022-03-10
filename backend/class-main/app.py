# container for CRUD course

from models.courseInfo import CourseInfo
from models.learnerInfo import LearnerInfo
from models.trainerInfo import TrainerInfo

import asyncio
import httpx

from datetime import datetime
from flask import Flask, jsonify,request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from flask_cors import CORS

from functions import bad_request
import requests
import os

app = Flask(__name__)
CORS(app)

# retreive secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password = os.environ.get("db_password")
db_endpoint = os.environ.get("db_endpoint")

db_name = "class"

SQLAlchemy_DATABASE_URI = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLAlchemy_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle' : 299}

class Class (db.Model):
      
    __tablename__ = "class"

    class_ID = db.Column(db.Integer, primary_key = True, autoincrement = True)
    course_ID = db.Column(db.Integer)
    class_name = db.Column(db.String(40))
    size = db.Column(db.String(200))
    starting_date = db.Column(db.String(100))
    ending_date = db.Column(db.String(100))
    class_status = db.Column(db.String(20))
    trainer_ID = db.Column(db.Integer)
    hr_ID = db.Column(db.Integer)
    enrol_start_date = db.Column(db.String(100))
    enrol_end_date = db.Column(db.String(100))
    hr_name = ""
  
    def __init__(self, course_ID = None, class_name = None, size = None, starting_date = None, ending_date = None, enrol_start_date = None, enrol_end_date = None ,class_status = None, trainer_ID = None, hr_ID = None, hr_name = None):
        self.course_ID = course_ID
        self.class_name = class_name
        self.size = size
        self.starting_date = starting_date
        self.ending_date = ending_date
        self.class_status = class_status
        self.trainer_ID = trainer_ID
        self.hr_ID = hr_ID
        self.enrol_start_date = enrol_start_date
        self.enrol_end_date = enrol_end_date
        self.hr_name = hr_name
        self.course_info = CourseInfo()
        self.learner_info = LearnerInfo()
        self.trainer_info = TrainerInfo()
        self.set_enrolled_users(0)
        
    
    def set_course_info(self):
        self.course_info = CourseInfo()

    def set_trainer_info(self):
        self.trainer_info = TrainerInfo()
    
    def set_learner_info(self):
        self.learner_info = LearnerInfo()

    def get_remaining_slots(self):
        if self.size != None:
            return self.size - self.enrolled_users
        return 0
    
    def set_class_hr_name(self, name):
        self.hr_name = name
    
    def set_enrolled_users(self, enrolled_users):
        self.enrolled_users = enrolled_users

    def set_class_details(self, class_ID, course_ID, class_name, size, starting_date, ending_date, class_status, trainer_ID, hr_ID, enrol_start_date, enrol_end_date, hr_name):
        self.class_ID = class_ID
        self.course_ID = course_ID
        self.class_name = class_name
        self.size = size
        self.starting_date = starting_date
        self.ending_date = ending_date
        self.class_status = class_status
        self.trainer_ID = trainer_ID
        self.hr_ID = hr_ID
        self.enrol_start_date = enrol_start_date
        self.enrol_end_date = enrol_end_date
        self.hr_name = hr_name


    def to_json(self):
        return {
            "class_ID" : self.class_ID,
            "course_ID" : self.course_ID,
            "class_name" : self.class_name,
            "size" : self.size,
            "starting_date" : self.starting_date,
            "ending_date" : self.ending_date,
            "enrol_start_date" : self.enrol_start_date,
            "enrol_end_date" : self.enrol_end_date,
            "class_status" : self.class_status,
            "trainer_ID" : self.trainer_ID,
            "hr_ID" : self.hr_ID,
            'hr_name' : self.hr_name,
            "course_info" : self.course_info.to_json(),
            "learner_info" : self.learner_info.to_json(),
            "trainer_info" : self.trainer_info.to_json(),
            "remaining_slots" : self.get_remaining_slots(),
        }


class Withdrawal(db.Model):
    __tablename__ = "class_withdrawal"

    learner_ID = db.Column(db.Integer, primary_key = True)
    class_ID = db.Column(db.Integer, primary_key = True)
    reason = db.Column(db.String(300))
    status = db.Column(db.String(45))
    hr_reason = db.Column(db.String(300))
    hr_ID = db.Column(db.Integer)
    date_of_action = db.Column(db.String(45))
    action = db.Column(db.String(1))
   
    def __init__(self, learner_ID = None, class_ID = None, 
    reason = None,
     status = None, 
     hr_reason = None,
     hr_ID = None,
     date_of_action = None,
     action = None
     ):
        self.learner_ID = learner_ID
        self.class_ID = class_ID
        self.reason = reason
        self.status = status
        self.hr_reason = hr_reason
        self.hr_ID = hr_ID
        self.date_of_action = date_of_action
        self.action = action
        self.learner_info = LearnerInfo()
        self.class_info = Class()


    def set_learner_info(self):
        self.learner_info = LearnerInfo()
    
    def set_class_info(self, course_class :Class):
        self.class_info = course_class
    
    def to_json(self):
        return {
            "learner_ID" : self.learner_ID,
            "class_ID" : self.class_ID,
            "reason" : self.reason,
            "class_status" : self.status,
            "hr_reason" : self.hr_reason,
            "hr_ID" : self.hr_ID,
            "date_of_action" : self.date_of_action,
            'action' : self.action,
            "learner_info" : self.learner_info.to_json(),
            "class_info" : None if not hasattr(self, 'class_info') else self.class_info.to_json()
           
        }

class Applicant (db.Model):
    
    __tablename__ = "class_applicant"

    learner_ID = db.Column(db.Integer, primary_key = True)
    class_ID = db.Column(db.Integer, primary_key = True)
    status = db.Column(db.String(45))


    def __int__(self, learner_ID = None, class_ID = None, status = None):
        self.learner_ID = learner_ID
        self.class_ID = class_ID
        self.status = status

    def set_learner_info(self):
        self.learner_info = LearnerInfo()

    def set_class_info(self, course_class):
        self.class_info = course_class

    def to_json(self):
        return {
            "learner_ID" : self.learner_ID,
            "class_ID" : self.class_ID,
            "status" : self.status,
            "learner_info" : self.learner_info.to_json(),
            "class_info" :  self.class_info.to_json()
            
        }
    

class ClassUser (db.Model):
    class_ID: int
    learner_ID: int
    enrollment_type: str
 
    __tablename__ = "class_user"

    class_ID = db.Column(db.Integer, primary_key = True)
    learner_ID =  db.Column(db.Integer, primary_key = True)
    enrollment_type = db.Column(db.String(45))

async def class_details_async(classes):
    async with httpx.AsyncClient() as session:
        tasks = [
            format_dates(classes),
            trainer_name_async(classes, session),
            course_prequisite_and_name_async(classes,session),
            class_hr_name_async(classes, session),
        ]
        await asyncio.gather(*tasks, return_exceptions=True)
    
async def get_learner_info(learner,session):
    learner_ID = learner.learner_ID
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}")
    data = res.json()
    if data['code'] == 200:
        name = data['data']['user']['name']
       
        learner.learner_info.set_learner_name(name)
      
async def get_application_learner_info_async(learner_applicants):
    async with httpx.AsyncClient() as session:
        tasks = [
            get_application_learner_info(applicant, session) for applicant in learner_applicants
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

async def get_application_learner_info(applicant : Applicant, session):
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{applicant.learner_ID}")
    data = res.json()
    if data['code'] == 200:
        name = data['data']['user']['name']
        applicant.set_learner_info()
        applicant.learner_info.set_learner_name(name)



async def learner_information_async(learners):
    async with httpx.AsyncClient() as session:
        tasks = [
            get_learner_info(learner, session) for learner in learners
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

async def withdrawal_information_async(withdrawals):
    withdrawals:list[Withdrawal]
    async with httpx.AsyncClient() as session:
        tasks = [
            get_learner_info(withdrawal, session) for withdrawal in withdrawals
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

def check_class_by_course_ID(id):
    return Class.query.filter_by(course_ID = id).first()

def check_class_by_trainer_ID(id):
    return Class.query.filter_by(trainer_ID = id).first()

def check_class_by_class_ID(id):

    return Class.query.filter_by(class_ID = id).first()

def check_class_name_unique(class_name):
    return Class.query.filter_by(class_name = class_name).first()

def check_application_by_classID_and_learnerID(learner_ID, class_ID):
    return Applicant.query.filter_by(class_ID = class_ID, learner_ID =learner_ID).first()

def check_application_by_classID(class_ID):
    return Applicant.query.filter_by(class_ID = class_ID).first()

def check_withdrawal_by_learnerID_and_classID(learner_ID, class_ID):
    return Withdrawal.query.filter_by(class_ID = class_ID, learner_ID = learner_ID).first()

def check_user_by_class_ID(id):
    return ClassUser.query.filter_by(class_ID = id).first()

def exceed_class_size(id):
    c = Class.query.filter_by(class_ID = id).first()
    cUsers = ClassUser.query.filter_by(class_ID = id).all()
    if len(cUsers) < c.size:
        return False
    return True

def check_user_by_learner_ID(id):
    return ClassUser .query.filter_by(learner_ID = id).first()

def check_application(learner_ID, class_ID):
    return Applicant.query.filter_by(learner_ID = learner_ID, class_ID = class_ID).first()

def create_course_subclass(course_class:Class):
    course_class.set_course_info()
    course_class.set_trainer_info()
    course_class.set_learner_info()
    update_enrolled_users(course_class)

def update_enrolled_users(course_class:Class):
    enrolled_users = len(ClassUser.query.filter_by(class_ID = course_class.class_ID).all())
    course_class.set_enrolled_users(enrolled_users)

async def get_class_hr_name(course_class:Class, session):
    hr_ID = course_class.hr_ID
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{hr_ID}")
    data = res.json()
    if data['code'] == 200:
        name = data['data']['user']['name']
        course_class.set_class_hr_name(name)


async def class_hr_name_async(arr, session):
    tasks = [
        get_class_hr_name(course_class, session) for course_class in arr
    ]
    await asyncio.gather(*tasks, return_exceptions=True)



async def get_course_hr_name(course_class: Class, session):
    hr_ID = course_class.course_info.get_hr_ID()
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{hr_ID}")
    data = res.json()
    if data['code'] == 200:
        name = data['data']['user']['name']
        course_class.course_info.set_hr_name(name)


async def course_hr_name_async(arr, session):
    tasks = [
        get_class_hr_name(course_class, session) for course_class in arr
    ]
    await asyncio.gather(*tasks, return_exceptions=True)



async def get_trainer_name(course_class :Class, session):
    trainer_ID = course_class.trainer_ID
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{trainer_ID}")
    data = res.json()
    if data['code'] == 200:
        name = data['data']['user']['name']
        course_class.trainer_info.set_trainer_name(name)

async def trainer_name_async(classes,session):
    tasks = [
    get_trainer_name(course_class, session) for course_class in classes
    ]
    await asyncio.gather(*tasks, return_exceptions=True)

            
async def get_course_prequisite_and_name(course_class: Class, session):
    course_ID = course_class.course_ID
    
    course_res = await session.get(f"https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID={course_ID}")
    course_data = course_res.json()
    if course_data['code'] == 200:
        name = course_data['data']['course']['name']
        prerequisites = course_data['data']['course']['prerequisites']
        hr_ID = course_data['data']['course']['hr_ID']
        hr_res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{hr_ID}")
        course_class.course_info.set_course_name(name)
        course_class.course_info.set_prequisites(prerequisites)
        course_class.course_info.set_hr_ID(hr_ID)
        hr_data = hr_res.json()
        if hr_data['code'] == 200:
            hr_name = hr_data['data']['user']['name']
            course_class.course_info.set_hr_name(hr_name)

async def course_prequisite_and_name_async(classes, session):

    tasks = [
    get_course_prequisite_and_name(course_class,session) for course_class in classes
    ]
    await asyncio.gather(*tasks, return_exceptions=True)


def get_course_name(arr):
    for c in arr:
        course_ID = str(c.course_ID)
        res = requests.get(f"https://course-container-7ii64z76zq-uc.a.run.app/course?course_ID={course_ID}")
        data = res.json()
        
        if data['code'] == 200:
            name = data['data']['course']['name']
            c.course_name = name



def get_users_by_user_ID(class_users):
    o = []
    for user in class_users:
        learner_ID = user.learner_ID
        res = requests.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}")
        data = res.json()
        data['data']['user']['password'] = ""
        if data['code'] == 200:
            o.append(data['data']['user'])
    return o

async def user_info_async(class_users):
    class_users:list[ClassUser]
    async with httpx.AsyncClient() as session:
        tasks = [
            get_user_info(user,session) for user in class_users
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)

async def get_user_info(user:ClassUser, session):
    learner_ID  = user.learner_ID
    res = await session.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}")
    data = res.json()
    if data['code'] == 200:
        data['data']['user']['password'] = ""
        return data['data']['user']


def class_remaining_capacity(class_ID):
    course_class = check_class_by_class_ID(class_ID)
    max_class_size = course_class.size
    class_users = len(ClassUser.query.filter_by(class_ID = class_ID).all())
    return str(int(max_class_size) - int(class_users))

async def class_remaining_capacity_async(classes):
    async with httpx.AsyncClient() as session:
        tasks = [
        get_remaining_capacity(course_class) for course_class in classes
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

async def get_remaining_capacity(class_ID):
    course_class = check_class_by_class_ID(class_ID)
    max_class_size = course_class.size
    class_users = len(ClassUser.query.filter_by(class_ID = class_ID).all())
    return str(int(max_class_size) - int(class_users))
    

def check_class_by_learner_ID(learner_ID):
    return ClassUser.query.filter_by(learner_ID = learner_ID).all()


def check_withdrawal_by_learner_ID(learner_ID):
    return Withdrawal.query.filter_by(learner_ID = learner_ID).first()

async def format_dates(arr):
    for c in arr:
        c.enrol_start_date = str(c.enrol_start_date)[0: 10]
        c.enrol_end_date = str(c.enrol_end_date)[0: 10]


def close_session(db:SQLAlchemy):
    db.session.close()

@app.route("/class", methods = ["POST"])
def create_class():
    if request.method == "POST":
        # create class
        data = request.json
        course_id = int(data['course_ID'])
        class_name = data['class_name']
        size = int(data['size'])
        starting_date = data['starting_date']
        ending_date = data['ending_date']
        enrol_start_date = data['enrol_start_date']
        enrol_end_date = data['enrol_end_date']
        trainer_id = int(data['trainer_ID'])
        hr_id = int(data['hr_ID'])
        
        status = "NEW"

        if check_class_name_unique(class_name) is None:
            i = Class(
                course_ID = course_id, 
                class_name = class_name,
                 size = size, 
                 starting_date = starting_date,
                  ending_date = ending_date, 
                  class_status = status,
                   trainer_ID = trainer_id, 
                   hr_ID = hr_id,
                   enrol_start_date= enrol_start_date,
                   enrol_end_date= enrol_end_date,
                   )
            
            db.session.add(i)
            db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "message" : "Class succesfully created"
                },
                "input" : request.json
            }),200
        else:
            return bad_request("Class name already taken")
        
@app.route('/class', methods=['GET'])
async def course_class():
    if request.method == "GET":
        # get all classes by course ID
        if request.args.get('course_ID'):
            course_ID = request.args.get('course_ID')
            if check_class_by_course_ID(course_ID) is not None:
                classes: list[Class]
                classes = Class.query.filter(Class.course_ID == course_ID).all()

                for course_class in classes:
                    create_course_subclass(course_class)
                
                await class_details_async(classes)

                close_session(db)
             
                return jsonify({"code" : 200,"data" : {
                    'classes' : [courseClass.to_json() for courseClass in classes]
                }}),200
            else:
                return bad_request("Course ID does not exist")

        # get all class by trainer ID
        elif request.args.get('trainer_ID'):
            trainer_ID = request.args.get('trainer_ID')
            if check_class_by_trainer_ID(trainer_ID) is not None:
                classes = Class.query.filter_by(trainer_ID = trainer_ID).all()

                for course_class in classes:
                    create_course_subclass(course_class)

                await class_details_async(classes)
                
                close_session(db)

                return jsonify({
                    "code" : 200,
                    "data" : {
                        "classes" : [courseClass.to_json() for courseClass in classes],
                    },
                    "input" : {
                        "trainer_ID" : trainer_ID
                    }
                }),200
            else:
                return bad_request("Trainer ID does not exist")
        

        # get classes by class ID
        elif request.args.get('class_ID'):
            class_ID = request.args.get('class_ID')
            learner_ID = request.args.get("learner_ID")
            if check_class_by_class_ID(class_ID) is not None:
                course_class: Class
                course_class = Class.query.filter_by(class_ID = class_ID).first()
                

                create_course_subclass(course_class)
                await class_details_async([course_class])

                close_session(db)

                return jsonify({
                    'code' : 200,
                    "data" : {
                        "class" : course_class.to_json(),
                        "is_instructor" : learner_ID == str(course_class.trainer_ID),
                    },

                    "inputs" : {
                        "class_ID" : class_ID,
                        "learner_ID" : learner_ID
                    }
                }),200
            else:
                return bad_request("Class ID does not exist")
        # get all class
        else:
            classes = Class.query.all()
            course_class : Class
            for course_class in classes:
                create_course_subclass(course_class)
            await class_details_async(classes)
            close_session(db)
           
            return jsonify({
                "code" : 200,
                "data": {
                    "classes" : [course_class.to_json() for course_class in classes]
                }
            }),200

@app.route("/class/open", methods = ["GET"])
async def open_course():
    # all class where class status is OPEN
    if request.method == "GET":
        classes = Class.query.filter_by(class_status = "OPEN").all()
        for course_class in classes:
            create_course_subclass(course_class)
        await class_details_async(classes)
        close_session(db)
      
        return jsonify({
            "code" : 200,
            "data": {
                "classes" : [classs.to_json() for classs in classes]
            }
        }),200


@app.route('/class/assignment_status', methods=['GET'])
def check_assignment_status():
    # check if learner is already assigned to a class for a specific course
    if request.method == "GET":
      
        course_ID = request.args.get("course_ID")
        learner_ID = request.args.get("learner_ID")
        is_assigned = False
        # GET classes by course ID
        classes = Class.query.filter(Class.course_ID == course_ID, or_(Class.class_status != "NEW", Class.class_status != "CLOSED")).all()
        for course_class in classes:
            # GET class users by class ID
            enrolled_learners = ClassUser.query.filter_by(class_ID = course_class.class_ID).all()
            class_user_IDs = [int(learner.learner_ID) for learner in enrolled_learners]
    
            if int(learner_ID) in class_user_IDs:
                is_assigned = True
        close_session(db)
        return jsonify({
                    "code" : 200,
                    "data" : {
                        "assigned" : is_assigned
                    }
                    
                }),200
                
  
@app.route('/class/<class_ID>', methods= ['PUT', 'DELETE'])
def update_class(class_ID):
    # update class
    if request.method == "PUT":
        data = request.json
        course_id = int(data['course_ID'])
        class_name = data['class_name']
        size = int(data['size'])
        starting_date = data['starting_date']
        ending_date = data['ending_date']
        enrol_start_date = data['enrol_start_date']
        enrol_end_date = data['enrol_end_date']
        trainer_id = data['trainer_ID']
        hr_id = data['hr_ID']
        if trainer_id == "Withdraw Instructor":
            trainer_id = -1
        else:
            trainer_id = int(trainer_id)

        # check if class ID exist
        if check_class_by_class_ID(class_ID) is not None:
            db.session.query(Class).filter_by(class_ID = class_ID).update({
                "course_ID" : course_id,
                "class_name" : class_name,
                "size" : size,
                "starting_date" : starting_date,
                "ending_date" : ending_date,
                "enrol_start_date" : enrol_start_date,
                "enrol_end_date" : enrol_end_date,
                "trainer_ID" : trainer_id,
                "hr_ID" : hr_id 
            })
            db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "messgae" : "Class successfully updated"
                },
                "input" : request.json
            })
        else:
            close_session(db)
            return bad_request("Class ID does not exist")
    
    # delete class
    elif request.method == "DELETE":
        # check if class ID exsit
        if check_class_by_class_ID(class_ID):
            db.session.query(Class).filter_by(class_ID = class_ID).delete()
            db.session.commit()

            if check_application_by_classID(class_ID):
                db.session.query(Applicant).filter_by(class_ID = class_ID).delete()
                db.session.commit()
            
            if check_user_by_class_ID(class_ID):
                db.session.query(ClassUser).filter_by(class_ID = class_ID).delete()
                db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "message" : "Class successfully deleted"
                },
                "input" : {
                    "class_ID" : class_ID
                }
            }),200
        
        else:
            close_session(db)
            return bad_request("Class ID does not exist")



@app.route('/class/class_user/<class_ID>', methods = ["GET"])
async def class_user_by_class_ID(class_ID):
    # get enrolled learners by class ID
    if request.method == "GET":
        if check_class_by_class_ID(class_ID):
            users = []
            class_users = ClassUser.query.filter_by(class_ID = class_ID).all()
          
            users = await user_info_async(class_users)
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "users" : users
                }
            }),200
        
        else:
            close_session(db)
            return bad_request("Class ID does not exist")

@app.route('/class/<class_ID>/status', methods = ['GET', 'PUT'])
def check_class_status(class_ID):
    # check if class status is eligible to be updated from NEW to OPEN
    if request.method == "GET":
        if check_class_by_class_ID(class_ID) is not None:
            sections_have_content = True
            sections_have_quiz = True
            have_final_quiz = True
            have_min_section = False
            sections = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID={class_ID}").json()['data']['sections']
            if len(sections) > 0:
                have_min_section = True
                for section in sections:
                    if section['has_content'] == False:
                        sections_have_content = False
                    if section['has_quiz'] == False:
                        sections_have_quiz = False
            else:
                sections_have_content = False
                sections_have_quiz = False
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "have_min_section" : have_min_section,
                    "sections_have_content" : sections_have_content,
                    "sections_have_quiz" : sections_have_quiz,
                    "sections_have_final_quiz" : have_final_quiz
                }
            }),200
        close_session(db)
        return bad_request("Class ID does not exist")
    
    # update class status
    if request.method == "PUT":
        data = request.json
        status = data['status']

        if check_class_by_class_ID(class_ID) is not None:
            course_class = check_class_by_class_ID(class_ID)
            if course_class.class_status == "NEW":
                db.session.query(Class).filter_by(class_ID = class_ID).update({
                    "class_status" : status
                })
                db.session.commit()
                close_session(db)
                return jsonify({
                    "code" : 200,
                    "data" : {
                        "message" : "Class status successfully updated"
                    }
                }),200
            else:
                return bad_request("Class status it not NEW")
        
        close_session(db)
        return bad_request("Class ID does not exist")

@app.route("/class/class_withdrawal", methods = ["GET"])
async def class_withdrawal():
    # GET learner withdrawls by learner ID
    if request.args.get("learner_ID"):
        only_pending = request.args.get("only_pending")
        learner_ID = request.args.get("learner_ID")
        if check_withdrawal_by_learner_ID(learner_ID) is not None:

            learner_withdrawals: list[Withdrawal]
            if only_pending == "1":
                learner_withdrawals = Withdrawal.query.filter(Withdrawal.learner_ID == learner_ID, Withdrawal.status == "PENDING").all()

            else:
                learner_withdrawals = Withdrawal.query.filter(Withdrawal.learner_ID == learner_ID).all()

                
            course_class : Class
            for learner_withdrawal in learner_withdrawals:
                learner_withdrawal.set_learner_info()
                course_class = check_class_by_class_ID(learner_withdrawal.class_ID)
             
                if course_class is not None:
                    
                    create_course_subclass(course_class)
                    await class_details_async([course_class])
                    learner_withdrawal.set_class_info(course_class)
            
            await learner_information_async(learner_withdrawals)
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "withdrawals" : [learner_withdrawal.to_json() for learner_withdrawal in learner_withdrawals]
                }
            }),200
        close_session(db)
        return bad_request("Learner ID does not exist")

    # GET withdrawl applications by class ID
    if request.args.get("class_ID"):
        class_ID = request.args.get("class_ID")
        if check_class_by_class_ID(class_ID) is not None:
            withdrawls : list[Withdrawal]
            withdrawls = Withdrawal.query.filter_by(class_ID = class_ID).all()
            
            course_class: Class
            
            # GET class by class ID
            course_class = check_class_by_class_ID(class_ID)
            create_course_subclass(course_class)
            await class_details_async([course_class])
            for withdrawal in withdrawls:
                withdrawal.set_learner_info()

            await withdrawal_information_async(withdrawls)
            close_session(db)
           
            return jsonify({
                "code" : 200,
                "data" : {
                    "class_info" : course_class.to_json(),
                    "withdrawls" : [withdrawl.to_json() for withdrawl in withdrawls],

                }
            }),200
        close_session(db)
        return bad_request("Class ID does not exist")
    else:
        learner_withdrawals: list[Withdrawal]
        learner_withdrawals = Withdrawal.query.filter(Withdrawal.status == "PENDING").all()

        course_class:Class
        for learner_withdrawal in learner_withdrawals:
            learner_withdrawal.set_learner_info()
            course_class = check_class_by_class_ID(learner_withdrawal.class_ID)
            if course_class is not None:
                create_course_subclass(course_class)
                await class_details_async([course_class])
                learner_withdrawal.set_class_info(course_class)
        await learner_information_async(learner_withdrawals)
        close_session(db)

        return jsonify({
            "code" : 200,
            "data" : {
                "withdrawals" : [learner_withdrawal.to_json() for learner_withdrawal in learner_withdrawals]
            }
        })

@app.route("/class/class_application", methods = ["POST"])
def create_student_application():
      # create class application by student
    if request.method == "POST":
        data = request.json
        class_ID = data['class_ID']
        if check_class_by_class_ID(class_ID):
            # check if number of current size is already more than or equal to max size
            if not exceed_class_size(class_ID):
                
                learner_id = int(data['learner_ID'])
                if check_application(learner_id, class_ID) is None:
                    i = Applicant(class_ID = class_ID, learner_ID = learner_id, status = "PENDING")
                    db.session.add(i)
                    db.session.commit()
                    close_session(db)
                    return jsonify({
                        "code" : 200,
                        "data" :{
                            "message" : "Student application successfully created"
                        },
                        "input": {
                            "class_ID" : int(class_ID),
                            "learner_ID" : learner_id
                        }
                    }),200
                else : 
                    close_session(db)
                    return bad_request("Learner has already applied for application")
            else:
                close_session(db)
                return bad_request("Class capacity is full")

        return bad_request("Class ID does not exist")

@app.route('/class/class_application', methods = ["GET", "DELETE"])
async def student_application_by_class_ID():
    # delete class application
    if request.method == "DELETE":
        class_ID = request.args.get("class_ID")
        learner_ID = request.args.get("learner_ID")
        if check_application_by_classID_and_learnerID(learner_ID= learner_ID, class_ID=class_ID) is not None:
            db.session.query(Applicant).filter_by(learner_ID = learner_ID, class_ID = class_ID).delete()
            db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "message" : "Class application successfully deleted"
                },
                "input" : {
                    "class_ID" : class_ID,
                    "learner_ID" : learner_ID
                }
            }),200
        close_session(db)
        return bad_request("learner ID or class ID does not exist")


    # get all applicants by class ID
    if request.args.get("class_ID"):
        class_ID = request.args.get("class_ID")
        if check_class_by_class_ID(class_ID) is not None:
            applicants: list[Applicant]

            course_class: Class
            
            course_class = check_class_by_class_ID(class_ID)

            create_course_subclass(course_class)

            await class_details_async([course_class])

            #applicants = course_class.applicants
            applicants = Applicant.query.filter(Applicant.class_ID == class_ID).all()

            for application in applicants:
                application.set_learner_info()
                application.set_class_info(course_class)
               
                application.learner_info.set_enrollment_type(application.status)
            await learner_information_async(applicants)
            close_session(db)
            
            return jsonify({
                "code" : 200,
                "data" : {
                    "applicants" : [applicant.to_json() for applicant in applicants]
                }
            }),200
        else:
            close_session(db)
            return bad_request('Class ID does not exist') 

    # GET class applicantions by learner ID (application_status = "PENDING", class_status != NEW || != CLOSE)
    if request.args.get("learner_ID"):
        learner_ID = request.args.get("learner_ID")

        learner_applicants = Applicant.query.filter(Applicant.status == "PENDING", Applicant.learner_ID == learner_ID).all()
        
        application: Applicant
        for application in learner_applicants:
           
            course_class = Class.query.filter(or_(Class.class_status != "NEW", Class.class_status != "CLOSE",), Class.class_ID == int(application.class_ID)).first()
            if course_class is not None:
                
                application.set_learner_info()
                create_course_subclass(course_class)
                await class_details_async([course_class])
                application.set_class_info(course_class)

        close_session(db)
       
        return jsonify({
            "code" : 200,
            "data" : {
                "applications" : [application.to_json() for application in learner_applicants]
            }
        })
    else:
        learner_applicants = Applicant.query.filter(Applicant.status == "PENDING").all()

        application: Applicant

        await get_application_learner_info_async(learner_applicants)

        for application in learner_applicants:
            course_class = Class.query.filter(or_(Class.class_status != "NEW", Class.class_status != "CLOSE",), Class.class_ID == int(application.class_ID)).first()
            if course_class is not None:
                

                create_course_subclass(course_class)
                await class_details_async([course_class])
                application.set_class_info(course_class)
        close_session(db)

        return jsonify({
            "code" : 200,
            "data": {
                "applications" : [application.to_json() for application in learner_applicants]
            }
        })
            




    
@app.route('/class/<class_ID>/learner', methods = ['POST'])
def student_assignment_by_class_ID(class_ID):
    # create approved student record, HR approve student application
    if request.method == "POST":
        if check_class_by_class_ID(class_ID):
            # check if number of current size is already more than or equal to max size
            if not exceed_class_size(class_ID):
                data = request.json
                learner_id = int(data['learner_ID'])
                is_assigned = data['is_assigned']

                i = ClassUser(class_ID = class_ID, learner_ID = learner_id, enrollment_type = "ASSIGNED" if is_assigned else "SELF_ENROL")
                db.session.add(i)
                db.session.commit()
                close_session(db)
                return jsonify({
                    "code" : 200,
                    "data" :{
                        "message" : "Student assigned"
                    },
                    "input": {
                        "class_ID" : int(class_ID),
                        "learner_ID" : learner_id
                    }
                }),200
            else:
                close_session(db)
                return bad_request("Class capacity is full")
        close_session(db)
        return bad_request("Class ID does not exist")

@app.route("/class/update_application", methods = ["PUT"])
def update_application():
    # approve or reject application (update class application)
    if request.method == "PUT":
        # update the status and if it is 'APPROVED', call the create class assignment for student API
        data = request.json
        learner_ID = data['learner_ID']
        class_ID = data['class_ID']
        status = data['status']
      
        if check_application_by_classID_and_learnerID(learner_ID, class_ID) is not None:
            db.session.query(Applicant).filter_by(class_ID = class_ID, learner_ID = learner_ID).update({
                "status" : status
            })
            db.session.commit()
            close_session(db)

            return jsonify({
                "code" : 200,
                "data": {
                    "message" : "Applicantion successfully updated",
                    "status" : status
                },
                "inputs": {
                    "learner_ID": learner_ID,
                    "class_ID" : class_ID
                } 
            }),200
        close_session(db)
        return bad_request("update failed")


@app.route("/class/update_withdrawal/<hr_ID>", methods = ["PUT"])
def update_withdrawal(hr_ID):
    # approve or reject withdrawal application
    if request.method == "PUT":
        status = ""
        action = ""
        data = request.json
        learner_ID = data['learner_ID']
        class_ID = data['class_ID']
        status = data['status']
        hr_reason = data['hr_reason']
        if status != "":
            action = "1"
        if check_withdrawal_by_learnerID_and_classID(learner_ID, class_ID) is not None:
            course_class = Class.query.filter_by(class_ID = class_ID).first()
            if course_class.class_status == "IN_PROGRESS":
                action = "2"
            if status == "REJECTED":
                action = "3"

            now = datetime.now()
            current_date = str(now.strftime('%Y-%m-%d'))


            db.session.query(Withdrawal).filter_by(class_ID = class_ID, learner_ID = learner_ID).update({
                "status": status,
                "hr_reason" : hr_reason,
                "hr_ID" : hr_ID,
                "date_of_action" : current_date,
                "action" : action
            })
            db.session.commit()

            # if status == APPROVED, need to delete row from class_user table
            if status == "APPROVED":
                db.session.query(ClassUser).filter(ClassUser.class_ID == class_ID, ClassUser.learner_ID == learner_ID).delete()
                db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "message" : "Withdrawal application succesfully updated",
                    "status" : status
                },
                "inputs" : {
                    "learner_ID" : learner_ID,
                    "class_ID" : class_ID,
                    "status" : status,
                    "hr_reason" : hr_reason,
                    "hr_ID" : hr_ID
                }
            }),200
        close_session(db)
        return bad_request("Withdrawal application does not exist")

@app.route("/class/all/learner/<learner_ID>")
async def all_class_by_learner_ID(learner_ID):
    # GET all class by learner ID
    if request.method == "GET":
        if check_class_by_learner_ID(learner_ID) is not None:
            classes = []
            user_classes = ClassUser.query.filter_by(learner_ID = learner_ID).all()
         
            for user_class in user_classes:
                course_class = Class.query.filter_by(class_ID = user_class.class_ID).first()
                course_class : Class
                if course_class is not None:

                    create_course_subclass(course_class)
                    course_class.learner_info.set_enrollment_type(user_class.enrollment_type)
                    classes.append(course_class)

            await class_details_async(classes)    
            close_session(db)        

            return jsonify({
                "code" : 200,
                "data":{
                    "classes" : [course_class.to_json() for course_class in classes]
                }
            })
        close_session(db)
        return bad_request("Learner ID does not exist")

@app.route("/class/learner", methods = ['DELETE'])
def enrolled_learner():
     # delete enrolled learner by learner ID
    if request.method == "DELETE":
        class_ID = request.args.get("class_ID")
        learner_ID = request.args.get("learner_ID")
        if check_class_by_class_ID(class_ID) is not None:
            if check_user_by_learner_ID(learner_ID) is not None:
                db.session.query(ClassUser).filter_by(class_ID = class_ID, learner_ID = learner_ID).delete()
                db.session.commit()
                if check_application_by_classID_and_learnerID(class_ID= class_ID, learner_ID=learner_ID) is not None:
                    db.session.query(Applicant).filter_by(class_ID= class_ID, learner_ID = learner_ID).delete()
                    db.session.commit()
                close_session(db)
                return jsonify({
                    "code" : 200,
                    "data" :{
                        "message" : "Student assignment record successfully deleted"
                    },
                    "input": {
                        "class_ID" : int(class_ID),
                        "learner_ID" : int(learner_ID)
                    }
                }),200
            else:
                close_session(db)
                return bad_request("Learner ID does not exist")
        close_session(db)
        return bad_request("Class ID does not exist")

@app.route("/class/learner", methods = ['GET'])
async def enrolled_class_by_learner_ID():
    # classes by learner ID (class status != NEW || != CLOSED)
    if request.method == "GET":
        learner_ID = request.args.get("learner_ID")
        if check_class_by_learner_ID(learner_ID) is not None:
            classes = []
            enrolled_classes = ClassUser.query.filter_by(learner_ID = learner_ID).all()

            for enrol_class in enrolled_classes:
                course_class = Class.query.filter(Class.class_ID == enrol_class.class_ID, or_(Class.class_status != "NEW" , Class.class_status != "CLOSED")).first()
                course_class: Class
                if course_class is not None:
                    create_course_subclass(course_class)
                    course_class.learner_info.set_enrollment_type(enrol_class.enrollment_type)
                    classes.append(course_class)
            
            await class_details_async(classes)
            close_session(db)
            
            return jsonify({
                "code" : 200,
                "data" : {
                    "classes" : [course_class.to_json() for course_class in classes]
                }
            }),200
        close_session(db)
        return bad_request("Learner ID does not exist")


@app.route("/class/learner/<learner_ID>/withdrawals", methods = ["POST"])
def learner_withdrawals(learner_ID):
    # create class withdrawal
    if request.method == "POST":
        data = request.json
        class_ID = data['class_ID']
        reason = data['reason']
      
        if check_class_by_class_ID(class_ID) is not None:
            if check_withdrawal_by_learnerID_and_classID(learner_ID, class_ID) is None:
                i = Withdrawal(learner_ID= learner_ID, class_ID= class_ID, reason= reason, status="PENDING")
                db.session.add(i)
                db.session.commit()
                close_session(db)
                return jsonify({
                    "code" : 200,
                    "data" : {
                        "message" : "Withdrawal application created"
                    },
                    "input" : {
                        "class_ID" : class_ID,
                        "learner_ID" : learner_ID,
                        "reason" : reason,
                       
                    }
                }),200
            close_session(db)
            return bad_request("Withdrawal application already exist")
        close_session(db)
        return bad_request("class ID does not exist")

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")



