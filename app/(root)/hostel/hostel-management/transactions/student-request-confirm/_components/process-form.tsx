'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRequestConfirmSchema, StudentRequestConfirmValues } from '@/schemas/hostel/transactions/hostel-confirmations.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomSelect } from '@/components/ui/form/custom-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { approveStudentRequest, rejectStudentRequest } from '@/server/hostel/transactions/student-request-actions';

export default function StudentConfirmForm({
    onSaveSuccess,
    processData,
    rooms
}: {
    onSaveSuccess: () => void,
    processData: any,
    rooms: any[]
}) {
    const [loading, setLoading] = useState(false);

    const form = useForm<StudentRequestConfirmValues>({
        resolver: zodResolver(studentRequestConfirmSchema),
        defaultValues: {
            HLHSREQ_Id: processData.HLHSREQ_Id,
            HLHSREQC_Id: processData.HLHSREQC_Id || 0,
            HLHSREQC_Remarks: '',
        },
    });

    async function handleApprove(values: StudentRequestConfirmValues) {
        if (!values.HRMRM_Id) {
            toast.error("Please select a room for approval");
            return;
        }
        setLoading(true);
        const result = await approveStudentRequest({
            ...values,
            HRMRM_Id: parseInt(values.HRMRM_Id)
        });
        if (result?.returnval === true) {
            toast.success("Request approved!");
            onSaveSuccess();
        } else {
            toast.error("Failed to approve request");
        }
        setLoading(false);
    }

    async function handleReject(values: StudentRequestConfirmValues) {
        setLoading(true);
        const result = await rejectStudentRequest(values);
        if (result?.returnval === true) {
            toast.success("Request rejected!");
            onSaveSuccess();
        } else {
            toast.error("Failed to reject request");
        }
        setLoading(false);
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5">
                <CardTitle>Process Student Request: {processData.studentName}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-3 bg-muted/40 rounded border">
                    <p className="text-sm"><strong>Hostel:</strong> {processData.HLMH_Name}</p>
                    <p className="text-sm"><strong>Category:</strong> {processData.HLMRCA_RoomCategory}</p>
                    <p className="text-sm"><strong>Type:</strong> {processData.HLHSREQ_ACRoomFlg ? 'AC' : 'Non-AC'}, {processData.HLHSREQ_SingleRoomFlg ? 'Single' : 'Sharing'}</p>
                    <p className="text-sm"><strong>Requested:</strong> {processData.HLHSREQ_RequestDate ? new Date(processData.HLHSREQ_RequestDate).toLocaleDateString() : '-'}</p>
                </div>

                <Form {...form}>
                    <form className="space-y-4">
                        <FormField
                            control={form.control}
                            name="HRMRM_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign Room (Required for Approval)</FormLabel>
                                    <FormControl>
                                        <CustomSelect
                                            options={rooms.map(r => ({ label: r.hrmrM_RoomNo, value: r.hrmrM_Id.toString() }))}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="HLHSREQC_Remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm/Reject Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onSaveSuccess()} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={form.handleSubmit(handleReject)}
                                disabled={loading}
                            >
                                Reject Request
                            </Button>
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={form.handleSubmit(handleApprove)}
                                disabled={loading}
                            >
                                Approve Request
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
