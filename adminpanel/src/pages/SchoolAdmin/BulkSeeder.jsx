import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bulkAPI, schoolAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { generateBulkCredentialsPDF } from '../../utils/pdfGenerator';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Plus, Trash2, Database, Download, Layers, GraduationCap, CheckCircle, UserCog, BookOpen, Building2 } from 'lucide-react';

const emptyClass = () => ({ name: '', sections: [emptySection()] });
const emptySection = () => ({ name: '', students: '' });

export function BulkSeeder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([emptyClass()]);
  const [teacherCount, setTeacherCount] = useState('');
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (user?.role === 'super_admin') {
      schoolAPI
        .list()
        .then((data) => {
          const list = Array.isArray(data) ? data : data.schools || data.data || [];
          setSchools(list);
          if (list.length > 0) {
            setSelectedSchoolId(String(list[0].id));
          }
        })
        .catch(() => {
          toast.error('Failed to load schools list for seeding');
        });
    }
  }, [user?.role]);

  const addClass = () => setClasses((p) => [...p, emptyClass()]);
  const removeClass = (ci) => setClasses((p) => (p.length <= 1 ? p : p.filter((_, i) => i !== ci)));
  const updateClass = (ci, val) => setClasses((p) => p.map((c, i) => (i === ci ? { ...c, name: val } : c)));
  const addSection = (ci) =>
    setClasses((p) =>
      p.map((c, i) => (i !== ci ? c : { ...c, sections: [...c.sections, emptySection()] }))
    );
  const removeSection = (ci, si) =>
    setClasses((p) =>
      p.map((c, i) => (i !== ci || c.sections.length <= 1 ? c : { ...c, sections: c.sections.filter((_, j) => j !== si) }))
    );
  const updateSection = (ci, si, field, val) =>
    setClasses((p) =>
      p.map((c, i) =>
        i !== ci
          ? c
          : { ...c, sections: c.sections.map((s, j) => (j !== si ? s : { ...s, [field]: val })) }
      )
    );

  const totalStudents = classes.reduce((s, c) => s + c.sections.reduce((a, sec) => a + (Number(sec.students) || 0), 0), 0);
  const totalSections = classes.reduce((s, c) => s + c.sections.length, 0);
  const tc = Number(teacherCount) || 0;

  const handleSubmit = async () => {
    const targetSchoolId = user?.role === 'super_admin' ? selectedSchoolId : (user?.school_id || selectedSchoolId);
    if (user?.role === 'super_admin' && !targetSchoolId) {
      toast.error('Please select a target school');
      return;
    }

    for (const cls of classes) {
      if (!cls.name.trim()) { toast.error('All classes must have a name'); return; }
      for (const sec of cls.sections) {
        if (!sec.name.trim()) { toast.error('All sections must have a name'); return; }
        if (!sec.students || Number(sec.students) < 1) { toast.error('All sections need a student count'); return; }
      }
    }

    setLoading(true);
    try {
      const payload = {
        classes: classes.map((c) => ({
          name: c.name.trim(),
          sections: c.sections.map((s) => ({ name: s.name.trim(), students: Number(s.students) })),
        })),
        teacher_count: tc,
      };
      if (targetSchoolId) {
        payload.school_id = targetSchoolId;
      }

      const res = await bulkAPI.createData(payload);
      setResult(res);
      toast.success('All data created!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const s = result.summary || {};
    return (
      <div className="max-w-2xl mx-auto space-y-4 text-xs">
        <Card className="p-6 text-center space-y-4 border-[#2F6F5E]/30 bg-[#EAF3F0]">
          <CheckCircle className="w-12 h-12 text-[#2F6F5E] mx-auto" />
          <h3 className="text-base font-bold text-[#14213D]">Bulk Roster Seeding Complete!</h3>
          <p className="text-xs text-[#52607D]">
            Created {s.classes_created} classes, {s.sections_created} sections, {s.students_created} students, and {s.teachers_created} teachers.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="primary"
              icon={Download}
              onClick={() => generateBulkCredentialsPDF(result.teachers, result.students)}
            >
              Download PDF Credentials
            </Button>
            <Button variant="outline" onClick={() => navigate(user?.role === 'super_admin' ? '/super-admin' : '/admin')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto text-xs">
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#2F6F5E]" />
              <span>Bulk Institutional Data Seeder</span>
            </div>
            <span className="text-xs text-[#52607D] font-normal">
              Summary: {classes.length} Classes · {totalSections} Sections · {totalStudents} Students · {tc} Faculty
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {user?.role === 'super_admin' && (
            <div className="bg-[#FAFAF8] p-3 rounded-[8px] border border-[#E4E1D8] mb-2 space-y-1.5">
              <label className="block text-xs font-bold text-[#14213D] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2F6F5E]" />
                Target Institution (Super Admin Mode) *
              </label>
              <Select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                options={[
                  { value: '', label: 'Select Target School...' },
                  ...schools.map((s) => ({
                    value: String(s.id),
                    label: `${s.school_name || s.name || 'School #' + s.id} (${s.code || 'ID: ' + s.id})`
                  }))
                ]}
                className="w-full text-xs"
              />
            </div>
          )}

          <div className="space-y-4">
            {classes.map((cls, ci) => (
              <Card key={ci} className="p-3 border border-[#E4E1D8] space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Class Name (e.g. 10)"
                    value={cls.name}
                    onChange={(e) => updateClass(ci, e.target.value)}
                    className="w-48 text-xs font-semibold"
                  />
                  {classes.length > 1 && (
                    <Button variant="ghost" size="sm" icon={Trash2} className="text-[#B0403A]" onClick={() => removeClass(ci)} />
                  )}
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-[#E4E1D8]">
                  {cls.sections.map((sec, si) => (
                    <div key={si} className="flex items-center gap-3">
                      <Input
                        placeholder="Section (e.g. A)"
                        value={sec.name}
                        onChange={(e) => updateSection(ci, si, 'name', e.target.value)}
                        className="w-32 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Student Count"
                        value={sec.students}
                        onChange={(e) => updateSection(ci, si, 'students', e.target.value)}
                        className="w-36 text-xs font-mono"
                      />
                      {cls.sections.length > 1 && (
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-[#B0403A]" onClick={() => removeSection(ci, si)} />
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" icon={Plus} onClick={() => addSection(ci)}>
                    Add Section
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" icon={Plus} onClick={addClass}>
              Add Another Class
            </Button>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                placeholder="Faculty (0 to skip)"
                value={teacherCount}
                onChange={(e) => setTeacherCount(e.target.value)}
                className="w-36 text-xs font-mono"
              />
              <Button variant="primary" icon={Database} loading={loading} onClick={handleSubmit} className="whitespace-nowrap shrink-0">
                Seed Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
