import { useState, useEffect, useCallback } from 'react';
import { subjectsAPI, classesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { BookOpen, Plus, Edit2, Trash2, Grid3X3, Save, CheckSquare, Layers, Check, X } from 'lucide-react';

const TABS = ['Subject Catalog', 'Class & Section Mapping'];

export function SubjectsManager() {
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Class & Section Mapping state
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState(''); // '' = All Sections (class default)
  const [classSubjects, setClassSubjects] = useState([]); // subject IDs checked for class default
  const [overrides, setOverrides] = useState({}); // { subject_id: true|false|null } for specific section
  const [mappingLoading, setMappingLoading] = useState(false);
  const [savingMapping, setSavingMapping] = useState(false);

  useEffect(() => { loadSubjects(); }, []);
  useEffect(() => { if (activeTab === 1) loadClasses(); }, [activeTab]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectsAPI.list();
      setSubjects(res.items || []);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch {
      toast.error('Failed to load classes');
    }
  };

  // Load class default subjects
  const loadClassSubjects = useCallback(async (classId) => {
    if (!classId) { setClassSubjects([]); return; }
    setMappingLoading(true);
    try {
      const res = await subjectsAPI.getClassSubjects(classId);
      setClassSubjects((res.items || []).map((s) => s.id));
    } catch {
      toast.error('Failed to load class subjects');
    } finally {
      setMappingLoading(false);
    }
  }, []);

  // Load section overrides
  const loadSectionOverrides = useCallback(async (classId, sectionId) => {
    if (!classId || !sectionId) { setOverrides({}); return; }
    setMappingLoading(true);
    try {
      const res = await subjectsAPI.getSectionOverrides(classId, sectionId);
      const map = {};
      for (const row of (res.items || [])) {
        map[row.subject_id] = row.is_included;
      }
      setOverrides(map);
    } catch {
      toast.error('Failed to load section overrides');
    } finally {
      setMappingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassSubjects(selectedClassId);
      if (selectedSectionId) {
        loadSectionOverrides(selectedClassId, selectedSectionId);
      } else {
        setOverrides({});
      }
    }
  }, [selectedClassId, selectedSectionId, loadClassSubjects, loadSectionOverrides]);

  const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId));
  const availableSections = selectedClass?.sections || [];
  const selectedSection = availableSections.find((s) => String(s.id) === String(selectedSectionId));

  // Toggle class default subject
  const toggleClassSubject = (subjectId) => {
    setClassSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  // Toggle section subject override
  const toggleSectionSubject = (subjectId) => {
    const isDefaultInClass = classSubjects.includes(subjectId);
    const currentOverride = overrides[String(subjectId)] ?? overrides[subjectId] ?? null;

    // Currently effective state
    const currentEffective = currentOverride !== null ? currentOverride : isDefaultInClass;
    const newEffective = !currentEffective;

    // Set override if different from class default, or null if matches class default
    const newOverrideValue = newEffective === isDefaultInClass ? null : newEffective;

    setOverrides((prev) => ({
      ...prev,
      [subjectId]: newOverrideValue,
    }));
  };

  const handleSaveMapping = async () => {
    if (!selectedClassId) return;
    setSavingMapping(true);
    try {
      if (!selectedSectionId) {
        // Save class default subjects
        await subjectsAPI.setClassSubjects(Number(selectedClassId), classSubjects);
        toast.success(`Default subjects saved for Class ${selectedClass?.class_name}!`);
      } else {
        // Save section overrides
        const overrideRows = Object.entries(overrides)
          .filter(([, val]) => val !== null && val !== undefined)
          .map(([subject_id, is_included]) => ({ subject_id: Number(subject_id), is_included }));
        await subjectsAPI.setSectionOverrides(Number(selectedClassId), Number(selectedSectionId), overrideRows);
        toast.success(`Section subjects saved for Class ${selectedClass?.class_name} - Section ${selectedSection?.name}!`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save subject mapping');
    } finally {
      setSavingMapping(false);
    }
  };

  /* ===================== Subject Catalog CRUD ===================== */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await subjectsAPI.create(name.trim());
      toast.success('Subject created');
      setShowAdd(false);
      setName('');
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await subjectsAPI.update(showEdit.id, name.trim());
      toast.success('Subject updated');
      setShowEdit(null);
      setName('');
      loadSubjects();
    } catch (e) {
      toast.error('Failed to update subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await subjectsAPI.delete(deleteTarget.id);
      toast.success('Subject deleted');
      setDeleteTarget(null);
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`font-semibold px-3 py-1.5 rounded-[6px] transition-colors ${
                  activeTab === i
                    ? 'bg-[#2F6F5E] text-white'
                    : 'text-[#52607D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => { setShowAdd(true); setName(''); }}>
              Add Subject
            </Button>
          )}
        </div>
      </Card>

      {/* ===================== TAB 0: Subject Catalog ===================== */}
      {activeTab === 0 && (
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
              Curriculum Master List ({subjects.length})
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5 w-20">ID</th>
                  <th className="px-4 py-2.5">Subject Name</th>
                  <th className="px-4 py-2.5 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-[#8C97AB]">Loading subject catalog...</td></tr>
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <EmptyState icon={BookOpen} title="No subjects created yet" description="Create your first subject to start building curriculum schedules." />
                    </td>
                  </tr>
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[#8C97AB]">#{s.id}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#14213D]">{s.name}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setShowEdit(s); setName(s.name); }} title="Edit Subject">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(s)} title="Delete Subject" className="text-[#B0403A] hover:bg-[#FDF2F1]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ===================== TAB 1: Class & Section Mapping ===================== */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
              <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
                Assign Subjects to Class or Section Streams
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Selectors Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <div>
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1">
                    Class *
                  </label>
                  <Select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedSectionId('');
                    }}
                  >
                    <option value="">Select Class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.class_name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1">
                    Section Scope
                  </label>
                  <Select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    disabled={!selectedClassId}
                  >
                    <option value="">All Sections (Grade Default)</option>
                    {availableSections.map((s) => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              {selectedClassId ? (
                <div className="space-y-3 pt-2 border-t border-[#EDEAE1]">
                  {/* Context Banner */}
                  <div className={`p-3 rounded-[8px] border flex items-center justify-between ${
                    selectedSectionId ? 'bg-[#EAF3F0] border-[#D3E6E0]' : 'bg-[#FAFAF8] border-[#E4E1D8]'
                  }`}>
                    <div>
                      <span className="font-bold text-[#14213D]">
                        {selectedSectionId
                          ? `Customizing Stream Subjects for Class ${selectedClass?.class_name} - Section ${selectedSection?.name}`
                          : `Grade Default Subjects for Class ${selectedClass?.class_name}`}
                      </span>
                      <p className="text-[#52607D] text-[11px] mt-0.5">
                        {selectedSectionId
                          ? `Check the subjects taught in Section ${selectedSection?.name}. Toggle subjects to include (✓) or exclude (✗) for this stream.`
                          : `Subjects checked here apply to all sections in Class ${selectedClass?.class_name} by default.`}
                      </p>
                    </div>
                    {selectedSectionId && (
                      <span className="text-[10px] font-bold text-[#2F6F5E] bg-white px-2.5 py-1 rounded-full border border-[#D3E6E0]">
                        Stream Customization
                      </span>
                    )}
                  </div>

                  {mappingLoading ? (
                    <div className="text-[#8C97AB] text-center py-6">Loading subjects...</div>
                  ) : subjects.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No subjects in catalog" description="Create subjects in the Subject Catalog tab first." />
                  ) : (
                    <>
                      {/* Checkbox Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1">
                        {subjects.map((s) => {
                          const isDefaultInClass = classSubjects.includes(s.id);

                          if (!selectedSectionId) {
                            // Class Default mode — standard checkbox
                            const isChecked = classSubjects.includes(s.id);
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center gap-2.5 p-3 rounded-[8px] border cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-[#EAF3F0] border-[#D3E6E0] text-[#2F6F5E] font-semibold'
                                    : 'bg-white border-[#E4E1D8] text-[#52607D]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleClassSubject(s.id)}
                                  className="rounded accent-[#2F6F5E]"
                                />
                                <span className="truncate">{s.name}</span>
                              </label>
                            );
                          } else {
                            // Section Stream mode — toggle switch with status badge
                            const override = overrides[String(s.id)] ?? overrides[s.id] ?? null;
                            const effective = override !== null ? override : isDefaultInClass;

                            return (
                              <div
                                key={s.id}
                                onClick={() => toggleSectionSubject(s.id)}
                                className={`flex items-center justify-between p-3 rounded-[8px] border cursor-pointer transition-colors ${
                                  effective
                                    ? 'bg-[#EAF3F0] border-[#D3E6E0] text-[#2F6F5E]'
                                    : 'bg-[#FDF2F1] border-[#F8D7D5] text-[#B0403A]'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                                    effective ? 'bg-[#2F6F5E]' : 'bg-[#B0403A]'
                                  }`}>
                                    {effective ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  </div>
                                  <span className="font-semibold truncate">{s.name}</span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-current opacity-80">
                                  {override !== null
                                    ? (override ? 'Stream Added ✓' : 'Excluded ✗')
                                    : (isDefaultInClass ? 'Grade Default' : 'Excluded')}
                                </span>
                              </div>
                            );
                          }
                        })}
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-3 border-t border-[#EDEAE1]">
                        <Button
                          variant="primary"
                          icon={Save}
                          loading={savingMapping}
                          onClick={handleSaveMapping}
                        >
                          {selectedSectionId
                            ? `Save Section ${selectedSection?.name} Subjects`
                            : `Save Class ${selectedClass?.class_name} Default Subjects`}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Grid3X3}
                  title="Select a Class"
                  description="Pick a class above to map subjects to that grade level or specific section stream."
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create Subject">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Subject Name *</label>
            <Input required autoFocus placeholder="e.g. Physical Education, Computer Science..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Create Subject'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Subject">
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Subject Name *</label>
            <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowEdit(null)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Update Subject'}</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
