// Quick connectivity check: npm run check:openai
// Reads .env.local, then asks OpenAI for the model list (free, no image is generated).
import OpenAI from "openai";
import { existsSync, readFileSync } from "node:fs";
import { ProxyAgent } from "undici";

// Load .env and .env.local the same way Next.js does (.env.local wins; real env vars win over both).
const fromFiles = {};
for (const file of [".env", ".env.local"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m) fromFiles[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
for (const [k, v] of Object.entries(fromFiles)) if (process.env[k] === undefined) process.env[k] = v;

const key = process.env.OPENAI_API_KEY;
const proxy = process.env.OPENAI_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy;
const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";

if (!key) {
  console.log("✗ 没有读到 OPENAI_API_KEY。请确认项目根目录有 .env.local，且里面写的是 OPENAI_API_KEY=sk-...");
  process.exit(1);
}
console.log(`• OPENAI_API_KEY 已读取（${key.slice(0, 7)}…）`);
console.log(`• 代理：${proxy ?? "未设置"}`);
console.log(`• 图像模型：${model}`);

const client = new OpenAI({
  timeout: 20_000,
  maxRetries: 0,
  ...(proxy ? { fetchOptions: { dispatcher: new ProxyAgent(proxy) } } : {}),
});

try {
  const started = Date.now();
  const models = [];
  for await (const m of client.models.list()) models.push(m.id);
  console.log(`✓ 连上了 OpenAI（${Date.now() - started} ms），账号可用模型 ${models.length} 个`);
  console.log(models.includes(model) ? `✓ 可以使用 ${model}` : `✗ 这个账号的模型列表里没有 ${model}，可在 .env.local 设置 OPENAI_IMAGE_MODEL`);
} catch (err) {
  if (err instanceof OpenAI.AuthenticationError) console.log("✗ key 无效（401）");
  else if (err instanceof OpenAI.APIConnectionError)
    console.log(`✗ 连不上 OpenAI：${err.cause?.message ?? err.message}${proxy ? "\n  请检查代理地址和端口" : "\n  如果在国内，请在 .env.local 加一行 HTTPS_PROXY=http://127.0.0.1:端口（你的代理软件的 HTTP 端口）"}`);
  else console.log(`✗ ${err.message}`);
  process.exit(1);
}
