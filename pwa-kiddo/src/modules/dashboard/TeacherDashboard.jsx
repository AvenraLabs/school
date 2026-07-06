import { Box } from "@mui/material";
import TeacherUpcomingClasses from "./TeacherUpcomingClasses";

export default function TeacherDashboard({ data }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
      {/* Section 1: Today's Schedule */}
      <TeacherUpcomingClasses />
    </Box>
  );
}
