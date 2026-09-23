#!/usr/bin/env node
/**
 * Local stdio-to-HTTP proxy for Google Stitch MCP.
 * Forwards JSON-RPC to https://stitch.googleapis.com/mcp and strips
 * `outputSchema` from tools/list so Cursor can register the tools.
 */
import { request } from "node:https";
import { Buffer } from "node:buffer";

const API_KEY = process.env.STITCH_API_KEY;
const STITCH_URL = process.env.STITCH_MCP_URL || "https://stitch.googleapis.com/mcp";

if (!API_KEY) {
  process.stderr.write("STITCH_API_KEY env var is required\n");
  process.exit(1);
}

let sessionId = null;

function log(message) {
  process.stderr.write(`[stitch-proxy] ${message}\n`);
}

function postToStitch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(STITCH_URL);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(data),
      "X-Goog-Api-Key": API_KEY,
    };
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers,
    };

    const req = request(opts, (res) => {
      const nextSession = res.headers["mcp-session-id"];
      if (typeof nextSession === "string" && nextSession) {
        sessionId = nextSession;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        const contentType = String(res.headers["content-type"] || "");
        try {
          resolve(parseMcpHttpBody(contentType, raw, res.statusCode));
        } catch (err) {
          reject(
            new Error(
              `HTTP ${res.statusCode} parse error: ${err.message}; body=${raw.slice(0, 300)}`
            )
          );
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function parseMcpHttpBody(contentType, raw, statusCode) {
  const ct = contentType.toLowerCase();
  if (ct.includes("text/event-stream")) {
    const events = [];
    for (const line of raw.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      events.push(JSON.parse(payload));
    }
    const message =
      events.find((event) => event && (event.result || event.error)) ||
      events[events.length - 1];
    if (!message) {
      throw new Error(`empty SSE body (HTTP ${statusCode})`);
    }
    return message;
  }

  if (!raw) {
    throw new Error(`empty HTTP ${statusCode} body`);
  }
  return JSON.parse(raw);
}

function stripOutputSchema(response) {
  const tools = response?.result?.tools;
  if (!Array.isArray(tools)) return response;

  response.result.tools = tools.map((tool) => {
    if (!tool || typeof tool !== "object") return tool;
    const { outputSchema, ...rest } = tool;
    return rest;
  });
  return response;
}

function writeMessage(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

function writeError(id, err) {
  writeMessage({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code: -32603, message: String(err?.message || err) },
  });
}

async function handleMessage(msg) {
  if (!msg || typeof msg !== "object") return;

  if (msg.id === undefined) {
    postToStitch(msg).catch((err) => {
      log(`notification ${msg.method || "unknown"} failed: ${err.message}`);
    });
    return;
  }

  try {
    let response = await postToStitch(msg);
    if (msg.method === "tools/list") {
      const before = Array.isArray(response?.result?.tools)
        ? response.result.tools.length
        : 0;
      response = stripOutputSchema(response);
      log(`tools/list: stripped outputSchema from ${before} tools`);
    } else if (msg.method === "initialize") {
      const serverName = response?.result?.serverInfo?.name || "unknown";
      log(`initialize: connected to ${serverName} via ${STITCH_URL}`);
    }
    if (response && typeof response === "object" && response.id === undefined) {
      response.id = msg.id;
    }
    writeMessage(response);
  } catch (err) {
    writeError(msg.id, err);
  }
}

let stdinBuffer = Buffer.alloc(0);

function consumeStdin() {
  while (true) {
    const headerEnd = stdinBuffer.indexOf("\r\n\r\n");
    if (headerEnd !== -1) {
      const header = stdinBuffer.slice(0, headerEnd).toString("utf8");
      const lengthMatch = header.match(/Content-Length:\s*(\d+)/i);
      if (lengthMatch) {
        const length = Number(lengthMatch[1]);
        const start = headerEnd + 4;
        if (stdinBuffer.length < start + length) return;
        const body = stdinBuffer.slice(start, start + length).toString("utf8");
        stdinBuffer = stdinBuffer.slice(start + length);
        dispatch(body);
        continue;
      }
    }

    const newline = stdinBuffer.indexOf("\n");
    if (newline === -1) return;
    const line = stdinBuffer.slice(0, newline).toString("utf8").trim();
    stdinBuffer = stdinBuffer.slice(newline + 1);
    if (!line || /^Content-Length:/i.test(line)) continue;
    dispatch(line);
  }
}

function dispatch(raw) {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    log(`ignored non-JSON stdin: ${raw.slice(0, 120)}`);
    return;
  }
  handleMessage(msg);
}

process.stdin.on("data", (chunk) => {
  stdinBuffer = Buffer.concat([stdinBuffer, chunk]);
  consumeStdin();
});

process.stdin.on("end", () => process.exit(0));
process.stdin.resume();

log(`proxy ready; forwarding to ${STITCH_URL}`);
