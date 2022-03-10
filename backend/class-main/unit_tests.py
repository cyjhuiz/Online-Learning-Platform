import unittest

from app import Class, Applicant, Withdrawal
from models.courseInfo import CourseInfo
from models.learnerInfo import LearnerInfo
from models.trainerInfo import TrainerInfo

# Main author ~ Loi Cheng Yi chengyi.loi.2019
# Pair programming partner ~ Benjamin Chew Pin Hsien phchew.2019@smu.edu.sg

class UnitTest(unittest.TestCase):

    # Class
    def test_class_get_remaining_slots_method(self):
        course_class = Class()
        course_class.set_class_details(class_ID= 123,
            course_ID = 20, 
             class_name = "Test course",
             size = 10,
             starting_date = "2020-08-20",
             ending_date = "2020-10-20",
             class_status = "OPEN",
             trainer_ID= 100,
             hr_ID = 10,
            enrol_start_date= "2020-06-01",
             enrol_end_date= "2020-06-10",
             hr_name = "john doe"
             )
        course_class.set_enrolled_users(5)
        self.assertEqual(course_class.get_remaining_slots(), 5)

    def test_class_to_json_method(self):
        course_class = Class()

        course_class.set_class_details( 
            class_ID= 123,
            course_ID = 20, 
             class_name = "Test course",
             size = 10,
             starting_date = "2020-08-20",
             ending_date = "2020-10-20",
             class_status = "OPEN",
             trainer_ID= 100,
             hr_ID = 10,
            enrol_start_date= "2020-06-01",
             enrol_end_date= "2020-06-10",
             hr_name = "john doe"
             )
        
        course_class.set_course_info()
        course_class.set_learner_info()
        course_class.set_trainer_info()

        self.assertDictEqual(course_class.to_json(), {
            "class_ID" : 123,
            "course_ID" : 20,
            "class_name" : 'Test course',
            "size" : 10,
            "starting_date" : '2020-08-20',
            "ending_date" : '2020-10-20',
            "enrol_start_date" : '2020-06-01',
            "enrol_end_date" : '2020-06-10',
            "class_status" : 'OPEN',
            "trainer_ID" : 100,
            "hr_ID" : 10,
            "hr_name" : None,
            "course_info" : CourseInfo().to_json(),
            "learner_info" : LearnerInfo().to_json(),
            "trainer_info" : TrainerInfo().to_json(),
            "remaining_slots" : 10,
            "hr_name" : "john doe"
        })
    
    def test_applicant_to_json_method(self):
        applicant = Applicant(
             learner_ID = 6,
             class_ID = 50,
             status = "PENDING",
          
              )
        applicant.set_learner_info()
        applicant.set_class_info(Class())

        
        self.assertDictEqual(applicant.to_json(), {
            "learner_ID" : 6,
            "class_ID" : 50,
            "status" : 'PENDING',
            "learner_info" : LearnerInfo().to_json(),
            "class_info" : Class().to_json(),
          
        })
    # Withdrawal
    def test_withdrawl_to_json_method(self):
        withdrawl = Withdrawal(
             learner_ID = 6,
             class_ID = 50,
            reason = "test reason",
             status = "PENDING",
             hr_reason = "too smart",
             hr_ID = 20,
             date_of_action = "2021-05-10",
             action = "1"
              )
        self.assertDictEqual(withdrawl.to_json(), {
            "learner_ID" : 6,
            "class_ID" : 50,
            "reason" : 'test reason',
            "class_status" : 'PENDING',
            "hr_reason" : "too smart",
            "hr_ID" : 20,
            "date_of_action" : "2021-05-10",
            "action" : "1",
            "learner_info" : LearnerInfo().to_json(),
            "class_info" : Class().to_json()
        })

    
    # CourseInfo
    def test_course_info_get_course_name_method(self):
        course_info = CourseInfo()
        course_name = "intro to printer troubleshooting"
        course_info.set_course_name(course_name)
        self.assertEqual(course_info.get_course_name(), course_name)

    def test_course_info_get_prerequisites_method(self):
        course_info = CourseInfo()
        prerequisites =   [
               {
                    "course_ID" : "123",
                "course_code" : "TEST123",
                "name" : "test course"
               }
            ]
        course_info.set_prequisites(
          prerequisites
        )
        self.assertListEqual(course_info.get_prequisites(),   prerequisites)
    def test_course_info_get_hr_name_method(self):
        course_info = CourseInfo()
        name = "john doe"
        course_info.set_hr_name(name)
        self.assertEqual(course_info.get_hr_name(), name)
    
    def test_course_info_to_json_method(self):
        course_info = CourseInfo()
        course_info.set_course_name("test course")
        course_info.set_prequisites([
               {
                    "course_ID" : "123",
                "course_code" : "TEST123",
                "name" : "test course"
               }
            ])
        course_info.set_hr_name("john doe")
        
        self.assertDictEqual(course_info.to_json(), {
            "course_name" : "test course",
            "prerequisites" :  [{"course_ID" : "123","course_code" : "TEST123","name" : "test course"}],
            "hr_name" : "john doe",
            "hr_ID" : None
        })
    
    # TrainerInfo
    def test_trainer_info_get_trainer_name_method(self):
        trainer_info = TrainerInfo()
        name = "john doe"
        trainer_info.set_trainer_name(name)
        return self.assertEqual(trainer_info.get_trainer_name(), name)
    
    def test_trainer_info_to_json_method(self):
        name = "john doe"
        trainer_info = TrainerInfo()
        trainer_info.set_trainer_name(name)
        return self.assertEqual(trainer_info.to_json(),{"trainer_name" : name})
    
    # LearnerInfo
    def test_learner_info_get_learner_name_method(self):
        name = "john doe"
        learner_info = LearnerInfo()
        learner_info.set_learner_name(name)
        return self.assertEqual(learner_info.get_learner_name(), name)
    
    def test_learner_info_get_enrollment_type_method(self):
        enrollment_type = "ASSIGNED"
        learner_info = LearnerInfo()
        learner_info.set_enrollment_type(enrollment_type)
        return self.assertEqual(learner_info.get_enrollment_type(), enrollment_type)
    
    def test_learner_info_to_json_method(self):
        learner_info = LearnerInfo()
        learner_info.set_enrollment_type('ASSIGNED')
        learner_info.set_learner_name("john doe")
        return self.assertDictEqual(learner_info.to_json(),{
            "learner_name" : "john doe",
            "enrollment_type" : "ASSIGNED"
        })

    #Applicant
    def test_applicant_to_json_method(self):
        learner_ID = "123"
        class_ID = "321"
        status = "PENDING"
        applicant = Applicant(
            learner_ID = learner_ID,
            class_ID = class_ID,
            status = status
        )

        applicant.set_learner_info()
        applicant.set_class_info(Class())
        
        
        return self.assertDictEqual(applicant.to_json(),
        
        {
            "learner_ID" : learner_ID,
            "class_ID" : class_ID,
            "status" : status,
            "learner_info" : LearnerInfo().to_json(),
            "class_info" :  Class().to_json()
            
        }
        )

    
    

    

    
if __name__ == "__main__":
    unittest.main()
