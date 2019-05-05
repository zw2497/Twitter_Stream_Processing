from flask import Flask, jsonify
import aws_controller

app = Flask(__name__)

@app.route('/')
def index():
    return "This is the main page"

@app.route('/get-data')
def get_data():
    return jsonify(aws_controller.get_data())

@app.route('/write-data')
def write_data():
    aws_controller.write_data()
    return "Insertion success"

@app.route('/consume-data')
def consume_data():
    aws_controller.consume_data()
    return "consume success"

@app.route('/client-data')
def client_data():
    return str(aws_controller.client_get_data())



if __name__ == '__main__':
    app.run()