FROM python:3.12-slim
RUN pip install --no-cache-dir uv
WORKDIR /app
ENV WORKSPACE_MCP_HOST=0.0.0.0
ENV FASTMCP_HOST=0.0.0.0
ENV WORKSPACE_MCP_PORT=8000
ENV FASTMCP_PORT=8000
EXPOSE 8000
CMD ["uvx", "workspace-mcp", "--transport", "streamable-http", "--tools", "drive", "calendar", "gmail"]
