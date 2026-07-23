import { useState, useEffect } from 'react';
import { feeAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../hooks/useAuth';
import { History, Search, Ban, AlertTriangle, Printer, Clock, Filter } from 'lucide-react';

export function FeePaymentHistory() {
  const { user } = useAuth();
  const schoolName = user?.school?.name || user?.school_name || user?.school?.school_name || 'School Fee Voucher';
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Void modal state
  const [voidModalPayment, setVoidModalPayment] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadClasses() {
      try {
        const clsData = await classesAPI.list();
        const raw = clsData?.items || clsData?.rows || clsData?.data || clsData;
        setClasses(Array.isArray(raw) ? raw : []);
      } catch {
        // silent
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    async function loadSections() {
      if (!selectedClassId) {
        setSections([]);
        setSelectedSectionId('');
        return;
      }
      try {
        const secData = await sectionsAPI.listByClass(selectedClassId);
        const raw = secData?.items || secData?.rows || secData?.data || secData;
        setSections(Array.isArray(raw) ? raw : []);
      } catch {
        setSections([]);
      }
    }
    loadSections();
  }, [selectedClassId]);

  // Load recent payments by default and on filter/search change
  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedClassId) params.class_id = selectedClassId;
      if (selectedSectionId) params.section_id = selectedSectionId;
      if (selectedMode) params.mode = selectedMode;

      const data = await feeAPI.getSchoolPaymentHistory(params);
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, [searchTerm, selectedClassId, selectedSectionId, selectedMode]);

  const handleConfirmVoid = async () => {
    if (!voidModalPayment || !voidReason.trim()) return;
    setVoiding(true);
    try {
      await feeAPI.voidPayment(voidModalPayment.id, voidReason.trim());
      toast.success(`Payment ${voidModalPayment.receipt_no} voided successfully`);
      setVoidModalPayment(null);
      setVoidReason('');
      loadPaymentHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to void payment');
    } finally {
      setVoiding(false);
    }
  };

  const handlePrintPaymentReceipt = (p) => {
    const printWindow = window.open('', '', 'width=700,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${p.receipt_no}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
            .receipt-box { border: 2px solid #cbd5e1; border-radius: 12px; padding: 24px; max-width: 500px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px border-dashed #e2e8f0; pb-12px; margin-bottom: 16px; }
            .school-title { font-size: 18px; font-weight: 800; color: #312e81; }
            .title { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; font-weight: 500; }
            .value { font-weight: 700; color: #0f172a; }
            .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0; }
            .amount { font-size: 24px; font-weight: 900; color: #16a34a; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="school-title">${schoolName.toUpperCase()}</div>
              <div class="title">Official Fee Payment Voucher</div>
            </div>
            <div class="row"><span class="label">Receipt No:</span><span class="value">${p.receipt_no}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${new Date(p.paid_at).toLocaleString()}</span></div>
            <div class="row"><span class="label">Student Name:</span><span class="value">${p.student_name || 'Student'}</span></div>
            <div class="row"><span class="label">Class & Section:</span><span class="value">${p.class_name || '—'} - ${p.section_name || 'A'}</span></div>
            <div class="row"><span class="label">Payment Mode:</span><span class="value" style="text-transform:uppercase">${p.mode}</span></div>
            ${p.late_fee_amount > 0 ? `<div class="row"><span class="label">Late Fee Charge:</span><span class="value">₹${p.late_fee_amount}</span></div>` : ''}
            
            <div class="amount-box">
              <div class="label">AMOUNT PAID</div>
              <div class="amount">₹${Number(p.amount).toLocaleString('en-IN')}</div>
            </div>

            <div class="footer">Thank you! Computer generated receipt.</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Search Bar & Class / Section / Mode Filters */}
      <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative">
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" /> Recent Payment Transactions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Name / Roll No / Receipt..."
              className="input-field pl-10 text-xs font-medium w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="select-field text-xs font-semibold w-full"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('');
              }}
            >
              <option value="">-- All Classes --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select-field text-xs font-semibold w-full"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">-- All Sections --</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode Filter Dropdown */}
          <div>
            <select
              className="select-field text-xs font-semibold w-full text-indigo-700 bg-indigo-50/50 border-indigo-200"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="">-- All Payment Modes --</option>
              <option value="cash">Cash Only</option>
              <option value="upi">UPI (GPay/PhonePe/Paytm)</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="cheque">Cheque Only</option>
              <option value="dd">Demand Draft (DD)</option>
              <option value="online">Online Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="card bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Payment Audit Trail
          </h3>
          <span className="text-xs bg-slate-100 font-bold text-slate-700 px-3 py-1 rounded-full">
            {payments.length} Transactions Found
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading payment transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No payment records found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-3.5 pl-6">Receipt No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Class & Section</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Amount Paid</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/80 ${p.is_void ? 'bg-rose-50/30' : ''}`}>
                    <td className="p-3.5 pl-6 font-bold text-slate-900">{p.receipt_no}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{p.student_name || '—'}</span>
                      <span className="text-[10px] text-slate-400">Roll No: {p.roll_no || '—'}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {p.class_name || '—'} {p.section_name ? `- Section ${p.section_name}` : ''}
                    </td>
                    <td className="p-3.5 text-slate-600">{new Date(p.paid_at).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-700 uppercase font-semibold">{p.mode}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      {p.is_void ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          VOIDED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          SUCCESS
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handlePrintPaymentReceipt(p)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>

                      {!p.is_void && (
                        <button
                          onClick={() => {
                            setVoidModalPayment(p);
                            setVoidReason('');
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Void Confirmation Modal */}
      {voidModalPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Void Payment Voucher</h3>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to void receipt <strong className="text-slate-900">{voidModalPayment.receipt_no}</strong> for ₹{Number(voidModalPayment.amount).toLocaleString('en-IN')}? This will reverse the ledger balance.
            </p>

            <div>
              <label className="label text-xs font-bold text-slate-700">Reason for Voiding <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Wrong entry, Cheque bounced..."
                className="input-field text-xs"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setVoidModalPayment(null)}
                className="btn-secondary flex-1 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVoid}
                disabled={voiding || !voidReason.trim()}
                className="btn-danger flex-1 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                {voiding ? 'Voiding...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
