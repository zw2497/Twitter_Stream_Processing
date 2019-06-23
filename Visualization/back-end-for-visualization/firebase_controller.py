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

    id = str(time.time())
    consumer = KafkaConsumer(
        'fast',
        bootstrap_servers=['35.243.144.79:9092'],
        auto_offset_reset='latest',
        enable_auto_commit=False,
        group_id=id
    )
    prev = ""
    heap = []
    items = []
    tags = set()
    for message in consumer:
        timestamp = message.key.decode()
        data = message.value.decode().split(" ")
        topic = str(data[0])
        count = int(data[1])
        sentiment = (float(data[2]) + 1) / 2
        print("fast", str(timestamp), topic)
        if prev != timestamp:
            prev = timestamp
            heap.sort()
            if len(heap) > 10:
                print("start1")
                for i in range(10):
                    print(heap[i])
                    item = {
                        'tag': heap[i][1],
                        'count': -heap[i][0],
                        'sentiment': heap[i][2]
                    }
                    items.append(item)
                # update_in_transaction(transaction, db_ref, items)
                batch = db.batch()
                for i in range(10):
                    batch.update(db.collection(
                        u'topk1').document(str(i+1)), items[i])
                batch.commit()
                items = []
            else:
                print("less than 10")
            heap = []
            tags = set()
            if topic not in tags:
                heappush(heap, (-count, topic, sentiment, timestamp))
                tags.add(topic)
        else:
            if topic not in tags:
                heappush(heap, (-count, topic, sentiment, timestamp))
                tags.add(topic)
    consumer.close()


def getTopk10(db):

    id = str(time.time()) + str(2)
    consumer = KafkaConsumer(
        'slow',
        bootstrap_servers=['35.243.144.79:9092'],
        auto_offset_reset='latest',
        enable_auto_commit=False,
        group_id=id
    )

    prev = ""
    heap = []
    items = []
    tags = set()
    for message in consumer:
        timestamp = message.key.decode()
        data = message.value.decode().split(" ")
        topic = str(data[0])
        count = int(data[1])
        sentiment = (float(data[2]) + 1) / 2
        if prev != timestamp:
            prev = timestamp
            heap.sort()
            if len(heap) > 10:
                print("start2")
                for i in range(10):
                    print(heap[i])
                    item = {
                        'tag': heap[i][1],
                        'count': -heap[i][0],
                        'sentiment': heap[i][2]
                    }
                    items.append(item)
                # update_in_transaction(transaction, db_ref, items)
                batch = db.batch()
                for i in range(10):
                    batch.update(db.collection(
                        u'topk10').document(str(i+1)), items[i])
                batch.commit()
                items = []
            heap = []
            tags = set()
            if topic not in tags:
                heappush(heap, (-count, topic, sentiment, timestamp))
                tags.add(topic)
        else:
            if topic not in tags:
                heappush(heap, (-count, topic, sentiment, timestamp))
                tags.add(topic)
    consumer.close()


def main():
        # Use a service account
    cred = credentials.Certificate(
        'myAuth.json')
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    p1 = Process(target=getTopk1, args=(db,))
    p2 = Process(target=getTopk10, args=(db,))

    p1.start()
    p2.start()
    p1.join()
    p2.join()


if __name__ == '__main__':
    main()
