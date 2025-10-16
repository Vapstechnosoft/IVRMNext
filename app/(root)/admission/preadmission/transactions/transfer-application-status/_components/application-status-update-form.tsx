'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { IPreadmissionApplicationList } from '@/types/admission/preadmission/transactions';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

interface ApplicationStatusUpdate {
    pasr_id: number;
    status_id: number;
    remarks: string;
    student_name: string;
    current_status: string;
}

interface ApplicationStatusUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStudents: IPreadmissionApplicationList[];
    applicationStatuses: Array<{ id: number; name: string }>;
    onSubmit: (updates: Array<{ pasr_id: number; status_id: number; remarks: string }>) => Promise<void>;
    onDeselectStudent: (pasrId: number) => void;
}

export function ApplicationStatusUpdateDialog({
    isOpen,
    onClose,
    selectedStudents,
    applicationStatuses,
    onSubmit,
    onDeselectStudent
}: ApplicationStatusUpdateDialogProps) {
    const [applicationStatusUpdates, setApplicationStatusUpdates] = useState<Record<number, ApplicationStatusUpdate>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<number, string>>({});

    // Initialize status updates when dialog opens
    useState(() => {
        if (isOpen && selectedStudents.length > 0) {
            const initialUpdates: Record<number, ApplicationStatusUpdate> = {};
            selectedStudents.forEach((student) => {
                initialUpdates[student.pasr_id] = {
                    pasr_id: student.pasr_id,
                    status_id: 0,
                    remarks: '',
                    student_name: student.student_name,
                    current_status: student.current_status
                };
            });
            setApplicationStatusUpdates(initialUpdates);
        }
    });

    const handleStatusChange = (pasrId: number, statusId: number) => {
        setApplicationStatusUpdates((prev) => ({
            ...prev,
            [pasrId]: { ...prev[pasrId], status_id: statusId }
        }));
        setErrors((prev) => ({ ...prev, [pasrId]: '' }));
    };

    const handleRemarksChange = (pasrId: number, remarks: string) => {
        setApplicationStatusUpdates((prev) => ({
            ...prev,
            [pasrId]: { ...prev[pasrId], remarks }
        }));
        setErrors((prev) => ({ ...prev, [pasrId]: '' }));
    };

    const handleDeselect = (pasrId: number) => {
        const newUpdates = { ...applicationStatusUpdates };
        delete newUpdates[pasrId];
        setApplicationStatusUpdates(newUpdates);
        onDeselectStudent(pasrId);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<number, string> = {};
        let isValid = true;

        Object.entries(applicationStatusUpdates).forEach(([pasrId, update]) => {
            if (!update.status_id || update.status_id === 0) {
                newErrors[Number(pasrId)] = 'Please select a status';
                isValid = false;
            } else if (!update.remarks.trim()) {
                newErrors[Number(pasrId)] = 'Please enter remarks';
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const updates = Object.values(applicationStatusUpdates).map((update) => ({
                pasr_id: update.pasr_id,
                status_id: update.status_id,
                remarks: update.remarks
            }));

            await onSubmit(updates);
            setApplicationStatusUpdates({});
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error updating statuses:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableStatuses = (currentStatus: string) => {
        return applicationStatuses.filter((status) => status.name !== currentStatus);
    };

    const allValid = Object.values(applicationStatusUpdates).every((update) => update.status_id !== 0 && update.remarks.trim() !== '');

    const completedCount = Object.values(applicationStatusUpdates).filter(
        (update) => update.status_id !== 0 && update.remarks.trim() !== ''
    ).length;

    return (
        <AdaptiveDialog
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className='flex items-center justify-between'>
                    <span>Update Application Status</span>
                    <div className='flex items-center gap-2 font-normal text-sm'>
                        <span className='text-muted-foreground'>
                            {completedCount} / {Object.keys(applicationStatusUpdates).length} completed
                        </span>
                        {allValid && <CheckCircle2 className='h-4 w-4 text-green-500' />}
                    </div>
                </div>
            }
            description={`Update status for ${Object.keys(applicationStatusUpdates).length} selected student(s)`}
            size='5xl'
            interactOutside={false}>
            <AdaptiveBody className='max-h-[60vh]'>
                <div className='space-y-4'>
                    {Object.keys(applicationStatusUpdates).length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-8 text-center'>
                            <AlertCircle className='mb-2 h-12 w-12 text-muted-foreground' />
                            <p className='text-muted-foreground'>No students selected</p>
                        </div>
                    ) : (
                        <div className='overflow-hidden rounded-lg border'>
                            <Table>
                                <TableHeader>
                                    <TableRow className='bg-muted/50'>
                                        <TableHead className='w-[40px]'>S.No</TableHead>
                                        <TableHead className='min-w-[200px]'>Student Name</TableHead>
                                        <TableHead className='min-w-[150px]'>Current Status</TableHead>
                                        <TableHead className='min-w-[200px]'>New Status *</TableHead>
                                        <TableHead className='min-w-[300px]'>Remarks *</TableHead>
                                        <TableHead className='w-[80px]'>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.values(applicationStatusUpdates).map((update, index) => (
                                        <TableRow key={update.pasr_id} className='group'>
                                            <TableCell className='font-medium'>{index + 1}</TableCell>
                                            <TableCell className='font-medium'>{update.student_name}</TableCell>
                                            <TableCell>
                                                <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs'>
                                                    {update.current_status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={update.status_id?.toString()}
                                                    onValueChange={(value) => handleStatusChange(update.pasr_id, Number(value))}>
                                                    <SelectTrigger
                                                        className={errors[update.pasr_id] && !update.status_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder='Select new status' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableStatuses(update.current_status).map((status) => (
                                                            <SelectItem key={status.id} value={status.id.toString()}>
                                                                {status.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Textarea
                                                    placeholder='Enter remarks...'
                                                    value={update.remarks}
                                                    onChange={(e) => handleRemarksChange(update.pasr_id, e.target.value)}
                                                    className={`min-h-[60px] resize-none ${
                                                        errors[update.pasr_id] && !update.remarks.trim() ? 'border-red-500' : ''
                                                    }`}
                                                    rows={2}
                                                />
                                                {errors[update.pasr_id] && (
                                                    <p className='mt-1 text-red-500 text-xs'>{errors[update.pasr_id]}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleDeselect(update.pasr_id)}
                                                    className='h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600'>
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </AdaptiveBody>

            <AdaptiveFooter className='flex justify-between border-t pt-4'>
                <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!allValid || isSubmitting || Object.keys(applicationStatusUpdates).length === 0}>
                    {isSubmitting ? (
                        <>
                            <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                            Updating...
                        </>
                    ) : (
                        `Update ${Object.keys(applicationStatusUpdates).length} Student(s)`
                    )}
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
