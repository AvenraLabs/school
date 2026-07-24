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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Quiz,
  People,
  Visibility,
  CheckCircleOutline,
  HourglassEmpty,
  OndemandVideo,
  PlayCircleOutline,
  GetApp,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import api from "../../api/axios";
import { getAssetUrl } from "../../utils/asset";
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
  {
    key: "ai_video",
    title: "AI Lesson Video",
    icon: <OndemandVideo sx={{ fontSize: 32 }} />,
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    badge: "Kling 2.6",
  },
];

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
  const theme = useTheme();

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
  const [selectedTargetKey, setSelectedTargetKey] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [availableUntil, setAvailableUntil] = useState("");

  // Additional Instructions
  const [instructions, setInstructions] = useState("");

  // AI Video Generation State
  const [videoLanguage, setVideoLanguage] = useState("English");
  const [videoDuration, setVideoDuration] = useState("5"); // "5" or "10" seconds
  const [activeVideoJob, setActiveVideoJob] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [teacherVideos, setTeacherVideos] = useState([]);
  const [loadingTeacherVideos, setLoadingTeacherVideos] = useState(false);

  const loadTeacherVideos = async () => {
    setLoadingTeacherVideos(true);
    try {
      const res = await api.get("/ai/videos/teacher/my-videos");
      setTeacherVideos(res.data?.data?.videos || []);
    } catch (err) {
      console.error("Failed to load teacher videos:", err);
    } finally {
      setLoadingTeacherVideos(false);
    }
  };

  // Curriculum metadata state (PostgreSQL)
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [curriculumChapters, setCurriculumChapters] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Quiz Assignments History & Results State
  const [teacherQuizzes, setTeacherQuizzes] = useState([]);
  const [loadingTeacherQuizzes, setLoadingTeacherQuizzes] = useState(false);
  const [selectedQuizSubmissions, setSelectedQuizSubmissions] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

  const loadTeacherQuizzes = async () => {
    setLoadingTeacherQuizzes(true);
    try {
      const res = await api.get("/quizzes/teacher/my-quizzes");
      setTeacherQuizzes(res.data?.quizzes || []);
    } catch (err) {
      console.error("Failed to load teacher quizzes:", err);
    } finally {
      setLoadingTeacherQuizzes(false);
    }
  };

  const loadQuizSubmissions = async (quizId) => {
    setLoadingSubmissions(true);
    setSubmissionsModalOpen(true);
    try {
      const res = await api.get(`/quizzes/teacher/${quizId}/submissions`);
      setSelectedQuizSubmissions(res.data);
    } catch (err) {
      console.error("Failed to load quiz submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (selectedToolKey === "quiz_history") {
      loadTeacherQuizzes();
    }
  }, [selectedToolKey]);

  const selectedTool = useMemo(
    () => AI_TOOLS.find((t) => t.key === selectedToolKey),
    [selectedToolKey, AI_TOOLS]
  );

  const teacherClasses = useMemo(() => {
    const list = [];
    const seen = new Set();
    assignments.forEach((a) => {
      const cls = a.Class || a.class;
      const sec = a.Section || a.section;
      if (cls) {
        const cId = cls.id;
        const sId = sec?.id || null;
        const key = `${cId}-${sId || 0}`;
        if (!seen.has(key)) {
          seen.add(key);
          const name = sec
            ? `${cls.class_name} - ${sec.name || sec.section_name || "Section"}`
            : cls.class_name;
          list.push({ key, classId: cId, sectionId: sId, name });
        }
      }
    });
    return list;
  }, [assignments]);

  const isOther = subject === "other";
  const rawSubject = isOther ? (customSubject.trim() || "General") : subject;
  const resolvedSubject = (rawSubject || "General").replace(/\b\w/g, (char) => char.toUpperCase());

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
    } else if (selectedToolKey === "generated_videos") {
      loadTeacherVideos();
    }
  }, [selectedToolKey]);

  const handleQTypeChange = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const pollVideoJobStatus = useCallback(async (jobId) => {
    let count = 0;
    const timer = setInterval(async () => {
      count++;
      try {
        const res = await api.get(`/ai/videos/${jobId}`);
        const jobData = res.data?.data;
        if (jobData) {
          setActiveVideoJob(jobData);
          if (jobData.status === "completed" || jobData.status === "failed") {
            clearInterval(timer);
            loadTeacherVideos();
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
      if (count > 120) clearInterval(timer);
    }, 5000);
  }, []);

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

      const targetObj = teacherClasses.find((c) => c.key === selectedTargetKey) || teacherClasses[0];
      const targetClassId = targetObj?.classId || null;
      const targetSectionId = targetObj?.sectionId || null;

      // Auto-capitalize first letter of each word in topic/title
      const formattedTitle = title.trim().replace(/\b\w/g, (char) => char.toUpperCase());

      // AI Video Feature Handling
      if (selectedToolKey === "ai_video") {
        if (!title || !title.trim()) {
          setErrorMsg("Please enter a Video Topic.");
          setLoading(false);
          return;
        }

        const videoRes = await api.post("/ai/videos", {
          classId: targetClassId || grade,
          sectionId: targetSectionId,
          subjectName: resolvedSubject,
          topic: formattedTitle,
          language: videoLanguage,
          duration: videoDuration,
        });

        const job = videoRes.data?.data;
        if (job && job.jobId) {
          setActiveVideoJob({
            id: job.jobId,
            status: "processing",
            topic: formattedTitle,
            subjectName: resolvedSubject,
            duration: videoDuration,
          });
          setVideoModalOpen(true);
          setSelectedToolKey(null);
          pollVideoJobStatus(job.jobId);
        }
        setLoading(false);
        return;
      }

      // Anti-spam input caps
      const safeNumQ = Math.min(Math.max(Number(numQuestions) || 5, 1), 50);
      const safeMarks = Math.min(Math.max(Number(totalMarks) || 10, 1), 500);
      const safeDur = Math.min(Math.max(Number(duration) || 15, 1), 300);

      const res = await generateTeacherAiApi({
        feature: selectedToolKey,
        board: schoolBoard,
        grade: `Class ${grade}`,
        subject: resolvedSubject,
        topic: formattedTitle,
        chapters: chaptersList,
        skipRag: isOther,
        title: formattedTitle,
        examName,
        totalMarks: safeMarks,
        duration: safeDur,
        numQuestions: safeNumQ,
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
        classId: targetClassId,
        sectionId: targetSectionId,
        instructions,
      });

      const generatedData = res.data?.data || res.data;
      const docTitle = title || generatedData?.title || `${resolvedSubject} ${selectedTool?.title || "Document"}`;

      if (selectedToolKey === "teacher_quiz") {
        setSuccessMsg(`Quiz successfully published to ${targetObj?.name || "selected Class & Section"}! Students can now attempt this quiz in their app.`);
        setSelectedToolKey(null);
        return;
      }

      // For Question Paper, Lesson Plan, Lesson Summary: Auto-save draft & open Document Viewer
      let docId = null;
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
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AutoAwesome color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: "text.primary", fontFamily: "'Outfit', sans-serif" }}>
              AI Tools
            </Typography>
          </Stack>

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

            {/* Quiz Assignments & Results Button */}
            <Box sx={{ flex: "1 1 100%" }}>
              <Card
                onClick={() => {
                  setSelectedToolKey("quiz_history");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                sx={{
                  borderRadius: "20px",
                  border: "1px dashed #10b981",
                  bgcolor: "#f0fdf4",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#059669", bgcolor: "#dcfce7" },
                }}
              >
                <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "#d1fae5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Quiz />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      Quiz History
                    </Typography>
                  </Box>
                  <Chip label="Quizzes" size="small" sx={{ fontWeight: 800, bgcolor: "#d1fae5", color: "#065f46" }} />
                </CardContent>
              </Card>
            </Box>

            {/* Generated AI Videos History Button */}
            <Box sx={{ flex: "1 1 100%" }}>
              <Card
                onClick={() => {
                  setSelectedToolKey("generated_videos");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                sx={{
                  borderRadius: "20px",
                  border: "1px dashed #8b5cf6",
                  bgcolor: "#f3e8ff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "#7c3aed", bgcolor: "#e9d5ff" },
                }}
              >
                <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "#ddd6fe",
                        color: "#7c3aed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <OndemandVideo />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      Generated Videos
                    </Typography>
                  </Box>
                  <Chip label="Videos" size="small" sx={{ fontWeight: 800, bgcolor: "#ddd6fe", color: "#6b21a8" }} />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Stack>
      ) : selectedToolKey === "generated_videos" ? (
        /* Mode: Generated AI Videos View */
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSelectedToolKey(null)}
              sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
            >
              Back
            </Button>
            <Chip icon={<OndemandVideo sx={{ fontSize: 16 }} />} label="AI Videos" sx={{ fontWeight: 800, bgcolor: "#f3e8ff", color: "#6b21a8" }} />
          </Box>

          <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Generated Videos
              </Typography>

              {loadingTeacherVideos ? (
                <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={30} /></Box>
              ) : teacherVideos.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 3, textAlign: "center" }}>
                  No generated videos found. Select "AI Lesson Video" above to generate your first video!
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {teacherVideos.map((vid) => (
                    <Box
                      key={vid.id}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#fafafa",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            {vid.topic}
                          </Typography>
                          <Chip
                            label={vid.status === "completed" ? `${vid.duration || 5}s HD` : vid.status}
                            size="small"
                            color={vid.status === "completed" ? "success" : vid.status === "failed" ? "error" : "warning"}
                            sx={{ fontWeight: 800, height: 22, fontSize: 11 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {vid.subject_name || "General"} • {vid.language || "English"}
                        </Typography>
                      </Box>

                      {vid.status === "completed" && vid.video_url ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayCircleOutline />}
                          onClick={() => {
                            setActiveVideoJob({
                              id: vid.id,
                              status: "completed",
                              videoUrl: vid.video_url,
                              topic: vid.topic,
                            });
                            setVideoModalOpen(true);
                          }}
                          sx={{
                            borderRadius: "10px",
                            fontWeight: 800,
                            textTransform: "none",
                            bgcolor: "#8b5cf6",
                            "&:hover": { bgcolor: "#7c3aed" },
                          }}
                        >
                          Watch Video
                        </Button>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : selectedToolKey === "quiz_history" ? (
        /* Mode: Quiz History */
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSelectedToolKey(null)}
              sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
            >
              Back
            </Button>
            <Chip icon={<Quiz sx={{ fontSize: 16 }} />} label="Quiz History" sx={{ fontWeight: 800, bgcolor: "#d1fae5", color: "#065f46" }} />
          </Box>

          <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Quiz History
              </Typography>

              {loadingTeacherQuizzes ? (
                <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={30} /></Box>
              ) : teacherQuizzes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 3, textAlign: "center" }}>
                  No quiz history found.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {teacherQuizzes.map((quiz) => (
                    <Box
                      key={quiz.id}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        border: "1px solid #f1f5f9",
                        bgcolor: "#fafafa",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            {quiz.title}
                          </Typography>
                          <Chip
                            label={quiz.target_class || "Class 6-A"}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: theme.palette.primary.main + "15", color: theme.palette.primary.main, height: 22, fontSize: 11 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {quiz.subject} • {quiz.total_marks} Marks
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => loadQuizSubmissions(quiz.id)}
                        sx={{
                          borderRadius: "10px",
                          fontWeight: 800,
                          textTransform: "none",
                          bgcolor: theme.palette.primary.main,
                          "&:hover": { bgcolor: theme.palette.primary.dark },
                          whiteSpace: "nowrap",
                        }}
                      >
                        View Results ({quiz.submissions_count})
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Submissions Detail Dialog */}
          <Dialog
            open={submissionsModalOpen}
            onClose={() => setSubmissionsModalOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: "20px",
                m: 2,
                maxHeight: "85vh",
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", pb: 1, pt: 2.5, px: 2.5 }}>
              {selectedQuizSubmissions?.quiz?.title || "Quiz Results"}
            </DialogTitle>
            <DialogContent sx={{ px: 2.5, py: 1 }}>
              {loadingSubmissions ? (
                <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={28} /></Box>
              ) : selectedQuizSubmissions ? (
                <Stack spacing={1.5}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip
                      label={`Completed: ${selectedQuizSubmissions.completed_count}`}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 800 }}
                    />
                    <Chip
                      label={`Pending: ${selectedQuizSubmissions.pending_count}`}
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {selectedQuizSubmissions.students.map((st) => (
                      <Box
                        key={st.student_id}
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          border: "1px solid #f1f5f9",
                          bgcolor: st.status === "completed" ? "#f0fdf4" : "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0 }}>
                          <Avatar src={getAssetUrl(st.avatar_url)} sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>
                            {st.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {st.name}
                          </Typography>
                        </Box>

                        {st.status === "completed" ? (
                          <Chip
                            label={`${st.score}/${st.total_marks}`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, height: 22, fontSize: 11 }}
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{ fontWeight: 700, height: 22, fontSize: 11, bgcolor: "#fef3c7", color: "#d97706" }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              ) : null}
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button onClick={() => setSubmissionsModalOpen(false)} sx={{ fontWeight: 800, textTransform: "none" }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
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
                          {doc.type?.replace("_", " ")?.toUpperCase()} · {doc.grade} · {doc.subject}
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

                {/* Grade */}
                <FormControl size="small" fullWidth>
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomSubject(val.replace(/\b\w/g, (char) => char.toUpperCase()));
                    }}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val.replace(/\b\w/g, (char) => char.toUpperCase()));
                  }}
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
                      <InputLabel sx={{ fontWeight: 700 }}>Class & Section</InputLabel>
                      <Select value={selectedTargetKey} label="Class & Section" onChange={(e) => setSelectedTargetKey(e.target.value)} sx={{ borderRadius: "12px" }}>
                        {teacherClasses.map((c) => <MenuItem key={c.key} value={c.key}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        label="Questions (Max 50)"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.min(Math.max(1, Number(e.target.value) || 1), 50))}
                        inputProps={{ min: 1, max: 50 }}
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

                {/* ─── AI Video Fields ─── */}
                {selectedToolKey === "ai_video" && (
                  <Stack spacing={1.5}>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontWeight: 700 }}>Class & Section</InputLabel>
                      <Select value={selectedTargetKey} label="Class & Section" onChange={(e) => setSelectedTargetKey(e.target.value)} sx={{ borderRadius: "12px" }}>
                        {teacherClasses.map((c) => <MenuItem key={c.key} value={c.key}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel sx={{ fontWeight: 700 }}>Language</InputLabel>
                        <Select value={videoLanguage} label="Language" onChange={(e) => setVideoLanguage(e.target.value)} sx={{ borderRadius: "12px" }}>
                          <MenuItem value="English">English</MenuItem>
                          <MenuItem value="Hindi">Hindi</MenuItem>
                          <MenuItem value="Telugu">Telugu</MenuItem>
                          <MenuItem value="Tamil">Tamil</MenuItem>
                          <MenuItem value="Kannada">Kannada</MenuItem>
                          <MenuItem value="Marathi">Marathi</MenuItem>
                          <MenuItem value="Spanish">Spanish</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel sx={{ fontWeight: 700 }}>Duration</InputLabel>
                        <Select value={videoDuration} label="Duration" onChange={(e) => setVideoDuration(e.target.value)} sx={{ borderRadius: "12px" }}>
                          <MenuItem value="5">5 Seconds</MenuItem>
                          <MenuItem value="10">10 Seconds</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                )}
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

      {/* ─── Video Generation / Player Modal ─── */}
      <Dialog
        open={videoModalOpen}
        onClose={() => {
          if (activeVideoJob?.status === "processing") return;
          setVideoModalOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <OndemandVideo sx={{ color: "#8b5cf6" }} />
          {activeVideoJob?.topic || "AI Video Generator"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {activeVideoJob?.status === "processing" || activeVideoJob?.status === "pending" ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <CircularProgress size={44} sx={{ color: "#8b5cf6", mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Generating HD Educational Video...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 1 }}>
                Kling 2.6 AI is animating <b>{activeVideoJob?.topic}</b> for Grade {grade}.
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2 }}>
                This usually takes 1-2 minutes. You can leave this open while it renders.
              </Typography>
            </Box>
          ) : activeVideoJob?.status === "completed" && activeVideoJob?.videoUrl ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", bgcolor: "#000000" }}>
                <video
                  src={getAssetUrl(activeVideoJob.videoUrl)}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "350px", display: "block" }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                component="a"
                href={getAssetUrl(activeVideoJob.videoUrl)}
                download
                target="_blank"
                sx={{ borderRadius: "12px", fontWeight: 800, textTransform: "none", bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
              >
                Download MP4 Video
              </Button>
            </Stack>
          ) : (
            <Box sx={{ py: 2 }}>
              <Alert severity="error" sx={{ borderRadius: "12px", fontWeight: 700 }}>
                {activeVideoJob?.errorMessage || "Video generation failed. Please try again."}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setVideoModalOpen(false)}
            disabled={activeVideoJob?.status === "processing"}
            sx={{ fontWeight: 800, textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
