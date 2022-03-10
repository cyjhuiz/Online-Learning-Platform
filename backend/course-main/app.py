# container for CRUD course
import os
from flask import Flask, jsonify,request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import requests

from functions import bad_request


app = Flask(__name__)
CORS(app)

# retreive secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password =  os.environ.get("db_password")
db_endpoint =  os.environ.get("db_endpoint")


db_name = "course"

SQLAlchemy_DATABASE_URI = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLAlchemy_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle' : 299}


class Course (db.Model):

    __tablename__ = "course"

    course_ID = db.Column(db.Integer, primary_key = True, autoincrement=True)
    course_code = db.Column(db.String(45))
    name = db.Column(db.String(20))
    description = db.Column(db.String(255))
    duration = db.Column(db.Integer)
    badge = db.Column(db.String(20))
    hr_ID = db.Column(db.Integer)
    status = db.Column(db.String(45))
    prerequisites = []
    hr_name = ""

    def __init__(self,course_code ,name, description, duration, badge, hr_ID, status):
        self.course_code = course_code
        self.name = name
        self.description = description
        self.duration = duration
        self.badge = badge
        self.hr_ID = hr_ID
        self.status = status
        self.prerequisites = []
        self.hr_name = ""

    def to_json(self):
        result = {
             "course_ID" : self.course_ID,
            "course_code" : self.course_code,
            "name" : self.name,
            "description" : self.description,
            "duration" : self.duration,
            "badge" : self.badge,
            "hr_ID" : self.hr_ID,
            "hr_name" : self.hr_name,
            "prerequisites" :  self.prerequisites,
            "status" : self.status,
        }
        return result

class CoursePrerequisite(db.Model):

    __tablename__ = "course_prerequisite"

    course_ID = db.Column(db.Integer ,primary_key = True,)
    course_prerequisite_ID=db.Column(db.Integer, primary_key = True)
    

def checkCourseByID(id):
    return Course.query.filter_by(course_ID = id).first()

def checkCourseByCourseCode(course_code):
    return Course.query.filter_by(course_code = course_code).first()

def checkCoursePreRequisiteByID(id):
    return CoursePrerequisite.query.filter_by(course_ID = id).first()

def checkCourseByCouseCode(course_code):
    return Course.query.filter_by(course_code = course_code).first()



def get_course_requisites(courses):
    for course in courses:
        course.prerequisites = []
        course_ID = str(course.course_ID)
        prerequisites = CoursePrerequisite.query.filter_by(course_ID = course_ID)
        for preReq in prerequisites:
            required_course = Course.query.filter_by(course_ID = preReq.course_prerequisite_ID, status = "OPEN").first()
            if required_course is not None:
                course.prerequisites.append({
                    "course_ID" : str(preReq.course_prerequisite_ID),
                    "course_code" : required_course.course_code,
                    "name" : required_course.name
                })

def get_HR_name(courses):
    for course in courses:
        hr_ID = course.hr_ID
        res = requests.get(f"https://user-container-7ii64z76zq-uc.a.run.app/user/{hr_ID}")
        data = res.json()
     
        if data['code'] == 200:
         
            name = data['data']['user']['name']
            course.hr_name = name

def delete_class_and_section(course_ID):
    # classes
    res = requests.get(f"https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID={course_ID}")
    data = res.json()
    print(data)

    if data['code'] == 200:
        classes = data['data']['classes']
        # delete classes by class ID
        if len(classes) > 0:
            for courseClass in classes:
                class_ID = courseClass['class_ID']
                requests.delete(f"https://class-container-7ii64z76zq-uc.a.run.app/class/{class_ID}")
                # GET sections by class ID
                res = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID={class_ID}")
                data = res.json()
                print(data)
                if data['code'] == 200:
                    sections  = data['data']['sections']
                    if len(sections) > 0:
                        for section in sections:
                            section_ID = section['section_ID']
                            requests.delete(f"https://section-container-7ii64z76zq-uc.a.run.app/section/{section_ID}")
                    return True
        return True
    return True

def close_session(db:SQLAlchemy):
    db.session.close()

    
@app.route('/course/prerequisite/<course_ID>', methods= ['GET'])
def coursePrerequisite(course_ID):
    # get course prerequisite(s)
    if request.method == "GET":
        if checkCourseByID(course_ID) is not None:
            course = checkCourseByID(course_ID)
            get_course_requisites([course])
            close_session(db)
            return jsonify({
                "code" : 200,
                "data" : {
                    "prerequisites" : course.prerequisites
                }
            }),200
        else:
            close_session(db)
            return bad_request("Course ID does not exist")


@app.route('/course', methods=['GET', 'POST'])
def course():
    # get course by ID
    if request.args.get('course_ID'):
        course_ID = request.args.get('course_ID')
        if checkCourseByID(course_ID) is not None:
            course = checkCourseByID(course_ID)
            
            get_HR_name([course])
            get_course_requisites([course])

            close_session(db)

            return jsonify({
                'code' : 200,
                'data' : {
                    "course" : course.to_json(),
                },
                'input' : {
                    'course_ID' : course_ID
                }
            }),200  
        else:
            close_session(db)
            return bad_request("Course ID does not exist")

    # get all courses
    elif request.method == "GET":
        include_retire = request.args.get("include_retire")
        
        if include_retire == "1":
            courses = Course.query.all()

        # with status = OPEN
        else:
            courses = Course.query.filter_by(status= "OPEN").all()
        get_course_requisites(courses)
        get_HR_name(courses)

        close_session(db)
        return jsonify({"code" : 200,"data" : {
            'courses' : [course.to_json() for course in courses]
        }}),200

    # create course
    if request.method == "POST":
        data = request.json
        course_code = data['course_code']
        course_name = data['course_name']
        description = data['description']
        duration = int(data['duration'])
        badge = data['badge']
        hr_ID = int(data['hr_ID'])
        prerequisites = data['prerequisites']
        
       

        if checkCourseByCouseCode(course_code) is not None:
            return bad_request("Course code is already registered")
        else:
            i = Course(course_code = course_code, name = course_name, description = description, duration = duration, badge = badge, hr_ID = hr_ID, status = "OPEN")
            db.session.add(i)
            db.session.commit()
            course_id = i.course_ID
            for prerequesite in prerequisites:
                

                i = CoursePrerequisite(course_ID = course_id, course_prerequisite_ID = prerequesite)
                db.session.add(i)
                db.session.commit()
            close_session(db)
            return jsonify({
                "code" : 200,
                'data' : {
                    "message" : "Course succesfully created",
                },
                'input' : request.json
            }),200
            

@app.route('/course/<course_ID>', methods=['PUT', 'DELETE'])
def courseByID(course_ID):
    # Delete course
    if request.method == "DELETE":
        # check if course ID exist
        if checkCourseByID(course_ID) is not None:
            db.session.query(Course).filter_by(course_ID = course_ID).delete()
            db.session.commit()

            if checkCoursePreRequisiteByID(course_ID) is not None:
                db.session.query(CoursePrerequisite).filter_by(course_ID = course_ID).delete()
                db.session.commit()
            
            # get all class and section by course ID
            if delete_class_and_section(course_ID):

                return jsonify({
                    'code' : 200,
                    "data" : {
                        "message" : "Course successfully deleted"
                    },
                    "input" : {
                        "course_ID" : course_ID
                    }
                }),200
            close_session(db)
            return jsonify({
                "code" : 500,
                "data" : {
                    "message" : "error deleting course"
                }
            }),500
        else:
            close_session(db)
            return bad_request("Course ID does not exist")
    
    # update course by ID
    if request.method == "PUT":
        data = request.json
        course_code = data['course_code']
        course_name = data['course_name']
        duration = data['duration']
        description = data['description'],
        prerequisites = data['prerequisite']
        badge = data['badge']
        hr_ID = data['hr_ID']
        status = data['status']
        #check if course ID exsit before updating

        description = "".join(description)
        
        if checkCourseByID(course_ID) is not None:
            db.session.query(Course).filter_by(course_ID = course_ID).update({
                "course_code" : course_code,
                "name" : course_name,
                "description" : description,
                "duration" : duration,
                "badge" : badge,
                "hr_ID" : hr_ID,
                "status" : status
            })
            db.session.commit()

            
            #update prerequesites
            db.session.query(CoursePrerequisite).filter_by(course_ID = course_ID).delete()
            db.session.commit()
            for prerequesite in prerequisites:
                i = CoursePrerequisite(course_ID = course_ID, course_prerequisite_ID = prerequesite)
                db.session.add(i)
                db.session.commit()

            close_session(db)
            return jsonify({
                'code' : 200,
                'data' : {
                    "message" : "Course successfully updated"
                },
                'input' : {
                    'course_ID' : course_ID,
                     "course_code" : course_code,
                    "course_name" : course_name,
                     "description" : description,
                    "duration" : duration,
                    "status" : status
                }
            }),200
        else:
            close_session(db)
            return bad_request("Course ID does not exist")

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")



