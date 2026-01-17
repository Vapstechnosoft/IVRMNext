"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFeeDetails } from "../actions";
import { AcademicYear, FeeDetailsLoadData, FeeHeadData, FeeDetailsOverallData } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FeeDetailsClientProps {
    initialData: FeeDetailsLoadData;
}

const COLORS = ["#3498DB", "#76D7C4", "#808B96", "#80DEEA", "#C5E1A5", "#AAB7B8"];

export default function FeeDetailsClient({ initialData }: FeeDetailsClientProps) {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("");

    // Fee data state
    const [overallData, setOverallData] = useState<FeeDetailsOverallData[]>([]);
    const [detailedData, setDetailedData] = useState<FeeHeadData[]>([]);

    // UI state
    const [viewMode, setViewMode] = useState<"overall" | "detailed">("overall");
    const [isLoading, setIsLoading] = useState(false);
    const [hasData, setHasData] = useState(false);

    // Initial load
    useEffect(() => {
        if (initialData && initialData.yearclsList) {
            setAcademicYears(initialData.yearclsList);
            // Auto-select current year if available
            if (initialData.feecurrentyear && initialData.feecurrentyear.length > 0) {
                const currentYearId = initialData.feecurrentyear[0].ASMAY_Id.toString();
                // Check if this year exists in the full list
                if (initialData.yearclsList.some(y => y.ASMAY_Id.toString() === currentYearId)) {
                    setSelectedYear(currentYearId);
                    // Optionally auto-load data here if desired, but let's wait for user interaction or trigger it
                    fetchFees(currentYearId, viewMode);
                }
            } else if (initialData.yearclsList.length > 0) {
                // Fallback to first in list
                const firstYearId = initialData.yearclsList[0].ASMAY_Id.toString();
                setSelectedYear(firstYearId);
                fetchFees(firstYearId, viewMode);
            }
        }
    }, [initialData]);

    const fetchFees = async (yearId: string, mode: "overall" | "detailed") => {
        if (!yearId) return;

        setIsLoading(true);
        setHasData(false);
        setOverallData([]);
        setDetailedData([]);

        try {
            const response = await getFeeDetails({
                ASMAY_Id: parseInt(yearId),
                type: mode
            });

            if (response && response.getfeedetails && response.getfeedetails.length > 0) {
                setHasData(true);
                if (mode === 'overall') {
                    // Cast safely as we know the structure based on mode
                    setOverallData(response.getfeedetails as unknown as FeeDetailsOverallData[]);
                } else {
                    setDetailedData(response.getfeedetails as unknown as FeeHeadData[]);
                }
            } else {
                toast.info("No fee details found for the selected criteria.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch fee details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleYearChange = (yearId: string) => {
        setSelectedYear(yearId);
        fetchFees(yearId, viewMode);
    };

    const handleViewModeChange = (mode: "overall" | "detailed") => {
        setViewMode(mode);
        fetchFees(selectedYear, mode); // Refetch when mode changes as API endpoint depends on it
    };

    // --- Chart Data Preparation ---

    // Overall Charts
    const overallBarData = overallData.map(item => [
        { name: "RECEIVABLE", value: item.Receivable },
        { name: "CONCESSION", value: item.Concession },
        { name: "COLLECTION", value: item.Collectionamount },
        { name: "ADJUSTMENT", value: item.Adjusted },
        { name: "BALANCE", value: item.Balance }
    ]).flat();

    const overallPieData = overallBarData; // Same data structure works for Pie

    // Detailed Charts
    const detailedChartData = detailedData.map(item => ({
        name: item.FEE_HEAD,
        Receivable: item.RECEIVABLE,
        Concession: item.CONCESSION,
        Collection: item.COLLECTION,
        Adjustment: item.ADJUSTMENT,
        Balance: item.BALANCE
    }));


    return (
        <div className="space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <CardTitle className="text-xl font-bold uppercase text-primary">Fee Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* View Mode Selection - Replacing Radio Buttons with stylized choices or clean radio group */}
                        <div className="space-y-3">
                            <Label>Analysis Type</Label>
                            <RadioGroup
                                defaultValue="overall"
                                value={viewMode}
                                onValueChange={(val) => handleViewModeChange(val as "overall" | "detailed")}
                                className="flex flex-row space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="overall" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer">Overall Fees Analysis</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="detailed" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer">Detailed Fees Analysis</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Year Selection */}
                        <div className="space-y-2">
                            <Label>Academic Year/Class <span className="text-red-500">*</span></Label>
                            <Select value={selectedYear} onValueChange={handleYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year.ASMAY_Id} value={year.ASMAY_Id.toString()}>
                                            {year.ASMAY_Year} - {year.ASMCL_ClassName} : {year.ASMC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && hasData && viewMode === 'overall' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-center">Sl.No.</TableHead>
                                        <TableHead className="text-center">Net Amount</TableHead>
                                        <TableHead className="text-center">Concession</TableHead>
                                        <TableHead className="text-center">Collection</TableHead>
                                        <TableHead className="text-center">Adjustment</TableHead>
                                        <TableHead className="text-center">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overallData.map((row, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50">
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center font-semibold">{row.Concession + row.Collectionamount + row.Balance}</TableCell>
                                            <TableCell className="text-center">{row.Concession}</TableCell>
                                            <TableCell className="text-center text-green-600 font-bold">{row.Collectionamount}</TableCell>
                                            <TableCell className="text-center">{row.Adjusted}</TableCell>
                                            <TableCell className="text-center text-red-600 font-bold">{row.Balance}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-md">
                            <CardHeader className="border-b bg-red-50/50">
                                <CardTitle className="text-base text-red-800">Overall Fees Analysis (Bar)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overallBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                                            {overallBarData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader className="border-b bg-blue-50/50">
                                <CardTitle className="text-base text-blue-800">Overall Fees Analysis (Pie)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={overallPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {overallPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!isLoading && hasData && viewMode === 'detailed' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card>
                        <Tabs defaultValue="data" className="w-full">
                            <CardHeader className="pb-0 border-b">
                                <TabsList className="grid w-full grid-cols-3 max-w-md">
                                    <TabsTrigger value="data">Data Analysis</TabsTrigger>
                                    <TabsTrigger value="bar">Bar Graph</TabsTrigger>
                                    <TabsTrigger value="line">Area Graph</TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <TabsContent value="data" className="mt-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead>Fee Head</TableHead>
                                                <TableHead className="text-center">Receivable</TableHead>
                                                <TableHead className="text-center">Concession</TableHead>
                                                <TableHead className="text-center">Collection</TableHead>
                                                <TableHead className="text-center">Adjustment</TableHead>
                                                <TableHead className="text-center">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detailedData.map((row, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium">{row.FEE_HEAD}</TableCell>
                                                    <TableCell className="text-center">{row.RECEIVABLE}</TableCell>
                                                    <TableCell className="text-center">{row.CONCESSION}</TableCell>
                                                    <TableCell className="text-center text-green-600 font-bold">{row.COLLECTION}</TableCell>
                                                    <TableCell className="text-center">{row.ADJUSTMENT}</TableCell>
                                                    <TableCell className="text-center text-red-600 font-bold">{row.BALANCE}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                                <TabsContent value="bar" className="h-[500px] mt-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={detailedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Receivable" fill="#3498DB" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Concession" fill="#76D7C4" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Collection" fill="#808B96" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Adjustment" fill="#80DEEA" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Balance" fill="#C5E1A5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </TabsContent>
                                <TabsContent value="line" className="h-[500px] mt-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={detailedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="Receivable" stackId="1" stroke="#3498DB" fill="#3498DB" />
                                            <Area type="monotone" dataKey="Concession" stackId="1" stroke="#76D7C4" fill="#76D7C4" />
                                            <Area type="monotone" dataKey="Collection" stackId="1" stroke="#808B96" fill="#808B96" />
                                            <Area type="monotone" dataKey="Adjustment" stackId="1" stroke="#80DEEA" fill="#80DEEA" />
                                            <Area type="monotone" dataKey="Balance" stackId="1" stroke="#C5E1A5" fill="#C5E1A5" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            )}
        </div>
    );
}
