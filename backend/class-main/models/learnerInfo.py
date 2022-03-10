class LearnerInfo():
    def __init__(self, learner_name = None, enrollment_type = None):
        self.__enrollment_type = enrollment_type
        self.__learner_name = learner_name
    
    def get_learner_name(self):
        return self.__learner_name
    
    def set_learner_name(self, name):
        self.__learner_name = name
    
    def get_enrollment_type(self):
        return self.__enrollment_type
    
    def set_enrollment_type(self, type):
        self.__enrollment_type = type
    
    def to_json(self):
        return {
           "learner_name" : self.__learner_name,
           "enrollment_type" : self.__enrollment_type
        }