#!/usr/bin/env node
// Tiny zero-dependency local proxy: serves index.html and forwards chat to NanoGPT,
// injecting the API key from auth.mjs so it never touches the browser.
//
//   browser  ->  POST /api/chat  ->  this server (adds key)  ->  nano-gpt.com (stream)
//
// Run: NANOGPT_API_KEY=sk-nano-... npm start    (or: node server.mjs)

import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";
import { buildEnvironment, generateDiff, smartapply } from "gptdiff-js";
import { getApiKey } from "./auth.mjs";

const MODEL = process.env.NANOGPT_MODEL || "xiaomi/mimo-v2.5-pro-ultraspeed";
const PORT = Number(process.env.PORT || 8787);
const ROOT = dirname(fileURLToPath(import.meta.url));
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript" };

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/chat") return await chat(req, res);
    return await serveStatic(req, res);
  } catch (e) {
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
});

// gptdiff flow: diff the existing files against the goal, smartapply, return the new files.
//   request:  { goal: string, files: { [path]: content } }
//   response: { diff: string, files: { [path]: content } }
async function chat(req, res) {
  const { goal, prompt, files } = JSON.parse((await readBody(req)) || "{}");
  const instruction = goal || prompt || "";
  if (!instruction) throw new Error("missing 'goal'");
  if (!files || typeof files !== "object" || !Object.keys(files).length) throw new Error("missing 'files'");

  const opts = { apiKey: await getApiKey(), model: MODEL };
  const diff = await generateDiff(buildEnvironment(files), instruction, opts); // existing -> diff
  const updated = await smartapply(diff, files, opts);                          // diff -> new files

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ diff, files: updated }));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function serveStatic(req, res) {
  const rel = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const path = join(ROOT, normalize(rel).replace(/^(\.\.[/\\])+/, "")); // prevent traversal
  try {
    const data = await readFile(path);
    res.writeHead(200, { "Content-Type": TYPES[path.slice(path.lastIndexOf("."))] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

server.listen(PORT, () => {
  console.log(`NanoGPT proxy → http://localhost:${PORT}`);
  console.log(`Model: ${MODEL}   Auth: ${process.env.NANOGPT_AUTH || "env"}`);
});
