import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from kafka import KafkaConsumer
from json import loads
from datetime import datetime

# Use a service account
cred = credentials.Certificate(
    'd3-project-3aac0-firebase-adminsdk-61460-c9a76eb43c.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


count = 0
consumer = KafkaConsumer(
    'topk1',
    bootstrap_servers=['18.216.34.97:9092'],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='group133'
)
for message in consumer:
    datastr = str(message.key.decode())
    print(datastr)
    date = datetime.strptime(datastr, '%Y-%m-%d %H:%M:%S.%f')
    item = {
        'timestamp': date,
        'hashtag': message.value.decode().split()[0],
        'count': int(message.value.decode().split()[1])
    }
    db.collection(u'topic-test').add(item)

    # count += 1
    # if count == 1000:
    #     break
