import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import {
  Search, BookOpen, RotateCcw, AlertTriangle, CheckCircle2,
  Loader2, AlertCircle, ChevronDown, X, GraduationCap, UserCheck, Calculator,
} from 'lucide-react';

function BorrowerPicker({ borrowerType, onSelect }) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (borrowerType === 'student') {
      classesAPI.list().then((d) => setClasses(Array.isArray(d) ? d : d?.rows || d?.items || []));
    }
  }, [borrowerType]);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionsAPI.listByClass(classId).then((d) => setSections(Array.isArray(d) ? d : d?.rows || d?.items || []));
  }, [classId]);

  const doSearch = useCallback(async () => {
    if (!term.trim() && !classId && borrowerType === 'student') return;
    setLoading(true);
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list(20, 0, 'active', 'approved');
        const items = res?.rows || res?.items || res || [];
        const filtered = term.trim()
          ? items.filter(t =>
              t.user?.name?.toLowerCase().includes(term.toLowerCase()) ||
              t.user?.phone?.includes(term)
            )
          : items;
        setResults(filtered);
      } else {
        const res = await studentsAPI.list(15, 0, classId || undefined, sectionId || undefined, undefined, 'approved');
        const items = res?.rows || res?.items || res || [];
        const filtered = term.trim()
          ? items.filter(s =>
              s.user?.name?.toLowerCase().includes(term.toLowerCase()) ||
              String(s.roll_no || '').toLowerCase().includes(term.toLowerCase())
            )
          : items;
        setResults(filtered);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [term, classId, sectionId, borrowerType]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(), 300);
    return () => clearTimeout(t);
  }, [doSearch]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={borrowerType === 'teacher' ? 'Name or phone...' : 'Name or Roll No...'}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-full outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {borrowerType === 'student' && (
          <>
            <div className="relative">
              <select value={classId} onChange={(e) => setClassId(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer">
                <option value="">All Classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name || c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-50">
                <option value="">All Sections</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.name || s.section_name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </>
        )}
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 className="h-4 w-4 animate-spin" /> Searching...</div>}

      {!loading && results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {results.slice(0, 10).map((item) => (
            <button key={item.id} onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 flex-shrink-0">
                {(item.user?.name || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{item.user?.name}</p>
                <p className="text-xs text-slate-500">
                  {borrowerType === 'teacher'
                    ? `Teacher • Phone: ${item.user?.phone || '—'}`
                    : `${item.class?.class_name || item.class?.name} ${item.section?.name} • Roll No: ${item.roll_no || '—'}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && (term.trim() || classId) && results.length === 0 && (
        <p className="text-sm text-slate-400 py-2">No records found.</p>
      )}
    </div>
  );
}

function ReturnModal({ issue, settings, onClose, onReturned }) {
  const toast = useToast();
  const [status, setStatus] = useState('returned'); // 'returned', 'damaged', 'lost'
  const [fineAmount, setFineAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = issue.due_date < today;

  // Calculate overdue fine days
  const overdueDays = isOverdue
    ? Math.max(0, Math.floor((new Date(today) - new Date(issue.due_date)) / (1000 * 60 * 60 * 24)))
    : 0;

  const finePerDay = parseFloat(settings?.library_overdue_fine_per_day || 0);
  const suggestedOverdueFine = overdueDays * finePerDay;

  // Pre-fill suggested overdue fine if present
  useEffect(() => {
    if (isOverdue && suggestedOverdueFine > 0 && !fineAmount) {
      setFineAmount(suggestedOverdueFine.toFixed(2));
    }
  }, [isOverdue, suggestedOverdueFine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await libraryAPI.returnBook(issue.id, {
        status,
        fine_amount: fineAmount ? parseFloat(fineAmount) : null,
        remarks: remarks || null,
      });
      toast.success(
        status === 'returned'
          ? 'Book returned successfully'
          : status === 'damaged'
          ? 'Book marked as returned (damaged)'
          : 'Book marked as lost'
      );
      onReturned();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to process return');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Process Book Return</h3>
            <p className="text-xs text-slate-500 mt-0.5">{issue.Book?.book_name} — {issue.Book?.book_no}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {isOverdue && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Book is {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue!</p>
                {finePerDay > 0 && (
                  <p className="mt-0.5 text-amber-700">
                    Fine rate: ₹{finePerDay}/day → Suggested Fine: <strong>₹{suggestedOverdueFine.toFixed(2)}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Select Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Return Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'returned', label: 'Returned', desc: 'Good condition' },
                { value: 'damaged', label: 'Damaged', desc: 'Book damaged' },
                { value: 'lost', label: 'Lost', desc: 'Book unreturned' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col items-center justify-center rounded-xl border cursor-pointer p-2.5 text-center transition-all ${
                    status === opt.value
                      ? opt.value === 'returned'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                        : opt.value === 'damaged'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                        : 'border-rose-500 bg-rose-50 text-rose-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="return_status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-400">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fine Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Fine Amount (₹)
              </label>
              {isOverdue && suggestedOverdueFine > 0 && (
                <button
                  type="button"
                  onClick={() => setFineAmount(suggestedOverdueFine.toFixed(2))}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Calculator className="h-3 w-3" /> Auto-fill (₹{suggestedOverdueFine})
                </button>
              )}
            </div>
            <input
              type="number"
              min={0}
              step="0.01"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {status !== 'returned' && (
              <p className="text-[11px] text-slate-400">
                {status === 'lost' ? 'Fine for lost book replacement cost.' : 'Fine for repairing/replacing damaged book.'}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Reason / Condition notes..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LibraryReturn() {
  const [borrowerType, setBorrowerType] = useState('student');
  const [borrower, setBorrower] = useState(null);
  const [issues, setIssues] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [returnModal, setReturnModal] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    libraryAPI.getSettings().then((s) => setSettings(s)).catch(() => {});
  }, []);

  const loadBorrowerIssues = useCallback(async (b) => {
    setBorrower(b);
    setLoadingIssues(true);
    try {
      const params = { status: 'issued', limit: 50 };
      if (borrowerType === 'teacher') params.teacher_id = b.id;
      else params.student_id = b.id;

      const data = await libraryAPI.listIssues(params);
      setIssues(data.issues || []);
    } catch {
      setIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  }, [borrowerType]);

  const refresh = () => borrower && loadBorrowerIssues(borrower);

  return (
    <div className="space-y-6 max-w-2xl">
      {!borrower ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Find Borrower to Process Return</p>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
              <button
                onClick={() => { setBorrowerType('student'); setBorrower(null); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  borrowerType === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" /> Student
              </button>
              <button
                onClick={() => { setBorrowerType('teacher'); setBorrower(null); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  borrowerType === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Teacher
              </button>
            </div>
          </div>

          <BorrowerPicker borrowerType={borrowerType} onSelect={loadBorrowerIssues} />
        </div>
      ) : (
        <>
          {/* Selected Borrower */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                {(borrower.user?.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">{borrower.user?.name}</p>
                <p className="text-xs text-indigo-600">
                  {borrowerType === 'teacher'
                    ? `Teacher • Phone: ${borrower.user?.phone || '—'}`
                    : `${borrower.class?.class_name || borrower.class?.name} ${borrower.section?.name} • Roll No: ${borrower.roll_no || '—'}`}
                </p>
              </div>
            </div>
            <button onClick={() => { setBorrower(null); setIssues([]); }}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-indigo-200 text-indigo-500">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Issued Books */}
          <div className="space-y-2">
            {loadingIssues ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-400 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading books...
              </div>
            ) : issues.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
                <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No books currently issued to this borrower</p>
              </div>
            ) : (
              issues.map((issue) => {
                const isOverdue = issue.due_date < today;
                return (
                  <div key={issue.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                        isOverdue ? 'bg-rose-100' : 'bg-emerald-100'
                      }`}>
                        <BookOpen className={`h-5 w-5 ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{issue.Book?.book_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{issue.Book?.book_no}</p>
                        <p className={`text-xs font-medium mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                          {isOverdue ? '⚠ Overdue · ' : 'Due: '}{formatDate(issue.due_date)}
                        </p>
                      </div>
                    </div>
                    <button
                      id={`return-issue-${issue.id}`}
                      onClick={() => setReturnModal(issue)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Return / Lost
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {returnModal && (
        <ReturnModal
          issue={returnModal}
          settings={settings}
          onClose={() => setReturnModal(null)}
          onReturned={refresh}
        />
      )}
    </div>
  );
}
