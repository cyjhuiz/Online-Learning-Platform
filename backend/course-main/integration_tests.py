import unittest

import flask_testing
import json

from app import app, db

# Main author ~ Loi Cheng Yi chengyi.loi.2019
# Pair programming partner ~ Chen Wei Ping wpchen.2019

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

class TestCreateNewClass(TestApp):
    def test_create_course(self):
        request_body = {
            "course_code" : "ABC123",
            "course_name" : "intro to sleeping",
            "duration" : "8",
            "description" : "short description",
            "prerequisites" : [111,222,333],
            "hr_ID" : "123",
            "badge" : "boulder badge"
        }

        response = self.client.post("/course",
        data = json.dumps(request_body),
        content_type ="application/json"
        )

        self.assertEqual(response.json['input'], {
            "course_code" : "ABC123",
            "course_name" : "intro to sleeping",
            "duration" : "8",
            "description" : "short description",
            "prerequisites" : [111,222,333],
            "hr_ID" : "123",
            "badge" : "boulder badge"
        })

        

if __name__ == "__main__":
    unittest.main()
