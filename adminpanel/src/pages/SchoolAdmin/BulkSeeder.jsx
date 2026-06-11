import { useState } from 'react';
import { bulkAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { generateBulkCredentialsPDF } from '../../utils/pdfGenerator';
import { Plus, Trash2, Database, Download, Layers, Users, GraduationCap, CheckCircle, UserCog, BookOpen } from 'lucide-react';

/* ── shared styles ── */
const card = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };
const input = {
  height: '42px', padding: '0 14px', fontSize: '14px', color: '#0f172a',
  border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc',
  outline: 'none', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box',
};
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  height: '44px', padding: '0 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
  background: 'linear-gradient(135deg, #1a1350, #4338ca)', color: '#fff',
  border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
};
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  height: '36px', padding: '0 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
  background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
  cursor: 'pointer',
};
const iconBtn = {
  width: '30px', height: '30px', borderRadius: '8px', border: 'none',
  background: 'transparent', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
};

/* blank row factories — no default values */
const emptyClass = () => ({ name: '', sections: [emptySection()] });
const emptySection = () => ({ name: '', students: '' });

export function BulkSeeder() {
  const [classes, setClasses] = useState([emptyClass()]);
  const [teacherCount, setTeacherCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const addClass = () => setClasses(p => [...p, emptyClass()]);
  const removeClass = (ci) => setClasses(p => p.length <= 1 ? p : p.filter((_, i) => i !== ci));
  const updateClass = (ci, val) => setClasses(p => p.map((c, i) => i === ci ? { ...c, name: val } : c));
  const addSection = (ci) => setClasses(p => p.map((c, i) => i !== ci ? c : {
    ...c, sections: [...c.sections, emptySection()],
  }));
  const removeSection = (ci, si) => setClasses(p => p.map((c, i) => (i !== ci || c.sections.length <= 1) ? c : {
    ...c, sections: c.sections.filter((_, j) => j !== si),
  }));
  const updateSection = (ci, si, field, val) => setClasses(p => p.map((c, i) => i !== ci ? c : {
    ...c, sections: c.sections.map((s, j) => j !== si ? s : { ...s, [field]: val }),
  }));

  const totalStudents = classes.reduce((s, c) => s + c.sections.reduce((a, sec) => a + (Number(sec.students) || 0), 0), 0);
  const totalSections = classes.reduce((s, c) => s + c.sections.length, 0);
  const tc = Number(teacherCount) || 0;

  const handleSubmit = async () => {
    /* basic validation */
    for (const cls of classes) {
      if (!cls.name.trim()) { toast.error('All classes must have a name'); return; }
      for (const sec of cls.sections) {
        if (!sec.name.trim()) { toast.error('All sections must have a name'); return; }
        if (!sec.students || Number(sec.students) < 1) { toast.error('All sections need a student count'); return; }
      }
    }
    if (!teacherCount || tc < 1) { toast.error('Enter teacher count'); return; }

    setLoading(true);
    try {
      const res = await bulkAPI.createData({
        classes: classes.map(c => ({
          name: c.name.trim(),
          sections: c.sections.map(s => ({ name: s.name.trim(), students: Number(s.students) })),
        })),
        teacher_count: tc,
      });
      setResult(res);
      toast.success('All data created!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── success screen ── */
  if (result) {
    const s = result.summary || {};
    const items = [
      { label: 'Classes',   val: s.classes_created,  icon: Layers,       c: '#4f46e5', bg: '#eef2ff' },
      { label: 'Sections',  val: s.sections_created, icon: BookOpen,     c: '#7c3aed', bg: '#f5f3ff' },
      { label: 'Students',  val: s.students_created, icon: GraduationCap,c: '#16a34a', bg: '#f0fdf4' },
      { label: 'Teachers',  val: s.teachers_created, icon: UserCog,      c: '#0284c7', bg: '#f0f9ff' },
      { label: 'Parents',   val: s.parents_created,  icon: Users,        c: '#d97706', bg: '#fffbeb' },
    ].filter(i => i.val != null);

    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', paddingTop: '24px' }}>
        <div style={{ ...card, padding: '40px', textAlign: 'center', marginBottom: '20px', borderColor: '#bbf7d0' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle style={{ width: '28px', height: '28px', color: '#16a34a' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>All done!</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>School data created successfully.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {items.map(({ label, val, icon: Icon, c, bg }) => (
            <div key={label} style={{ ...card, padding: '16px', textAlign: 'center' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: bg, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{val}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => { generateBulkCredentialsPDF(result); toast.success('PDF downloaded'); }}>
            <Download style={{ width: '16px', height: '16px' }} /> Download Credentials PDF
          </button>
          <button style={btnSecondary} onClick={() => { setResult(null); setClasses([emptyClass()]); setTeacherCount(''); }}>Reset</button>
        </div>
      </div>
    );
  }

  const summaryRows = [
    { label: 'Classes',      val: classes.length, icon: Layers,        c: '#4f46e5' },
    { label: 'Sections',     val: totalSections,  icon: BookOpen,      c: '#7c3aed' },
    { label: 'Students',     val: totalStudents,  icon: GraduationCap, c: '#16a34a' },
    { label: 'Teachers',     val: tc,             icon: UserCog,       c: '#0284c7' },
    { label: 'Parents (auto)',val: totalStudents,  icon: Users,         c: '#d97706' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Bulk Setup</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Create classes, sections, students and teachers in one go</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Classes &amp; Sections</span>
            <button style={btnSecondary} onClick={addClass}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add Class
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {classes.map((cls, ci) => (
              <div key={ci} style={card}>
                {/* Class header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
                  borderRadius: '16px 16px 0 0',
                }}>
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '6px',
                    background: '#eef2ff', color: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  }}>{ci + 1}</span>
                  <input
                    style={{ ...input, flex: 1, background: 'transparent', border: 'none', height: '32px', padding: '0', fontWeight: 600, fontSize: '14px' }}
                    value={cls.name}
                    onChange={e => updateClass(ci, e.target.value)}
                    placeholder="Enter class name (e.g. Class 6)"
                  />
                  <button
                    style={iconBtn}
                    disabled={classes.length <= 1}
                    onClick={() => removeClass(ci)}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {/* Sections */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cls.sections.map((sec, si) => (
                    <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', width: '52px', flexShrink: 0 }}>Section</span>
                      <input
                        style={{ ...input, width: '80px', textAlign: 'center', fontWeight: 600 }}
                        value={sec.name}
                        onChange={e => updateSection(ci, si, 'name', e.target.value)}
                        placeholder="A"
                      />
                      <span style={{ fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>Students</span>
                      <input
                        style={{ ...input, width: '90px', textAlign: 'center' }}
                        type="number" min="1" max="200"
                        value={sec.students}
                        onChange={e => updateSection(ci, si, 'students', e.target.value)}
                        placeholder="30"
                      />
                      <button
                        style={{ ...iconBtn, marginLeft: 'auto' }}
                        disabled={cls.sections.length <= 1}
                        onClick={() => removeSection(ci, si)}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  ))}
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                    onClick={() => addSection(ci)}
                  >
                    <Plus style={{ width: '13px', height: '13px' }} /> Add Section
                  </button>
                </div>
              </div>
            ))}

            {/* Teachers */}
            <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users style={{ width: '18px', height: '18px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Teachers to create</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Auto-generated credentials</div>
              </div>
              <input
                style={{ ...input, width: '90px', textAlign: 'center', fontWeight: 600 }}
                type="number" min="0" max="200"
                value={teacherCount}
                onChange={e => setTeacherCount(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div style={{ ...card, padding: '20px', position: 'sticky', top: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {summaryRows.map(({ label, val, icon: Icon, c }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon style={{ width: '14px', height: '14px', color: c, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{val.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#eef2ff', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#3730a3' }}>Total accounts</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>{(totalStudents * 2 + tc).toLocaleString()}</span>
          </div>

          <button style={{ ...btnPrimary, width: '100%' }} onClick={handleSubmit} disabled={loading || classes.length === 0}>
            {loading
              ? <><span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Creating…</>
              : <><Database style={{ width: '16px', height: '16px' }} />Create All Data</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
