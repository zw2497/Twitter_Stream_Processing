from flask import Flask, request, jsonify, make_response
import json
from datetime import datetime
from google.cloud import bigquery

'''
`pip install --upgrade google-cloud-bigquery`
Give authentication by the myAuth.json to the client
`export GOOGLE_APPLICATION_CREDENTIALS="./myAuth.json"`
'''
app = Flask(__name__)
client = bigquery.Client()

@app.route("/getquery", methods=['GET', 'POST'])
def getquery():
    try:
        start = datetime.strptime(request.form['start'], '%Y-%m-%dT%H:%M')
        end = datetime.strptime(request.form['end'], '%Y-%m-%dT%H:%M')

        QUERY = '''
            SELECT tweetid, tweet_text, latitude as lat, longitude as lng 
            FROM `project2-236400.twitter.IRA` 
            WHERE latitude != "" and longitude != "" 
                and tweet_time >= '%s' and tweet_time <= '%s' 
            LIMIT 1000
        ''' % (start, end)

        query_job = client.query(QUERY)  # API request
        rows = query_job.result()  # Waits for query to finish

        json_rows = []
        for row in rows:
            tmp_dict = {}
            tmp_dict['tid'] = row.tweetid
            tmp_dict['text'] = row.tweet_text
            tmp_dict['lat'] = row.lat
            tmp_dict['lng'] = row.lng
            json_rows.append(tmp_dict)

        with open('./assets/js/geoData.js', 'w+') as f:
            f.write("eqfeed_callback([")
            for row in json_rows[:-2]:
                f.write(str(row) + ',\n')
            f.write(str(json_rows[-1]) + ']);')
    except:
        pass

    resp = jsonify({
        "msg": "hello"
    })
    response = make_response(resp, 304)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    response.headers
    return response


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=6677, debug=True)