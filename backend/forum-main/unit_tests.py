import unittest
from app import Forum_thread, Post, Post_like, Reply, Reply_like

# Main Author: Chin Wei Liang, wlchin.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestForumThread(unittest.TestCase):
    def test_forum_thread_to_json_method(self):
        forum_thread = Forum_thread(
            thread_ID = 1,
            class_ID = 1,
            thread_title = "How to fix a printer?",
            thread_date = "2012-11-01 10:00:00",
            creator_ID = 1,
            creator_name = "John Doe"
              )
              
        self.assertDictEqual(forum_thread.json(), {
            "thread_ID": 1,
            "class_ID": 1,
            "thread_title": "How to fix a printer?",
            "thread_date": "2012-11-01 10:00:00",
            "creator_ID": 1,
            "creator_name": "John Doe",
            "num_thread_replies": 0
        })

class TestPost(unittest.TestCase):
    def test_post_to_json_method(self):
        post = Post(
            post_ID = 1,
            thread_ID = 1,
            post_date = "2012-11-01 10:00:00",
            creator_ID = 1,
            creator_name = "Steve Jobs",
            post_content = "Should I always turn off and on before I start to fix the printer?"
              )
              
        self.assertDictEqual(post.json(), {
            "post_ID": 1,
            "thread_ID": 1,
            "creator_ID": 1,
            "creator_name": "Steve Jobs",
            "post_date": "2012-11-01 10:00:00",
            "post_content": "Should I always turn off and on before I start to fix the printer?",
            "num_post_likes": 0,
            "num_post_replies": 0,
            "post_likes": [],
            "replies": []
        })

class TestReply(unittest.TestCase):
    def test_reply_to_json_method(self):
        reply = Reply(
            reply_ID = 1,
            post_ID = 1,
            creator_ID = 2,
            creator_name = "Bob Tan",
            reply_date = "2012-11-01 10:00:00",
            reply_content = "Yes. There's a 90% chance it works.",
              )
              
        self.assertDictEqual(reply.json(), {
            "reply_ID": 1,
            "post_ID": 1,
            "creator_ID": 2,
            "creator_name": "Bob Tan",
            "reply_date": "2012-11-01 10:00:00",
            "reply_content": "Yes. There's a 90% chance it works.",
            "num_reply_likes": 0,
            "reply_likes": []
        })

class TestPostLike(unittest.TestCase):
    def test_post_like_to_json_method(self):
        post_like = Post_like(
            user_ID = 2,
            post_ID = 1,
              )
              
        self.assertDictEqual(post_like.json(), {
            "user_ID": 2,
            "post_ID": 1,
        })


class TestReplyLike(unittest.TestCase):
    def test_reply_like_to_json_method(self):
        reply_like = Reply_like(
            user_ID = 2,
            reply_ID = 1,
              )
              
        self.assertDictEqual(reply_like.json(), {
            "user_ID": 2,
            "reply_ID": 1,
        })

        
if __name__ == "__main__":
    unittest.main()