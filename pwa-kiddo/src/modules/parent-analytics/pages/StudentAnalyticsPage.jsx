import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Container,
  Stack,
  Divider,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";
import {
  School,
  CalendarMonth,
  FactCheck,
  ReceiptLong,
  Person,
  ArrowBack,
  CheckCircle,
  Cancel,
  HelpOutline,
  Assignment,
  Schedule,
  ArrowForward,
} from "@mui/icons-material";
import { getStudentAnalytics, getParentChildren } from "../parent-analytics.api";

export default function StudentAnalyticsPage() {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(student_id || null);
  const [children, setChildren] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        // Load parent children first if no student_id is set
        let targetStudentId = selectedChildId;
        if (!targetStudentId) {
          const childrenRes = await getParentChildren();
          const list = childrenRes.data?.data || [];
          setChildren(list);
          if (list.length > 0) {
            targetStudentId = list[0].student?.id;
            setSelectedChildId(targetStudentId);
          } else {
            throw new Error("No approved linked children found for this parent.");
          }
        }

        if (targetStudentId) {
          const res = await getStudentAnalytics(targetStudentId);
          setData(res.data?.data);
          
          // Pre-select first exam report card if available
          const reports = res.data?.data?.report_cards || [];
          if (reports.length > 0) {
            setSelectedExamId(reports[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
        setError(err.response?.data?.message || err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [selectedChildId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          Unable to Load Student Analytics
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error || "We encountered an error loading your child's data."}
        </Typography>
        <Chip label="Go Back to Dashboard" onClick={() => navigate("/parent/dashboard")} color="primary" sx={{ cursor: "pointer" }} />
      </Container>
    );
  }

  const { student, attendance, report_cards, homework_submissions } = data;
  const studentUser = student?.user || student?.User || {};
  const studentName = studentUser?.name || "Student";
  const cleanName = studentName.replace(/^(Student Class|Student)\s+/gi, '').trim() || "Student";
  const studentUsername = studentUser?.username || "";
  const className = student?.class?.class_name || "-";
  const sectionName = student?.section?.name || "-";
  const avatarUrl = studentUser?.avatar_url || "";
  const initial = cleanName?.[0]?.toUpperCase() || "S";

  const totalHomework = homework_submissions?.length || 0;
  const completedHomework = homework_submissions?.filter(h => h.is_completed)?.length || 0;
  const pendingHomework = totalHomework - completedHomework;

  // Selected exam report card marks
  const activeReportCard = report_cards.find(rc => rc.id === selectedExamId);

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
      {/* ── Header Welcome Gradient Card ── */}
      <Card
        sx={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #3f51b5 0%, #673ab7 100%)",
          color: "white",
          boxShadow: "0 8px 30px rgba(63, 81, 181, 0.25)",
          mb: 3,
          overflow: "visible",
          position: "relative"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexDirection: { xs: "column", sm: "row" }, textAlign: { xs: "center", sm: "left" } }}>
            <Avatar
              src={avatarUrl}
              sx={{
                width: 76,
                height: 76,
                bgcolor: "rgba(255,255,255,0.2)",
                border: "3px solid white",
                fontWeight: "bold",
                fontSize: "1.8rem"
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {cleanName}
              </Typography>
              {studentUsername && (
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontWeight: 500 }}>
                  @{studentUsername}
                </Typography>
              )}
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "center", sm: "flex-start" }}
                flexWrap="wrap"
                useFlexGap
                gap={1}
              >
                <Chip
                  icon={<School sx={{ color: "white !important", fontSize: "0.9rem" }} />}
                  label={`Class ${className}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700 }}
                />
                <Chip
                  label={`Section ${sectionName}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700 }}
                />
                <Chip
                  label={`Roll #${student.roll_no || "-"}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700 }}
                />
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Tabs Navigation ── */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          aria-label="Student details tabs"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              textTransform: "none",
            }
          }}
        >
          <Tab icon={<FactCheck sx={{ fontSize: "1.1rem" }} />} label="Overview" iconPosition="start" />
          <Tab icon={<CalendarMonth sx={{ fontSize: "1.1rem" }} />} label="Attendance" iconPosition="start" />
          <Tab icon={<ReceiptLong sx={{ fontSize: "1.1rem" }} />} label="Academics" iconPosition="start" />
          <Tab icon={<Person sx={{ fontSize: "1.1rem" }} />} label="Profile" iconPosition="start" />
        </Tabs>
      </Box>

      {/* ── TAB CONTENT ── */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          {/* Symmetrical Stats Grid */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center", p: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">ATTENDANCE</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                  {attendance.percentage}%
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center", p: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">PENDING HW</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mt: 1 }}>
                  {pendingHomework}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center", p: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">COMPLETED HW</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                  {completedHomework}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center", p: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL EXAMS</Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary.main" sx={{ mt: 1 }}>
                  {report_cards.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Core Analytics Blocks */}
          <Grid container spacing={3}>
            {/* Attendance Circular Card */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Attendance Performance</Typography>
                  <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={attendance.percentage}
                      size={120}
                      thickness={6.5}
                      color={attendance.percentage > 75 ? "success" : attendance.percentage > 60 ? "warning" : "error"}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h5" component="div" fontWeight="bold">
                        {attendance.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", px: 2 }}>
                    {attendance.present_days} present days out of {attendance.total_days} total marked school days.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Homework Submissions List */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Homework submissions</Typography>
                  {homework_submissions.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Assignment sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">No recent homework submissions found.</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {homework_submissions.slice(0, 4).map((sub) => {
                        const isDone = sub.is_completed;
                        return (
                          <Box key={sub.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, bgcolor: "action.hover", borderRadius: "10px" }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight="bold" noWrap>
                                {sub.homework?.description || "Homework Task"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {sub.homework?.subject?.name || "Subject"} • Due {sub.homework?.due_date || "-"}
                              </Typography>
                            </Box>
                            <Chip
                              label={isDone ? "Submitted" : "Pending"}
                              size="small"
                              color={isDone ? "success" : "warning"}
                              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* 2. ATTENDANCE LOG TAB */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {/* Monthly Trend */}
          <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Monthly Attendance Trend</Typography>
              {attendance.monthly.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No monthly summaries available.</Typography>
              ) : (
                <Stack spacing={2}>
                  {attendance.monthly.map((m) => {
                    const pct = m.total ? Math.round((m.present / m.total) * 100) : 0;
                    return (
                      <Box key={m.month}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">{m.month}</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">{pct}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          color={pct > 75 ? "primary" : pct > 60 ? "warning" : "error"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {m.present} present out of {m.total} school days
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Chronological List */}
          <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Recent Attendance Logs</Typography>
              {attendance.history.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ textAlign: "center", py: 4 }}>
                  No attendance history logged.
                </Typography>
              ) : (
                <List disablePadding>
                  {attendance.history.map((log) => {
                    const isPresent = log.status === "present";
                    const isLeave = log.status === "leave";
                    const isAbsent = log.status === "absent";
                    return (
                      <ListItem
                        key={log.id}
                        sx={{
                          px: 1,
                          py: 1.5,
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          "&:last-child": { borderBottom: "none" }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {isPresent ? (
                            <CheckCircle color="success" />
                          ) : isAbsent ? (
                            <Cancel color="error" />
                          ) : isLeave ? (
                            <CheckCircle color="warning" />
                          ) : (
                            <HelpOutline color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(log.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </Typography>
                          }
                        />
                        <Chip
                          label={log.status?.toUpperCase() || "-"}
                          size="small"
                          color={isPresent ? "success" : isAbsent ? "error" : isLeave ? "warning" : "default"}
                          sx={{ fontWeight: 800, fontSize: "0.65rem", height: 18 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* 3. ACADEMICS TAB */}
      {activeTab === 2 && (
        <Stack spacing={3}>
          {/* Exam deck horizontal scroll */}
          {report_cards.length === 0 ? (
            <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", py: 6, textAlign: "center" }}>
              <ReceiptLong sx={{ fontSize: 50, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6">No report cards available yet</Typography>
              <Typography color="text.secondary" variant="body2">Once exams are graded and finalized, report cards will appear here.</Typography>
            </Card>
          ) : (
            <>
              <Box sx={{ overflowX: "auto", display: "flex", gap: 1.5, pb: 1, "::-webkit-scrollbar": { display: "none" } }}>
                {report_cards.map((rc) => {
                  const isSelected = rc.id === selectedExamId;
                  return (
                    <Card
                      key={rc.id}
                      onClick={() => setSelectedExamId(rc.id)}
                      sx={{
                        minWidth: 160,
                        cursor: "pointer",
                        borderRadius: "14px",
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "transparent",
                        bgcolor: isSelected ? "primary.light" : "background.paper",
                        color: isSelected ? "primary.contrastText" : "text.primary",
                        boxShadow: isSelected ? "0 4px 15px rgba(63, 81, 181, 0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {rc.exam?.name || "Exam"}
                        </Typography>
                        <Typography variant="caption" color={isSelected ? "inherit" : "text.secondary"} sx={{ opacity: 0.85, display: "block", mt: 0.5 }}>
                          {rc.exam?.start_date || "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              {/* Active Report Card Marks Details */}
              {activeReportCard && (
                <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {activeReportCard.exam?.name || "Exam Marks Details"}
                      </Typography>
                      <Chip
                        label={activeReportCard.published_at ? "Published" : "Draft (Pending Admin)"}
                        color={activeReportCard.published_at ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    {/* Subject Marks Table/List */}
                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      {activeReportCard.report_card_marks?.map((mark) => {
                        const percentage = mark.max_marks ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
                        return (
                          <Box
                            key={mark.id}
                            sx={{
                              p: 2,
                              borderRadius: "12px",
                              bgcolor: "#f8fafc",
                              border: "1px solid rgba(0,0,0,0.03)",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {mark.subject?.name || "Subject"}
                              </Typography>
                              <Typography variant="body2" fontWeight="black" color="primary">
                                {mark.marks_obtained} / {mark.max_marks} ({percentage}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              color={percentage > 75 ? "success" : percentage > 50 ? "warning" : "error"}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>

                    {/* Remarks Bubble */}
                    {activeReportCard.remarks && (
                      <Box sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.02)" }}>
                        <Typography variant="caption" fontWeight="black" color="text.secondary" display="block" sx={{ mb: 0.5, letterSpacing: 0.5 }}>
                          TEACHER REMARKS
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.primary" }}>
                          "{activeReportCard.remarks}"
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Stack>
      )}

      {/* 4. STUDENT PROFILE TAB */}
      {activeTab === 3 && (
        <Stack spacing={3}>
          {/* Academic Profile */}
          <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Academic Registration Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Admission Number</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>{student.admission_no || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Roll Number</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.roll_no || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Registered Class</Typography>
                  <Typography variant="body2" fontWeight="bold">{className}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Registered Section</Typography>
                  <Typography variant="body2" fontWeight="bold">{sectionName}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Personal Profile */}
          <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Personal Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Date of Birth</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.dob || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Gender</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "capitalize" }}>{student.gender || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Blood Group</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "uppercase" }}>{student.blood_group || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.address || "—"}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Parent/Guardian Details */}
          <Card sx={{ borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Parent & Guardian Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Father's Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.father_name || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Mother's Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.mother_name || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">Guardian Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{student.guardian_name || "—"}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
