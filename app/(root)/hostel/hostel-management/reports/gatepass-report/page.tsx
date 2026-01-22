'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gatepassReportSchema, GatepassReportValues } from '@/schemas/hostel/reports/attendance-reports.schema';
import { getGatepassReport, getGatepassReportLoadData } from '@/server/hostel/reports/attendance-reports';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

export default function GatepassReportPage() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAll, setIsAll] = useState(true);

    const form = useForm<GatepassReportValues>({
        resolver: zodResolver(gatepassReportSchema),
        defaultValues: {
            allFlg: true,
            fromDate: new Date(),
            toDate: new Date(),
        },
    });

    useEffect(() => {
        async function load() {
            const data = await getGatepassReportLoadData();
            if (data && data.studentlist) {
                setStudents(data.studentlist);
            }
        }
        load();
    }, []);

    async function onSubmit(values: GatepassReportValues) {
        setLoading(true);
        const data = await getGatepassReport(values);
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
            accessorKey: 'HLSTGP_GatePassDate',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.HLSTGP_GatePassDate), 'dd/MM/yyyy')
        },
        { accessorKey: 'HLSTGP_GatePassNo', header: 'Gatepass No' },
        { accessorKey: 'HLSTGP_Reason', header: 'Reason' },
    ];

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading title="Student Gatepass Report" description="View student gatepass history." />
                <Separator />
                <Card>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="allFlg"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Filter Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(v) => { field.onChange(v === 'all'); setIsAll(v === 'all'); }}
                                                        defaultValue={field.value ? 'all' : 'student'}
                                                        className="flex flex-row space-x-4"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value="all" /></FormControl>
                                                            <FormLabel className="font-normal">All</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl><RadioGroupItem value="student" /></FormControl>
                                                            <FormLabel className="font-normal">Individual</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {!isAll && (
                                        <FormField
                                            control={form.control}
                                            name="AMST_Id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Student</FormLabel>
                                                    <FormControl>
                                                        <CustomSelect
                                                            options={students.map(s => ({ label: `${s.studentname} (${s.amsT_AdmNo})`, value: s.amsT_Id.toString() }))}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
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
                                fileName="Gatepass_Report"
                                columns={[
                                    { label: 'Student Name', value: 'studentname' },
                                    { label: 'Adm. No', value: 'AMST_AdmNo' },
                                    { label: 'Class', value: 'ASMCL_ClassName' },
                                    { label: 'Hostel', value: 'HLMH_Name' },
                                    { label: 'Gatepass No', value: 'HLSTGP_GatePassNo' },
                                    { label: 'Reason', value: 'HLSTGP_Reason' }
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
