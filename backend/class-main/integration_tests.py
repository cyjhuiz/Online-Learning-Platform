import unittest

import flask_testing
import json

from app import app, db

# Main author ~ Loi Cheng Yi chengyi.loi.2019
# Pair programming partner ~ Benjamin Chew Pin Hsien phchew.2019@smu.edu.sg

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
    def test_create_class(self):
        request_body = {
            "course_ID" : "666",
            "class_name" : "G66",
            "size" : "6",
            "starting_date" : "2021-01-01 20:30:00",
            "ending_date" : "2021-12-30 20:30:00",
            "enrol_start_date" : "2021-11-05",
            "enrol_end_date" : "2021-11-25",
            "trainer_ID" : "11",
            "hr_ID" : "123"
            }
        
        response = self.client.post("/class",
        data = json.dumps(request_body),
        content_type ="application/json"
        )

      

        self.assertEqual(response.json['input'], {
             "course_ID" : "666",
            "class_name" : "G66",
            "size" : "6",
            "starting_date" : "2021-01-01 20:30:00",
            "ending_date" : "2021-12-30 20:30:00",
            "enrol_start_date" : "2021-11-05",
            "enrol_end_date" : "2021-11-25",
            "trainer_ID" : "11",
            "hr_ID" : "123"
        })

if __name__ == "__main__":
    unittest.main()
