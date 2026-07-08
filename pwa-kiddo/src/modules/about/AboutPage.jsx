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
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #cc3a7e 0%, #6f55c4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              boxShadow: "0 8px 16px rgba(105, 35, 209, 0.2)",
            }}
          >
            <AutoAwesome sx={{ color: "white", fontSize: 32 }} />
          </Box>

          <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>
            School App
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
              <Link href="mailto:support@avenra.org" sx={{ textDecoration: "none", fontWeight: 750 }}>
                support@avenra.org
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
