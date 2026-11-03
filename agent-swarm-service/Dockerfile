FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ecommerce_agent_swarm.py .
EXPOSE 8093
CMD ["uvicorn", "ecommerce_agent_swarm:app", "--host", "0.0.0.0", "--port", "8093"]
