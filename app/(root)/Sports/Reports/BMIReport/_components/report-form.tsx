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
import { IBMIReport } from '@/types/sports/reports/bmi-report';
import { bmiReportSchema, BMIReportFormSchema } from '@/types/sports/reports/bmi-report';
import { useBMIReport } from '@/hooks/sports/useBMIReport';

interface ReportFormProps {
    setReportData: (data: IBMIReport[]) => void;
}

export default function ReportForm({ setReportData }: ReportFormProps) {
    const { loadData, getClasses, getSections, generateReport } = useBMIReport();

    // Local state for dynamic dropdowns
    const [classList, setClassList] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sectionList, setSectionList] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [sectionSearch, setSectionSearch] = useState('');

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<BMIReportFormSchema>({
        resolver: zodResolver(bmiReportSchema),
        defaultValues: {
            Type: 'House',
            selectedSectionlist: [],
        },
    });

    const watchType = useWatch({ control, name: 'Type' });
    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSections = useWatch({ control, name: 'selectedSectionlist' }) || [];

    // Reset dependents when Type changes
    useEffect(() => {
        setValue('ASMAY_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('SPCCMH_Id', 0);
        setValue('selectedSectionlist', []);
        setClassList([]);
        setSectionList([]);
        setReportData([]);
    }, [watchType, setValue, setReportData]);


    // Fetch Classes when Year Changes
    useEffect(() => {
        if (watchYear && watchType === 'CS') {
            getClasses.mutate(watchYear, {
                onSuccess: (data: any) => setClassList(data),
            });
        }
    }, [watchYear, watchType, getClasses.mutate]);

    // Fetch Sections when Class Changes
    useEffect(() => {
        if (watchYear && watchClass && watchType === 'CS') {
            getSections.mutate({ asMAY_Id: watchYear, asmcL_Id: watchClass }, {
                onSuccess: (data: any) => setSectionList(data),
            });
        }
    }, [watchClass, watchYear, watchType, getSections.mutate]);


    const onSubmit = (data: BMIReportFormSchema) => {
        generateReport.mutate(data as any, {
            onSuccess: (result) => {
                setReportData(result);
                toast.success('Report generated successfully!');
            },
            onError: (error) => {
                toast.error('Failed to generate report.');
            },
        });
    };

    const handleClear = () => {
        setValue('Type', 'House');
        setValue('ASMAY_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('SPCCMH_Id', 0);
        setValue('selectedSectionlist', []);
        setReportData([]);
        setClassList([]);
        setSectionList([]);
    };

    // Filtered Sections for Multi-select
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
                <h2 className="text-lg font-semibold">BMI Report</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Radio Group: House vs Class/Section */}
                <div className="space-y-3">
                    <Controller
                        control={control}
                        name="Type"
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="House" id="r1" />
                                    <Label htmlFor="r1" className="font-normal cursor-pointer">By House</Label>
                                </div>
                                <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="CS" id="r2" />
                                    <Label htmlFor="r2" className="font-normal cursor-pointer">By Class/Section</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                    {/* Academic Year */}
                    <div className="space-y-2">
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

                    {/* House View Fields */}
                    {watchType === 'House' && (
                        <div className="space-y-2">
                            <Label>House <span className="text-red-500">*</span></Label>
                            <Controller
                                control={control}
                                name="SPCCMH_Id"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select House" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadData.data?.houseList.map((item) => (
                                                <SelectItem key={item.spccmH_Id} value={item.spccmH_Id.toString()}>
                                                    {item.spccmH_HouseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.SPCCMH_Id && <p className="text-sm font-medium text-destructive">{errors.SPCCMH_Id.message}</p>}
                        </div>
                    )}


                    {/* Class/Section View Fields */}
                    {watchType === 'CS' && (
                        <>
                            <div className="space-y-2">
                                <Label>Class <span className="text-red-500">*</span></Label>
                                <Controller
                                    control={control}
                                    name="ASMCL_Id"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value ? field.value.toString() : ''}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classList.map((item) => (
                                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMCL_Id && <p className="text-sm font-medium text-destructive">{errors.ASMCL_Id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Section Name <span className="text-red-500">*</span></Label>
                                <div className="rounded-md border p-2">
                                    <Input
                                        placeholder="Search here..."
                                        className="mb-2 h-8"
                                        value={sectionSearch}
                                        onChange={(e) => setSectionSearch(e.target.value)}
                                    />
                                    <div className="mb-2 flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={watchSections.length === filteredSections.length && filteredSections.length > 0}
                                            onCheckedChange={toggleSelectAllSections}
                                        />
                                        <label htmlFor="select-all" className="cursor-pointer text-sm font-medium">
                                            All
                                        </label>
                                    </div>
                                    <ScrollArea className="h-40">
                                        <div className="space-y-2">
                                            {filteredSections.map((section) => (
                                                <div key={section.asmS_Id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`sec-${section.asmS_Id}`}
                                                        checked={isSectionSelected(section.asmS_Id)}
                                                        onCheckedChange={() => toggleSection(section.asmS_Id)}
                                                    />
                                                    <label htmlFor={`sec-${section.asmS_Id}`} className="cursor-pointer text-sm">
                                                        {section.asmC_SectionName}
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
                        </>
                    )}

                </div>

                <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={generateReport.isPending}>
                        {generateReport.isPending ? 'Generating...' : 'Report'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleClear}>
                        Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={() => toast.info('Print functionality mock')}>
                        Print
                    </Button>
                    <Button type="button" variant="outline" onClick={() => toast.info('Excel Export functionality mock')}>
                        Excel
                    </Button>
                </div>
            </form>
        </div>
    );
}
