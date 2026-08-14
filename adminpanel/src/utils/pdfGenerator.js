import jsPDF from 'jspdf';
import { formatDate } from './date';

/**
 * Generate PDF with all credentials from bulk create response
 */
export function generateBulkCredentialsPDF(summary) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('School — Login Credentials', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on ${formatDate(new Date())} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setTextColor(0);

  // Summary section
  if (summary.summary) {
    y += 5;
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const s = summary.summary;
    if (s.classes_created != null) { doc.text(`Classes Created: ${s.classes_created}`, 14, y); y += 5; }
    if (s.sections_created != null) { doc.text(`Sections Created: ${s.sections_created}`, 14, y); y += 5; }
    if (s.students_created != null) { doc.text(`Students Created: ${s.students_created}`, 14, y); y += 5; }
    if (s.teachers_created != null) { doc.text(`Teachers Created: ${s.teachers_created}`, 14, y); y += 5; }

  }

  // Helper: check page break
  const checkPage = (needed = 15) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Teachers section
  if (summary.teachers && summary.teachers.length > 0) {
    y += 8;
    checkPage(30);
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Teacher Credentials', 14, y);
    y += 8;

    // Table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
    doc.text('Employee ID', 16, y);
    doc.text('Username', 70, y);
    doc.text('Password', 130, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    summary.teachers.forEach((t) => {
      checkPage();
      doc.text(t.employee_id || '—', 16, y);
      doc.text(t.username || '—', 70, y);
      doc.text(t.password_hint || `${t.username}@123`, 130, y);
      y += 6;
    });
  }

  // Students section (grouped by class/section)
  if (summary.students && summary.students.length > 0) {
    y += 8;
    checkPage(30);
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Credentials', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
    doc.text('Class', 16, y);
    doc.text('Section', 50, y);
    doc.text('Roll No', 80, y);
    doc.text('Username', 110, y);
    doc.text('Password', 155, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    summary.students.forEach((s) => {
      checkPage();
      doc.text(s.class_name || '—', 16, y);
      doc.text(s.section_name || '—', 50, y);
      doc.text(String(s.roll_no || '—'), 80, y);
      doc.text(s.username || '—', 110, y);
      doc.text(s.password_hint || `${s.username}@123`, 155, y);
      y += 6;
    });
  }


  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.text('CONFIDENTIAL — Do not share publicly', pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    doc.setTextColor(0);
  }

  doc.save('credentials.pdf');
}

/**
 * Generate PDF for a single credential
 */
export function generateSingleCredentialPDF(username, passwordHint, role) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('School — Login Credential', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth / 2, 38, { align: 'center' });
  doc.setTextColor(0);

  // Credential box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(30, 50, pageWidth - 60, 45, 5, 5, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Role:', 40, 63);
  doc.text('Username:', 40, 73);
  doc.text('Password:', 40, 83);

  doc.setFont('helvetica', 'normal');
  doc.text(role || '—', 90, 63);
  doc.text(username || '—', 90, 73);
  doc.text(passwordHint || `${username}@123`, 90, 83);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Please change your password after first login.', pageWidth / 2, 108, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('CONFIDENTIAL', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`credential-${username}.pdf`);
}

/**
 * Generate PDF from login roster data
 */
export function generateRosterPDF(data, filterLabel = '') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Login Roster', pageWidth / 2, y, { align: 'center' });
  y += 8;

  if (filterLabel) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(filterLabel, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0);
  }
  y += 10;

  const checkPage = (needed = 12) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Teachers
  if (data.teachers && data.teachers.length > 0) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Teachers', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
    doc.text('Username', 16, y);
    doc.text('Password', 70, y);
    doc.text('Name', 115, y);
    doc.text('Employee ID', 170, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    data.teachers.forEach((t) => {
      checkPage();
      const username = t.user?.username || t.username || '';
      doc.text(username || '—', 16, y);
      doc.text(username ? `${username}@123` : '—', 70, y);
      doc.text(t.user?.name || t.name || '—', 115, y);
      doc.text(t.employee_id || '—', 170, y);
      y += 6;
    });
    y += 5;
  }

  // Students by class
  if (data.classes && data.classes.length > 0) {
    data.classes.forEach((cls) => {
      checkPage(20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cls.class_name}`, 14, y);
      y += 7;

      if (cls.sections) {
        cls.sections.forEach((sec) => {
          checkPage(15);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Section ${sec.name}`, 20, y);
          y += 6;

          if (sec.students && sec.students.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(245, 245, 245);
            doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
            doc.text('Roll', 16, y);
            doc.text('Username', 28, y);
            doc.text('Password', 72, y);
            doc.text('Name', 116, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            sec.students.forEach((s) => {
              checkPage();
              const username = s.user?.username || s.username || '';
              doc.text(String(s.roll_no || '—'), 16, y);
              doc.text(username || '—', 28, y);
              doc.text(username ? `${username}@123` : '—', 72, y);
              doc.text((s.user?.name || s.name || '—').substring(0, 18), 116, y);
              y += 6;
            });
          }
          y += 3;
        });
      }
      y += 5;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    doc.setTextColor(0);
  }

  doc.save('login-roster.pdf');
}

/**
 * Generate PDF for Class Timetable (Landscape School Circular format)
 */
export function generateClassTimetablePDF({
  schoolName = 'School Management System',
  className = '',
  sectionName = '',
  academicYear = '',
  timetable = {},
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 269mm
  let y = 14;

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // 1. School Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61); // #14213D
  doc.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 6;

  // 2. Subtitle / Document Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 111, 94); // Signature Teal #2F6F5E
  const fullClassTitle = `CLASS TIMETABLE — CLASS ${className.toUpperCase()}${sectionName ? ` (SECTION ${sectionName.toUpperCase()})` : ''}`;
  doc.text(fullClassTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // 3. Info metadata bar
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 96, 125);
  const metaText = `Academic Year: ${academicYear || 'Current Year'}   |   Effective From: Term Schedule   |   Generated: ${formatDate(new Date())} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(metaText, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Decorative double line
  doc.setDrawColor(47, 111, 94);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // 4. Determine columns & periods
  // Find max period slots across all days
  let maxPeriods = 0;
  DAYS.forEach((d) => {
    const pCount = timetable[d]?.length || 0;
    if (pCount > maxPeriods) maxPeriods = pCount;
  });
  if (maxPeriods === 0) maxPeriods = 7; // default minimum period columns

  const dayColWidth = 26;
  const periodColWidth = (contentWidth - dayColWidth) / maxPeriods;
  const headerHeight = 9;
  const rowHeight = 16;

  // Table Header Row
  doc.setFillColor(47, 111, 94);
  doc.rect(margin, y, contentWidth, headerHeight, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DAY / PERIOD', margin + dayColWidth / 2, y + 5.5, { align: 'center' });

  for (let i = 0; i < maxPeriods; i++) {
    const colX = margin + dayColWidth + i * periodColWidth;
    doc.text(`Period ${i + 1}`, colX + periodColWidth / 2, y + 5.5, { align: 'center' });
  }
  y += headerHeight;

  // Collect subjects & teachers for legend table
  const subjectFacultyMap = {};

  // Table Data Rows (Monday - Saturday)
  DAYS.forEach((day, dayIndex) => {
    const dayEntries = timetable[day] || [];
    const rowY = y + dayIndex * rowHeight;

    // Alternating day background
    doc.setFillColor(dayIndex % 2 === 0 ? 255 : 250, dayIndex % 2 === 0 ? 255 : 250, dayIndex % 2 === 0 ? 255 : 248);
    doc.rect(margin, rowY, contentWidth, rowHeight, 'F');

    // Grid outer & cell borders
    doc.setDrawColor(228, 225, 216); // #E4E1D8
    doc.setLineWidth(0.2);
    doc.rect(margin, rowY, contentWidth, rowHeight, 'S');

    // Day Header Cell
    doc.setFillColor(240, 244, 243);
    doc.rect(margin, rowY, dayColWidth, rowHeight, 'F');
    doc.rect(margin, rowY, dayColWidth, rowHeight, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 33, 61);
    doc.text(day.toUpperCase().substring(0, 3), margin + dayColWidth / 2, rowY + 7, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 96, 125);
    doc.text(`${dayEntries.filter((e) => !e.is_break).length} Periods`, margin + dayColWidth / 2, rowY + 11.5, { align: 'center' });

    // Periods in this day
    for (let col = 0; col < maxPeriods; col++) {
      const colX = margin + dayColWidth + col * periodColWidth;
      doc.rect(colX, rowY, periodColWidth, rowHeight, 'S');

      const entry = dayEntries[col];
      if (!entry) {
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text('—', colX + periodColWidth / 2, rowY + 9, { align: 'center' });
        continue;
      }

      if (entry.is_break) {
        // Break cell
        doc.setFillColor(255, 251, 235); // #FFFBEB
        doc.rect(colX + 0.2, rowY + 0.2, periodColWidth - 0.4, rowHeight - 0.4, 'F');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(184, 134, 11);
        const breakTitle = (entry.title || 'RECESS / LUNCH').toUpperCase();
        doc.text(breakTitle.length > 14 ? breakTitle.substring(0, 12) + '...' : breakTitle, colX + periodColWidth / 2, rowY + 7, { align: 'center' });

        if (entry.start_time && entry.end_time) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(140, 151, 171);
          doc.text(`${entry.start_time.substring(0, 5)}-${entry.end_time.substring(0, 5)}`, colX + periodColWidth / 2, rowY + 11.5, { align: 'center' });
        }
      } else {
        // Regular Period cell
        const subName = entry.subject_name || entry.subject?.name || 'Subject';
        const teacherName = entry.teacher_name || entry.teacher?.name || '';

        // Record for legend
        if (subName) {
          if (!subjectFacultyMap[subName]) {
            subjectFacultyMap[subName] = { teacher: teacherName, count: 1 };
          } else {
            subjectFacultyMap[subName].count += 1;
            if (!subjectFacultyMap[subName].teacher && teacherName) {
              subjectFacultyMap[subName].teacher = teacherName;
            }
          }
        }

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 33, 61);
        const truncatedSub = subName.length > 15 ? subName.substring(0, 13) + '..' : subName;
        doc.text(truncatedSub, colX + periodColWidth / 2, rowY + 5.5, { align: 'center' });

        if (teacherName) {
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(47, 111, 94);
          const truncatedTeacher = teacherName.length > 17 ? teacherName.substring(0, 15) + '..' : teacherName;
          doc.text(truncatedTeacher, colX + periodColWidth / 2, rowY + 9.5, { align: 'center' });
        }

        if (entry.start_time && entry.end_time) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(140, 151, 171);
          doc.text(`${entry.start_time.substring(0, 5)} - ${entry.end_time.substring(0, 5)}`, colX + periodColWidth / 2, rowY + 13.5, { align: 'center' });
        }
      }
    }
  });

  y += DAYS.length * rowHeight + 5;

  // 5. Subject & Faculty Legend (bottom left)
  const subjectsList = Object.entries(subjectFacultyMap);
  if (subjectsList.length > 0 && y < pageHeight - 35) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 33, 61);
    doc.text('SUBJECT ALLOCATION & FACULTY LEGEND:', margin, y);
    y += 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const cols = 3;
    const colW = contentWidth / cols;
    subjectsList.slice(0, 9).forEach(([sub, data], sIdx) => {
      const c = sIdx % cols;
      const r = Math.floor(sIdx / cols);
      const itemX = margin + c * colW;
      const itemY = y + r * 4.5;
      doc.setTextColor(20, 33, 61);
      doc.text(`• ${sub}:`, itemX, itemY);
      doc.setTextColor(47, 111, 94);
      doc.text(`${data.teacher || 'Unassigned'} (${data.count} p/wk)`, itemX + 32, itemY);
    });
  }

  // 6. Signatures Box (bottom)
  const sigY = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  // 3 signature lines
  const sigWidth = 60;
  // Class Teacher
  doc.line(margin + 10, sigY, margin + 10 + sigWidth, sigY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(82, 96, 125);
  doc.text('Class Teacher Signature', margin + 10 + sigWidth / 2, sigY + 4, { align: 'center' });

  // Timetable Coordinator
  const midX = pageWidth / 2 - sigWidth / 2;
  doc.line(midX, sigY, midX + sigWidth, sigY);
  doc.text('Timetable Coordinator', midX + sigWidth / 2, sigY + 4, { align: 'center' });

  // Principal
  const rightX = pageWidth - margin - 10 - sigWidth;
  doc.line(rightX, sigY, rightX + sigWidth, sigY);
  doc.text('Principal / School Head', rightX + sigWidth / 2, sigY + 4, { align: 'center' });

  // Footer note
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Official Class Timetable Circular · School ERP System · Display on Classroom Notice Board', pageWidth / 2, pageHeight - 6, { align: 'center' });

  const fileName = `Timetable-Class-${className || 'Schedule'}${sectionName ? `-${sectionName}` : ''}.pdf`;
  doc.save(fileName);
}

/**
 * Generate PDF for Daily Substitution Circular (School Notice / Circular format)
 */
export function generateSubstitutionCircularPDF({
  schoolName = 'School Management System',
  date = new Date().toISOString().slice(0, 10),
  dayOfWeek = '',
  substitutions = [],
  absentTeacherName = '',
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = 14;

  const checkPage = (needed = 15) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 15;
      renderTableHeader();
    }
  };

  // 1. School Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 6;

  // 2. Circular Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 111, 94);
  doc.text('FACULTY DAILY SUBSTITUTION & DUTY CIRCULAR', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 96, 125);
  doc.text('DAILY ARRANGEMENT & CLASSROOM COVERAGE NOTICE', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // 3. Circular Details Banner
  doc.setFillColor(234, 243, 240); // #EAF3F0
  doc.setDrawColor(47, 111, 94);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61);
  const formattedD = formatDate(date);
  const dayStr = dayOfWeek ? ` (${dayOfWeek.toUpperCase()})` : '';
  doc.text(`Date of Arrangement: ${formattedD}${dayStr}`, margin + 4, y + 5.5);
  doc.text(`Total Substitutions: ${substitutions.length} Period(s)`, margin + contentWidth - 4, y + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(82, 96, 125);
  if (absentTeacherName) {
    doc.text(`Coverage for Absent Faculty: ${absentTeacherName}`, margin + 4, y + 10.5);
  } else {
    doc.text('Notice to all Staff: Please check your allocated substitution periods below.', margin + 4, y + 10.5);
  }
  y += 18;

  // Table Column Definitions
  const cols = [
    { name: 'S.No', width: 12, align: 'center' },
    { name: 'Period & Time', width: 32, align: 'left' },
    { name: 'Class & Sec', width: 26, align: 'center' },
    { name: 'Absent Faculty', width: 38, align: 'left' },
    { name: 'Subject', width: 30, align: 'left' },
    { name: 'Substitute Faculty', width: 32, align: 'left' },
    { name: 'Initial', width: 12, align: 'center' },
  ];

  const renderTableHeader = () => {
    doc.setFillColor(47, 111, 94);
    doc.rect(margin, y, contentWidth, 7.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    let curX = margin;
    cols.forEach((col) => {
      if (col.align === 'center') {
        doc.text(col.name, curX + col.width / 2, y + 5, { align: 'center' });
      } else {
        doc.text(col.name, curX + 2, y + 5);
      }
      curX += col.width;
    });
    y += 7.5;
  };

  renderTableHeader();

  // Table Data Rows
  if (substitutions.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140, 151, 171);
    doc.rect(margin, y, contentWidth, 16, 'S');
    doc.text('No substitutions recorded for today. Regular timetable in effect.', pageWidth / 2, y + 10, { align: 'center' });
    y += 20;
  } else {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    substitutions.forEach((item, idx) => {
      checkPage(9);

      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 250, isEven ? 255 : 248);
      doc.rect(margin, y, contentWidth, 8, 'F');

      doc.setDrawColor(228, 225, 216);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 8, 'S');

      let curX = margin;

      // Extract fields from various API formats
      const pTime = item.time_slot || (item.start_time && item.end_time ? `${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}` : item.timetable?.start_time ? `${item.timetable.start_time.substring(0, 5)} - ${item.timetable.end_time.substring(0, 5)}` : 'Period Slot');
      const pClass = item.class_name ? `Class ${item.class_name} (${item.section_name || 'A'})` : item.Timetable?.Class ? `Class ${item.Timetable.Class.class_name} (${item.Timetable.Section?.name || 'A'})` : '—';
      const origTeacher = item.original_teacher_name || item.OriginalTeacher?.User?.name || item.original_teacher?.user?.name || absentTeacherName || '—';
      const subSubject = item.subject_name || item.Timetable?.TeacherAssignment?.Subject?.name || item.subject || '—';
      const substituteTeacher = item.substitute_teacher_name || item.SubstituteTeacher?.User?.name || item.substitute_teacher?.user?.name || item.substitute_name || 'Assigned Staff';

      // 1. S.No
      doc.setTextColor(82, 96, 125);
      doc.text(String(idx + 1), curX + cols[0].width / 2, y + 5.5, { align: 'center' });
      curX += cols[0].width;

      // 2. Period & Time
      doc.setTextColor(20, 33, 61);
      doc.text(pTime.substring(0, 19), curX + 2, y + 5.5);
      curX += cols[1].width;

      // 3. Class & Sec
      doc.text(pClass.substring(0, 16), curX + cols[2].width / 2, y + 5.5, { align: 'center' });
      curX += cols[2].width;

      // 4. Absent Faculty
      doc.setTextColor(176, 64, 58); // soft red #B0403A
      doc.text(origTeacher.substring(0, 22), curX + 2, y + 5.5);
      curX += cols[3].width;

      // 5. Subject
      doc.setTextColor(20, 33, 61);
      doc.text(subSubject.substring(0, 18), curX + 2, y + 5.5);
      curX += cols[4].width;

      // 6. Substitute Faculty
      doc.setTextColor(47, 111, 94); // Teal
      doc.setFont('helvetica', 'bold');
      doc.text(substituteTeacher.substring(0, 20), curX + 2, y + 5.5);
      doc.setFont('helvetica', 'normal');
      curX += cols[5].width;

      // 7. Initial Box
      doc.rect(curX + 2, y + 1.5, cols[6].width - 4, 5, 'S');
      curX += cols[6].width;

      y += 8;
    });
    y += 6;
  }

  // 4. Instructions for Faculty
  checkPage(35);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61);
  doc.text('GENERAL INSTRUCTIONS FOR SUBSTITUTION DUTY:', margin, y);
  y += 4.5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 96, 125);
  doc.text('1. Substitute teachers are requested to report to the allotted classroom promptly on the first bell.', margin + 2, y);
  y += 4;
  doc.text('2. Please verify and mark student attendance and ensure classroom decorum & curriculum discipline.', margin + 2, y);
  y += 4;
  doc.text('3. In case of any conflict, leave application, or urgent school duty, immediately notify the Timetable In-charge.', margin + 2, y);
  y += 8;

  // 5. Official Signatures
  checkPage(25);
  const sigY = y + 12;
  const sigWidth = 48;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);

  // In-charge
  doc.line(margin + 5, sigY, margin + 5 + sigWidth, sigY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(82, 96, 125);
  doc.text('Timetable In-charge', margin + 5 + sigWidth / 2, sigY + 4, { align: 'center' });

  // Vice Principal
  const midX = pageWidth / 2 - sigWidth / 2;
  doc.line(midX, sigY, midX + sigWidth, sigY);
  doc.text('Vice Principal / Dean', midX + sigWidth / 2, sigY + 4, { align: 'center' });

  // Principal
  const rightX = pageWidth - margin - 5 - sigWidth;
  doc.line(rightX, sigY, rightX + sigWidth, sigY);
  doc.text('Principal', rightX + sigWidth / 2, sigY + 4, { align: 'center' });

  // 6. Page Numbers & Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Official Substitution Circular · Page ${i} of ${totalPages} · Staff Room & Administrative Record Copy`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  const fileName = `Substitution-Circular-${date}.pdf`;
  doc.save(fileName);
}

/**
 * Generate PDF for Question Paper (Examination Circular / Test Printout)
 */
export function generateQuestionPaperPDF({
  schoolName = 'School Management System',
  paperData = {},
  includeAnswers = false,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = 14;

  const checkPage = (needed = 15) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
  };

  // 1. School & Examination Header
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5.5;

  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 111, 94);
  const examTitle = paperData.title || paperData.exam_name || 'TERM ASSESSMENT QUESTION PAPER';
  doc.text(examTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Metadata row (Board, Grade, Subject, Duration, Marks)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 33, 61);

  const leftMeta = `${paperData.board || 'CBSE'} | ${paperData.grade || 'Grade 10'} | Subject: ${paperData.subject || 'General'}`;
  const rightMeta = `Time: ${paperData.duration_mins || 60} Mins | Max Marks: ${paperData.total_marks || 50}`;

  doc.text(leftMeta, margin, y);
  doc.text(rightMeta, pageWidth - margin, y, { align: 'right' });
  y += 3;

  doc.setDrawColor(20, 33, 61);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // 2. Instructions Box
  if (paperData.instructions && paperData.instructions.length > 0) {
    doc.setFillColor(250, 250, 248);
    doc.setDrawColor(228, 225, 216);
    doc.setLineWidth(0.2);

    const instLines = paperData.instructions.map((inst, i) => `${i + 1}. ${inst}`);
    const boxHeight = 6 + instLines.length * 4;
    doc.rect(margin, y, contentWidth, boxHeight, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(82, 96, 125);
    doc.text('GENERAL INSTRUCTIONS:', margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    instLines.forEach((line, idx) => {
      doc.text(line, margin + 4, y + 8.5 + idx * 4);
    });
    y += boxHeight + 6;
  }

  // 3. Sections & Questions
  const sections = paperData.sections || [];
  sections.forEach((sec, sIdx) => {
    checkPage(20);

    // Section Title Banner
    doc.setFillColor(234, 243, 240); // #EAF3F0
    doc.setDrawColor(47, 111, 94);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 6.5, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(47, 111, 94);
    const secLabel = sec.section_name || `Section ${String.fromCharCode(65 + sIdx)}`;
    const marksPerQ = sec.marks_per_question ? ` (${sec.marks_per_question} Mark each)` : '';
    doc.text(`${secLabel}${marksPerQ}`, margin + 3, y + 4.5);
    y += 9;

    // Questions in this section
    const questions = sec.questions || [];
    questions.forEach((q, qIdx) => {
      checkPage(16);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 33, 61);

      const qNum = q.q_no || qIdx + 1;
      const qText = `Q${qNum}. ${q.question_text || ''}`;
      const marksText = `[${q.marks || sec.marks_per_question || 1}]`;

      // Split question text to wrap within printable width (reserving space for marks on the right)
      const maxTextWidth = contentWidth - 16;
      const wrappedQ = doc.splitTextToSize(qText, maxTextWidth);

      doc.text(wrappedQ, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(82, 96, 125);
      doc.text(marksText, pageWidth - margin - 2, y, { align: 'right' });
      y += wrappedQ.length * 4.2;

      // Render Options for MCQ
      if (q.options && Array.isArray(q.options) && q.options.length > 0) {
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');

        const optColWidth = (contentWidth - 8) / 2;
        q.options.forEach((opt, oIdx) => {
          const colX = margin + 6 + (oIdx % 2) * optColWidth;
          const optPrefix = `(${String.fromCharCode(65 + oIdx)}) `;
          doc.text(`${optPrefix}${opt}`, colX, y);
          if (oIdx % 2 === 1 || oIdx === q.options.length - 1) {
            y += 4.2;
          }
        });
      }
      y += 3;
    });
    y += 4;
  });

  // 4. Answer Key & Explanations (if requested or available)
  if (includeAnswers && paperData.answer_key && paperData.answer_key.length > 0) {
    checkPage(30);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(47, 111, 94);
    doc.text('ANSWER KEY & MARKING SCHEME (TEACHER / EVALUATION COPY)', margin, y);
    y += 5.5;

    paperData.answer_key.forEach((ak, aIdx) => {
      checkPage(12);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 33, 61);
      doc.text(`Q${ak.q_no || aIdx + 1}: ${ak.answer || '—'}`, margin + 2, y);
      y += 4;

      if (ak.explanation) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(82, 96, 125);
        const expLines = doc.splitTextToSize(`Explanation: ${ak.explanation}`, contentWidth - 6);
        doc.text(expLines, margin + 4, y);
        y += expLines.length * 3.8;
      }
      y += 2;
    });
  }

  // Footer & Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Examination Question Paper · Page ${i} of ${totalPages} · ${schoolName}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  const safeFilename = `${(paperData.subject || 'Subject')}-Question-Paper-${(paperData.grade || 'Grade').replace(/\s+/g, '-')}.pdf`;
  doc.save(safeFilename);
}


