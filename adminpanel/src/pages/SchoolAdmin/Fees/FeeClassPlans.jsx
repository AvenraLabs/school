import { useState, useEffect } from 'react';
import { feeAPI, classesAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';
import { EmptyState } from '../../../components/common/EmptyState';
import { Plus, Trash2, CalendarDays, IndianRupee, BookOpen, X, AlertCircle } from 'lucide-react';

export function FeeClassPlans() {
  const [classes, setClasses] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, defRes] = await Promise.all([
        classesAPI.list(),
        feeAPI.getDefinitions(),
      ]);
      const rawClasses = clsRes?.items || clsRes?.rows || clsRes?.data || clsRes;
      setClasses(Array.isArray(rawClasses) ? rawClasses : []);
      setDefinitions(Array.isArray(defRes) ? defRes : []);
    } catch {
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = () => {
    setTitle(''); setClassId(''); setDueDate(''); setAmount('');
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!title.trim()) return toast.error('Enter a fee name');
    if (!classId) return toast.error('Select a class');
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');

    setSubmitting(true);
    try {
      const res = await feeAPI.createDefinition({
        title: title.trim(),
        class_id: Number(classId),
        due_date: dueDate || null,
        total_amount: amt,
        breakdown: [],
        fee_type: 'class',
        student_ids: [],
      });
      toast.success(`"${title.trim()}" assigned to ${res.assigned_students_count ?? 'all'} students`);
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?\n\nThis is only allowed if no payments have been collected.`)) return;
    try {
      await feeAPI.deleteDefinition(id);
      toast.success(`"${name}" deleted`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — payments may exist');
    }
  };

  const grouped = definitions.reduce((acc, d) => {
    const key = d.class?.class_name ? `Class ${d.class.class_name}` : 'General / Individual Fees';
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#14213D]">Class Fee Structure Catalog</h3>
          <p className="text-xs text-[#52607D]">Assign term fees across class levels.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openModal}>
          Assign Fee to Class
        </Button>
      </Card>

      {/* Fee Definitions List */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-[#8C97AB]">Loading fee structure...</Card>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={BookOpen}
            title="No class fee structures configured"
            description="Assign your first fee structure to a class to generate student balances."
            actionLabel="Assign Class Fee"
            onAction={openModal}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupTitle, fees]) => (
            <Card key={groupTitle}>
              <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold text-[#14213D]">{groupTitle}</CardTitle>
              </CardHeader>
              <div className="divide-y divide-[#EDEAE1] text-xs">
                {fees.map((fee) => (
                  <div key={fee.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FAFAF8]">
                    <div>
                      <p className="font-bold text-[#14213D]">{fee.title}</p>
                      <p className="text-[10px] text-[#8C97AB]">Due Date: {fee.due_date ? formatDate(fee.due_date) : 'No due date'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#14213D]">₹{Number(fee.total_amount).toLocaleString('en-IN')}</span>
                      <Button variant="ghost" size="sm" className="text-[#B0403A] hover:bg-[#FDF2F1]" onClick={() => handleDelete(fee.id, fee.title)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Assign Fee */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign Fee Structure to Class">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Fee Title *</label>
            <Input required placeholder="e.g. Term 1 Tuition Fee" value={title} onChange={(e) => {
              const v = e.target.value;
              setTitle(v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1) : v);
            }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Target Class *</label>
              <Select required value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Total Fee Amount (₹) *</label>
            <Input type="number" required min="1" placeholder="Amount..." className="font-mono font-bold" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Assign Fee Structure</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
