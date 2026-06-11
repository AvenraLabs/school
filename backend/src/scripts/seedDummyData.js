import dotenv from "dotenv";
dotenv.config();

import db from "../config/db.js";
import "../models/initModels.js";

import School from "../modules/schools/school.model.js";
import User from "../modules/users/user.model.js";
import Teacher from "../modules/teachers/teacher.model.js";
import Parent from "../modules/parents/parent.model.js";
import Student from "../modules/students/student.model.js";
import Class from "../modules/classes/classes.model.js";
import Section from "../modules/sections/section.model.js";
import Subject from "../modules/subjects/subject.model.js";
import TeacherAssignment from "../modules/teacher-assignments/teacher-assignment.model.js";
import Timetable from "../modules/timetables/timetable.model.js";
import Homework from "../modules/homework/homework.model.js";
import HomeworkSubmission from "../modules/homework/homework-submission.model.js";
import Attendance from "../modules/attendance/attendance.model.js";
import TokenPolicy from "../modules/tokens/token-policy.model.js";
import TokenAccount from "../modules/tokens/token-account.model.js";
import TokenTransaction from "../modules/tokens/token-transaction.model.js";
import Exam from "../modules/report-cards/exam.model.js";
import ReportCard from "../modules/report-cards/report-card.model.js";
import ReportCardMark from "../modules/report-cards/report-card-mark.model.js";
import GroupChat from "../modules/group-chat/group-chat.model.js";
import GroupChatMember from "../modules/group-chat/group-chat-member.model.js";
import GroupChatMessage from "../modules/group-chat/group-chat-message.model.js";

/* ─── helpers ──────────────────────────────────────────────────────── */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);

const TEACHER_DATA = [
  { name: "Mr. John Doe",       username: "teacher_math",      email: "john.doe@ghs.in",      designation: "Senior Mathematics Teacher", qualification: "M.Sc. Mathematics",  experience: 8,  gender: "male"   },
  { name: "Mrs. Sarah Smith",   username: "teacher_science",   email: "sarah.smith@ghs.in",   designation: "Science Faculty",            qualification: "M.Sc. Physics",      experience: 5,  gender: "female" },
  { name: "Ms. Emily Davis",    username: "teacher_english",   email: "emily.davis@ghs.in",   designation: "English Language Head",      qualification: "M.A. English Lit",   experience: 12, gender: "female" },
  { name: "Mr. Robert Singh",   username: "teacher_history",   email: "robert.singh@ghs.in",  designation: "History Teacher",            qualification: "M.A. History",       experience: 6,  gender: "male"   },
  { name: "Ms. Priya Nair",     username: "teacher_geo",       email: "priya.nair@ghs.in",    designation: "Geography Teacher",          qualification: "M.Sc. Geography",    experience: 4,  gender: "female" },
  { name: "Mr. Arjun Sharma",   username: "teacher_cs",        email: "arjun.sharma@ghs.in",  designation: "Computer Science Teacher",   qualification: "M.Tech CS",          experience: 7,  gender: "male"   },
  { name: "Mrs. Kavitha Rao",   username: "teacher_hindi",     email: "kavitha.rao@ghs.in",   designation: "Hindi Teacher",              qualification: "M.A. Hindi",         experience: 9,  gender: "female" },
  { name: "Mr. Daniel Thomas",  username: "teacher_pe",        email: "daniel.thomas@ghs.in", designation: "Physical Education Teacher", qualification: "B.P.Ed.",            experience: 3,  gender: "male"   },
  { name: "Ms. Anjali Mehta",   username: "teacher_art",       email: "anjali.mehta@ghs.in",  designation: "Art & Craft Teacher",        qualification: "B.F.A.",             experience: 5,  gender: "female" },
  { name: "Mr. Suresh Kumar",   username: "teacher_music",     email: "suresh.kumar@ghs.in",  designation: "Music Teacher",              qualification: "B.Mus.",             experience: 10, gender: "male"   },
];

const STUDENT_NAMES = [
  "Aarav Sharma","Ananya Patel","Arjun Reddy","Bhavna Singh","Chetan Gupta",
  "Deepika Nair","Farhan Khan","Gayatri Pillai","Harsh Agarwal","Ishaan Joshi",
  "Jyoti Mishra","Kiran Verma","Lakshmi Rao","Manish Tiwari","Nisha Dubey",
  "Om Prakash","Pooja Yadav","Rahul Mehta","Sneha Kulkarni","Tarun Bose",
  "Uma Devi","Vikram Choudhury","Wasim Ansari","Xena D'Souza","Yash Kapoor",
  "Zara Ahmed","Aditya Banerjee","Bindu Krishnan","Chirag Pandey","Disha Malhotra",
  "Eshan Roy","Falguni Shah","Govind Das","Hema Latha","Iyer Subramanian",
  "Jatin Saxena","Kavya Balaji","Lalit Mohan","Meera Iyer","Nikhil Wagh",
  "Omkar Patil","Pallavi Jain","Qureshi Saba","Ritika Srivastava","Sandeep Negi",
  "Tanisha Bhatt","Uday Kiran","Vandana Shetty","Wriddhiman Sen","Yamini Chauhan",
  "Zoya Hussain","Abhishek Raut","Bhumika Deshpande","Chiranjeevi Naidu","Divya Rajput",
  "Ekansh Tripathi","Fiona Fernandes","Gaurav Oberoi","Himani Rawat","Indira Venkat",
];

const PARENT_NAMES = [
  ["Ramesh Sharma","Sunita Sharma"],["Rajiv Patel","Meenal Patel"],["Sunil Reddy","Geeta Reddy"],
  ["Harish Singh","Rekha Singh"],["Mahesh Gupta","Anita Gupta"],["Krishnan Nair","Leela Nair"],
  ["Imran Khan","Saima Khan"],["Anand Pillai","Devika Pillai"],["Sanjay Agarwal","Nirmala Agarwal"],
  ["Prakash Joshi","Usha Joshi"],["Rakesh Mishra","Savita Mishra"],["Vinod Verma","Sharda Verma"],
  ["Suresh Rao","Padma Rao"],["Vijay Tiwari","Kamla Tiwari"],["Anil Dubey","Saroj Dubey"],
  ["Gopal Prasad","Poonam Prasad"],["Karim Yadav","Reshma Yadav"],["Naveen Mehta","Smita Mehta"],
  ["Mohan Kulkarni","Vijaya Kulkarni"],["Tapan Bose","Mala Bose"],["Venkat Devi","Ganga Devi"],
  ["Bikram Choudhury","Malati Choudhury"],["Aslam Ansari","Fatima Ansari"],["Peter D'Souza","Mary D'Souza"],
  ["Ashok Kapoor","Neeta Kapoor"],["Irfan Ahmed","Noor Ahmed"],["Debashish Banerjee","Mita Banerjee"],
  ["Babu Krishnan","Lalitha Krishnan"],["Dinesh Pandey","Sudha Pandey"],["Naresh Malhotra","Deepa Malhotra"],
  ["Sudhir Roy","Pramila Roy"],["Ketan Shah","Hansa Shah"],["Jagdish Das","Kanta Das"],
  ["Bharat Latha","Sarala Latha"],["Ramachandran S","Saraswati R"],["Mukesh Saxena","Renu Saxena"],
  ["Subramaniam K","Geetha S"],["Lalit Mohan","Kamla Mohan"],["Girish Iyer","Padmini Iyer"],
  ["Dilip Wagh","Vaishali Wagh"],["Dattatray Patil","Shobha Patil"],["Abdul Saba","Zeenat Saba"],
  ["Manoj Srivastava","Kavita Srivastava"],["Bhushan Negi","Geeta Negi"],["Arun Bhatt","Seema Bhatt"],
  ["Ramakant Kiran","Sushma Kiran"],["Narayan Shetty","Hemalatha Shetty"],["Prosenjit Sen","Mitali Sen"],
  ["Yogesh Chauhan","Pratibha Chauhan"],["Riyaz Hussain","Shabnam Hussain"],["Amol Raut","Aparna Raut"],
  ["Shyam Deshpande","Rohini Deshpande"],["Naidu Rami","Veni Naidu"],["Thakur Rajput","Paro Thakur"],
  ["Hemant Tripathi","Anupama Tripathi"],["Silvester Fernandes","Philomena F"],["Ravi Oberoi","Sunaina Oberoi"],
  ["Arvind Rawat","Meenakshi Rawat"],["Govindarajan V","Meera V"],
];

const DAYS = ["monday","tuesday","wednesday","thursday","friday"];

const run = async () => {
  try {
    await db.authenticate();
    console.log("✓ DB connected");

    // ── truncate in safe order ──────────────────────────────────────
    console.log("Cleaning tables...");
    const truncateOrder = [
      GroupChatMessage, GroupChatMember, GroupChat,
      ReportCardMark, ReportCard, Exam,
      HomeworkSubmission, Homework,
      Timetable, TeacherAssignment,
      Attendance,
      TokenTransaction, TokenAccount, TokenPolicy,
      Parent, Student, Teacher,
      Section, Class, Subject,
      User, School,
    ];
    for (const m of truncateOrder) {
      await db.query(`TRUNCATE TABLE "${m.tableName}" RESTART IDENTITY CASCADE;`).catch(e =>
        console.warn(`  skip truncate ${m.tableName}: ${e.message}`)
      );
    }
    console.log("✓ Tables cleaned\n");

    // ── school ──────────────────────────────────────────────────────
    const school = await School.create({
      school_name: "Greenwood High School",
      school_code: "GHS123",
      cbse_affiliation_no: "CBSE-123456",
      address: "123 Academic Drive, Sector 4",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560001",
      contact_phone: "+91-80-12345678",
      email: "info@greenwoodhigh.edu.in",
      status: "active",
    });
    console.log(`✓ School: ${school.school_name} (id=${school.id})`);

    // ── super admin ─────────────────────────────────────────────────
    const superAdmin = await User.create({
      role: "super_admin", username: "superadmin", password: "password123",
      name: "Super Admin", is_active: true, first_login: false,
    });

    // ── school admin ────────────────────────────────────────────────
    const schoolAdmin = await User.create({
      school_id: school.id, role: "school_admin", username: "schooladmin",
      password: "password123", name: "Principal Arthur Pendleton",
      email: "admin@greenwoodhigh.edu.in", is_active: true, first_login: false,
    });
    console.log(`✓ Super Admin: ${superAdmin.username}  |  School Admin: ${schoolAdmin.username}`);

    // ── subjects ────────────────────────────────────────────────────
    const subjectDefs = [
      { name: "Mathematics",         code: "MATH", category: "theory"    },
      { name: "Science",             code: "SCI",  category: "both"      },
      { name: "English",             code: "ENG",  category: "theory"    },
      { name: "Social Studies",      code: "SST",  category: "theory"    },
      { name: "Hindi",               code: "HIN",  category: "theory"    },
      { name: "Computer Science",    code: "CS",   category: "practical" },
    ];
    const subjects = await Promise.all(
      subjectDefs.map(s => Subject.create({ school_id: school.id, ...s }))
    );
    console.log(`✓ Subjects: ${subjects.map(s => s.name).join(", ")}`);
    const [subMath, subSci, subEng, subSST, subHindi, subCS] = subjects;

    // ── 10 teachers ─────────────────────────────────────────────────
    console.log("\nSeeding 10 teachers...");
    const teacherUsers = [];
    const teacherProfiles = [];
    for (let i = 0; i < 10; i++) {
      const td = TEACHER_DATA[i];
      const u = await User.create({
        school_id: school.id, role: "teacher",
        username: td.username, password: "password123",
        name: td.name, email: td.email,
        is_active: true, first_login: false,
      });
      const t = await Teacher.create({
        user_id: u.id, school_id: school.id,
        employee_id: `EMP-${String(i + 1).padStart(3, "0")}`,
        gender: td.gender, designation: td.designation,
        qualification: td.qualification,
        joining_date: "2020-06-01",
        experience: td.experience,
        approval_status: "approved",
        approved_by: schoolAdmin.id,
        approved_at: new Date(),
      });
      teacherUsers.push(u);
      teacherProfiles.push(t);
    }
    console.log(`✓ Teachers: ${teacherUsers.map(u => u.username).join(", ")}`);

    // ── 3 classes × 2 sections each ─────────────────────────────────
    console.log("\nSeeding classes & sections...");
    const classDefs = ["Class 6", "Class 7", "Class 8"];
    const classes = [];
    const sections = []; // sections[classIdx][sectionIdx] A=0, B=1

    for (let ci = 0; ci < 3; ci++) {
      const cls = await Class.create({
        school_id: school.id,
        class_name: classDefs[ci],
        class_teacher_id: teacherProfiles[ci * 3].id,
      });
      classes.push(cls);

      const secA = await Section.create({
        school_id: school.id, class_id: cls.id,
        class_teacher_id: teacherProfiles[ci * 3].id,
        name: "A",
      });
      const secB = await Section.create({
        school_id: school.id, class_id: cls.id,
        class_teacher_id: teacherProfiles[ci * 3 + 1].id,
        name: "B",
      });
      sections.push([secA, secB]);
      console.log(`  ✓ ${cls.class_name} → Section A (id=${secA.id}), Section B (id=${secB.id})`);
    }

    // ── 10 students per section (60 total) ──────────────────────────
    console.log("\nSeeding students (10 per section = 60 total)...");
    const allStudentUsers = [];
    const allStudentProfiles = [];
    let studentIdx = 0;
    let admNo = 1;

    for (let ci = 0; ci < 3; ci++) {
      for (let si = 0; si < 2; si++) {
        const sec = sections[ci][si];
        const cls = classes[ci];
        for (let n = 0; n < 10; n++) {
          const sName = STUDENT_NAMES[studentIdx];
          const uname = `student_${sName.split(" ")[0].toLowerCase()}${admNo}`;
          const u = await User.create({
            school_id: school.id, role: "student",
            username: uname, password: "password123",
            name: sName, is_active: true, first_login: false,
          });
          const s = await Student.create({
            user_id: u.id, school_id: school.id,
            class_id: cls.id, section_id: sec.id,
            roll_no: n + 1,
            admission_no: `ADM-${String(admNo).padStart(3, "0")}`,
            dob: `${2010 + ci}-${String((n % 12) + 1).padStart(2, "0")}-${String((n % 28) + 1).padStart(2, "0")}`,
            gender: n % 2 === 0 ? "male" : "female",
            father_name: PARENT_NAMES[studentIdx]?.[0] || "Parent",
            mother_name: PARENT_NAMES[studentIdx]?.[1] || "Parent",
            blood_group: pick(["A+","B+","O+","AB+","A-","B-"]),
            approval_status: "approved",
            approved_by: schoolAdmin.id,
            approved_at: new Date(),
          });
          allStudentUsers.push(u);
          allStudentProfiles.push(s);
          studentIdx++;
          admNo++;
        }
      }
    }
    console.log(`✓ Students created: ${allStudentProfiles.length}`);

    // ── parents — one per student, linked by student_id ─────────────
    console.log("\nSeeding parents (1 per student = 60 total)...");
    for (let i = 0; i < allStudentProfiles.length; i++) {
      const pNames = PARENT_NAMES[i] || ["Parent Father", "Parent Mother"];
      const parentUser = await User.create({
        school_id: school.id, role: "parent",
        username: `parent_${allStudentUsers[i].username}`,
        password: "password123",
        name: pNames[i % 2 === 0 ? 0 : 1],
        is_active: true, first_login: false,
      });
      await Parent.create({
        user_id: parentUser.id,
        student_id: allStudentProfiles[i].id,   // ← linked to exact student
        relation_type: i % 2 === 0 ? "father" : "mother",
        approval_status: "approved",
        approved_by: schoolAdmin.id,
        approved_at: new Date(),
      });
    }
    console.log(`✓ Parents created and linked: ${allStudentProfiles.length}`);

    // ── teacher assignments — each teacher covers 2 sections + 1 subject ──
    console.log("\nSeeding teacher assignments...");
    // Map subject index to teacher index for variety
    const subjectTeacherMap = [
      { sub: subMath,  teacherIdx: 0 },
      { sub: subSci,   teacherIdx: 1 },
      { sub: subEng,   teacherIdx: 2 },
      { sub: subSST,   teacherIdx: 3 },
      { sub: subHindi, teacherIdx: 6 },
      { sub: subCS,    teacherIdx: 5 },
    ];

    const allAssignments = []; // { assignment, classIdx, sectionIdx }
    for (let ci = 0; ci < 3; ci++) {
      for (let si = 0; si < 2; si++) {
        for (let stIdx = 0; stIdx < subjectTeacherMap.length; stIdx++) {
          const { sub, teacherIdx } = subjectTeacherMap[stIdx];
          const teacher = teacherProfiles[teacherIdx];
          // Avoid duplicate (teacher, section, subject) — each combo is unique already
          const assignment = await TeacherAssignment.create({
            school_id: school.id,
            teacher_id: teacher.id,
            class_id: classes[ci].id,
            section_id: sections[ci][si].id,
            subject_id: sub.id,
            is_class_teacher: stIdx === 0 && si === 0, // math teacher of section A is class teacher
            is_active: true,
          });
          allAssignments.push({ assignment, classIdx: ci, sectionIdx: si, sub });
        }
      }
    }
    console.log(`✓ Teacher assignments: ${allAssignments.length}`);

    // ── timetable — 3 periods per day, Mon–Fri for each section ─────
    console.log("\nSeeding timetables...");
    const periods = [
      { start: "09:00:00", end: "09:45:00" },
      { start: "09:45:00", end: "10:30:00" },
      { start: "10:45:00", end: "11:30:00" },
    ];
    let ttCount = 0;
    for (let ci = 0; ci < 3; ci++) {
      for (let si = 0; si < 2; si++) {
        // get assignments for this section
        const secAssignments = allAssignments
          .filter(a => a.classIdx === ci && a.sectionIdx === si)
          .map(a => a.assignment);

        for (const day of DAYS) {
          for (let p = 0; p < 3; p++) {
            const asgn = secAssignments[p % secAssignments.length];
            await Timetable.create({
              school_id: school.id,
              class_id: classes[ci].id,
              section_id: sections[ci][si].id,
              teacher_assignment_id: asgn.id,
              day_of_week: day,
              start_time: periods[p].start,
              end_time: periods[p].end,
            });
            ttCount++;
          }
        }
      }
    }
    console.log(`✓ Timetable entries: ${ttCount}`);

    // ── token policies & accounts ────────────────────────────────────
    console.log("\nSeeding token policies & accounts...");
    await TokenPolicy.create({ role: "student", monthly_tokens: 500,  updated_by: superAdmin.id });
    await TokenPolicy.create({ role: "teacher", monthly_tokens: 2000, updated_by: superAdmin.id });

    for (const u of allStudentUsers) {
      await TokenAccount.create({ user_id: u.id, balance: 500 });
    }
    for (const u of teacherUsers) {
      await TokenAccount.create({ user_id: u.id, balance: 2000 });
    }
    console.log(`✓ Token accounts: ${allStudentUsers.length + teacherUsers.length}`);

    // ── exams & report cards for Class 6 ────────────────────────────
    console.log("\nSeeding exams & report cards...");
    const exam = await Exam.create({
      school_id: school.id,
      class_id: classes[0].id,
      name: "Term 1 Examination",
      start_date: "2026-09-15",
      end_date: "2026-09-22",
      is_locked: false,
    });

    // Report cards for first 10 students (Class 6A)
    const class6AStudents = allStudentProfiles.slice(0, 10);
    for (const stu of class6AStudents) {
      const rc = await ReportCard.create({
        student_id: stu.id,
        class_id: classes[0].id,
        exam_id: exam.id,
        school_id: school.id,
        remarks: "Good performance overall.",
        published_at: new Date(),
      });
      for (const sub of [subMath, subSci, subEng]) {
        await ReportCardMark.create({
          report_card_id: rc.id,
          subject_id: sub.id,
          marks_obtained: 65 + Math.floor(Math.random() * 35),
          max_marks: 100,
        });
      }
    }
    console.log(`✓ Report cards: ${class6AStudents.length} students`);

    // ── homework ─────────────────────────────────────────────────────
    console.log("\nSeeding homework...");
    const hwAssignment = allAssignments.find(a => a.classIdx === 0 && a.sectionIdx === 0 && a.sub.name === "Mathematics");
    if (hwAssignment) {
      const hw = await Homework.create({
        school_id: school.id,
        class_id: classes[0].id,
        section_id: sections[0][0].id,
        teacher_assignment_id: hwAssignment.assignment.id,
        subject_id: subMath.id,
        homework_date: new Date().toISOString().split("T")[0],
        description: "Solve Exercise 2.3 questions 1–5 from the Mathematics textbook.",
        created_by: teacherUsers[0].id,
      });
      // Submissions from first 5 students
      for (const stu of class6AStudents.slice(0, 5)) {
        await HomeworkSubmission.create({
          homework_id: hw.id,
          student_id: stu.id,
          submitted_at: new Date(),
          status: "submitted",
          submission_text: "Submitted answers for Exercise 2.3.",
          grade: pick(["A","B","C"]),
          feedback: "Good work!",
        });
      }
      console.log(`✓ Homework + 5 submissions`);
    }

    // ── group chat for Class 6A Math ─────────────────────────────────
    console.log("\nSeeding group chat...");
    const chat = await GroupChat.create({
      school_id: school.id,
      class_id: classes[0].id,
      section_id: sections[0][0].id,
      teacher_id: teacherUsers[0].id,
      subject_id: subMath.id,
      name: "Class 6A - Mathematics Discussion",
    });
    await GroupChatMember.create({ group_chat_id: chat.id, user_id: teacherUsers[0].id, role: "teacher" });
    for (const su of allStudentUsers.slice(0, 5)) {
      await GroupChatMember.create({ group_chat_id: chat.id, user_id: su.id, role: "student" });
    }
    await GroupChatMessage.create({
      group_chat_id: chat.id,
      sender_user_id: teacherUsers[0].id,
      message_type: "text",
      message_text: "Welcome to Class 6A Mathematics! Ask questions about Exercise 2.3 here.",
    });
    console.log(`✓ Group chat with ${5 + 1} members`);

    // ── summary ──────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════════════╗
║           Seeding Completed Successfully             ║
╠══════════════════════════════════════════════════════╣
║  School     : Greenwood High School                  ║
║  Classes    : 3  (Class 6, 7, 8)                     ║
║  Sections   : 6  (A & B per class)                   ║
║  Teachers   : 10                                     ║
║  Students   : 60 (10 per section)                    ║
║  Parents    : 60 (1 per student, all linked)         ║
║  Subjects   : 6                                      ║
║  Assignments: ${allAssignments.length} (6 subjects × 6 sections)          ║
║  Timetable  : ${ttCount} entries                            ║
║  Token accs : ${allStudentUsers.length + teacherUsers.length}                                      ║
╠══════════════════════════════════════════════════════╣
║  Login credentials (all):  password = password123   ║
║  Super Admin : superadmin                            ║
║  School Admin: schooladmin                           ║
║  Teachers    : teacher_math, teacher_science ...     ║
║  Students    : student_aarav1, student_ananya2 ...   ║
║  Parents     : parent_student_aarav1 ...             ║
╚══════════════════════════════════════════════════════╝
`);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seeding failed:", err.message || err);
    console.error(err);
    process.exit(1);
  }
};

run();
