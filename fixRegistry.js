const fs = require('fs');
const file = 'c:/Users/nessi/Desktop/kiddo_shadow/adminpanel/src/pages/SchoolAdmin/SchoolRegistry.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `<span className="sr-info-grid__value sr-info-grid__value--upper">{selectedStudent.blood_group || '—'}</span>
                  </div>`;
const replace1 = `<span className="sr-info-grid__value sr-info-grid__value--upper">{selectedStudent.blood_group || '—'}</span>
                  </div>
                  <div className="sr-info-grid__item">
                    <span className="sr-info-grid__label">RESIDENTIAL</span>
                    <span className="sr-info-grid__value sr-info-grid__value--capitalize">{selectedStudent.residential_status || 'Day Scholar'}</span>
                  </div>`;

const target2 = `<span className="sr-info-grid__value">{selectedStudent.family.guardian_phone || '—'}</span>
                    </div>`;
const replace2 = `<span className="sr-info-grid__value">{selectedStudent.family.guardian_phone || '—'}</span>
                    </div>
                    <div className="sr-info-grid__item" style={{ paddingTop: 10, borderTop: '1px solid var(--sr-slate-100)' }}>
                      <span className="sr-info-grid__label">EMERGENCY</span>
                      <span className="sr-info-grid__value">{selectedStudent.emergency_contact || '—'}</span>
                    </div>`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);

fs.writeFileSync(file, content);
console.log('Done');
