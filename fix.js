const fs = require('fs');
const file = 'adminpanel/src/pages/SchoolAdmin/SchoolRegistry.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Parents Tab & State
content = content.replace(/const \[parents, setParents\] = useState\(\[\]\);\r?\n\s*const \[parentsLoading, setParentsLoading\] = useState\(false\);\r?\n/, '');
content = content.replace(/const \[selectedParent, setSelectedParent\] = useState\(null\);\r?\n/, '');
content = content.replace(/\/\/ Lazy load parents when tab is clicked[\s\S]*?loadParents\(\);\r?\n  \}, \[activeMainTab\]\);\r?\n/m, '');

// 2. Remove cross-link helpers
content = content.replace(/\/\/ Cross-link helpers: navigate between student ↔ parent drawers[\s\S]*?const openStudentFromParent = async \(parentRecord\) => \{[\s\S]*?showToast\('Failed to load student profile', 'error'\);\r?\n    \}\r?\n  \};\r?\n/m, '');

// 3. Update Parents Tab Button
content = content.replace(/<div\r?\n\s*onClick=\{\(\) => setActiveMainTab\('parents'\)\}[\s\S]*?Parents \(\{data\.total_parents_count \|\| 0\}\)\r?\n\s*<\/div>/m, '');
content = content.replace(/<div className=\"sr-stat-chip\">\r?\n\s*<div className=\"sr-stat-chip__icon sr-stat-chip__icon--amber\">\r?\n\s*<Users style=\{\{ width: 18, height: 18 \}\} \/>\r?\n\s*<\/div>\r?\n\s*<div>\r?\n\s*<div className=\"sr-stat-chip__value\">\{data\.total_parents_count \|\| 0\}<\/div>\r?\n\s*<div className=\"sr-stat-chip__label\">Parents<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>/m, '');

// 4. Update the student drawer to show Family instead of parents
const parentMapRegex = /\{selectedStudent\.parents\?\.length === 0 \? \([\s\S]*?\}\)\r?\n\s*\)\}/m;
const newFamilyJsx = `
                {!selectedStudent.family ? (
                  <p className=\"sr-empty\" style={{ padding: '16px 0' }}>No family details recorded.</p>
                ) : (
                  <div className=\"sr-contact-box\">
                    <div className=\"sr-info-grid__item\">
                      <span className=\"sr-info-grid__label\">FATHER</span>
                      <span className=\"sr-info-grid__value\">{selectedStudent.family.father_name || '—'}</span>
                    </div>
                    <div className=\"sr-info-grid__item\">
                      <span className=\"sr-info-grid__label\">MOTHER</span>
                      <span className=\"sr-info-grid__value\">{selectedStudent.family.mother_name || '—'}</span>
                    </div>
                    <div className=\"sr-info-grid__item\" style={{ paddingTop: 10, borderTop: '1px solid var(--sr-slate-100)' }}>
                      <span className=\"sr-info-grid__label\">GUARDIAN PHONE</span>
                      <span className=\"sr-info-grid__value\">{selectedStudent.family.guardian_phone || '—'}</span>
                    </div>
                  </div>
                )}
`;
content = content.replace(parentMapRegex, newFamilyJsx.trim());
content = content.replace(/<h4 className=\"sr-drawer-section__title\">Linked Parents<\/h4>/, '<h4 className=\"sr-drawer-section__title\">Family Details</h4>');

// 5. Remove Parent drawer
content = content.replace(/\{\/\* 3\. Parent Detail Drawer \*\/\}\r?\n\s*\{selectedParent && \([\s\S]*?\}\)\r?\n/m, '');

// 6. Remove Parents Tab content
content = content.replace(/\{\/\* ── 3\. ALL PARENTS DIRECTORY TAB ── \*\/\}\r?\n\s*\{activeMainTab === 'parents' && \([\s\S]*?\}\)\r?\n\s*\)\}\r?\n/m, '');

fs.writeFileSync(file, content);
console.log('Updated SchoolRegistry.jsx');
