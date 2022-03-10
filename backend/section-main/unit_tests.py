import unittest
from app import Section, Section_content, Content_view

# Main Author: Benjamin Chew Pin Hsien, phchew.2019
# Pair Programming Partner: Clarence Yeo Jun Hui, clarenceyeo.2019

class TestSection(unittest.TestCase):
    def test_section_json_method(self):
        section = Section(
            section_ID = 1,
            class_ID = 1,
            title = "Chapter 1",
            ranking = 1,
            has_content = False,
            has_quiz = False
              )
              
        self.assertDictEqual(section.json(), {
            "section_ID": 1,
            "class_ID": 1,
            "title": "Chapter 1",
            "ranking": 1,
            "has_content": False,
            "has_quiz": False
        })

class TestSectionContent(unittest.TestCase):
    def test_section_content_json_method(self):
        section_content = Section_content(
            content_ID = 1,
            section_ID = 1,
            description = "Chapter 1 Video Link",
            url = "https://youtube.com/test",
            content_type = "video"
              )

        self.assertDictEqual(section_content.json(), {
            "content_ID" : 1,
            "section_ID" : 1,
            "description" : "Chapter 1 Video Link",
            "url" : "https://youtube.com/test",
            "content_type" : "video"
        })

class TestContentView(unittest.TestCase):
    def test_content_view_json_method(self):
        content_view = Content_view(
            content_ID = 1,
            learner_ID = 1,
            section_ID = 1
              )
        self.assertDictEqual(content_view.json(), {
            "content_ID" : 1,
            "learner_ID" : 1,
            "section_ID" : 1
        })
    
if __name__ == "__main__":
    unittest.main()
