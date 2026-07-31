import React, { useState, useEffect } from 'react';
import { bellSchedulesAPI, classesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Clock, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Coffee, BookOpen, Layers, CheckSquare, Square } from 'lucide-react';

const DEFAULT_PERIODS = [
  { order_index: 1, start_time: '08:00', end_time: '08:45', is_break: false, title: '' },
  { order_index: 2, start_time: '08:45', end_time: '09:30', is_break: false, title: '' },
  { order_index: 3, start_time: '09:30', end_time: '09:45', is_break: true, title: 'Tea Break' },
  { order_index: 4, start_time: '09:45', end_time: '10:30', is_break: false, title: '' },
  { order_index: 5, start_time: '10:30', end_time: '11:15', is_break: false, title: '' },
  { order_index: 6, start_time: '11:15', end_time: '12:00', is_break: true, title: 'Lunch Break' },
  { order_index: 7, start_time: '12:00', end_time: '12:45', is_break: false, title: '' },
  { order_index: 8, start_time: '12:45', end_time: '13:30', is_break: false, title: '' },
];

export function BellSchedulesManager() {
  const [templates, setTemplates] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null); // null = create mode
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formName, setFormName] = useState('');
  const [formWorkingDays, setFormWorkingDays] = useState(6);
  const [formPeriods, setFormPeriods] = useState(DEFAULT_PERIODS);
  const [formSelectedClassIds, setFormSelectedClassIds] = useState([]);

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tplRes, clsRes] = await Promise.all([
        bellSchedulesAPI.list(),
        classesAPI.list(),
      ]);
      setTemplates(tplRes.items || tplRes.data || tplRes || []);
      const classList = clsRes.items || clsRes.data || clsRes || [];
      setAllClasses(classList);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load bell schedule templates and classes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormWorkingDays(6);
    setFormPeriods(DEFAULT_PERIODS);
    setFormSelectedClassIds([]);
    setShowModal(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setFormName(template.name || '');
    setFormWorkingDays(template.working_days_per_week || 6);
    setFormPeriods(
      (template.periods || []).map((p, idx) => ({
        order_index: p.order_index ?? idx + 1,
        start_time: p.start_time || '08:00',
        end_time: p.end_time || '08:45',
        is_break: !!p.is_break,
        title: p.title || '',
      }))
    );
    const linkedClassIds = (template.classes || []).map((c) => Number(c.id));
    setFormSelectedClassIds(linkedClassIds);
    setShowModal(true);
  };

  const handleToggleClass = (classId) => {
    const cid = Number(classId);
    setFormSelectedClassIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  const handleSelectAllClasses = () => {
    if (formSelectedClassIds.length === allClasses.length) {
      setFormSelectedClassIds([]);
    } else {
      setFormSelectedClassIds(allClasses.map((c) => Number(c.id)));
    }
  };

  const handleAddPeriod = () => {
    const lastPeriod = formPeriods[formPeriods.length - 1];
    let nextStart = '09:00';
    let nextEnd = '09:45';

    if (lastPeriod && lastPeriod.end_time) {
      nextStart = lastPeriod.end_time;
      const [h, m] = lastPeriod.end_time.split(':').map(Number);
      const totalMin = h * 60 + m + 45;
      const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');
      nextEnd = `${endH}:${endM}`;
    }

    setFormPeriods([
      ...formPeriods,
      {
        order_index: formPeriods.length + 1,
        start_time: nextStart,
        end_time: nextEnd,
        is_break: false,
        title: '',
      },
    ]);
  };

  const handleRemovePeriod = (index) => {
    setFormPeriods(formPeriods.filter((_, idx) => idx !== index));
  };

  const handleMovePeriod = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === formPeriods.length - 1)
    ) {
      return;
    }
    const updated = [...formPeriods];
    const targetIdx = index + direction;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFormPeriods(updated);
  };

  const handlePeriodChange = (index, field, value) => {
    const updated = [...formPeriods];
    updated[index][field] = value;
    if (field === 'is_break' && !value) {
      updated[index].title = '';
    }
    setFormPeriods(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (formPeriods.length === 0) {
      toast.error('At least one period slot is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        working_days_per_week: Number(formWorkingDays),
        class_ids: formSelectedClassIds,
        periods: formPeriods.map((p, idx) => ({
          order_index: idx + 1,
          start_time: p.start_time,
          end_time: p.end_time,
          is_break: !!p.is_break,
          title: p.is_break ? (p.title || 'Break') : null,
        })),
      };

      if (editingTemplate) {
        await bellSchedulesAPI.update(editingTemplate.id, payload);
        toast.success('Bell schedule template updated successfully!');
      } else {
        await bellSchedulesAPI.create(payload);
        toast.success('Bell schedule template created successfully!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bell schedule template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await bellSchedulesAPI.delete(deleteTarget.id);
      toast.success(`Template "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-base text-[#14213D] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2F6F5E]" />
            Bell Schedule Templates
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Create daily timing templates and link them to your classes & grade levels.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleOpenCreate}
        >
          Create Template
        </Button>
      </div>

      {/* Grid of Templates */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8C97AB] flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#2F6F5E] border-t-transparent rounded-full animate-spin" />
          Loading bell schedule templates...
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No Bell Schedule Templates"
          description="Create your first timing template to define daily period slots and break times for your classes."
          actionLabel="Create Template"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const periodList = tpl.periods || [];
            const academicCount = periodList.filter((p) => !p.is_break).length;
            const breakCount = periodList.filter((p) => p.is_break).length;
            const assignedClasses = tpl.classes || [];

            return (
              <Card key={tpl.id} className="border-[#E4E1D8] shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-[#E4E1D8] flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#14213D]">{tpl.name}</CardTitle>
                    {/* Linked Classes Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-semibold text-[#52607D] uppercase">Assigned:</span>
                      {assignedClasses.length > 0 ? (
                        assignedClasses.map((cls) => (
                          <span
                            key={cls.id}
                            className="px-2 py-0.5 rounded-md bg-[#EAF3F0] text-[#2F6F5E] text-[10px] font-bold border border-[#D3E6E0]"
                          >
                            {cls.class_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No classes assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(tpl)}
                      className="text-gray-600 hover:text-[#2F6F5E] p-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(tpl)}
                      className="text-gray-600 hover:text-red-600 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2">
                  <div className="space-y-1.5">
                    {periodList.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md border text-xs ${
                          p.is_break
                            ? 'bg-[#FAFAF8] border-amber-200 text-amber-900 font-medium'
                            : 'bg-white border-[#E4E1D8] text-[#14213D]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-600">
                            {p.order_index ?? idx + 1}
                          </span>
                          {p.is_break ? (
                            <span className="flex items-center gap-1.5 text-amber-700">
                              <Coffee className="w-3.5 h-3.5" />
                              {p.title || 'Break'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#2F6F5E]" />
                              Period {p.order_index ?? idx + 1}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-gray-500 text-[11px]">
                          {p.start_time} - {p.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Bell Schedule Template'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Template Name</label>
              <Input
                placeholder="e.g. Primary (Grades 1-5)"
                value={formName}
                onChange={(e) => {
                  const val = e.target.value;
                  const capitalized = val.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                  setFormName(capitalized);
                }}
                autoCapitalize="words"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Working Days Per Week</label>
              <Select
                value={formWorkingDays}
                onChange={(e) => setFormWorkingDays(Number(e.target.value))}
                options={[
                  { value: 5, label: '5 Days (Mon - Fri)' },
                  { value: 6, label: '6 Days (Mon - Sat)' },
                  { value: 7, label: '7 Days (Mon - Sun)' },
                ]}
              />
            </div>
          </div>

          {/* Applicable Classes Selection */}
          <div className="border border-[#E4E1D8] bg-[#FAFAF8] p-3 rounded-[8px] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#14213D] text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2F6F5E]" />
                Assign to Classes / Grade Levels
              </label>
              {allClasses.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="text-[11px] font-semibold text-[#2F6F5E] hover:underline cursor-pointer"
                >
                  {formSelectedClassIds.length === allClasses.length ? 'Deselect All' : 'Select All Classes'}
                </button>
              )}
            </div>
            {allClasses.length === 0 ? (
              <p className="text-gray-400 text-[11px] italic">No classes found in school registry.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {allClasses.map((cls) => {
                  const isChecked = formSelectedClassIds.includes(Number(cls.id));
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => handleToggleClass(cls.id)}
                      className={`flex items-center gap-2 p-2 rounded-[6px] border text-left cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-[#EAF3F0] border-[#2F6F5E] text-[#2F6F5E] font-bold'
                          : 'bg-white border-[#E4E1D8] text-[#52607D] hover:bg-gray-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#2F6F5E] shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      )}
                      <span className="truncate text-xs">{cls.class_name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-[#E4E1D8] pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#14213D] text-xs">Period Slots & Break Timings</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddPeriod}
              >
                Add Slot
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {formPeriods.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-md border flex flex-wrap items-center justify-between gap-2 ${
                    p.is_break
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-white border-[#E4E1D8]'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMovePeriod(idx, -1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePeriod(idx, 1)}
                        disabled={idx === formPeriods.length - 1}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-6 h-6 rounded-full bg-[#14213D] text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Input
                        type="time"
                        value={p.start_time}
                        onChange={(e) => handlePeriodChange(idx, 'start_time', e.target.value)}
                        className="w-24 text-xs py-1"
                        required
                      />
                      <span className="text-gray-400">-</span>
                      <Input
                        type="time"
                        value={p.end_time}
                        onChange={(e) => handlePeriodChange(idx, 'end_time', e.target.value)}
                        className="w-24 text-xs py-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.is_break}
                        onChange={(e) => handlePeriodChange(idx, 'is_break', e.target.checked)}
                        className="rounded border-gray-300 text-[#2F6F5E] focus:ring-[#2F6F5E]"
                      />
                      Is Break
                    </label>

                    {p.is_break && (
                      <Input
                        placeholder="e.g. Lunch Break"
                        value={p.title || ''}
                        onChange={(e) => handlePeriodChange(idx, 'title', e.target.value)}
                        className="w-32 text-xs py-1"
                      />
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePeriod(idx)}
                      disabled={formPeriods.length <= 1}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E1D8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Bell Schedule Template"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Classes using this template will need a new schedule assigned.`}
        confirmLabel="Delete Template"
        variant="danger"
      />
    </div>
  );
}

export default BellSchedulesManager;
