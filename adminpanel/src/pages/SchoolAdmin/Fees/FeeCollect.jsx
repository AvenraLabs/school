import { useState, useEffect, useRef } from 'react';
import { feeAPI, studentsAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate, formatDateTime } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';
import {
  Search, IndianRupee, CheckCircle2, ChevronRight, Printer,
  MessageCircle, X, Calendar, Ban, Tag, User, ArrowLeft,
  Clock, Banknote, Smartphone, Building2, CreditCard, Repeat
} from 'lucide-react';

const MODE_LABELS = {
  cash: { label: 'Cash', icon: Banknote },
  upi: { label: 'UPI / GPay', icon: Smartphone },
  bank_transfer: { label: 'Bank / NEFT', icon: Building2 },
  pos: { label: 'Card POS', icon: CreditCard },
};

export function FeeCollect() {
  const { user } = useAuth();
  const schoolName = user?.school?.school_name || user?.school_name || 'School';

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);

  const [student, setStudent] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);

  const [selFeeId, setSelFeeId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [cashTendered, setCashTendered] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [receipt, setReceipt] = useState(null);
  const [sendingWA, setSendingWA] = useState(false);

  const toast = useToast();

  useEffect(() => {
    classesAPI.list().then((r) => {
      const raw = r?.items || r?.rows || r?.data || r;
      setClasses(Array.isArray(raw) ? raw : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!filterClass) { setSections([]); setFilterSection(''); return; }
    sectionsAPI.listByClass(filterClass).then((r) => {
      const raw = r?.items || r?.rows || r?.data || r;
      setSections(Array.isArray(raw) ? raw : []);
    }).catch(() => setSections([]));
  }, [filterClass]);

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
      if (first) {
        setSelFeeId(String(first.id));
        setPayAmount(String(first.balance_amount));
        setCashTendered(String(first.balance_amount));
      } else {
        setSelFeeId(null);
        setPayAmount('');
        setCashTendered('');
      }
    } catch {
      toast.error('Failed to load student fees');
    } finally {
      setLoadingFees(false);
    }
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
      setPayAmount('');
      setCashTendered('');
      setReference('');
      await reloadFees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const closeReceiptAndReset = () => {
    setReceipt(null);
    setStudent(null);
    setFeeData(null);
    setSelFeeId(null);
    setPayAmount('');
    setCashTendered('');
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const numberToWordsINR = (num) => {
    if (!num || isNaN(num)) return "Rupees Zero Only";
    const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    const b = ["", "", "Twenty ", "Thirty ", "Forty ", "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "];
    const inWords = (n) => (n > 19 ? b[Math.floor(n / 10)] + a[n % 10] : a[n]);
    let n = Math.floor(Number(num));
    let result = "";
    if (n >= 10000000) { result += inWords(Math.floor(n / 10000000)) + "Crore "; n %= 10000000; }
    if (n >= 100000) { result += inWords(Math.floor(n / 100000)) + "Lakh "; n %= 100000; }
    if (n >= 1000) { result += inWords(Math.floor(n / 1000)) + "Thousand "; n %= 1000; }
    if (n >= 100) { result += inWords(Math.floor(n / 100)) + "Hundred "; n %= 100; }
    if (n > 0) { result += inWords(n); }
    return "Rupees " + result.trim() + " Only";
  };

  const handlePrintReceipt = () => {
    const win = window.open('', '', 'width=680,height=820');
    const ModeIcon = MODE_LABELS[receipt?.mode]?.label || receipt?.mode?.toUpperCase() || '';
    const amtWords = numberToWordsINR(receipt?.amount || receipt?.paid_amount || 0);

    win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${receipt?.receipt_no || ''}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',system-ui,sans-serif;background:#FAFAF8;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
      .box{background:#fff;border:1.5px solid #E4E1D8;border-radius:12px;padding:28px 32px;max-width:440px;width:100%}
      .school{font-size:18px;font-weight:800;color:#14213D;text-align:center;letter-spacing:-.3px}
      .sub{font-size:11px;color:#2F6F5E;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:.6px;margin-top:3px}
      .divider{border:none;border-top:1.5px dashed #E4E1D8;margin:16px 0}
      .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:13px}
      .lbl{color:#52607D;font-weight:600}.val{color:#14213D;font-weight:700}
      .amt-box{background:#EAF3F0;border:1.5px solid #D3E6E0;border-radius:10px;padding:16px;text-align:center;margin:16px 0}
      .amt{font-size:30px;font-weight:900;color:#2F6F5E}
      .amt-words{font-size:11px;font-weight:700;color:#2F6F5E;margin-top:4px;font-style:italic}
      .amt-lbl{font-size:10px;font-weight:800;color:#2F6F5E;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
      .bal{display:flex;justify-content:space-between;background:#FDF8EC;border:1px solid #F7E7C4;border-radius:8px;padding:10px 14px;font-size:13px}
      .sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;padding-top:16px;border-top:1px solid #EDEAE1}
      .sig-box{text-align:center}
      .sig-line{width:120px;border-bottom:1px solid #8C97AB;margin-bottom:4px}
      .sig-txt{font-size:10px;font-weight:600;color:#52607D}
      .footer{text-align:center;font-size:9px;color:#8C97AB;margin-top:16px;font-weight:500}
      @media print{body{background:#fff;padding:0}.box{border:none;box-shadow:none}}
    </style></head><body>
    <div class="box">
      <div class="school">${schoolName.toUpperCase()}</div>
      <div class="sub">Official Fee Payment Receipt</div>
      <hr class="divider"/>
      <div class="row"><span class="lbl">Receipt No</span><span class="val">${receipt?.receipt_no || '—'}</span></div>
      <div class="row"><span class="lbl">Date & Time</span><span class="val">${formatDateTime(receipt?.paid_at)}</span></div>
      <div class="row"><span class="lbl">Student Name</span><span class="val">${receipt?.student?.name || '—'}</span></div>
      <div class="row"><span class="lbl">Admission No</span><span class="val">${receipt?.student?.admission_no || '—'}</span></div>
      <div class="row"><span class="lbl">Class & Section</span><span class="val">Class ${receipt?.student?.class_name || ''} ${receipt?.student?.section_name ? '— ' + receipt.student.section_name : ''}</span></div>
      <div class="row"><span class="lbl">Fee Description</span><span class="val">${receipt?.fee_title || '—'}</span></div>
      <div class="row"><span class="lbl">Payment Mode</span><span class="val">${ModeIcon}</span></div>
      <div class="amt-box">
        <div class="amt-lbl">Amount Collected</div>
        <div class="amt">₹${Number(receipt?.amount || 0).toLocaleString('en-IN')}</div>
        <div class="amt-words">${amtWords}</div>
      </div>
      ${Number(receipt?.remaining_balance) > 0 ? `<div class="bal"><span style="color:#B8860B;font-weight:700">Remaining Balance</span><span style="color:#B8860B;font-weight:800">₹${Number(receipt.remaining_balance).toLocaleString('en-IN')}</span></div>` : `<div class="bal" style="background:#EAF3F0;border-color:#D3E6E0"><span style="color:#2F6F5E;font-weight:700">✓ Fully Paid</span></div>`}
      <div class="sig-block">
        <div class="sig-box"><div class="sig-line"></div><div class="sig-txt">Depositor Signature</div></div>
        <div class="sig-box"><div class="sig-line"></div><div class="sig-txt">Cashier / Principal</div></div>
      </div>
      <div class="footer">Computer generated official receipt</div>
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
  const changeToReturn = Math.max(0, (Number(cashTendered) || 0) - (Number(payAmount) || 0));

  return (
    <div className="space-y-4">
      {!student ? (
        <Card className="p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#2F6F5E]" />
              <CardTitle className="text-sm font-bold text-[#14213D]">Search Student for Fee Collection Desk</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                ref={searchRef}
                icon={Search}
                placeholder="Name, Adm No, Roll, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <Select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}>
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>Class {c.class_name || c.name}</option>)}
              </Select>
              <Select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} disabled={!filterClass}>
                <option value="">All Sections</option>
                {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
              </Select>
            </div>

            {results.length > 0 && (
              <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden divide-y divide-[#EDEAE1]">
                {results.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => selectStudent(st)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EAF3F0] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EAF3F0] text-[#2F6F5E] font-bold text-xs flex items-center justify-center shrink-0">
                      {(st.user?.name || st.name || 'S')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#14213D] truncate">{st.user?.name || st.name}</p>
                      <p className="text-[10px] text-[#8C97AB] font-mono">
                        Adm: {st.admission_no || '—'} · Class {st.class?.class_name} {st.section?.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C97AB] shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EAF3F0] text-[#2F6F5E] font-bold text-xs flex items-center justify-center shrink-0">
                {(feeData?.student?.name || student.user?.name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#14213D]">
                  {feeData?.student?.name || student.user?.name || student.name}
                </h3>
                <p className="text-[10px] text-[#52607D] font-mono">
                  Class {feeData?.student?.class_name || student.class?.class_name}
                  {(feeData?.student?.section_name || student.section?.name) ? ` — ${feeData?.student?.section_name || student.section?.name}` : ''}
                  {student.admission_no ? ` · Adm: ${student.admission_no}` : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => { setStudent(null); setFeeData(null); setSelFeeId(null); setPayAmount(''); }}
            >
              Change Student
            </Button>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center border-t-2 border-t-[#14213D]">
              <p className="text-[10px] font-bold uppercase text-[#8C97AB]">Total Assigned</p>
              <p className="text-sm font-bold font-mono text-[#14213D]">₹{Number(summary.total_fee || 0).toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-3 text-center border-t-2 border-t-[#2F6F5E]">
              <p className="text-[10px] font-bold uppercase text-[#2F6F5E]">Total Paid</p>
              <p className="text-sm font-bold font-mono text-[#2F6F5E]">₹{Number(summary.total_paid || 0).toLocaleString('en-IN')}</p>
            </Card>
            <Card className="p-3 text-center border-t-2 border-t-[#B0403A]">
              <p className="text-[10px] font-bold uppercase text-[#B0403A]">Balance Due</p>
              <p className="text-sm font-bold font-mono text-[#B0403A]">₹{Number(summary.total_balance || 0).toLocaleString('en-IN')}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="py-2 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold uppercase text-[#52607D]">Assigned Fee Heads</CardTitle>
              </CardHeader>
              <div className="divide-y divide-[#EDEAE1] text-xs">
                {feeData?.fees?.map((fee) => {
                  const isPaid = fee.status === 'paid';
                  const isSelected = String(fee.id) === String(selFeeId);
                  return (
                    <div
                      key={fee.id}
                      onClick={() => {
                        if (!isPaid) {
                          setSelFeeId(String(fee.id));
                          setPayAmount(String(fee.balance_amount));
                          setCashTendered(String(fee.balance_amount));
                        }
                      }}
                      className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                        isPaid ? 'opacity-50 cursor-default' :
                        isSelected ? 'bg-[#EAF3F0] cursor-pointer' : 'hover:bg-[#FAFAF8] cursor-pointer'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-[#14213D]">{fee.title}</p>
                        <p className="text-[10px] text-[#8C97AB]">Due: {fee.due_date ? formatDate(fee.due_date) : 'No due date'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#14213D]">₹{Number(fee.balance_amount).toLocaleString('en-IN')}</span>
                        <StatusBadge status={fee.status === 'paid' ? 'active' : fee.status === 'partial' ? 'warning' : 'danger'} label={fee.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="py-2 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold uppercase text-[#52607D]">Record Payment Terminal</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <form onSubmit={handlePay} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-[#14213D] mb-1">Fee Item *</label>
                    <Select
                      value={selFeeId || ''}
                      onChange={(e) => {
                        setSelFeeId(e.target.value || null);
                        const f = feeData?.fees?.find((x) => String(x.id) === e.target.value);
                        if (f) {
                          setPayAmount(String(f.balance_amount));
                          setCashTendered(String(f.balance_amount));
                        }
                      }}
                      required
                    >
                      <option value="">Select fee item...</option>
                      {feeData?.fees?.filter((f) => f.status !== 'paid').map((f) => (
                        <option key={f.id} value={f.id}>{f.title} (Due: ₹{Number(f.balance_amount).toLocaleString('en-IN')})</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#14213D] mb-1">Fee Amount to Collect (₹) *</label>
                    <Input
                      type="number"
                      required
                      min="1"
                      placeholder="Amount..."
                      className="font-mono font-bold text-sm text-[#2F6F5E]"
                      value={payAmount}
                      onChange={(e) => {
                        setPayAmount(e.target.value);
                        if (!cashTendered || Number(cashTendered) < Number(e.target.value)) {
                          setCashTendered(e.target.value);
                        }
                      }}
                    />
                  </div>

                  {payMode === 'cash' && (
                    <div className="p-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[6px] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-[#14213D]">Cash Received from Parent (₹)</label>
                        <span className="font-mono text-[10px] text-[#52607D]">Change Calculator</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="Cash Tendered..."
                        className="font-mono text-xs"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                      />
                      {Number(cashTendered) > Number(payAmount) && (
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-[#2F6F5E]">
                          <span>Return Change to Parent:</span>
                          <span>₹{changeToReturn.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-[#14213D] mb-1">Payment Mode *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(MODE_LABELS).map(([key, { label, icon: Icon }]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPayMode(key)}
                          className={`p-2 rounded-[6px] border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            payMode === key
                              ? 'bg-[#EAF3F0] border-[#2F6F5E] text-[#2F6F5E]'
                              : 'bg-white border-[#E4E1D8] text-[#52607D] hover:bg-[#FAFAF8]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button variant="primary" icon={CheckCircle2} className="w-full" type="submit" loading={submitting}>
                    Collect & Print Receipt (Enter)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Receipt */}
      <Modal isOpen={!!receipt} onClose={closeReceiptAndReset} title="Payment Receipt Generated">
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] text-[#2F6F5E] text-center font-mono font-bold text-lg">
            ₹{Number(receipt?.amount || receipt?.paid_amount || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex justify-between items-center gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" icon={Repeat} onClick={closeReceiptAndReset}>
              Next Student
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" icon={MessageCircle} onClick={handleWhatsApp} loading={sendingWA}>WhatsApp</Button>
              <Button variant="primary" icon={Printer} onClick={handlePrintReceipt}>Print Receipt</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
