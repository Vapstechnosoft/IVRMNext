'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { IEventsStudentSRKVSViewDetails } from '@/types/sports/events-student-srkvs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IEventsStudentSRKVSViewDetails[] | null;
}

export function ViewDetailsModal({ isOpen, onClose, data }: ViewDetailsModalProps) {
    if (!data || data.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Student Entry Details</DialogTitle>
                </DialogHeader>
                <div className="p-4 border rounded-md bg-card">
                    <ScrollArea className="h-[80vh]">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">SL.No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Point</TableHead>
                                    <TableHead>Place</TableHead>
                                    <TableHead>Remark</TableHead>
                                    <TableHead className="text-center">Record Broken</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((student, index) => (
                                    <TableRow key={student.amsT_Id}>
                                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                        <TableCell>{student.studentName}</TableCell>
                                        <TableCell>{student.amsT_AdmNo}</TableCell>
                                        <TableCell>{student.asmcL_ClassName}</TableCell>
                                        <TableCell>{student.asmC_SectionName}</TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-8 w-20"
                                                defaultValue={String(student.spccestR_Points || '')}
                                                readOnly
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-8 w-20"
                                                defaultValue={String(student.spccestR_Rank || '')}
                                                readOnly
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-8 w-32"
                                                defaultValue={student.spccestR_Remarks || ''}
                                                readOnly
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={!!student.spccestR_RecordBrokenFlag}
                                                disabled
                                            />
                                        </TableCell>
                                        {/* <TableCell></TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
