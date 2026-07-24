import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  ListItemText,
} from "@mui/material";
import {
  AutoAwesome,
  Description,
  School,
  AutoStories,
  AssignmentTurnedIn,
  PictureAsPdf,
  CheckCircle,
  ArrowBack,
  DeleteOutline,
  FolderSpecial,
  Edit,
} from "@mui/icons-material";
import {
  generateTeacherAiApi,
  saveTeacherAiDocumentApi,
  listTeacherAiDocumentsApi,
  deleteTeacherAiDocumentApi,
} from "./teacherAi.api";
import { getCurriculumSubjects, getCurriculumChapters } from "../../api/curriculum.api";
import { useAuth } from "../../auth/AuthProvider";
import { useTeacherAssignments } from "../teacher-timetable/useTeacherAssignments";
import html2pdf from "html2pdf.js";

const AI_TOOLS = [
  {
    key: "question_paper",
    title: "Question Paper",
    icon: <Description sx={{ fontSize: 32 }} />,
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
    badge: "Exams",
  },
  {
    key: "lesson_plan",
    title: "Lesson Plan",
    icon: <School sx={{ fontSize: 32 }} />,
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    badge: "Plan",
  },
  {
    key: "lesson_summary",
    title: "Lesson Summary",
    icon: <AutoStories sx={{ fontSize: 32 }} />,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    badge: "Summary",
  },
  {
    key: "teacher_quiz",
    title: "Student Quiz",
    icon: <AssignmentTurnedIn sx={{ fontSize: 32 }} />,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    badge: "Quiz",
  },
];

// Grades 1–12
const ALL_GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}));

/* ─────────────────────────────────────────────────────────────
   DOCUMENT RENDERERS (Clean formatted views for PDF & Display)
   ───────────────────────────────────────────────────────────── */

function RenderQuestionPaperView({ data }) {
  if (!data) return null;
  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box sx={{ borderBottom: "2px solid #0f172a", pb: 2, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>
          {data.title || "Question Paper"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, px: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569" }}>
            {data.board || "CBSE"} | {data.grade || "Grade 10"} | {data.subject || "Subject"}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569" }}>
            Time: {data.duration_mins || 60} Mins | Max Marks: {data.total_marks || 50}
          </Typography>
        </Box>
      </Box>

      {/* Instructions */}
      {data.instructions && data.instructions.length > 0 && (
        <Box sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "#334155", display: "block", mb: 0.5 }}>
            General Instructions:
          </Typography>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>
            {data.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </Box>
      )}

      {/* Sections & Questions */}
      {(data.sections || []).map((sec, sIdx) => (
        <Box key={sIdx}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#1e1b4b", bgcolor: "#eef2ff", p: 1, px: 1.5, borderRadius: "6px", mb: 1.5 }}>
            {sec.section_name} {sec.marks_per_question ? `(${sec.marks_per_question} Mark each)` : ""}
          </Typography>

          <Stack spacing={2}>
            {(sec.questions || []).map((q, qIdx) => (
              <Box key={qIdx} sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                  Q{q.q_no || qIdx + 1}. {q.question_text}
                </Typography>

                {q.options && q.options.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5, pl: 2 }}>
                    {q.options.map((opt, oIdx) => (
                      <Typography key={oIdx} variant="caption" sx={{ minWidth: "45%", fontWeight: 600, color: "#334155" }}>
                        ({String.fromCharCode(65 + oIdx)}) {opt}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      ))}

      {/* Answer Key */}
      {data.answer_key && data.answer_key.length > 0 && (
        <Box sx={{ borderTop: "2px dashed #cbd5e1", pt: 2, mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}>
            Answer Key & Explanations
          </Typography>
          <Stack spacing={1}>
            {data.answer_key.map((ak, aIdx) => (
              <Typography key={aIdx} variant="caption" sx={{ color: "#334155", display: "block" }}>
                <strong>Q{ak.q_no}:</strong> {ak.answer} — <em>{ak.explanation}</em>
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function RenderLessonPlanView({ data }) {
  if (!data) return null;
  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box sx={{ borderBottom: "2px solid #ec4899", pb: 1.5, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
          {data.title || "Lesson Plan"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
          <Chip label={data.grade || "Grade 10"} size="small" sx={{ fontWeight: 700, bgcolor: "#fce7f3", color: "#be185d" }} />
          <Chip label={data.subject || "Subject"} size="small" sx={{ fontWeight: 700, bgcolor: "#f3e8ff", color: "#6b21a8" }} />
          <Chip label={`Duration: ${data.teaching_duration || "45 mins"}`} size="small" sx={{ fontWeight: 700 }} />
          <Chip label={`Style: ${data.teaching_style || "Interactive"}`} size="small" sx={{ fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Learning Objectives */}
      {data.learning_objectives && data.learning_objectives.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#831843", mb: 0.5 }}>
            Learning Objectives
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "#334155" }}>
            {data.learning_objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </Box>
      )}

      {/* Introduction */}
      {data.introduction && (
        <Box sx={{ bgcolor: "#fff5f5", p: 1.5, borderRadius: "8px", border: "1px solid #fecdd3" }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "#9f1239", display: "block", mb: 0.5 }}>
            Hook & Warm-Up:
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {data.introduction}
          </Typography>
        </Box>
      )}

      {/* Teaching Flow */}
      {data.teaching_flow && data.teaching_flow.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Classroom Teaching Flow
          </Typography>
          <Stack spacing={1.5}>
            {data.teaching_flow.map((step, idx) => (
              <Box key={idx} sx={{ p: 1.5, borderRadius: "8px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#ec4899" }}>
                    {step.time_slot}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {step.activity_title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#334155", mb: 0.5 }}>
                  <strong>Teacher:</strong> {step.teacher_action}
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569" }}>
                  <strong>Student:</strong> {step.student_action}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Important Concepts */}
      {data.important_concepts && data.important_concepts.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Key Concepts
          </Typography>
          <Stack spacing={1}>
            {data.important_concepts.map((c, i) => (
              <Box key={i} sx={{ pl: 1, borderLeft: "3px solid #ec4899" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {c.concept}
                </Typography>
                <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                  {c.explanation}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Questions to Ask */}
      {data.questions_to_ask_students && data.questions_to_ask_students.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            Questions to Ask Students
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.85rem", color: "#334155" }}>
            {data.questions_to_ask_students.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Box>
      )}
    </Stack>
  );
}

function RenderLessonSummaryView({ data }) {
  if (!data) return null;
  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box sx={{ borderBottom: "2px solid #f59e0b", pb: 1.5, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
          {data.title || "Lesson Summary"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
          <Chip label={data.grade || "Grade 10"} size="small" sx={{ fontWeight: 700, bgcolor: "#fef3c7", color: "#b45309" }} />
          <Chip label={data.subject || "Subject"} size="small" sx={{ fontWeight: 700, bgcolor: "#e0f2fe", color: "#0369a1" }} />
          <Chip label={`Length: ${data.summary_length || "Medium"}`} size="small" sx={{ fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Chapter Overview */}
      {data.chapter_summary && (
        <Box sx={{ bgcolor: "#fffbeb", p: 2, borderRadius: "10px", border: "1px solid #fde68a" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#92400e", mb: 0.5 }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: "#451a03", lineHeight: 1.6 }}>
            {data.chapter_summary}
          </Typography>
        </Box>
      )}

      {/* Key Concepts */}
      {data.key_concepts && data.key_concepts.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Core Concepts
          </Typography>
          <Stack spacing={1}>
            {data.key_concepts.map((kc, i) => (
              <Box key={i} sx={{ p: 1.2, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  {kc.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.3 }}>
                  {kc.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Important Definitions */}
      {data.important_definitions && data.important_definitions.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Definitions
          </Typography>
          <Stack spacing={0.8}>
            {data.important_definitions.map((def, i) => (
              <Typography key={i} variant="body2" sx={{ color: "#334155" }}>
                <strong>{def.term}:</strong> {def.definition}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}

      {/* Exam Tips */}
      {data.exam_tips && data.exam_tips.length > 0 && (
        <Box sx={{ bgcolor: "#ecfdf5", p: 1.5, borderRadius: "8px", border: "1px solid #a7f3d0" }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "#047857", display: "block", mb: 0.5 }}>
            Exam Tips:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "#065f46" }}>
            {data.exam_tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Box>
      )}
    </Stack>
  );
}

function RenderTeacherQuizView({ data }) {
  if (!data) return null;
  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box sx={{ borderBottom: "2px solid #10b981", pb: 1.5, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
          {data.title || "Quiz Homework"}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#047857", display: "block", mt: 0.5 }}>
          {data.instructions || "Complete all questions carefully."}
        </Typography>
      </Box>

      {/* Questions */}
      <Stack spacing={2}>
        {(data.questions || []).map((q, idx) => (
          <Box key={idx} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              {idx + 1}. {q.question_text}
            </Typography>
            {q.options && (
              <Stack spacing={0.5} sx={{ pl: 1 }}>
                {q.options.map((opt, oIdx) => (
                  <Typography
                    key={oIdx}
                    variant="caption"
                    sx={{
                      fontWeight: opt === q.correct_answer ? 800 : 500,
                      color: opt === q.correct_answer ? "#15803d" : "#475569",
                      bgcolor: opt === q.correct_answer ? "#dcfce7" : "transparent",
                      p: 0.5,
                      borderRadius: "4px",
                    }}
                  >
                    ({String.fromCharCode(65 + oIdx)}) {opt} {opt === q.correct_answer ? "✓" : ""}
                  </Typography>
                ))}
              </Stack>
            )}
            {q.explanation && (
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1, fontStyle: "italic" }}>
                Explanation: {q.explanation}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

/* ─────────────────────────────────────────────────────────────
   DOCUMENT VIEWER SCREEN (Full screen view with Back & Download PDF)
   ───────────────────────────────────────────────────────────── */

function DocumentViewer({ doc, onBack, onDelete }) {
  const activeTool = AI_TOOLS.find((t) => t.key === doc.type);

  const handleDownloadPdf = () => {
    const element = document.getElementById("document-pdf-content");
    if (!element) return;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${doc.title || "Document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Stack spacing={2.5}>
      {/* Top Action Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
        >
          Back
        </Button>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PictureAsPdf />}
            onClick={handleDownloadPdf}
            sx={{ borderRadius: "12px", fontWeight: 800, textTransform: "none", bgcolor: activeTool?.color || "#4f46e5" }}
          >
            Download PDF
          </Button>
          {onDelete && (
            <IconButton onClick={onDelete} color="error" size="small">
              <DeleteOutline />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Main Printable Document Card */}
      <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
        <CardContent id="document-pdf-content" sx={{ p: 3, bgcolor: "#ffffff" }}>
          {doc.type === "question_paper" && <RenderQuestionPaperView data={doc.data} />}
          {doc.type === "lesson_plan" && <RenderLessonPlanView data={doc.data} />}
          {doc.type === "lesson_summary" && <RenderLessonSummaryView data={doc.data} />}
          {doc.type === "teacher_quiz" && <RenderTeacherQuizView data={doc.data} />}
        </CardContent>
      </Card>
    </Stack>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */

export default function TeacherAIToolsPage() {
  const [selectedToolKey, setSelectedToolKey] = useState(null); // null | 'question_paper' | 'lesson_plan' | 'lesson_summary' | 'teacher_quiz' | 'saved_drafts'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Viewing Document state (opens clean viewer)
  const [viewingDoc, setViewingDoc] = useState(null);

  // Saved Drafts State
  const [savedDocs, setSavedDocs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const { user } = useAuth();
  const { assignments } = useTeacherAssignments();

  // Board from JWT — read from school record
  const schoolBoard = (user?.school_board || "CBSE").toUpperCase();

  // Form State
  const [grade, setGrade] = useState("10");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [title, setTitle] = useState("");
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState("50");
  const [duration, setDuration] = useState("60");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [questionTypes, setQuestionTypes] = useState(["MCQ", "Short Answer", "Long Answer"]);

  // Lesson Plan State
  const [teachingDuration, setTeachingDuration] = useState("45 mins");
  const [teachingStyle, setTeachingStyle] = useState("Interactive");
  const [learningObjectives, setLearningObjectives] = useState("");

  // Lesson Summary State
  const [summaryLength, setSummaryLength] = useState("Medium");
  const [targetAudience, setTargetAudience] = useState("Student");

  // Quiz Homework State
  const [classId, setClassId] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [availableUntil, setAvailableUntil] = useState("");

  // Additional Instructions
  const [instructions, setInstructions] = useState("");

  // Curriculum metadata state (PostgreSQL)
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [curriculumChapters, setCurriculumChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const selectedTool = useMemo(
    () => AI_TOOLS.find((t) => t.key === selectedToolKey),
    [selectedToolKey]
  );

  const teacherClasses = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      const cls = a.Class || a.class;
      if (cls && !map.has(cls.id)) {
        map.set(cls.id, { id: cls.id, name: cls.class_name });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  const isOther = subject === "other";
  const resolvedSubject = isOther ? (customSubject.trim() || "General") : subject;

  // Load subjects when board or grade changes
  const fetchSubjects = useCallback(async () => {
    if (!schoolBoard || !grade) return;
    setLoadingSubjects(true);
    setSubject("");
    setCurriculumSubjects([]);
    setCurriculumChapters([]);
    setSelectedChapters([]);
    try {
      const subs = await getCurriculumSubjects(schoolBoard, grade);
      setCurriculumSubjects(subs);
    } catch (err) {
      console.warn("[TeacherAI] Could not load curriculum subjects:", err.message);
    } finally {
      setLoadingSubjects(false);
    }
  }, [schoolBoard, grade]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // Load chapters when subject changes
  const fetchChapters = useCallback(async () => {
    if (!schoolBoard || !grade || !subject || subject === "other") {
      setCurriculumChapters([]);
      setSelectedChapters([]);
      return;
    }
    setLoadingChapters(true);
    setCurriculumChapters([]);
    setSelectedChapters([]);
    try {
      const chaps = await getCurriculumChapters(schoolBoard, grade, subject);
      setCurriculumChapters(chaps);
    } catch (err) {
      console.warn("[TeacherAI] Could not load curriculum chapters:", err.message);
    } finally {
      setLoadingChapters(false);
    }
  }, [schoolBoard, grade, subject]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const loadSavedDocs = async () => {
    setLoadingSaved(true);
    try {
      const res = await listTeacherAiDocumentsApi();
      setSavedDocs(res.data?.documents || []);
    } catch (err) {
      console.error("Failed to load saved docs:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (selectedToolKey === "saved_drafts") {
      loadSavedDocs();
    }
  }, [selectedToolKey]);

  const handleQTypeChange = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!selectedToolKey || selectedToolKey === "saved_drafts") return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const chaptersList = isOther
        ? []
        : selectedChapters.length > 0
        ? selectedChapters.map(String)
        : [];

      const res = await generateTeacherAiApi({
        feature: selectedToolKey,
        board: schoolBoard,
        grade: `Class ${grade}`,
        subject: resolvedSubject,
        topic: title,
        chapters: chaptersList,
        skipRag: isOther,
        title,
        examName,
        totalMarks: Number(totalMarks),
        duration: Number(duration),
        numQuestions: Number(numQuestions),
        difficulty,
        questionTypes,
        teachingDuration,
        teachingStyle,
        learningObjectives,
        summaryLength,
        targetAudience,
        showCorrectAnswers,
        showExplanations,
        availableUntil: availableUntil || null,
        classId: classId || (teacherClasses[0] ? teacherClasses[0].id : null),
        instructions,
      });

      const generatedData = res.data?.data || res.data;
      const docTitle = title || generatedData?.title || `${resolvedSubject} ${selectedTool?.title || "Document"}`;

      // Auto-save draft to backend
      let docId = null;
      if (selectedToolKey !== "teacher_quiz") {
        try {
          const saveRes = await saveTeacherAiDocumentApi({
            type: selectedToolKey,
            title: docTitle,
            board: schoolBoard,
            grade: `Class ${grade}`,
            subject: resolvedSubject,
            chapters: chaptersList,
            content: generatedData,
            status: "saved",
          });
          docId = saveRes.data?.id;
        } catch (saveErr) {
          console.warn("Auto-save draft notice:", saveErr.message);
        }
      }

      // Automatically open clean Document Viewer
      setViewingDoc({
        type: selectedToolKey,
        data: generatedData,
        docId,
        title: docTitle,
      });

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to generate AI content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await deleteTeacherAiDocumentApi(id);
      setSavedDocs((prev) => prev.filter((d) => d.id !== id));
      if (viewingDoc?.docId === id) {
        setViewingDoc(null);
      }
    } catch (err) {
      console.error("Failed to delete doc:", err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
      {/* Sleek Hero Banner */}
      {!viewingDoc && (
        <Box
          sx={{
            p: 3,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(49, 46, 129, 0.25)",
            mb: 3.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: "-0.5px" }}>
              AI Studio
            </Typography>
          </Box>
        </Box>
      )}

      {/* Mode 1: Document Viewer Screen */}
      {viewingDoc ? (
        <DocumentViewer
          doc={viewingDoc}
          onBack={() => setViewingDoc(null)}
          onDelete={viewingDoc.docId ? () => handleDeleteDoc(viewingDoc.docId) : null}
        />
      ) : !selectedToolKey ? (
        /* Mode 2: Tool Selection Grid */
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            AI Tools
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {AI_TOOLS.map((tool) => (
              <Box key={tool.key} sx={{ flex: "1 1 100%" }}>
                <Card
                  onClick={() => {
                    setSelectedToolKey(tool.key);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  sx={{
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      borderColor: tool.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: tool.gradient,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tool.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {tool.title}
                      </Typography>
                    </Box>
                    <Chip label={tool.badge} size="small" sx={{ fontWeight: 800, bgcolor: `${tool.color}15`, color: tool.color }} />
                  </CardContent>
                </Card>
              </Box>
            ))}

            {/* Saved Drafts Button */}
            <Box sx={{ flex: "1 1 100%" }}>
              <Card
                onClick={() => {
                  setSelectedToolKey("saved_drafts");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                sx={{
                  borderRadius: "20px",
                  border: "1px dashed #cbd5e1",
                  bgcolor: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#4f46e5", bgcolor: "#f1f5f9" },
                }}
              >
                <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "#e0e7ff",
                        color: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FolderSpecial />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      Saved Drafts
                    </Typography>
                  </Box>
                  <Chip label="Drafts" size="small" sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3" }} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Stack>
      ) : selectedToolKey === "saved_drafts" ? (
        /* Mode 3: Saved Drafts List View */
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSelectedToolKey(null)}
              sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
            >
              Back
            </Button>
            <Chip icon={<FolderSpecial sx={{ fontSize: 16 }} />} label="Saved" sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3" }} />
          </Box>

          <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Saved Drafts
              </Typography>

              {loadingSaved ? (
                <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={30} /></Box>
              ) : savedDocs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 3, textAlign: "center" }}>
                  No saved drafts found.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {savedDocs.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {doc.type?.toUpperCase()} · {doc.board} {doc.grade} · {doc.subject}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() => {
                            setViewingDoc({
                              type: doc.type,
                              data: doc.content,
                              docId: doc.id,
                              title: doc.title,
                            });
                          }}
                          startIcon={<Edit sx={{ fontSize: 14 }} />}
                          sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", fontSize: 12 }}
                        >
                          View
                        </Button>
                        <IconButton size="small" onClick={() => handleDeleteDoc(doc.id)} color="error">
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : (
        /* Mode 4: Specific Tool Configuration Form View */
        <Stack spacing={2.5}>
          {/* Top Bar with Back Button */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSelectedToolKey(null)}
              sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
            >
              Back
            </Button>

            <Chip
              icon={selectedTool.icon}
              label={selectedTool.title}
              sx={{
                fontWeight: 900,
                bgcolor: `${selectedTool.color}15`,
                color: selectedTool.color,
                px: 1,
              }}
            />
          </Box>

          {/* Form Card */}
          <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Configuration
              </Typography>

              {/* ─── Common Fields ─── */}
              <Stack spacing={1.5}>

                {/* Board + Grade */}
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.2,
                      px: 1.8,
                      borderRadius: "12px",
                      bgcolor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      Board
                    </Typography>
                    <Chip
                      label={schoolBoard}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3" }}
                    />
                  </Box>

                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ fontWeight: 700 }}>Grade</InputLabel>
                    <Select
                      value={grade}
                      label="Grade"
                      onChange={(e) => setGrade(e.target.value)}
                      sx={{ borderRadius: "12px" }}
                    >
                      {ALL_GRADES.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Subject Dropdown */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel sx={{ fontWeight: 700 }}>Subject</InputLabel>
                    <Select
                      value={subject}
                      label="Subject"
                      onChange={(e) => {
                        setSubject(e.target.value);
                        setCustomSubject("");
                      }}
                      disabled={loadingSubjects}
                      sx={{ borderRadius: "12px" }}
                    >
                      {loadingSubjects ? (
                        <MenuItem disabled>
                          <CircularProgress size={16} sx={{ mr: 1 }} /> Loading subjects...
                        </MenuItem>
                      ) : (
                        curriculumSubjects.map((sub) => (
                          <MenuItem key={sub} value={sub}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {sub}
                              <Chip
                                label="Ingested"
                                size="small"
                                sx={{ height: 16, fontSize: 10, bgcolor: "#dcfce7", color: "#15803d" }}
                              />
                            </Box>
                          </MenuItem>
                        ))
                      )}
                      <MenuItem value="other">
                        Other
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Custom Subject Name input if "other" is selected */}
                {isOther && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Subject Name"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Subject Name"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />
                )}

                {/* Multi-Select Chapters Dropdown */}
                {!isOther && (
                  <FormControl size="small" fullWidth>
                    <InputLabel sx={{ fontWeight: 700 }}>Chapter(s)</InputLabel>
                    <Select
                      multiple
                      value={selectedChapters}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedChapters(typeof val === "string" ? val.split(",") : val);
                      }}
                      input={<OutlinedInput label="Chapter(s)" sx={{ borderRadius: "12px" }} />}
                      renderValue={(selected) =>
                        selected.length === 0
                          ? "All Chapters"
                          : selected.map((chapNum) => `Ch ${chapNum}`).join(", ")
                      }
                      disabled={loadingChapters || !subject}
                    >
                      {loadingChapters ? (
                        <MenuItem disabled>
                          <CircularProgress size={16} sx={{ mr: 1 }} /> Loading chapters...
                        </MenuItem>
                      ) : curriculumChapters.length === 0 ? (
                        <MenuItem disabled>
                          <Typography variant="caption">
                            {subject ? "No chapters found for this subject" : "Select a subject first"}
                          </Typography>
                        </MenuItem>
                      ) : (
                        curriculumChapters.map((chap) => (
                          <MenuItem key={chap.number} value={chap.number}>
                            <Checkbox checked={selectedChapters.includes(chap.number)} size="small" />
                            <ListItemText primary={chap.label} />
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                )}

                {/* Common Topic Field */}
                <TextField
                  fullWidth
                  size="small"
                  label="Topic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Topic"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />

                {/* ─── Question Paper Fields ─── */}
                {selectedToolKey === "question_paper" && (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <TextField
                        size="small"
                        label="Marks"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      />
                      <TextField
                        size="small"
                        label="Duration (Min)"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569", display: "block", mb: 1 }}>
                        Question Types
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {["MCQ", "One Word", "Fill in Blanks", "True/False", "Short Answer", "Long Answer"].map((type) => (
                          <FormControlLabel
                            key={type}
                            control={
                              <Checkbox
                                size="small"
                                checked={questionTypes.includes(type)}
                                onChange={() => handleQTypeChange(type)}
                                sx={{ p: 0.5 }}
                              />
                            }
                            label={<Typography variant="caption" sx={{ fontWeight: 700 }}>{type}</Typography>}
                            sx={{ m: 0, minWidth: "calc(50% - 4px)", flexShrink: 0 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                )}

                {/* ─── Lesson Plan Fields ─── */}
                {selectedToolKey === "lesson_plan" && (
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel sx={{ fontWeight: 700 }}>Duration</InputLabel>
                      <Select value={teachingDuration} label="Duration" onChange={(e) => setTeachingDuration(e.target.value)} sx={{ borderRadius: "12px" }}>
                        <MenuItem value="30 mins">30 mins</MenuItem>
                        <MenuItem value="45 mins">45 mins</MenuItem>
                        <MenuItem value="60 mins">60 mins</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel sx={{ fontWeight: 700 }}>Style</InputLabel>
                      <Select value={teachingStyle} label="Style" onChange={(e) => setTeachingStyle(e.target.value)} sx={{ borderRadius: "12px" }}>
                        <MenuItem value="Interactive">Interactive</MenuItem>
                        <MenuItem value="Lecture">Lecture</MenuItem>
                        <MenuItem value="Activity-based">Activity-based</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* ─── Lesson Summary Fields ─── */}
                {selectedToolKey === "lesson_summary" && (
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel sx={{ fontWeight: 700 }}>Length</InputLabel>
                      <Select value={summaryLength} label="Length" onChange={(e) => setSummaryLength(e.target.value)} sx={{ borderRadius: "12px" }}>
                        <MenuItem value="Short">Short</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Detailed">Detailed</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel sx={{ fontWeight: 700 }}>Audience</InputLabel>
                      <Select value={targetAudience} label="Audience" onChange={(e) => setTargetAudience(e.target.value)} sx={{ borderRadius: "12px" }}>
                        <MenuItem value="Student">Student Guide</MenuItem>
                        <MenuItem value="Teacher">Teacher Reference</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* ─── Quiz Fields ─── */}
                {selectedToolKey === "teacher_quiz" && (
                  <Stack spacing={1.5}>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontWeight: 700 }}>Class</InputLabel>
                      <Select value={classId} label="Class" onChange={(e) => setClassId(e.target.value)} sx={{ borderRadius: "12px" }}>
                        {teacherClasses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        label="Questions"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        inputProps={{ min: 3, max: 20 }}
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Due Date"
                        InputLabelProps={{ shrink: true }}
                        value={availableUntil}
                        onChange={(e) => setAvailableUntil(e.target.value)}
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <FormControlLabel
                        control={<Switch checked={showCorrectAnswers} onChange={(e) => setShowCorrectAnswers(e.target.checked)} size="small" />}
                        label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Show Answers</Typography>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={<Switch checked={showExplanations} onChange={(e) => setShowExplanations(e.target.checked)} size="small" />}
                        label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Explanations</Typography>}
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </Stack>
                )}

                {/* Instructions */}
                <TextField
                  fullWidth
                  size="small"
                  label="Instructions (Optional)"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                />
              </Stack>

              <Box sx={{ mt: 2.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
                  sx={{
                    borderRadius: "14px",
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    background: selectedTool.gradient,
                    boxShadow: `0 4px 16px ${selectedTool.color}40`,
                  }}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Feedback Alerts */}
          {errorMsg && <Alert severity="error" sx={{ borderRadius: "14px", fontWeight: 700 }}>{errorMsg}</Alert>}
          {successMsg && <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: "14px", fontWeight: 700 }}>{successMsg}</Alert>}
        </Stack>
      )}
    </Container>
  );
}
