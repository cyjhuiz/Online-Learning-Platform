import unittest
import app

# Main author ~ Loi Cheng Yi chengyi.loi.2019
# Pair programming partner ~ Chen Wei Ping wpchen.2019

class ApiTest(unittest.TestCase):
    def test_course_to_json_method(self):
        course = app.Course(
            course_code = "TEST123",
            name = "test course",
            description = "course description",
            duration = 20,
            badge = "test badge",
            hr_ID = 10,
            status = "OPEN",
        )
        self.assertDictEqual(course.to_json() , {
          
            "course_ID" : None,
            "course_code" : "TEST123",
            "name" : "test course",
            "description" : "course description",
            "duration" : 20,
            "badge" : "test badge",
            "hr_ID" : 10,
            "status" : "OPEN",
            "hr_name" : "",
            "prerequisites" : [],
        })

if __name__ == "__main__":
    unittest.main()



