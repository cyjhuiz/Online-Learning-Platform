import unittest
import flask_testing
import json
from app import app, db, Quiz, Quiz_question


# Main Author: Clarence Yeo Jun Hui, clarenceyeo.2019
# Pair Programming Partner: Chin Wei Liang, wlchin.2019

# Integration test for CreateQuiz and SubmitQuiz are unable to be tested as 
# they have interactions with other APIs (i.e. Section API)
# and require actual valid data entities to be established
# Only Quiz_question will be tested as a result

class TestApp(flask_testing.TestCase):
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite://"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    app.config['TESTING'] = True

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()
        self.quiz1 = Quiz(
            quiz_ID=1, 
            section_ID=1, 
            class_ID=1, 
            trainer_ID=1, 
            passing_rate=0.85, 
            duration=15,
            grading_type="graded"
            )

    def tearDown(self):
        db.session.remove()
        db.drop_all()



class TestCreateQuestion(TestApp):
    def test_create_section_content(self):
        
        db.session.add(self.quiz1)
        db.session.commit()

        request_body = {
            "question": "Printer CAN100 is a color printer?",
            "point": 2,
            "answer": "True",
            "option1": "True",
            "option2": "False",
        }

        response = self.client.post(f"/quiz/{self.quiz1.quiz_ID}/quiz_question",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json, {
            'code': 200, 
            'data': {
                'quiz_question': {
                    'answer': 'True', 
                    'option1': 'True', 
                    'option2': 'False', 
                    'option3': None, 
                    'option4': None, 
                    'option5': None, 
                    'point': 2, 
                    'question': 'Printer CAN100 is a color printer?', 
                    'quiz_ID': 1, 
                    'quiz_question_ID': 1
                }
            }
        }
        )

        
if __name__ == '__main__':
    unittest.main()
