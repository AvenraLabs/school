/**
 * Library overdue WhatsApp reminder cron job.
 * Runs daily at 8 AM server time.
 * Only sends messages to schools with library_overdue_whatsapp_enabled = true.
 */
import { sendOverdueRemindersService } from "./library.service.js";

let cronStarted = false;

export const startLibraryCron = () => {
  if (cronStarted) return;
  cronStarted = true;

  const scheduleNextRun = () => {
    const now = new Date();
    const next8AM = new Date(now);
    next8AM.setHours(8, 0, 0, 0);

    // If it's already past 8 AM today, schedule for tomorrow
    if (next8AM <= now) {
      next8AM.setDate(next8AM.getDate() + 1);
    }

    const msUntilNext8AM = next8AM.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        console.log("[LibraryCron] Running overdue WhatsApp reminders...");
        const result = await sendOverdueRemindersService();
        console.log(`[LibraryCron] Sent ${result.totalSent} overdue reminders.`);
      } catch (err) {
        console.error("[LibraryCron] Error sending overdue reminders:", err.message);
      }
      // Schedule again for next day
      scheduleNextRun();
    }, msUntilNext8AM);

    console.log(`[LibraryCron] Next overdue reminder run scheduled for ${next8AM.toISOString()}`);
  };

  scheduleNextRun();
};
