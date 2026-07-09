'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Search, Loader2, BarChart2 } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell 
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

import {
    useCountStatusReportInitialDetails,
    useCountStatusReportData
} from '@/hooks/admission/preadmission/reports/useCountStatusReport';

import { 
    getApplicationStatusColumns, 
    getAdmissionStatusColumns, 
    type IApplicationStatus, 
    type IAdmissionStatus 
} from './_components/columns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function CountStatusReportPage() {
    // Hooks
    const { data: initialData, isLoading: isInitialLoading } = useCountStatusReportInitialDetails();
    const reportMutation = useCountStatusReportData();

    // State
    const [academicYearId, setAcademicYearId] = useState<string>('0');
    
    // Data State
    const [appStatusData, setAppStatusData] = useState<IApplicationStatus[]>([]);
    const [admissionStatusData, setAdmissionStatusData] = useState<IAdmissionStatus[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGraphs, setShowGraphs] = useState(false);

    // Graph Data
    const [appChartData, setAppChartData] = useState<any[]>([]);
    const [adminChartData, setAdminChartData] = useState<any[]>([]);

    const chartsRef = useRef<HTMLDivElement>(null);

    // Initial load handling for default year if needed, though Angular had "ALL" value="0" by default
    useEffect(() => {
        if (!academicYearId && initialData?.data?.academicList?.length > 0) {
            setAcademicYearId('0'); // 0 means ALL
        }
        
        // Emulate ShowReport_today from angular init
        if (initialData && initialData.data && initialData.data.academicList) {
            handleGetReport('0');
        }
    }, [initialData]);

    const handleYearChange = (val: string) => {
        setAcademicYearId(val);
        handleGetReport(val);
    };

    const handleGetReport = async (yearId: string) => {
        try {
            setIsGenerating(true);
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: Number(yearId),
            });

            const newuser: IAdmissionStatus[] = res?.data?.countreportstatus || [];
            const appstatus: IApplicationStatus[] = res?.data?.applicationstatus || [];

            setAdmissionStatusData(newuser);
            setAppStatusData(appstatus);
            setShowGraphs(false);

            if (newuser.length === 0 && appstatus.length === 0) {
                toast.info('No Record found!!');
                setAppChartData([]);
                setAdminChartData([]);
                return;
            }
            
            // Format Admission Status Chart Data
            const admData = newuser.map(item => ({
                name: item.PAMST_Status,
                count: item.Data_count
            }));
            setAdminChartData(admData);

            // Format Application Status Chart Data
            const applicationData = appstatus.map(item => {
                let name = String(item.PASRAPS_ID);
                if (item.PASRAPS_ID === 787926) name = "APP WAITING";
                else if (item.PASRAPS_ID === 787927) name = "APP REJECTED";
                else if (item.PASRAPS_ID === 787928) name = "APP ACCEPTED";
                
                return {
                    name: name,
                    count: item.data
                };
            });
            setAppChartData(applicationData);

        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleViewGraphs = () => {
        setShowGraphs(true);
        setTimeout(() => {
            chartsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const appStatusCols = getApplicationStatusColumns();
    const admStatusCols = getAdmissionStatusColumns();

    return (
        <div className="min-h-screen p-4 space-y-6 bg-gray-50">
            <CollapsibleSection
                title="Status Count Report"
                description="View status count report details and graphs"
                defaultOpen={true}
                variant="outline"
                className="shadow-md"
            >
                <div className="space-y-8 bg-white p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Academic Year:<span className="text-red-500">*</span></Label>
                            <Select
                                value={academicYearId}
                                onValueChange={handleYearChange}
                                disabled={isInitialLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">ALL</SelectItem>
                                    {initialData?.data?.academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button
                            onClick={() => handleGetReport(academicYearId)}
                            disabled={isGenerating}
                            className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg"
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Search
                        </Button>
                        
                        {(appStatusData.length > 0 || admissionStatusData.length > 0) && (
                            <Button
                                onClick={handleViewGraphs}
                                variant="outline"
                                className="min-w-[140px] font-bold"
                            >
                                <BarChart2 className="mr-2 h-4 w-4" />
                                View Graphs
                            </Button>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {appStatusData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-bold uppercase text-indigo-700">Application Status Details</h3>
                    </div>
                    <GenericDataTable
                        data={appStatusData}
                        columns={appStatusCols}
                        isLoading={isGenerating}
                    />
                </div>
            )}

            {admissionStatusData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-bold uppercase text-indigo-700">Status Details</h3>
                    </div>
                    <GenericDataTable
                        data={admissionStatusData}
                        columns={admStatusCols}
                        isLoading={isGenerating}
                    />
                </div>
            )}

            {showGraphs && (appChartData.length > 0 || adminChartData.length > 0) && (
                <div ref={chartsRef} className="bg-white p-6 rounded-lg shadow-md space-y-8">
                    
                    {appChartData.length > 0 && (
                        <div className="space-y-6 border-b pb-8">
                            <h3 className="text-center text-xl font-bold uppercase text-gray-800">Chart Representation Of Application Status Count</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={appChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#4f46e5" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-[300px] w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={appChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="name"
                                                label
                                            >
                                                {appChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {adminChartData.length > 0 && (
                        <div className="space-y-6 pt-4">
                            <h3 className="text-center text-xl font-bold uppercase text-gray-800">Chart Representation Of Admission Status Count</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={adminChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#059669" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-[300px] w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={adminChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#82ca9d"
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="name"
                                                label
                                            >
                                                {adminChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
