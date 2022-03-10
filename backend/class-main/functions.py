from flask import jsonify

def bad_request(message):
    return jsonify({
        "code" : 400,
        "data" : {
            "message" : message
        }
    }),400