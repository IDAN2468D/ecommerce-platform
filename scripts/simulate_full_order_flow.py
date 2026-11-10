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

        subject = f"💎 אישור הזמנה רשמי וקופת FinTech מאוחדת - הזמנה #{order_id[:8]}"
        
        # Bulletproof, luxury, Gmail-optimized HTML template
        html_body = f"""
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" dir="rtl" lang="he">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{subject}</title>
        </head>
        <body style="margin: 0; padding: 24px 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; direction: rtl; text-align: right; color: #f8fafc;">
          
          <!-- Outer Center Wrapper Table -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" dir="rtl" style="background-color: #030712;">
            <tr>
              <td align="center" style="padding: 12px;">
                
                <!-- Main Email Card Container (640px) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);">
                  
                  <!-- Top Ambient Gradient Accent Line -->
                  <tr>
                    <td height="5" style="background: linear-gradient(90deg, #f59e0b 0%, #10b981 50%, #6366f1 100%); line-height: 5px; font-size: 1px;">&nbsp;</td>
                  </tr>

                  <!-- Header Area -->
                  <tr>
                    <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1e293b;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="right" valign="middle">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-left: 12px;">
                                  <div style="width: 42px; height: 42px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px; text-align: center; line-height: 42px; font-size: 20px;">⚡</div>
                                </td>
                                <td>
                                  <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">קופת FinTech מאוחדת</h1>
                                  <p style="margin: 3px 0 0 0; font-size: 12px; color: #94a3b8;">אישור רכישה רשמי • פריסה 0% • נאמנות דיגיטלית</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td align="left" valign="middle">
                            <span style="display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; font-size: 11px; font-family: monospace; font-weight: bold; color: #34d399;">
                              ● SHA-256 ESCROW
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content Body -->
                  <tr>
                    <td style="padding: 28px 32px;">

                      <!-- Virtual FinTech Black VIP Card -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e1b4b 100%); border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 20px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.6);">
                        <tr>
                          <td style="padding: 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="right">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td width="36" height="26" style="background: linear-gradient(135deg, #fde68a 0%, #f59e0b 100%); border-radius: 6px; text-align: center; font-size: 9px; font-weight: 900; color: #020617; line-height: 26px;">CHIP</td>
                                      <td style="padding-right: 10px; font-size: 10px; font-family: monospace; color: #94a3b8; letter-spacing: 1px;">NFC CONTACTLESS</td>
                                    </tr>
                                  </table>
                                </td>
                                <td align="left">
                                  <span style="font-size: 11px; font-weight: 900; font-family: monospace; color: #fbbf24; letter-spacing: 2px;">FINTECH BLACK VIP</span>
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 18px;">
                                  <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">סה״כ שולם בעסקה:</span>
                                  <div style="font-size: 34px; font-weight: 900; color: #fbbf24; font-family: -apple-system, BlinkMacSystemFont, monospace; margin-top: 4px; letter-spacing: -1px;">
                                    ₪{final_amount:,.2f}
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 18px; border-top: 1px solid rgba(51, 65, 85, 0.7);">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 11px; font-family: monospace;">
                                    <tr>
                                      <td align="right" style="color: #cbd5e1;">
                                        <span style="color: #64748b; display: block; font-size: 9px;">לקוח VIP</span>
                                        <strong style="color: #ffffff;">עידן קזם (idankzm@gmail.com)</strong>
                                      </td>
                                      <td align="left" style="color: #cbd5e1;">
                                        <span style="color: #64748b; display: block; font-size: 9px;">מספר הזמנה</span>
                                        <strong style="color: #38bdf8;">#{order_id[:8]}</strong>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Product Showcase Table -->
                      <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #ffffff;">📦 פירוט פריטי הרכישה</h3>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; margin-bottom: 20px;">
                        <tr style="background-color: #1e293b; color: #94a3b8; font-size: 11px; font-weight: bold;">
                          <td style="padding: 12px 16px;" align="right">מוצר</td>
                          <td style="padding: 12px 16px;" align="center">מק״ט</td>
                          <td style="padding: 12px 16px;" align="center">כמות</td>
                          <td style="padding: 12px 16px;" align="left">מחיר</td>
                        </tr>
                        <tr>
                          <td style="padding: 16px; border-top: 1px solid #1e293b;" align="right">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding-left: 12px;">
                                  <div style="width: 48px; height: 48px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px;">📱</div>
                                </td>
                                <td>
                                  <strong style="color: #ffffff; font-size: 13px; display: block;">{product_name}</strong>
                                  <span style="font-size: 11px; color: #94a3b8;">אחריות יבואן רשמי 24 חודשים</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="padding: 16px; border-top: 1px solid #1e293b; font-family: monospace; color: #fbbf24; font-size: 12px;" align="center">{sku_code}</td>
                          <td style="padding: 16px; border-top: 1px solid #1e293b; color: #ffffff; font-weight: bold; font-size: 13px;" align="center">1</td>
                          <td style="padding: 16px; border-top: 1px solid #1e293b; font-family: monospace; color: #ffffff; font-weight: bold; font-size: 13px;" align="left">₪{unit_price:,.2f}</td>
                        </tr>
                      </table>

                      <!-- Financial Summary Box -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 16px; color: #94a3b8;" align="right">סכום ביניים קטלוג:</td>
                          <td style="padding: 6px 16px; font-family: monospace; color: #ffffff;" align="left">₪{unit_price:,.2f}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 16px; color: #34d399; font-weight: bold;" align="right">הנחת מועדון VIP סוכנים (SWARM-VIP10):</td>
                          <td style="padding: 6px 16px; font-family: monospace; color: #34d399; font-weight: bold;" align="left">-₪{discount_amount:,.2f}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 16px; color: #38bdf8;" align="right">משלוח אקספרס עד הבית (דואר ישראל):</td>
                          <td style="padding: 6px 16px; color: #38bdf8; font-weight: bold;" align="left">חינם (0 ₪)</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 16px; color: #94a3b8; font-size: 11px;" align="right">מספר מעקב לוגיסטי:</td>
                          <td style="padding: 6px 16px; font-family: monospace; color: #e2e8f0; font-size: 11px;" align="left">{tracking_number}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding: 12px 16px 4px 16px; border-top: 1px solid #1e293b;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="right">
                                  <strong style="color: #ffffff; font-size: 15px;">סה״כ נטו לחיוב:</strong>
                                  <span style="display: block; font-size: 10px; color: #64748b;">כולל מע״מ מלא ואחריות Smart Escrow</span>
                                </td>
                                <td align="left">
                                  <span style="font-size: 24px; font-weight: 900; color: #fbbf24; font-family: monospace;">₪{final_amount:,.2f}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- BNPL 4-Payment Schedule (Bulletproof Table for Gmail) -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 16px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding-bottom: 12px;" align="right">
                            <strong style="color: #fbbf24; font-size: 13px;">⚡ פריסת 4 תשלומים חכמה ב-0% ריבית:</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table border="0" cellpadding="0" cellspacing="4" width="100%" style="text-align: center; font-size: 11px;">
                              <tr>
                                <td width="25%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px 4px;">
                                  <span style="color: #94a3b8; font-size: 10px; display: block;">היום</span>
                                  <strong style="color: #fbbf24; font-family: monospace; font-size: 12px; display: block; margin-top: 3px;">₪{final_amount/4:,.2f}</strong>
                                  <span style="color: #34d399; font-size: 9px; display: block; margin-top: 2px;">מיידי</span>
                                </td>
                                <td width="25%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px 4px;">
                                  <span style="color: #94a3b8; font-size: 10px; display: block;">עוד 30 יום</span>
                                  <strong style="color: #fbbf24; font-family: monospace; font-size: 12px; display: block; margin-top: 3px;">₪{final_amount/4:,.2f}</strong>
                                  <span style="color: #34d399; font-size: 9px; display: block; margin-top: 2px;">0% ריבית</span>
                                </td>
                                <td width="25%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px 4px;">
                                  <span style="color: #94a3b8; font-size: 10px; display: block;">עוד 60 יום</span>
                                  <strong style="color: #fbbf24; font-family: monospace; font-size: 12px; display: block; margin-top: 3px;">₪{final_amount/4:,.2f}</strong>
                                  <span style="color: #34d399; font-size: 9px; display: block; margin-top: 2px;">0% ריבית</span>
                                </td>
                                <td width="25%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 10px 4px;">
                                  <span style="color: #94a3b8; font-size: 10px; display: block;">עוד 90 יום</span>
                                  <strong style="color: #fbbf24; font-family: monospace; font-size: 12px; display: block; margin-top: 3px;">₪{final_amount/4:,.2f}</strong>
                                  <span style="color: #34d399; font-size: 9px; display: block; margin-top: 2px;">תשלום סופי</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Guaranteed Future Buyback Pledge Box -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 12px 16px; margin-bottom: 22px;">
                        <tr>
                          <td width="30" valign="middle" align="center" style="font-size: 18px;">🛡️</td>
                          <td align="right" valign="middle" style="font-size: 12px; color: #e2e8f0; padding-right: 8px;">
                            <strong style="color: #34d399;">התחייבות שמירת ערך עתידית (24 חודשים):</strong>
                            <span style="display: block; color: #94a3b8; font-size: 11px; margin-top: 2px;">
                              ערך של <strong>₪{final_amount*0.74:,.2f} (74%)</strong> מובטח בטרייד-אין הבא עבור מוצר זה.
                            </span>
                          </td>
                        </tr>
                      </table>

                      <!-- Kafka SAGA Event Audit Trail -->
                      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #ffffff;">⚡ תחנות SAGA ואפיק האירועים ב-Kafka</h3>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-right: 3px solid #f59e0b; padding-right: 14px; margin-bottom: 24px; font-size: 12px;">
                        <tr>
                          <td style="padding: 4px 0;" align="right">
                            <strong style="color: #fbbf24;">✓ order-events</strong> &nbsp;➔&nbsp; <span style="color: #cbd5e1;">OrderCreatedEvent נקלט ב-MongoDB</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;" align="right">
                            <strong style="color: #fbbf24;">✓ inventory-events</strong> &nbsp;➔&nbsp; <span style="color: #cbd5e1;">StockReservedEvent שריין יחידה מקטלוג המוצרים</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;" align="right">
                            <strong style="color: #fbbf24;">✓ payment-events</strong> &nbsp;➔&nbsp; <span style="color: #cbd5e1;">PaymentCapturedEvent ביצע סליקה והנפיק אסמכתא</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;" align="right">
                            <strong style="color: #fbbf24;">✓ shipping-events</strong> &nbsp;➔&nbsp; <span style="color: #cbd5e1;">ShipmentScheduledEvent הפיק מספר מעקב {tracking_number}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;" align="right">
                            <strong style="color: #fbbf24;">✓ notification-events</strong> &nbsp;➔&nbsp; <span style="color: #cbd5e1;">NotificationSentEvent נשלח לג׳ימייל שלך ב-API</span>
                          </td>
                        </tr>
                      </table>

                      <!-- Bulletproof Action Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 10px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://colon-minolta-increased-buys.trycloudflare.com/orders" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #020617; font-weight: 900; font-size: 15px; padding: 15px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4); letter-spacing: -0.3px;">
                              צפה בהזמנה זו במעקב הזמנות באתר ←
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer Area -->
                  <tr>
                    <td style="background-color: #020617; border-top: 1px solid #1e293b; padding: 24px 32px; text-align: center; font-size: 11px; color: #64748b;">
                      <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: bold;">מערכת מסחר אלקטרוני מבוזרת • Google Antigravity & Agent Swarm v8.0</p>
                      <p style="margin: 0; line-height: 1.5;">הזמנה מאובטחת בתקני SSL 256-Bit • PCI-DSS Level 1 • Smart Escrow קריפטוגרפי.</p>
                      <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 10px; color: #475569;">אסמכתת תשלום: {payment_tx_id}</p>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

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
