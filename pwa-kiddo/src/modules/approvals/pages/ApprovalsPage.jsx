import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
    Container,
    Stack,
    Divider,
    CircularProgress,
    Grid,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
} from "@mui/material";
import { Check, Close, ArrowForward, HelpOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
    getTeacherPendingApprovals,
    approveRequest,
    getTeacherProfileUpdates,
    processProfileUpdate,
} from "../approvals.api";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";

const fieldLabels = {
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    avatar_url: "Profile Photo",
    dob: "Date of Birth",
    gender: "Gender",
    blood_group: "Blood Group",
    father_name: "Father's Name",
    mother_name: "Mother's Name",
    guardian_name: "Guardian Name",
    father_occupation: "Father's Occupation",
    mother_occupation: "Mother's Occupation",
    guardian_occupation: "Guardian's Occupation",
    emergency_contact: "Emergency Contact",
    residential_status: "Residential Status",
    address: "Home Address",
    family_income: "Family Income",
    designation: "Designation",
    qualification: "Qualification",
    experience: "Experience",
};

export default function ApprovalsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState(0);
    const [registrations, setRegistrations] = useState([]);
    const [profileUpdates, setProfileUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Rejection Dialog states
    const [rejectionOpen, setRejectionOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null); // { type, id }
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Feedback Toast
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [regRes, updateRes] = await Promise.all([
                getTeacherPendingApprovals().catch(err => {
                    console.error("Failed to load registrations", err);
                    return { data: { items: [] } };
                }),
                getTeacherProfileUpdates().catch(err => {
                    console.error("Failed to load profile updates", err);
                    return { data: [] };
                }),
            ]);

            const regs = regRes.data?.items ?? regRes.data ?? [];
            const updates = updateRes.data ?? updateRes ?? [];

            setRegistrations(Array.isArray(regs) ? regs : []);
            setProfileUpdates(Array.isArray(updates) ? updates : []);
        } catch (err) {
            console.error("Approvals load failed", err);
            setToast({ open: true, message: "Failed to load approval data.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const showToast = (message, severity = "success") => {
        setToast({ open: true, message, severity });
    };

    const handleAction = async (type, id, action) => {
        if (action === "reject") {
            setRejectTarget({ type, id });
            setRejectionReason("");
            setRejectionOpen(true);
            return;
        }

        try {
            setActionLoading(true);
            if (type === "profile_update") {
                await processProfileUpdate(id, "approve");
                setProfileUpdates(prev => prev.filter(r => r.id !== id));
            } else {
                await approveRequest(type, id, "approve");
                setRegistrations(prev => prev.filter(r => r.id !== id));
            }
            if (expandedId === id) setExpandedId(null);
            showToast("Request approved successfully.");
        } catch (err) {
            console.error(`Failed to approve request`, err);
            showToast("Failed to approve request. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectTarget) return;
        const { type, id } = rejectTarget;
        try {
            setActionLoading(true);
            if (type === "profile_update") {
                await processProfileUpdate(id, "reject", rejectionReason);
                setProfileUpdates(prev => prev.filter(r => r.id !== id));
            } else {
                await approveRequest(type, id, "reject"); // Note: endpoint supports reject reason in path
                setRegistrations(prev => prev.filter(r => r.id !== id));
            }
            setRejectionOpen(false);
            setRejectTarget(null);
            if (expandedId === id) setExpandedId(null);
            showToast("Request rejected successfully.");
        } catch (err) {
            console.error(`Failed to reject request`, err);
            showToast("Failed to reject request. Please try again.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const getFieldDisplay = (field, val) => {
        if (val === null || val === undefined || val === "") return "—";
        if (field === "avatar_url") {
            return (
                <Avatar src={val} sx={{ width: 40, height: 40, border: "1px solid rgba(0,0,0,0.08)" }}>
                    Photo
                </Avatar>
            );
        }
        return String(val);
    };

    const renderRegistrationTab = () => {
        if (registrations.length === 0) {
            return (
                <Box sx={{ textAlign: "center", py: 8, bgcolor: "background.paper", borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)" }}>
                    <Check sx={{ fontSize: 60, color: "success.light", mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold">All caught up!</Typography>
                    <Typography color="text.secondary" variant="body2">No pending student registration approvals.</Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={2}>
                {registrations.map((req) => {
                    const isExpanded = expandedId === req.id;
                    const name = req.user?.name || req.name || "Student";
                    const username = req.user?.username || "";
                    const avatarUrl = req.user?.avatar_url;
                    const initial = name?.[0]?.toUpperCase() || "S";
                    const className = req.class?.class_name || req.class_id || "—";
                    const sectionName = req.section?.name || req.section_id || "—";

                    return (
                        <Card
                            key={req.id}
                            sx={{
                                overflow: "visible",
                                cursor: "pointer",
                                borderRadius: "16px",
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                                transition: "transform 0.15s, box-shadow 0.15s",
                                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    <Avatar src={getAssetUrl(avatarUrl)} sx={{ width: 48, height: 48, bgcolor: "primary.main", fontWeight: "bold" }}>
                                        {initial}
                                    </Avatar>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {name}
                                            </Typography>
                                            <Chip label="Registration" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.5 }}>
                                            {[className, sectionName].filter(Boolean).join("-")} {username && `· @${username}`}
                                        </Typography>
                                    </Box>
                                </Box>

                                {isExpanded && (
                                    <Box onClick={(e) => e.stopPropagation()} sx={{ mt: 2.5 }}>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                                                <Typography variant="body2" fontWeight="bold">{req.user?.email || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                                                <Typography variant="body2" fontWeight="bold">{req.user?.phone || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary" display="block">Date of Birth</Typography>
                                                <Typography variant="body2" fontWeight="bold">{req.dob || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary" display="block">Gender</Typography>
                                                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "capitalize" }}>{req.gender || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <Typography variant="caption" color="text.secondary" display="block">Blood Group</Typography>
                                                <Typography variant="body2" fontWeight="bold">{req.blood_group || "—"}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                                                <Typography variant="body2" fontWeight="bold">{req.address || "—"}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                disabled={actionLoading}
                                                startIcon={<Close />}
                                                onClick={() => handleAction("student", req.id, "reject")}
                                                sx={{ borderRadius: "10px", fontWeight: 800, fontSize: "0.75rem", textTransform: "none" }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                disabled={actionLoading}
                                                startIcon={<Check />}
                                                onClick={() => handleAction("student", req.id, "approve")}
                                                sx={{ borderRadius: "10px", fontWeight: 800, fontSize: "0.75rem", textTransform: "none", bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
                                            >
                                                Approve
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        );
    };

    const renderProfileUpdateTab = () => {
        if (profileUpdates.length === 0) {
            return (
                <Box sx={{ textAlign: "center", py: 8, bgcolor: "background.paper", borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)" }}>
                    <Check sx={{ fontSize: 60, color: "success.light", mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold">All caught up!</Typography>
                    <Typography color="text.secondary" variant="body2">No pending student profile update approvals.</Typography>
                </Box>
            );
        }

        return (
            <Stack spacing={2}>
                {profileUpdates.map((req) => {
                    const isExpanded = expandedId === req.id;
                    const student = req.user?.student || req.user?.Student;
                    const name = req.user?.name || "Student";
                    const className = student?.class?.class_name || student?.class_id || "—";
                    const sectionName = student?.section?.name || student?.section_id || "—";
                    const avatarUrl = req.user?.avatar_url;
                    const initial = name?.[0]?.toUpperCase() || "S";

                    // The requested changes
                    const changes = req.pending_data || {};

                    return (
                        <Card
                            key={req.id}
                            sx={{
                                overflow: "visible",
                                cursor: "pointer",
                                borderRadius: "16px",
                                border: "1px solid rgba(0,0,0,0.05)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                                transition: "transform 0.15s, box-shadow 0.15s",
                                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" },
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    <Avatar src={getAssetUrl(avatarUrl)} sx={{ width: 48, height: 48, bgcolor: "secondary.main", fontWeight: "bold" }}>
                                        {initial}
                                    </Avatar>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {name}
                                            </Typography>
                                            <Chip label="Profile Update" size="small" color="secondary" variant="outlined" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.5 }}>
                                            {[className, sectionName].filter(Boolean).join("-")} · {Object.keys(changes).length} changes requested
                                        </Typography>
                                    </Box>
                                </Box>

                                {isExpanded && (
                                    <Box onClick={(e) => e.stopPropagation()} sx={{ mt: 2.5 }}>
                                        <Divider sx={{ mb: 2 }} />

                                        <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", mb: 1.5 }}>
                                            Requested Field Changes
                                        </Typography>

                                        <Stack spacing={2} sx={{ mb: 3 }}>
                                            {Object.entries(changes).map(([field, newVal]) => {
                                                // Try to resolve current value from User model or nested Student model
                                                const currentVal = req.user[field] !== undefined ? req.user[field] : (student ? student[field] : undefined);
                                                const label = fieldLabels[field] || field;

                                                return (
                                                    <Box
                                                        key={field}
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: "action.hover",
                                                            borderRadius: "12px",
                                                            border: "1px solid rgba(0,0,0,0.03)",
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight="bold" color="text.primary" sx={{ mb: 1, fontSize: "0.85rem" }}>
                                                            {label}
                                                        </Typography>
                                                        <Grid container spacing={1} alignItems="center">
                                                            <Grid item xs={5}>
                                                                <Typography variant="caption" color="text.secondary" display="block">Current Value</Typography>
                                                                <Box sx={{ mt: 0.5, fontSize: "0.8rem", color: "text.secondary" }}>
                                                                    {getFieldDisplay(field, currentVal)}
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={2} sx={{ display: "flex", justifyContent: "center" }}>
                                                                <ArrowForward sx={{ color: "text.secondary", opacity: 0.5 }} />
                                                            </Grid>
                                                            <Grid item xs={5}>
                                                                <Typography variant="caption" color="primary" display="block" fontWeight="bold">New Value</Typography>
                                                                <Box sx={{ mt: 0.5, fontSize: "0.8rem", fontWeight: "bold", color: "primary.main" }}>
                                                                    {getFieldDisplay(field, newVal)}
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>

                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                disabled={actionLoading}
                                                startIcon={<Close />}
                                                onClick={() => handleAction("profile_update", req.id, "reject")}
                                                sx={{ borderRadius: "10px", fontWeight: 800, fontSize: "0.75rem", textTransform: "none" }}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                disabled={actionLoading}
                                                startIcon={<Check />}
                                                onClick={() => handleAction("profile_update", req.id, "approve")}
                                                sx={{ borderRadius: "10px", fontWeight: 800, fontSize: "0.75rem", textTransform: "none", bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
                                            >
                                                Approve
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        );
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                    Approvals Queue
                </Typography>
            </Box>

            <Tabs
                value={tab}
                onChange={(_, v) => { setTab(v); setExpandedId(null); }}
                variant="fullWidth"
                sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": { fontWeight: "bold", textTransform: "none", fontSize: "14px" },
                }}
            >
                <Tab label={`Registrations (${registrations.length})`} />
                <Tab label={`Profile Updates (${profileUpdates.length})`} />
            </Tabs>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : tab === 0 ? (
                renderRegistrationTab()
            ) : (
                renderProfileUpdateTab()
            )}

            {/* Rejection Dialog with Text Input */}
            <Dialog
                open={rejectionOpen}
                onClose={() => !actionLoading && setRejectionOpen(false)}
                PaperProps={{
                    sx: { borderRadius: "20px", p: 1, mx: 2, maxWidth: 360, width: "100%" },
                }}
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>Reject Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Please enter the reason for rejecting this profile/registration request. This helps the student correct the details.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={3}
                        label="Reason for rejection"
                        variant="outlined"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Please upload a clearer profile picture."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setRejectionOpen(false)}
                        disabled={actionLoading}
                        sx={{ flex: 1, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmReject}
                        disabled={actionLoading || !rejectionReason.trim()}
                        sx={{ flex: 1, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                    >
                        {actionLoading ? "Rejecting..." : "Reject"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setToast(prev => ({ ...prev, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
