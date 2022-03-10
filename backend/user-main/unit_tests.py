import unittest
from app import User, Role, Learner_completed

# Main Author: Chen Wei Ping, wpchen.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestUser(unittest.TestCase):
    def test_user_json_method(self):
        user = User(
            user_ID = 1,
            email = "test_user@example.com",
            name = "John Tan",
            password = "123456",
            job_title = "Junior Engineer",
            department = "Engineering"
              )
              
        self.assertDictEqual(user.json(), {
            "user_ID": 1,
            "email": "test_user@example.com",
            "name": "John Tan",
            "password": "123456",
            "job_title": "Junior Engineer",
            "department": "Engineering",
            "roles": []
        })


class TestRole(unittest.TestCase):
    def test_role_json_method(self):
        role = Role(
            role_ID = 2,
            role = "learner"
              )
        self.assertDictEqual(role.json(), {
            "role_ID": 2,
            "role": "learner"
        })

    


class TestLearnerCompleted(unittest.TestCase):
    def test_learner_completed_json_method(self):
        learner_completed = Learner_completed(
            learner_ID = 1,
            course_ID = 1,
            class_ID = 1,
            status = "ATTENDED"
              )
        self.assertDictEqual(learner_completed.json(), {
            "learner_ID": 1,
            "course_ID": 1,
            "class_ID": 1,
            "status": "ATTENDED"
        })
    
if __name__ == "__main__":
    unittest.main()
