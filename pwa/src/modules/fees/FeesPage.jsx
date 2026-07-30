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
} from "@mui/icons-material";
import { getMyFeeLedgerApi } from "./fees.api";
import { formatDate } from "../../utils/date";
import html2pdf from "html2pdf.js";

export default function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadFees = async () => {
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
    loadFees();
  }, []);

  const handleDownload = (item) => {
    const matchedFee = fees.find((f) => String(f.id) === String(item.student_fee_id));
    const concAmt = Number(matchedFee?.concession_amount || 0);

    const container = document.createElement("div");
    container.style.padding = "20px";
    container.innerHTML = `
      <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; max-width: 420px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 20px;">
          <div style="font-size: 18px; font-weight: 900; color: #312e81; text-transform: uppercase; letter-spacing: 0.5px;">${data?.student?.school_name || 'OFFICIAL RECEIPT'}</div>
          <div style="font-size: 12px; color: #6366f1; font-weight: 700; text-transform: uppercase; margin-top: 4px; letter-spacing: 1px;">#${item.receipt_no}</div>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Receipt ID:</span><span style="font-weight: 800; color: #0f172a;">#${item.receipt_no}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Date:</span><span style="font-weight: 800; color: #0f172a;">${formatDate(item.paid_at)}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Student Name:</span><span style="font-weight: 800; color: #0f172a;">${data?.student?.name || ''}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Class:</span><span style="font-weight: 800; color: #0f172a;">Class ${data?.student?.class_name || ''} ${data?.student?.section_name ? '— ' + data.student.section_name : ''}</span></div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Fee Item:</span><span style="font-weight: 800; color: #4f46e5;">${matchedFee?.title || 'Fee Payment'}</span></div>
        ${concAmt > 0 ? `<div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #7e22ce;"><span style="font-weight: 600;">Discount / Concession:</span><span style="font-weight: 800;">-₹${concAmt.toLocaleString('en-IN')}${matchedFee?.concession_reason ? ' (' + matchedFee.concession_reason + ')' : ''}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px;"><span style="color: #64748b; font-weight: 600;">Payment Mode:</span><span style="font-weight: 800; color: #0f172a; text-transform: uppercase;">${item.mode}</span></div>
        
        <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center; margin: 16px 0;">
          <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">AMOUNT PAID</div>
          <div style="font-size: 26px; font-weight: 900; color: #15803d; margin-top: 2px;">₹${Number(item.amount).toLocaleString('en-IN')}</div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #94a3b8; margin-top: 16px; font-weight: 600;">Computer-generated payment receipt. No signature required.</div>
      </div>
    `;

    const opt = {
      margin: 8,
      filename: `Receipt_${item.receipt_no}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save();
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

  const summary = data?.summary || { total_fee: 0, total_paid: 0, total_balance: 0 };
  const fees = data?.fees || [];
  const payments = data?.payments || [];
  const isFullyPaid = Number(summary.total_balance) <= 0;
  const paidPct = summary.total_fee > 0 ? Math.min(100, Math.round((summary.total_paid / summary.total_fee) * 100)) : 0;

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
        {/* Top Summary Card */}
        <Card sx={{ ...cardSx, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Fee Ledger
                </Typography>
              </Box>
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
                  ₹{summary.total_fee.toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#16a34a", textTransform: "uppercase", fontSize: "0.65rem", display: "block" }}>
                  Paid
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: "#16a34a", mt: 0.3 }}>
                  ₹{summary.total_paid.toLocaleString("en-IN")}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: "#e2e8f0", my: 0.5 }} />

              <Box sx={{ textAlign: "center", flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: isFullyPaid ? "#16a34a" : "#e11d48", textTransform: "uppercase", fontSize: "0.65rem", display: "block" }}>
                  Balance
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 900, color: isFullyPaid ? "#16a34a" : "#e11d48", mt: 0.3 }}>
                  ₹{summary.total_balance.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Assigned Fees List */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ fontSize: 20, color: "#4f46e5" }} /> Assigned Fees ({fees.length})
            </Typography>

            <Stack spacing={1.5}>
              {fees.map((f) => {
                const isPaid = f.status === "paid";

                return (
                  <Box
                    key={f.id}
                    sx={{
                      p: 2,
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: isPaid ? "#bbf7d0" : "#fed7aa",
                      bgcolor: isPaid ? "#f0fdf4" : "#fff7ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {f.title}
                        </Typography>
                        {isPaid ? (
                          <Chip label="Paid ✓" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#dcfce7", color: "#15803d" }} />
                        ) : f.status === 'partial' ? (
                          <Chip label="Partially Paid" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#fef3c7", color: "#b45309" }} />
                        ) : (
                          <Chip label="Pending" size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "#ffedd5", color: "#c2410c" }} />
                        )}
                        {Number(f.concession_amount) > 0 && (
                          <Chip
                            label={`Discount: -₹${Number(f.concession_amount).toLocaleString('en-IN')}`}
                            size="small"
                            sx={{ height: 22, fontSize: 10, fontWeight: 800, bgcolor: "#f3e8ff", color: "#6b21a8", border: "1px solid #e9d5ff" }}
                          />
                        )}
                      </Box>

                      {f.due_date && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                          <CalendarMonth sx={{ fontSize: 14 }} /> Due: {formatDate(f.due_date)}
                        </Typography>
                      )}

                      {/* Breakdown tags */}
                      {Array.isArray(f.breakdown) && f.breakdown.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                          {f.breakdown.map((b, idx) => (
                            <Chip key={idx} label={`${b.name}: ₹${b.amount}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: isPaid ? "#16a34a" : "#ea580c" }}>
                        {isPaid ? "₹0" : `₹${f.balance_amount.toLocaleString("en-IN")}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                        of ₹{Number(f.total_amount).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
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
                {payments.map((p) => {
                  const matchedFee = fees.find((f) => String(f.id) === String(p.student_fee_id));

                  return (
                    <Box
                      key={p.id}
                      sx={{
                        p: 2,
                        borderRadius: "20px",
                        border: "1px solid #f1f5f9",
                        bgcolor: p.is_void ? "#fff1f2" : "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        opacity: p.is_void ? 0.7 : 1,
                      }}
                    >
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: p.is_void ? "#94a3b8" : "#0f172a", textDecoration: p.is_void ? "line-through" : "none" }}>
                            #{p.receipt_no}
                          </Typography>
                          {matchedFee?.title && (
                            <Chip label={matchedFee.title} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3" }} />
                          )}
                          {p.is_void && (
                            <Chip label={`VOIDED — ${p.void_reason || 'Voided'}`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, bgcolor: "#ffe4e6", color: "#e11d48" }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5, display: "block" }}>
                          {formatDate(p.paid_at)} · {p.mode?.toUpperCase()}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body1" sx={{ fontWeight: 900, color: p.is_void ? "#f43f5e" : "#16a34a", mb: 0.5, textDecoration: p.is_void ? "line-through" : "none" }}>
                          ₹{Number(p.amount).toLocaleString("en-IN")}
                        </Typography>
                        {!p.is_void && (
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
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
