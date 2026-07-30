/**
 * Library overdue in-app reminder cron job.
 * Runs daily at 8:00 AM server time.
 * Dispatches in-app notifications to students & teachers with upcoming/overdue book issues.
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

    // If it's already past 8 AM today, schedule for tomorrow 8 AM
    if (next8AM <= now) {
      next8AM.setDate(next8AM.getDate() + 1);
    }

    const msUntilNext8AM = next8AM.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        console.log("[LibraryCron] Running daily overdue in-app notifications...");
        const result = await sendOverdueRemindersService();
        console.log(`[LibraryCron] Sent ${result.totalSent} in-app overdue notifications.`);
      } catch (err) {
        console.error("[LibraryCron] Error sending overdue notifications:", err.message);
      }
      scheduleNextRun();
    }, msUntilNext8AM);
  };

  // Run initial check once on server boot
  sendOverdueRemindersService()
    .then((result) => {
      if (result?.totalSent > 0) {
        console.log(`[LibraryCron] Initial boot check: Sent ${result.totalSent} in-app overdue notifications.`);
      }
    })
    .catch((err) => {
      console.error("[LibraryCron] Initial boot check error:", err.message);
    });

  scheduleNextRun();
};
