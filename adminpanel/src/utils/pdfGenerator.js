import jsPDF from 'jspdf';

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
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, y, { align: 'center' });
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
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: 'center' });
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
