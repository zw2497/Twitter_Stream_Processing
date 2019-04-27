import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from kafka import KafkaConsumer
from json import loads
from datetime import datetime
import random
from heapq import heappush, heappop
import time


# Use a service account
cred = credentials.Certificate(
    'd3-project-3aac0-firebase-adminsdk-61460-c9a76eb43c.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

step = 0
while step < 5:
    id = 'gljjup' + str(step)
    consumer = KafkaConsumer(
        'topk1',
        bootstrap_servers=['18.216.34.97:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id=id
    )
    message = consumer.poll(timeout_ms=10000, max_records=None)
    key = list(message.keys())
    # print(message)
    messages = message[key[0]]
    prev = ""
    heap = []
    for i in range(len(messages)):
        timestamp = messages[i].key.decode()
        data = messages[i].value.decode().split(" ")
        topic = str(data[0])
        count = int(data[1]) + random.randint(1, 50)

        if timestamp != prev:
            heap.clear()
            prev = timestamp
        heappush(heap, (-count, topic, timestamp))
    heap.sort()
    print(heap)
    # print(type(message[key[0]]))
    # print(message[key])
    consumer.close()

    if len(heap) > 5:
        for i in range(5):
            item = {
                'tag': heap[i][1],
                'count': -heap[i][0]
            }
            c = db.collection(u'test-topic').document(str(i+1))
            c.update(item)

    time.sleep(5)
    step += 1