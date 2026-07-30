import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherAssignmentsAPI, teachersAPI, classesAPI, subjectsAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  UserCog,
  ChevronDown,
  ChevronRight,
  UserPlus,
  X,
  CheckCircle2,
  BookOpen,
  Trash2,
  Users,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  Sparkles
} from 'lucide-react';

export function TeacherAssignments() {
  const [activeTab, setActiveTab] = useState('class-teachers');
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState({});
  const [subjectAssignments, setSubjectAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [activePicker, setActivePicker] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [gapFilter, setGapFilter] = useState('ALL'); // ALL | UNASSIGNED_COORDINATOR | MISSING_SUBJECTS

  const toast = useToast();

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const [clsRes, tRes, assignRes, subRes] = await Promise.all([
        classesAPI.list(),
        teachersAPI.getOptions(),
        teacherAssignmentsAPI.list(500, 0),
        subjectsAPI.list(),
      ]);

      const classList = clsRes.items || clsRes.data || clsRes || [];
      let teacherList = Array.isArray(tRes) ? tRes : (tRes.data || tRes.items || tRes.rows || []);
      if (teacherList.length === 0) {
        const fullT = await teachersAPI.list(500, 0);
        teacherList = Array.isArray(fullT) ? fullT : (fullT.items || fullT.rows || fullT.data || []);
      }
      const allAssignments = assignRes.items || assignRes.data || assignRes || [];
      const subjectList = subRes.items || subRes.data || subRes || [];

      setClasses(classList);
      setTeachers(teacherList);
      setSubjects(subjectList);

      const classMap = {};
      const subjectMap = {};

      for (const cls of classList) {
        for (const sec of cls.sections || []) {
          classMap[sec.id] = null;
          subjectMap[sec.id] = {};
        }
      }

      for (const a of allAssignments) {
        if (a.section_id) {
          if (a.is_class_teacher) {
            classMap[a.section_id] = a;
          }
          if (a.subject_id) {
            if (!subjectMap[a.section_id]) {
              subjectMap[a.section_id] = {};
            }
            subjectMap[a.section_id][a.subject_id] = a;
          }
        }
      }

      setSectionAssignments(classMap);
      setSubjectAssignments(subjectMap);

      const exp = {};
      for (const cls of classList) exp[cls.id] = true;
      setExpanded(exp);
    } catch {
      toast.error('Failed to load mapping registry');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const expandAll = () => {
    const exp = {};
    for (const cls of classes) exp[cls.id] = true;
    setExpanded(exp);
  };
  const collapseAll = () => setExpanded({});

  const openPicker = (sectionId, classId, subjectId = null) => {
    setPickerSearch('');
    setActivePicker({ sectionId, classId, subjectId });
  };

  const closePicker = () => setActivePicker(null);

  const teacherDisplayName = (t) =>
    t?.user?.name || t?.User?.name || t?.user?.username || t?.User?.username || t?.employee_id || `Teacher #${t?.id}`;

  const handleAssign = useCallback(async (teacher) => {
    if (!activePicker || saving) return;
    const { sectionId, classId, subjectId } = activePicker;

    setSaving(true);
    closePicker();
    try {
      if (subjectId) {
        const existing = subjectAssignments[sectionId]?.[subjectId];
        if (existing) {
          await teacherAssignmentsAPI.delete(existing.id);
        }
        const created = await teacherAssignmentsAPI.create(
          teacher.id,
          Number(classId),
          Number(sectionId),
          Number(subjectId),
          false
        );

        const assignmentData = created.data || created;
        setSubjectAssignments((p) => {
          const updatedSec = { ...p[sectionId] };
          updatedSec[subjectId] = { ...assignmentData, teacher, subject: subjects.find((s) => s.id === subjectId) };
          return { ...p, [sectionId]: updatedSec };
        });
        toast.success(`${teacherDisplayName(teacher)} assigned for subject`);
      } else {
        const existing = sectionAssignments[sectionId];
        if (existing) {
          await teacherAssignmentsAPI.delete(existing.id);
        }
        const created = await teacherAssignmentsAPI.create(
          teacher.id,
          Number(classId),
          Number(sectionId),
          undefined,
          true
        );
        const assignmentData = created.data || created;
        setSectionAssignments((p) => ({ ...p, [sectionId]: { ...assignmentData, teacher, is_class_teacher: true } }));
        toast.success(`${teacherDisplayName(teacher)} assigned as class coordinator`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign teacher');
      init();
    } finally {
      setSaving(false);
    }
  }, [activePicker, sectionAssignments, subjectAssignments, subjects, saving]);

  const handleRemoveSubject = async (sectionId, subjectId) => {
    const existing = subjectAssignments[sectionId]?.[subjectId];
    if (!existing || saving) return;

    setSaving(true);
    try {
      await teacherAssignmentsAPI.delete(existing.id);
      setSubjectAssignments((p) => {
        const updatedSec = { ...p[sectionId] };
        delete updatedSec[subjectId];
        return { ...p, [sectionId]: updatedSec };
      });
      toast.success('Subject mapping removed');
    } catch {
      toast.error('Failed to remove assignment');
    } finally {
      setSaving(false);
    }
  };

  // Calculate Metrics
  const stats = useMemo(() => {
    let totalSections = 0;
    let assignedCoordinators = 0;
    let totalSubjectSlots = 0;
    let filledSubjectSlots = 0;

    classes.forEach((cls) => {
      (cls.sections || []).forEach((sec) => {
        totalSections++;
        if (sectionAssignments[sec.id]?.teacher) assignedCoordinators++;
        subjects.forEach((sub) => {
          totalSubjectSlots++;
          if (subjectAssignments[sec.id]?.[sub.id]?.teacher) filledSubjectSlots++;
        });
      });
    });

    const coordinatorCoverage = totalSections ? Math.round((assignedCoordinators / totalSections) * 100) : 0;
    const subjectCoverage = totalSubjectSlots ? Math.round((filledSubjectSlots / totalSubjectSlots) * 100) : 0;
    const missingCoordinators = totalSections - assignedCoordinators;
    const missingSubjects = totalSubjectSlots - filledSubjectSlots;

    return {
      totalSections,
      assignedCoordinators,
      coordinatorCoverage,
      totalSubjectSlots,
      filledSubjectSlots,
      subjectCoverage,
      missingCoordinators,
      missingSubjects,
    };
  }, [classes, sectionAssignments, subjectAssignments, subjects]);

  // Filtered Classes & Sections
  const filteredClasses = useMemo(() => {
    return classes.map((cls) => {
      if (selectedClassFilter !== 'ALL' && String(cls.id) !== String(selectedClassFilter)) {
        return null;
      }

      const matchingSections = (cls.sections || []).filter((sec) => {
        // Search term filter
        const matchSearch =
          !searchTerm ||
          cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sec.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchSearch) return false;

        // Gap filter
        if (gapFilter === 'UNASSIGNED_COORDINATOR') {
          return !sectionAssignments[sec.id]?.teacher;
        }
        if (gapFilter === 'MISSING_SUBJECTS') {
          const filledCount = subjects.filter((s) => subjectAssignments[sec.id]?.[s.id]?.teacher).length;
          return filledCount < subjects.length;
        }
        return true;
      });

      if (matchingSections.length === 0) return null;
      return { ...cls, sections: matchingSections };
    }).filter(Boolean);
  }, [classes, selectedClassFilter, searchTerm, gapFilter, sectionAssignments, subjectAssignments, subjects]);

  const filteredTeachers = teachers.filter((t) =>
    teacherDisplayName(t).toLowerCase().includes(pickerSearch.toLowerCase()) ||
    (t.employee_id && String(t.employee_id).toLowerCase().includes(pickerSearch.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Compact Page Action Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display font-bold text-base text-[#14213D] flex items-center gap-2">
          <UserCog className="w-4 h-4 text-[#2F6F5E]" />
          Teacher & Subject Allocations
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
        </div>
      </div>

      {/* Main Container Card */}
      <Card className="overflow-hidden">
        {/* Navigation & Filter Header */}
        <div className="p-4 border-b border-[#EDEAE1] bg-[#FAFAF8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex bg-white border border-[#E4E1D8] p-1 rounded-[8px] shadow-2xs">
              <button
                onClick={() => { setActiveTab('class-teachers'); closePicker(); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                  activeTab === 'class-teachers'
                    ? 'bg-[#2F6F5E] text-white shadow-xs'
                    : 'text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Class Teachers</span>
              </button>
              <button
                onClick={() => { setActiveTab('subject-teachers'); closePicker(); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                  activeTab === 'subject-teachers'
                    ? 'bg-[#2F6F5E] text-white shadow-xs'
                    : 'text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Subject Teachers</span>
              </button>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setGapFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                  gapFilter === 'ALL'
                    ? 'bg-[#14213D] text-white font-semibold'
                    : 'bg-white border border-[#E4E1D8] text-[#52607D] hover:bg-[#FAFAF8]'
                }`}
              >
                All Sections
              </button>
              <button
                onClick={() => setGapFilter('UNASSIGNED_COORDINATOR')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                  gapFilter === 'UNASSIGNED_COORDINATOR'
                    ? 'bg-[#B0403A] text-white font-semibold'
                    : 'bg-white border border-[#E4E1D8] text-[#52607D] hover:bg-[#FAFAF8]'
                }`}
              >
                Missing Class Teacher ({stats.missingCoordinators})
              </button>
              <button
                onClick={() => setGapFilter('MISSING_SUBJECTS')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                  gapFilter === 'MISSING_SUBJECTS'
                    ? 'bg-[#B0403A] text-white font-semibold'
                    : 'bg-white border border-[#E4E1D8] text-[#52607D] hover:bg-[#FAFAF8]'
                }`}
              >
                Missing Subject Teachers ({stats.missingSubjects})
              </button>
            </div>
          </div>

          {/* Search & Filter Dropdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C97AB]" />
              <Input
                placeholder="Search class name, section, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8 bg-white"
              />
            </div>
            <div>
              <Select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Grade Levels' },
                  ...classes.map((c) => ({ value: String(c.id), label: c.class_name })),
                ]}
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8C97AB] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#2F6F5E] border-t-transparent rounded-full animate-spin" />
            Loading faculty assignment registry...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={UserCog}
              title="No matching classes or mapping gaps"
              description="Try clearing your search or filter settings to view all section allocations."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedClassFilter('ALL');
                setGapFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="divide-y divide-[#EDEAE1]">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="transition-colors">
                {/* Class Section Header Header */}
                <div
                  onClick={() => toggleExpand(cls.id)}
                  className="px-5 py-3 bg-[#FAFAF8] hover:bg-[#F4F3EE] flex items-center justify-between cursor-pointer select-none border-b border-[#EDEAE1]"
                >
                  <div className="flex items-center gap-3">
                    {expanded[cls.id] ? (
                      <ChevronDown className="w-4 h-4 text-[#2F6F5E]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C97AB]" />
                    )}
                    <div className="w-7 h-7 rounded-[6px] bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#14213D]">
                        {cls.class_name}
                      </h3>
                      <p className="text-[11px] text-[#52607D]">
                        {cls.sections?.length || 0} active section(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-white px-2.5 py-1 rounded-full border border-[#E4E1D8] text-[#2F6F5E]">
                    {cls.sections?.length || 0} Section(s)
                  </span>
                </div>

                {/* Expanded Section Grid */}
                {expanded[cls.id] && (cls.sections || []).length > 0 && (
                  <div className="p-5 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cls.sections.map((sec) => {
                      const classAssignment = sectionAssignments[sec.id];
                      const classTeacher = classAssignment?.teacher;
                      const isClassPickerOpen = activePicker?.sectionId === sec.id && !activePicker?.subjectId;

                      const filledSubjectsCount = subjects.filter((s) => subjectAssignments[sec.id]?.[s.id]?.teacher).length;
                      const isFullyStaffed = classTeacher && filledSubjectsCount === subjects.length;

                      return (
                        <div
                          key={sec.id}
                          className="bg-[#FAFAF8] border border-[#E4E1D8] rounded-[10px] p-3.5 space-y-3 relative shadow-2xs hover:border-[#D3E6E0] transition-all"
                        >
                          {/* Card Section Header */}
                          <div className="flex items-center justify-between border-b border-[#EDEAE1] pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#14213D]">
                                {cls.class_name} — Section {sec.name}
                              </span>
                            </div>
                            {isFullyStaffed ? (
                              <span className="text-[10px] font-semibold text-[#2F6F5E] bg-[#EAF3F0] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Fully Staffed
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#B0403A] bg-[#FDF2F1] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Action Needed
                              </span>
                            )}
                          </div>

                          {/* Tab Mode Content */}
                          {activeTab === 'class-teachers' ? (
                            /* CLASS COORDINATOR TAB */
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C97AB] block">
                                CLASS COORDINATOR
                              </span>
                              {classAssignment && classTeacher ? (
                                <div className="p-2.5 bg-white border border-[#E4E1D8] rounded-[8px] flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#D3E6E0]">
                                      {teacherDisplayName(classTeacher)[0]?.toUpperCase() || 'T'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-[#14213D] truncate">
                                        {teacherDisplayName(classTeacher)}
                                      </p>
                                      <p className="text-[10px] font-mono text-[#52607D] truncate">
                                        ID: {classTeacher?.employee_id || 'Faculty'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[11px] shrink-0"
                                    onClick={() => isClassPickerOpen ? closePicker() : openPicker(sec.id, cls.id)}
                                  >
                                    Change
                                  </Button>
                                </div>
                              ) : (
                                <div className="p-3 bg-white border border-dashed border-[#B0403A]/40 rounded-[8px] text-center space-y-2">
                                  <p className="text-xs font-semibold text-[#B0403A]">No Coordinator Assigned</p>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-xs"
                                    icon={UserPlus}
                                    onClick={() => isClassPickerOpen ? closePicker() : openPicker(sec.id, cls.id)}
                                  >
                                    Assign Class Coordinator
                                  </Button>
                                </div>
                              )}

                              {isClassPickerOpen && (
                                <TeacherPicker
                                  teachers={filteredTeachers}
                                  search={pickerSearch}
                                  onSearch={setPickerSearch}
                                  onSelect={handleAssign}
                                  onClose={closePicker}
                                  saving={saving}
                                  displayName={teacherDisplayName}
                                  title={`Assign Coordinator: ${cls.class_name} - Sec ${sec.name}`}
                                />
                              )}
                            </div>
                          ) : (
                            /* SUBJECT MAPPING TAB */
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C97AB]">
                                  SUBJECT ALLOCATIONS
                                </span>
                                <span className="text-[10px] font-mono text-[#2F6F5E] font-semibold">
                                  {filledSubjectsCount} / {subjects.length} Staffed
                                </span>
                              </div>

                              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                                {subjects.map((sub) => {
                                  const assignment = subjectAssignments[sec.id]?.[sub.id];
                                  const teacher = assignment?.teacher;
                                  const isSubPickerOpen = activePicker?.sectionId === sec.id && activePicker?.subjectId === sub.id;

                                  return (
                                    <div
                                      key={sub.id}
                                      className="p-2 rounded-[6px] bg-white border border-[#EDEAE1] text-xs flex items-center justify-between gap-2 hover:border-[#D3E6E0] transition-colors"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-[#14213D] truncate">{sub.name}</p>
                                        <p className="text-[10px] text-[#52607D] truncate">
                                          {teacher ? `Faculty: ${teacherDisplayName(teacher)}` : '⚠️ Unassigned'}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {teacher ? (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-6 px-2 text-[10px]"
                                              onClick={() => isSubPickerOpen ? closePicker() : openPicker(sec.id, cls.id, sub.id)}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-[#B0403A] hover:bg-[#FDF2F1]"
                                              onClick={() => handleRemoveSubject(sec.id, sub.id)}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-6 px-2 text-[10px]"
                                            onClick={() => isSubPickerOpen ? closePicker() : openPicker(sec.id, cls.id, sub.id)}
                                          >
                                            Assign
                                          </Button>
                                        )}
                                      </div>

                                      {isSubPickerOpen && (
                                        <TeacherPicker
                                          teachers={filteredTeachers}
                                          search={pickerSearch}
                                          onSearch={setPickerSearch}
                                          onSelect={handleAssign}
                                          onClose={closePicker}
                                          saving={saving}
                                          displayName={teacherDisplayName}
                                          title={`Assign Faculty: ${sub.name} (${cls.class_name} - Sec ${sec.name})`}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Global Backdrop overlay to close picker on outside click */}
      {activePicker && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={closePicker} />
      )}
    </div>
  );
}

/* Modal Teacher Picker Component */
function TeacherPicker({ teachers, search, onSearch, onSelect, onClose, saving, displayName, title }) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={title || "Select Faculty Member"}
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C97AB]" />
          <Input
            autoFocus
            className="pl-8 text-xs h-8"
            placeholder="Search faculty by name or employee ID..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-[#EDEAE1] border border-[#E4E1D8] rounded-[8px]">
          {teachers.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8C97AB]">No matching faculty members found</div>
          ) : (
            teachers.map((t) => (
              <div
                key={t.id}
                onClick={() => !saving && onSelect(t)}
                className="p-2.5 flex items-center justify-between hover:bg-[#EAF3F0] hover:text-[#2F6F5E] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#2F6F5E] group-hover:text-white transition-colors">
                    {displayName(t)[0]?.toUpperCase() || 'T'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-[#14213D] group-hover:text-[#2F6F5E] truncate">
                      {displayName(t)}
                    </p>
                    {t.employee_id && (
                      <p className="text-[10px] text-[#52607D] font-mono">
                        ID: {t.employee_id}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="h-6 text-[10px] shrink-0" loading={saving}>
                  Assign
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

