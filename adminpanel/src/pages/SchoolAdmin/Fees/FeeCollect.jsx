import { useState, useEffect, useRef } from 'react';
import { feeAPI, studentsAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate, formatDateTime } from '../../../utils/date';
import {
  Search, IndianRupee, CheckCircle2, ChevronRight, Printer,
  MessageCircle, X, Calendar, Ban, Tag, User, ArrowLeft,
  Clock, Banknote, Smartphone, Building2, CreditCard,
} from 'lucide-react';

const MODE_LABELS = {
  cash: { label: 'Cash', icon: Banknote, color: 'emerald' },
  upi: { label: 'UPI / GPay', icon: Smartphone, color: 'indigo' },
  bank_transfer: { label: 'Bank / NEFT', icon: Building2, color: 'blue' },
  pos: { label: 'Card POS', icon: CreditCard, color: 'violet' },
};

const StatusPill = ({ status }) => {
  const map = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    pending: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

export function FeeCollect() {
  const { user } = useAuth();
  const schoolName = user?.school?.school_name || user?.school_name || 'School';

  // Search state
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);

  // Selected student
  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);

  // Payment form
  const [selFeeId, setSelFeeId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [concessionFee, setConcessionFee] = useState(null);
  const [concAmt, setConcAmt] = useState('');
  const [concReason, setConcReason] = useState('');
  const [concLoading, setConcLoading] = useState(false);

  const [voidItem, setVoidItem] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidLoading, setVoidLoading] = useState(false);

  const [receipt, setReceipt] = useState(null);
  const [sendingWA, setSendingWA] = useState(false);

  const toast = useToast();

  // Load classes
  useEffect(() => {
    classesAPI.list().then((r) => {
      const raw = r?.items || r?.rows || r?.data || r;
      setClasses(Array.isArray(raw) ? raw : []);
    }).catch(() => {});
  }, []);

  // Load sections on class change
  useEffect(() => {
    if (!filterClass) { setSections([]); setFilterSection(''); return; }
    sectionsAPI.listByClass(filterClass).then((r) => {
      const raw = r?.items || r?.rows || r?.data || r;
      setSections(Array.isArray(raw) ? raw : []);
    }).catch(() => setSections([]));
  }, [filterClass]);

  // Search students
  useEffect(() => {
    if (student) return;
    if (search.length < 2 && !filterClass) { setResults([]); return; }
    const params = { limit: 15 };
    if (search.trim()) params.search = search.trim();
    if (filterClass) params.class_id = filterClass;
    if (filterSection) params.section_id = filterSection;
    studentsAPI.list(params).then((r) => {
      setResults(r?.rows || r?.items || r || []);
    }).catch(() => setResults([]));
  }, [search, filterClass, filterSection, student]);

  const selectStudent = async (st) => {
    setStudent(st);
    setResults([]);
    setSearch('');
    setLoadingFees(true);
    try {
      const data = await feeAPI.getStudentFees(st.id);
      setFeeData(data);
      const first = data.fees?.find((f) => f.status !== 'paid');
      if (first) { setSelFeeId(String(first.id)); setPayAmount(String(first.balance_amount)); }
      else { setSelFeeId(null); setPayAmount(''); }
    } catch { toast.error('Failed to load student fees'); }
    finally { setLoadingFees(false); }
  };

  const reloadFees = async () => {
    if (!student) return;
    try {
      const data = await feeAPI.getStudentFees(student.id);
      setFeeData(data);
    } catch {}
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selFeeId) return toast.error('Select a fee item');
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    const target = feeData?.fees?.find((f) => String(f.id) === String(selFeeId));
    if (amt > (target?.balance_amount || 0)) {
      return toast.error(`Amount exceeds balance of ₹${Number(target.balance_amount).toLocaleString('en-IN')}`);
    }
    setSubmitting(true);
    try {
      const res = await feeAPI.recordPayment({
        student_id: student.id,
        student_fee_id: Number(selFeeId),
        amount: amt,
        mode: payMode,
        reference: reference.trim() || undefined,
      });
      toast.success(`₹${amt.toLocaleString('en-IN')} recorded!`);
      setReceipt({
        ...res.payment,
        student: feeData.student,
        fee_title: target?.title || 'Fee',
        concession_amount: Number(target?.concession_amount || 0),
        concession_reason: target?.concession_reason || '',
        paid_amount: amt,
        remaining_balance: Math.max(0, (target?.balance_amount || 0) - amt),
      });
      setPayAmount(''); setReference('');
      await reloadFees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setSubmitting(false); }
  };

  const handleConcession = async (e) => {
    e.preventDefault();
    setConcLoading(true);
    try {
      await feeAPI.applyConcession({
        student_fee_id: concessionFee.id,
        concession_amount: Number(concAmt) || 0,
        reason: concReason.trim(),
      });
      toast.success('Concession applied');
      setConcessionFee(null); setConcAmt(''); setConcReason('');
      await reloadFees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setConcLoading(false); }
  };

  const handleVoid = async (e) => {
    e.preventDefault();
    setVoidLoading(true);
    try {
      await feeAPI.voidPayment(voidItem.id, voidReason.trim());
      toast.success(`Receipt #${voidItem.receipt_no} voided`);
      setVoidItem(null); setVoidReason('');
      await reloadFees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to void'); }
    finally { setVoidLoading(false); }
  };

  const handlePrintReceipt = () => {
    const win = window.open('', '', 'width=680,height=820');
    const ModeIcon = MODE_LABELS[receipt?.mode]?.label || receipt?.mode?.toUpperCase() || '';
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receipt?.receipt_no || ''}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',system-ui,sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
      .box{background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:28px 32px;max-width:420px;width:100%}
      .school{font-size:17px;font-weight:900;color:#1e1b4b;text-align:center;letter-spacing:-.3px}
      .sub{font-size:11px;color:#6366f1;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:.6px;margin-top:3px}
      .divider{border:none;border-top:1.5px dashed #e2e8f0;margin:16px 0}
      .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px}
      .lbl{color:#64748b;font-weight:600}.val{color:#0f172a;font-weight:700}
      .amt-box{background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;margin:16px 0}
      .amt{font-size:30px;font-weight:900;color:#15803d}
      .amt-lbl{font-size:10px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
      .bal{display:flex;justify-content:space-between;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 14px;font-size:13px}
      .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:18px;font-weight:500}
      @media print{body{background:#fff;padding:0}.box{border:none;box-shadow:none}}
    </style></head><body>
    <div class="box">
      <div class="school">${schoolName.toUpperCase()}</div>
      <div class="sub">Official Fee Receipt</div>
      <hr class="divider"/>
      <div class="row"><span class="lbl">Receipt No</span><span class="val">${receipt?.receipt_no || '—'}</span></div>
      <div class="row"><span class="lbl">Date</span><span class="val">${formatDateTime(receipt?.paid_at)}</span></div>
      <div class="row"><span class="lbl">Student</span><span class="val">${receipt?.student?.name || '—'}</span></div>
      <div class="row"><span class="lbl">Class</span><span class="val">Class ${receipt?.student?.class_name || ''} ${receipt?.student?.section_name ? '— ' + receipt.student.section_name : ''}</span></div>
      <div class="row"><span class="lbl">Fee Item</span><span class="val">${receipt?.fee_title || '—'}</span></div>
      ${receipt?.concession_amount > 0 ? `<div class="row" style="color:#7e22ce"><span class="lbl" style="color:#7e22ce">Discount / Concession</span><span class="val" style="color:#7e22ce">-₹${Number(receipt.concession_amount).toLocaleString('en-IN')}${receipt.concession_reason ? ' (' + receipt.concession_reason + ')' : ''}</span></div>` : ''}
      <div class="row"><span class="lbl">Mode</span><span class="val">${ModeIcon}</span></div>
      <div class="amt-box"><div class="amt-lbl">Amount Paid</div><div class="amt">₹${Number(receipt?.amount || 0).toLocaleString('en-IN')}</div></div>
      ${Number(receipt?.remaining_balance) > 0 ? `<div class="bal"><span style="color:#c2410c;font-weight:700">Remaining Balance</span><span style="color:#c2410c;font-weight:800">₹${Number(receipt.remaining_balance).toLocaleString('en-IN')}</span></div>` : `<div class="bal" style="background:#f0fdf4;border-color:#bbf7d0"><span style="color:#15803d;font-weight:700">✓ Fully Paid</span></div>`}
      <div class="footer">Computer-generated receipt. No signature required.</div>
    </div></body></html>`);
    win.document.close(); win.print();
  };

  const handleWhatsApp = async () => {
    if (!receipt?.id) return;
    setSendingWA(true);
    try {
      const res = await feeAPI.sendWhatsAppReceipt(receipt.id);
      toast.success(res.message || 'WhatsApp receipt sent!');
    } catch (err) { toast.error(err.response?.data?.message || 'WhatsApp failed'); }
    finally { setSendingWA(false); }
  };

  const summary = feeData?.summary || {};
  const selectedFeeObj = feeData?.fees?.find((f) => String(f.id) === String(selFeeId));

  return (
    <div className="space-y-5">

      {/* ── STEP 1: Search ──────────────────────────────── */}
      {!student ? (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Search className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Find Student</p>
                <p className="text-xs text-slate-400">Search by name, admission no, roll no or parent phone</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Name, Adm No, Roll, Phone..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <select className="select-field" value={filterClass}
                onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}>
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>Class {c.class_name}</option>)}
              </select>
              <select className="select-field" value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                disabled={!filterClass}>
                <option value="">All Sections</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                {results.map((st) => (
                  <button key={st.id} type="button" onClick={() => selectStudent(st)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/60 transition-colors text-left">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {(st.user?.name || st.name || 'S')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{st.user?.name || st.name}</p>
                      <p className="text-xs text-slate-500">
                        Adm: {st.admission_no || '—'} · Class {st.class?.class_name} {st.section?.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {(search.length >= 2 || filterClass) && results.length === 0 && (
              <div className="mt-3 flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <User className="w-5 h-5 text-slate-300" />
                <p className="text-sm text-slate-400">No students found — try a different search term</p>
              </div>
            )}
          </div>
        </div>
      ) : (

        /* ── STEP 2: Student ledger + payment form ──────── */
        <div className="space-y-5">

          {/* Student header bar */}
          <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0">
                {(feeData?.student?.name || student.user?.name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  {feeData?.student?.name || student.user?.name || student.name}
                </p>
                <p className="text-xs text-slate-500">
                  Class {feeData?.student?.class_name || student.class?.class_name}
                  {(feeData?.student?.section_name || student.section?.name) ? ` — ${feeData?.student?.section_name || student.section?.name}` : ''}
                  {student.admission_no ? ` · Adm: ${student.admission_no}` : ''}
                </p>
              </div>
            </div>
            <button type="button"
              onClick={() => { setStudent(null); setFeeData(null); setSelFeeId(null); setPayAmount(''); }}
              className="btn-ghost text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Change Student
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Fee', val: summary.total_fee, color: 'slate' },
              { label: 'Paid', val: summary.total_paid, color: 'emerald' },
              { label: 'Balance Due', val: summary.total_balance, color: 'rose' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`card p-4 text-center border-t-2 ${
                color === 'emerald' ? 'border-t-emerald-400' : color === 'rose' ? 'border-t-rose-400' : 'border-t-slate-300'
              }`}>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-slate-500'
                }`}>{label}</p>
                <p className={`text-lg font-black ${
                  color === 'emerald' ? 'text-emerald-700' : color === 'rose' ? 'text-rose-700' : 'text-slate-800'
                }`}>₹{Number(val || 0).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          {/* Main content: fees list + payment form */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Left: Assigned fees */}
            <div className="lg:col-span-3 card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Fees</p>
              </div>

              {loadingFees ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading fees...</p>
                </div>
              ) : !feeData?.fees?.length ? (
                <div className="p-8 text-center text-sm text-slate-400">No fees assigned for this academic year.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {feeData.fees.map((fee) => {
                    const isPaid = fee.status === 'paid';
                    const isSelected = String(fee.id) === String(selFeeId);
                    return (
                      <div key={fee.id}
                        onClick={() => { if (!isPaid) { setSelFeeId(String(fee.id)); setPayAmount(String(fee.balance_amount)); } }}
                        className={`flex items-center justify-between gap-3 px-5 py-4 transition-all ${
                          isPaid ? 'opacity-55 cursor-default' :
                          isSelected ? 'bg-indigo-50 cursor-pointer' : 'hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                            isPaid ? 'bg-emerald-400' : isSelected ? 'bg-indigo-500' : 'bg-slate-200'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{fee.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {fee.due_date ? formatDate(fee.due_date) : 'No due date'}
                              </span>
                              {fee.concession_amount > 0 && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                                  -{fee.concession_amount.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800">
                              ₹{Number(fee.balance_amount).toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              of ₹{Number(fee.total_amount).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <StatusPill status={fee.status} />
                          {!isPaid && (
                            <button type="button"
                              onClick={(e) => { e.stopPropagation(); setConcessionFee(fee); setConcAmt(String(fee.concession_amount || '')); setConcReason(fee.concession_reason || ''); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-all"
                              title="Apply concession">
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment history */}
              {feeData?.payments?.length > 0 && (
                <>
                  <div className="px-5 py-3 border-t border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Payment History ({feeData.payments.length})
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {feeData.payments.map((p) => {
                      const matchedFee = feeData.fees?.find((f) => String(f.id) === String(p.student_fee_id));
                      const concAmt = Number(matchedFee?.concession_amount || 0);
                      const concReason = matchedFee?.concession_reason;

                      return (
                        <div key={p.id} className={`flex items-center justify-between px-5 py-3.5 ${p.is_void ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${p.is_void ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                              <Clock className={`w-3.5 h-3.5 ${p.is_void ? 'text-rose-400' : 'text-emerald-500'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${p.is_void ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                #{p.receipt_no} · {p.mode?.toUpperCase()}
                                {matchedFee?.title && <span className="ml-1.5 text-indigo-600 font-semibold">({matchedFee.title})</span>}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <span className="text-[10px] text-slate-400">
                                  {formatDate(p.paid_at)}
                                  {p.is_void && ` · VOIDED — ${p.void_reason}`}
                                </span>
                                {concAmt > 0 && (
                                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md">
                                    Discount: -₹{concAmt.toLocaleString('en-IN')}{concReason ? ` (${concReason})` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-black ${p.is_void ? 'text-rose-400 line-through' : 'text-emerald-700'}`}>
                              ₹{Number(p.amount).toLocaleString('en-IN')}
                            </span>
                            {!p.is_void && (
                              <button type="button"
                                onClick={() => { setVoidItem(p); setVoidReason(''); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Void receipt">
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Right: Payment form */}
            <div className="lg:col-span-2">
              <div className="card p-5 space-y-4 sticky top-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Collect Payment</p>
                </div>

                <form onSubmit={handlePay} className="space-y-3.5">
                  {/* Fee selector */}
                  <div>
                    <label className="label">Fee Item</label>
                    <select className="select-field text-sm" value={selFeeId || ''}
                      onChange={(e) => {
                        setSelFeeId(e.target.value || null);
                        const f = feeData?.fees?.find((x) => String(x.id) === e.target.value);
                        if (f) setPayAmount(String(f.balance_amount));
                      }} required>
                      <option value="">— Select pending fee —</option>
                      {feeData?.fees?.filter((f) => f.status !== 'paid').map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title} — ₹{Number(f.balance_amount).toLocaleString('en-IN')} due
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="label">Amount (₹)</label>
                    <input type="number" min="1" required placeholder="Enter amount"
                      className="input-field text-lg font-black text-emerald-700"
                      value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                    {selectedFeeObj && (
                      <p className="text-xs text-slate-400 mt-1">
                        Balance due: <span className="font-bold text-rose-600">₹{Number(selectedFeeObj.balance_amount).toLocaleString('en-IN')}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment mode */}
                  <div>
                    <label className="label">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(MODE_LABELS).map(([key, { label, icon: Icon }]) => (
                        <button key={key} type="button"
                          onClick={() => setPayMode(key)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            payMode === key
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                          }`}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reference (optional for non-cash) */}
                  {payMode !== 'cash' && (
                    <div>
                      <label className="label">Transaction Reference (optional)</label>
                      <input type="text" placeholder="UPI ID / Transaction ID"
                        className="input-field text-sm"
                        value={reference} onChange={(e) => setReference(e.target.value)} />
                    </div>
                  )}

                  <button type="submit" disabled={submitting}
                    className="btn-success w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Processing...' : 'Collect & Generate Receipt'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Concession Modal ──────────────────────────────── */}
      {concessionFee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Apply Concession</h3>
              </div>
              <button type="button" onClick={() => setConcessionFee(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConcession} className="p-5 space-y-3">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs text-slate-500">Fee</p>
                <p className="text-sm font-bold text-slate-800">{concessionFee.title}</p>
              </div>
              <div>
                <label className="label">Concession Amount (₹)</label>
                <input type="number" min="0" required placeholder="e.g. 1000"
                  className="input-field text-sm font-bold text-purple-700"
                  value={concAmt} onChange={(e) => setConcAmt(e.target.value)} />
              </div>
              <div>
                <label className="label">Reason</label>
                <input type="text" required placeholder="e.g. Staff quota, Sibling discount"
                  className="input-field text-sm"
                  value={concReason} onChange={(e) => setConcReason(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setConcessionFee(null)}
                  className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" disabled={concLoading}
                  className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl flex items-center gap-1.5">
                  {concLoading ? 'Applying...' : 'Apply Concession'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Void Modal ────────────────────────────────────── */}
      {voidItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Ban className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Void Payment</h3>
              </div>
              <button type="button" onClick={() => setVoidItem(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleVoid} className="p-5 space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-800 leading-relaxed">
                Void receipt <strong>#{voidItem.receipt_no}</strong> for <strong>₹{Number(voidItem.amount).toLocaleString('en-IN')}</strong>?
                The balance will be restored automatically.
              </div>
              <div>
                <label className="label">Reason for voiding</label>
                <input type="text" required placeholder="e.g. Wrong student, typo in amount"
                  className="input-field text-sm"
                  value={voidReason} onChange={(e) => setVoidReason(e.target.value)} autoFocus />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setVoidItem(null)}
                  className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" disabled={voidLoading}
                  className="btn-danger text-xs px-5 py-2 rounded-xl">
                  {voidLoading ? 'Voiding...' : 'Confirm Void'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ─────────────────────────────────── */}
      {receipt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Payment Successful</h3>
              </div>
              <button type="button" onClick={() => setReceipt(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {/* Receipt details */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2">
                {[
                  ['Receipt No', `#${receipt.receipt_no}`],
                  ['Student', receipt.student?.name],
                  ['Class', `Class ${receipt.student?.class_name}${receipt.student?.section_name ? ' — ' + receipt.student.section_name : ''}`],
                  ['Fee Item', receipt.fee_title],
                  ...(receipt.concession_amount > 0 ? [['Discount / Concession', `-₹${Number(receipt.concession_amount).toLocaleString('en-IN')}${receipt.concession_reason ? ` (${receipt.concession_reason})` : ''}`]] : []),
                  ['Mode', MODE_LABELS[receipt.mode]?.label || receipt.mode?.toUpperCase()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className={label.includes('Discount') ? 'text-purple-600 font-bold' : 'text-slate-500 font-medium'}>{label}</span>
                    <span className={label.includes('Discount') ? 'font-bold text-purple-700' : 'font-bold text-slate-800'}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Amount box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Amount Paid</p>
                <p className="text-3xl font-black text-emerald-700">₹{Number(receipt.amount || receipt.paid_amount).toLocaleString('en-IN')}</p>
              </div>

              {/* Balance row */}
              <div className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                Number(receipt.remaining_balance) > 0
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <span className="text-xs font-bold text-slate-600">Remaining Balance</span>
                <span className={`text-sm font-black ${
                  Number(receipt.remaining_balance) > 0 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {Number(receipt.remaining_balance) > 0
                    ? `₹${Number(receipt.remaining_balance).toLocaleString('en-IN')}`
                    : '✓ Fully Paid'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button type="button" onClick={handleWhatsApp} disabled={sendingWA}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {sendingWA ? 'Sending...' : 'WhatsApp'}
                </button>
                <button type="button" onClick={handlePrintReceipt}
                  className="flex-1 btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold">
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
