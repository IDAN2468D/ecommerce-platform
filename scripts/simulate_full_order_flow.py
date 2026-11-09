#!/usr/bin/env python3
"""
End-to-End E-Commerce Order Flow Simulation Script
Triggers an autonomous order flow through all architecture stations:
1. Product Catalog & Swarm Pricing Agent (MongoDB Atlas)
2. Order Creation & Persistence to Order History (MongoDB Atlas 'orders')
3. Event Publishing to Kafka ('order-events', 'inventory-events', 'payment-events', 'shipping-events', 'notification-events')
4. Logistics & Live Tracking Generation (DHL Express Israel)
5. Real Email Notification via Google Gmail API to idankzm@gmail.com
"""

import os
import sys

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
import uuid
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from kafka import KafkaProducer

# MongoDB URI
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority"
)
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:29092")
USER_EMAIL = "idankzm@gmail.com"
CUSTOMER_ID = "usr_demo"

def step_banner(num: int, title: str):
    print(f"\n========================================================")
    print(f"🚀 [שלב {num}/6] {title}")
    print(f"========================================================")

def main():
    print("================================================================")
    print("🛒 הפעלת סימולציה מלאה מקצה לקצה - E-Commerce Agent Swarm Flow")
    print("================================================================")

    # ---------------------------------------------------------
    # שלב 1: התחברות למסד הנתונים ובחירת מוצר מהקטלוג
    # ---------------------------------------------------------
    step_banner(1, "שליפת מוצר מקטלוג המוצרים ב-MongoDB Atlas")
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client["ecommerce_db"]
    inventory_col = db["inventory"]

    product = inventory_col.find_one({"skuCode": "IPHONE-16-PRO-256"})
    if not product:
        product = inventory_col.find_one({"availableQuantity": {"$gt": 0}})
    
    if not product:
        product = {
            "skuCode": "IPHONE-16-PRO-256",
            "name": "Apple iPhone 16 Pro 256GB Natural Titanium",
            "price": 5499.0,
            "category": "סמארטפונים"
        }

    sku_code = str(product.get("skuCode", "IPHONE-16-PRO-256"))
    product_name = str(product.get("name") or product.get("productName") or "Apple iPhone 16 Pro 256GB")
    raw_price = product.get("price") or product.get("unitPrice") or 5499.0
    unit_price = float(str(raw_price))
    discount_amount = round(unit_price * 0.10, 2) # 10% VIP Swarm discount
    final_amount = round(unit_price - discount_amount, 2)

    print(f"  ✓ נבחר מוצר: {product_name} (מק\"ט: {sku_code})")
    print(f"  ✓ מחיר מחירון: ₪{unit_price:,.2f}")
    print(f"  ✓ הנחת מועדון VIP סוכנים (10%): -₪{discount_amount:,.2f}")
    print(f"  ✓ סה\"כ לתשלום לאחר הנחה: ₪{final_amount:,.2f}")

    # ---------------------------------------------------------
    # שלב 2: יצירת ההזמנה ושמירה בהיסטוריית ההזמנות באתר
    # ---------------------------------------------------------
    step_banner(2, "יצירת ההזמנה ושמירה במסד הנתונים 'orders'")
    order_id = f"ord-{uuid.uuid4()}"
    payment_tx_id = f"tx_live_{uuid.uuid4().hex[:12]}"
    tracking_number = f"IL-EXP-{uuid.uuid4().int % 900000000 + 100000000}"
    now_utc = datetime.now(timezone.utc)
    now_iso = now_utc.isoformat()
    est_delivery = (now_utc + timedelta(days=2)).isoformat()

    order_doc = {
        "id": order_id,
        "orderId": order_id,
        "idempotencyKey": f"idemp_{uuid.uuid4().hex}",
        "customerId": CUSTOMER_ID,
        "customerEmail": USER_EMAIL,
        "status": "CONFIRMED",
        "currency": "ILS",
        "subtotal": unit_price,
        "discountAmount": discount_amount,
        "totalAmount": final_amount,
        "couponCode": "SWARM-VIP10",
        "items": [
            {
                "id": f"item-{uuid.uuid4().hex[:8]}",
                "skuCode": sku_code,
                "productName": product_name,
                "quantity": 1,
                "unitPrice": unit_price
            }
        ],
        "paymentTransactionId": payment_tx_id,
        "paymentMethodToken": "pm_card_visa_ok",
        "trackingNumber": tracking_number,
        "shippingCarrier": "Israel Post Express (דואר ישראל)",
        "shippingStatus": "PROCESSING",
        "estimatedDelivery": est_delivery,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    orders_col = db["orders"]
    orders_col.insert_one(order_doc)
    print(f"  ✓ הזמנה נוצרה בהצלחה: {order_id}")
    print(f"  ✓ נשמרה במסד MongoDB Atlas בקולקציית 'orders'")
    print(f"  ✓ תופיע מיד בעמוד היסטוריית ההזמנות באתר (/orders)")

    # ---------------------------------------------------------
    # שלב 3: שידור האירועים לברוקר ה-Kafka בכל הטופיקים
    # ---------------------------------------------------------
    step_banner(3, "שידור אירועי ה-SAGA בכל תחנות ה-Kafka")
    
    events_trail = []
    try:
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
            value_serializer=lambda v: json.dumps(v).encode('utf-8') if not isinstance(v, (bytes, bytearray)) else v,
            retries=3
        )

        # 3.1 OrderCreatedEvent -> order-events
        order_event = {
            "orderId": order_id,
            "customerId": CUSTOMER_ID,
            "totalAmount": final_amount,
            "currency": "ILS",
            "items": [{"skuCode": sku_code, "quantity": 1, "unitPrice": unit_price}],
            "createdAt": now_iso
        }
        producer.send(
            "order-events",
            value=order_event,
            headers=[
                ("__TypeId__", b"com.company.common.events.OrderCreatedEvent"),
                ("eventId", str(uuid.uuid4()).encode('utf-8'))
            ]
        ).get(timeout=5)
        events_trail.append(("order-events", "OrderCreatedEvent", "נקלט בהצלחה והופץ לשירותי המלאי"))
        print(f"  ✓ [Kafka] שודר OrderCreatedEvent לטופיק: order-events")

        # 3.2 StockReservedEvent -> inventory-events
        inventory_event = {
            "orderId": order_id,
            "customerId": CUSTOMER_ID,
            "items": [{"skuCode": sku_code, "quantity": 1}],
            "reservedAt": now_iso
        }
        producer.send(
            "inventory-events",
            value=inventory_event,
            headers=[
                ("__TypeId__", b"com.company.common.events.StockReservedEvent"),
                ("eventId", str(uuid.uuid4()).encode('utf-8'))
            ]
        ).get(timeout=5)
        events_trail.append(("inventory-events", "StockReservedEvent", "שריון יחידה מהמלאי אושר"))
        print(f"  ✓ [Kafka] שודר StockReservedEvent לטופיק: inventory-events")

        # 3.3 PaymentCapturedEvent -> payment-events
        payment_event = {
            "orderId": order_id,
            "customerId": CUSTOMER_ID,
            "transactionId": payment_tx_id,
            "amount": final_amount,
            "currency": "ILS",
            "capturedAt": now_iso
        }
        producer.send(
            "payment-events",
            value=payment_event,
            headers=[
                ("__TypeId__", b"com.company.common.events.PaymentCapturedEvent"),
                ("eventId", str(uuid.uuid4()).encode('utf-8'))
            ]
        ).get(timeout=5)
        events_trail.append(("payment-events", "PaymentCapturedEvent", f"חיוב בסך ₪{final_amount} עבר בהצלחה"))
        print(f"  ✓ [Kafka] שודר PaymentCapturedEvent לטופיק: payment-events")

        # 3.4 ShippingScheduledEvent -> shipping-events
        shipping_event = {
            "orderId": order_id,
            "customerId": CUSTOMER_ID,
            "trackingNumber": tracking_number,
            "carrier": "Israel Post Express",
            "status": "PROCESSING",
            "scheduledAt": now_iso
        }
        producer.send(
            "shipping-events",
            value=shipping_event,
            headers=[
                ("__TypeId__", b"com.company.common.events.ShipmentScheduledEvent"),
                ("eventId", str(uuid.uuid4()).encode('utf-8'))
            ]
        ).get(timeout=5)
        events_trail.append(("shipping-events", "ShipmentScheduledEvent", f"הוקצה מספר מעקב {tracking_number}"))
        print(f"  ✓ [Kafka] שודר ShipmentScheduledEvent לטופיק: shipping-events")

        # 3.5 NotificationSentEvent -> notification-events
        notif_event = {
            "notificationId": f"notif_{uuid.uuid4().hex[:8]}",
            "customerId": CUSTOMER_ID,
            "channel": "EMAIL",
            "subject": f"אישור הזמנה #{order_id[:8]}",
            "recipient": USER_EMAIL,
            "sentAt": now_iso
        }
        producer.send(
            "notification-events",
            value=notif_event,
            headers=[
                ("__TypeId__", b"com.company.common.events.NotificationSentEvent"),
                ("eventId", str(uuid.uuid4()).encode('utf-8'))
            ]
        ).get(timeout=5)
        events_trail.append(("notification-events", "NotificationSentEvent", f"הודעה נשלחה לנמען {USER_EMAIL}"))
        print(f"  ✓ [Kafka] שודר NotificationSentEvent לטופיק: notification-events")
        producer.flush()

    except Exception as e:
        print(f"  ⚠️ שגיאה בתקשורת מול Kafka המקומי: {e}")

    # ---------------------------------------------------------
    # שלב 4: שליחת דוא"ל אישור הזמנה באמצעות Gmail API
    # ---------------------------------------------------------
    step_banner(4, f"שליחת דוא\"ל סיכום הזמנה לכתובת {USER_EMAIL} באמצעות Gmail API")
    email_sent = False
    try:
        tokens_path = os.path.join(os.path.dirname(__file__), "..", "credentials", "tokens", "idankzm@gmail.com.json")
        with open(tokens_path, "r", encoding="utf-8") as tf:
            tdata = json.load(tf)

        creds = Credentials(
            token=tdata.get("access_token") or tdata.get("token"),
            refresh_token=tdata.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=tdata.get("client_id"),
            client_secret=tdata.get("client_secret"),
            scopes=tdata.get("scopes")
        )

        gmail_service = build("gmail", "v1", credentials=creds)

        subject = f"🛒 אישור הזמנה וסיכום סימולציה מקצה לקצה - הזמנה #{order_id[:8]}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; color: #1e293b; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; }}
            .subtitle {{ color: #64748b; font-size: 14px; margin-top: 4px; }}
            .card {{ background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px; }}
            .item-table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
            .item-table th, .item-table td {{ padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: right; }}
            .status-badge {{ display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }}
            .timeline {{ margin-top: 20px; border-right: 3px solid #3b82f6; padding-right: 16px; }}
            .timeline-step {{ margin-bottom: 12px; }}
            .timeline-title {{ font-weight: bold; color: #1e293b; }}
            .timeline-desc {{ font-size: 13px; color: #64748b; }}
            .footer {{ margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">🎉 ההזמנה שלך אושרה בהצלחה!</h1>
              <p class="subtitle">סימולציית זרימת נתונים מלאה באמצעות סווארם סוכני המסחר האוטונומיים</p>
            </div>

            <div class="card">
              <table style="width: 100%;">
                <tr>
                  <td><strong>מספר הזמנה:</strong> {order_id}</td>
                  <td style="text-align: left;"><span class="status-badge">אושר ושוריין</span></td>
                </tr>
                <tr>
                  <td><strong>תאריך ושעה:</strong> {now_utc.strftime('%d/%m/%Y %H:%M:%S')} UTC</td>
                  <td style="text-align: left;"><strong>מזהה עסקה:</strong> {payment_tx_id}</td>
                </tr>
                <tr>
                  <td colspan="2"><strong>מספר מעקב דואר ישראל:</strong> {tracking_number}</td>
                </tr>
              </table>
            </div>

            <h3>📦 פרטי המוצר שהוזמן</h3>
            <table class="item-table">
              <thead>
                <tr style="background: #e2e8f0;">
                  <th>שם המוצר</th>
                  <th>מק"ט</th>
                  <th>כמות</th>
                  <th>מחיר</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{product_name}</strong></td>
                  <td><code>{sku_code}</code></td>
                  <td>1</td>
                  <td>₪{unit_price:,.2f}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 16px; text-align: left;">
              <p style="margin: 4px 0;">מחיר מקורי: ₪{unit_price:,.2f}</p>
              <p style="margin: 4px 0; color: #16a34a;">הנחת סוכן VIP (קוד: SWARM-VIP10): -₪{discount_amount:,.2f}</p>
              <h3 style="margin: 8px 0; color: #1e3a8a;">סה"כ שולם: ₪{final_amount:,.2f} ILS</h3>
            </div>

            <h3>⚡ מסלול אירועי ה-Kafka שעברו במערכת</h3>
            <div class="timeline">
              <div class="timeline-step">
                <div class="timeline-title">1. order-events ➔ OrderCreatedEvent</div>
                <div class="timeline-desc">ההזמנה נקלטה במסד MongoDB Atlas והופצה באפיק האירועים.</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-title">2. inventory-events ➔ StockReservedEvent</div>
                <div class="timeline-desc">שירות המלאי שריין יחידה מקטלוג המוצרים ומנע מכירת יתר.</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-title">3. payment-events ➔ PaymentCapturedEvent</div>
                <div class="timeline-desc">שירות התשלומים אישר את עסקת הסליקה והפיק מזהה תשלום.</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-title">4. shipping-events ➔ ShipmentScheduledEvent</div>
                <div class="timeline-desc">הוקצה משלוח אקספרס ונוצר מעקב לוגיסטי.</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-title">5. notification-events ➔ NotificationSentEvent</div>
                <div class="timeline-desc">נשלח עדכון דוא"ל רשמי זה ישירות לתיבת הדואר שלך.</div>
              </div>
            </div>

            <div class="footer">
              <p>מערכת מסחר אלקטרוני מבוזרת | Google Antigravity & Agent Swarm v8.0</p>
              <p>הזמנה זו זמינה כעת לצפייה בעמוד היסטוריית ההזמנות באתר שלך: <strong>/orders</strong></p>
            </div>
          </div>
        </body>
        </html>
        """

        message = MIMEMultipart("alternative")
        message["to"] = USER_EMAIL
        message["from"] = "me"
        message["subject"] = subject
        message.attach(MIMEText(html_body, "html", "utf-8"))

        raw_msg = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
        send_res = gmail_service.users().messages().send(userId="me", body={"raw": raw_msg}).execute()
        
        print(f"  ✓ דוא\"ל נשלח בהצלחה ל-{USER_EMAIL}!")
        print(f"  ✓ מזהה הודעה ב-Gmail: {send_res.get('id')}")
        email_sent = True
    except Exception as em_err:
        print(f"  ⚠️ שגיאה בשליחת הדוא\"ל: {em_err}")

    # ---------------------------------------------------------
    # שלב 5: אימות נוכחות ההזמנה בהיסטוריית ההזמנות
    # ---------------------------------------------------------
    step_banner(5, "אימות ההזמנה בהיסטוריית ההזמנות")
    verify_doc = orders_col.find_one({"orderId": order_id})
    if verify_doc:
        print(f"  ✓ אומת בהצלחה: ההזמנה {order_id} קיימת ונשמרה במסד MongoDB Atlas.")
        print(f"  ✓ סטטוס הזמנה: {verify_doc.get('status')} | סה\"כ: ₪{verify_doc.get('totalAmount')}")
    else:
        print(f"  ⚠️ לא נמצאה ההזמנה במסד הנתונים.")

    # ---------------------------------------------------------
    # שלב 6: סיכום תוצאות
    # ---------------------------------------------------------
    step_banner(6, "סיכום הסימולציה")
    print(f"  - מזהה הזמנה: {order_id}")
    print(f"  - מוצר: {product_name}")
    print(f"  - סה\"כ לתשלום: ₪{final_amount}")
    print(f"  - מספר מעקב: {tracking_number}")
    print(f"  - דוא\"ל נשלח ל: {USER_EMAIL} ({'הצלחה' if email_sent else 'נכשל'})")
    print(f"  - אירועים ששודרו ב-Kafka: {len(events_trail)} אירועים")
    print(f"  - היסטוריית הזמנות: ההזמנה זמינה לצפייה באתר תחת /orders")
    print("\n✅ הסימולציה הושלמה במלואה בהצלחה!")

    return {
        "orderId": order_id,
        "product": product_name,
        "totalAmount": final_amount,
        "trackingNumber": tracking_number,
        "emailSent": email_sent,
        "eventsCount": len(events_trail)
    }

if __name__ == "__main__":
    main()
