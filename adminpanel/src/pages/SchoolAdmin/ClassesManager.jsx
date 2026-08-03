import React, { useState, useEffect } from 'react';
import { classesAPI, sectionsAPI, bellSchedulesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Layers, Clock } from 'lucide-react';

export function ClassesManager() {
  const [classes, setClasses] = useState([]);
  const [bellSchedules, setBellSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showEditClass, setShowEditClass] = useState(null);
  const [showAddSection, setShowAddSection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newBellScheduleId, setNewBellScheduleId] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editBellScheduleId, setEditBellScheduleId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadClasses();
    loadBellSchedules();
  }, []);

  const loadBellSchedules = async () => {
    try {
      const res = await bellSchedulesAPI.list();
      setBellSchedules(res.items || []);
    } catch { /* ignore */ }
  };

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSectionTarget) return;
    try {
      await sectionsAPI.delete(deleteSectionTarget.id);
      toast.success(`Section "${deleteSectionTarget.name}" deleted`);
      setDeleteSectionTarget(null);
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete section');
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classesAPI.create({
        class_name: newClassName,
        bell_schedule_template_id: newBellScheduleId ? Number(newBellScheduleId) : null,
      });
      toast.success('Class created');
      setShowAddClass(false);
      setNewClassName('');
      setNewBellScheduleId('');
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classesAPI.update(showEditClass.id, {
        class_name: editClassName,
        bell_schedule_template_id: editBellScheduleId ? Number(editBellScheduleId) : null,
      });
      toast.success('Class updated');
      setShowEditClass(null);
      loadClasses();
    } catch {
      toast.error('Failed to update class');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      await classesAPI.delete(deleteTarget.id);
      toast.success('Class deleted');
      setDeleteTarget(null);
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    const normalizedNewName = newSectionName.trim().toUpperCase();

    const existsLocally = showAddSection?.sections?.some(
      (sec) => sec.name.trim().toUpperCase() === normalizedNewName
    );

    if (existsLocally) {
      toast.error('Section already exists for this class');
      return;
    }

    setSaving(true);
    try {
      await sectionsAPI.create(showAddSection.id, normalizedNewName, Number(studentCount) || 0);
      toast.success('Section created');
      setShowAddSection(null);
      setNewSectionName('');
      setStudentCount('');
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionStatus = async (sectionId, currentActive) => {
    try {
      await sectionsAPI.updateStatus(sectionId, !currentActive);
      toast.success(`Section ${!currentActive ? 'activated' : 'deactivated'}`);
      loadClasses();
    } catch {
      toast.error('Failed to update section status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Classes & Sections Catalog</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Total Grades: {classes.length}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => { setShowAddClass(true); setNewClassName(''); }}
          >
            Add Class
          </Button>
        </div>
      </Card>

      {/* Main Grid */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-[#8C97AB]">
          Loading classes...
        </Card>
      ) : classes.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={Layers}
            title="No classes created yet"
            description="Add your institution's first class to start assigning sections."
            actionLabel="Add Class"
            onAction={() => { setShowAddClass(true); setNewClassName(''); }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="flex flex-col justify-between">
              <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[6px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-sm shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-[#14213D]">{cls.class_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-[#8C97AB]">
                        {cls.sections?.length || 0} Section{cls.sections?.length !== 1 ? 's' : ''}
                      </span>
                      {cls.bellScheduleTemplate && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#2F6F5E] bg-[#EAF3F0] px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" />
                          {cls.bellScheduleTemplate.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowEditClass(cls);
                      setEditClassName(cls.class_name);
                      setEditBellScheduleId(cls.bell_schedule_template_id || cls.bellScheduleTemplate?.id || '');
                    }}
                    title="Edit Class"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#B0403A] hover:bg-[#FDF2F1]"
                    onClick={() => setDeleteTarget(cls)}
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-2 flex-1">
                {cls.sections && cls.sections.length > 0 ? (
                  cls.sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF8] border border-[#EDEAE1] text-xs"
                    >
                      <div className="flex items-center gap-2 font-medium text-[#14213D]">
                        <span className="w-5 h-5 rounded-[4px] bg-[#EAF3F0] text-[#2F6F5E] font-bold text-[10px] flex items-center justify-center font-mono">
                          {sec.name}
                        </span>
                        <span>Section {sec.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSectionStatus(sec.id, sec.is_active)}
                          className="cursor-pointer"
                        >
                          <StatusBadge status={sec.is_active ? 'active' : 'inactive'} size="sm" />
                        </button>
                        <button
                          onClick={() => setDeleteSectionTarget(sec)}
                          className="text-[#8C97AB] hover:text-[#B0403A] p-1 cursor-pointer transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8C97AB] text-center py-4">No sections added yet</p>
                )}
              </CardContent>

              <div className="p-3 bg-[#FAFAF8] border-t border-[#E4E1D8]">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  icon={Plus}
                  onClick={() => { setShowAddSection(cls); setNewSectionName(''); setStudentCount(''); }}
                >
                  Add Section
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Class */}
      <Modal isOpen={showAddClass} onClose={() => setShowAddClass(false)} title="Create New Class">
        <form onSubmit={handleAddClass} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Class Name *</label>
            <Input
              required
              placeholder="e.g. Grade 10 or Class 10"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowAddClass(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Class */}
      <Modal isOpen={!!showEditClass} onClose={() => setShowEditClass(null)} title="Edit Class">
        <form onSubmit={handleEditClass} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Class Name *</label>
            <Input
              required
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowEditClass(null)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Section */}
      <Modal
        isOpen={!!showAddSection}
        onClose={() => setShowAddSection(null)}
        title={`Add Section to ${showAddSection?.class_name}`}
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Section Identifier *</label>
            <Input
              required
              placeholder="e.g. A, B, C"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#14213D] mb-1">Student Capacity (Optional)</label>
            <Input
              type="number"
              placeholder="e.g. 40"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowAddSection(null)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Add Section</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteClass}
        title="Delete Class Record?"
        message={`Are you sure you want to delete "${deleteTarget?.class_name}"? All associated section data will also be deleted.`}
        danger={true}
        confirmText="Delete Class"
      />

      <ConfirmDialog
        isOpen={!!deleteSectionTarget}
        onClose={() => setDeleteSectionTarget(null)}
        onConfirm={handleDeleteSection}
        title="Delete Section Record?"
        message={`Are you sure you want to delete Section "${deleteSectionTarget?.name}"?`}
        danger={true}
        confirmText="Delete Section"
      />
    </div>
  );
}
