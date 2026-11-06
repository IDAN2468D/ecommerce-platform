import os
import sys
import time
import json
from pymongo import MongoClient
from datetime import datetime, timezone
from kafka import KafkaProducer

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority"
)
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

print(f"[Outbox Relay Daemon] Initializing with Kafka: {KAFKA_BOOTSTRAP_SERVERS}...")

def get_producer():
    while True:
        try:
            return KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
                value_serializer=lambda v: json.dumps(v).encode('utf-8') if not isinstance(v, (bytes, bytearray)) else v,
                retries=5
            )
        except Exception as e:
            print(f"[Outbox Relay] Waiting for Kafka ({e})... retrying in 3s")
            time.sleep(3)

producer = get_producer()
print("[Outbox Relay Daemon] Connected to Kafka successfully!")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
db = client["ecommerce_db"]
outbox = db["outbox_events"]

print("[Outbox Relay Daemon] Connected to MongoDB Atlas! Monitoring for PENDING events...")

while True:
    try:
        pending_events = list(outbox.find({"status": "PENDING"}).sort("createdAt", 1))
        if pending_events:
            print(f"[Outbox Relay] Found {len(pending_events)} pending events to publish...")
            for doc in pending_events:
                event_id = doc["_id"]
                topic = doc.get("topic")
                payload = doc.get("payload")
                event_type = doc.get("eventType", "Event")

                if topic and payload:
                    try:
                        clean_payload = json.loads(payload) if isinstance(payload, str) and payload.strip().startswith("{") else payload
                    except Exception:
                        clean_payload = payload

                    future = producer.send(topic, clean_payload)
                    future.get(timeout=10)

                    outbox.update_one(
                        {"_id": event_id},
                        {"$set": {"status": "PUBLISHED", "publishedAt": datetime.now(timezone.utc)}}
                    )
                    print(f"  ✓ [Relay] Synced {event_type} to Kafka topic: {topic}")
    except Exception as ex:
        print(f"[Outbox Relay] Poll loop error: {ex}")

    time.sleep(3)
