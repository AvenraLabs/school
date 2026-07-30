import { Op } from 'sequelize';
import StudentFee from './student-fee.model.js';
import FeeDefinition from './fee-definition.model.js';
import Student from '../students/student.model.js';
import Notification from '../notifications/notification.model.js';
import User from '../users/user.model.js';

let cronStarted = false;

export const processFeeReminders = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const target3Days = new Date(today);
    target3Days.setDate(target3Days.getDate() + 3);
    const target3DaysStr = target3Days.toISOString().split('T')[0];

    // Find all active pending/partial student fees with a due date matching today or 3 days out
    const studentFees = await StudentFee.findAll({
      where: {
        status: { [Op.in]: ['pending', 'partial'] },
        balance_amount: { [Op.gt]: 0 },
      },
      include: [
        {
          model: FeeDefinition,
          where: {
            due_date: { [Op.in]: [todayStr, target3DaysStr] },
          },
        },
        {
          model: Student,
          attributes: ['id', 'user_id', 'class_id', 'section_id', 'school_id'],
        },
      ],
    });

    let sentCount = 0;
    const adminUserCache = {};

    const getSchoolAdminUserId = async (schoolId) => {
      if (!adminUserCache[schoolId]) {
        const admin = await User.findOne({
          where: { school_id: schoolId, role: 'school_admin' },
          attributes: ['id'],
        });
        if (admin) {
          adminUserCache[schoolId] = admin.id;
        } else {
          const fallback = await User.findOne({
            where: { school_id: schoolId },
            attributes: ['id'],
          });
          adminUserCache[schoolId] = fallback ? fallback.id : 1;
        }
      }
      return adminUserCache[schoolId];
    };

    for (const sf of studentFees) {
      const student = sf.student;
      const feeDef = sf.fee_definition;

      if (!student || !student.user_id || !feeDef || !feeDef.due_date) continue;

      const isToday = feeDef.due_date === todayStr;
      const title = isToday ? 'Fee Due Today' : 'Fee Due Reminder (3 Days Left)';
      const feeTitle = feeDef.title || 'School Fee';
      const balance = Number(sf.balance_amount).toLocaleString('en-IN');

      const message = isToday
        ? `Reminder: Today is the due date for "${feeTitle}" (₹${balance}). Please complete payment to avoid late fees.`
        : `Reminder: "${feeTitle}" (₹${balance}) is due in 3 days (${feeDef.due_date}). Please pay on time.`;

      // Check if a notification for this specific fee and reminder type already exists
      const existing = await Notification.findOne({
        where: {
          school_id: student.school_id,
          target_user_id: student.user_id,
          title,
          message: { [Op.like]: `%${feeTitle}%` },
        },
      });

      if (!existing) {
        const senderUserId = await getSchoolAdminUserId(student.school_id);

        await Notification.create({
          school_id: student.school_id,
          sender_user_id: senderUserId,
          sender_role: 'school_admin',
          title,
          message,
          target_role: 'student',
          class_id: student.class_id || null,
          section_id: student.section_id || null,
          target_user_id: student.user_id,
        });
        sentCount++;
      }
    }

    if (sentCount > 0) {
      console.log(`[FeeCron] Processed & sent ${sentCount} fee due notifications.`);
    }
  } catch (err) {
    console.error('[FeeCron] Error processing fee reminders:', err.message);
  }
};

export const startFeeCron = () => {
  if (cronStarted) return;
  cronStarted = true;

  const scheduleNextRun = () => {
    const now = new Date();
    const next830AM = new Date(now);
    next830AM.setHours(8, 30, 0, 0);

    // If past 8:30 AM today, schedule for tomorrow 8:30 AM
    if (next830AM <= now) {
      next830AM.setDate(next830AM.getDate() + 1);
    }

    const msUntilNext830AM = next830AM.getTime() - now.getTime();

    setTimeout(async () => {
      console.log('[FeeCron] Running daily fee due date checks...');
      await processFeeReminders();
      scheduleNextRun();
    }, msUntilNext830AM);
  };

  // Run initial check once on server boot
  processFeeReminders();
  scheduleNextRun();
};
