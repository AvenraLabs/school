import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  Users,
  Award,
  Layers,
  ChevronRight,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  MapPin,
  Clock,
  Briefcase,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export function SchoolRegistry() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Nav states
  const [activeMainTab, setActiveMainTab] = useState('classes'); // classes, teachers, parents
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [activeSectionTab, setActiveSectionTab] = useState('students'); // students, teachers

  // Detail Drawer states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await schoolAPI.getDirectory();
        setData(res.data);
        
        // Auto-select first class and first section
        if (res.data?.classes?.length > 0) {
          const firstClass = res.data.classes[0];
          setSelectedClassId(firstClass.id);
          if (firstClass.sections?.length > 0) {
            setSelectedSectionId(firstClass.sections[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load directory details', err);
        showToast('Failed to load school directory data.', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">Failed to load school registry registry.</p>
      </div>
    );
  }

  const { classes, students, teachers, parents } = data;

  // Selected Class details
  const activeClass = classes.find(c => c.id === selectedClassId);
  const activeClassSections = activeClass?.sections || [];
  const activeSection = activeClassSections.find(s => s.id === selectedSectionId);

  // Roster filtered by section
  const sectionStudents = students.filter(s => s.class_id === selectedClassId && s.section_id === selectedSectionId);

  // Teacher Assignments in active class/section
  const sectionTeachers = activeSection ? teachers.filter(t => 
    t.teacher_assignments?.some(ta => ta.class_id === selectedClassId && ta.section_id === selectedSectionId)
  ) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-16">
      {/* ── Page Header ── */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">School Directory</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time management dashboard. Click cards to traverse classes, sections, students, and parent records.
          </p>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveMainTab('classes')}
          className={`pb-3 px-4 font-semibold text-sm transition-all duration-150 ${activeMainTab === 'classes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Class Registry
        </button>
        <button
          onClick={() => setActiveMainTab('teachers')}
          className={`pb-3 px-4 font-semibold text-sm transition-all duration-150 ${activeMainTab === 'teachers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          All Teachers ({teachers.length})
        </button>
        <button
          onClick={() => setActiveMainTab('parents')}
          className={`pb-3 px-4 font-semibold text-sm transition-all duration-150 ${activeMainTab === 'parents' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          All Parents ({parents.length})
        </button>
      </div>

      {/* ── 1. CLASSES REGISTRY TAB ── */}
      {activeMainTab === 'classes' && (
        <div className="space-y-6">
          {/* Class scroll horizontal deck */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Select Class Card</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
              {classes.map((c) => {
                const isSelected = c.id === selectedClassId;
                const studentCount = students.filter(s => s.class_id === c.id).length;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClassId(c.id);
                      if (c.sections?.length > 0) {
                        setSelectedSectionId(c.sections[0].id);
                      } else {
                        setSelectedSectionId(null);
                      }
                    }}
                    className={`min-w-[190px] flex-shrink-0 cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/30'
                        : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.sections?.length || 0} Sections
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg mt-4">{c.class_name}</h3>
                    <p className="text-slate-500 text-xs mt-1">{studentCount} Active Students</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Selector Pills */}
          {activeClass && activeClassSections.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Sections</h2>
              <div className="flex gap-2 flex-wrap">
                {activeClassSections.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  const secStudentCount = students.filter(s => s.class_id === selectedClassId && s.section_id === sec.id).length;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      Section {sec.name} ({secStudentCount} Students)
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Registry Details for selected Class/Section */}
          {activeSection ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeClass.class_name} - Section {activeSection.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Assigned roster and active subject teachers
                  </p>
                </div>

                <div className="flex gap-2 border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                  <button
                    onClick={() => setActiveSectionTab('students')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSectionTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Student Roster ({sectionStudents.length})
                  </button>
                  <button
                    onClick={() => setActiveSectionTab('teachers')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeSectionTab === 'teachers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Subject Teachers ({sectionTeachers.length})
                  </button>
                </div>
              </div>

              {/* Roster content */}
              {activeSectionTab === 'students' ? (
                sectionStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm">No students registered in this section yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionStudents.map((stud) => {
                      const userObj = stud.user || stud.User || {};
                      const studentName = userObj.name || 'Student';
                      const cleanName = studentName.replace(/^(Student Class|Student)\s+/gi, '').trim() || 'Student';
                      const parentName = stud.parents?.[0]?.user?.name || '—';
                      return (
                        <div
                          key={stud.id}
                          onClick={() => setSelectedStudent(stud)}
                          className="flex items-center gap-3 p-4 border border-slate-100 hover:border-slate-300 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-150"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                            {cleanName[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate text-sm">{cleanName}</h4>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">Parent: {parentName}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                sectionTeachers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm">No subject teachers assigned to this section yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionTeachers.map((teach) => {
                      const userObj = teach.user || teach.User || {};
                      const tAssignments = teach.teacher_assignments?.filter(ta => ta.class_id === selectedClassId && ta.section_id === selectedSectionId) || [];
                      const subjects = tAssignments.map(ta => ta.subject?.name).filter(Boolean).join(', ');
                      return (
                        <div
                          key={teach.id}
                          onClick={() => setSelectedTeacher(teach)}
                          className="flex items-center gap-3 p-4 border border-slate-100 hover:border-slate-300 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-150"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                            {userObj.name?.[0]?.toUpperCase() || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate text-sm">{userObj.name}</h4>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">Subject: {subjects || '—'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl">
              <p className="text-slate-400 text-sm">No sections found for this class.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 2. ALL TEACHERS DIRECTORY TAB ── */}
      {activeMainTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teach) => {
            const userObj = teach.user || teach.User || {};
            const activeSubjects = Array.from(new Set(teach.teacher_assignments?.map(ta => ta.subject?.name).filter(Boolean)));
            return (
              <div
                key={teach.id}
                onClick={() => setSelectedTeacher(teach)}
                className="bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                    {userObj.name?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{userObj.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{userObj.email || '—'}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-50 mt-4 pt-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">CLASSES</span>
                    <span className="text-xs text-slate-700 mt-0.5 font-medium">
                      {teach.teacher_assignments?.length || 0} assigned
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">SESSIONS</span>
                    <span className="text-xs text-indigo-600 mt-0.5 font-bold">
                      {teach.total_sessions} conducted
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. ALL PARENTS DIRECTORY TAB ── */}
      {activeMainTab === 'parents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parents.map((par) => {
            const userObj = par.user || par.User || {};
            const childUser = par.student?.user || par.student?.User || {};
            const cleanChildName = childUser.name?.replace(/^(Student Class|Student)\s+/gi, '').trim() || 'Student';
            return (
              <div
                key={par.id}
                onClick={() => setSelectedParent(par)}
                className="bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                    {userObj.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{userObj.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{userObj.email || '—'}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-50 mt-4 pt-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">CHILD</span>
                    <span className="text-xs text-slate-700 mt-0.5 font-bold truncate">
                      {cleanChildName}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">CLASS</span>
                    <span className="text-xs text-indigo-600 mt-0.5 font-bold">
                      {par.student?.class?.class_name || '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAIL DRAWERS ── */}

      {/* 1. Student Detail Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStudent(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Student Profile Summary</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header profile details */}
              <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-2xl">
                  {(selectedStudent.user?.name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    {(selectedStudent.user?.name || 'Student').replace(/^(Student Class|Student)\s+/gi, '').trim()}
                  </h3>
                  <p className="text-indigo-600 text-sm font-semibold">@{selectedStudent.user?.username || ''}</p>
                </div>
              </div>

              {/* Roster & Academic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">ADMISSION NO</span>
                    <span className="font-mono text-sm text-slate-700 font-bold">{selectedStudent.admission_no || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">ROLL NO</span>
                    <span className="text-sm text-slate-700 font-bold">{selectedStudent.roll_no || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">CLASS</span>
                    <span className="text-sm text-slate-700 font-bold">{activeClass?.class_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">SECTION</span>
                    <span className="text-sm text-slate-700 font-bold">{activeSection?.name || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Profile</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">DATE OF BIRTH</span>
                    <span className="text-sm text-slate-700 font-bold">{selectedStudent.dob || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">GENDER</span>
                    <span className="text-sm text-slate-700 font-bold capitalize">{selectedStudent.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">BLOOD GROUP</span>
                    <span className="text-sm text-slate-700 font-bold uppercase">{selectedStudent.blood_group || '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block">ADDRESS</span>
                    <span className="text-sm text-slate-700 font-medium">{selectedStudent.address || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Parent Profile linked */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Parents</h4>
                {selectedStudent.parents?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No parents linked to this student profile.</p>
                ) : (
                  selectedStudent.parents.map((p) => {
                    const pUser = p.user || p.User || {};
                    return (
                      <div key={p.id} className="border border-slate-100 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
                          <span className="font-bold text-slate-800">{pUser.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase">
                            {p.relation_type || 'Parent'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          {pUser.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> {pUser.email}
                            </span>
                          )}
                          {pUser.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> {pUser.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Attendance Statistics Dial */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Over The Year</h4>
                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-black text-slate-800 text-sm">
                    {selectedStudent.attendance?.percentage}%
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-sm">Overall Attendance</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {selectedStudent.attendance?.present_days} present, {selectedStudent.attendance?.absent_days} absent, {selectedStudent.attendance?.leave_days} leave days
                    </p>
                  </div>
                </div>
              </div>

              {/* Historical Grades Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marks & Exam History</h4>
                {selectedStudent.report_cards?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No exam records graded yet.</p>
                ) : (
                  selectedStudent.report_cards.map((rc) => (
                    <div key={rc.id} className="border border-slate-100 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2">
                        <span className="font-bold text-slate-800">{rc.exam?.name || 'Exam'}</span>
                        <span className="text-xs text-slate-400">{rc.exam?.start_date}</span>
                      </div>
                      <div className="space-y-1">
                        {rc.report_card_marks?.map((m) => {
                          const percentage = m.max_marks ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
                          return (
                            <div key={m.id} className="flex justify-between text-xs text-slate-600">
                              <span>{m.subject?.name || 'Subject'}</span>
                              <span className="font-bold">{m.marks_obtained}/{m.max_marks} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                      {rc.remarks && (
                        <p className="text-[11px] italic text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          Remarks: "{rc.remarks}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Teacher Detail Drawer */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTeacher(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Teacher Profile Summary</h2>
              <button onClick={() => setSelectedTeacher(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-2xl">
                  {(selectedTeacher.user?.name || 'T')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedTeacher.user?.name}</h3>
                  <p className="text-indigo-600 text-sm font-semibold">Teacher Account</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h4>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedTeacher.user?.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedTeacher.user?.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Info</h4>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block font-sans">QUALIFICATION</span>
                    <span className="text-sm text-slate-700 font-bold">{selectedTeacher.qualification || '—'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block font-sans">JOIN DATE</span>
                    <span className="text-sm text-slate-700 font-bold">{selectedTeacher.join_date || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher Assignments</h4>
                {selectedTeacher.teacher_assignments?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No active subject assignments found.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTeacher.teacher_assignments.map((ta) => (
                      <div key={ta.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{ta.subject?.name || 'Subject'}</span>
                          <span className="text-slate-500 text-xs mt-0.5 block">
                            {ta.class?.class_name} - Section {ta.section?.name}
                          </span>
                        </div>
                        {ta.is_class_teacher && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                            Class Incharge
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Stats</h4>
                <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    {selectedTeacher.total_sessions}
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-sm">Timetable Sessions Conducted</p>
                    <p className="text-slate-400 text-xs mt-0.5">Sum of finished sessions found in registry logs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Parent Detail Drawer */}
      {selectedParent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedParent(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Parent Profile Summary</h2>
              <button onClick={() => setSelectedParent(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4 items-center border-b border-slate-100 pb-5">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-2xl">
                  {(selectedParent.user?.name || 'P')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedParent.user?.name}</h3>
                  <p className="text-indigo-600 text-sm font-semibold">Parent Account</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h4>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedParent.user?.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedParent.user?.phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Children</h4>
                <div className="border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <span className="font-bold text-slate-800">
                      {selectedParent.student?.user?.name?.replace(/^(Student Class|Student)\s+/gi, '').trim()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase">
                      {selectedParent.relation_type || 'Son/Daughter'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold">CLASS</span>
                      <span className="text-slate-700 font-bold">{selectedParent.student?.class?.class_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">SECTION</span>
                      <span className="text-slate-700 font-bold">Section {selectedParent.student?.section?.name || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS animations for custom Drawer slide-in */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
