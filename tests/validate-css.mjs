import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const files = [];
for (const dir of fs.readdirSync(path.join(root, "styles"))) {
  for (const f of fs.readdirSync(path.join(root, "styles", dir))) {
    if (f.endsWith(".css")) files.push(`styles/${dir}/${f}`);
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<!doctype html><title>css</title>");

const problems = [];
for (const rel of files) {
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  const result = await page.evaluate(async (css) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    const out = { ruleCount: sheet.cssRules.length, badSelectors: [], droppedDecls: [] };
    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.cssRules) walk(rule.cssRules);
        if (!(rule instanceof CSSStyleRule)) continue;
        // The parser silently drops declarations it cannot understand, so the
        // serialized declaration count is the ground truth.
        const declared = rule.style.length;
        if (declared === 0) out.badSelectors.push(rule.selectorText);
        out.droppedDecls.push({ selector: rule.selectorText, declared });
      }
    };
    walk(sheet.cssRules);
    return out;
  }, text);

  // count source-level rule blocks and declarations to compare
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const sourceBlocks = [...stripped.matchAll(/\{[^{}]*\}/g)];
  // Chromium collapses vendor aliases and repeated properties (deliberate
  // fallbacks such as `background-color` twice) into a single entry, so compare
  // unique property names per block rather than raw declaration counts.
  const sourceDeclCount = sourceBlocks.reduce((n, m) => {
    const props = m[0]
      .split(";")
      .map((decl) => decl.split(":")[0]?.trim().toLowerCase())
      .filter((prop) => prop && /^[-a-z]+$/.test(prop))
      .map((prop) => prop.replace(/^-webkit-/, ""));
    return n + new Set(props).size;
  }, 0);
  const parsedDeclCount = result.droppedDecls.reduce((n, d) => n + d.declared, 0);
  const openBraces = (stripped.match(/\{/g) || []).length;
  const closeBraces = (stripped.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    problems.push(`${rel}: unbalanced braces (${openBraces} open / ${closeBraces} close)`);
  }
  if (result.ruleCount === 0) {
    problems.push(`${rel}: parsed to zero rules`);
  }
  if (result.droppedDecls.length < sourceBlocks.length) {
    problems.push(
      `${rel}: ${sourceBlocks.length - result.droppedDecls.length} rule(s) dropped — ` +
        `invalid selector (source ${sourceBlocks.length}, parsed ${result.droppedDecls.length})`
    );
  }
  if (result.badSelectors.length) {
    problems.push(`${rel}: rules with no valid declarations -> ${result.badSelectors.join(" | ")}`);
  }
  if (parsedDeclCount < sourceDeclCount) {
    problems.push(
      `${rel}: ${sourceDeclCount - parsedDeclCount} declaration(s) dropped by the parser ` +
        `(source ${sourceDeclCount}, parsed ${parsedDeclCount})`
    );
  }
}

await browser.close();

if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log(" -", p);
} else {
  console.log(`OK: ${files.length} stylesheets parse cleanly`);
}
