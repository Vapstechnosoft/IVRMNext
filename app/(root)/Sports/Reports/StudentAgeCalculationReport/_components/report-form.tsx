'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStudentAgeReport } from '@/hooks/sports/useStudentAgeReport';
import { studentAgeReportSchema } from '@/types/sports/reports/student-age-calculation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, List, FileSpreadsheet, Printer, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ReportFormProps {
    onReportGenerated: (data: any) => void;
}

export default function ReportForm({ onReportGenerated }: ReportFormProps) {
    const { loadData, getClasses, getSections, generateReport } = useStudentAgeReport();
    const [houses, setHouses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);

    // Filter states
    const [houseFilter, setHouseFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(studentAgeReportSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: 0,
            asmcL_Id: 0,
            selectedHouseList: [],
            selectedSectionList: []
        } as any
    });

    const reportType = watch('type');
    const selectedYear = watch('asmaY_Id');
    const selectedClass = watch('asmcL_Id');
    const selectedHouses = watch('selectedHouseList') || [];
    const selectedSections = watch('selectedSectionList') || [];

    // Load initial data
    useEffect(() => {
        if (loadData.data?.houseList) {
            setHouses(loadData.data.houseList.map((h: any) => ({ ...h, selected: false })));
        }
    }, [loadData.data]);

    // Handle Year Change
    useEffect(() => {
        if (selectedYear) {
            getClasses.mutate(selectedYear);
        }
    }, [selectedYear]);

    // Handle Class Change
    useEffect(() => {
        if (selectedYear && selectedClass && reportType === 'CS') {
            getSections.mutate({ asmaY_Id: selectedYear, asmcL_Id: selectedClass }, {
                onSuccess: (data) => {
                    setSections(data.sectionList.map((s: any) => ({ ...s, selected: false })));
                }
            });
        }
    }, [selectedYear, selectedClass, reportType]);

    const handleFormSubmit = (data: any) => {
        let finalData = { ...data };

        if (reportType === 'House') {
            const activeHouses = houses.filter(h => h.selected).map(h => ({ spccmH_Id: h.spccmH_Id }));
            if (activeHouses.length === 0) {
                toast.error('Please select at least one House');
                return;
            }
            finalData.selectedHouseList = activeHouses;
        } else {
            const activeSections = sections.filter(s => s.selected).map(s => ({ asmS_Id: s.asmS_Id }));
            if (activeSections.length === 0) {
                toast.error('Please select at least one Section');
                return;
            }
            finalData.selectedSectionList = activeSections;
        }

        generateReport.mutate(finalData, {
            onSuccess: (res) => {
                if (res.success && res.viewlist) {
                    onReportGenerated(res.viewlist);
                    toast.success('Report generated successfully');
                } else {
                    toast.error(res.message || 'No records found');
                }
            }
        });
    };

    const handleReset = () => {
        reset({
            type: 'House',
            asmaY_Id: 0,
            asmcL_Id: 0,
            selectedHouseList: [],
            selectedSectionList: []
        });
        setHouses(houses.map(h => ({ ...h, selected: false })));
        setSections(sections.map(s => ({ ...s, selected: false })));
        onReportGenerated(null);
    };

    const toggleAllHouses = (checked: boolean) => {
        setHouses(houses.map(h => ({ ...h, selected: checked })));
    };

    const toggleHouse = (index: number, checked: boolean) => {
        const newHouses = [...houses];
        newHouses[index].selected = checked;
        setHouses(newHouses);
    };

    const toggleAllSections = (checked: boolean) => {
        setSections(sections.map(s => ({ ...s, selected: checked })));
    };

    const toggleSection = (index: number, checked: boolean) => {
        const newSections = [...sections];
        newSections[index].selected = checked;
        setSections(newSections);
    };

    const filteredHouses = houses.filter(h => h.spccmH_HouseName.toLowerCase().includes(houseFilter.toLowerCase()));
    const filteredSections = sections.filter(s => s.asmC_SectionName.toLowerCase().includes(sectionFilter.toLowerCase()));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Student Age Calculation Report</CardTitle>
                <Button variant="ghost" size="sm" className="h-4 w-4">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Radio Group */}
                    <div className="flex justify-center p-4 bg-muted/20 rounded-lg">
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        onReportGenerated(null);
                                    }}
                                    defaultValue={field.value}
                                    className="flex space-x-8"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="House" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer font-medium">By House</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="CS" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer font-medium">By Class/Section</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <Label className="text-right">Academic Year: <span className="text-red-500">*</span></Label>
                                <div className="space-y-1">
                                    <Controller
                                        name="asmaY_Id"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value ? field.value.toString() : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadData.data?.yearlist?.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmaY_Id && <span className="text-xs text-red-500">{errors.asmaY_Id.message as string}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* House Selection */}
                            {reportType === 'House' && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                    <Label className="text-right pt-2">House Name: <span className="text-red-500">*</span></Label>
                                    <div className="border rounded-md p-2 space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="search here..."
                                                className="pl-8 h-8"
                                                value={houseFilter}
                                                onChange={(e) => setHouseFilter(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 px-1">
                                            <Checkbox
                                                checked={houses.length > 0 && houses.every(h => h.selected)}
                                                onCheckedChange={(checked) => toggleAllHouses(!!checked)}
                                            />
                                            <Label>All</Label>
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto space-y-1 px-1">
                                            {filteredHouses.map((house, idx) => (
                                                <div key={house.spccmH_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={house.selected}
                                                        onCheckedChange={(checked) => {
                                                            const originalIndex = houses.findIndex(h => h.spccmH_Id === house.spccmH_Id);
                                                            toggleHouse(originalIndex, !!checked);
                                                        }}
                                                    />
                                                    <span className="text-sm">{house.spccmH_HouseName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Class/Section Selection */}
                            {reportType === 'CS' && (
                                <>
                                    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                        <Label className="text-right">Class Name: <span className="text-red-500">*</span></Label>
                                        <div className="space-y-1">
                                            <Controller
                                                name="asmcL_Id"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value ? field.value.toString() : ''}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Class" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getClasses.data?.classList?.map((c: any) => (
                                                                <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.asmcL_Id && <span className="text-xs text-red-500">{errors.asmcL_Id.message as string}</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[140px_1fr] items-start gap-4 mt-4">
                                        <Label className="text-right pt-2">Section Name: <span className="text-red-500">*</span></Label>
                                        <div className="border rounded-md p-2 space-y-2">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="search here..."
                                                    className="pl-8 h-8"
                                                    value={sectionFilter}
                                                    onChange={(e) => setSectionFilter(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2 px-1">
                                                <Checkbox
                                                    checked={sections.length > 0 && sections.every(s => s.selected)}
                                                    onCheckedChange={(checked) => toggleAllSections(!!checked)}
                                                />
                                                <Label>All</Label>
                                            </div>
                                            <div className="max-h-[150px] overflow-y-auto space-y-1 px-1">
                                                {filteredSections.map((section, idx) => (
                                                    <div key={section.asmS_Id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            checked={section.selected}
                                                            onCheckedChange={(checked) => {
                                                                const originalIndex = sections.findIndex(s => s.asmS_Id === section.asmS_Id);
                                                                toggleSection(originalIndex, !!checked);
                                                            }}
                                                        />
                                                        <span className="text-sm">{section.asmC_SectionName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 pt-4 border-t">
                        <Button type="submit" disabled={generateReport.isPending} className="bg-primary hover:bg-primary/90">
                            {generateReport.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <List className="mr-2 h-4 w-4" />}
                            Report
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleReset} className="bg-red-500 hover:bg-red-600">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
