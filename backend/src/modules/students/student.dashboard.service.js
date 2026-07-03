import Student from "./student.model.js";
import Attendance from "../attendance/attendance.model.js";
import Homework from "../homework/homework.model.js";
// import Notification from "../notifications/notification.model.js"; // Verify if available
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";
import { Op } from "sequelize";
import TokenAccount from "../tokens/token-account.model.js";
import { ensureTokenAccount } from "../tokens/token.service.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import ReportCard from "../report-cards/report-card.model.js";
import ReportCardMark from "../report-cards/report-card-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import ExamSubject from "../report-cards/exam-subject.model.js";
import Subject from "../subjects/subject.model.js";

const toYmd = (date) => {
    const value = new Date(date);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

const average = (values) => {
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getExamSlots = (exam) => [...(exam?.exam_subjects || [])]
    .sort((a, b) => String(a.exam_date || "").localeCompare(String(b.exam_date || "")));

const getExamPrimaryDate = (exam, fallback) => {
    const slots = getExamSlots(exam);
    return slots[0]?.exam_date || fallback;
};

const buildPerformanceAnalytics = async (student) => {
    const reportCards = await ReportCard.findAll({
        where: {
            student_id: student.id,
            school_id: student.school_id,
            published_at: { [Op.ne]: null },
        },
        include: [
            {
                model: ReportCardMark,
                include: [{ model: Subject, attributes: ["id", "name"] }],
            },
            {
                model: Exam,
                attributes: ["id", "name", "createdAt"],
                include: [
                    {
                        model: ExamSubject,
                        as: "exam_subjects",
                        include: [{ model: Subject, attributes: ["id", "name"] }],
                    },
                ],
            },
        ],
        order: [["published_at", "ASC"]],
    });

    const cards = reportCards.map((card) => card.get({ plain: true }));
    const subjectBuckets = new Map();
    const syllabusItems = [];

    const exams = cards.map((card) => {
        const marks = card.report_card_marks || [];
        const totalObtained = marks.reduce((sum, mark) => sum + Number(mark.marks_obtained || 0), 0);
        const totalMax = marks.reduce((sum, mark) => sum + Number(mark.max_marks || 0), 0);
        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
        const primaryDate = getExamPrimaryDate(card.exam, card.published_at || card.createdAt);

        marks.forEach((mark) => {
            const maxMarks = Number(mark.max_marks || 0);
            if (maxMarks <= 0) return;

            const subjectName = mark.subject?.name || `Subject #${mark.subject_id}`;
            const markPercentage = Math.round((Number(mark.marks_obtained || 0) / maxMarks) * 100);
            const bucket = subjectBuckets.get(subjectName) || [];
            bucket.push(markPercentage);
            subjectBuckets.set(subjectName, bucket);

            const slot = getExamSlots(card.exam).find((examSubject) => Number(examSubject.subject_id) === Number(mark.subject_id));
            if (slot?.syllabus) {
                syllabusItems.push({
                    subject: subjectName,
                    syllabus: slot.syllabus,
                    percentage: markPercentage,
                    exam_name: card.exam?.name || "Exam",
                    exam_date: slot.exam_date,
                });
            }
        });

        return {
            id: card.exam_id,
            name: card.exam?.name || "Exam",
            percentage,
            obtained: totalObtained,
            max_marks: totalMax,
            date: primaryDate,
        };
    });

    const subjectAverages = [...subjectBuckets.entries()]
        .map(([subject, percentages]) => ({
            subject,
            percentage: average(percentages),
            tests: percentages.length,
        }))
        .sort((a, b) => b.percentage - a.percentage);

    const weakestSyllabus = syllabusItems
        .sort((a, b) => a.percentage - b.percentage)[0] || null;

    return {
        latest_exam: exams[exams.length - 1] || null,
        trend: exams.slice(-6),
        subject_averages: subjectAverages,
        strong_subject: subjectAverages[0] || null,
        focus_subject: subjectAverages[subjectAverages.length - 1] || null,
        weak_syllabus: weakestSyllabus,
    };
};

export const getStudentDashboardService = async ({ student_user_id }) => {
    const student = await Student.findOne({
        where: { user_id: student_user_id },
        include: [{ model: User, attributes: ["name"] }],
    });
    if (!student) {
        throw new AppError("Student profile not found", 404);
    }

    // 1. Attendance Percentage
    const totalDays = await Attendance.count({
        where: { student_id: student.id },
    });
    const presentDays = await Attendance.count({
        where: {
            student_id: student.id,
            status: 'present'
        },
    });
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diffToMonday);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const weeklyTotal = await Attendance.count({
        where: {
            student_id: student.id,
            date: { [Op.between]: [toYmd(weekStart), todayStr] },
        },
    });
    const weeklyPresent = await Attendance.count({
        where: {
            student_id: student.id,
            status: "present",
            date: { [Op.between]: [toYmd(weekStart), todayStr] },
        },
    });
    const monthlyTotal = await Attendance.count({
        where: {
            student_id: student.id,
            date: { [Op.between]: [toYmd(monthStart), todayStr] },
        },
    });
    const monthlyPresent = await Attendance.count({
        where: {
            student_id: student.id,
            status: "present",
            date: { [Op.between]: [toYmd(monthStart), todayStr] },
        },
    });

    const pendingHomeworkCount = await Homework.count({
        where: {
            school_id: student.school_id,
            class_id: student.class_id,
            section_id: student.section_id,
            homework_date: { [Op.gte]: todayStr },
        },
    });

    // 2. AI Tokens (real)
    await ensureTokenAccount(student_user_id);
    const tokenAccount = await TokenAccount.findOne({
        where: { user_id: student_user_id },
        attributes: ["balance"],
    });
    const remaining = tokenAccount?.balance ?? 0;
    const usedTotal = await AiChatLog.sum("tokens_used", {
        where: { user_id: student_user_id },
    });
    const used = usedTotal || 0;
    const total = used + remaining;
    const aiTokens = {
        total,
        used,
        remaining
    };
    const performance = await buildPerformanceAnalytics(student);

    return {
        student: {
            id: student.id,
            name: (student.user ?? student.User)?.name ?? null,
            admission_no: student.admission_no,
            class_id: student.class_id,
            section_id: student.section_id
        },
        metrics: {
            attendance: {
                present: presentDays,
                total: totalDays,
                percentage: attendancePercentage,
                weekly: {
                    present: weeklyPresent,
                    total: weeklyTotal,
                    percentage: weeklyTotal > 0 ? Math.round((weeklyPresent / weeklyTotal) * 100) : 0,
                },
                monthly: {
                    present: monthlyPresent,
                    total: monthlyTotal,
                    percentage: monthlyTotal > 0 ? Math.round((monthlyPresent / monthlyTotal) * 100) : 0,
                },
            },
            ai_tokens: aiTokens,
            homework_pending: pendingHomeworkCount,
            performance,
            unread_notifications: 0 // Placeholder
        }
    };
};
