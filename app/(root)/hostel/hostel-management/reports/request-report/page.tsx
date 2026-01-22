'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestReportSchema, RequestReportValues } from '@/schemas/hostel/reports/request-report.schema';
import { getRequestReport } from '@/server/hostel/reports/request-report';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomDatePicker } from '@/components/ui/form/custom-date-picker';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import ReportActions from '@/components/hostel/report-actions';

export default function RequestReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'student' | 'staff'>('student');

    const form = useForm<RequestReportValues>({
        resolver: zodResolver(requestReportSchema),
        defaultValues: {
            type: 'student',
            fromDate: new Date(),
            toDate: new Date(),
        },
    });

    async function onSubmit(values: RequestReportValues) {
        setLoading(true);
        setType(values.type);
        const data = await getRequestReport(values);
        if (data && data.grid_list) {
            setReportData(data.grid_list);
        } else {
            setReportData([]);
            toast.info("No data found for selected criteria");
        }
        setLoading(false);
    }

    const columns: ColumnDef<any>[] = [
        { id: 'slNo', header: 'SL.No.', cell: ({ row }) => row.index + 1 },
        {
            accessorKey: type === 'student' ? 'studentname' : 'empname',
            header: type === 'student' ? 'Student Name' : 'Staff Name'
        },
        {
            accessorKey: type === 'student' ? 'ASMCL_ClassName' : 'HRMD_DepartmentName',
            header: type === 'student' ? 'Class' : 'Department'
        },
        { accessorKey: 'HLMH_Name', header: 'Hostel' },
        { accessorKey: 'HLMRCA_RoomCategory', header: 'Category' },
        {
            accessorKey: 'HLHSREQ_RequestDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.HLHSREQ_RequestDate || row.original.HLHSTREQ_RequestDate), 'dd/MM/yyyy')
        },
        { accessorKey: 'HLHSREQ_BookingStatus', header: 'Status' },
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading title="Hostel Request Report" description="View hostel applications within a date range." />
                <Separator />
                <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Occupant Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value="student" /></FormControl>
                                                            <FormLabel className="font-normal">Student</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value="staff" /></FormControl>
                                                            <FormLabel className="font-normal">Staff</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="fromDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>From Date</FormLabel>
                                                <FormControl><CustomDatePicker {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="toDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>To Date</FormLabel>
                                                <FormControl><CustomDatePicker {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Loading..." : "Generate Report"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {reportData.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Report Results</h3>
                            <ReportActions
                                data={reportData}
                                fileName="Request_Report"
                                columns={[
                                    { label: type === 'student' ? 'Student Name' : 'Staff Name', value: type === 'student' ? 'studentname' : 'empname' },
                                    { label: type === 'student' ? 'Class' : 'Department', value: type === 'student' ? 'ASMCL_ClassName' : 'HRMD_DepartmentName' },
                                    { label: 'Hostel', value: 'HLMH_Name' },
                                    { label: 'Category', value: 'HLMRCA_RoomCategory' },
                                    { label: 'Status', value: 'HLHSREQ_BookingStatus' }
                                ]}
                            />
                        </div>
                        <DataTable columns={columns} data={reportData} searchKey={type === 'student' ? 'studentname' : 'empname'} />
                    </div>
                )}
            </div>
        </div>
    );
}
