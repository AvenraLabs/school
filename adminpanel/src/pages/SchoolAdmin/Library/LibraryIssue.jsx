import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI, sectionsAPI } from '../../../api';
import { getApiAssetUrl } from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';
import { Search, BookOpen, User, CheckCircle2, Loader2, AlertCircle, X, ChevronDown, BookPlus, UserCheck, GraduationCap } from 'lucide-react';

function BookCoverImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50/50 text-indigo-300">
        <BookOpen className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={getApiAssetUrl(src)}
      alt={alt || 'Book Cover'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function BorrowerSearchBox({ borrowerType, onSelect }) {
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

  const search = useCallback(async () => {
    if (!term.trim() && !classId && borrowerType === 'student') return;
    setLoading(true);
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list(20, 0, 'active', 'approved');
        const items = res?.rows || res?.items || res || [];
        const filtered = term.trim()
          ? items.filter(t =>
              t.user?.name?.toLowerCase().includes(term.toLowerCase()) ||
              t.user?.phone?.includes(term) ||
              t.employee_id?.toLowerCase().includes(term.toLowerCase())
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
    const t = setTimeout(() => { search(); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={borrowerType === 'teacher' ? 'Search teacher name/phone...' : 'Name or Roll No...'}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-full outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {borrowerType === 'student' && (
          <>
            <div className="relative">
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name || c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!classId}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer disabled:opacity-50"
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.section_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching...
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {results.slice(0, 10).map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 flex-shrink-0">
                {(item.user?.name || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{item.user?.name || 'Unknown'}</p>
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
        <p className="text-sm text-slate-400 py-2">No borrowers found.</p>
      )}
    </div>
  );
}

function BookCardsGrid({ onSelect }) {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 8;

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.listBooks({
        status: 'active',
        search: search.trim() || undefined,
        limit: LIMIT,
        offset,
      });
      setBooks(res.books || []);
      setTotal(res.total || 0);
    } catch {
      setBooks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, offset]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2 — Select Book</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by book name or number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading books...
        </div>
      ) : books.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {books.map((book) => {
            const isAvailable = book.available_copies > 0;
            return (
              <div
                key={book.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex gap-3 ${
                  isAvailable
                    ? 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                {/* Cover Picture */}
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                  <BookCoverImage src={book.image_url} alt={book.book_name} className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{book.book_name}</h4>
                    <p className="text-xs font-mono text-slate-400">{book.book_no}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAvailable ? `${book.available_copies} Left` : 'Out of Stock'}
                    </span>
                    <button
                      disabled={!isAvailable}
                      onClick={() => onSelect(book)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                    >
                      <BookPlus className="h-3 w-3" /> Select
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > LIMIT && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total} books
          </p>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={offset + LIMIT >= total}
              onClick={() => setOffset(offset + LIMIT)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LibraryIssue() {
  const toast = useToast();
  const [borrowerType, setBorrowerType] = useState('student'); // 'student' or 'teacher'
  const [borrower, setBorrower] = useState(null);
  const [book, setBook] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [defaultLoanDays, setDefaultLoanDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    libraryAPI.getSettings().then((s) => {
      const days = s?.library_loan_period_days || 14;
      setDefaultLoanDays(days);
      const d = new Date();
      d.setDate(d.getDate() + days);
      setDueDate(d.toISOString().split('T')[0]);
    }).catch(() => {});
  }, []);

  const handleBorrowerSelect = (b) => { setBorrower(b); setBook(null); setError(''); setSuccess(''); };
  const handleBookSelect = (b) => { setBook(b); setError(''); setSuccess(''); };
  const reset = () => { setBorrower(null); setBook(null); setError(''); setSuccess(''); };

  const handleIssue = async () => {
    if (!borrower || !book || !dueDate) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        borrower_type: borrowerType,
        student_id: borrowerType === 'student' ? parseInt(borrower.id, 10) : null,
        teacher_id: borrowerType === 'teacher' ? parseInt(borrower.id, 10) : null,
        book_id: parseInt(book.id, 10),
        due_date: dueDate,
      };

      await libraryAPI.issueBook(payload);
      setSuccess(`"${book.book_name}" issued to ${borrower.user?.name} — Due: ${dueDate}`);
      setBorrower(null);
      setBook(null);
      const d = new Date();
      d.setDate(d.getDate() + defaultLoanDays);
      setDueDate(d.toISOString().split('T')[0]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">{success}</p>
            <button onClick={() => setSuccess('')} className="text-xs font-medium text-emerald-600 hover:underline mt-1">
              Issue another book
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Select Borrower Type & Search */}
      {!borrower ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1 — Choose Borrower</p>
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

          <BorrowerSearchBox borrowerType={borrowerType} onSelect={handleBorrowerSelect} />
        </div>
      ) : (
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
          <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-indigo-200 text-indigo-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2: Book Cards Selection */}
      {borrower && !book && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <BookCardsGrid onSelect={handleBookSelect} />
        </div>
      )}

      {/* Step 3: Confirm Issue */}
      {borrower && book && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3 — Confirm Issue</p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{borrower.user?.name}</span>
              <span className="text-xs text-slate-400">
                ({borrowerType === 'teacher' ? 'Teacher' : `${borrower.class?.class_name || borrower.class?.name} ${borrower.section?.name}`})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{book.book_name}</span>
              <span className="text-xs font-mono text-slate-400">{book.book_no}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-xs text-slate-400">Pre-filled with default {defaultLoanDays}-day loan period. Change if needed.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setBook(null)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Change Book
            </button>
            <button
              id="library-confirm-issue-btn"
              onClick={handleIssue}
              disabled={submitting || !dueDate}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
