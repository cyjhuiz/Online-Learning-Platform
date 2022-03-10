import unittest
import app

# Main Author: Clarence Yeo Jun Hui, clarenceyeo.2019
# Pair Programming Partner: Loi Cheng Yi, chengyi.loi.2019

class ApiTest(unittest.TestCase):
    def test_chat_history_to_json_method(self):
        chat = app.ChatHistory(
            sender_ID = "5",
            recipient_ID = "10",
            class_ID = "20",
            message = "test message",
            time_stamp = "2021-10-25",
            view_status = "0"
        )
        self.assertDictEqual(chat.to_json() , {
            "sender_ID" : "5",
            "recipient_ID" : "10",
            "class_ID" : "20",
            "message" : "test message",
            "time_stamp" : "2021-10-25",
            "view_status" : "0"
            
        })

if __name__ == "__main__":
    unittest.main()
