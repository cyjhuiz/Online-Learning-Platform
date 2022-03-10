class TrainerInfo():
    def __init__(self, trainer_name = None):
        self.__trainer_name = trainer_name
    
    def get_trainer_name(self):
        return self.__trainer_name
    def set_trainer_name(self, name):
        self.__trainer_name = name
    
    def to_json(self):
        return {
            "trainer_name" : self.get_trainer_name()
        }