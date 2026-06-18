'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, BarChart2 } from 'lucide-react';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCountStatusReportData, useCountStatusReportInitialDetails } from '@/hooks/admission/preadmission/reports/useCountStatusReport';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const formSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function CountStatusReport() {
    const { data: initialDetails, isLoading: isInitialLoading } = useCountStatusReportInitialDetails();
    const [admissionData, setAdmissionData] = useState<any[]>([]);
    const [applicationData, setApplicationData] = useState<any[]>([]);
    const [showGraphs, setShowGraphs] = useState(false);

    const { mutate: getReportData, isPending } = useCountStatusReportData();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ASMAY_Id: '0'
        }
    });

    const onSubmit = (data: FormValues) => {
        const payload = {
            ASMAY_Id: Number(data.ASMAY_Id)
        };

        getReportData(payload, {
            onSuccess: (res: any) => {
                if (res?.countreportstatus?.length > 0 || res?.applicationstatus?.length > 0) {
                    setAdmissionData(res.countreportstatus || []);
                    
                    const mappedAppStatus = (res.applicationstatus || []).map((item: any) => {
                        let statusName = '';
                        if (item.PASRAPS_ID === 787926) statusName = 'APP WAITING';
                        else if (item.PASRAPS_ID === 787927) statusName = 'APP REJECTED';
                        else if (item.PASRAPS_ID === 787928) statusName = 'APP ACCEPTED';
                        else statusName = `Status ${item.PASRAPS_ID}`;

                        return {
                            ...item,
                            statusName,
                            data: item.data
                        };
                    });
                    
                    setApplicationData(mappedAppStatus);
                    setShowGraphs(true);
                } else {
                    setAdmissionData([]);
                    setApplicationData([]);
                    setShowGraphs(false);
                    toast.info('No Record found!!');
                }
            },
            onError: () => {
                toast.error('Failed to fetch data');
            }
        });
    };

    const admissionColumns = [
        { accessorKey: 'sno', header: 'SL.NO', cell: (info: any) => info.row.index + 1 },
        { accessorKey: 'PAMST_Status', header: 'Admission Status' },
        { accessorKey: 'Data_count', header: 'Count' }
    ];

    const applicationColumns = [
        { accessorKey: 'sno', header: 'SL.NO', cell: (info: any) => info.row.index + 1 },
        { accessorKey: 'statusName', header: 'Application Status' },
        { accessorKey: 'data', header: 'Count' }
    ];

    const admissionChartData = admissionData.map(item => ({
        name: item.PAMST_Status,
        value: item.Data_count
    }));

    const applicationChartData = applicationData.map(item => ({
        name: item.statusName,
        value: item.data
    }));

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Status Count Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ASMAY_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Academic Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">ALL</SelectItem>
                                                    {Array.isArray(initialDetails?.academicList) && initialDetails?.academicList?.map((item: any) => (
                                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                            {item.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-center gap-2">
                                <Button type="submit" disabled={isPending || isInitialLoading}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                {showGraphs && (
                                    <Button type="button" variant="outline" onClick={() => setShowGraphs(!showGraphs)}>
                                        <BarChart2 className="w-4 h-4 mr-2" />
                                        View Graphs
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {applicationData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Application Status Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <GenericDataTable
                            data={applicationData}
                            columns={applicationColumns}
                            isLoading={isPending}
                        />

                        {showGraphs && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-[300px]">
                                    <h3 className="text-center text-sm font-semibold mb-4">Chart Representation Of Application Status Count</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={applicationChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" name="Count">
                                                {applicationChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-[300px]">
                                    <h3 className="text-center text-sm font-semibold mb-4">Application Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={applicationChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {applicationChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {admissionData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Status Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <GenericDataTable
                            data={admissionData}
                            columns={admissionColumns}
                            isLoading={isPending}
                        />

                        {showGraphs && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="h-[300px]">
                                    <h3 className="text-center text-sm font-semibold mb-4">Chart Representation Of Admission Status Count</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={admissionChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#82ca9d" name="Count">
                                                {admissionChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-[300px]">
                                    <h3 className="text-center text-sm font-semibold mb-4">Admission Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={admissionChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#82ca9d"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {admissionChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
