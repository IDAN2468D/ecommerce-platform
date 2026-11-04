#!/bin/sh
set -e

echo "=================================================="
echo "🚀 Starting Unified E-Commerce Platform Container"
echo "=================================================="

# Set internal gateway URL and public port
export GATEWAY_URL="http://127.0.0.1:8080"
export NEXT_PUBLIC_GATEWAY_URL="http://127.0.0.1:8080"
export PORT="${PORT:-10000}"

# JVM memory parameters tuned for container budget (max 220MB heap)
JAVA_OPTS="${JAVA_OPTS:--Xms96m -Xmx220m -XX:+UseSerialGC -Dspring.threads.virtual.enabled=true -Dserver.port=8080}"

echo "⏳ [1/2] Starting Spring Cloud Gateway on port 8080..."
java $JAVA_OPTS -jar /app/gateway.jar &
GATEWAY_PID=$!

echo "🌐 [2/2] Starting Next.js Storefront on public port ${PORT}..."
cd /app/web-client
./node_modules/.bin/next start -p "${PORT}" &
NEXT_PID=$!

# Trap termination signals
trap "kill -TERM $GATEWAY_PID $NEXT_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Loop while both processes are alive
while kill -0 $GATEWAY_PID 2>/dev/null && kill -0 $NEXT_PID 2>/dev/null; do
    sleep 2
done

echo "⚠️ One of the platform services stopped. Exiting container."
kill -TERM $GATEWAY_PID $NEXT_PID 2>/dev/null
exit 1
