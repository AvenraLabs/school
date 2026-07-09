import { Container, Typography, Paper, Box, Divider, Button, Stack } from "@mui/material";
import { ArrowBack, AutoAwesome } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function TermsConditions() {
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
            Terms & Conditions
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3, fontWeight: 700 }}>
            Last Updated: July 8, 2026
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                1. Acceptable Use
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You agree to use this application only for lawful educational purposes. Users are prohibited from uploading offensive content, infringing material, or using the platform to spam transport tracking, bulk notifications, or group chats.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                2. AI Disclaimer & Limitations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The application provides AI-powered school helpers (RAG answers, lesson plans, quiz questions, and study tools) generated using Gemini models. AI-generated answers are for reference and educational assistance. We make no warranties regarding accuracy or reliability. Always double-check critical educational content.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                3. User Account Security
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You are responsible for keeping your login credentials, passwords, and accounts secure. Unauthorized cross-school data access or privilege escalation attempts will result in account suspension.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                4. WhatsApp Messaging Services
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automated reminders and notifications sent via WhatsApp are supplementary. SchoolIQ is not liable for delayed delivery of transport details or attendance warnings due to telco service interruptions.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                5. Intellectual Property
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All platform intellectual property, designs, assets, themes, and logic are owned by Avenra. Replicating, reverse engineering, or redistributing the application bundle is strictly prohibited.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                6. Contact Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For questions regarding terms, acceptable use, or license parameters, contact:
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
