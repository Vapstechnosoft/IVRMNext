'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useDeleteWrittenTestScheduleStudent,
    useWrittenTestSelectedRowDetails
} from '@/hooks/admission/preadmission/transactions/use-written-test-schedule';
import type { IStudentDetails, IWrittenTestSchedule } from '@/types/admission/preadmission/transactions/written-test-schedule';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface StudentListModalProps {
    rowData: IWrittenTestSchedule;
    isOpen: boolean;
    onClose: () => void;
}

export default function StudentListModal({ rowData, isOpen, onClose }: StudentListModalProps) {
    const { data: details, isLoading } = useWrittenTestSelectedRowDetails(isOpen ? rowData.pawtS_Id : undefined);
    const { mutate: deleteStudent, isPending: isDeleting } = useDeleteWrittenTestScheduleStudent();

    const students = details?.selectedStudentDetails || [];

    const handleDelete = (student: IStudentDetails) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to remove ${student.pasR_FirstName} from this schedule?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
            customClass: { container: 'pointer-events-auto' }
        }).then((result) => {
            if (result.isConfirmed) {
                deleteStudent(
                    {
                        PAWTS_Id: rowData.pawtS_Id,
                        PASR_Id: student.pasR_Id || student.pasr_id || 0
                    },
                    {
                        onSuccess: (res: any) => {
                            if (res?.success) {
                                Swal.fire({
                                    title: 'Success!',
                                    text: res.message || 'Student removed successfully',
                                    icon: 'success',
                                    confirmButtonText: 'OK',
                                    customClass: { container: 'pointer-events-auto' }
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error!',
                                    text: res?.message || 'Failed to remove student',
                                    icon: 'error',
                                    confirmButtonText: 'OK',
                                    customClass: { container: 'pointer-events-auto' }
                                });
                            }
                        },
                        onError: (err: any) => {
                            Swal.fire({
                                title: 'Error!',
                                text: err?.message || 'An error occurred while removing the student',
                                icon: 'error',
                                confirmButtonText: 'OK',
                                customClass: { container: 'pointer-events-auto' }
                            });
                        }
                    }
                );
            }
        });
    };

    return (
        <AdaptiveDialog
            isOpen={isOpen}
            onClose={onClose}
            title='Scheduled Students List'
            description={`Viewing mapped students for schedule: ${rowData.pawtS_ScheduleName}`}
            size='4xl'>
            <AdaptiveBody className='max-h-[60vh] overflow-auto'>
                {isLoading ? (
                    <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                        <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                        <p>Loading students...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                        <AlertCircle className='mb-2 h-12 w-12 text-muted-foreground/50' />
                        <p>No students mapped to this schedule yet.</p>
                    </div>
                ) : (
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader className='bg-slate-50'>
                                <TableRow>
                                    <TableHead className='w-[50px]'>Sl.No</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Registration No</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Mobile No</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className='w-[80px] text-center'>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student: IStudentDetails, index: number) => (
                                    <TableRow key={student.pasR_Id || student.pasr_id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className='font-medium'>
                                            {[student.pasR_FirstName, student.pasR_MiddleName, student.pasR_LastName]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </TableCell>
                                        <TableCell>{student.pasR_RegistrationNo || 'N/A'}</TableCell>
                                        <TableCell>{student.pasR_Sex || 'N/A'}</TableCell>
                                        <TableCell>{student.pasR_MobileNo || 'N/A'}</TableCell>
                                        <TableCell>{student.pasR_emailId || 'N/A'}</TableCell>
                                        <TableCell className='text-center'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700'
                                                onClick={() => handleDelete(student)}
                                                disabled={isDeleting}
                                                title='Remove Student'>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter>
                <div className='flex w-full items-center justify-between'>
                    <div className='pl-2 font-medium text-muted-foreground text-sm'>
                        Total Students: <span className='text-foreground'>{students.length}</span>
                    </div>
                    <Button variant='outline' onClick={onClose}>
                        Close
                    </Button>
                </div>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
