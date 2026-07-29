import { useState, useEffect, useCallback } from 'react';
import { studentsAPI, teachersAPI, classesAPI } from '../../api';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, UserCheck, GraduationCap, X } from 'lucide-react';

export function BorrowerSearchInput({
  borrowerType = 'student',
  onBorrowerTypeChange,
  selectedBorrower = null,
  onSelectBorrower,
  onClearBorrower,
  showTypeToggle = false,
  placeholder,
  className = '',
}) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    classesAPI
      .list()
      .then((d) => {
        const raw = d?.items || d?.rows || d?.data || (Array.isArray(d) ? d : []);
        setClasses(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setClasses([]));
  }, []);

  const searchBorrowers = useCallback(async () => {
    if (!query.trim() && !classId) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list({
          limit: 30,
          search: query.trim() || undefined,
          status: 'ACTIVE',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
      } else {
        const res = await studentsAPI.list({
          limit: 30,
          search: query.trim() || undefined,
          class_id: classId || undefined,
          status: 'ACTIVE',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, classId, borrowerType]);

  useEffect(() => {
    const timer = setTimeout(() => searchBorrowers(), 300);
    return () => clearTimeout(timer);
  }, [query, classId, searchBorrowers]);

  if (selectedBorrower) {
    const borrowerName = selectedBorrower.user?.name || selectedBorrower.name || 'Selected Borrower';
    const borrowerMeta = selectedBorrower.user?.username
      ? `@${selectedBorrower.user.username}`
      : selectedBorrower.admission_no || selectedBorrower.employee_id || `ID: ${selectedBorrower.id}`;

    return (
      <div className={`p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] flex items-center justify-between ${className}`}>
        <div>
          <span className="font-bold text-xs text-[#2F6F5E] block">{borrowerName}</span>
          <span className="text-[10px] text-[#52607D] font-mono">{borrowerMeta}</span>
        </div>
        {onClearBorrower && (
          <Button variant="ghost" size="sm" icon={X} onClick={onClearBorrower}>
            Change
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showTypeToggle && onBorrowerTypeChange && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={borrowerType === 'student' ? 'primary' : 'outline'}
            size="sm"
            icon={GraduationCap}
            onClick={() => onBorrowerTypeChange('student')}
          >
            Student Borrower
          </Button>
          <Button
            type="button"
            variant={borrowerType === 'teacher' ? 'primary' : 'outline'}
            size="sm"
            icon={UserCheck}
            onClick={() => onBorrowerTypeChange('teacher')}
          >
            Teacher Borrower
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          icon={Search}
          placeholder={
            placeholder ||
            (borrowerType === 'teacher'
              ? 'Search teacher name, username, phone...'
              : 'Search student name, username, roll no...')
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {borrowerType === 'student' && (
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Class {c.class_name || c.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {results.length > 0 && (
        <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden divide-y divide-[#EDEAE1] max-h-60 overflow-y-auto">
          {results.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBorrower && onSelectBorrower(b)}
              className="p-3 hover:bg-[#EAF3F0] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div>
                <span className="font-semibold text-xs text-[#14213D] block">{b.user?.name || b.name}</span>
                {b.user?.username && (
                  <span className="text-[10px] text-[#2F6F5E] font-mono font-bold">@{b.user.username}</span>
                )}
              </div>
              <span className="text-[10px] text-[#8C97AB] font-mono">
                {b.admission_no || b.employee_id || (b.roll_no ? `Roll: ${b.roll_no}` : `ID: ${b.id}`)}
              </span>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (query.trim() || classId) && !loading && (
        <div className="p-3 text-center border border-dashed border-[#E4E1D8] rounded-[8px] text-xs text-[#8C97AB]">
          No active {borrowerType}s found matching your search.
        </div>
      )}

      {!query.trim() && !classId && (
        <div className="p-3 text-center border border-dashed border-[#E4E1D8] rounded-[8px] text-xs text-[#8C97AB]">
          Type a name, username, roll number, or phone number to search {borrowerType}.
        </div>
      )}
    </div>
  );
}
