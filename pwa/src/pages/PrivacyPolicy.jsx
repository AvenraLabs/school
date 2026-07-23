import { Container, Typography, Paper, Box, Divider, Button, Stack } from "@mui/material";
import { ArrowBack, AutoAwesome } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 4 }}>
      <Container maxWidth="md">
        {/* Navigation / Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Back to Login
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="900">
              SchoolIQ
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ p: 4, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <Typography variant="h4" fontWeight="950" sx={{ mb: 2, fontFamily: "'Outfit', sans-serif" }}>
            Privacy Policy
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3, fontWeight: 700 }}>
            Last Updated: July 8, 2026
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                1. Information We Collect
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We collect personal information necessary to deliver educational tracking services. This includes student names, roll numbers, teacher names, parent contact numbers, and school registration info. We also store photos and documents uploaded during general features like Lost & Found or homework assignments.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                2. Student & Teacher Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student and teacher data is kept highly confidential and scoped strictly under their registered tenant school. We apply strict database scoping and access control policies to prevent unauthorized data leaks.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                3. AI Usage & Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our educational helpers utilize generative AI technology (such as Gemini) to provide academic assistance, grade help, and teacher planning logs. AI interactions are audited, logged, and tracked for quota limits. Sensitive or identifiable personal data is stripped before communication with AI providers.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                4. WhatsApp Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We dispatch critical school notifications, attendance alerts, exam results, and transport schedules to parents' phone numbers via WhatsApp API. Users can configure alert preferences from the profile settings panel.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                5. GPS Transport Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our application implements GPS position tracking on driver mobile devices for monitoring school bus coordinates during active routes. Coordinates are only broadcast when a trip is active and are shared only with the respective student/parent tenants mapped to the vehicle.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                6. Data Protection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All data is encrypted in transit using industry-standard SSL/TLS protocols and stored securely in dedicated PostgreSQL databases. Access logs and operations are tracked to avoid privilege escalation.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                7. Contact Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For questions regarding data practices or to request data deletion, contact us at:
                <br />
                Email: <strong>founders@avenra.org</strong>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
