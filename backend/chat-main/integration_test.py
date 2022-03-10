import unittest
import flask_testing
import json
from app import  app, db


# Main Author: Clarence Yeo Jun Hui, clarenceyeo.2019
# Pair Programming Partner: Loi Cheng Yi, chengyi.loi.2019

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

class TestCreateNewMessage(TestApp):
    def test_create_message(self):
        request_body = {
            "sender_ID" : 20,
            "recipient_ID" : 100,
            "class_ID" : 10,
            "message" : "Hi there"
        }

        response = self.client.post("/chat/messages",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json['input'], {
            "sender_ID" : 20,
            "recipient_ID" : 100,
            "class_ID" : 10,
            "message" : "Hi there",
            "time_stamp" : response.json['input']['time_stamp'],
            "view_status" : 0
        })

if __name__ == "__main__":
    unittest.main()
