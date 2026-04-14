'use client';

import { CalendarIcon, Check, Loader2, Printer, RotateCcw, FileText } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import {
    useGetBbkvCustomReportDetails,
    useGetBbkvCustomReportNameRegNo,
    useGetBbkvCustomReportTcDetails,
    useGetBbkvCustomReportTempPerChange
} from '@/hooks/admission/preadmission/reports/useBbkvCustomReport';

import TcReportPrint from './_components/tc-report-print';

export default function NotredameCustomTcReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    // Initial Data
    const { data: detailsData } = useGetBbkvCustomReportDetails();
    
    // Mutations
    const searchMutation = useGetBbkvCustomReportNameRegNo();
    const tcDetailsMutation = useGetBbkvCustomReportTcDetails();
    const tempPerChangeMutation = useGetBbkvCustomReportTempPerChange();

    // State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [searchBy, setSearchBy] = useState<'regno' | 'stdname'>('regno');
    const [studentType, setStudentType] = useState<'temp' | 'per'>('per');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);

    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch student list when Academic Year, Search By, or Student Type changes
    useEffect(() => {
        if (academicYearId) {
            handleStudentListRefresh();
        }
    }, [academicYearId, searchBy, studentType]);

    const handleStudentListRefresh = () => {
        if (!academicYearId) return;

        searchMutation.mutate(
            {
                ASMAY_Id: academicYearId,
                admnoorname: searchBy,
                tctemporper: studentType
            },
            {
                onSuccess: (response: any) => {
                    const list = response?.data || response?.studentlist || [];
                    setStudentDropdown(Array.isArray(list) ? list : []);
                    setSelectedStudent(null);
                    setSearchQuery('');
                },
                onError: () => {
                    toast.error('Failed to fetch student list');
                }
            }
        );
    };

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (!selectedStudent) {
            toast.error('Select Student');
            return;
        }

        try {
            setIsLoading(true);
            setShowReport(false);
            setReportData(null);

            tcDetailsMutation.mutate(
                {
                    ASMAY_Id: academicYearId,
                    AMST_Id: selectedStudent.amsT_Id,
                    tctemporper: studentType
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        if (data.studentTCList && data.studentTCList.length > 0) {
                            setReportData(data);
                            setShowReport(true);
                        } else {
                            toast.error('TC details not found for this student');
                        }
                    },
                    onError: () => {
                        toast.error('Failed to fetch TC details');
                    },
                    onSettled: () => {
                        setIsLoading(false);
                    }
                }
            );
        } catch {
            toast.error('An error occurred');
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setSearchBy('regno');
        setStudentType('per');
        setSelectedStudent(null);
        setSearchQuery('');
        setStudentDropdown([]);
        setShowReport(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Notredame_TC_${selectedStudent?.studentname || 'Report'}`
    });

    const students = useMemo(() => {
        return studentDropdown.map((s: any) => {
            const rawName = s.studentname || `${s.amsT_FirstName || ''} ${s.amsT_LastName || ''}`.trim();
            let displayName = rawName;
            if (rawName.includes(':')) {
                const [name, regNo] = rawName.split(':');
                displayName = `${regNo.trim()}:${name.trim()}`;
            }
            return {
                ...s,
                displayName,
                amsT_Id: s.amsT_Id || s.amst_Id
            };
        });
    }, [studentDropdown]);

    return (
        <div className="p-4 space-y-6">
            <CollapsibleSection
                title="TC Custom Report"
                description="Notredame High School - Transfer Certificate Custom Report"
                defaultOpen={true}
                variant="outline"
                className="shadow-md"
            >
                <div className="space-y-8 bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-center h-12 px-4 rounded-xl border bg-slate-50/50">
                                <RadioGroup
                                    value={searchBy}
                                    onValueChange={(v) => setSearchBy(v as any)}
                                    className="flex space-x-8"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="regno" id="search-adm" className="border-indigo-500 text-indigo-600" />
                                        <Label htmlFor="search-adm" className="text-sm font-medium cursor-pointer">Admno</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="stdname" id="search-name" className="border-indigo-500 text-indigo-600" />
                                        <Label htmlFor="search-name" className="text-sm font-medium cursor-pointer">Name</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Label className="text-sm font-bold w-32">Academic Year:<span className="text-red-500">*</span></Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => setAcademicYearId(Number(v))}
                                >
                                    <SelectTrigger className="h-10 rounded-xl bg-white">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(detailsData as any)?.data?.accyear?.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        )) || (detailsData as any)?.accyear?.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-center h-12 px-4 rounded-xl border bg-slate-50/50">
                                <RadioGroup
                                    value={studentType}
                                    onValueChange={(v) => setStudentType(v as any)}
                                    className="flex space-x-8"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="temp" id="type-temp" className="border-indigo-500 text-indigo-600" />
                                        <Label htmlFor="type-temp" className="text-sm font-medium cursor-pointer">Temp Student</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="per" id="type-per" className="border-indigo-500 text-indigo-600" />
                                        <Label htmlFor="type-per" className="text-sm font-medium cursor-pointer">Permanent Student</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Label className="text-sm font-bold w-32">Student Name:<span className="text-red-500">*</span></Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="relative w-full">
                                            <input
                                                value={selectedStudent ? selectedStudent.displayName : searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setSelectedStudent(null);
                                                    setStudentOpen(true);
                                                }}
                                                onFocus={() => setStudentOpen(true)}
                                                className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                placeholder="Select or search Student in the list"
                                                disabled={!academicYearId}
                                            />
                                            {searchMutation.isPending && (
                                                <div className="absolute right-2 top-2">
                                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0" align="start">
                                        <Command>
                                            <CommandList className="max-h-[300px]">
                                                <CommandEmpty>No students found.</CommandEmpty>
                                                <CommandGroup>
                                                    {students.map((student: any) => (
                                                        <CommandItem
                                                            key={student.amsT_Id}
                                                            onSelect={() => {
                                                                setSelectedStudent(student);
                                                                setSearchQuery(student.displayName);
                                                                setStudentOpen(false);
                                                            }}
                                                            className="hover:bg-indigo-50 cursor-pointer py-2"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-indigo-600",
                                                                    selectedStudent?.amsT_Id === student.amsT_Id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{student.displayName}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-10 border-t">
                        <Button
                            onClick={handleReport}
                            disabled={isLoading || !selectedStudent}
                            className="w-32 h-10 bg-[#7b8ae1] hover:bg-[#6a79d0] text-white font-bold rounded-xl shadow-md uppercase"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            REPORT
                        </Button>
                        <Button
                            onClick={handleReset}
                            className="w-32 h-10 bg-[#f44336] hover:bg-[#d32f2f] text-white font-bold rounded-xl shadow-md uppercase"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            CANCEL
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showReport}
                            className="w-32 h-10 bg-[#90a4ae] hover:bg-[#78909c] text-white font-bold rounded-xl shadow-md uppercase"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className="mt-8 flex justify-center bg-slate-100 p-10 rounded-xl border-4 border-dashed border-slate-300">
                    <div className="bg-white shadow-2xl p-4">
                        <TcReportPrint ref={printRef} data={reportData} />
                    </div>
                </div>
            )}
        </div>
    );
}
