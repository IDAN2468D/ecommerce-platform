import os
import sys
import json
from pymongo import MongoClient
from kafka import KafkaProducer

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority"
)
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
    value_serializer=lambda v: json.dumps(v).encode('utf-8') if not isinstance(v, (bytes, bytearray)) else v,
    retries=5
)

client = MongoClient(MONGODB_URI)
db = client["ecommerce_db"]
outbox = db["outbox_events"]

all_events = list(outbox.find({}).sort("createdAt", 1))
print(f"Total events to replay: {len(all_events)}")

counts = {}
for doc in all_events:
    topic = doc.get("topic")
    payload = doc.get("payload")
    if topic and payload:
        if isinstance(payload, str) and payload.strip().startswith("{"):
            try:
                body = json.loads(payload)
            except Exception:
                body = payload
        else:
            body = payload
        producer.send(topic, body)
        counts[topic] = counts.get(topic, 0) + 1

producer.flush()
print("Replay completed successfully!")
for topic, count in counts.items():
    print(f" - {topic}: {count} messages")
