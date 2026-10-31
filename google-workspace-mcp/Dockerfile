FROM python:3.12-slim
RUN pip install --no-cache-dir uv
WORKDIR /app
EXPOSE 8000
CMD ["uvx", "workspace-mcp", "--transport", "streamable-http", "--tools", "drive", "calendar"]
