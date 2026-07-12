import {
    Box, Typography, Container, Card, CardContent, CardActionArea,
    Button, TextField, Paper, FormControl, InputLabel, Select, MenuItem,
    Alert, CircularProgress, Stack, Chip, Divider, Avatar, Collapse
} from "@mui/material";
import {
    AutoAwesome, Description, School, ContentPaste, PictureAsPdf,
    History, CalendarToday, ArrowForward, CheckCircleOutline
} from "@mui/icons-material";
import { useMemo, useState } from "react";
import { runTeacherAi, getTeacherAiHistory } from "./teacherAi.api";
import { useTeacherAssignments } from "../teacher-timetable/useTeacherAssignments";
import { marked } from "marked";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

const TOOL_MODES = [
    {
        key: "question_paper",
        label: "Question Paper",
        icon: <Description />,
        gradient: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
        color: "#4f46e5",
        chipColor: "primary",
    },
    {
        key: "lesson_summary",
        label: "Lesson Plan",
        icon: <School />,
        gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
        color: "#ec4899",
        chipColor: "secondary",
    },
];

export default function TeacherAIToolsPage() {
    const [mode, setMode] = useState(null); // null | 'question_paper' | 'lesson_summary' | 'history'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [meta, setMeta] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const { assignments, loading: assignmentsLoading } = useTeacherAssignments();
    const [selectedClass, setSelectedClass] = useState("");

    // Question Paper State
    const [qpTopic, setQpTopic] = useState("");
    const [qpMarks, setQpMarks] = useState("50");

    // Lesson Summary State
    const [lsTopic, setLsTopic] = useState("");

    // History State
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [activeHistoryType, setActiveHistoryType] = useState(null);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);

    const classOptions = useMemo(() => {
        const map = new Map();
        assignments.forEach((a) => {
            const cls = a.Class || a.class;
            if (!cls) return;
            if (!map.has(cls.id)) {
                map.set(cls.id, { id: cls.id, name: cls.class_name });
            }
        });
        return Array.from(map.values());
    }, [assignments]);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await getTeacherAiHistory();
            setHistory(res?.data?.history || []);
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not load history. Please try again.");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectMode = (key) => {
        setMode(key);
        setResult("");
        setMeta(null);
        setErrorMsg("");
        setActiveHistoryType(null);
        setSelectedHistoryId(null);
        if (key === "history") fetchHistory();
    };

    const handleGenerate = async () => {
        if (!mode || mode === "history") return;
        setLoading(true);
        setResult("");
        setMeta(null);
        setErrorMsg("");
        setActiveHistoryType(null);
        try {
            if (!selectedClass) { setErrorMsg("Please select a class."); return; }
            const cls = classOptions.find((c) => String(c.id) === String(selectedClass));
            const classLevel = cls?.name || selectedClass;
            const payload = mode === "question_paper"
                ? { classLevel, chapter: qpTopic, marks: Number(qpMarks || 50) }
                : { classLevel, topic: lsTopic };
            const res = await runTeacherAi(mode, payload);
            setResult(res?.data?.result?.text || "");
            setMeta(res?.data?.result || null);
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not generate content. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    const canGenerate = mode === "question_paper"
        ? !!qpTopic && !!selectedClass && !loading
        : mode === "lesson_summary"
            ? !!lsTopic && !!selectedClass && !loading
            : false;

    const downloadPdf = () => {
        if (!result) return;
        const isQp = activeHistoryType ? (activeHistoryType === "question_paper") : (mode === "question_paper");
        const cls = classOptions.find((c) => String(c.id) === String(selectedClass));
        const classLevelName = cls?.name || "N/A";
        const topicName = isQp ? qpTopic : lsTopic;
        const documentTitle = isQp ? "Question Paper" : "Lesson Plan Summary";

        const element = document.createElement("div");
        element.style.padding = "30px";
        element.style.color = "#1a202c";
        element.style.fontFamily = "'Outfit', sans-serif";
        element.style.lineHeight = "1.6";

        const parsedContent = marked.parse(result || "");
        element.innerHTML = `
            <div style="text-align: center; border-bottom: 3px double #2b6cb0; padding-bottom: 15px; margin-bottom: 25px;">
                <h1 style="margin: 0; color: #1a365d; font-size: 24px; text-transform: uppercase; letter-spacing: 0.5px;">${documentTitle}</h1>
                <p style="margin: 5px 0 0 0; color: #718096; font-size: 13px;">Generated via AI Assistant</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 25px; padding: 12px; background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
                <div><strong>Class Level:</strong> ${classLevelName}</div>
                <div><strong>Topic/Chapter:</strong> ${topicName || "N/A"}</div>
                ${isQp ? `<div><strong>Total Marks:</strong> ${qpMarks}</div>` : ""}
            </div>
            <style>
                h1, h2, h3, h4 { color: #1a365d; margin-top: 15px; margin-bottom: 8px; }
                p { margin-bottom: 10px; }
                ul, ol { padding-left: 20px; margin-bottom: 15px; }
                li { margin-bottom: 5px; }
                hr { margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0; }
                strong { font-weight: bold; }
            </style>
            <div style="font-size: 14px; color: #2d3748;">
                ${parsedContent}
            </div>
        `;

        const opt = {
            margin: [0.5, 0.5],
            filename: `${topicName ? topicName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_") : "document"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        html2pdf().set(opt).from(element).save();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
            " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    };

    const activeToolConfig = TOOL_MODES.find(t => t.key === mode);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 6 }}>
            {/* Hero Header */}
            <Container maxWidth="md" sx={{ pt: 3, px: { xs: 2, md: 3 } }}>

                {/* Tool Picker + History */}
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                        {TOOL_MODES.map((tool) => (
                            <Box
                                key={tool.key}
                                onClick={() => handleSelectMode(tool.key)}
                                sx={{
                                    flex: 1, py: 2.5, px: 2, cursor: "pointer", textAlign: "center",
                                    transition: "background 0.2s",
                                    background: mode === tool.key ? tool.gradient : "transparent",
                                    "&:hover": { background: mode === tool.key ? tool.gradient : "rgba(0,0,0,0.04)" },
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                                }}
                            >
                                <Box sx={{ color: mode === tool.key ? "#fff" : tool.color }}>
                                    {tool.icon}
                                </Box>
                                <Typography variant="caption" fontWeight={700} sx={{ color: mode === tool.key ? "#fff" : "text.primary" }}>
                                    {tool.label}
                                </Typography>
                            </Box>
                        ))}
                        <Box
                            onClick={() => handleSelectMode("history")}
                            sx={{
                                flex: 1, py: 2.5, px: 2, cursor: "pointer", textAlign: "center",
                                transition: "background 0.2s",
                                background: mode === "history" ? "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" : "transparent",
                                "&:hover": { background: mode === "history" ? "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" : "rgba(0,0,0,0.04)" },
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                            }}
                        >
                            <Box sx={{ color: mode === "history" ? "#fff" : "#0f766e" }}>
                                <History />
                            </Box>
                            <Typography variant="caption" fontWeight={700} sx={{ color: mode === "history" ? "#fff" : "text.primary" }}>
                                History
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* Error */}
                <Collapse in={!!errorMsg}>
                    <Alert severity="error" onClose={() => setErrorMsg("")} sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                </Collapse>

                {/* HISTORY VIEW */}
                {mode === "history" && (
                    <Box>
                        {historyLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : history.length === 0 ? (
                            <Paper elevation={0} sx={{ textAlign: "center", py: 8, borderRadius: 3, border: "1px dashed", borderColor: "divider" }}>
                                <History sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                                <Typography variant="h6" color="text.secondary" fontWeight={600}>No saved documents yet</Typography>
                                <Typography variant="body2" color="text.disabled" mt={0.5}>
                                    Generate a question paper or lesson plan to get started.
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={1.5}>
                                {history.map((item) => {
                                    let parsedQuery = {};
                                    try { parsedQuery = JSON.parse(item.user_query); } catch (e) {}

                                    const isQp = item.ai_type === "question_paper";
                                    const toolCfg = TOOL_MODES.find(t => t.key === item.ai_type) || TOOL_MODES[0];
                                    const topic = parsedQuery.chapter || parsedQuery.topic || "Untitled";
                                    const classLevel = parsedQuery.classLevel || "";
                                    const marks = parsedQuery.marks;
                                    const isSelected = selectedHistoryId === item.id;

                                    return (
                                        <Card
                                            key={item.id}
                                            elevation={isSelected ? 4 : 1}
                                            sx={{
                                                borderRadius: 2.5,
                                                border: "1.5px solid",
                                                borderColor: isSelected ? toolCfg.color : "transparent",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <CardActionArea
                                                onClick={() => {
                                                    setResult(item.ai_response);
                                                    setMeta({
                                                        source_type: item.sources?.length ? "rag" : "gemini",
                                                        sources: Array.isArray(item.sources) ? item.sources : []
                                                    });
                                                    setActiveHistoryType(item.ai_type);
                                                    setSelectedHistoryId(item.id);
                                                    if (isQp) {
                                                        setQpTopic(topic);
                                                        setQpMarks(String(parsedQuery.marks || 50));
                                                    } else {
                                                        setLsTopic(topic);
                                                    }
                                                    const matchedClass = classOptions.find(c => c.name === parsedQuery.classLevel);
                                                    if (matchedClass) setSelectedClass(matchedClass.id);
                                                }}
                                            >
                                                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                    <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                                        {/* Type icon circle */}
                                                        <Avatar
                                                            sx={{
                                                                width: 42, height: 42, flexShrink: 0,
                                                                background: toolCfg.gradient,
                                                            }}
                                                        >
                                                            {isQp ? <Description sx={{ fontSize: 20 }} /> : <School sx={{ fontSize: 20 }} />}
                                                        </Avatar>

                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            {/* Type + date row */}
                                                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5} mb={0.5}>
                                                                <Chip
                                                                    label={isQp ? "Question Paper" : "Lesson Plan"}
                                                                    size="small"
                                                                    sx={{
                                                                        background: toolCfg.gradient,
                                                                        color: "#fff",
                                                                        fontWeight: 700,
                                                                        fontSize: "0.68rem",
                                                                        height: 20,
                                                                    }}
                                                                />
                                                                <Stack direction="row" alignItems="center" spacing={0.4}>
                                                                    <CalendarToday sx={{ fontSize: 11, color: "text.disabled" }} />
                                                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>
                                                                        {formatDate(item.createdAt || item.created_at)}
                                                                    </Typography>
                                                                </Stack>
                                                            </Stack>

                                                            {/* Topic */}
                                                            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ mb: 0.3 }}>
                                                                {topic}
                                                            </Typography>

                                                            {/* Class + marks pills */}
                                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                                {classLevel && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                                        Class {classLevel}
                                                                    </Typography>
                                                                )}
                                                                {isQp && marks && (
                                                                    <>
                                                                        <Typography variant="caption" color="text.disabled">·</Typography>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                                            {marks} marks
                                                                        </Typography>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </Box>

                                                        {isSelected
                                                            ? <CheckCircleOutline sx={{ color: toolCfg.color, fontSize: 20, flexShrink: 0 }} />
                                                            : <ArrowForward sx={{ color: "text.disabled", fontSize: 18, flexShrink: 0 }} />
                                                        }
                                                    </Stack>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        )}

                        {/* Result panel when an item is selected */}
                        {result && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 3, borderRadius: 3, p: 3,
                                    border: "1px solid", borderColor: "divider",
                                    bgcolor: "background.paper"
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle1" fontWeight={700}>Preview</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" startIcon={<ContentPaste />} onClick={() => navigator.clipboard.writeText(result)}>
                                            Copy
                                        </Button>
                                        <Button size="small" variant="outlined" startIcon={<PictureAsPdf />} onClick={downloadPdf}>
                                            PDF
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Box
                                    dangerouslySetInnerHTML={{ __html: marked.parse(result || "") }}
                                    sx={{
                                        lineHeight: 1.8,
                                        color: "text.primary",
                                        "& h1, & h2, & h3, & h4": {
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 800,
                                            color: "text.primary",
                                            mt: 2.5,
                                            mb: 1.5,
                                        },
                                        "& p": {
                                            mb: 1.5,
                                        },
                                        "& ul, & ol": {
                                            pl: 3,
                                            mb: 2.5,
                                        },
                                        "& li": {
                                            mb: 0.8,
                                        },
                                        "& hr": {
                                            my: 3,
                                            border: 0,
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                        },
                                        "& strong": {
                                            fontWeight: 700,
                                        }
                                    }}
                                />
                                {meta?.source_type && (
                                    <Typography variant="caption" color="text.disabled" mt={2} display="block">
                                        Source: {meta.source_type === "rag" ? "Textbook (RAG)" : "Gemini"}
                                        {Array.isArray(meta.sources) && meta.sources.length > 0 && ` · ${meta.sources.join(" | ")}`}
                                    </Typography>
                                )}
                            </Paper>
                        )}
                    </Box>
                )}

                {/* GENERATOR VIEW */}
                {mode && mode !== "history" && (
                    <Box>
                        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
                            {/* Color stripe */}
                            <Box sx={{ height: 4, background: activeToolConfig?.gradient }} />
                            <Box sx={{ p: 3 }}>
                                <Stack spacing={2.5}>
                                    {assignmentsLoading && (
                                        <Alert severity="info" icon={<CircularProgress size={16} />}>
                                            Loading your assigned classes…
                                        </Alert>
                                    )}
                                    {!assignmentsLoading && !classOptions.length && (
                                        <Alert severity="warning">No class assignments found for your account.</Alert>
                                    )}

                                    <FormControl fullWidth size="small">
                                        <InputLabel>Class</InputLabel>
                                        <Select
                                            label="Class"
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                        >
                                            {classOptions.map((cls) => (
                                                <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {mode === "question_paper" ? (
                                        <>
                                            <TextField
                                                label="Topic / Chapter"
                                                fullWidth
                                                size="small"
                                                value={qpTopic}
                                                onChange={(e) => setQpTopic(e.target.value)}
                                                placeholder="e.g. Photosynthesis"
                                            />
                                            <TextField
                                                label="Total Marks"
                                                fullWidth
                                                size="small"
                                                type="number"
                                                value={qpMarks}
                                                onChange={(e) => setQpMarks(e.target.value)}
                                                placeholder="e.g. 50"
                                            />
                                        </>
                                    ) : (
                                        <TextField
                                            label="Lesson Topic"
                                            fullWidth
                                            size="small"
                                            multiline
                                            rows={3}
                                            value={lsTopic}
                                            onChange={(e) => setLsTopic(e.target.value)}
                                            placeholder="What are you teaching next session?"
                                        />
                                    )}

                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={handleGenerate}
                                        disabled={!canGenerate}
                                        startIcon={loading ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : <AutoAwesome />}
                                        sx={{
                                            background: activeToolConfig?.gradient,
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            py: 1.3,
                                            "&:disabled": { opacity: 0.5 },
                                        }}
                                    >
                                        {loading
                                            ? (mode === "question_paper" ? "Generating paper…" : "Generating plan…")
                                            : (mode === "question_paper" ? "Generate Question Paper" : "Generate Lesson Plan")
                                        }
                                    </Button>
                                </Stack>
                            </Box>
                        </Paper>

                        {/* Output */}
                        {result && (
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3, p: 3,
                                    border: "1px solid", borderColor: "divider",
                                    bgcolor: "background.paper"
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CheckCircleOutline sx={{ color: "success.main", fontSize: 20 }} />
                                        <Typography variant="subtitle1" fontWeight={700}>Generated</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" startIcon={<ContentPaste />} onClick={() => navigator.clipboard.writeText(result)}>
                                            Copy
                                        </Button>
                                        <Button size="small" variant="outlined" startIcon={<PictureAsPdf />} onClick={downloadPdf}>
                                            PDF
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Box
                                    dangerouslySetInnerHTML={{ __html: marked.parse(result || "") }}
                                    sx={{
                                        lineHeight: 1.8,
                                        color: "text.primary",
                                        "& h1, & h2, & h3, & h4": {
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 800,
                                            color: "text.primary",
                                            mt: 2.5,
                                            mb: 1.5,
                                        },
                                        "& p": {
                                            mb: 1.5,
                                        },
                                        "& ul, & ol": {
                                            pl: 3,
                                            mb: 2.5,
                                        },
                                        "& li": {
                                            mb: 0.8,
                                        },
                                        "& hr": {
                                            my: 3,
                                            border: 0,
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                        },
                                        "& strong": {
                                            fontWeight: 700,
                                        }
                                    }}
                                />
                                {meta?.source_type && (
                                    <Typography variant="caption" color="text.disabled" mt={2} display="block">
                                        Source: {meta.source_type === "rag" ? "Textbook (RAG)" : "Gemini"}
                                        {Array.isArray(meta.sources) && meta.sources.length > 0 && ` · ${meta.sources.join(" | ")}`}
                                    </Typography>
                                )}
                            </Paper>
                        )}

                        {/* Empty state when no result yet */}
                        {!result && !loading && (
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3, py: 7, textAlign: "center",
                                    border: "1.5px dashed", borderColor: "divider",
                                }}
                            >
                                <AutoAwesome sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                    Fill in the details above and generate
                                </Typography>
                                <Typography variant="body2" color="text.disabled" mt={0.5}>
                                    Your AI-generated content will appear here
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* Landing — nothing selected */}
                {!mode && (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3, py: 8, textAlign: "center",
                            border: "1.5px dashed", borderColor: "divider",
                        }}
                    >
                        <AutoAwesome sx={{ fontSize: 48, color: "#818cf8", mb: 2 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            Choose a tool to get started
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            Select Question Paper, Lesson Plan, or view History above
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
