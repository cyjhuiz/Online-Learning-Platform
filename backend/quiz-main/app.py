from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

import requests
import os

# retrieve secrets stored in GCP secret manager
db_username =  os.environ.get("db_username")
db_password = os.environ.get("db_password")
db_endpoint = os.environ.get("db_endpoint")

db_name = "quiz"

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{db_username}:{db_password}@{db_endpoint}:3306/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 299}

db = SQLAlchemy(app)
CORS(app)

class Quiz(db.Model):
    __tablename__ = 'quiz'

    quiz_ID= db.Column(db.Integer, primary_key=True, autoincrement=True)
    section_ID = db.Column(db.Integer, nullable=False)
    class_ID = db.Column(db.Integer, nullable=False)
    trainer_ID = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    passing_rate = db.Column(db.Float, nullable=False)
    grading_type = db.Column(db.String, nullable=False)
    quiz_questions = db.relationship("Quiz_question", backref="quiz", lazy="select", cascade="all, delete-orphan")

    def __init__(self, quiz_ID, section_ID, class_ID, trainer_ID, duration, passing_rate, grading_type):
        self.quiz_ID = quiz_ID
        self.section_ID = section_ID
        self.class_ID = class_ID
        self.trainer_ID = trainer_ID
        self.duration = duration
        self.passing_rate = passing_rate
        self.grading_type = grading_type

    def json(self):
        columns = self.__mapper__.column_attrs.keys()
        result = {}
        for column in columns:
            result[column] = getattr(self, column)

        result["points"] = 0
        result["quiz_questions"] = []

        for quiz_question in self.quiz_questions:
            result["points"] += quiz_question.point
            result["quiz_questions"].append(quiz_question.json())

        return result
    




class Quiz_question(db.Model):
    __tablename__ = 'quiz_question'

    quiz_question_ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_ID = db.Column(db.Integer, db.ForeignKey("quiz.quiz_ID"))
    question = db.Column(db.String, nullable=False)
    answer = db.Column(db.Integer, nullable=False)
    option1 = db.Column(db.String, nullable=False)
    option2 = db.Column(db.String, nullable=False)
    option3 = db.Column(db.String, nullable=True)
    option4 = db.Column(db.String, nullable=True)
    option5 = db.Column(db.String, nullable=True)
    point = db.Column(db.Integer, nullable=False)

    def __init__(self, quiz_question_ID, quiz_ID, question, answer, point, option1, option2, option3=None, option4=None, option5=None):
        self.quiz_question_ID = quiz_question_ID
        self.quiz_ID = quiz_ID
        self.question = question
        self.answer = answer
        self.option1 = option1
        self.option2 = option2
        self.option3 = option3
        self.option4 = option4
        self.option5 = option5
        self.point = point

    def json(self):
        columns = self.__mapper__.column_attrs.keys()
        result = {}
        for column in columns:
            result[column] = getattr(self, column)
        return result


class Quiz_result(db.Model):
    __tablename__ = 'quiz_result'

    quiz_ID = db.Column(db.Integer, primary_key=True)
    class_ID = db.Column(db.Integer, nullable=False)
    section_ID = db.Column(db.String, nullable=False)
    learner_ID = db.Column(db.Integer, primary_key=True)
    quiz_score = db.Column(db.Integer, nullable=False)
    has_passed = db.Column(db.String, nullable=False)

    def __init__(self, quiz_ID, class_ID, section_ID, learner_ID, quiz_score, has_passed):
        self.quiz_ID = quiz_ID
        self.class_ID = class_ID
        self.section_ID = section_ID
        self.learner_ID = learner_ID
        self.quiz_score = quiz_score
        self.has_passed = has_passed

    def json(self):
        columns = self.__mapper__.column_attrs.keys()
        result = {}
        for column in columns:
            result[column] = getattr(self, column)
        return result


    


@app.route("/quiz")
def get_quiz():
    try:
        if request.args.get("class_ID") and request.args.get("section_ID"):
            class_ID = request.args.get("class_ID")
            section_ID = request.args.get("section_ID")

            quiz = Quiz.query.filter_by(class_ID=class_ID,section_ID=section_ID).first()
            if not(quiz):
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "section_ID": section_ID,
                            "class_ID": class_ID
                        },
                        "message": "Quiz not found."
                        
                    }
                ), 400

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz": quiz.json()
                        }
                    
                }
            ), 200

        else:
            quizzes = []
            quiz_list = Quiz.query.all()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quizzes": [ quiz.json() for quiz in quiz_list ]
                    }
                    
                }
            ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the quizzes. "
            }
        ), 400






@app.route("/quiz", methods=['POST'])
def create_quiz():
    data = request.get_json()

    section_ID = data["section_ID"]
    class_ID = data["class_ID"]
    trainer_ID = data["trainer_ID"]

    # passing_rate = data["passing_rate"]
    duration = data["duration"]
    grading_type = data["grading_type"]
    quiz_questions = data["quiz_questions"]

    passing_rate = 0.85
    if grading_type == "ungraded":
        passing_rate = 0.00

    if len(quiz_questions) == 0:
        return jsonify(
                {
                    "code": 400,
                    "message": "Quiz must have at least 1 question."
                }
            ), 400
    
    try:
        last_quiz_ID = Quiz.query.all()[-1].quiz_ID
        quiz = Quiz(quiz_ID=last_quiz_ID + 1, section_ID=section_ID, class_ID=class_ID, trainer_ID=trainer_ID, passing_rate=passing_rate, duration=duration, grading_type=grading_type)
        if (Quiz.query.filter_by(class_ID=class_ID, section_ID=section_ID).first()):
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "section_ID": section_ID
                    },
                    "message": "Quiz already exists in current section."
                }
            ), 400


        db.session.add(quiz)
        for quiz_question in quiz_questions:
            quiz_question = Quiz_question(quiz_question_ID=None, quiz_ID=quiz.quiz_ID, **quiz_question)
            db.session.add(quiz_question)
        db.session.commit()
        
        if section_ID != -1:
            res = requests.put(
                f"https://section-container-7ii64z76zq-uc.a.run.app/section/{section_ID}",
                json={"has_quiz": True},
                headers={"Content-Type": "application/json"}
                )
            if res.status_code  != 200:
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "section_ID": section_ID
                        },
                        "message": "An error occurred while updating the associated section's quiz status."
                    }
                ), 400

        return jsonify(
            {
                "code": 200,
                "data": quiz.json()
            }
        ), 200
        
        
    except:

        return jsonify(
            {
                "code": 400,
                "data": {
                    "section_ID": section_ID
                },
                "message": "An error occurred while creating the quiz."
            }
        ), 400




@app.route("/quiz/submit", methods=['POST'])
def submit_quiz():
    data = request.get_json()

    quiz_ID = data["quiz_ID"]
    class_ID = data["class_ID"]
    section_ID = data["section_ID"]
    learner_ID = data["learner_ID"]
    quiz_score = data["quiz_score"]
    has_passed = data["has_passed"]

    try:
        quiz_result = None
        existing_quiz_result = Quiz_result.query.filter_by(learner_ID=learner_ID, section_ID=section_ID, class_ID=class_ID).first()
        if (existing_quiz_result):
            existing_quiz_result.quiz_score = quiz_score
            existing_quiz_result.has_passed = has_passed
            db.session.commit()
            quiz_result = existing_quiz_result


        elif not(existing_quiz_result):
            quiz_result = Quiz_result(quiz_ID=quiz_ID, class_ID=class_ID, section_ID=section_ID, learner_ID=learner_ID, quiz_score=quiz_score, has_passed=has_passed)
            
            db.session.add(quiz_result)
            db.session.commit()

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while submitting the quiz."
            }
        ), 400

    try:
        # if final quiz, update learner_completed status based on result
        is_final_quiz = section_ID == -1
        if is_final_quiz:
            course_ID = None
            res = requests.get(f"https://class-container-7ii64z76zq-uc.a.run.app/class?class_ID={class_ID}")
            data = res.json()["data"]
            course_ID = data["class"]["course_ID"]
            status = "COMPLETED" if has_passed else "ATTENDED"

            if res.status_code  != 200:
                return jsonify(
                    {
                        "code": 400,
                        "message": "An error occurred while getting the associated quiz course_ID."
                    }
                ), 400


            if existing_quiz_result:
                res = requests.get(
                    f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}/learner_completed?course_ID={course_ID}",

                )
                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": "An error occurred while getting the existing learner completion record."
                        }
                    ), 400
                data = res.json()["data"]

                learner_completed = data["learner_completed"]
                if learner_completed["status"] != "COMPLETED":
                    res = requests.put(
                        f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}/learner_completed?course_ID={course_ID}",
                        json={"status": status},
                        headers={"Content-Type": "application/json"}
                    )
                
                    if res.status_code  != 200:
                        return jsonify(
                            {
                                "code": 400,
                                "message": "An error occurred while updating the existing learner completion record."
                            }
                        ), 400


            elif not(existing_quiz_result):
                requests.post(
                    f"https://user-container-7ii64z76zq-uc.a.run.app/user/{learner_ID}/learner_completed",
                    json={"course_ID": course_ID, "class_ID": class_ID, "status": status},
                    headers={"Content-Type": "application/json"}
                    )

                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": "An error occurred while creating a new learner completion record."
                        }
                    ), 400


        return jsonify(
            {
                "code": 200,
                "data": {
                    "quiz_result": quiz_result.json()
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while submitting the quiz."
            }
        ), 400



        



@app.route("/quiz/<string:quiz_ID>", methods=['PUT'])
def update_quiz(quiz_ID):
    try:
        quiz = Quiz.query.filter_by(quiz_ID=quiz_ID).first()
        if quiz:
            data = request.get_json()
                
            if "duration" in data.keys():
                quiz.duration = data["duration"]

            if "passing_rate" in data.keys():
                quiz.passing_rate = data["passing_rate"]

            if "grading_type" in data.keys():
                quiz.grading_type = data["grading_type"]


            db.session.commit()
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz": quiz.json()
                    }
                }
            ), 200
        
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "quiz_ID not found."
            }
        ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while updating the quiz."
            }
        ), 400


@app.route("/quiz/<string:quiz_ID>", methods=['DELETE'])
def delete_quiz(quiz_ID):

    try:
        quiz = Quiz.query.filter_by(quiz_ID=quiz_ID).first()
        section_ID = quiz.section_ID
        if quiz:
            db.session.delete(quiz)
            db.session.commit()
            
            if section_ID != -1:
                res = requests.put(
                    f"https://section-container-7ii64z76zq-uc.a.run.app/section/{section_ID}",
                    json={"has_quiz": False},
                    headers={"Content-Type": "application/json"}
                    )
                if res.status_code != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "data": {
                                "quiz_ID": quiz_ID
                            },
                            "message": "An error occurred while updating the associated section's quiz status."
                        }
                    ), 400


            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz": quiz_ID
                    }
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "quiz_ID": quiz_ID
                    },
                    "message": "quiz_ID not found."
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while deleting the quiz."
            }
        ), 400



@app.route("/quiz/quiz_question")
def get_all_quiz_questions():

    try:
        quiz_question_list = []
        unique_question_list = []
        if request.args.get("course_ID"):
            course_ID = request.args.get("course_ID")
            res = requests.get(f"https://class-container-7ii64z76zq-uc.a.run.app/class?course_ID={course_ID}")
            if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": f"An error occurred while getting the list of classes for course #{course_ID}."
                        }
                    ), 400

            data = res.json()["data"]
            classes = data["classes"]
            class_ID_list = [ current_class["class_ID"] for current_class in classes ]

            quiz_list = Quiz.query.filter(Quiz.class_ID.in_(class_ID_list)).all()
            if not(quiz_list):
                return jsonify(
                    {
                        "code": 400,
                        "data": {
                            "course_ID": course_ID,
                        },
                        "message": "No quizzes found"
                        
                    }
                ), 400

            for quiz in quiz_list:
                
                for quiz_question in quiz.quiz_questions:
                    if quiz_question.question not in unique_question_list:
                        unique_question_list.append(quiz_question.question)
                        quiz_question_list.append(quiz_question)

        else:
            quiz_question_list = Quiz_question.query.all()

        return jsonify(
            {
                "code": 200,
                "data": {
                        "quiz_questions": [ quiz_question.json() for quiz_question in quiz_question_list ]
                    }
            
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "course_ID": course_ID
                },
                "message": "An error occurred while fetching the quiz questions."
            }
        ), 400



@app.route("/quiz/<string:quiz_ID>/quiz_question")
def get_quiz_questions_by_quiz_ID(quiz_ID):
    
    try:
        quiz_question_list = Quiz_question.query.filter_by(quiz_ID=quiz_ID)
        if quiz_question_list:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz_questions": [quiz_question.json() for quiz_question in quiz_question_list]
                    }
                }
            ), 200
        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "quiz_ID": quiz_ID,
                    },
                    "message": "Quiz does not exist"
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while fetching the quiz questions."
            }
        ), 400


@app.route("/quiz/<string:quiz_ID>/quiz_question/<string:quiz_question_ID>")
def get_quiz_questions_by_quiz_ID_and_quiz_question_ID(quiz_ID, quiz_question_ID):
    
    try:
        quiz_question = Quiz_question.query.filter_by(quiz_ID=quiz_ID, quiz_question_ID=quiz_question_ID).first()

        if quiz_question:
            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz_question": quiz_question.json()
                    }
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "quiz_ID": quiz_ID,
                        "quiz_question_ID": quiz_question_ID,
                    },
                    "message": "Quiz question does not exist"
                }
            ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while fetching the quiz questions."
            }
        ), 400



@app.route("/quiz/<string:quiz_ID>/quiz_question", methods=['POST'])
def create_quiz_question(quiz_ID):
    data = request.get_json()

    try:
        quiz_question = Quiz_question(quiz_question_ID=None, quiz_ID=quiz_ID, **data)

        db.session.add(quiz_question)
        db.session.commit()
            
        return jsonify(
        {
            "code": 200,
            "data": {
                "quiz_question": quiz_question.json()
            }
        }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while creating the quiz question."
            }
        ), 400



@app.route("/quiz/<string:quiz_ID>/quiz_question/<string:quiz_question_ID>", methods=['PUT'])
def update_quiz_question(quiz_ID, quiz_question_ID):


    try:
        quiz_question = Quiz_question.query.filter_by(quiz_ID=quiz_ID, quiz_question_ID=quiz_question_ID).first()
        quiz = Quiz.query.filter_by(quiz_ID=quiz_ID).first()

        if quiz_question and quiz:
            data = request.get_json()

            if "question" in data.keys():
                quiz_question.question = data["question"]
            
            if "answer" in data.keys():
                quiz_question.answer = data["answer"]

            if "option1" in data.keys():
                quiz_question.option1 = data["option1"]

            if "option2" in data.keys():
                quiz_question.option2 = data["option2"]

            if "option3" in data.keys():
                quiz_question.option3 = data["option3"]

            if "option4" in data.keys():
                quiz_question.option4 = data["option4"]

            if "option5" in data.keys():
                quiz_question.option5 = data["option5"]

            if "point" in data.keys():
                quiz_question.point = data["point"]

            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz_question": quiz_question.json()
                    }
                }
            ), 200

        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_question_ID": quiz_question_ID
                },
                "message": "quiz_question_ID not found."
            }
        ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_question_ID": quiz_question_ID
                },
                "message": "An error occurred while updating the quiz question."
            }
        ), 400


@app.route("/quiz/<string:quiz_ID>/quiz_question/<string:quiz_question_ID>", methods=['DELETE'])
def delete_quiz_question(quiz_ID,quiz_question_ID):
    
    try:
        quiz_question = Quiz_question.query.filter_by(quiz_ID=quiz_ID, quiz_question_ID=quiz_question_ID).first()

        if quiz_question:
            db.session.delete(quiz_question)
            db.session.commit()

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz_question": quiz_question.json()
                    }
                }
            ), 200

        else:
            return jsonify(
                {
                    "code": 400,
                    "data": {
                        "quiz_question_ID": quiz_question_ID
                    },
                    "message": "quiz_question_ID not found."
                }
            ), 400
    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_question_ID": quiz_question_ID
                },
                "message": "An error occurred while deleting the quiz question."
            }
        ), 400

@app.route("/quiz/quiz_result")
def get_all_quiz_results():
    
    try:
        quiz_result_list = []
        if request.args.get("learner_ID") and request.args.get("class_ID"):
            learner_ID = request.args.get("learner_ID")
            class_ID = request.args.get("class_ID")

            quiz_result_list = Quiz_result.query.filter_by(learner_ID=learner_ID, class_ID=class_ID)

        elif request.args.get("class_ID"):
            class_ID = request.args.get("class_ID")
            quiz_result_list = Quiz_result.query.filter_by(class_ID=class_ID)
            
            
        else:
            quiz_result_list = Quiz_result.query.all()

        return jsonify(
            {
                "code": 200,
                "data": {
                    "quiz_results": [quiz_result.json() for quiz_result in quiz_result_list]
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while fetching the quiz results."
            }
        ), 400



@app.route("/quiz/<string:quiz_ID>/quiz_result")
def get_all_quiz_results_by_quiz_ID(quiz_ID):
    
    try:
        if request.args.get("learner_ID"):
            learner_ID = request.args.get("learner_ID")

            quiz_result_list =  Quiz_result.query.filter_by(learner_ID=learner_ID)

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "quiz_result": [quiz_result.json() for quiz_result in quiz_result_list]
                    }
                }
            ), 200
        

        quiz_result_list = Quiz_result.query.filter_by(quiz_ID=quiz_ID)

        return jsonify(
            {
                "code": 200,
                "data": {
                    "quiz_results": [quiz_result.json() for quiz_result in quiz_result_list]
                }
            }
        ), 200

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while fetching the quiz's quiz results."
            }
        ), 400



@app.route("/quiz/<string:quiz_ID>/quiz_result", methods=["PUT"])
def update_quiz_result_by_quiz_ID_and_learner_ID(quiz_ID):
    
    try:
        if request.args.get("learner_ID"):
            learner_ID = request.args.get("learner_ID")
            data = request.get_json()

            quiz_result =  Quiz_result.query.filter_by(quiz_ID=quiz_ID, learner_ID=learner_ID).first()

            
            if quiz_result:
                if "has_passed" in data.keys():
                    quiz_result.has_passed = data["has_passed"]
            
                if "quiz_score" in data.keys():
                    quiz_result.quiz_score = data["quiz_score"]

                db.session.commit()
                return jsonify(
                    {
                        "code": 200,
                        "data": {
                            "quiz_result": quiz_result.json()
                        }
                    }
                ), 200
        
            else:
                return jsonify(
                    {
                        "code": 400,
                        "message": "Quiz result not found"
                    }
                ), 400

    except:
        return jsonify(
            {
                "code": 400,
                "data": {
                    "quiz_ID": quiz_ID
                },
                "message": "An error occurred while updating the quiz result."
            }
        ), 400


@app.route("/quiz/quiz_eligibility")
def get_quiz_eligibility():
    # assumption, that only latest quiz score is stored

    try:
        quiz_result_list = []
        if request.args.get("learner_ID") and request.args.get("class_ID") and request.args.get("section_ID"):
            learner_ID = request.args.get("learner_ID")
            class_ID = request.args.get("class_ID")
            section_ID = request.args.get("section_ID")

            # if final quiz where section_ID = -1
            if section_ID == -1:
                res = requests.get(f"https://quiz-container-7ii64z76zq-uc.a.run.app/quiz/quiz_result?learner_ID={learner_ID}&class_ID={class_ID}")
                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": f"An error occurred while getting the associated quiz results."
                        }
                    ), 400
                data = res.json()["data"]
                quiz_result_list = data["quiz_results"]

                res = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section?class_ID={class_ID}")
                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": f"An error occurred while getting the list of sections from the class."
                        }
                    ), 400
                data = res.json()["data"]
                section_list = data["sections"]

                is_eligible = False
                if len(quiz_result_list) == len(section_list):
                    is_elgible = True

            # else if not final quiz, give eligibility based on section_content_view
            else:
                res = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section/{section_ID}/content/view?learner_ID={learner_ID}")
                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": f"An error occurred while getting the list of content views for the learner."
                        }
                    ), 400
                data = res.json()["data"]
                user_section_content_view_list = data["content_views"]
                print(user_section_content_view_list)

                res = requests.get(f"https://section-container-7ii64z76zq-uc.a.run.app/section/{section_ID}/content")
                if res.status_code  != 200:
                    return jsonify(
                        {
                            "code": 400,
                            "message": f"An error occurred while getting the list of section contents for the section."
                        }
                    ), 400
                data = res.json()["data"]
                section_content_list = data["section_contents"]

                is_eligible = False
                if len(user_section_content_view_list) == len(section_content_list):
                    is_elgible = True

            return jsonify(
                {
                    "code": 200,
                    "data": {
                        "is_eligible": is_eligible
                    }
                }
            )
        
        return jsonify(
            {
                "code": 400,
                "message": "Invalid inputs, please key in the correct url parameters"
            }
        )

    except:
        return jsonify(
            {
                "code": 400,
                "message": "An error occurred while determining learner quiz eligibility."
            }
        ), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")
