class CourseInfo():
    def __init__(self, course_name= None, prerequisites= None, hr_name=None, hr_ID = None):
       
        self.__course_name = course_name
        self.__prerequisites = prerequisites
        self.__hr_name = hr_name
        self.__hr_ID = hr_ID
    
    def get_course_name(self):
        return self.__course_name
    
    def set_course_name(self, name):
        self.__course_name = name
    
    def get_prequisites(self):
        return self.__prerequisites
    
    def set_prequisites(self, prequisites):
        self.__prerequisites = prequisites

    def get_hr_name(self):
        return self.__hr_name
    
    def set_hr_name(self, name):
        self.__hr_name = name

    def get_hr_ID(self):
        return self.__hr_ID
    
    def set_hr_ID(self, id):
        self.__hr_ID = id
    
    def to_json(self):
        return {
            "course_name" : self.get_course_name(),
            "prerequisites" : self.get_prequisites(),
            "hr_name" : self.get_hr_name(),
            "hr_ID" : self.get_hr_ID()
        }