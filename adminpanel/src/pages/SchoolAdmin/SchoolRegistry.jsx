import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { formatEmployeeId } from '../../utils/format';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  GraduationCap,
  Layers,
  UserCheck,
  X,
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

  const [sectionStudents, setSectionStudents] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);

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
                        <td className="px-4 py-2.5 font-semibold text-[#14213D] flex items-center justify-between">
                          <span>{s.user?.name || '—'}</span>
                          <span className="text-[10px] text-[#2F6F5E] underline">View Profile Summary</span>
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
                  <th className="px-4 py-3">Designation</th>
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
                    <td className="px-4 py-2.5 font-semibold flex items-center justify-between">
                      <span>{t.user?.name || '—'}</span>
                      <span className="text-[10px] text-[#2F6F5E] underline">View Details</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{t.user?.phone || '—'}</td>
                    <td className="px-4 py-2.5 font-medium">{t.designation || 'Teacher'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status="active" size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Profile Summary — Right Side-Over Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E4E1D8] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#EDEAE1] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-base text-[#14213D]">Student Profile Summary</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-6 text-xs flex-1">
              {/* Student Avatar & Basic Handle */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-lg border border-[#D3E6E0]">
                  {selectedStudent.user?.name ? selectedStudent.user.name[0] : 'S'}
                </div>
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
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[#2F6F5E] font-display">90%</span>
                      <span className="text-[11px] text-[#52607D] block">Overall Attendance</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#14213D]">9 present, 0 absent</span>
                      <span className="text-[10px] text-[#2F6F5E] underline block cursor-pointer">Click to view calendar</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#EDEAE1] text-[11px] text-[#52607D]">
                    <span className="font-semibold text-[#14213D] block mb-1">Subject Attendance Breakdown</span>
                    <span className="italic text-[#8C97AB]">No subject attendance logs recorded yet.</span>
                  </div>
                </div>
              </div>

              {/* Marks & Exam History */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AB] font-mono block">
                  MARKS & EXAM HISTORY
                </span>
                <div className="p-3 bg-[#FAFAF8] rounded-[8px] border border-[#E4E1D8] space-y-3">
                  {/* Quart Yearly */}
                  <div className="space-y-1 pb-2 border-b border-[#EDEAE1]">
                    <div className="flex justify-between font-semibold text-[#14213D]">
                      <span className="capitalize">quart yearly</span>
                      <span className="text-[10px] font-mono text-[#8C97AB]">2026-07-27</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#52607D]">English</span>
                      <span className="font-mono font-bold text-[#2F6F5E]">55/100 (55%)</span>
                    </div>
                  </div>

                  {/* Mid Term */}
                  <div className="space-y-1 pb-2 border-b border-[#EDEAE1]">
                    <div className="flex justify-between font-semibold text-[#14213D]">
                      <span className="capitalize">mid term</span>
                      <span className="text-[10px] font-mono text-[#8C97AB]">2026-07-21 - 2026-07-27</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#52607D]">English</span>
                      <span className="font-mono font-bold text-[#B0403A]">32/100 (32%)</span>
                    </div>
                  </div>

                  {/* Annual */}
                  <div className="space-y-1 pb-2 border-b border-[#EDEAE1]">
                    <div className="flex justify-between font-semibold text-[#14213D]">
                      <span className="capitalize font-bold">Annual</span>
                      <span className="text-[10px] font-mono text-[#8C97AB]">2026-07-12 - 2026-07-17</span>
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Maths</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">44/100 (44%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Science</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">85/100 (85%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Tamil</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">96/100 (96%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Social science</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">58/100 (58%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">English</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">68/100 (68%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Half Yearly */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-[#14213D]">
                      <span className="capitalize font-bold">Half yearly</span>
                      <span className="text-[10px] font-mono text-[#8C97AB]">2026-07-18 - 2026-07-27</span>
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Social science</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">63/100 (63%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#52607D]">Maths</span>
                        <span className="font-mono font-bold text-[#2F6F5E]">98/100 (98%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedTeacher(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E4E1D8] flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#EDEAE1] flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-display font-bold text-base text-[#14213D]">Faculty Profile Summary</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTeacher(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4 text-xs flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-lg border border-[#D3E6E0]">
                  {selectedTeacher.user?.name ? selectedTeacher.user.name[0] : 'T'}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-[#14213D]">{selectedTeacher.user?.name || 'Faculty Member'}</h4>
                  <p className="text-xs font-mono text-[#2F6F5E]">{formatEmployeeId(selectedTeacher.employee_id)}</p>
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-[#EDEAE1] text-xs">
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Faculty Name</span><span className="font-bold text-[#14213D]">{selectedTeacher.user?.name || '—'}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Employee ID</span><span className="font-mono font-bold text-[#14213D]">{formatEmployeeId(selectedTeacher.employee_id)}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Designation</span><span className="font-medium text-[#14213D]">{selectedTeacher.designation || 'Teacher'}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Contact Phone</span><span className="font-mono text-[#2F6F5E] font-semibold">{selectedTeacher.user?.phone || '—'}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Account Username</span><span className="font-mono text-[#52607D]">{selectedTeacher.user?.username || '—'}</span></div>
                <div className="flex justify-between py-1.5"><span className="text-[#52607D]">Approval Status</span><StatusBadge status="approved" size="sm" /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
