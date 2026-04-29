import { chromium } from "playwright";

const BASE_URL = process.env.DEMO_BASE_URL || "http://localhost:5174";
const API_URL = process.env.DEMO_API_URL || "http://127.0.0.1:8000";
const DEMO_EMAIL = "student1@bits.com";
const DEMO_PASSWORD = "Test@123";

const pause = async (page, ms = 900) => {
  await page.waitForTimeout(ms);
};

async function ensureDemoUser() {
  const payload = {
    name: "Student One",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: "student",
  };
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status !== 400) {
      const text = await res.text();
      throw new Error(`Failed to ensure demo user: ${res.status} ${text}`);
    }
  } catch (error) {
    throw new Error(`Demo user bootstrap failed: ${error.message}`);
  }
}

async function run() {
  await ensureDemoUser();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: "demo-videos",
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await pause(page, 1200);

  const authCard = page.locator(".auth-card");
  await authCard.locator('input[type="email"]').fill(DEMO_EMAIL);
  await authCard.locator('input[type="password"]').fill(DEMO_PASSWORD);
  await pause(page);
  await page.getByRole("button", { name: "Login" }).click();
  try {
    await page.waitForURL("**/dashboard", { timeout: 8000 });
  } catch (_error) {
    const maybeError = await page.locator(".error").first().textContent().catch(() => "");
    throw new Error(`Login did not navigate to dashboard. URL: ${page.url()} Error: ${maybeError || "none"}`);
  }
  await pause(page, 1200);

  const addTopicCard = page.locator("section.card", { has: page.getByRole("heading", { name: "Add Syllabus Topic" }) });
  await addTopicCard.locator("input").nth(0).fill("OS");
  await addTopicCard.locator("input").nth(1).fill("Deadlock Prevention");
  await addTopicCard.locator('input[type="date"]').fill("2026-05-05");
  await addTopicCard.locator('input[type="number"]').fill("3");
  await pause(page);
  await page.getByRole("button", { name: "Add Topic" }).click();
  await pause(page, 1200);

  await page.getByRole("button", { name: "Generate AI Weekly Plan" }).click();
  await pause(page, 1200);

  const completeButtons = page.getByRole("button", { name: "Complete" });
  if ((await completeButtons.count()) > 0) {
    await completeButtons.first().click();
    await pause(page, 1000);
  }

  const doubtCard = page.locator("section.card", { has: page.getByRole("heading", { name: "Raise Doubt" }) });
  const topicSelect = doubtCard.locator("select");
  if ((await topicSelect.count()) > 0) {
    await topicSelect.selectOption({ index: 1 }).catch(async () => {
      await topicSelect.selectOption({ value: "" });
    });
  }
  await doubtCard.locator("input").first().fill("Need help with deadlock conditions");
  await doubtCard
    .locator("textarea")
    .first()
    .fill("Please explain Coffman conditions with a simple real-world example.");
  await pause(page);
  await page.getByRole("button", { name: "Submit Doubt" }).click();
  await pause(page, 1000);

  const aiLogCard = page.locator("section.card", { has: page.getByRole("heading", { name: "AI Usage Log (DB)" }) });
  await aiLogCard.scrollIntoViewIfNeeded();
  await pause(page, 700);

  await aiLogCard.locator("input").nth(0).fill("Cursor");
  await aiLogCard.locator("textarea").nth(0).fill("Generate topic CRUD and improve dashboard UI.");
  await aiLogCard.locator("textarea").nth(1).fill("Generated API updates and refreshed React styling.");
  await aiLogCard.locator("textarea").nth(2).fill("Reviewed output, tested, and merged relevant changes.");
  await aiLogCard.locator("input").nth(1).fill("backend/app/main.py, frontend/src/App.jsx");
  await aiLogCard.locator("textarea").nth(3).fill("Kept implementation simple for assignment scope.");
  await pause(page, 800);
  await aiLogCard.getByRole("button", { name: "Save AI Log" }).click();
  await pause(page, 1200);

  const savedCard = page.locator("section.card", { has: page.getByRole("heading", { name: "Saved AI Logs" }) });
  await savedCard.scrollIntoViewIfNeeded();
  await pause(page, 700);
  await savedCard.getByRole("button", { name: "Generate Markdown Export" }).click();
  await pause(page, 1000);
  await savedCard.getByRole("button", { name: "Copy Export" }).click();
  await pause(page, 1000);

  const video = page.video();
  await context.close();
  await browser.close();

  const path = await video.path();
  console.log(`Demo video created at: ${path}`);
}

run().catch((err) => {
  console.error("Failed to create demo video:", err);
  process.exit(1);
});
