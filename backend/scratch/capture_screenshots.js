import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = "http://localhost:5173";
const OUTPUT_DIR = path.resolve(process.cwd(), "../admin_screenshots");

const routes = [
  { name: 'login', path: '/login', requiresAuth: false },
  { name: 'admin-dashboard', path: '/admin/dashboard', role: 'school' },
  { name: 'admin-analytics', path: '/admin/analytics', role: 'school' },
  { name: 'admin-fees', path: '/admin/fees', role: 'school' },
  { name: 'admin-directory', path: '/admin/directory', role: 'school' },
  { name: 'admin-bulk-seeder', path: '/admin/bulk-seeder', role: 'school' },
  { name: 'admin-classes', path: '/admin/classes', role: 'school' },
  { name: 'admin-subjects', path: '/admin/subjects', role: 'school' },
  { name: 'admin-teachers', path: '/admin/teachers', role: 'school' },
  { name: 'admin-students', path: '/admin/students', role: 'school' },
  { name: 'admin-login-roster', path: '/admin/login-roster', role: 'school' },
  { name: 'admin-approvals', path: '/admin/approvals', role: 'school' },
  { name: 'admin-assignments', path: '/admin/assignments', role: 'school' },
  { name: 'admin-timetables', path: '/admin/timetables', role: 'school' },
  { name: 'admin-timetables-substitutions', path: '/admin/timetables/substitutions', role: 'school' },
  { name: 'admin-transport', path: '/admin/transport', role: 'school' },
  { name: 'admin-notifications', path: '/admin/notifications', role: 'school' },
  { name: 'admin-exams', path: '/admin/exams', role: 'school' },
  { name: 'admin-academic-year', path: '/admin/academic-year', role: 'school' },
  { name: 'admin-audit-logs', path: '/admin/audit-logs', role: 'school' },
  { name: 'admin-lost-found', path: '/admin/lost-found', role: 'school' },
  { name: 'admin-feedback', path: '/admin/feedback', role: 'school' },
  { name: 'admin-library', path: '/admin/library', role: 'school' },
  { name: 'admin-about', path: '/admin/about', role: 'school' },
  { name: 'super-admin', path: '/super-admin', role: 'superadmin' },
];

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function login(username, password) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[placeholder*="username" i], input[type="text"]', username);
    await page.type('input[placeholder*="password" i], input[type="password"]', password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
    ]);
    await new Promise(r => setTimeout(r, 1500));
  }

  // 1. Login Page
  console.log("Capturing login page...");
  const loginFolder = path.join(OUTPUT_DIR, 'login');
  fs.mkdirSync(loginFolder, { recursive: true });
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.setViewport({ width: 1920, height: 1080 });
  await page.screenshot({ path: path.join(loginFolder, 'desktop.png') });
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(loginFolder, 'mobile.png') });

  await page.setViewport({ width: 1920, height: 1080 });
  await page.type('input[type="text"]', 'school');
  await page.type('input[type="password"]', 'school123');
  await page.screenshot({ path: path.join(loginFolder, 'forms.png') });

  // 2. School Admin routes
  console.log("Logging in as School Admin...");
  await login('school', 'school123');

  for (const r of routes.filter(x => x.role === 'school')) {
    const routeFolder = path.join(OUTPUT_DIR, r.name);
    fs.mkdirSync(routeFolder, { recursive: true });

    try {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'networkidle2' });
      await new Promise(res => setTimeout(res, 1200));

      // Desktop
      await page.setViewport({ width: 1920, height: 1080 });
      await page.screenshot({ path: path.join(routeFolder, 'desktop.png') });

      // Mobile
      await page.setViewport({ width: 375, height: 812 });
      await page.screenshot({ path: path.join(routeFolder, 'mobile.png') });

      // Modals / forms
      await page.setViewport({ width: 1920, height: 1080 });
      const addButtons = await page.$$('button');
      for (const btn of addButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('Add') || text.includes('Create') || text.includes('Filter') || text.includes('New'))) {
          await btn.click().catch(() => {});
          await new Promise(res => setTimeout(res, 600));
          await page.screenshot({ path: path.join(routeFolder, 'modals.png') }).catch(() => {});
          break;
        }
      }
      console.log(`Captured ${r.name}`);
    } catch (e) {
      console.error(`Error on ${r.name}:`, e.message);
    }
  }

  // 3. Super Admin
  console.log("Logging in as Super Admin...");
  await login('superadmin', 'admin123');
  const superAdminFolder = path.join(OUTPUT_DIR, 'super-admin');
  fs.mkdirSync(superAdminFolder, { recursive: true });
  await page.goto(`${BASE_URL}/super-admin`, { waitUntil: 'networkidle2' });
  await page.setViewport({ width: 1920, height: 1080 });
  await page.screenshot({ path: path.join(superAdminFolder, 'desktop.png') });
  await page.setViewport({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(superAdminFolder, 'mobile.png') });

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch(console.error);
