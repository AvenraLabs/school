import { Box, Typography, Container, Grid, Card, CardContent, Button, TextField, Tab, Tabs, Paper, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Stack, Chip } from "@mui/material";
import { AutoAwesome, Description, School, ContentPaste, PictureAsPdf, History } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { runTeacherAi, getTeacherAiHistory } from "./teacherAi.api";
import { useTeacherAssignments } from "../teacher-timetable/useTeacherAssignments";

export default function TeacherAIToolsPage() {
    const [tab, setTab] = useState(0);
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

    const handleTabChange = (e, newValue) => {
        setTab(newValue);
        setResult("");
        setMeta(null);
        setErrorMsg("");
        setActiveHistoryType(null);
        if (newValue === 2) {
            fetchHistory();
        }
    };

    const handleGenerate = async (type) => {
        setLoading(true);
        setResult("");
        setMeta(null);
        setErrorMsg("");
        setActiveHistoryType(null);
        try {
            if (!selectedClass) {
                setErrorMsg("Please select a class.");
                return;
            }

            const cls = classOptions.find((c) => String(c.id) === String(selectedClass));
            const classLevel = cls?.name || selectedClass;

            const payload =
                type === "question_paper"
                    ? { classLevel, chapter: qpTopic, marks: Number(qpMarks || 50) }
                    : { classLevel, topic: lsTopic };

            const res = await runTeacherAi(type, payload);
            const output = res?.data?.result?.text || "";
            setResult(output);
            setMeta(res?.data?.result || null);
        } catch (err) {
            console.error(err);
            setErrorMsg("Could not generate content. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = () => {
        if (!result) return;
        const isQp = activeHistoryType ? (activeHistoryType === "question_paper") : (tab === 0);
        const cls = classOptions.find((c) => String(c.id) === String(selectedClass));
        const classLevelName = cls?.name || "N/A";
        const topicName = isQp ? qpTopic : lsTopic;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
            <head>
                <title>${isQp ? "Question Paper" : "Lesson Plan Summary"}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        padding: 40px;
                        color: #1a202c;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px double #2b6cb0;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #1a365d;
                        font-size: 28px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .header p {
                        margin: 5px 0 0 0;
                        color: #718096;
                        font-size: 14px;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 30px;
                        padding: 15px;
                        background-color: #f7fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    .meta-item {
                        margin-bottom: 5px;
                    }
                    .content {
                        white-space: pre-wrap;
                        font-size: 16px;
                        color: #2d3748;
                    }
                    @media print {
                        body {
                            padding: 0;
                            max-width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${isQp ? "Question Paper" : "Lesson Plan Summary"}</h1>
                    <p>Generated via Teacher AI Assistant</p>
                </div>
                <div class="meta-grid">
                    <div class="meta-item"><strong>Subject:</strong> General / Academic</div>
                    <div class="meta-item"><strong>Class Level:</strong> ${classLevelName}</div>
                    <div class="meta-item"><strong>Topic/Chapter:</strong> ${topicName || "N/A"}</div>
                    ${isQp ? `<div class="meta-item"><strong>Total Marks:</strong> ${qpMarks}</div>` : ""}
                </div>
                <div class="content">${result}</div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="bold" sx={{ background: 'linear-gradient(45deg, #4f46e5, #ec4899)', backgroundClip: 'text', color: 'transparent', mb: 2 }}>
                    Teacher's AI Assistant
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Automate your academic preparation with generative AI
                </Typography>
            </Box>

            <Paper sx={{ mb: 4 }}>
                <Tabs value={tab} onChange={handleTabChange} centered variant="fullWidth">
                    <Tab icon={<Description />} label="Question Paper Generator" />
                    <Tab icon={<School />} label="Lesson Plan Summary" />
                    <Tab icon={<History />} label="Saved / History" />
                </Tabs>
            </Paper>

            <Grid container spacing={4}>
                {/* Input Section */}
                <Grid item xs={12} md={5}>
                    {tab === 2 ? (
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <History color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Saved Documents</Typography>
                                </Box>

                                {errorMsg && (
                                    <Alert severity="error" onClose={() => setErrorMsg("")}>
                                        {errorMsg}
                                    </Alert>
                                )}

                                {historyLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : history.length === 0 ? (
                                    <Typography color="text.secondary">No saved documents found.</Typography>
                                ) : (
                                    <Stack spacing={2} sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                                        {history.map((item) => {
                                            let parsedQuery = {};
                                            try {
                                                parsedQuery = JSON.parse(item.user_query);
                                            } catch (e) {}

                                            const isQp = item.ai_type === "question_paper";
                                            const topic = parsedQuery.chapter || parsedQuery.topic || "N/A";
                                            const dateStr = new Date(item.createdAt || item.created_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            });

                                            return (
                                                <Card 
                                                    key={item.id} 
                                                    variant="outlined" 
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        borderColor: result === item.ai_response ? 'primary.main' : 'divider',
                                                        bgcolor: result === item.ai_response ? 'action.selected' : 'background.paper',
                                                        '&:hover': { bgcolor: 'action.hover' }
                                                    }}
                                                    onClick={() => {
                                                        setResult(item.ai_response);
                                                        setMeta({
                                                            source_type: item.sources && item.sources.length ? "rag" : "gemini",
                                                            sources: Array.isArray(item.sources) ? item.sources : []
                                                        });
                                                        setActiveHistoryType(item.ai_type);
                                                        // populate states
                                                        if (isQp) {
                                                            setQpTopic(topic);
                                                            setQpMarks(String(parsedQuery.marks || 50));
                                                        } else {
                                                            setLsTopic(topic);
                                                        }
                                                        const matchedClass = classOptions.find(c => c.name === parsedQuery.classLevel);
                                                        if (matchedClass) {
                                                            setSelectedClass(matchedClass.id);
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                            <Chip 
                                                                label={isQp ? "Question Paper" : "Lesson Plan"} 
                                                                size="small" 
                                                                color={isQp ? "primary" : "secondary"} 
                                                                variant="outlined"
                                                            />
                                                            <Typography variant="caption" color="text.secondary">
                                                                {dateStr}
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                            {topic}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Class: {parsedQuery.classLevel || "N/A"}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesome color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Configuration</Typography>
                                </Box>

                                {assignmentsLoading && (
                                    <Alert severity="info">
                                        Loading your assigned classes and subjects...
                                    </Alert>
                                )}
                                {errorMsg && (
                                    <Alert severity="error" onClose={() => setErrorMsg("")}>
                                        {errorMsg}
                                    </Alert>
                                )}

                                {!assignmentsLoading && !classOptions.length && (
                                    <Alert severity="warning">
                                        No class assignments found for your account.
                                    </Alert>
                                )}

                                <FormControl fullWidth>
                                    <InputLabel>Class</InputLabel>
                                    <Select
                                        label="Class"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        {classOptions.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {tab === 0 ? (
                                    <>
                                        <TextField
                                            label="Topic / Chapter"
                                            fullWidth
                                            value={qpTopic}
                                            onChange={(e) => setQpTopic(e.target.value)}
                                            placeholder="e.g. Photosynthesis"
                                        />
                                        <TextField
                                            label="Total Marks"
                                            fullWidth
                                            type="number"
                                            value={qpMarks}
                                            onChange={(e) => setQpMarks(e.target.value)}
                                            placeholder="e.g. 50"
                                        />
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => handleGenerate('question_paper')}
                                            disabled={loading || !qpTopic || !selectedClass}
                                            sx={{ mt: 2, background: 'linear-gradient(45deg, #4f46e5, #818cf8)' }}
                                        >
                                            {loading ? "Generating..." : "Generate Question Paper"}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <TextField
                                            label="Lesson Topic"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={lsTopic}
                                            onChange={(e) => setLsTopic(e.target.value)}
                                            placeholder="What are you teaching next session?"
                                        />
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => handleGenerate('lesson_summary')}
                                            disabled={loading || !lsTopic || !selectedClass}
                                            sx={{ mt: 2, background: 'linear-gradient(45deg, #ec4899, #f472b6)' }}
                                        >
                                            {loading ? "Summarizing..." : "Generate Summary"}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Output Section */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                        <CardContent sx={{ height: '100%', minHeight: 400 }}>
                            {result ? (
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}
                                    >
                                        {result}
                                    </Typography>
                                    {meta && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Source: {meta.source_type === "rag" ? "Textbook (RAG)" : "Gemini"}
                                            </Typography>
                                            {Array.isArray(meta.sources) && meta.sources.length > 0 && (
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {meta.sources.join(" | ")}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button startIcon={<ContentPaste />} onClick={() => navigator.clipboard.writeText(result)}>
                                            Copy to Clipboard
                                        </Button>
                                        <Button startIcon={<PictureAsPdf />} variant="outlined" onClick={downloadPdf}>
                                            Download PDF
                                        </Button>
                                    </Stack>
                                </Box>
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <Typography variant="h6">
                                        {errorMsg ? "We couldn't generate content. Please adjust inputs or retry." : "AI output will appear here..."}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
