import { Box, Typography, Card, CardContent, Button, Avatar, Chip, Container, Stack, Divider, CircularProgress, Grid } from "@mui/material";
import { Check, Close, Person } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { getTeacherPendingApprovals, approveRequest } from "../approvals.api";
import { useAuth } from "../../../auth/AuthProvider";

const detailFields = [
    "username",
    "name",
    "email",
    "phone",
    "gender",
    "dob",
    "blood_group",
    "address",
    "class",
    "section",
    "father_name",
    "mother_name",
    "guardian_name",
    "admission_no",
    "roll_no",
];

export default function ApprovalsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const res = await getTeacherPendingApprovals();
            const items = res.data?.items ?? res.data ?? [];
            setRequests(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error("Failed to load approvals", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

const handleAction = async (type, id, action) => {
        try {
            await approveRequest(type, id, action);
            // Optimistic update
            setRequests(prev => prev.filter(r => r.id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (err) {
            console.error(`Failed to ${action} request`, err);
            alert(`Failed to ${action} request`);
        }
    };

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Pending Approvals
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review requests from your students
                </Typography>
            </Box>

            {requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Check sx={{ fontSize: 60, color: 'success.light', mb: 2 }} />
                    <Typography variant="h6">All caught up!</Typography>
                    <Typography color="text.secondary">No pending requests to review.</Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {requests.map((req) => {
                        const isExpanded = expandedId === (req.id || req.student_id);
                        const name = req.user?.name || req.User?.name || req.name || "Student";
                        const cleanName = name.replace(/^(Student Class|Student)\s+/gi, '').trim() || "Student";
                        const username = req.user?.username || req.User?.username || "";
                        const avatarUrl = req.user?.avatar_url || req.User?.avatar_url;
                        const initial = name?.[0]?.toUpperCase() || "S";
                        const className = req.class?.class_name || req.class_id || "-";
                        const sectionName = req.section?.name || req.section_id || "-";
                        return (
                        <Card
                            key={req.id || `${req.student_id}-${req.section_id}`}
                            sx={{ overflow: 'visible', cursor: 'pointer', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}
                            onClick={() => setExpandedId(isExpanded ? null : (req.id || req.student_id))}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                    <Avatar
                                        src={avatarUrl}
                                        sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontWeight: 'bold', mt: { xs: 0.5, sm: 0 } }}
                                    >
                                        {initial}
                                    </Avatar>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1rem', color: 'text.primary', lineHeight: 1.2 }}>
                                                    {cleanName}
                                                </Typography>
                                                {username && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', fontWeight: 500, bgcolor: 'action.hover', px: 0.8, py: 0.2, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                                        @{username}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Chip label={req.type || "Profile Update"} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                            Class {className} - Section {sectionName}
                                        </Typography>

                                        {isExpanded && req.changes && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.02)' }}>
                                                <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1, letterSpacing: '0.5px', color: 'text.secondary' }}>
                                                    REQUESTED CHANGES
                                                </Typography>
                                                {Object.entries(req.changes).map(([key, value]) => (
                                                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                                                            {key.replace('_', ' ')}:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                                                            {String(value)}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {isExpanded && (
                                  <>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Stack spacing={2} sx={{ mb: 3 }}>
                                      {/* Academic Info */}
                                      <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                          Academic Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Admission Number</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{req.admission_no || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Roll Number</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.roll_no || '—'}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Box>

                                      <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.08)' }} />

                                      {/* Personal Info */}
                                      <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                          Personal Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Date of Birth</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.dob || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Gender</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{req.gender || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={4}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Blood Group</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase', fontSize: '0.82rem' }}>{req.blood_group || '—'}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Box>

                                      <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.08)' }} />

                                      {/* Family & Contact Details */}
                                      <Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                                          Family & Contact Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Father's Name</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.father_name || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Mother's Name</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.mother_name || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Guardian Name</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.guardian_name || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Contact Email</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.user?.email || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem' }}>Contact Phone</Typography>
                                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>{req.user?.phone || '—'}</Typography>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem', mb: 0.5 }}>Address</Typography>
                                            <Typography 
                                              variant="body2" 
                                              fontWeight="bold" 
                                              sx={{ 
                                                p: 1.5, 
                                                bgcolor: '#f8fafc', 
                                                borderRadius: '8px', 
                                                border: '1px solid rgba(0,0,0,0.03)',
                                                whiteSpace: 'pre-wrap',
                                                fontSize: '0.8rem',
                                                lineHeight: 1.4
                                              }}
                                            >
                                              {req.address || '—'}
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </Box>
                                    </Stack>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Close />}
                                        onClick={(e) => { e.stopPropagation(); handleAction('student_profile', req.id, 'reject'); }}
                                        sx={{ borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', px: 2 }}
                                      >
                                        Reject
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<Check />}
                                        onClick={(e) => { e.stopPropagation(); handleAction('student_profile', req.id, 'approve'); }}
                                        sx={{ borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem', px: 2, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                                      >
                                        Approve
                                      </Button>
                                    </Box>
                                  </>
                                )}

                            </CardContent>
                        </Card>
                        );
                    })}
                </Stack>
            )}
        </Container>
    );
}
