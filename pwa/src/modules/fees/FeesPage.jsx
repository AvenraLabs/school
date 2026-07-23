import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Alert,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  ReceiptLong,
  Download,
  ErrorOutline,
  CheckCircle,
} from "@mui/icons-material";
import { getMyFeeLedgerApi } from "./fees.api";

export default function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyFeeLedgerApi();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleDownload = (item) => {
    const printWindow = window.open("", "_blank", "width=650,height=800");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${item.receipt_no}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #fff; }
            .box { border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 20px; }
            .school { font-size: 18px; font-weight: 900; color: #312e81; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; }
            .val { font-weight: 800; color: #0f172a; }
            .amount-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
            .amount-lbl { font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; }
            .amount { font-size: 26px; font-weight: 900; color: #15803d; margin-top: 4px; }
            .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 20px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="header">
              <div class="school">${data?.student?.school_name || 'OFFICIAL RECEIPT'}</div>
              <div class="sub">#${item.receipt_no}</div>
            </div>
            <div class="row"><span class="label">ID:</span><span class="val">#${item.receipt_no}</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="val">${new Date(item.paid_at).toLocaleString()}</span></div>
            <div class="row"><span class="label">Student Name:</span><span class="val">${data?.student?.name || ''}</span></div>
            <div class="row"><span class="label">Class & Section:</span><span class="val">${data?.student?.class_name || ''} - ${data?.student?.section_name || ''}</span></div>
            <div class="row"><span class="label">Payment Mode:</span><span class="val" style="text-transform:uppercase">${item.mode}</span></div>
            
            <div class="amount-card">
              <div class="amount-lbl">AMOUNT PAID</div>
              <div class="amount">₹${Number(item.amount).toLocaleString('en-IN')}</div>
            </div>

            <div class="row"><span class="label">Remaining Balance:</span><span class="val" style="color:#e11d48">₹${Number(data?.ledger?.balance || 0).toLocaleString('en-IN')}</span></div>
            <div class="footer">Computer generated payment document.</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 700 }}>
          Loading fee details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: "16px", fontWeight: 700 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const ledger = data?.ledger || { total: 0, paid: 0, balance: 0 };
  const terms = data?.terms || [];
  const payments = data?.payments || [];
  const isFullyPaid = Number(ledger.balance) <= 0;
  const paidPct = ledger.total > 0 ? Math.min(100, Math.round((ledger.paid / ledger.total) * 100)) : 0;

  const cardSx = {
    borderRadius: "24px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflow: "hidden",
    bgcolor: "#ffffff",
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      <Stack spacing={2.5}>
        {/* Top Summary Card (Sleek Modern White & Indigo Ring Layout) */}
        <Card sx={{ ...cardSx, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Academic Year {data?.academic_year || "2026–27"}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Fees
                </Typography>
              </Box>

              <Chip
                label={isFullyPaid ? "✅ All Fees Paid" : `Pending: ₹${ledger.balance.toLocaleString("en-IN")}`}
                sx={{
                  fontWeight: 900,
                  fontSize: 12,
                  bgcolor: isFullyPaid ? "#e6f4ea" : "#fff7ed",
                  color: isFullyPaid ? "#137333" : "#c2410c",
                  border: `1px solid ${isFullyPaid ? "#ceead6" : "#ffedd5"}`,
                }}
              />
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#475569" }}>
                  Payment Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "#4f46e5" }}>
                  {paidPct}% Paid
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={paidPct}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#f1f5f9",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: isFullyPaid ? "#16a34a" : "#4f46e5",
                  },
                }}
              />
            </Box>

            {/* Integrated Ticker Row */}
            <Box
              sx={{
                p: 2,
                borderRadius: "18px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", fontSize: "0.65rem", display: "block" }}>
                  Total Fee
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: "#0f172a", mt: 0.3 }}>
                  ₹{ledger.total.toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#16a34a", textTransform: "uppercase", fontSize: "0.65rem", display: "block" }}>
                  Paid
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: "#16a34a", mt: 0.3 }}>
                  ₹{ledger.paid.toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isFullyPaid ? "#16a34a" : "#e11d48", textTransform: "uppercase", fontSize: "0.65rem", display: "block" }}>
                  Balance
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: isFullyPaid ? "#16a34a" : "#e11d48", mt: 0.3 }}>
                  ₹{ledger.balance.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ fontSize: 20, color: "#4f46e5" }} /> Schedule
            </Typography>

            <Stack spacing={1.5}>
              {terms.map((t) => {
                const isPaid = t.status === "paid";
                const isWaived = t.status === "waived";

                return (
                  <Box
                    key={t.id}
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: isPaid ? "#bbf7d0" : isWaived ? "#e2e8f0" : "#fed7aa",
                      bgcolor: isPaid ? "#f0fdf4" : isWaived ? "#f8fafc" : "#fff7ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {t.term_name}
                        </Typography>
                        {isPaid ? (
                          <Chip label="Paid ✓" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#dcfce7", color: "#15803d" }} />
                        ) : isWaived ? (
                          <Chip label="Waived" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#e2e8f0", color: "#475569" }} />
                        ) : (
                          <Chip label="Pending" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#ffedd5", color: "#c2410c" }} />
                        )}
                      </Box>

                      {t.due_date && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                          <CalendarMonth sx={{ fontSize: 14 }} /> Due: {t.due_date}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body1" sx={{ fontWeight: 900, color: isPaid ? "#16a34a" : isWaived ? "#94a3b8" : "#ea580c" }}>
                      {isPaid ? "₹0" : isWaived ? "Waived" : `₹${t.balance.toLocaleString("en-IN")}`}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Paid Receipts Section */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLong sx={{ fontSize: 20, color: "#059669" }} /> Paid Receipts ({payments.length})
            </Typography>

            {payments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, py: 1 }}>
                No receipts recorded yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {payments.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      border: "1px solid #f1f5f9",
                      bgcolor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        #{p.receipt_no}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {new Date(p.paid_at).toLocaleDateString()} · {p.mode?.toUpperCase()}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: "#16a34a", mb: 0.5 }}>
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleDownload(p)}
                        startIcon={<Download sx={{ fontSize: 14 }} />}
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          textTransform: "none",
                          py: 0.5,
                          px: 1.5,
                          color: "#4f46e5",
                          bgcolor: "#eef2ff",
                          borderRadius: "12px",
                          "&:hover": { bgcolor: "#e0e7ff" },
                        }}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
