const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Complaint = require('../models/Complaint');

/**
 * Export Controller
 * Generates highly structured multi-domain PDF/Excel reports
 */
exports.exportMonthlyReport = async (req, res) => {
    try {
        const { format = 'excel', month } = req.query;
        const targetMonth = month ? new Date(month) : new Date();
        const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

        // Fetch comprehensive data
        const students = await Student.find().populate('room', 'roomNumber').lean();
        const attendance = await Attendance.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('student', 'name email').lean();
        
        const leaves = await Leave.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('student', 'name email').lean();

        const allComplaints = await Complaint.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('student', 'name').lean();

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
                { header: 'ID', key: '_id', width: 25 },
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Room', key: 'room', width: 10 },
                { header: 'Status', key: 'status', width: 12 }
            ];
            students.forEach(s => sSheet.addRow({
                ...s,
                room: s.room?.roomNumber || 'N/A'
            }));

            // 2. Attendance Sheet
            const aSheet = workbook.addWorksheet('Attendance');
            aSheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Student', key: 'student', width: 25 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Remarks', key: 'remarks', width: 30 }
            ];
            attendance.forEach(a => aSheet.addRow({
                date: new Date(a.date).toLocaleDateString(),
                student: a.student?.name || 'Unknown',
                status: a.status,
                remarks: a.remarks || '-'
            }));

            // 3. Complaints & Maintenance
            const cSheet = workbook.addWorksheet('Complaints');
            cSheet.columns = [
                { header: 'Type', key: 'type', width: 15 },
                { header: 'Title', key: 'title', width: 30 },
                { header: 'Student', key: 'student', width: 20 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Created', key: 'date', width: 15 }
            ];
            allComplaints.forEach(c => cSheet.addRow({
                type: maintenance.includes(c) ? 'Maintenance' : 'General',
                title: c.title,
                student: c.student?.name || 'N/A',
                status: c.status,
                date: new Date(c.createdAt).toLocaleDateString()
            }));

            // 4. Leaves Sheet
            const lSheet = workbook.addWorksheet('Leaves');
            lSheet.columns = [
                { header: 'Student', key: 'student', width: 20 },
                { header: 'From', key: 'from', width: 15 },
                { header: 'To', key: 'to', width: 15 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Reason', key: 'reason', width: 30 }
            ];
            leaves.forEach(l => lSheet.addRow({
                student: l.student?.name || 'N/A',
                from: new Date(l.startDate).toLocaleDateString(),
                to: new Date(l.endDate).toLocaleDateString(),
                status: l.status,
                reason: l.reason
            }));

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Hostel_Report_${month || 'Current'}.xlsx`);
            await workbook.xlsx.write(res);
            return res.end();

        } else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Hostel_Report_${month || 'Current'}.pdf`);
            doc.pipe(res);

            // Title
            doc.fontSize(25).text('Hostel Management Monthly Report', { align: 'center' });
            doc.fontSize(12).text(`Report Period: ${startOfMonth.toLocaleDateString()} - ${endOfMonth.toLocaleDateString()}`, { align: 'center' });
            doc.moveDown(2);

            // Summary Section
            doc.fontSize(18).text('System Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12)
               .text(`- Total Active Students: ${students.length}`)
               .text(`- Attendance Entries this month: ${attendance.length}`)
               .text(`- Total Complaints Logged: ${allComplaints.length}`)
               .text(`- Technical Maintenance Issues: ${maintenance.length}`)
               .text(`- Leave Requests Processed: ${leaves.length}`)
               .text(`- New Student Admissions: ${newEntries.length}`);
            
            doc.moveDown(2);

            // Section 1: Students
            doc.fontSize(16).text('Registered Students (Recent)', { color: '#2563eb' });
            doc.moveDown(0.5);
            students.slice(0, 15).forEach((s, i) => {
                doc.fontSize(10).text(`${i+1}. ${s.name} | Room: ${s.room?.roomNumber || 'N/A'} | Status: ${s.status}`);
            });
            if (students.length > 15) doc.text(`... and ${students.length - 15} more in Excel version.`);

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).text('Generated by Hostel Management System - Confidential', 50, doc.page.height - 50, { align: 'center' });
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
