
- start zookeeper
- start kafka server
- server/npm start
- server/py kafka-consumer.py
- client/npm start


 
 
 KAFKA commands -  go to Kafka local folder -    C:\kafka


New CMD Window 1:   Start Zookeeper
.\bin\windows\zookeeper-server-start.bat   .\config\zookeeper.properties

New CMD Window 2: start KAFKA SERVER
.\bin\windows\Kafka-Server-start.bat  .\config\server.properties

New CMD Window 3: create Topics
.\bin\windows\kafka-topics.bat --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic topicName

New CMD Window 3: list down topics 
.\bin\windows\kafka-topics.bat --list --zookeeper localhost:2181

New CMD Window 3: delete topics
.\bin\windows\kafka-topics.bat --delete --zookeeper localhost:2181 --topic topicName

New CMD Window 4: start producer on topic
.\bin\windows\kafka-console-producer.bat --broker-list localhost:9092 --topic topicName

New CMD Window 5: start consumer on topic
.\bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic topicName --from-beginning