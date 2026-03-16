'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCcw, FileText, Loader2, Search } from 'lucide-react';
import { SportsYearEndReportFormData, sportsYearEndReportSchema } from '../schema';
import { useSportsYearEndReport } from '@/hooks/sports/useSportsYearEndReport';
import { useEffect, useState } from 'react';
import { IClass, ISection, ISportsYearEndReportData } from '../types';
import { Input } from '@/components/ui/input';

interface ReportFormProps {
    onReportGenerated: (data: ISportsYearEndReportData[] | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { initialData, classMutation, sectionMutation, reportMutation } = useSportsYearEndReport();

    const [classList, setClassList] = useState<IClass[]>([]);
    const [sectionList, setSectionList] = useState<ISection[]>([]);

    const [classFilter, setClassFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const form = useForm<SportsYearEndReportFormData>({
        resolver: zodResolver(sportsYearEndReportSchema),
        defaultValues: {
            type: 'AY',
            asmaY_Id: undefined,
            selectedClasslist: [],
            selectedSectionlist: [],
        },
    });

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchedClasses = useWatch({ control: form.control, name: 'selectedClasslist' });

    // Reset dependent fields when Type changes
    useEffect(() => {
        form.setValue('selectedClasslist', []);
        form.setValue('selectedSectionlist', []);
        setClassList([]);
        setSectionList([]);
    }, [watchedType, form]);

    // Fetch Classes when Year changes
    useEffect(() => {
        if (watchedYear && watchedType === 'CS') {
            classMutation.mutate({ asmaY_Id: watchedYear }, {
                onSuccess: (data) => {
                    setClassList(data.classList || []);
                }
            });
        } else {
            setClassList([]);
        }
        form.setValue('selectedClasslist', []);
        form.setValue('selectedSectionlist', []);
    }, [watchedYear, watchedType]);

    // Fetch Sections when Classes change
    useEffect(() => {
        if (watchedYear && watchedClasses && watchedClasses.length > 0 && watchedType === 'CS') {
            // Usually in this project, they fetch sections for the first selected class or combine them.
            // Following common pattern: fetch for the first one or if the API supports bulk (usually it's per class in these mutations)
            // But if the mutation only takes one ID, we'll fetch for the latest added or just the first.
            // Actually, looking at YearEndReportDTO, they send a list. 
            // If the sectionMutation only takes one ID, we might need to adjust or just use the first/last.
            // Let's assume the mutation can be enhanced or just use the pattern from StudentAgeCalculation.
            const asmcL_Id = watchedClasses[watchedClasses.length - 1].asmcL_Id;
            sectionMutation.mutate({ asmaY_Id: watchedYear, asmcL_Id: asmcL_Id }, {
                onSuccess: (data) => {
                    // Append new sections or replace? Standard is usually replace or refresh based on all selected classes.
                    // For simplicity and matching common UI:
                    setSectionList(data.sectionList || []);
                }
            });
        } else {
            setSectionList([]);
        }
        form.setValue('selectedSectionlist', []);
    }, [watchedClasses]);

    function onSubmit(data: SportsYearEndReportFormData) {
        reportMutation.mutate({
            ASMAY_Id: data.asmaY_Id,
            Type: data.type,
            selectedClasslist: data.type === 'CS' ? data.selectedClasslist.map(c => ({ ASMCL_Id: c.asmcL_Id })) : [],
            selectedSectionlist: data.type === 'CS' ? data.selectedSectionlist.map(s => ({ ASMS_Id: s.asmS_Id })) : []
        }, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData);
            }
        });
    }

    const toggleAll = (list: any[], key: string, fieldName: any, checked: boolean) => {
        if (checked) {
            form.setValue(fieldName, list.map(item => ({ [key]: item[key] })));
        } else {
            form.setValue(fieldName, []);
        }
    };

    const handleReset = () => {
        form.reset();
        setClassList([]);
        setSectionList([]);
        onReset();
    };

    const filteredClasses = classList.filter(c => c.asmcL_ClassName.toLowerCase().includes(classFilter.toLowerCase()));
    const filteredSections = sectionList.filter(s => s.asmC_SectionName.toLowerCase().includes(sectionFilter.toLowerCase()));

    return (
        <Card>
            <CardHeader className="bg-primary/5 border-b py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Sports Year End Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Type Selection */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex justify-center space-x-12 p-4 border-2 rounded-xl bg-primary/5 border-primary/10"
                                        >
                                            <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-lg shadow-sm border hover:border-primary/50 transition-all cursor-pointer">
                                                <RadioGroupItem value="AY" id="type-ay" className="h-5 w-5" />
                                                <label htmlFor="type-ay" className="font-bold text-sm tracking-tight cursor-pointer uppercase">
                                                    Academic Year
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-lg shadow-sm border hover:border-primary/50 transition-all cursor-pointer">
                                                <RadioGroupItem value="CS" id="type-cs" className="h-5 w-5" />
                                                <label htmlFor="type-cs" className="font-bold text-sm tracking-tight cursor-pointer uppercase">
                                                    By Class / Section
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Academic Year */}
                            <FormField
                                control={form.control}
                                name="asmaY_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-1">Academic Year</FormLabel>
                                        <span className="text-destructive font-bold">*</span>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={initialData.isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-11 border-2 bg-white shadow-sm focus:ring-primary/20 transition-all">
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData.data?.yearlist?.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Class Selection (CS Only) */}
                            {watchedType === 'CS' && (
                                <FormField
                                    control={form.control}
                                    name="selectedClasslist"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-1">Class</FormLabel>
                                            <span className="text-destructive font-bold">*</span>
                                            <div className="border-2 rounded-xl p-3 bg-white shadow-sm space-y-3">
                                                <div className="flex items-center gap-3 pb-2 border-b">
                                                    <Checkbox
                                                        id="all-classes"
                                                        checked={classList.length > 0 && field.value?.length === classList.length}
                                                        onCheckedChange={(checked) => toggleAll(classList, 'asmcL_Id', 'selectedClasslist', !!checked)}
                                                    />
                                                    <label htmlFor="all-classes" className="text-xs font-bold uppercase cursor-pointer">All</label>
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search..."
                                                            className="h-8 pl-8 text-xs border-none bg-muted/30 focus-visible:ring-0"
                                                            value={classFilter}
                                                            onChange={(e) => setClassFilter(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <ScrollArea className="h-32 pr-4">
                                                    <div className="space-y-2.5">
                                                        {filteredClasses.map((cls) => (
                                                            <div key={cls.asmcL_Id} className="flex items-center gap-3 group">
                                                                <Checkbox
                                                                    id={`class-${cls.asmcL_Id}`}
                                                                    checked={field.value?.some(v => v.asmcL_Id === cls.asmcL_Id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = [...(field.value || [])];
                                                                        if (checked) {
                                                                            field.onChange([...current, { asmcL_Id: cls.asmcL_Id }]);
                                                                        } else {
                                                                            field.onChange(current.filter(v => v.asmcL_Id !== cls.asmcL_Id));
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={`class-${cls.asmcL_Id}`} className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors">
                                                                    {cls.asmcL_ClassName}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Section Selection (CS Only) */}
                            {watchedType === 'CS' && (
                                <FormField
                                    control={form.control}
                                    name="selectedSectionlist"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground mr-1">Section</FormLabel>
                                            <span className="text-destructive font-bold">*</span>
                                            <div className="border-2 rounded-xl p-3 bg-white shadow-sm space-y-3">
                                                <div className="flex items-center gap-3 pb-2 border-b">
                                                    <Checkbox
                                                        id="all-sections"
                                                        checked={sectionList.length > 0 && field.value?.length === sectionList.length}
                                                        onCheckedChange={(checked) => toggleAll(sectionList, 'asmS_Id', 'selectedSectionlist', !!checked)}
                                                    />
                                                    <label htmlFor="all-sections" className="text-xs font-bold uppercase cursor-pointer">All</label>
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search..."
                                                            className="h-8 pl-8 text-xs border-none bg-muted/30 focus-visible:ring-0"
                                                            value={sectionFilter}
                                                            onChange={(e) => setSectionFilter(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <ScrollArea className="h-32 pr-4">
                                                    <div className="space-y-2.5">
                                                        {filteredSections.map((sec) => (
                                                            <div key={sec.asmS_Id} className="flex items-center gap-3 group">
                                                                <Checkbox
                                                                    id={`section-${sec.asmS_Id}`}
                                                                    checked={field.value?.some(v => v.asmS_Id === sec.asmS_Id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = [...(field.value || [])];
                                                                        if (checked) {
                                                                            field.onChange([...current, { asmS_Id: sec.asmS_Id }]);
                                                                        } else {
                                                                            field.onChange(current.filter(v => v.asmS_Id !== sec.asmS_Id));
                                                                        }
                                                                    }}
                                                                />
                                                                <label htmlFor={`section-${sec.asmS_Id}`} className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors">
                                                                    {sec.asmC_SectionName}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-6 pt-6 border-t">
                            <Button
                                type="submit"
                                className="min-w-[180px] h-12 rounded-xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={reportMutation.isPending}
                            >
                                {reportMutation.isPending ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-5 w-5 mr-2" />
                                )}
                                GENERATE REPORT
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="min-w-[180px] h-12 rounded-xl border-2 font-bold hover:bg-muted transition-all uppercase tracking-tight"
                            >
                                <RefreshCcw className="h-5 w-5 mr-2 text-muted-foreground" />
                                RESET FORM
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
