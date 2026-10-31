package com.company.workspace.mcp;

/**
 * A logical tool failure returned by the MCP server (e.g. invalid arguments, resource not found).
 * Excluded from automatic retries to prevent retry storms.
 */
public class McpToolException extends RuntimeException {
    public McpToolException(String tool, String details) {
        super("MCP tool '" + tool + "' returned an error: " + details);
    }
}
