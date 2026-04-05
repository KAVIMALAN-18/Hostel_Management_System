const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notice = require('../models/Notice');

/**
 * Helper to draw a simple table in PDFKit
 */
const drawTable = (doc, title, headers, rows, colWidths) => {
    doc.addPage();
    // Section Header
    doc.rect(50, 45, 500, 30).fill('#eff6ff');
    doc.fontSize(16).fillColor('#1e40af').text(title, 60, 52, { underline: false, bold: true });
    doc.moveDown(2);

    const startX = 50;
    let currentY = doc.y + 10;

    // Table Header Background
    doc.rect(startX, currentY - 5, 500, 20).fill('#f1f5f9');

    // Header logic
    doc.fontSize(9).fillColor('#475569');
    headers.forEach((h, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
        doc.text(h.toUpperCase(), x, currentY, { width: colWidths[i] - 10, bold: true });
    });

    currentY += 25;
    doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).strokeColor('#cbd5e1').stroke();

    // Rows
    doc.fillColor('#1e293b');
    rows.forEach((row, rowIndex) => {
        if (currentY > 700) {
            doc.addPage();
            currentY = 50;
            // Repeat headers on new page
            doc.rect(startX, currentY - 5, 500, 20).fill('#f1f5f9');
            headers.forEach((h, i) => {
                const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
                doc.fontSize(9).fillColor('#475569').text(h.toUpperCase(), x, currentY, { width: colWidths[i] - 10, bold: true });
            });
            currentY += 25;
            doc.moveTo(startX, currentY - 5).lineTo(550, currentY - 5).strokeColor('#cbd5e1').stroke();
        }

        // Zebra striping
        if (rowIndex % 2 === 0) {
            doc.rect(startX, currentY - 5, 500, 20).fill('#f8fafc');
        }

        doc.fillColor('#1e293b');
        row.forEach((cell, i) => {
            const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5;
            doc.fontSize(8).text(String(cell || '-'), x, currentY, { width: colWidths[i] - 10, height: 20, ellipsis: true });
        });
        currentY += 20;
    });

    return currentY;
};

/**
 * Export Controller
 * Generates highly structured multi-domain PDF/Excel reports
 */
exports.exportMonthlyReport = async (req, res) => {
    try {
        const { format = 'pdf', month } = req.query;
        const targetMonth = month ? new Date(month) : new Date();
        const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

        // Fetch comprehensive data
        const [students, attendance, leaves, allComplaints, wardens, notices] = await Promise.all([
            Student.find().populate('room', 'roomNumber').lean(),
            Attendance.find({ date: { $gte: startOfMonth, $lte: endOfMonth } }).populate('student', 'name email').lean(),
            Leave.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate('student', 'name email').lean(),
            Complaint.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).populate('student', 'name').lean(),
            User.find({ role: 'warden' }).lean(),
            Notice.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }).lean()
        ]);

        const maintenance = allComplaints.filter(c => 
            ['Electrical', 'Plumbing', 'Furniture', 'Maintenance'].includes(c.category)
        );

        const newEntries = students.filter(s => 
            s.createdAt >= startOfMonth && s.createdAt <= endOfMonth
        );

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Hostel Management System';
            
            // 1. Students Sheet
            const sSheet = workbook.addWorksheet('Students');
            sSheet.columns = [
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Room', key: 'room', width: 10 },
                { header: 'Status', key: 'status', width: 12 }
            ];
            students.forEach(s => sSheet.addRow({
                ...s,
                room: s.room?.roomNumber || 'N/A'
            }));

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Hostel_Report_${targetMonth.getMonth() + 1}.xlsx`);
            await workbook.xlsx.write(res);
            return res.end();
        } else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            res.setHeader('Content-Type', 'application/pdf');
            // Ensure filename is safe and descriptive
            const fileName = `Hostel_Report_${targetMonth.toLocaleString('default', { month: 'long' })}_${targetMonth.getFullYear()}.pdf`;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            
            doc.pipe(res);


            // 1. Cover Page
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1e293b');
            doc.fillColor('#fbbf24').fontSize(36).text('EXECUTIVE REPORT', 50, 250, { align: 'center', characterSpacing: 4, bold: true });
            doc.fillColor('#ffffff').fontSize(16).text('HOSTEL MANAGEMENT SYSTEM AUDIT', { align: 'center', characterSpacing: 1 });
            doc.moveDown(1.5);
            doc.fontSize(12).fillColor('#94a3b8').text(`PERIOD: ${startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}`, { align: 'center' });
            
            doc.moveDown(15);
            doc.fontSize(10).fillColor('#fbbf24').text('OFFICIAL INSTITUTIONAL DOCUMENT • CONFIDENTIAL', { align: 'center' });

            // 2. Summary Dashboard Section
            doc.addPage();
            doc.rect(50, 45, 500, 30).fill('#f1f5f9');
            doc.fontSize(18).fillColor('#1e40af').text('System Statistics Overview', 60, 52, { bold: true });
            doc.moveDown(2);
            
            const stats = [
                ['Total Residents', students.length],
                ['Active Staff (Wardens)', wardens.length],
                ['Monthly Attendance Logs', attendance.length],
                ['New Student Admissions', newEntries.length],
                ['Maintenance Tickets', maintenance.length],
                ['Leave Requests Processed', leaves.length],
                ['Administrative Notices', notices.length]
            ];

            let statY = doc.y + 20;
            stats.forEach(([label, value]) => {
                doc.rect(50, statY - 10, 500, 25).fill(statY % 50 === 0 ? '#f8fafc' : '#ffffff');
                doc.fontSize(11).fillColor('#475569').text(`${label}:`, 70, statY);
                doc.fontSize(11).fillColor('#1e293b').text(`${value}`, 400, statY, { bold: true });
                statY += 30;
            });

            // 3. Tabulated Sections
            // Section: Students
            drawTable(doc, 'Resident Registry', 
                ['Name', 'Email', 'Room', 'Status'], 
                students.map(s => [s.name, s.email, s.room?.roomNumber || 'N/A', s.status]),
                [150, 180, 80, 90]
            );

            // Section: Wardens
            drawTable(doc, 'Staff Directory (Wardens)', 
                ['Name', 'Email', 'Assigned Hostel', 'Floor'], 
                wardens.map(w => [w.name, w.email, w.assignedHostel || 'N/A', w.assignedFloor || 'N/A']),
                [140, 180, 100, 80]
            );

            // Section: Attendance
            drawTable(doc, 'Morning Census Log (Current Month)', 
                ['Date', 'Student', 'Status', 'Remarks'], 
                attendance.slice(0, 50).map(a => [new Date(a.date).toLocaleDateString(), a.student?.name || 'N/A', a.status, a.remarks || 'None']),
                [100, 150, 80, 170]
            );
            if (attendance.length > 50) {
                doc.fontSize(9).fillColor('#64748b').text(`* Only first 50 records shown for clarity. Review digital logs for full ${attendance.length} entries.`, 50, doc.y + 10);
            }

            // Section: Leave
            drawTable(doc, 'Leave & Absence Registry', 
                ['Student', 'Start Date', 'End Date', 'Status'], 
                leaves.map(l => [l.student?.name || 'N/A', new Date(l.startDate).toLocaleDateString(), new Date(l.endDate).toLocaleDateString(), l.status]),
                [150, 110, 110, 130]
            );

            // Section: Maintenance
            drawTable(doc, 'Technical Maintenance Logs', 
                ['Title', 'Category', 'Status', 'Reported By'], 
                maintenance.map(m => [m.title, m.category, m.status, m.student?.name || 'N/A']),
                [170, 100, 100, 130]
            );

            // Section: Notices
            drawTable(doc, 'Administrative Announcements', 
                ['Date', 'Title', 'Priority', 'Target'], 
                notices.map(n => [new Date(n.createdAt).toLocaleDateString(), n.title, n.priority, n.hostel]),
                [100, 200, 100, 100]
            );

            // Finalizing with Page Numbers
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#94a3b8').text(`HMS EXECUTIVE AUDIT | Page ${i + 1} of ${range.count} | Generated on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 40, { align: 'center' });
            }

            doc.end();
        }
    } catch (error) {
        console.error('Export Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to generate comprehensive report' });
        }
    }
};
