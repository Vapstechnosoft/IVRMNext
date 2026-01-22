'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inOutReportSchema, InOutReportValues } from '@/schemas/hostel/reports/attendance-reports.schema';
import { getInOutReport, getInOutReportLoadData } from '@/server/hostel/reports/attendance-reports';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomDatePicker } from '@/components/ui/form/custom-date-picker';
import { CustomSelect } from '@/components/ui/form/custom-select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import ReportActions from '@/components/hostel/report-actions';

export default function InOutReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [hostels, setHostels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<InOutReportValues>({
        resolver: zodResolver(inOutReportSchema),
        defaultValues: {
            fromDate: new Date(),
            toDate: new Date(),
        },
    });

    useEffect(() => {
        async function load() {
            const data = await getInOutReportLoadData();
            if (data && data.hostelist) {
                setHostels(data.hostelist);
            }
        }
        load();
    }, []);

    async function onSubmit(values: InOutReportValues) {
        setLoading(true);
        const data = await getInOutReport(values);
        if (data && data.grid_list) {
            setReportData(data.grid_list);
        } else {
            setReportData([]);
            toast.info("No data found");
        }
        setLoading(false);
    }

    const columns: ColumnDef<any>[] = [
        { id: 'slNo', header: 'SL.No.', cell: ({ row }) => row.index + 1 },
        { accessorKey: 'studentname', header: 'Student Name' },
        { accessorKey: 'AMST_AdmNo', header: 'Adm. No' },
        { accessorKey: 'ASMCL_ClassName', header: 'Class' },
        { accessorKey: 'HLMH_Name', header: 'Hostel' },
        {
            accessorKey: 'HLSTIO_PunchDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.HLSTIO_PunchDate), 'dd/MM/yyyy')
        },
        { accessorKey: 'HLSTIO_PunchTime', header: 'Time' },
        { accessorKey: 'HLSTIO_InOutFlg', header: 'In/Out' },
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading title="Student In/Out Report" description="View student daily attendance/movement." />
                <Separator />
                <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="HLMH_Id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hostel</FormLabel>
                                                <FormControl>
                                                    <CustomSelect
                                                        options={hostels.map(h => ({ label: h.hlmH_Name, value: h.hlmH_Id.toString() }))}
                                                        {...field}
                                                    />
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
                                fileName="InOut_Report"
                                columns={[
                                    { label: 'Student Name', value: 'studentname' },
                                    { label: 'Adm. No', value: 'AMST_AdmNo' },
                                    { label: 'Class', value: 'ASMCL_ClassName' },
                                    { label: 'Hostel', value: 'HLMH_Name' },
                                    { label: 'Time', value: 'HLSTIO_PunchTime' },
                                    { label: 'In/Out', value: 'HLSTIO_InOutFlg' }
                                ]}
                            />
                        </div>
                        <DataTable columns={columns} data={reportData} searchKey="studentname" />
                    </div>
                )}
            </div>
        </div>
    );
}
