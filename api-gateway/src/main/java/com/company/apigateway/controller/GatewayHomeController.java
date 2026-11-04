package com.company.apigateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
public class GatewayHomeController {

    @Value("${STORE_FRONTEND_URL:https://web-client.onrender.com}")
    private String storefrontUrl;

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public Mono<ResponseEntity<String>> getHomePage() {
        String html = """
            <!DOCTYPE html>
            <html lang="he" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>E-Commerce Microservices Platform — API Gateway</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg-color: #0b0f19;
                        --card-bg: #111827;
                        --card-border: #1f2937;
                        --primary: #6366f1;
                        --primary-hover: #4f46e5;
                        --accent: #10b981;
                        --text-main: #f9fafb;
                        --text-muted: #9ca3af;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                        font-family: 'Assistant', -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    body {
                        background-color: var(--bg-color);
                        color: var(--text-main);
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        direction: rtl;
                        text-align: right;
                    }
                    .container {
                        max-width: 900px;
                        width: 100%;
                        background: var(--card-bg);
                        border: 1px solid var(--card-border);
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(16, 185, 129, 0.1);
                        color: var(--accent);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        padding: 6px 16px;
                        border-radius: 9999px;
                        font-size: 0.9rem;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }
                    .badge-dot {
                        width: 10px;
                        height: 10px;
                        background-color: var(--accent);
                        border-radius: 50%;
                        box-shadow: 0 0 10px var(--accent);
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                    h1 {
                        font-size: 2.2rem;
                        font-weight: 800;
                        margin-bottom: 12px;
                        background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    p.subtitle {
                        color: var(--text-muted);
                        font-size: 1.1rem;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                        gap: 16px;
                        margin-bottom: 30px;
                    }
                    .card {
                        background: rgba(31, 41, 55, 0.5);
                        border: 1px solid var(--card-border);
                        border-radius: 12px;
                        padding: 20px;
                        transition: transform 0.2s, border-color 0.2s;
                    }
                    .card:hover {
                        transform: translateY(-2px);
                        border-color: var(--primary);
                    }
                    .card h3 {
                        font-size: 1.1rem;
                        font-weight: 700;
                        margin-bottom: 8px;
                        color: #ffffff;
                    }
                    .card p {
                        font-size: 0.9rem;
                        color: var(--text-muted);
                        line-height: 1.5;
                    }
                    .actions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                        margin-top: 20px;
                    }
                    a.btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 700;
                        text-decoration: none;
                        transition: all 0.2s;
                        cursor: pointer;
                    }
                    a.btn-primary {
                        background-color: var(--primary);
                        color: #ffffff;
                    }
                    a.btn-primary:hover {
                        background-color: var(--primary-hover);
                        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                    }
                    a.btn-secondary {
                        background: #1f2937;
                        color: var(--text-main);
                        border: 1px solid #374151;
                    }
                    a.btn-secondary:hover {
                        background: #374151;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid var(--card-border);
                        font-size: 0.85rem;
                        color: var(--text-muted);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                    }
                    code {
                        direction: ltr;
                        unicode-bidi: embed;
                        background: rgba(0,0,0,0.4);
                        padding: 2px 6px;
                        border-radius: 4px;
                        color: #a5b4fc;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">
                        <span class="badge-dot"></span>
                        <span>API Gateway פעיל ומחובר ברשת (Online)</span>
                    </div>
                    <h1>מרכז השירותים של פלטפורמת האיקומרס</h1>
                    <p class="subtitle">
                        שרת ה-API Gateway המרכזי פועל כעת בהצלחה ב-Render על גבי <code>Java 21</code> ו-<code>Spring Cloud Gateway</code> עם <code>Virtual Threads</code>. שרת זה מנתב בקשות ל-16 שירותי המיקרו-סרוויס של המערכת.
                    </p>

                    <div class="grid">
                        <div class="card">
                            <h3>🛒 אתר החנות (Storefront)</h3>
                            <p>ממשק ה-UI הגרפי של החנות בנוי ב-Next.js 14 וזמין ב-<code>web-client</code>. יש לפרוס אותו כשירות Web Service נפרד כדי לצפות באתר החנות המלא.</p>
                        </div>
                        <div class="card">
                            <h3>🛡️ בקרת ניתוב ואבטחה</h3>
                            <p>אימות טוקנים מבוזר ב-<code>JWT</code>, הגבלת קצב בקשות ב-<code>Redis Rate Limiting</code>, ורישום פעולות ב-Distributed Tracing.</p>
                        </div>
                        <div class="card">
                            <h3>🔍 בדיקת תקינות מערכת</h3>
                            <p>ניטור רציף של שרתי המיקרו דרך <code>Spring Boot Actuator</code> לבדיקת זמינות, מדדים ו-Prometheus Metrics.</p>
                        </div>
                    </div>

                    <div class="actions">
                        <a href="/actuator/health" class="btn btn-primary" target="_blank">
                            📊 בדיקת תקינות (/actuator/health)
                        </a>
                        <a href="/api/v1/products" class="btn btn-secondary" target="_blank">
                            📦 נקודת קצה לדוגמה (/api/v1/products)
                        </a>
                    </div>

                    <div class="footer">
                        <span>סביבת ענן: <strong>Render (Production)</strong></span>
                        <span>גרסת פלטפורמה: <strong>v6.0 Enterprise</strong></span>
                    </div>
                </div>
            </body>
            </html>
            """;
        return Mono.just(ResponseEntity.ok(html));
    }

    @GetMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Map<String, Object>>> getApiInfo() {
        return Mono.just(ResponseEntity.ok(Map.of(
            "status", "UP",
            "gateway", "api-gateway",
            "runtime", "Java 21 Virtual Threads (Temurin)",
            "microservicesRouted", 16,
            "version", "0.0.1-SNAPSHOT"
        )));
    }
}
