import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input, Textarea } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Modal } from '../../../components/common/Modal';
import { Search, BookOpen, RotateCcw, AlertTriangle, GraduationCap, UserCheck, AlertCircle, DollarSign, Info } from 'lucide-react';
import { BorrowerSearchInput } from '../../../components/common/BorrowerSearchInput';

export function LibraryReturn() {
  const [borrowerType, setBorrowerType] = useState('student');
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);

  // Library Settings (for fine calculation)
  const [settings, setSettings] = useState(null);

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [targetIssue, setTargetIssue] = useState(null);
  const [returnStatus, setReturnStatus] = useState('returned');
  const [fineAmount, setFineAmount] = useState('0');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    classesAPI
      .list()
      .then((d) => {
        const raw = d?.items || d?.rows || d?.data || (Array.isArray(d) ? d : []);
        setClasses(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setClasses([]));

    libraryAPI
      .getSettings()
      .then((s) => setSettings(s))
      .catch(() => setSettings(null));
  }, []);

  const searchBorrower = useCallback(async () => {
    if (!term.trim() && !classId) {
      setResults([]);
      return;
    }
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list({
          limit: 50,
          search: term.trim() || undefined,
          status: 'active',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
      } else {
        const res = await studentsAPI.list({
          limit: 50,
          search: term.trim() || undefined,
          class_id: classId || undefined,
          status: 'ACTIVE',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
      }
    } catch {
      setResults([]);
    }
  }, [term, classId, borrowerType]);

  useEffect(() => {
    const t = setTimeout(() => searchBorrower(), 300);
    return () => clearTimeout(t);
  }, [term, classId, searchBorrower]);

  const fetchBorrowedBooks = useCallback(async (userId) => {
    setLoadingBooks(true);
    try {
      const res = await libraryAPI.getIssuedBooks({ user_id: userId, status: 'issued' });
      const rawIssues = res?.issues || res?.items || res?.rows || res?.data || (Array.isArray(res) ? res : []);
      setBorrowedBooks(Array.isArray(rawIssues) ? rawIssues : []);
    } catch {
      toast.error('Failed to load active loans');
    } finally {
      setLoadingBooks(false);
    }
  }, [toast]);

  const handleSelectBorrower = (b) => {
    setSelectedBorrower(b);
    const userId = b.user_id || b.user?.id || b.id;
    fetchBorrowedBooks(userId);
  };

  // Calculate overdue days for an issue
  const calculateOverdueDays = (dueDateStr) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    // Normalize to midnight
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - due.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Open modal for return / lost / damaged
  const openReturnModal = (issue) => {
    setTargetIssue(issue);
    setReturnStatus('returned');
    setRemarks('');

    const overdueDays = calculateOverdueDays(issue.due_date);
    const finePerDay = Number(settings?.library_overdue_fine_per_day || 0);
    const calculatedFine = overdueDays > 0 && finePerDay > 0 ? (overdueDays * finePerDay).toFixed(2) : '0';

    setFineAmount(calculatedFine);
    setReturnModalOpen(true);
  };

  // Handle status change in modal
  const handleStatusChange = (newStatus) => {
    setReturnStatus(newStatus);
    if (!targetIssue) return;

    const overdueDays = calculateOverdueDays(targetIssue.due_date);
    const finePerDay = Number(settings?.library_overdue_fine_per_day || 0);

    if (newStatus === 'lost') {
      const calculatedFine = overdueDays > 0 && finePerDay > 0 ? (overdueDays * finePerDay).toFixed(2) : '0';
      setFineAmount(calculatedFine);
    } else {
      const calculatedFine = overdueDays > 0 && finePerDay > 0 ? (overdueDays * finePerDay).toFixed(2) : '0';
      setFineAmount(calculatedFine);
    }
  };

  // Submit return
  const handleConfirmReturn = async () => {
    if (!targetIssue) return;
    setSubmitting(true);
    try {
      const payload = {
        status: returnStatus,
        fine_amount: Number(fineAmount) >= 0 ? Number(fineAmount) : 0,
        remarks: remarks.trim() || undefined,
      };

      await libraryAPI.returnBook(targetIssue.id, payload);

      const bookName = targetIssue.book?.book_name || targetIssue.book_name || 'Book';
      const statusLabel = returnStatus === 'lost' ? 'marked as LOST' : returnStatus === 'damaged' ? 'marked as DAMAGED' : 'returned to inventory';

      toast.success(`"${bookName}" ${statusLabel}${payload.fine_amount > 0 ? ` (Fine: ₹${payload.fine_amount})` : ''}`);

      setReturnModalOpen(false);
      setTargetIssue(null);

      const userId = selectedBorrower.user_id || selectedBorrower.user?.id || selectedBorrower.id;
      fetchBorrowedBooks(userId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#2F6F5E]" /> Return Book Desk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Borrower Search Component */}
          <BorrowerSearchInput
            borrowerType={borrowerType}
            onBorrowerTypeChange={(type) => { setBorrowerType(type); setSelectedBorrower(null); setBorrowedBooks([]); }}
            selectedBorrower={selectedBorrower}
            onSelectBorrower={(b) => handleSelectBorrower(b)}
            onClearBorrower={() => { setSelectedBorrower(null); setBorrowedBooks([]); }}
            showTypeToggle={true}
          />

          {selectedBorrower && (
            <div className="space-y-3">
              <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] flex items-center justify-between">
                <span className="font-bold text-[#2F6F5E]">Active Borrower: {selectedBorrower.user?.name || selectedBorrower.name}</span>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedBorrower(null); setBorrowedBooks([]); }}>Change</Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#14213D]">Currently Borrowed Books ({borrowedBooks.length})</h4>
                {loadingBooks ? (
                  <p className="text-[#8C97AB]">Loading active loans...</p>
                ) : borrowedBooks.length === 0 ? (
                  <p className="text-[#8C97AB]">No active books currently borrowed by this user.</p>
                ) : (
                  <div className="divide-y divide-[#EDEAE1] border border-[#E4E1D8] rounded-[8px] overflow-hidden">
                    {borrowedBooks.map((item) => {
                      const overdueDays = calculateOverdueDays(item.due_date);
                      const isOverdue = overdueDays > 0;
                      return (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-[#FAFAF8]">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#14213D]">{item.book?.book_name || item.book_name}</p>
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#FDF2F2] text-[#D92D20] border border-[#FECDCA]">
                                  <AlertCircle className="w-3 h-3" /> Overdue by {overdueDays} days
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#8C97AB]">
                              Book No: {item.book?.book_no || '—'} · Issued: {formatDate(item.issue_date)} · Due: {formatDate(item.due_date)}
                            </p>
                          </div>
                          <Button
                            variant={isOverdue ? "danger" : "primary"}
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => openReturnModal(item)}
                          >
                            Return / Action
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return & Action Modal */}
      {returnModalOpen && targetIssue && (
        <Modal
          isOpen={returnModalOpen}
          onClose={() => { if (!submitting) { setReturnModalOpen(false); setTargetIssue(null); } }}
          title="Return Book / Status Action"
          maxWidth="max-w-md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => { setReturnModalOpen(false); setTargetIssue(null); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={submitting}
                onClick={handleConfirmReturn}
              >
                Confirm & Process
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Book & Borrower Summary Card */}
            <div className="p-3 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#14213D] text-sm">
                  {targetIssue.book?.book_name || targetIssue.book_name}
                </span>
                {calculateOverdueDays(targetIssue.due_date) > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FDF2F2] text-[#D92D20]">
                    {calculateOverdueDays(targetIssue.due_date)} Days Overdue
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF3F0] text-[#2F6F5E]">
                    On Time
                  </span>
                )}
              </div>
              <p className="text-[#52607D]">
                Borrower: <strong className="text-[#14213D]">{selectedBorrower?.user?.name || selectedBorrower?.name}</strong>
              </p>
              <div className="flex gap-4 text-[10px] text-[#8C97AB] font-mono">
                <span>Issue Date: {formatDate(targetIssue.issue_date)}</span>
                <span>Due Date: {formatDate(targetIssue.due_date)}</span>
              </div>
            </div>

            {/* Action / Return Status Select */}
            <div className="space-y-1">
              <label className="font-semibold text-[#14213D]">Return Action / Book Condition</label>
              <Select
                value={returnStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="returned">Returned (Normal / Restock Copy)</option>
                <option value="damaged">Damaged (Returned Copy / Needs Repair)</option>
                <option value="lost">Lost (Mark Book as Lost by Borrower)</option>
              </Select>
            </div>

            {/* Fine Amount Input */}
            <div className="space-y-1">
              <label className="font-semibold text-[#14213D] flex items-center justify-between">
                <span>Fine Amount (₹)</span>
                {settings?.library_overdue_fine_per_day > 0 && (
                  <span className="text-[10px] text-[#8C97AB]">
                    Rate: ₹{settings.library_overdue_fine_per_day}/day
                  </span>
                )}
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                icon={DollarSign}
                placeholder="0"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
              />
              <p className="text-[10px] text-[#8C97AB]">
                {calculateOverdueDays(targetIssue.due_date) > 0
                  ? `Autofilled from ${calculateOverdueDays(targetIssue.due_date)} overdue days. Modify manually or set to 0 to waive fine.`
                  : 'Enter fine amount if applicable (or leave 0 for no fine).'}
              </p>
            </div>

            {/* Remarks / Notes Input */}
            <div className="space-y-1">
              <label className="font-semibold text-[#14213D]">Remarks / Notes (Optional)</label>
              <Textarea
                rows={2}
                placeholder="e.g., Paid fine via cash, cover damaged slightly, etc."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
