import { Card, CardContent, Typography, Stack, Box, Chip, Button, Divider } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { getMyTeacherTimetable } from "../teacher-timetable/teacherTimetable.api";
import { AccessTime, School, ArrowForward, CalendarMonth } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Helper function to format time (e.g. "09:00:00" -> "09:00 AM")
function formatTime(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export default function TeacherUpcomingClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const today = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();
      const res = await getMyTeacherTimetable();
      const grouped = res.data?.data || res.data || {};
      setClasses(grouped[today] || []);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card 
      sx={{ 
        borderRadius: '20px', 
        border: '1px solid rgba(0,0,0,0.05)', 
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 850, letterSpacing: '-0.3px', fontSize: '1.05rem', color: 'text.primary' }}>
              Today's Schedule
            </Typography>
          </Box>
          <Chip 
            label={`${classes.length} Classes`} 
            size="small" 
            sx={{ 
              fontWeight: 800, 
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12), 
              color: 'primary.main', 
              fontSize: '0.7rem',
              height: 20
            }} 
          />
        </Box>
 
        <Stack spacing={2} sx={{ mt: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant="caption" color="text.secondary">Loading classes...</Typography>
            </Box>
          ) : classes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, px: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.06)' }}>
              <School sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.7 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 0.5 }}>
                No classes today
              </Typography>
              <Typography variant="caption" color="text.disabled" display="block">
                Enjoy your free day or prepare your lesson materials!
              </Typography>
            </Box>
          ) : (
            classes.map((c, index) => (
              <Box key={c.id}>
                {index > 0 && <Divider sx={{ my: 1.5, borderColor: 'rgba(0,0,0,0.04)' }} />}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, flex: 1, minWidth: 0 }}>
                    {/* Left vertical status line */}
                    <Box 
                      sx={{ 
                        width: 4, 
                        borderRadius: 2, 
                        bgcolor: 'primary.main', 
                        alignSelf: 'stretch' 
                      }} 
                    />
                    
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: 'text.primary', fontSize: { xs: '0.85rem', sm: '0.92rem' }, mb: 0.3 }}>
                        {c.subject?.name || "Subject"}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`Class ${c.class?.class_name || c.class?.name || c.class_id} (${c.section?.name ?? c.section_id})`}
                          size="small"
                          sx={{ 
                            height: 18, 
                            fontSize: '0.62rem', 
                            fontWeight: 800, 
                            bgcolor: '#f1f5f9', 
                            color: '#475569',
                            borderRadius: '4px'
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: 'text.secondary' }}>
                          <AccessTime sx={{ fontSize: 13 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                            {formatTime(c.start_time)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
 
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    sx={{ 
                      borderRadius: '8px', 
                      fontWeight: 800, 
                      fontSize: { xs: '0.62rem', sm: '0.68rem' }, 
                      py: { xs: 0.5, sm: 0.6 },
                      px: { xs: 1, sm: 1.5 },
                      boxShadow: 'none',
                      flexShrink: 0
                    }}
                    onClick={() => navigate(`/teacher/attendance?class_id=${c.class_id}&section_id=${c.section_id}`)}
                  >
                    Attendance
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Stack>

        <Divider sx={{ mt: classes.length > 0 ? 2 : 0, mb: 1, borderColor: 'rgba(0,0,0,0.06)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            color="primary"
            endIcon={<ArrowForward sx={{ fontSize: '10px' }} />}
            onClick={() => navigate('/teacher/timetable')}
            sx={{ 
              fontWeight: 800, 
              fontSize: '0.75rem',
              textTransform: 'none',
              mt: 0.5
            }}
          >
            View Full Timetable
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
