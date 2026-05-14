import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
const executablePath =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await fs.mkdir("tmp/screenshots", { recursive: true });

async function verifyPage(path, expected) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await assertVisible(expected);
}

async function assertVisible(text) {
  await page.getByText(text, { exact: false }).waitFor({ state: "visible", timeout: 10_000 });
}

await verifyPage("/login", "Tennis Tracker");
await verifyPage("/dashboard", "Coaching package");
await page.screenshot({ path: "tmp/screenshots/dashboard-desktop.png", fullPage: true });

await verifyPage("/sessions", "Coaching sessions consume package credits");
await verifyPage("/sessions/new", "Post-session self-rating");
await page.getByRole("button", { name: "Save session" }).click();
await assertVisible("Post-session self-rating");

await verifyPage("/coach", "Pending sessions");
await page.locator('a[href^="/coach/sessions/"]').first().click();
await assertVisible("8-skill coach rating");
await page.getByRole("button", { name: "Submit coach rating" }).click();

await verifyPage("/matches", "Competitive record");
await verifyPage("/matches/new", "Match results are independent");
await page.getByRole("button", { name: "Save match" }).click();

await verifyPage("/packages", "Package history");
await verifyPage("/goals", "Goal list");
await verifyPage("/drills", "Drill library");
await verifyPage("/charts", "Overall rating trend");
await verifyPage("/collection", "collection progress");
await page.screenshot({ path: "tmp/screenshots/collection-desktop.png", fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await verifyPage("/dashboard", "Coaching package");
await page.screenshot({ path: "tmp/screenshots/dashboard-mobile.png", fullPage: true });

assert.equal(errors.length, 0, `Browser console/page errors:\n${errors.join("\n")}`);
await browser.close();

console.log("Verified player dashboard, session logging, coach rating, matches, packages, goals, drills, charts, collection, and mobile dashboard.");
