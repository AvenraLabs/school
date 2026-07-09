import { Container, Typography, Card, CardContent, Stack, Box, Divider, Link } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";

export default function AboutPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Typography variant="h5" fontWeight="950" sx={{ fontFamily: "'Outfit', sans-serif", mb: 3 }}>
        About Application
      </Typography>

      <Card
        sx={{
          borderRadius: "20px",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
          textAlign: "center",
          p: 3,
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5, mt: 2 }}>
            SchoolIQ
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3, fontWeight: 700 }}>
            Version 1.3.0
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2} sx={{ textAlign: "left" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                Developer / Publisher
              </Typography>
              <Typography variant="body2" fontWeight="700">
                Avenra
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                Website
              </Typography>
              <Link href="https://avenra.org" target="_blank" rel="noopener noreferrer" sx={{ textDecoration: "none", fontWeight: 750 }}>
                avenra.org
              </Link>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                Support Email
              </Typography>
              <Link href="mailto:founders@avenra.org" sx={{ textDecoration: "none", fontWeight: 750 }}>
                founders@avenra.org
              </Link>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                Copyright
              </Typography>
              <Typography variant="body2" color="text.secondary">
                &copy; {new Date().getFullYear()} Avenra. All rights reserved.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
