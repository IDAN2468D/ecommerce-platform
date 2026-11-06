import os
import sys
import time
import json
import subprocess
from pymongo import MongoClient
from datetime import datetime, timezone

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority"
)

def publish_to_kafka(topic: str, payload: any) -> bool:
    try:
        cmd = ["docker", "exec", "-i", "platform-kafka", "kafka-console-producer", "--bootstrap-server", "localhost:9092", "--topic", topic]
        if isinstance(payload, str) and payload.strip().startswith("{"):
            clean_payload = json.dumps(json.loads(payload))
        else:
            clean_payload = json.dumps(payload)

        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        proc.stdin.write(clean_payload + "\n")
        proc.stdin.close()
        proc.wait(timeout=10)
        return proc.returncode == 0
    except Exception as e:
        print(f"[Outbox Relay] Error sending to Kafka: {e}")
        return False

def sync_pending_outbox():
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client["ecommerce_db"]
        outbox = db["outbox_events"]

        pending_events = list(outbox.find({"status": "PENDING"}).sort("createdAt", 1))
        if not pending_events:
            return 0

        print(f"[Outbox Relay] Found {len(pending_events)} PENDING events from MongoDB Atlas! Syncing to Kafka...")
        count = 0
        for doc in pending_events:
            event_id = doc["_id"]
            topic = doc.get("topic")
            payload = doc.get("payload")
            event_type = doc.get("eventType", "Event")

            if topic and payload:
                ok = publish_to_kafka(topic, payload)
                if ok:
                    outbox.update_one(
                        {"_id": event_id},
                        {"$set": {"status": "PUBLISHED", "publishedAt": datetime.now(timezone.utc)}}
                    )
                    count += 1
                    print(f"  [OK] Synced {event_type} (id: {event_id}) -> Kafka topic: {topic}")
                else:
                    print(f"  [FAIL] Failed to sync {event_type} to Kafka")

        print(f"[Outbox Relay] Batch complete: {count}/{len(pending_events)} events successfully published to Kafka.")
        return count
    except Exception as ex:
        print(f"[Outbox Relay] Poller error: {ex}")
        return 0

if __name__ == "__main__":
    is_daemon = "--daemon" in sys.argv
    if is_daemon:
        print("[Outbox Relay Daemon] Starting continuous listener (polling every 5 seconds)...")
        while True:
            sync_pending_outbox()
            time.sleep(5)
    else:
        sync_pending_outbox()
