import unittest
import flask_testing
import json
from app import app, db, Section, Section_content, Content_view

# Main Author: Benjamin Chew Pin Hsien, phchew.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestApp(flask_testing.TestCase):
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite://"
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    app.config['TESTING'] = True

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()
        self.section1 = section = Section(section_ID=1, class_ID=1, title="Printing Basics 101", ranking=1, has_content=False, has_quiz=False)
        self.section_content1 = Section_content(content_ID=1, section_ID=1, description="Test Video", url="https://www.youtube.com/embed/test_external_platform_lecture", content_type="video")

    def tearDown(self):
        db.session.remove()
        db.drop_all()


class TestCreateSection(TestApp):
    def test_create_section(self):

        request_body = {
            "title": "Printing Basics 101",
            "class_ID": 1
        }

        response = self.client.post("/section",
                                    data=json.dumps(request_body),
                                    content_type='application/json')
        self.assertEqual(response.json, {
            "code": 200,
            "data": {
                "section": {
                "class_ID": 1,
                "section_ID": 1,
                "title": "Printing Basics 101",
                "ranking": 1,
                "has_content": False,
                "has_quiz": False
                }
            }
        })


class TestCreateSectionContent(TestApp):
    def test_create_section_content(self):
        
        db.session.add(self.section1)
        db.session.commit()

        request_body = {
            "section_ID": 1,
            "description": "Test Video",
            "url": "https://www.youtube.com/embed/test_external_platform_lecture",
            "content_type": "video"
        }

        response = self.client.post("/section/content",
                                    data=request_body,
                                    content_type='multipart/form-data')

        self.assertEqual(response.json, {
            "code": 200,
            "data": {
                "section_content": {
                "content_ID": 1,
                "section_ID": 1, 
                "description": "Test Video",
                "url": "https://www.youtube.com/embed/test_external_platform_lecture",
                "content_type": "video",
                }
            }
        })

class TestCreateContentView(TestApp):
    def test_create_content_view(self):

        db.session.add(self.section1)
        db.session.add(self.section_content1)
        db.session.commit()

        request_body = {
            "learner_ID": 1
        }

        response = self.client.post(f"/section/{self.section1.section_ID}/content/{self.section_content1.content_ID}/view",
                                    data=json.dumps(request_body),
                                    content_type='application/json')
        self.assertEqual(response.json, {
            "code": 200,
            "data": {
                "content_view": {
                "section_ID": 1,
                "content_ID": 1,
                "learner_ID": 1,
                }
            }
        })
        
if __name__ == '__main__':
    unittest.main()
