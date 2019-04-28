from multiprocessing import Process
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from kafka import KafkaConsumer
from json import loads
from datetime import datetime
import random
from heapq import heappush, heappop
import time


def getTopk1(db):
    step = 0
    while step < 10:
        id = 'ggggjkurccc' + str(step)
        consumer = KafkaConsumer(
            'topk1',
            bootstrap_servers=['35.243.144.79:9092'],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id=id
        )
        # batch poll the data from Kafka
        message = consumer.poll(timeout_ms=10000, max_records=None)
        key = list(message.keys())
        messages = message[key[0]]
        prev = ""
        heap = []
        for i in range(len(messages)):
            timestamp = messages[i].key.decode()
            data = messages[i].value.decode().split(" ")
            topic = str(data[0])
            count = int(data[1]) * random.randint(1, 50)

            if timestamp != prev:
                heap.clear()
                prev = timestamp
            heappush(heap, (-count, topic, timestamp))
        heap.sort()
        print(heap)

        consumer.close()

        if len(heap) > 10:
            for i in range(10):
                item = {
                    'tag': heap[i][1],
                    'count': -heap[i][0]
                }
                c = db.collection(u'topk1').document(str(i+1))
                c.update(item)

        time.sleep(5)
        step += 1


def getTopk5(db):
    step = 0
    while step < 10:
        id = 'ggfwgjkurbbb' + str(step)
        consumer = KafkaConsumer(
            'topk5',
            bootstrap_servers=['35.243.144.79:9092'],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id=id
        )
        # batch poll the data from Kafka
        message = consumer.poll(timeout_ms=10000, max_records=None)
        key = list(message.keys())
        messages = message[key[0]]
        prev = ""
        heap = []
        for i in range(len(messages)):
            timestamp = messages[i].key.decode()
            data = messages[i].value.decode().split(" ")
            topic = str(data[0])
            count = int(data[1]) * random.randint(1, 50)

            if timestamp != prev:
                heap.clear()
                prev = timestamp
            heappush(heap, (-count, topic, timestamp))
        heap.sort()
        print(heap)

        consumer.close()

        if len(heap) > 10:
            for i in range(10):
                item = {
                    'tag': heap[i][1],
                    'count': -heap[i][0]
                }
                c = db.collection(u'topk5').document(str(i+1))
                c.update(item)

        time.sleep(10)
        step += 1


def getTopk10(db):
    step = 0
    while step < 10:
        id = 'ggfwgjkuaaaa' + str(step)
        consumer = KafkaConsumer(
            'topk10',
            bootstrap_servers=['35.243.144.79:9092'],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id=id
        )
        # batch poll the data from Kafka
        message = consumer.poll(timeout_ms=10000, max_records=None)
        key = list(message.keys())
        messages = message[key[0]]

        prev = ""
        heap = []
        for i in range(len(messages)):
            timestamp = messages[i].key.decode()
            data = messages[i].value.decode().split(" ")
            topic = str(data[0])
            count = int(data[1]) * random.randint(1, 50)

            if timestamp != prev:
                heap.clear()
                prev = timestamp
            heappush(heap, (-count, topic, timestamp))
        heap.sort()
        print(heap)

        consumer.close()

        if len(heap) > 10:
            for i in range(10):
                item = {
                    'tag': heap[i][1],
                    'count': -heap[i][0]
                }
                c = db.collection(u'topk10').document(str(i+1))
                c.update(item)

        time.sleep(10)
        step += 1


def main():
        # Use a service account
    cred = credentials.Certificate(
        'd3-project-3aac0-firebase-adminsdk-61460-c9a76eb43c.json')
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    p1 = Process(target=getTopk1, args=(db,))
    p2 = Process(target=getTopk5, args=(db,))
    p3 = Process(target=getTopk10, args=(db,))

    p1.start()
    p2.start()
    p3.start()
    p1.join()
    p2.join()
    p3.join()


if __name__ == '__main__':
    main()
