import json
import os
from time import sleep
import time
import datetime
import csv

from kafka import KafkaConsumer
from pymongo import MongoClient

from threading import Thread

class readMongoDBEvery1Min(Thread):
    def run(self):
        while True:
            chatmessages = db.chat_messages.find({'timestamp' : {'$gte': int(time.time())-(60*60*100) } } )
            
            print('in while 2', db.chat_messages.count_documents({'timestamp' : {'$gte': int(time.time())-(60*60*100) } } ))                        
            fieldnames = list(['message', 'key', 'timestamp'])                       
            with open('Names.csv', 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(chatmessages)               
            time.sleep(15)

if __name__ == '__main__':
    # database configurations
    url='mongodb+srv://mongodb:mongodb@cluster0.v9oir.mongodb.net/?retryWrites=true&w=majority'
    client = MongoClient(url)
    db=client.private_communtiy
    chatmessages = db.chat_messages.find({}).count()
    print(chatmessages)   
    
    readMongoDBEvery1Min().start()
    
    # KAFKA CONSUMING CONFIGURATIONs for Topic name - 'jitendra'
    parsed_topic_name = 'jitendra'
    
    consumer = KafkaConsumer(parsed_topic_name, auto_offset_reset='latest',
                             bootstrap_servers=['localhost:9092'], api_version=(0, 10))
    for msg in consumer:        
        value = msg.value.decode('utf-8')
        key = msg.key.decode('utf-8')
        print('message - {} is sent by {}'.format(value, key))
        db.chat_messages.insert_one({'message': value, 'key': key, 'timestamp': int(time.time())})

        chatmessages = db.chat_messages.count_documents({})
        print('Total messages:', chatmessages)
        sleep(3)   
        
    if consumer is not None:        
        consumer.close()