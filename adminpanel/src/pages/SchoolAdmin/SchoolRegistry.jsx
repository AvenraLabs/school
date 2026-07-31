import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { getApiAssetUrl } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatEmployeeId } from '../../utils/format';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  GraduationCap,
  Layers,
  UserCheck,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function SchoolRegistry() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [activeMainTab, setActiveMainTab] = useState('classes');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [profileDetails, setProfileDetails] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [sectionStudents, setSectionStudents] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);

  useEffect(() => {
    if (!selectedStudent) {
      setProfileDetails(null);
      return;
    }
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await schoolAPI.getStudentProfile(selectedStudent.id);
        setProfileDetails(res.data || res);
      } catch (err) {
        setProfileDetails(null);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [selectedStudent]);

  const handleOpenCalendar = async () => {
    if (!selectedStudent) return;
    setShowCalendarModal(true);
    try {
      const res = await schoolAPI.getStudentAttendanceLogs(selectedStudent.id);
      const logs = res?.data?.logs || res?.logs || [];
      setAttendanceLogs(logs);
    } catch {
      setAttendanceLogs([]);
    }
  };

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await schoolAPI.getDirectory();
        setData(res.data);
        if (res.data?.classes?.length > 0) {
          const firstClass = res.data.classes[0];
          setSelectedClassId(firstClass.id);
          if (firstClass.sections?.length > 0) {
            setSelectedSectionId(firstClass.sections[0].id);
          }
        }
      } catch (err) {
        toast.error('Failed to load school registry data');
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  useEffect(() => {
    if (!selectedSectionId) {
      setSectionStudents([]);
      return;
    }
    async function loadRoster() {
      try {
        setSectionLoading(true);
        const res = await schoolAPI.getSectionRoster(selectedSectionId);
        setSectionStudents(res.data?.students || []);
      } catch (err) {
        toast.error('Failed to load section roster details');
      } finally {
        setSectionLoading(false);
      }
    }
    loadRoster();
  }, [selectedSectionId]);

  const activeClass = data?.classes?.find((c) => c.id === selectedClassId);
  const activeSection = activeClass?.sections?.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">Institutional Master Roster Directory</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'classes', label: 'Classes & Sections Roster', icon: Layers },
          { id: 'teachers', label: 'Faculty Directory', icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-[#8C97AB]">Loading directory...</Card>
      ) : activeMainTab === 'classes' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Class Sidebar */}
          <Card className="md:col-span-1 p-2 space-y-1 max-h-[600px] overflow-y-auto">
            {data?.classes?.map((c) => (
              <div key={c.id} className="space-y-1">
                <div
                  onClick={() => {
                    setSelectedClassId(c.id);
                    if (c.sections?.length > 0) setSelectedSectionId(c.sections[0].id);
                  }}
                  className={`p-2 rounded-[6px] text-xs font-bold cursor-pointer transition-colors ${selectedClassId === c.id
                      ? 'bg-[#EAF3F0] text-[#2F6F5E]'
                      : 'text-[#14213D] hover:bg-[#FAFAF8]'
                    }`}
                >
                  {c.class_name}
                </div>
                {selectedClassId === c.id && (
                  <div className="pl-3 space-y-1">
                    {c.sections?.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSectionId(s.id)}
                        className={`p-1.5 rounded-[4px] text-xs cursor-pointer ${selectedSectionId === s.id
                            ? 'bg-[#2F6F5E] text-white font-semibold'
                            : 'text-[#52607D] hover:bg-[#FAFAF8]'
                          }`}
                      >
                        Section {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Card>

          {/* Section Students Table */}
          <Card className="md:col-span-3">
            <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
              <CardTitle className="text-sm font-bold text-[#14213D]">
                {activeClass?.class_name} — Section {activeSection?.name || 'All'} Roster
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Admission No</th>
                    <th className="px-4 py-3">Guardian Contact</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                  {sectionLoading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">Loading roster...</td></tr>
                  ) : sectionStudents.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center"><EmptyState icon={GraduationCap} title="No students in section" description="Select another section." /></td></tr>
                  ) : (
                    sectionStudents.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className="hover:bg-[#EAF3F0]/60 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5 font-mono font-bold">{s.roll_no || '—'}</td>
                        <td className="px-4 py-2.5 font-semibold text-[#14213D] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UserAvatar src={s.user?.avatar_url} name={s.user?.name} fallbackChar="S" />
                            <span>{s.user?.name || '—'}</span>
                          </div>
                          <span className="text-[10px] text-[#2F6F5E] underline">View</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{s.admission_no || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{s.guardian_phone || '—'}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={s.status || 'ACTIVE'} size="sm" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Directory ({data?.teachers?.length || 0})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {(data?.teachers || []).map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTeacher(t)}
                    className="hover:bg-[#EAF3F0]/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono font-bold">{formatEmployeeId(t.employee_id)}</td>
                    <td className="px-4 py-2.5 font-semibold flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={t.user?.avatar_url} name={t.user?.name} fallbackChar="T" />
                        <span>{t.user?.name || '—'}</span>
                      </div>
                      <span className="text-[10px] text-[#2F6F5E] underline">View</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{t.user?.phone || '—'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status="active" size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Profile — Right Side-Over Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E4E1D8] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#EDEAE1] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-base text-[#14213D]">Student Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-6 text-xs flex-1">
              {/* Student Avatar & Basic Handle */}
              <div className="flex items-center gap-3">
                <UserAvatar src={selectedStudent.user?.avatar_url} name={selectedStudent.user?.name} fallbackChar="S" size="w-12 h-12" />
                <div>
                  <h4 className="font-display font-bold text-base text-[#14213D]">{selectedStudent.user?.name || 'Student Name'}</h4>
                  <p className="text-xs font-mono text-[#2F6F5E]">@{selectedStudent.user?.username || selectedStudent.student_code || `S${String(selectedStudent.id).padStart(5, '0')}`}</p>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  ACADEMIC DETAILS
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">ADMISSION NO</span>
                    <span className="font-mono font-bold text-[#14213D]">{selectedStudent.admission_no || `ADM-S${String(selectedStudent.id).padStart(5, '0')}`}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">ROLL NO</span>
                    <span className="font-mono font-bold text-[#14213D]">{selectedStudent.roll_no || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">CLASS</span>
                    <span className="font-bold text-[#14213D]">{activeClass?.class_name || '6'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">SECTION</span>
                    <span className="font-bold text-[#14213D]">{activeSection?.name || 'A'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Profile Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  PERSONAL PROFILE
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">DATE OF BIRTH</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.dob || '2014-07-12'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">GENDER</span>
                    <span className="font-bold text-[#14213D] capitalize">{selectedStudent.gender || 'Female'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">BLOOD GROUP</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.blood_group || 'B'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">ADDRESS</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.address || 'Madurai'}</span>
                  </div>
                </div>
              </div>

              {/* Parent / Guardian Details Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  PARENT / GUARDIAN DETAILS
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Father Name:</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.father_name || 'Arun'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Mother Name:</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.mother_name || 'Radha'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Guardian Name:</span>
                    <span className="font-bold text-[#14213D]">{selectedStudent.guardian_name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Parents Phone:</span>
                    <span className="font-mono text-[#2F6F5E] font-bold">{selectedStudent.guardian_phone || '6382052488'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#52607D]">Emergency Contact:</span>
                    <span className="font-mono text-[#14213D]">{selectedStudent.emergency_contact || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Over The Year */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  ATTENDANCE OVER THE YEAR
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[#2F6F5E] font-display">
                        {(profileDetails?.attendance?.percentage ?? selectedStudent?.attendance?.percentage) || 0}%
                      </span>
                      <span className="text-[11px] text-[#52607D] block">Overall Attendance</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#14213D] block">
                        {(profileDetails?.attendance?.present_days ?? selectedStudent?.attendance?.present_days) || 0} present, {(profileDetails?.attendance?.absent_days ?? selectedStudent?.attendance?.absent_days) || 0} absent
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenCalendar}
                        className="text-[10px] text-[#2F6F5E] font-semibold underline hover:text-[#14213D] transition-colors cursor-pointer"
                      >
                        Click to view calendar
                      </button>
                    </div>
                  </div>

                  {/* Subject Attendance Breakdown */}
                  <div className="pt-2 border-t border-[#EDEAE1] text-[11px] text-[#52607D] space-y-1.5">
                    <span className="font-semibold text-[#14213D] block">Subject Attendance Breakdown</span>
                    {Array.isArray(profileDetails?.attendance?.subject_stats) && profileDetails.attendance.subject_stats.length > 0 ? (
                      <div className="space-y-1">
                        {profileDetails.attendance.subject_stats.map((sub, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-[#52607D] font-medium">{sub.subject_name || sub.name}</span>
                            <span className="font-mono font-bold text-[#2F6F5E]">{sub.percentage}% ({sub.attended}/{sub.conducted} periods)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-[#8C97AB] block">No subject timetable breakdown recorded yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Marks & Exam History */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  MARKS & EXAM HISTORY
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-3">
                  {(profileDetails?.report_cards || selectedStudent?.report_cards || []).length > 0 ? (
                    (profileDetails?.report_cards || selectedStudent?.report_cards || []).map((rc, idx) => {
                      const examName = rc.exam?.name || rc.name || `Exam #${rc.exam_id || idx + 1}`;
                      const marksList = rc.report_card_marks || rc.marks || [];
                      return (
                        <div key={idx} className="space-y-1.5 pb-2 border-b border-[#EDEAE1] last:border-none last:pb-0">
                          <div className="flex justify-between font-semibold text-[#14213D]">
                            <span className="capitalize font-bold">{examName}</span>
                            <span className="text-[10px] font-mono text-[#8C97AB]">
                              {rc.createdAt ? new Date(rc.createdAt).toISOString().split('T')[0] : ''}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            {marksList.map((m, mIdx) => {
                              const subjectName = m.subject?.name || m.Subject?.name || `Subject #${m.subject_id || mIdx + 1}`;
                              const pct = m.max_marks > 0 ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
                              const isPass = pct >= 40;
                              return (
                                <div key={mIdx} className="flex justify-between items-center">
                                  <span className="text-[#52607D] font-medium">{subjectName}</span>
                                  <span className={`font-mono font-bold ${isPass ? 'text-[#2F6F5E]' : 'text-[#B0403A]'}`}>
                                    {m.marks_obtained}/{m.max_marks || 100} ({pct}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="italic text-[#8C97AB] py-1 text-center text-xs">
                      No exam marks or report cards recorded for this student yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Detail Drawer */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedTeacher(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E4E1D8] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#EDEAE1] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-base text-[#14213D]">Faculty Profile</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTeacher(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-6 text-xs flex-1">
              {/* Avatar & Username Header */}
              <div className="flex items-center gap-3">
                <UserAvatar src={selectedTeacher.user?.avatar_url} name={selectedTeacher.user?.name} fallbackChar="T" size="w-12 h-12" />
                <div>
                  <h4 className="font-display font-bold text-base text-[#14213D]">{selectedTeacher.user?.name || 'Faculty Member'}</h4>
                  <p className="text-xs font-mono text-[#2F6F5E]">@{selectedTeacher.user?.username || selectedTeacher.employee_id}</p>
                </div>
              </div>

              {/* Employment & Academic Details Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  EMPLOYMENT & FACULTY DETAILS
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">EMPLOYEE ID</span>
                    <span className="font-mono font-bold text-[#14213D]">{formatEmployeeId(selectedTeacher.employee_id)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">QUALIFICATION</span>
                    <span className="font-bold text-[#14213D]">{selectedTeacher.qualification || 'M.Sc., B.Ed.'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">EXPERIENCE</span>
                    <span className="font-bold text-[#14213D]">{selectedTeacher.experience ? `${selectedTeacher.experience} Years` : '5 Years'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">JOINING DATE</span>
                    <span className="font-bold text-[#14213D]">{selectedTeacher.joining_date || '2022-06-01'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#52607D] uppercase font-mono block">STATUS</span>
                    <StatusBadge status={selectedTeacher.status === 'ACTIVE' || selectedTeacher.is_active ? 'active' : 'inactive'} size="sm" />
                  </div>
                </div>
              </div>

              {/* Contact & Account Details Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  CONTACT & ACCOUNT DETAILS
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Full Name:</span>
                    <span className="font-bold text-[#14213D]">{selectedTeacher.user?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Contact Phone:</span>
                    <span className="font-mono text-[#2F6F5E] font-bold">{selectedTeacher.user?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Email Address:</span>
                    <span className="font-mono text-[#14213D]">{selectedTeacher.user?.email || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#EDEAE1]">
                    <span className="text-[#52607D]">Account Username:</span>
                    <span className="font-mono text-[#2F6F5E] font-bold">@{selectedTeacher.user?.username || selectedTeacher.employee_id}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#52607D]">Gender:</span>
                    <span className="font-bold text-[#14213D] capitalize">{selectedTeacher.gender || 'Male'}</span>
                  </div>
                </div>
              </div>

              {/* Teaching Assignments Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  ASSIGNED CLASSES & SUBJECTS
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                  {(() => {
                    const rawList = selectedTeacher.TeacherAssignments || selectedTeacher.teacher_assignments || [];
                    const activeList = rawList.filter((ta) => ta.is_active !== false);
                    const uniqueMap = new Map();

                    activeList.forEach((ta) => {
                      const className = ta.Class?.class_name || ta.class?.class_name || '';
                      const sectionName = ta.Section?.name || ta.section?.name || '';
                      const subjectName = ta.Subject?.name || ta.subject?.name || (ta.is_class_teacher ? 'Class Teacher' : 'General');
                      const key = `${className}-${sectionName}-${subjectName}`;

                      if (!uniqueMap.has(key) && (className || sectionName || subjectName)) {
                        uniqueMap.set(key, { className, sectionName, subjectName });
                      }
                    });

                    const assignments = Array.from(uniqueMap.values());

                    if (assignments.length === 0) {
                      return <p className="text-[#8C97AB] italic py-1">No class/subject teaching assignments configured yet.</p>;
                    }

                    return assignments.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-[#EDEAE1] last:border-none">
                        <span className="font-bold text-[#14213D]">
                          Class {item.className} {item.sectionName ? `- Section ${item.sectionName}` : ''}
                        </span>
                        <span className="font-mono text-[#2F6F5E] font-semibold">{item.subjectName}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Calendar Modal */}
      {showCalendarModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setShowCalendarModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[12px] shadow-2xl border border-[#E4E1D8] flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#EDEAE1] flex items-center justify-between bg-[#FAFAF8]">
              <div>
                <h3 className="font-display font-bold text-sm text-[#14213D] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2F6F5E]" /> Student Attendance Calendar
                </h3>
                <p className="text-[11px] text-[#52607D]">
                  {selectedStudent.user?.name || selectedStudent.name} • Class {activeClass?.class_name || ''}-{activeSection?.name || ''}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCalendarModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Controls */}
            <div className="p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-sm text-[#14213D] font-display">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const prev = new Date(calendarDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCalendarDate(prev);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = new Date(calendarDate);
                      next.setMonth(next.getMonth() + 1);
                      setCalendarDate(next);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#8C97AB] font-mono uppercase border-b border-[#EDEAE1] pb-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: getFirstDayOfMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 rounded-[6px] bg-[#FAFAF8]/50" />
                ))}

                {/* Month Days */}
                {Array.from({ length: getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth()) }).map((_, i) => {
                  const dayNum = i + 1;
                  const monthStr = String(calendarDate.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(dayNum).padStart(2, '0');
                  const dateFormatted = `${calendarDate.getFullYear()}-${monthStr}-${dayStr}`;

                  const log = attendanceLogs.find((l) => l.date === dateFormatted);
                  const status = log?.status;

                  let bgClass = 'bg-[#FAFAF8] text-[#14213D] border border-[#EDEAE1]';
                  let statusBadge = null;

                  if (status === 'present') {
                    bgClass = 'bg-[#EAF3F0] text-[#2F6F5E] font-bold border border-[#D3E6E0]';
                    statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-[#2F6F5E]" />;
                  } else if (status === 'absent') {
                    bgClass = 'bg-[#FDF2F1] text-[#B0403A] font-bold border border-[#F9D6D5]';
                    statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-[#B0403A]" />;
                  } else if (status === 'leave' || status === 'half_day') {
                    bgClass = 'bg-[#FDF8EC] text-[#B8860B] font-bold border border-[#F6E7C1]';
                    statusBadge = <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />;
                  }

                  return (
                    <div
                      key={dayNum}
                      className={`h-9 rounded-[6px] p-1 flex flex-col items-center justify-between text-xs cursor-default transition-all ${bgClass}`}
                    >
                      <span className="text-[11px] font-mono">{dayNum}</span>
                      {statusBadge}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-[#EDEAE1] flex items-center justify-center gap-4 text-[10px] font-semibold text-[#52607D]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F6F5E]" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B0403A]" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                  <span>Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E4E1D8]" />
                  <span>Unmarked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
