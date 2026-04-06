'use client';

import { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    viewNoticeBoardRecords 
} from '@/server/upload/transactions/notice-board/server-action';
import { Loader2, Users, UserCheck, Eye, Paperclip } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

interface ViewRecordsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRow: any;
}

export default function ViewRecordsModal({
    isOpen,
    onClose,
    selectedRow,
}: ViewRecordsModalProps) {
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [attachmentList, setAttachmentList] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && selectedRow?.intB_Id) {
            setLoading(true);
            
            const fetchStaff = viewNoticeBoardRecords({
                intB_Id: selectedRow.intB_Id,
                intB_Title: selectedRow.intB_Title,
                flag: 'Staff',
                INTB_ToStaffFlg: true
            });

            const fetchStudents = viewNoticeBoardRecords({
                intB_Id: selectedRow.intB_Id,
                intB_Title: selectedRow.intB_Title,
                flag1: 'Student',
                INTB_ToStudentFlg: true
            });

            Promise.all([fetchStaff, fetchStudents])
                .then(([staffRes, studentRes]) => {
                    // Extract staff
                    if (staffRes?.success && staffRes.data) {
                        setStaffList((staffRes.data.viewlist as any[]) || []);
                    } else if (staffRes) {
                        setStaffList((staffRes.viewlist as any[]) || []);
                    }

                    // Extract students
                    if (studentRes?.success && studentRes.data) {
                        setStudentList((studentRes.data.stuviewlist as any[]) || []);
                    } else if (studentRes) {
                        setStudentList((studentRes.stuviewlist as any[]) || []);
                    }

                    // Attachments from row (or we could fetch via viewData if preferred)
                    setAttachmentList(selectedRow?.intB_FilePath_Array || []);
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
                    <Tabs defaultValue="students" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="students" className="flex gap-2">
                                <Users className="h-4 w-4" /> Students ({studentList.length})
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="flex gap-2">
                                <Users className="h-4 w-4" /> Staff ({staffList.length})
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="flex gap-2">
                                <Paperclip className="h-4 w-4" /> Attachments ({attachmentList.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="students" className="mt-4">
                            <div className="max-h-[400px] overflow-y-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted/90">
                                        <tr>
                                            <th className="p-2 text-left">SL.NO</th>
                                            <th className="p-2 text-left">Student Name</th>
                                            <th className="p-2 text-left">Admission No</th>
                                            <th className="p-2 text-left">Class-Section</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentList.length > 0 ? studentList.map((row, idx) => (
                                            <tr key={idx} className="border-t hover:bg-muted/50">
                                                <td className="p-2">{idx + 1}</td>
                                                <td className="p-2">{row.amsT_FirstName || row.studentname}</td>
                                                <td className="p-2">{row.amsT_AdmNo}</td>
                                                <td className="p-2">{row.asmcL_ClassName} - {row.asmC_SectionName}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No records found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="staff" className="mt-4">
                            <div className="max-h-[400px] overflow-y-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted/90">
                                        <tr>
                                            <th className="p-2 text-left">SL.NO</th>
                                            <th className="p-2 text-left">Staff Name</th>
                                            <th className="p-2 text-left">Staff Code</th>
                                            <th className="p-2 text-left">Department</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffList.length > 0 ? staffList.map((row, idx) => (
                                            <tr key={idx} className="border-t hover:bg-muted/50">
                                                <td className="p-2">{idx + 1}</td>
                                                <td className="p-2">{row.hrmE_EmployeeFirstName || row.employeename}</td>
                                                <td className="p-2">{row.hrmE_EmployeeCode}</td>
                                                <td className="p-2">{row.hrmD_DepartmentName || row.hrmdC_Name}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No records found</td></tr>
                                        )}
                                    </tbody>
                                </table>
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
