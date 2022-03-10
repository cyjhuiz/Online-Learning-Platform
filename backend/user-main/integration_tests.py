import unittest
import flask_testing
import json
from app import app, db, User, User_role, Role, Learner_completed

# Main Author: Chen Wei Ping, wpchen.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestApp(flask_testing.TestCase):
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite://"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    app.config['TESTING'] = True

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()


class TestCreateUser(TestApp):
    def test_create_user(self):
        
        role1 = Role(role_ID=1, role="learner")
       
        db.session.add(role1)
        db.session.commit()

        request_body = {
            "email": "john_tan@example.com",
            "name": "John Tan",
            "password": "123456",
            "job_title": "Junior Engineer",
            "department": "engineering"
        }

        response = self.client.post("/user",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json, {
            "code": 200,
            "data" : {
                "user_login_details": {
                'user_ID': 1,
                "email": "john_tan@example.com",
                "name": "John Tan",
                "job_title": "Junior Engineer",
                "department": "engineering",
                "roles": [ "learner" ]
                }
            }
        })

class TestCreateLearnerCompleted(TestApp):
    def test_create_learner_completed(self):

        learner_ID = 1
        request_body = {
            "course_ID": 1,
            "class_ID": 1,
            "status": "COMPLETED"
        }

        response = self.client.post(f"/user/{learner_ID}/learner_completed",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        
        self.assertEqual(response.json, {
            "code":200,
            "data": {
                "learner_completed" :{
                    "class_ID": 1,
                    "course_ID": 1,
                    "learner_ID": learner_ID,
                    "status": "COMPLETED"
                }
            }
        })




if __name__ == '__main__':
    unittest.main()