import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from kafka import KafkaConsumer
from json import loads

# Use a service account
cred = credentials.Certificate('d3-project-3aac0-firebase-adminsdk-61460-c9a76eb43c.json')
firebase_admin.initialize_app(cred)

db = firestore.client()


count = 0
consumer = KafkaConsumer(
    'caiji3',
    bootstrap_servers=['18.216.34.97:9092'],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='group113',
    value_deserializer=lambda x: loads(x.decode('utf-8'))
)
for message in consumer:      
    item = {
    'tag': str(message.key.decode()),
    'count': int(message.value)
    }
    db.collection(u'topics').add(item)

    count += 1
    if count == 50:
        break