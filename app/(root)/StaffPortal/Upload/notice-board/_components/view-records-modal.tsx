'use client';

import { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    viewNoticeBoardRecords,
    viewNoticeBoardAttachments
} from '@/server/upload/transactions/notice-board/server-action';
import { Loader2, Users, UserCheck, Eye, Paperclip } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

interface ViewRecordsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRow: any;
    defaultTab?: string;
}

export default function ViewRecordsModal({
    isOpen,
    onClose,
    selectedRow,
    defaultTab = "students"
}: ViewRecordsModalProps) {
    const [loading, setLoading] = useState(false);
    const [staffViewed, setStaffViewed] = useState<any[]>([]);
    const [staffNotViewed, setStaffNotViewed] = useState<any[]>([]);
    const [studentViewed, setStudentViewed] = useState<any[]>([]);
    const [studentNotViewed, setStudentNotViewed] = useState<any[]>([]);
    const [attachmentList, setAttachmentList] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && selectedRow?.intB_Id) {
            setLoading(true);
            
            const fetchStaff = viewNoticeBoardRecords({
                intB_Id: selectedRow.intB_Id,
                intB_Title: selectedRow.intB_Title,
                intB_ToStaffFlg: true,
                intB_ToStudentFlg: false
            });

            const fetchStudents = viewNoticeBoardRecords({
                intB_Id: selectedRow.intB_Id,
                intB_Title: selectedRow.intB_Title,
                intB_ToStaffFlg: false,
                intB_ToStudentFlg: true
            });

            const fetchAttachments = viewNoticeBoardAttachments({
                intB_Id: selectedRow.intB_Id
            });

            Promise.all([fetchStaff, fetchStudents, fetchAttachments])
                .then(([staffRes, studentRes, attachmentRes]) => {
                    // Extract staff
                    if (staffRes?.success && staffRes.data) {
                        setStaffViewed((staffRes.data.viewlist as any[]) || []);
                        setStaffNotViewed((staffRes.data.notViewlist as any[]) || []);
                    } else if (staffRes) {
                        const sData = staffRes as unknown as any;
                        setStaffViewed(sData.viewlist || []);
                        setStaffNotViewed(sData.notViewlist || []);
                    }

                    // Extract students
                    if (studentRes?.success && studentRes.data) {
                        setStudentViewed((studentRes.data.viewlist as any[]) || (studentRes.data.stuviewlist as any[]) || []);
                        setStudentNotViewed((studentRes.data.notViewlist as any[]) || []);
                    } else if (studentRes) {
                        const stuData = studentRes as unknown as any;
                        setStudentViewed(stuData.viewlist || stuData.stuviewlist || []);
                        setStudentNotViewed(stuData.notViewlist || []);
                    }

                    // Extract attachments
                    if (attachmentRes?.success && attachmentRes.data) {
                        setAttachmentList((attachmentRes.data as any[]) || []);
                    } else if (attachmentRes) {
                        setAttachmentList((attachmentRes as unknown as any[]) || []);
                    }
                })
                .catch(err => {
                    console.error('Error fetching viewed records:', err);
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, selectedRow?.intB_Id, selectedRow?.intB_Title, selectedRow?.intB_FilePath_Array]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        Notice Tracking Status - {selectedRow?.intB_Title || ''}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 shadow-sm border rounded-lg overflow-hidden">
                            <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                                <Users className="h-4 w-4 mr-2" /> Students ({studentViewed.length + studentNotViewed.length})
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                                <Users className="h-4 w-4 mr-2" /> Staff ({staffViewed.length + staffNotViewed.length})
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                                <Paperclip className="h-4 w-4 mr-2" /> Attachments ({attachmentList.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="students" className="mt-6 space-y-8">
                            {/* Students Viewed */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                                    <Eye className="h-4 w-4" /> Viewed ({studentViewed.length})
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-green-50 shadow-sm">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="sticky top-0 bg-green-50 border-b-2 border-green-100 z-10">
                                            <tr>
                                                <th className="p-3 text-left font-bold text-green-800">SL.NO</th>
                                                <th className="p-3 text-left font-bold text-green-800">Student Name</th>
                                                <th className="p-3 text-left font-bold text-green-800">Group / Department</th>
                                                <th className="p-3 text-left font-bold text-green-800">Viewed Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentViewed.length > 0 ? studentViewed.map((row, idx) => (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-green-50/50 transition-colors">
                                                    <td className="p-3">{idx + 1}</td>
                                                    <td className="p-3 font-medium">{row.Entity_Name || row.studentname || row.amsT_FirstName}</td>
                                                    <td className="p-3 text-muted-foreground">{row.Group_Name || row.asmcL_ClassName}</td>
                                                    <td className="p-3 italic text-xs">{row.Viewed_Date || 'N/A'}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No students have viewed this notice yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Students Not Viewed */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-700">
                                    <Users className="h-4 w-4" /> Not Viewed ({studentNotViewed.length})
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-red-50 shadow-sm">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="sticky top-0 bg-red-50 border-b-2 border-red-100 z-10">
                                            <tr>
                                                <th className="p-3 text-left font-bold text-red-800">SL.NO</th>
                                                <th className="p-3 text-left font-bold text-red-800">Student Name</th>
                                                <th className="p-3 text-left font-bold text-red-800">Group / Department</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentNotViewed.length > 0 ? studentNotViewed.map((row, idx) => (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-red-50/50 transition-colors">
                                                    <td className="p-3">{idx + 1}</td>
                                                    <td className="p-3 font-medium">{row.Entity_Name || row.studentname || row.amsT_FirstName}</td>
                                                    <td className="p-3 text-muted-foreground">{row.Group_Name || row.asmcL_ClassName}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-green-600 font-semibold">Great! All targeted students have viewed this notice.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="staff" className="mt-6 space-y-8">
                            {/* Staff Viewed */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                                    <Eye className="h-4 w-4" /> Viewed ({staffViewed.length})
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-green-50 shadow-sm">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="sticky top-0 bg-green-50 border-b-2 border-green-100 z-10">
                                            <tr>
                                                <th className="p-3 text-left font-bold text-green-800">SL.NO</th>
                                                <th className="p-3 text-left font-bold text-green-800">Staff Name</th>
                                                <th className="p-3 text-left font-bold text-green-800">Department / Designation</th>
                                                <th className="p-3 text-left font-bold text-green-800">Viewed Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffViewed.length > 0 ? staffViewed.map((row, idx) => (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-green-50/50 transition-colors">
                                                    <td className="p-3">{idx + 1}</td>
                                                    <td className="p-3 font-medium">{row.Entity_Name || row.employeename || row.hrmE_EmployeeFirstName}</td>
                                                    <td className="p-3 text-muted-foreground">{row.Department_Name} - {row.Designation_Name}</td>
                                                    <td className="p-3 italic text-xs">{row.Viewed_Date || 'N/A'}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No staff have viewed this notice yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Staff Not Viewed */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-red-700">
                                    <Users className="h-4 w-4" /> Not Viewed ({staffNotViewed.length})
                                </h3>
                                <div className="max-h-[300px] overflow-y-auto rounded-xl border-2 border-red-50 shadow-sm">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="sticky top-0 bg-red-50 border-b-2 border-red-100 z-10">
                                            <tr>
                                                <th className="p-3 text-left font-bold text-red-800">SL.NO</th>
                                                <th className="p-3 text-left font-bold text-red-800">Staff Name</th>
                                                <th className="p-3 text-left font-bold text-red-800">Department / Designation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffNotViewed.length > 0 ? staffNotViewed.map((row, idx) => (
                                                <tr key={idx} className="border-b last:border-0 hover:bg-red-50/50 transition-colors">
                                                    <td className="p-3">{idx + 1}</td>
                                                    <td className="p-3 font-medium">{row.Entity_Name || row.employeename || row.hrmE_EmployeeFirstName}</td>
                                                    <td className="p-3 text-muted-foreground">{row.Department_Name} - {row.Designation_Name}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-green-600 font-semibold">Great! All targeted staff have viewed this notice.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="attachments" className="mt-4">
                            <div className="max-h-[400px] overflow-y-auto rounded-md border text-sm">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-muted/90">
                                        <tr>
                                            <th className="p-2 text-left">SL.NO</th>
                                            <th className="p-2 text-left">File Name</th>
                                            <th className="p-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attachmentList.length > 0 ? attachmentList.map((row, idx) => (
                                            <tr key={idx} className="border-t hover:bg-muted/50">
                                                <td className="p-2">{idx + 1}</td>
                                                <td className="p-2">{row.fileName || row.intbfL_FileName}</td>
                                                <td className="p-2 text-center">
                                                    <Button variant="ghost" size="sm" onClick={() => window.open(row.intbfL_FilePath, '_blank')}>
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No attachments found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    );
}
