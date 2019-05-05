import boto3
from kafka import KafkaConsumer
from json import loads

dynamodb = boto3.resource('dynamodb')
dynamodb_client = boto3.client('dynamodb')

def client_get_data():
    response = dynamodb_client.scan(
        TableName='test_table'
    )
    print(response['Items'])
    return str(type(response))

def get_data():
    table = dynamodb.Table('test_table')
    response = table.get_item(
        Key={
            'user_name': 'zph',
            'tweet': 'i am a pig'
        }
    )
    item = response['Item']
    return item

def write_data():
    table = dynamodb.Table('test_table')
    table.put_item(
        Item={
            'user_name': 'sby',
            'tweet': 'i am a pig too too',
            'time': '2019-4-19'
        }
    )

def consume_data():
    table = dynamodb.Table('caiji_table')
    count = 0
    consumer = KafkaConsumer(
        'caiji3',
        bootstrap_servers=['18.216.34.97:9092'],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='group111',
        value_deserializer=lambda x: loads(x.decode('utf-8'))
    )
    #print('ok')
    with table.batch_writer() as batch:
        #print('ok')
        for message in consumer:
            item = {
                'topic': str(message.key),
                'count': int(message.value)
            }
            batch.put_item(Item=item)
            count += 1
            if count == 3000:
                break
    # for message in consumer:
    #     print(message.value)
    #     count+=1
    #     if count == 10:
    #         break
