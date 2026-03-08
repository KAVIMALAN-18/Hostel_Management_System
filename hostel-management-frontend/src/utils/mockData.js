/**
 * Realistic Mock Data for Hostel Management System
 * Structured for direct React component consumption with unique IDs
 */

const mockData = {
    // 1️⃣ Admin Dashboard
    adminDashboard: {
        totalStudents: 1240,
        totalHostels: 6,
        totalRooms: 450,
        occupancyRate: 88,
        attendanceSummary: {
            present: 1120,
            absent: 45,
            onLeave: 75
        },
        maintenanceSummary: {
            pending: 12,
            inProgress: 8,
            resolved: 145
        }
    },

    // 2️⃣ Student Directory
    studentDirectory: [
        {
            _id: "STU001",
            studentId: "HMS2024001",
            name: "Arjun Venkat",
            hostel: "Alpha Block",
            floor: "2nd Floor",
            roomNumber: "204",
            bedNumber: "A",
            contact: "+91 98765 43210",
            bloodGroup: "O+",
            parentName: "Venkat Raman"
        },
        {
            _id: "STU002",
            studentId: "HMS2024045",
            name: "Priya Sharma",
            hostel: "Beta Block",
            floor: "1st Floor",
            roomNumber: "112",
            bedNumber: "B",
            contact: "+91 91234 56789",
            bloodGroup: "A+",
            parentName: "Rajesh Sharma"
        },
        {
            _id: "STU003",
            studentId: "HMS2024078",
            name: "Rahul Nair",
            hostel: "Alpha Block",
            floor: "3rd Floor",
            roomNumber: "301",
            bedNumber: "C",
            contact: "+91 88776 55443",
            bloodGroup: "B+",
            parentName: "Sivadas Nair"
        },
        {
            _id: "STU004",
            studentId: "HMS2024102",
            name: "Ananya Iyer",
            hostel: "Gamma Block",
            floor: "Ground Floor",
            roomNumber: "G05",
            bedNumber: "A",
            contact: "+91 77665 44332",
            bloodGroup: "AB-",
            parentName: "Subramanian Iyer"
        },
        {
            _id: "STU005",
            studentId: "HMS2024156",
            name: "Siddharth Malhotra",
            hostel: "Delta Block",
            floor: "4th Floor",
            roomNumber: "408",
            bedNumber: "B",
            contact: "+91 99887 76655",
            bloodGroup: "O-",
            parentName: "Karan Malhotra"
        }
    ],

    // 3️⃣ Warden Directory
    wardenDirectory: [
        {
            _id: "WDN001",
            wardenId: "WID001",
            name: "Dr. K. Sundar",
            assignedHostel: "Alpha Block",
            assignedFloor: "All Floors",
            contact: "+91 94440 12345",
            email: "sundar.k@hostel.edu"
        },
        {
            _id: "WDN002",
            wardenId: "WID002",
            name: "Mrs. Lakshmi Devi",
            assignedHostel: "Beta Block",
            assignedFloor: "1st & 2nd",
            contact: "+91 94441 23456",
            email: "lakshmi.d@hostel.edu"
        },
        {
            _id: "WDN003",
            wardenId: "WID003",
            name: "Mr. Robert Wilson",
            assignedHostel: "Gamma Block",
            assignedFloor: "All Floors",
            contact: "+91 94442 34567",
            email: "robert.w@hostel.edu"
        }
    ],

    // 4️⃣ Attendance Summary
    attendance: {
        summary: {
            total: 1240,
            present: 1120,
            absent: 45,
            onLeave: 75
        },
        list: [
            { _id: "ATT001", name: "Arjun Venkat", room: "204", biometricTime: "07:12 AM", status: "Present" },
            { _id: "ATT002", name: "Priya Sharma", room: "112", biometricTime: "07:25 AM", status: "Present" },
            { _id: "ATT003", name: "Rahul Nair", room: "301", biometricTime: "---", status: "Absent" },
            { _id: "ATT004", name: "Ananya Iyer", room: "G05", biometricTime: "07:05 AM", status: "Present" },
            { _id: "ATT005", name: "Siddharth Malhotra", room: "408", biometricTime: "---", status: "Leave" }
        ]
    },

    // 5️⃣ Leave Requests Page
    leaveRequests: [
        {
            _id: "LVE2024001",
            studentName: "Arjun Venkat",
            fromDate: "2026-02-25",
            toDate: "2026-02-28",
            reason: "Personal - Sister's Wedding",
            status: "Pending",
            leavePercentage: "4.2%"
        },
        {
            _id: "LVE2024002",
            studentName: "Siddharth Malhotra",
            fromDate: "2026-02-20",
            toDate: "2026-02-22",
            reason: "Medical - Viral Fever",
            status: "Approved",
            leavePercentage: "8.5%"
        },
        {
            _id: "LVE2024003",
            studentName: "Meera Reddy",
            fromDate: "2026-02-15",
            toDate: "2026-02-15",
            reason: "Other - Passport Appointment",
            status: "Rejected",
            leavePercentage: "1.2%"
        }
    ],

    // 6️⃣ Maintenance Page
    maintenance: [
        {
            _id: "MNT001",
            ticketId: "TKT-10024",
            studentName: "Arjun Venkat",
            room: "204",
            issueType: "Electrical - No Power in Socket",
            priority: "High",
            status: "Pending"
        },
        {
            _id: "MNT002",
            ticketId: "TKT-10018",
            studentName: "Ananya Iyer",
            room: "G05",
            issueType: "Plumbing - Leakage in Tap",
            priority: "Medium",
            status: "In Progress"
        },
        {
            _id: "MNT003",
            ticketId: "TKT-09950",
            studentName: "Rahul Nair",
            room: "301",
            issueType: "Carpentry - Door Lock Repair",
            priority: "Low",
            status: "Resolved"
        }
    ],

    // 7️⃣ Mess Management
    messManagement: {
        menu: {
            date: "2026-02-21",
            breakfast: "Idli, Vada, Sambar, Coconut Chutney, Tea/Coffee",
            lunch: "Steam Rice, Rasam, Beetroot Poriyal, Curd, Appalam",
            snacks: "Onion Samosa, Lemon Tea",
            dinner: "Chapati, Paneer Butter Masala, Fruit Salad"
        },
        feedback: [
            { _id: "FEED001", studentName: "Arjun Venkat", rating: 4, comment: "Breakfast was very fresh today." },
            { _id: "FEED002", studentName: "Priya Sharma", rating: 5, comment: "Lunch rasam was excellent." },
            { _id: "FEED003", studentName: "Karthik Raja", rating: 2, comment: "Snacks were a bit oily." }
        ]
    },

    // 8️⃣ Announcements
    announcements: [
        {
            _id: "ANN001",
            title: "Annual Sports Meet 2026",
            description: "Registration for the annual sports meet is now open at the warden office.",
            date: "2026-03-05",
            priority: "Medium"
        },
        {
            _id: "ANN002",
            title: "Hostel Maintenance Shutdown",
            description: "Power supply will be interrupted between 10 AM to 2 PM this Sunday for maintenance.",
            date: "2026-02-23",
            priority: "High"
        },
        {
            _id: "ANN003",
            title: "New Mess Timing",
            description: "Dinner timings changed to 7:30 PM - 9:30 PM starting tomorrow.",
            date: "2026-02-22",
            priority: "Normal"
        }
    ],

    // 9️⃣ Reports Page
    reports: {
        monthlyAttendanceRate: "92.4%",
        totalLeaves: 145,
        maintenanceCount: 42,
        occupancyRate: "88%",
        monthlyAttendance: [
            { _id: "REP_ATT001", date: '2026-02-21', total: 1240, present: 1120, absent: 45, onLeave: 75, notMarked: 0 },
            { _id: "REP_ATT002", date: '2026-02-20', total: 1240, present: 1135, absent: 35, onLeave: 70, notMarked: 0 },
            { _id: "REP_ATT003", date: '2026-02-19', total: 1240, present: 1105, absent: 60, onLeave: 75, notMarked: 0 }
        ],
        leaveAnalytics: [
            { _id: "REP_LVE001", studentName: 'Arjun Venkat', hostelName: 'Alpha Block', floor: 'Floor 2', fromDate: '2026-02-25', toDate: '2026-02-28', days: 4, status: 'Pending', actionBy: '-' },
            { _id: "REP_LVE002", studentName: 'Siddharth Malhotra', hostelName: 'Delta Block', floor: 'Floor 4', fromDate: '2026-02-20', toDate: '2026-02-22', days: 3, status: 'Approved', actionBy: 'Dr. Sundar' }
        ],
        maintenanceAnalytics: [
            { _id: 'REP_MNT001', hostelName: 'Alpha Block', roomNumber: '204', title: 'Electrical - No Power', priority: 'High', status: 'Pending', updatedAt: '2026-02-21' },
            { _id: 'REP_MNT002', hostelName: 'Gamma Block', roomNumber: 'G05', title: 'Plumbing - Leakage', priority: 'Medium', status: 'In Progress', updatedAt: '2026-02-21' }
        ],
        occupancyByBlock: [
            { _id: "REP_OCC001", hostel: 'Alpha Block', floor: 'Floor 1', totalRooms: 20, totalBeds: 60, occupiedBeds: 55, vacantBeds: 5, occupancyRate: 91.6 },
            { _id: "REP_OCC002", hostel: 'Alpha Block', floor: 'Floor 2', totalRooms: 20, totalBeds: 60, occupiedBeds: 58, vacantBeds: 2, occupancyRate: 96.7 },
            { _id: "REP_OCC003", hostel: 'Beta Block', floor: 'Floor 1', totalRooms: 15, totalBeds: 45, occupiedBeds: 40, vacantBeds: 5, occupancyRate: 88.8 }
        ],
        messFeedbackSummary: [
            { _id: "REP_MES001", date: '2026-02-21', avgRating: 4.2, totalResponses: 156 },
            { _id: "REP_MES002", date: '2026-02-20', avgRating: 3.8, totalResponses: 142 }
        ]
    }
};

export default mockData;
