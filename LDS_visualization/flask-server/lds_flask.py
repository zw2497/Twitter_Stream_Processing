from flask import Flask, request, jsonify, make_response, Response
import json, time, os
from datetime import datetime
from google.cloud import bigquery
from kafka import KafkaConsumer 
from collections import defaultdict

'''
`pip install --upgrade google-cloud-bigquery`
Give authentication by the myAuth.json to the client
`export GOOGLE_APPLICATION_CREDENTIALS="./myAuth.json"`
'''
app = Flask(__name__)
client = bigquery.Client()


@app.route("/")
def index():
    return "Just a test."


@app.route("/getquery", methods=['GET', 'POST'])
def getquery():
    try:
        start = datetime.strptime(request.form['start'], '%Y-%m-%dT%H:%M')
        end = datetime.strptime(request.form['end'], '%Y-%m-%dT%H:%M')
        count = request.form['count']
        
        QUERY = '''
            SELECT id_str as tweetid, text as tweet_text, 
                   latitude as lat, longitude as lng
            FROM `e6820-235222.warehouse.tweet_full6` 
            WHERE latitude is not null and longitude is not null and 
                  created_at >= '%s' and created_at <= '%s' 
            LIMIT %s
        ''' % (start, end, count)
        print(QUERY)
        query_job = client.query(QUERY)  # API request
        rows = query_job.result()  # Waits for query to finish

        json_rows = []
        for row in rows:
            tmp_dict = {}
            tmp_dict['tid'] = row.tweetid
            tmp_dict['text'] = row.tweet_text
            tmp_dict['lng'] = row.lat
            tmp_dict['lat'] = row.lng
            json_rows.append(tmp_dict)

        with open('../templates/assets/js/geoData.js', 'w+') as f:
            f.write("eqfeed_callback([")
            for row in json_rows[:-1]:
                f.write(str(row) + ',\n')
            f.write(str(json_rows[-1]) + ']);')
    except Exception as e:
        print(e)

    resp = jsonify({
        "msg": "hello"
    })
    response = make_response(resp, 304)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response


@app.route("/gettrend", methods=['GET', 'POST'])
def gettrend():
    groupid = str(time.time())
    consumer = KafkaConsumer(
        'trend',
        bootstrap_servers=['35.243.144.79:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=False,
        group_id=groupid
    )

    history = defaultdict(list)

    def generate(consumer):
        start_time = time.time()
        while True:
            # key, value = message.key.decode(), message.value.decode()
            # a.append([key.decode(), value.decode()])
            # if time.time() - start_time > 2:
            #     if len(a) > 10:
            #         a.sort(key=lambda x: -float(x[1]))
            #         yield(str(dict(a[:20])).replace('\'', '\"'))
            #         print(a[:20])
            #         a = []
            #     start_time = time.time()
            cur_poll = consumer.poll(timeout_ms=10000)
            for pk, pv in cur_poll.items():
                for p in pv:
                    key, value = p.key.decode(), p.value.decode()
                    if value != '0.0' and value != '-0.0':
                        history[key].append(value)
            print(history)
            resp_list = []
            for k, v in list(history.items()):
                if len(v) != 0:
                    resp_list.append([k, v.pop(0)])
                if len(v) == 0:
                    del history[k]
            if len(resp_list) >= 5:
                resp_list.sort(key=lambda x: -float(x[1]))
                yield(str(dict(resp_list[:20])).replace('\'', '\"'))
                # print(resp_list[:20])
            time.sleep(1)

            # if time.time() - start_time > 10:
            #     resp_list = []
            #     for k, v in list(history.items()):
            #         if len(v) != 0:
            #             resp_list.append([k, v.pop(0)])
            #         if len(v) == 0:
            #             del history[k]
                
            #     resp_list.sort(key=lambda x: -float(x[1]))
            #     yield(str(dict(resp_list[:20])).replace('\'', '\"'))
            #     print(resp_list[:20])
            #     start_time = time.time()

    resp = Response(generate(consumer))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Headers'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = '*'
    return resp


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=6789, debug=True)