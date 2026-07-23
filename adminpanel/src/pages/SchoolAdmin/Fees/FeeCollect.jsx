import { useState, useEffect } from 'react';
import { feeAPI, studentsAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../hooks/useAuth';
import { Search, IndianRupee, Clock, CheckCircle2, ChevronRight, Users, Sparkles, Printer, MessageCircle } from 'lucide-react';

export function FeeCollect() {
  const { user } = useAuth();
  const schoolName = user?.school?.name || user?.school_name || user?.school?.school_name || 'School ERP';
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Form State
  const [selectedTermLedgerId, setSelectedTermLedgerId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [lateFeeInput, setLateFeeInput] = useState('0');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);

  // Scholarship & Concessions Modal State
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [termDiscounts, setTermDiscounts] = useState({}); // { [termId]: discountAmount }
  const [waivedTermIds, setWaivedTermIds] = useState([]);
  const [savingAdjustments, setSavingAdjustments] = useState(false);

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

  const fetchStudents = async (term = '', classId = '', sectionId = '') => {
    try {
      const params = { limit: 20 };
      if (term.trim()) params.search = term.trim();
      if (classId) params.class_id = classId;
      if (sectionId) params.section_id = sectionId;

      const res = await studentsAPI.list(params);
      const items = res?.rows || res?.items || res || [];
      setStudentSearchResults(items);
    } catch {
      setStudentSearchResults([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim().length >= 2 || selectedClassId || selectedSectionId) {
      fetchStudents(searchTerm, selectedClassId, selectedSectionId);
    } else {
      setStudentSearchResults([]);
    }
  }, [searchTerm, selectedClassId, selectedSectionId]);

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingLedger(true);
    try {
      const data = await feeAPI.getStudentLedger(student.id);
      setLedgerData(data);
      setTermDiscounts({});
      setWaivedTermIds([]);

      const firstUnpaid = data.terms?.find((t) => t.status !== 'paid' && t.status !== 'waived');
      if (firstUnpaid) {
        setSelectedTermLedgerId(String(firstUnpaid.id));
        setPayAmount(String(firstUnpaid.balance));
      } else {
        setSelectedTermLedgerId(null);
        setPayAmount(String(data.ledger.balance));
      }
    } catch {
      toast.error('Failed to load student fee details');
    } finally {
      setLoadingLedger(false);
    }
  };

  const reloadCurrentStudentLedger = async () => {
    if (!selectedStudent) return;
    try {
      const data = await feeAPI.getStudentLedger(selectedStudent.id);
      setLedgerData(data);
    } catch {
      // silent
    }
  };

  const handleSaveAdjustments = async () => {
    if (!ledgerData?.ledger?.id) return;
    setSavingAdjustments(true);
    try {
      await feeAPI.adjustLedger(ledgerData.ledger.id, {
        waived_term_ids: waivedTermIds,
        term_discounts: termDiscounts,
      });
      toast.success('Scholarship & Fee Concessions saved successfully!');
      setShowAdjustmentModal(false);
      await reloadCurrentStudentLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply fee adjustments');
    } finally {
      setSavingAdjustments(false);
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !ledgerData) return;

    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_id: selectedStudent.id,
        amount: amt,
        late_fee_amount: Number(lateFeeInput) || 0,
        mode: paymentMode,
        reference: reference.trim() || undefined,
        term_ledger_id: selectedTermLedgerId ? Number(selectedTermLedgerId) : undefined,
        remarks: remarks.trim() || undefined,
      };

      const res = await feeAPI.recordPayment(payload);
      toast.success(`Payment ₹${amt.toLocaleString('en-IN')} recorded successfully!`);

      const targetTermObj = ledgerData.terms?.find((t) => String(t.id) === String(selectedTermLedgerId));
      setReceiptData({
        ...res.payment,
        receipt_no: res.receipt_no,
        student: ledgerData.student,
        allocated_term: targetTermObj ? targetTermObj.term_name : 'Auto-allocated to Oldest Unpaid Term',
        ledger: res.ledger,
      });

      setPayAmount('');
      setReference('');
      setRemarks('');
      setLateFeeInput('0');

      await reloadCurrentStudentLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '', 'width=700,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${receiptData?.receipt_no || ''}</title>
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
            <div class="row"><span class="label">Receipt No:</span><span class="value">${receiptData?.receipt_no}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${new Date(receiptData?.paid_at).toLocaleString()}</span></div>
            <div class="row"><span class="label">Student Name:</span><span class="value">${receiptData?.student?.name}</span></div>
            <div class="row"><span class="label">Class & Section:</span><span class="value">${receiptData?.student?.class_name} - ${receiptData?.student?.section_name}</span></div>
            <div class="row"><span class="label">Applied To:</span><span class="value">${receiptData?.allocated_term || 'General'}</span></div>
            <div class="row"><span class="label">Payment Mode:</span><span class="value" style="text-transform:uppercase">${receiptData?.mode}</span></div>
            ${receiptData?.late_fee_amount > 0 ? `<div class="row"><span class="label">Late Fee Charge:</span><span class="value">₹${receiptData.late_fee_amount}</span></div>` : ''}
            
            <div class="amount-box">
              <div class="label">AMOUNT PAID</div>
              <div class="amount">₹${Number(receiptData?.amount).toLocaleString('en-IN')}</div>
            </div>

            <div class="row"><span class="label">Total Annual Fee:</span><span class="value">₹${Number(receiptData?.ledger?.total).toLocaleString('en-IN')}</span></div>
            <div class="row"><span class="label">Total Paid So Far:</span><span class="value">₹${Number(receiptData?.ledger?.paid).toLocaleString('en-IN')}</span></div>
            <div class="row"><span class="label">Remaining Balance:</span><span class="value" style="color:#e11d48">₹${Number(receiptData?.ledger?.balance).toLocaleString('en-IN')}</span></div>
            <div class="footer">Thank you! Computer generated receipt. No signature required.</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const handleSendWhatsAppReceipt = async () => {
    if (!receiptData?.id) return;
    setSendingWhatsApp(true);
    try {
      const res = await feeAPI.sendWhatsAppReceipt(receiptData.id);
      toast.success(res.message || 'WhatsApp receipt sent to parent successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'WhatsApp API dispatch failed';
      toast.error(`WhatsApp Failed: ${errMsg}`);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Search Bar & Class / Section Filters */}
      <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm relative">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Collect Fee</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Parent Phone / Student Name / Roll No..."
              className="input-field pl-10 text-sm font-medium w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="select-field text-sm font-semibold w-full"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('');
              }}
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select-field text-sm font-semibold w-full"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
            >
              <option value="">-- Select Section --</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {studentSearchResults.length > 0 && !selectedStudent && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Select Student ({studentSearchResults.length} found):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto">
              {studentSearchResults.map((st) => (
                <div
                  key={st.id}
                  onClick={() => selectStudent(st)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{st.user?.name || st.name}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Roll No: <strong className="text-slate-800">{st.roll_no || st.admission_no || '—'}</strong> · Class {st.class?.class_name || '—'} ({st.section?.name || 'A'})
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {loadingLedger ? (
        <div className="card p-12 bg-white text-center text-slate-400 font-medium">Loading student fee ledger...</div>
      ) : !selectedStudent ? (
        <div className="card p-12 bg-white text-center border-dashed border-2 border-slate-200 rounded-2xl">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-semibold text-sm">No student selected</p>
          <p className="text-slate-400 text-xs">Search by Parent Phone, Student Name, or filter Class & Section above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info Card with Scholarship Button */}
            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {ledgerData?.student?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{ledgerData?.student?.name}</h3>
                  <span className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>Roll No: <strong className="text-slate-900">{ledgerData?.student?.roll_no || ledgerData?.student?.admission_no || '—'}</strong></span>
                    <span>·</span>
                    <span>Class {ledgerData?.student?.class_name} - Section {ledgerData?.student?.section_name}</span>
                    <span>·</span>
                    <span>Phone: {ledgerData?.student?.phone || '—'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(true)}
                  className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Scholarship & Concessions
                </button>

                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setLedgerData(null);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg"
                >
                  Change Student
                </button>
              </div>
            </div>

            {/* Term Fee Schedule Status Cards */}
            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Fee Installment Schedule Status
              </h4>

              {ledgerData?.terms?.length === 0 ? (
                <p className="text-xs text-slate-400">No specific term schedule set. Annual billing active.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ledgerData?.terms?.map((t) => {
                    const isSelected = selectedTermLedgerId === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (t.status !== 'paid' && t.status !== 'waived') {
                            setSelectedTermLedgerId(String(t.id));
                            setPayAmount(String(t.balance));
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          t.status === 'paid'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : t.status === 'waived'
                            ? 'bg-slate-100/70 border-slate-200 opacity-60'
                            : isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-slate-900">{t.term_name}</span>
                          {t.status === 'paid' ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              PAID <CheckCircle2 className="w-3 h-3" />
                            </span>
                          ) : t.status === 'waived' ? (
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                              WAIVED
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              DUE
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-black text-slate-900">
                          ₹{t.balance.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">due</span>
                        </div>
                        {t.due_date && <div className="text-[10px] text-slate-400 mt-1">Due: {t.due_date}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overall Ledger Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Fee</span>
                <span className="text-xl font-black text-slate-900">₹{ledgerData?.ledger?.total?.toLocaleString('en-IN') || 0}</span>
              </div>

              <div className="card p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl shadow-sm">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Paid So Far</span>
                <span className="text-xl font-black text-emerald-600">₹{ledgerData?.ledger?.paid?.toLocaleString('en-IN') || 0}</span>
              </div>

              <div className="card p-4 bg-rose-50/40 border border-rose-100 rounded-2xl shadow-sm">
                <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">Balance Due</span>
                <span className="text-xl font-black text-rose-600">₹{ledgerData?.ledger?.balance?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>
          </div>

          {/* Right Col: Receive Payment Form */}
          <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Receive Payment
            </h3>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Apply Payment To:</label>
                <div className="flex flex-col gap-2">
                  {ledgerData?.terms?.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={t.status === 'paid' || t.status === 'waived'}
                      onClick={() => {
                        setSelectedTermLedgerId(String(t.id));
                        setPayAmount(String(t.balance));
                      }}
                      className={`py-2.5 px-3.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${
                        t.status === 'paid' || t.status === 'waived'
                          ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                          : selectedTermLedgerId === String(t.id)
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shadow-indigo-100 border-none ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span>{t.term_name}</span>
                      <span className="font-extrabold">{t.status === 'paid' ? 'PAID ✓' : t.status === 'waived' ? 'WAIVED' : `₹${t.balance}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Payment Amount (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter amount..."
                  className="input-field text-sm font-extrabold text-slate-900"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Additional / Late Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="input-field text-xs font-semibold"
                  value={lateFeeInput}
                  onChange={(e) => setLateFeeInput(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-slate-700">Payment Mode</label>
                <select
                  className="select-field text-xs font-bold"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                  <option value="cheque">Cheque</option>
                  <option value="dd">Demand Draft (DD)</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              {paymentMode !== 'cash' && (
                <div>
                  <label className="label text-xs font-bold text-slate-700">Reference / UTR / Cheque No</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR123456789"
                    className="input-field text-xs"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              )}

              {(() => {
                const selectedTermObj = ledgerData?.terms?.find((t) => String(t.id) === String(selectedTermLedgerId));
                const isSelectedTermDone = selectedTermObj ? (selectedTermObj.status === 'paid' || selectedTermObj.status === 'waived' || Number(selectedTermObj.balance) <= 0) : false;
                const isAllDone = ledgerData?.terms?.length > 0 && ledgerData.terms.every((t) => t.status === 'paid' || t.status === 'waived' || Number(t.balance) <= 0);
                const isDisabled = submitting || isSelectedTermDone || isAllDone;

                return (
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className={`btn-primary w-full font-bold py-3 rounded-xl border-none shadow-md flex items-center justify-center gap-2 text-sm ${
                      isDisabled
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isAllDone ? 'All Fees Fully Paid ✓' : isSelectedTermDone ? 'Selected Term Paid ✓' : submitting ? 'Recording...' : 'Receive Payment'}
                  </button>
                );
              })()}
            </form>
          </div>
        </div>
      )}

      {/* Scholarship, Concession & Mid-Year Waiver Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-purple-700 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Scholarship & Fee Concessions</h3>
                <p className="text-xs text-slate-500">Configure discounts or term waivers for <strong className="text-slate-800">{ledgerData?.student?.name}</strong></p>
              </div>
            </div>

            {/* 1. Flat Discount per Fee Plan */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                1. Scholarship / Concession Reduction per Fee Plan (₹)
              </label>

              {ledgerData?.terms?.filter((t) => t.status !== 'paid')?.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">No pending or unpaid fee plans for this student.</p>
              ) : (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  {ledgerData?.terms?.filter((t) => t.status !== 'paid')?.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 py-1">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">{t.term_name}</span>
                        <span className="text-[11px] text-slate-400">Original Plan Fee: ₹{t.total}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">- ₹</span>
                        <input
                          type="number"
                          min="0"
                          max={t.total}
                          placeholder="Discount ₹"
                          className="input-field text-xs font-bold text-right w-28 py-1 text-emerald-700 bg-white"
                          value={termDiscounts[t.id] ?? ''}
                          onChange={(e) => {
                            const val = Math.min(t.total, Math.max(0, Number(e.target.value) || 0));
                            setTermDiscounts((prev) => ({
                              ...prev,
                              [t.id]: e.target.value === '' ? '' : String(val),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Waive Terms for Mid-Year Joiner */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                2. Waive Existing Fee Plans (Mid-Year Admission / Dropout):
              </label>

              {ledgerData?.terms?.filter((t) => t.status !== 'paid')?.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">No pending or unpaid fee plans to waive.</p>
              ) : (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  {ledgerData?.terms?.filter((t) => t.status !== 'paid')?.map((t) => (
                    <label key={t.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-purple-600 focus:ring-purple-500"
                        checked={waivedTermIds.includes(t.id) || t.status === 'waived'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWaivedTermIds((prev) => [...prev, t.id]);
                          } else {
                            setWaivedTermIds((prev) => prev.filter((id) => id !== t.id));
                          }
                        }}
                      />
                      <span>Waive {t.term_name} (₹{t.total})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="btn-secondary flex-1 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustments}
                disabled={savingAdjustments}
                className="btn-primary flex-1 py-2 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl"
              >
                {savingAdjustments ? 'Saving...' : 'Apply Adjustments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Received!</h3>
              <p className="text-xs text-slate-500">Receipt #{receiptData.receipt_no}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-slate-900">{receiptData.student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Applied To:</span>
                <span className="font-bold text-indigo-600">{receiptData.allocated_term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-extrabold text-emerald-600">₹{Number(receiptData.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="font-bold text-rose-600">₹{Number(receiptData.ledger?.balance).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setReceiptData(null)}
                className="btn-secondary py-2 text-xs font-bold px-3"
              >
                Close
              </button>
              <button
                onClick={handleSendWhatsAppReceipt}
                disabled={sendingWhatsApp}
                className="btn-primary py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 flex-1 border-none shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> {sendingWhatsApp ? 'Sending...' : 'Send to WhatsApp'}
              </button>
              <button
                onClick={handlePrintReceipt}
                className="btn-primary py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1.5 flex-1 border-none shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
