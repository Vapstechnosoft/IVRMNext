"use client";

import {
    User,
    Banknote,
    ClipboardList,
    Calendar,
    Bell,
    PenTool,
    BookOpen,
    Clock,
    FileText,
    Library,
    Trophy,
    ShoppingCart,
    Briefcase,
    GraduationCap,
    Image as ImageIcon,
    Book,
    MessageCircle,
    LayoutDashboard
} from "lucide-react";
import { DashboardWidget } from "./_components/dashboard-widget";
import { DashboardCharts } from "./_components/dashboard-charts";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import {
    noticeColumns,
    NoticeBoardData,
    homeworkColumns,
    AssignmentData,
    sportsColumns,
    SportsData,
    achievementColumns,
    AchievementData
} from "./_components/columns";

import {useStudentPortalInformation} from "@/hooks/staff-portal/useFeeOnlinePayment";

// Sample Data for Tables
const mockNotices: NoticeBoardData[] = [
    { INTB_Id: 1, INTB_Title: "Sports Day", INTB_Description: "Annual Sports Day", INTB_StartDate: "2024-01-20", INTB_EndDate: "2024-01-21" },
    { INTB_Id: 2, INTB_Title: "Holiday", INTB_Description: "Republic Day", INTB_StartDate: "2024-01-26", INTB_EndDate: "2024-01-26" },
];

const mockHomework: AssignmentData[] = [
    { ismS_SubjectName: "Mathematics", ihW_Assignment: "Solve Chapter 1", ihW_Date: "2024-01-10", FilesCount: 0 },
    { ismS_SubjectName: "Science", ihW_Assignment: "Draw structure of cell", ihW_Date: "2024-01-11", FilesCount: 1 },
];

const mockSports: SportsData[] = [
    { SPCCMSCC_SportsCCName: "Cricket", SPCCMH_HouseName: "Red", SPCCMEV_EventVenue: "Stadium", SPCCE_StartDate: "2024-02-01", SPCCESTR_Points: 10, SPCCESTR_Rank: "1" }
];

const mockAchievements: AchievementData[] = [
    { StudentName: "John Doe", Class: "X", Section: "A", Date: "2023-12-15", Achievement: "Best Coder" }
];

import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const openModal = (modalName: string) => setActiveModal(modalName);
    const closeModal = () => setActiveModal(null);

    const { data: studentInfoDetails, isLoading, error } = useStudentPortalInformation();

    console.log("studentInfoDetails", studentInfoDetails);

    // Use real API data or fallback to mock data
    const student = studentInfoDetails?.data && Array.isArray(studentInfoDetails.data) && studentInfoDetails.data.length > 0 ? {
        name: `${studentInfoDetails.data[0].amsT_FirstName} ${studentInfoDetails.data[0].amsT_LastName}`,
        class: studentInfoDetails.data[0].classname || "N/A",
        section: studentInfoDetails.data[0].sectionname || "N/A",
        admNo: studentInfoDetails.data[0].amsT_AdmNo || "N/A",
        dob: studentInfoDetails.data[0].amsT_DOB || "N/A",
        email: studentInfoDetails.data[0].amst_email_id || "N/A",
        mobile: studentInfoDetails.data[0].amst_mobile?.toString() || "N/A"
    } : {
        name: "",
        class: "",
        section: "",
        admNo: "",
        dob: "",
        email: "",
        mobile: ""
    };

    const fees = {
        total: 50000,
        paid: 35000,
        balance: 15000
    };

    const attendance = {
        totalClasses: 120,
        present: 108,
        percentage: 90
    };

    return (
        <div className="min-h-screen p-6 space-y-6 bg-slate-50/50 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back, {student.name}</p>
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Student Details */}
                <DashboardWidget
                    title="STUDENT DETAILS"
                    icon={<User className="h-6 w-6" />}
                    colorClass="bg-green-500"
                    footerText="STUDENT PROFILE"
                    onViewClick={() => { }}
                >
                    <div className="mt-2 text-slate-700 dark:text-slate-300">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-sm">
                                Error loading student data
                            </div>
                        ) : (
                            <>
                                <h4 className="font-semibold text-lg truncate">{student.name}</h4>
                                <p className="text-sm">{student.class} : {student.section}</p>
                                <p className="text-xs text-gray-500">Adm No: {student.admNo}</p>
                            </>
                        )}
                    </div>
                </DashboardWidget>

                {/* Fees */}
                <DashboardWidget
                    title="FEES"
                    icon={<Banknote className="h-6 w-6" />}
                    colorClass="bg-blue-500"
                    footerText="FEE DETAILS"
                    onViewClick={() => router.push('/StudentPortal/student-dashboard/Fees/FeeDetails')}
                >
                    <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                            <span>Total Fees:</span>
                            <span className="font-semibold">{fees.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Paid:</span>
                            <span className="font-semibold">{fees.paid}</span>
                        </div>
                        <div className="flex justify-between text-red-500 font-semibold">
                            <span>Balance:</span>
                            <span>{fees.balance}</span>
                        </div>
                    </div>
                </DashboardWidget>

                {/* Attendance */}
                <DashboardWidget
                    title="ATTENDANCE"
                    icon={<ClipboardList className="h-6 w-6" />}
                    colorClass="bg-yellow-500"
                    footerText="ATTENDANCE DETAILS"
                    onViewClick={() => router.push('/StudentPortal/student-dashboard/EnrolledStudents/Transaction/AttendanceDetails')}
                >
                    <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                            <span>Classes Held:</span>
                            <span className="font-semibold">{attendance.totalClasses}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Present:</span>
                            <span className="font-semibold">{attendance.present}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                            <span>Percentage:</span>
                            <span>{attendance.percentage}%</span>
                        </div>
                    </div>
                </DashboardWidget>

                {/* Events */}
                <DashboardWidget
                    title="EVENTS"
                    icon={<Calendar className="h-6 w-6" />}
                    colorClass="bg-pink-500"
                    footerText="VIEW CALENDAR OF EVENTS"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Check upcoming events & holidays</p>
                    </div>
                </DashboardWidget>

                {/* Notice */}
                <DashboardWidget
                    title="NOTICE"
                    icon={<Bell className="h-6 w-6" />}
                    colorClass="bg-emerald-400"
                    footerText="VIEW NOTICE BOARD"
                    onViewClick={() => openModal("NOTICE")}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Latest announcements</p>
                    </div>
                </DashboardWidget>

                {/* Homework */}
                <DashboardWidget
                    title="HOMEWORK"
                    icon={<PenTool className="h-6 w-6" />}
                    colorClass="bg-green-600"
                    footerText="VIEW HOMEWORK"
                    onViewClick={() => openModal("HOMEWORK")}
                >
                    <div className="mt-2 space-y-2">
                        <div className="text-sm text-center">
                            <span className="text-muted-foreground">Recent Assignments</span>
                        </div>
                        <button className="text-xs text-blue-600 underline w-full text-center">Upload Homework</button>
                    </div>
                </DashboardWidget>

                {/* Classwork */}
                <DashboardWidget
                    title="CLASSWORK"
                    icon={<BookOpen className="h-6 w-6" />}
                    colorClass="bg-emerald-500"
                    footerText="VIEW CLASSWORK"
                    onViewClick={() => { }}
                >
                    <div className="mt-2 space-y-2">
                        <div className="text-sm text-center">
                            <span className="text-muted-foreground">Class Resources</span>
                        </div>
                        <button className="text-xs text-blue-600 underline w-full text-center">Upload Classwork</button>
                    </div>
                </DashboardWidget>

                {/* Time Table */}
                <DashboardWidget
                    title="TIME TABLE"
                    icon={<Clock className="h-6 w-6" />}
                    colorClass="bg-pink-500"
                    footerText="VIEW TT"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Weekly Schedule</p>
                    </div>
                </DashboardWidget>


  <DashboardWidget
                    title="SYLLABUS"
                    icon={<FileText className="h-6 w-6" />}
                    colorClass="bg-green-500"
                    footerText="VIEW SYLLABUS"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Course Curriculum</p>
                    </div>
                </DashboardWidget>

                {/* Library */}
                <DashboardWidget
                    title="LIBRARY"
                    icon={<Library className="h-6 w-6" />}
                    colorClass="bg-orange-500"
                    footerText="VIEW LIBRARY"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Books & Returns</p>
                    </div>
                </DashboardWidget>

                {/* Sports */}
                <DashboardWidget
                    title="SPORTS"
                    icon={<Trophy className="h-6 w-6" />}
                    colorClass="bg-blue-500"
                    footerText="VIEW SPORTS"
                    onViewClick={() => openModal("SPORTS")}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Sports Events & Results</p>
                    </div>
                </DashboardWidget>

                {/* Inventory */}
                <DashboardWidget
                    title="INVENTORY"
                    icon={<ShoppingCart className="h-6 w-6" />}
                    colorClass="bg-pink-500"
                    footerText="VIEW INVENTORY"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Purchase Items</p>
                    </div>
                </DashboardWidget>

                {/* PDA */}
                <DashboardWidget
                    title="PDA"
                    icon={<Briefcase className="h-6 w-6" />}
                    colorClass="bg-yellow-500"
                    footerText="VIEW PDA"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Personal Deposit Account</p>
                    </div>
                </DashboardWidget>

                {/* Promotion */}
                <DashboardWidget
                    title="PROMOTION"
                    icon={<GraduationCap className="h-6 w-6" />}
                    colorClass="bg-yellow-500"
                // footerText="View Details"
                >
                    <div className="mt-2 text-sm">
                        <p>Remarks: <span className="font-semibold">Promoted to Class XI</span></p>
                    </div>
                </DashboardWidget>

                {/* Gallery */}
                <DashboardWidget
                    title="GALLERY"
                    icon={<ImageIcon className="h-6 w-6" />}
                    colorClass="bg-emerald-400"
                    footerText="VIEW GALLERY"
                    onViewClick={() => { }}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">School Photos</p>
                    </div>
                </DashboardWidget>

                {/* Book List */}
                <DashboardWidget
                    title="BOOK LIST"
                    icon={<Book className="h-6 w-6" />}
                    colorClass="bg-blue-500"
                    footerText="VIEW BOOK LIST"
                    onViewClick={() => { }}
                >
                    <div className="mt-2 text-sm">
                        <p>Total Books: <span className="font-semibold">0</span></p>
                    </div>
                </DashboardWidget>

                {/* Achievements/Complaints */}
                <DashboardWidget
                    title="ACHIEVEMENTS"
                    icon={<Trophy className="h-6 w-6" />}
                    colorClass="bg-green-500"
                // Custom footer handling for two links
                >
                    <div className="mt-2 space-y-3">
                        <button className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors w-full" onClick={() => openModal("ACHIEVEMENTS")}>
                            <Trophy className="mr-2 h-4 w-4" /> View Achievements
                        </button>
                        <button className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800 transition-colors w-full" onClick={() => openModal("ACHIEVEMENTS")}>
                            <MessageCircle className="mr-2 h-4 w-4" /> View Complaints
                        </button>
                    </div>
                </DashboardWidget>

                {/* Transaction / Certificates */}
                <DashboardWidget
                    title="TRANSACTION"
                    icon={<FileText className="h-6 w-6" />}
                    colorClass="bg-purple-500"
                    footerText="VIEW CERTIFICATES"
                    onViewClick={() => router.push('/StudentPortal/student-dashboard/EnrolledStudents/Transaction/OnlineTransferCertificate')}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Apply for Transfer Certificate</p>
                    </div>
                </DashboardWidget>

                {/* Interaction */}
                <DashboardWidget
                    title="INTERACTION"
                    icon={<MessageCircle className="h-6 w-6" />}
                    colorClass="bg-indigo-500"
                    footerText="VIEW INTERACTIONS"
                    onViewClick={() => router.push('/StudentPortal/student-dashboard/Interaction/IVRM_Interaction/Interaction')}
                >
                    <div className="mt-4 flex justify-center">
                        <p className="text-sm text-muted-foreground italic">Inbox, Compose & Alerts</p>
                    </div>
                </DashboardWidget>

         

            {/* Modals */}
            <Dialog open={activeModal === "NOTICE"} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Notice Board</DialogTitle>
                        <DialogDescription>Recent announcements and circulars</DialogDescription>
                    </DialogHeader>
                    <GenericDataTable columns={noticeColumns} data={mockNotices} isLoading={false} />
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === "HOMEWORK"} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Homework</DialogTitle>
                    </DialogHeader>
                    <GenericDataTable columns={homeworkColumns} data={mockHomework} isLoading={false} />
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === "SPORTS"} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Sports Events</DialogTitle>
                    </DialogHeader>
                    <GenericDataTable columns={sportsColumns} data={mockSports} isLoading={false} />
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === "ACHIEVEMENTS"} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Achievements</DialogTitle>
                    </DialogHeader>
                    <GenericDataTable columns={achievementColumns} data={mockAchievements} isLoading={false} />
                </DialogContent>
            </Dialog>
              
            </div>

       
          

          

            {/* Calendar and Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Calendar */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="lg:col-span-2">
                    <DashboardCharts />
                </div>
            </div>
        </div>
    );
}
