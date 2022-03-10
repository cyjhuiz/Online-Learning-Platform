import unittest
from freezegun import freeze_time
import flask_testing
import json
from app import app, db, Forum_thread, Post, Post_like, Reply, Reply_like

# Main Author: Chin Wei Liang, wlchin.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestApp(flask_testing.TestCase):
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite://"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    app.config['TESTING'] = True

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()
        self.thread1 = Forum_thread(thread_ID=1, class_ID=1, thread_title="Printer Repair 101", thread_date="2021-11-05 08:00:00", creator_ID=1, creator_name="Bob Tan")
        self.post1 = Post(post_ID=1, thread_ID=1, post_date="2021-11-05 08:00:00", post_content="Any tips on how to fix a printer?", creator_name="Daniel Tan", creator_ID=2)
        self.post_like1 = Post_like(post_ID=1, user_ID=1)
        self.reply1 = Reply(
            creator_ID=2, 
            creator_name= 'Sam Tan', 
            post_ID= 1, 
            reply_ID= 1, 
            reply_content= 'Turning it off and on has worked for me half the time. Perhaps, you can try that!', 
            reply_date= '2021-11-05 08:00:00'
            )

    def tearDown(self):
        db.session.remove()
        db.drop_all()

@freeze_time("2021-11-05")
class TestCreateForumThread(TestApp):
    def test_create_forum_thread(self):

        request_body = {
            "class_ID": 1,
            "thread_title": "Printer Repair 101",
            "creator_ID": 1,
            "creator_name": "Bob Tan"
        }

        response = self.client.post("/forum_thread",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json, {
            "code": 200,
            "data": {
                "forum_thread" : {
                "class_ID": 1,
                "creator_ID": 1,
                "creator_name": "Bob Tan",
                "thread_ID": 1,
                "thread_date": '2021-11-05 08:00:00',
                "thread_title": "Printer Repair 101",
                "num_thread_replies": 0,
            }
            }
        })

@freeze_time("2021-11-05")
class TestCreatePost(TestApp):
    def test_create_post(self):

        db.session.add(self.thread1)
        db.session.commit()

        request_body = {
            "post_content": "Any tips on how to fix a printer?",
            "creator_ID": 2,
            "creator_name": "Daniel Tan",
        }

        response = self.client.post(f"/forum_thread/{self.thread1.thread_ID}/post",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json, {
            'code': 200, 
            'data': {
                'post': {
                    'creator_ID': 2, 
                    'creator_name': 'Daniel Tan', 
                    'num_post_likes': 0, 
                    'num_post_replies': 0, 
                    'post_ID': 1, 'post_content': 
                    'Any tips on how to fix a printer?', 
                    'post_date': '2021-11-05 08:00:00', 
                    'post_likes': [], 
                    'replies': [], 
                    'thread_ID': 1
                    }
                }
            }
        )

class TestCreatePostLike(TestApp):
    def test_create_post_like(self):
        db.session.add(self.thread1)
        db.session.add(self.post1)
        db.session.commit()

        request_body = {
            "user_ID": 1
        }

        response = self.client.post(f"/forum_thread/{self.thread1.thread_ID}/post/{self.post1.post_ID}/post_like",
                                    data=json.dumps(request_body),
                                    content_type='application/json')

        self.assertEqual(response.json, {
            'code': 200, 
            'data': {
                'post_like': {
                    'post_ID': 1, 
                    'user_ID': 1
                    }
                }
            }
        )

@freeze_time("2021-11-05")
class TestCreateReply(TestApp):
    def test_create_section_content(self):
        db.session.add(self.thread1)
        db.session.add(self.post1)
        db.session.add(self.post_like1)
        db.session.commit()

        request_body = {
            "creator_ID": 2,
            "creator_name": "Sam Tan",
            "reply_content": "Turning it off and on has worked for me half the time. Perhaps, you can try that!"
        }

        response = self.client.post(f"/forum_thread/{self.thread1.thread_ID}/post/{self.post1.post_ID}/reply",
                                    data=json.dumps(request_body),
                                    content_type='application/json')
        self.assertEqual(response.json, {
            'code': 200, 
            'data': {
                'reply': {
                    'creator_ID': 2, 
                    'creator_name': 'Sam Tan', 
                    'num_reply_likes': 0, 
                    'post_ID': 1, 
                    'reply_ID': 1, 
                    'reply_content': 'Turning it off and on has worked for me half the time. Perhaps, you can try that!', 
                    'reply_date': '2021-11-05 08:00:00', 
                    'reply_likes': []
                    }
                }
            }
        )

class TestCreateReplyLike(TestApp):
    def test_create_section_content(self):
        db.session.add(self.thread1)
        db.session.add(self.post1)
        db.session.add(self.reply1)
        db.session.commit()

        request_body = {
            "user_ID": 1,
        }

        response = self.client.post(f"/forum_thread/{self.thread1.thread_ID}/post/{self.post1.post_ID}/reply/{self.reply1.reply_ID}/reply_like",
                                    data=json.dumps(request_body),
                                    content_type='application/json')
                                    
        self.assertEqual(response.json, {
            'code': 200, 
            'data': {
                'reply_like': {
                    'reply_ID': 1, 
                    'user_ID': 1
                    }
                }
            }
        )


if __name__ == '__main__':
    unittest.main()
