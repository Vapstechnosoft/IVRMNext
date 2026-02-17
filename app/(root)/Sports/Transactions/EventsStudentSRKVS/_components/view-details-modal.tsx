'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { IEventsStudentSRKVSViewDetails } from '@/types/sports/events-student-srkvs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';

interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IEventsStudentSRKVSViewDetails[] | null;
    uomId: number;
}

type ViewDetailsWithSelect = IEventsStudentSRKVSViewDetails & { selected?: boolean };

export function ViewDetailsModal({ isOpen, onClose, data, uomId }: ViewDetailsModalProps) {
    const [editedData, setEditedData] = useState<ViewDetailsWithSelect[]>([]);
    const { updateData } = useEventsStudentSRKVS();

    useEffect(() => {
        if (data) {
            console.log("ViewDetailsModal data:", data);
            const initialData = data.map(item => ({
                ...item,
                selected: false,
                spccmuoM_Id: item.spccmuoM_Id || uomId
            }));
            setEditedData(JSON.parse(JSON.stringify(initialData))); // Deep copy to avoid mutating props
        }
    }, [data, uomId]);

    const handleInputChange = (index: number, field: keyof ViewDetailsWithSelect, value: any) => {
        const newData = [...editedData];
        newData[index] = { ...newData[index], [field]: value };
        setEditedData(newData);
    };

    const toggleSelectAll = (checked: boolean) => {
        const newData = editedData.map(item => ({ ...item, selected: checked }));
        setEditedData(newData);
    };

    const handleUpdate = () => {
        const selectedStudents = editedData.filter(student => student.selected);

        if (selectedStudents.length === 0) {
            // Optionally, show a toast message or alert the user
            console.log("No students selected for update.");
            return;
        }

        const student1 = selectedStudents.map(student => ({
            amsT_Id: student.amsT_Id || 0,
            spccestR_Points: Number(student.spccestR_Points) || 0,
            spccestR_Rank: String(student.spccestR_Rank || "0"),
            spccestR_Remarks: student.spccestR_Remarks || "",
            spccestR_RecordBrokenFlag: String(student.spccestR_RecordBrokenFlag) === "true" ? "true" : "false", // Ensure string "true"/"false" if backend expects string
            spccmuoM_Id: student.spccmuoM_Id || uomId || 0, // Use mapped value or prop fallback
            spccestR_Value: "", // Default
            spccesT_Id: student.spccesT_Id || 0,
            spccestR_Id: student.spccestR_Id || 0,
            spccestR_EventRecordFlg: true,
            multipleBroken: [
                {
                    spccestR_Value: "",
                    spccestR_Id: student.spccestR_Id || 0,
                    indexValue: Number(student.spccestR_Points) || 0
                }
            ],
            spccmscC_MultiAttemptFlg: !!student.spccmscC_MultiAttemptFlg // Ensure boolean
        }));

        const payload = {
            student1: student1,
            // "MI_Id" and "UserId" are likely handled by backend from token, but if needed they should be added here or in the service wrapper.
            // Based on C# code, it takes EventsStudentRecordDTO which has student1.
        };

        console.log("Update Payload:", JSON.stringify(payload, null, 2));

        updateData.mutate(payload, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    if (!data || data.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Student Entry Details</DialogTitle>
                </DialogHeader>
                <div className="p-4 border rounded-md bg-card">
                    <ScrollArea className="h-[60vh]">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">
                                        <Checkbox
                                            checked={editedData.length > 0 && editedData.every(item => item.selected)}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[50px] text-center">SL.No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Point</TableHead>
                                    <TableHead>Place</TableHead>
                                    <TableHead>Remark</TableHead>
                                    <TableHead className="text-center">Record Broken</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {editedData.map((student, index) => (
                                    <TableRow key={student.amsT_Id}>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={!!student.selected}
                                                onCheckedChange={(checked) => handleInputChange(index, 'selected', checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                        <TableCell>{student.studentName}</TableCell>
                                        <TableCell>{student.amsT_AdmNo}</TableCell>
                                        <TableCell>{student.asmcL_ClassName}</TableCell>
                                        <TableCell>{student.asmC_SectionName}</TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-8 w-20"
                                                value={student.spccestR_Points ?? ''}
                                                onChange={(e) => handleInputChange(index, 'spccestR_Points', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={String(student.spccestR_Rank || '')}
                                                onValueChange={(val) => handleInputChange(index, 'spccestR_Rank', val)}
                                            >
                                                <SelectTrigger className="h-8 w-20">
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                                        <SelectItem key={num} value={String(num)}>
                                                            {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                className="h-8 w-32"
                                                value={student.spccestR_Remarks || ''}
                                                onChange={(e) => handleInputChange(index, 'spccestR_Remarks', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={String(student.spccestR_RecordBrokenFlag) === 'true' || student.spccestR_RecordBrokenFlag === true}
                                                onCheckedChange={(checked) => handleInputChange(index, 'spccestR_RecordBrokenFlag', checked)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline">Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateData.isPending || !editedData.some(s => s.selected)}>
                        {updateData.isPending ? 'Updating...' : 'Update'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
