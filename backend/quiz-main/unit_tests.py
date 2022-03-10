import unittest
from app import app, Quiz, Quiz_question, Quiz_result

# Main Author: Clarence Yeo Jun Hui, clarenceyeo.2019
# Pair Programming Partner: Chin Wei Liang, wlchin.2019

class QuizTest(unittest.TestCase):
    def test_quiz_json_method(self):
        quiz = Quiz(
            quiz_ID = 1,
            section_ID = 1,
            class_ID = 1,
            trainer_ID = 1,
            duration = 5,
            passing_rate = 0.85,
            grading_type = "graded"
              )
              
        self.assertDictEqual(quiz.json(), {
            "quiz_ID": 1,
            "section_ID": 1,
            "class_ID": 1,
            "trainer_ID": 1,
            "points": 0,
            "duration": 5,
            "passing_rate": 0.85,
            "grading_type": "graded",
            "quiz_questions": []
        })

class QuizQuestionTest(unittest.TestCase):
    def test_quiz_question_json_method(self):
        quiz_question = Quiz_question(
            quiz_question_ID = 1,
            quiz_ID = 1,
            question = "1 + 1 = ?",
            answer = "2",
            option1 = "1",
            option2 = "2",
            option3 = "3",
            option4 = "4",
            point = 1
              )
        self.assertDictEqual(quiz_question.json(), {
            "quiz_question_ID": 1,
            "quiz_ID": 1,
            "question": "1 + 1 = ?",
            "answer" : "2",
            "option1": "1",
            "option2": "2",
            "option3": "3",
            "option4": "4",
            "option5": None,
            "point": 1
        })
    

class QuizResultTest(unittest.TestCase):
    def test_quiz_result_json_method(self):
        quiz_result = Quiz_result(
            quiz_ID = 1,
            class_ID = 1,
            section_ID = 1,
            learner_ID = 1,
            quiz_score = 10,
            has_passed = True
              )
        self.assertDictEqual(quiz_result.json(), {
            "quiz_ID": 1,
            "class_ID": 1,
            "section_ID": 1,
            "learner_ID": 1,
            "quiz_score": 10,
            "has_passed": True
        })
    
if __name__ == "__main__":
    unittest.main()
