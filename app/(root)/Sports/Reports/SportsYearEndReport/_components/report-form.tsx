'use client';

import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IYearEndReport, YearEndReportFormSchema, yearEndReportSchema } from '@/types/sports/reports/year-end-report';
import { useYearEndReport } from '@/hooks/sports/useYearEndReport';

interface ReportFormProps {
    setReportData: (data: IYearEndReport[]) => void;
}

export default function ReportForm({ setReportData }: ReportFormProps) {
    const { loadData, generateReport } = useYearEndReport();

    // Local state for search filters
    const [classSearch, setClassSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<YearEndReportFormSchema>({
        resolver: zodResolver(yearEndReportSchema),
        defaultValues: {
            Type: 'AY',
            selectedClasslist: [],
            selectedSectionlist: [],
        },
    });

    const watchType = useWatch({ control, name: 'Type' });
    const watchClasses = useWatch({ control, name: 'selectedClasslist' }) || [];
    const watchSections = useWatch({ control, name: 'selectedSectionlist' }) || [];

    // Reset dependents when Type changes
    useEffect(() => {
        setValue('selectedClasslist', []);
        setValue('selectedSectionlist', []);
        setReportData([]);
        setClassSearch('');
        setSectionSearch('');
    }, [watchType, setValue, setReportData]);


    const onSubmit = (data: YearEndReportFormSchema) => {
        generateReport.mutate(data, {
            onSuccess: (result) => {
                setReportData(result || []);
                toast.success('Report generated successfully!');
            },
            onError: (error) => {
                toast.error('Failed to generate report.');
            },
        });
    };

    const handleClear = () => {
        setValue('Type', 'AY');
        setValue('ASMAY_Id', 0);
        setValue('selectedClasslist', []);
        setValue('selectedSectionlist', []);
        setReportData([]);
        setClassSearch('');
        setSectionSearch('');
    };

    // --- Class Multi-Select Helpers ---
    const classList = loadData.data?.classList || [];
    const filteredClasses = classList.filter(c =>
        c.asmcL_ClassName.toLowerCase().includes(classSearch.toLowerCase())
    );

    const toggleSelectAllClasses = () => {
        if (watchClasses.length === filteredClasses.length && filteredClasses.length > 0) {
            setValue('selectedClasslist', []);
        } else {
            const allIds = filteredClasses.map(c => ({ asmcL_Id: c.asmcL_Id }));
            setValue('selectedClasslist', allIds);
        }
    };

    const isClassSelected = (id: number) => watchClasses.some(c => c.asmcL_Id === id);

    const toggleClass = (id: number) => {
        const current = watchClasses;
        if (isClassSelected(id)) {
            setValue('selectedClasslist', current.filter(c => c.asmcL_Id !== id));
        } else {
            setValue('selectedClasslist', [...current, { asmcL_Id: id }]);
        }
    };

    // --- Section Multi-Select Helpers ---
    const sectionList = loadData.data?.sectionList || [];
    const filteredSections = sectionList.filter(s =>
        s.asmC_SectionName.toLowerCase().includes(sectionSearch.toLowerCase())
    );

    const toggleSelectAllSections = () => {
        if (watchSections.length === filteredSections.length && filteredSections.length > 0) {
            setValue('selectedSectionlist', []);
        } else {
            const allIds = filteredSections.map(s => ({ asmS_Id: s.asmS_Id }));
            setValue('selectedSectionlist', allIds);
        }
    };

    const isSectionSelected = (id: number) => watchSections.some(s => s.asmS_Id === id);

    const toggleSection = (id: number) => {
        const current = watchSections;
        if (isSectionSelected(id)) {
            setValue('selectedSectionlist', current.filter(s => s.asmS_Id !== id));
        } else {
            setValue('selectedSectionlist', [...current, { asmS_Id: id }]);
        }
    };


    return (
        <div className="rounded-md border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b pb-2">
                <h2 className="text-lg font-semibold">Year End Report</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Radio Group: Academic Year vs Class/Section */}
                <div className="flex justify-center space-x-6 bg-slate-50 p-3 rounded-md border">
                    <Controller
                        control={control}
                        name="Type"
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-8"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="AY" id="r1" />
                                    <Label htmlFor="r1" className="font-medium cursor-pointer">Academic Year</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="CS" id="r2" />
                                    <Label htmlFor="r2" className="font-medium cursor-pointer">By Class/Section</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-6">

                    {/* Row 1: Academic Year */}
                    <div className="w-full md:w-1/2 lg:w-1/3 mx-auto">
                        <Label>Academic Year <span className="text-red-500">*</span></Label>
                        <Controller
                            control={control}
                            name="ASMAY_Id"
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadData.data?.academicYear.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className="text-sm font-medium text-destructive">{errors.ASMAY_Id.message}</p>}
                    </div>

                    {/* Row 2: Class & Section (Visible only for Type 'CS') */}
                    {watchType === 'CS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Class View Filter */}
                            <div className="space-y-2">
                                <Label>Class Name <span className="text-red-500">*</span></Label>
                                <div className="rounded-md border p-2 bg-white">
                                    <Input
                                        placeholder="Search Class..."
                                        className="mb-2 h-8"
                                        value={classSearch}
                                        onChange={(e) => setClassSearch(e.target.value)}
                                    />
                                    <div className="mb-2 flex items-center space-x-2 border-b pb-1">
                                        <Checkbox
                                            id="select-all-classes"
                                            checked={filteredClasses.length > 0 && watchClasses.length === filteredClasses.length}
                                            onCheckedChange={toggleSelectAllClasses}
                                        />
                                        <label htmlFor="select-all-classes" className="cursor-pointer text-sm font-semibold">
                                            All
                                        </label>
                                    </div>
                                    <ScrollArea className="h-40">
                                        <div className="space-y-2">
                                            {filteredClasses.map((item) => (
                                                <div key={item.asmcL_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`cls-${item.asmcL_Id}`}
                                                        checked={isClassSelected(item.asmcL_Id)}
                                                        onCheckedChange={() => toggleClass(item.asmcL_Id)}
                                                    />
                                                    <label htmlFor={`cls-${item.asmcL_Id}`} className="cursor-pointer text-sm">
                                                        {item.asmcL_ClassName}
                                                    </label>
                                                </div>
                                            ))}
                                            {filteredClasses.length === 0 && (
                                                <p className="text-center text-xs text-muted-foreground">No classes found</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                                {errors.selectedClasslist && (
                                    <p className="text-sm font-medium text-destructive">{errors.selectedClasslist.message}</p>
                                )}
                            </div>

                            {/* Section View Filter */}
                            <div className="space-y-2">
                                <Label>Section Name <span className="text-red-500">*</span></Label>
                                <div className="rounded-md border p-2 bg-white">
                                    <Input
                                        placeholder="Search Section..."
                                        className="mb-2 h-8"
                                        value={sectionSearch}
                                        onChange={(e) => setSectionSearch(e.target.value)}
                                    />
                                    <div className="mb-2 flex items-center space-x-2 border-b pb-1">
                                        <Checkbox
                                            id="select-all-sections"
                                            checked={filteredSections.length > 0 && watchSections.length === filteredSections.length}
                                            onCheckedChange={toggleSelectAllSections}
                                        />
                                        <label htmlFor="select-all-sections" className="cursor-pointer text-sm font-semibold">
                                            All
                                        </label>
                                    </div>
                                    <ScrollArea className="h-40">
                                        <div className="space-y-2">
                                            {filteredSections.map((item) => (
                                                <div key={item.asmS_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`sec-${item.asmS_Id}`}
                                                        checked={isSectionSelected(item.asmS_Id)}
                                                        onCheckedChange={() => toggleSection(item.asmS_Id)}
                                                    />
                                                    <label htmlFor={`sec-${item.asmS_Id}`} className="cursor-pointer text-sm">
                                                        {item.asmC_SectionName}
                                                    </label>
                                                </div>
                                            ))}
                                            {filteredSections.length === 0 && (
                                                <p className="text-center text-xs text-muted-foreground">No sections found</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                                {errors.selectedSectionlist && (
                                    <p className="text-sm font-medium text-destructive">{errors.selectedSectionlist.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex justify-center gap-4 pt-4 border-t">
                    <Button type="submit" disabled={generateReport.isPending}>
                        {generateReport.isPending ? 'Generating...' : 'Report'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => toast.info('Excel Export functionality mock')}>
                        Export to Excel
                    </Button>
                    <Button type="button" variant="outline" onClick={() => toast.info('Print functionality mock')}>
                        Print
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleClear}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
