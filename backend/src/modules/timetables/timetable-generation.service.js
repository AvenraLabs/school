import { Op } from "sequelize";
import db from "../../config/db.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Subject from "../subjects/subject.model.js";
import Teacher from "../teachers/teacher.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import User from "../users/user.model.js";
import Timetable from "./timetable.model.js";
import BellScheduleTemplate from "./bell-schedule-template.model.js";
import BellSchedulePeriod from "./bell-schedule-period.model.js";
import TimetableGenerationJob from "./timetable-generation-job.model.js";
import { getSubjectsForSection } from "../subjects/subject-resolution.service.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";
import AppError from "../../shared/appError.js";
import logger from "../../shared/logger.js";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/* =====================================================
   READINESS CHECK (PRE-FLIGHT CHECKLIST)
===================================================== */
export const checkReadinessService = async ({ school_id, class_id }) => {
  const classWhere = { school_id, is_active: true };
  if (class_id) {
    classWhere.id = class_id;
  }

  // 1. Fetch all active classes & sections with Bell Schedule Template
  const classRows = await Class.findAll({
    where: classWhere,
    include: [
      {
        model: Section,
        where: { is_active: true },
        required: false,
        attributes: ["id", "name", "class_id"],
      },
      {
        model: BellScheduleTemplate,
        as: "bellScheduleTemplate",
        attributes: ["id", "name", "working_days_per_week"],
        include: [{ model: BellSchedulePeriod, as: "periods" }],
      },
    ],
    order: [["class_name", "ASC"]],
  });

  // 2. Fetch all active teacher assignments for the school
  const assignments = await TeacherAssignment.findAll({
    where: { school_id, is_active: true },
    include: [
      {
        model: Teacher,
        attributes: ["id", "employee_id", "max_periods_per_week"],
        include: [{ model: User, attributes: ["name"] }],
      },
      { model: Subject, attributes: ["id", "name", "code"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
  });

  // Build lookup map: `${class_id}_${section_id}_${subject_id}` -> assignment
  const assignmentMap = new Map();
  assignments.forEach((a) => {
    if (a.class_id && a.section_id && a.subject_id) {
      assignmentMap.set(`${a.class_id}_${a.section_id}_${a.subject_id}`, a);
    }
  });

  const sectionResults = [];
  const teacherLoadMap = new Map();

  // Initialize teacher load stats
  assignments.forEach((a) => {
    if (a.teacher) {
      const tid = a.teacher.id;
      if (!teacherLoadMap.has(tid)) {
        teacherLoadMap.set(tid, {
          teacher_id: tid,
          employee_id: a.teacher.employee_id,
          name: a.teacher.user?.name || `Teacher #${a.teacher.employee_id}`,
          max_capacity: a.teacher.max_periods_per_week ?? null,
          required_load: 0,
          assignments: [],
        });
      }
    }
  });

  // 3. Evaluate each section
  for (const cls of classRows) {
    const sections = cls.sections || [];
    for (const sec of sections) {
      const resolvedSubjects = await getSubjectsForSection(school_id, cls.id, sec.id);

      const missingTeachers = [];
      const missingPeriods = [];
      let totalRequiredPeriods = 0;

      resolvedSubjects.forEach((sub) => {
        const key = `${cls.id}_${sec.id}_${sub.id}`;
        const assignment = assignmentMap.get(key);
        const periods = sub.periods_per_week;

        if (!assignment || !assignment.teacher) {
          if (sub.subject_type !== 'co_curricular') {
            missingTeachers.push({
              subject_id: sub.id,
              subject_name: sub.name,
              subject_code: sub.code,
              subject_type: sub.subject_type || 'academic',
            });
          }
        }

        if (periods === null || periods === undefined || periods <= 0) {
          missingPeriods.push({
            subject_id: sub.id,
            subject_name: sub.name,
            subject_code: sub.code,
            subject_type: sub.subject_type || 'academic',
          });
        } else {
          totalRequiredPeriods += Number(periods);

          if (assignment && assignment.teacher) {
            const tStats = teacherLoadMap.get(assignment.teacher.id);
            if (tStats) {
              tStats.required_load += Number(periods);
              tStats.assignments.push({
                class_name: cls.class_name,
                section_name: sec.name,
                subject_name: sub.name,
                periods: Number(periods),
              });
            }
          }
        }
      });

      const hasBellSchedule = !!cls.bellScheduleTemplate;
      const isReady = missingTeachers.length === 0 && missingPeriods.length === 0 && hasBellSchedule;

      sectionResults.push({
        class_id: cls.id,
        class_name: cls.class_name,
        section_id: sec.id,
        section_name: sec.name,
        bell_schedule: cls.bellScheduleTemplate
          ? {
              id: cls.bellScheduleTemplate.id,
              name: cls.bellScheduleTemplate.name,
              working_days_per_week: cls.bellScheduleTemplate.working_days_per_week,
              period_count: cls.bellScheduleTemplate.periods?.length || 0,
            }
          : null,
        total_subjects: resolvedSubjects.length,
        total_required_periods: totalRequiredPeriods,
        is_ready: isReady,
        missing_teachers: missingTeachers,
        missing_periods: missingPeriods,
      });
    }
  }

  // 4. Evaluate Teacher Overload
  const teacherOverloads = [];
  teacherLoadMap.forEach((tStats) => {
    if (tStats.max_capacity !== null && tStats.required_load > tStats.max_capacity) {
      teacherOverloads.push({
        teacher_id: tStats.teacher_id,
        employee_id: tStats.employee_id,
        name: tStats.name,
        required_load: tStats.required_load,
        max_capacity: tStats.max_capacity,
        excess_periods: tStats.required_load - tStats.max_capacity,
        assigned_details: tStats.assignments,
      });
    }
  });

  const totalSections = sectionResults.length;
  const readySections = sectionResults.filter((s) => s.is_ready).length;
  const blockedSections = sectionResults.filter((s) => !s.is_ready).length;

  return {
    is_school_ready: blockedSections === 0 && teacherOverloads.length === 0,
    summary: {
      total_sections: totalSections,
      ready_sections: readySections,
      blocked_sections: blockedSections,
      total_missing_teachers: sectionResults.reduce((sum, s) => sum + s.missing_teachers.length, 0),
      total_missing_periods: sectionResults.reduce((sum, s) => sum + s.missing_periods.length, 0),
      teacher_overloads_count: teacherOverloads.length,
    },
    sections: sectionResults,
    teacher_overloads: teacherOverloads,
  };
};

/* =====================================================
   CREATE & ENQUEUE TIMETABLE GENERATION JOB
===================================================== */
export const runGenerationJobService = async ({
  school_id,
  user_id,
  class_id,
  overwrite = false,
}) => {
  const academic_year_id = await getCurrentAcademicYearId(school_id);

  const job = await TimetableGenerationJob.create({
    school_id,
    academic_year_id,
    status: "pending",
    triggered_by: user_id,
    result_summary: {
      progress: 0,
      status_message: "Queued for processing",
      class_id: class_id || null,
      overwrite: !!overwrite,
    },
  });

  enqueueTimetableGeneration(job.id);

  return {
    job_id: job.id,
    status: "pending",
  };
};

/* =====================================================
   GET GENERATION JOB STATUS
===================================================== */
export const getGenerationJobStatusService = async ({ school_id, jobId }) => {
  const job = await TimetableGenerationJob.findOne({
    where: { id: jobId, school_id },
    include: [{ model: User, as: "triggeredBy", attributes: ["name", "username"] }],
  });

  if (!job) {
    throw new AppError("Generation job not found", 404);
  }

  return job;
};

/* =====================================================
   ENQUEUE JOB WORKER (NON-BLOCKING SETIMMEDIATE)
===================================================== */
export function enqueueTimetableGeneration(jobId) {
  logger.info("TIMETABLE_GEN_ENQUEUE", `Enqueuing TimetableGenerationJob ID #${jobId}...`, { jobId });

  setImmediate(() => {
    processTimetableGeneration(jobId).catch((err) => {
      logger.error("TIMETABLE_GEN_WORKER_ERROR", `Background error for job #${jobId}: ${err.message}`, {
        jobId,
        error: err.message,
      });
    });
  });
}

/* =====================================================
   CORE IN-MEMORY CSP SOLVER & GENERATOR WORKER
===================================================== */
export async function processTimetableGeneration(jobId) {
  const job = await TimetableGenerationJob.findByPk(jobId);
  if (!job) {
    logger.error("TIMETABLE_GEN_NOT_FOUND", `Job record #${jobId} not found`);
    return;
  }

  try {
    const { school_id, academic_year_id, result_summary = {} } = job;
    const targetClassId = result_summary.class_id || null;
    const overwrite = !!result_summary.overwrite;

    logger.info("TIMETABLE_GEN_START", `Starting Auto Timetable Generation Job #${jobId}...`, { jobId, school_id, academic_year_id });
    await job.update({
      status: "processing",
      result_summary: {
        ...result_summary,
        progress: 10,
        status_message: "Running pre-flight readiness check...",
      },
    });

    // 1. Pre-flight Readiness Check
    const readiness = await checkReadinessService({
      school_id,
      class_id: targetClassId,
    });

    const readySections = readiness.sections.filter((s) => s.is_ready && s.bell_schedule);
    const blockedSections = readiness.sections.filter((s) => !s.is_ready || !s.bell_schedule);

    if (readySections.length === 0) {
      await job.update({
        status: "failed",
        completed_at: new Date(),
        result_summary: {
          ...result_summary,
          progress: 100,
          status_message: "Generation aborted: No ready sections found. Please resolve pre-flight readiness issues first.",
          blocked_sections: blockedSections,
          readiness_summary: readiness.summary,
        },
      });
      return;
    }

    await job.update({
      result_summary: {
        ...result_summary,
        progress: 30,
        status_message: `Readiness check passed for ${readySections.length} section(s). Loading teacher schedules & bell templates...`,
      },
    });

    // 2. Fetch all active teacher assignments for ready sections
    const sectionIds = readySections.map((s) => s.section_id);
    const assignments = await TeacherAssignment.findAll({
      where: {
        school_id,
        section_id: sectionIds,
        is_active: true,
      },
      include: [
        {
          model: Teacher,
          attributes: ["id", "employee_id"],
          include: [{ model: User, attributes: ["name"] }],
        },
        { model: Subject, attributes: ["id", "name", "code", "subject_type"] },
      ],
    });

    const assignmentMap = new Map();
    assignments.forEach((a) => {
      if (a.class_id && a.section_id && a.subject_id) {
        assignmentMap.set(`${a.class_id}_${a.section_id}_${a.subject_id}`, a);
      }
    });

    // 3. Initialize In-Memory Teacher Busy Matrix
    let teacherBusy = {};

    if (!overwrite) {
      const existingTimetables = await Timetable.findAll({
        where: { school_id, academic_year_id },
        include: [
          {
            model: TeacherAssignment,
            attributes: ["teacher_id"],
          },
        ],
      });

      existingTimetables.forEach((t) => {
        if (t.teacher_assignment && t.teacher_assignment.teacher_id) {
          const tid = t.teacher_assignment.teacher_id;
          const day = t.day_of_week.toLowerCase();
          const slotKey = `${t.start_time}_${t.end_time}`;
          if (!teacherBusy[tid]) teacherBusy[tid] = {};
          if (!teacherBusy[tid][day]) teacherBusy[tid][day] = {};
          teacherBusy[tid][day][slotKey] = true;
        }
      });
    }

    const generatedTimetable = {};
    const unplacedUnits = [];
    let totalPlacedCount = 0;

    await job.update({
      result_summary: {
        ...result_summary,
        progress: 50,
        status_message: "Executing Constraint Satisfaction Solver...",
      },
    });

    // 4. Multi-Section Solver Execution
    for (const sec of readySections) {
      const { class_id, section_id, class_name, section_name, bell_schedule } = sec;
      const workingDays = Math.min(6, Math.max(1, bell_schedule.working_days_per_week));
      const activeDays = DAYS.slice(0, workingDays);

      const bst = await BellScheduleTemplate.findByPk(bell_schedule.id, {
        include: [{ model: BellSchedulePeriod, as: "periods" }],
        order: [[{ model: BellSchedulePeriod, as: "periods" }, "order_index", "ASC"]],
      });

      const periodsList = bst?.periods || [];

      generatedTimetable[section_id] = {
        class_id,
        class_name,
        section_id,
        section_name,
        days: {},
      };

      activeDays.forEach((day) => {
        generatedTimetable[section_id].days[day] = periodsList.map((p, idx) => ({
          order_index: p.order_index ?? idx + 1,
          start_time: p.start_time,
          end_time: p.end_time,
          is_break: !!p.is_break,
          title: p.is_break ? (p.title || "Break") : null,
          subject_id: null,
          subject_name: null,
          teacher_id: null,
          teacher_assignment_id: null,
          teacher_name: null,
        }));
      });

      const resolvedSubjects = await getSubjectsForSection(school_id, class_id, section_id);
      const unitsToPlace = [];

      resolvedSubjects.forEach((sub) => {
        const key = `${class_id}_${section_id}_${sub.id}`;
        const assignment = assignmentMap.get(key);
        const reqPeriods = Number(sub.periods_per_week || 0);
        const isCoCurricular = sub.subject_type === 'co_curricular';
        // Academic subjects require a teacher assignment, co-curricular subjects can be scheduled without one
        const canPlace = (assignment && assignment.teacher) || isCoCurricular;

        if (canPlace && reqPeriods > 0) {
          const dailyCap = Math.ceil(reqPeriods / workingDays);
          const teacherName = assignment?.teacher?.user?.name || null;

          for (let p = 0; p < reqPeriods; p++) {
            unitsToPlace.push({
              section_id,
              class_id,
              class_name,
              section_name,
              subject_id: sub.id,
              subject_name: sub.name,
              subject_code: sub.code,
              subject_type: sub.subject_type || "academic",
              teacher_id: assignment?.teacher?.id || null,
              teacher_assignment_id: assignment?.id || null,
              teacher_name: teacherName,
              daily_cap: dailyCap,
            });
          }
        }
      });

      let bestSectionDays = null;
      let bestTeacherBusy = null;
      let bestUnplacedUnits = null;
      let minUnplacedCount = Infinity;

      const getTeacherBusyCount = (tid) => {
        if (!tid || !teacherBusy[tid]) return 0;
        let count = 0;
        for (const day of Object.keys(teacherBusy[tid])) {
          count += Object.keys(teacherBusy[tid][day]).length;
        }
        return count;
      };

      for (let attempt = 0; attempt < 25; attempt++) {
        // Clone initial state of days for this section
        const attemptDays = structuredClone(generatedTimetable[section_id].days);
        // Clone teacherBusy state
        const attemptTeacherBusy = structuredClone(teacherBusy);
        const attemptUnplaced = [];

        // Shuffle units and then sort so units for the busiest teachers are scheduled first
        const attemptUnits = [...unitsToPlace];
        shuffleArray(attemptUnits);
        attemptUnits.sort((a, b) => {
          if (a.teacher_id === null && b.teacher_id !== null) return 1;
          if (a.teacher_id !== null && b.teacher_id === null) return -1;
          if (a.teacher_id === null && b.teacher_id === null) return 0;
          const busyA = getTeacherBusyCount(a.teacher_id);
          const busyB = getTeacherBusyCount(b.teacher_id);
          return busyB - busyA; // Busiest first
        });

        for (const unit of attemptUnits) {
          let placed = false;
          const candidateDays = [...activeDays];
          shuffleArray(candidateDays);

          for (const day of candidateDays) {
            if (placed) break;

            const daySlots = attemptDays[day];

            const placedCountToday = daySlots.filter((slot) => slot.subject_id === unit.subject_id).length;
            if (placedCountToday >= unit.daily_cap) {
              continue;
            }

            const candidateSlotIndices = daySlots
              .map((slot, index) => ({ slot, index }))
              .filter(({ slot }) => !slot.is_break && slot.subject_id === null)
              .map(({ index }) => index);

            shuffleArray(candidateSlotIndices);

            for (const slotIdx of candidateSlotIndices) {
              const slot = daySlots[slotIdx];
              const slotKey = `${slot.start_time}_${slot.end_time}`;
              const tid = unit.teacher_id;

              // tid is null for co-curricular subjects — no teacher conflict check needed
              const isTeacherBusy = tid ? attemptTeacherBusy[tid]?.[day]?.[slotKey] : false;

              if (!isTeacherBusy) {
                daySlots[slotIdx] = {
                  ...slot,
                  subject_id: unit.subject_id,
                  subject_name: unit.subject_name,
                  subject_code: unit.subject_code,
                  teacher_id: unit.teacher_id,
                  teacher_assignment_id: unit.teacher_assignment_id,
                  teacher_name: unit.teacher_name,
                };

                if (tid) {
                  if (!attemptTeacherBusy[tid]) attemptTeacherBusy[tid] = {};
                  if (!attemptTeacherBusy[tid][day]) attemptTeacherBusy[tid][day] = {};
                  attemptTeacherBusy[tid][day][slotKey] = true;
                }

                placed = true;
                break;
              }
            }
          }

          if (!placed) {
            attemptUnplaced.push({
              class_id: unit.class_id,
              section_id: unit.section_id,
              subject_id: unit.subject_id,
              teacher_id: unit.teacher_id,
              teacher_assignment_id: unit.teacher_assignment_id,
              class_name: unit.class_name,
              section_name: unit.section_name,
              subject_name: unit.subject_name,
              teacher_name: unit.teacher_name,
              reason: "No collision-free open period slot available matching teacher & daily cap constraints",
            });
          }
        }

        if (attemptUnplaced.length < minUnplacedCount) {
          minUnplacedCount = attemptUnplaced.length;
          bestSectionDays = attemptDays;
          bestTeacherBusy = attemptTeacherBusy;
          bestUnplacedUnits = attemptUnplaced;
        }

        if (minUnplacedCount === 0) {
          break; // Stop early if we found a perfect collision-free placement
        }
      }

      // Apply the best attempt
      generatedTimetable[section_id].days = bestSectionDays;
      teacherBusy = bestTeacherBusy;
      unplacedUnits.push(...bestUnplacedUnits);
      totalPlacedCount += (unitsToPlace.length - bestUnplacedUnits.length);
    }

    await job.update({
      status: "completed",
      completed_at: new Date(),
      result_summary: {
        ...result_summary,
        progress: 100,
        status_message: "Completed auto timetable generation successfully!",
        sections_count: readySections.length,
        placed_count: totalPlacedCount,
        unplaced_count: unplacedUnits.length,
        unplaced_units: unplacedUnits,
        blocked_sections: blockedSections,
        generated_timetable: generatedTimetable,
      },
    });

    logger.info("TIMETABLE_GEN_COMPLETE", `Job #${jobId} complete! Placed: ${totalPlacedCount}, Unplaced: ${unplacedUnits.length}`, { jobId });
  } catch (error) {
    logger.error("TIMETABLE_GEN_EXCEPTION", `Error processing timetable generation #${jobId}: ${error.message}`, {
      jobId,
      error: error.message,
    });
    await job.update({
      status: "failed",
      completed_at: new Date(),
      result_summary: {
        ...(job.result_summary || {}),
        progress: 100,
        status_message: `Generation failed: ${error.message}`,
        error: error.message,
      },
    });
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* =====================================================
   CONFIRM & PUBLISH CANDIDATE TIMETABLE TO DATABASE
===================================================== */
export const confirmGenerationJobService = async ({
  school_id,
  jobId,
  user_id,
  payload_timetable,
}) => {
  const job = await TimetableGenerationJob.findOne({
    where: { id: jobId, school_id },
  });

  if (!job) {
    throw new AppError("Generation job not found", 404);
  }

  if (job.status !== "completed") {
    throw new AppError(`Cannot publish timetable with status '${job.status}'. Job must be completed first.`, 400);
  }

  const timetableData = payload_timetable || job.result_summary?.generated_timetable;
  if (!timetableData || Object.keys(timetableData).length === 0) {
    throw new AppError("No generated timetable draft payload found to publish.", 400);
  }

  const academicYearId = job.academic_year_id;
  const sectionIds = Object.keys(timetableData).map(Number);

  // Validate internal payload teacher collision consistency
  const teacherBusyCheck = {};
  for (const [secIdStr, secData] of Object.entries(timetableData)) {
    const daysObj = secData.days || {};
    for (const [dayName, slotList] of Object.entries(daysObj)) {
      const dayLower = dayName.toLowerCase();
      for (const slot of slotList) {
        if (!slot.is_break && slot.teacher_assignment_id) {
          const ta = await TeacherAssignment.findByPk(slot.teacher_assignment_id);
          if (ta && ta.teacher_id) {
            const tid = ta.teacher_id;
            const slotKey = `${slot.start_time}_${slot.end_time}`;
            if (!teacherBusyCheck[tid]) teacherBusyCheck[tid] = {};
            if (!teacherBusyCheck[tid][dayLower]) teacherBusyCheck[tid][dayLower] = {};

            if (teacherBusyCheck[tid][dayLower][slotKey]) {
              throw new AppError(
                `Teacher Collision Error in Candidate Payload: Teacher assignment #${slot.teacher_assignment_id} is scheduled twice at ${dayName.toUpperCase()} ${slotKey}. Please resolve collisions before confirming.`,
                400
              );
            }
            teacherBusyCheck[tid][dayLower][slotKey] = true;
          }
        }
      }
    }
  }

  // Execute database replacement inside transaction
  return db.transaction(async (t) => {
    // 1. Delete existing Timetable entries for affected sections & academic year
    await Timetable.destroy({
      where: {
        school_id,
        academic_year_id: academicYearId,
        section_id: sectionIds,
      },
      transaction: t,
    });

    // 2. Prepare new Timetable rows
    const rowsToCreate = [];

    for (const [secIdStr, secData] of Object.entries(timetableData)) {
      const classId = secData.class_id;
      const sectionId = Number(secIdStr);
      const daysObj = secData.days || {};

      for (const [dayName, slotList] of Object.entries(daysObj)) {
        const dayLower = dayName.toLowerCase();
        for (const slot of slotList) {
          if (slot.is_break) {
            rowsToCreate.push({
              school_id,
              academic_year_id: academicYearId,
              class_id: classId,
              section_id: sectionId,
              day_of_week: dayLower,
              start_time: slot.start_time,
              end_time: slot.end_time,
              title: slot.title || "Break",
              is_break: true,
            });
          } else if (slot.subject_id) {
            let taId = slot.teacher_assignment_id || null;
            if (!taId) {
              const [assoc] = await TeacherAssignment.findOrCreate({
                where: {
                  school_id,
                  class_id: classId,
                  section_id: sectionId,
                  teacher_id: null,
                  subject_id: slot.subject_id,
                },
                defaults: {
                  is_active: true,
                  is_class_teacher: false,
                },
                transaction: t,
              });
              taId = assoc.id;
            }

            rowsToCreate.push({
              school_id,
              academic_year_id: academicYearId,
              class_id: classId,
              section_id: sectionId,
              day_of_week: dayLower,
              start_time: slot.start_time,
              end_time: slot.end_time,
              teacher_assignment_id: taId,
              is_break: false,
            });
          }
        }
      }
    }

    if (rowsToCreate.length > 0) {
      await Timetable.bulkCreate(rowsToCreate, { transaction: t });
    }

    // 3. Update job status and mark as published in result_summary
    await job.update(
      {
        status: "completed",
        result_summary: {
          ...job.result_summary,
          published: true,
          published_at: new Date(),
          published_by: user_id,
          published_entries_count: rowsToCreate.length,
        },
      },
      { transaction: t }
    );

    return {
      success: true,
      message: `Successfully published ${rowsToCreate.length} timetable entries across ${sectionIds.length} section(s)!`,
      entries_count: rowsToCreate.length,
      sections_count: sectionIds.length,
    };
  });
};

