'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RefreshCcw, FileText, Loader2 } from 'lucide-react';
import { PointsRecordReportFormSchema, pointsRecordReportSchema } from '../schema';
import { usePointsRecordReport } from '@/hooks/sports/usePointsRecordReport';
import { MultiSelect } from '@/components/ui/multi-select';
import { useEffect, useState } from 'react';
import { IClass, IEvent, IHouse, ISection, ICategory } from '@/types/sports/reports/points-record-report';
import { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';

interface ReportFormProps {
    setReportData: (data: IPointsRecordReportData[] | null) => void;
    setFormData: (data: PointsRecordReportFormSchema | null) => void;
}

export default function ReportForm({ setReportData, setFormData }: ReportFormProps) {
    const { loadData, classHouseEventMutation, sectionMutation, generateReport } = usePointsRecordReport();

    const [classList, setClassList] = useState<IClass[]>([]);
    const [houseList, setHouseList] = useState<IHouse[]>([]);
    const [eventList, setEventList] = useState<IEvent[]>([]);
    const [sectionList, setSectionList] = useState<ISection[]>([]);
    const [categoryList, setCategoryList] = useState<ICategory[]>([]);

    const form = useForm<PointsRecordReportFormSchema>({
        resolver: zodResolver(pointsRecordReportSchema),
        defaultValues: {
            Type: 'House',
            ASMAY_Id: undefined,
            selectedhouselist: [],
            selectedSectionlist: [],
            selectedEventlist: [],
            selectedSportslist: [],
            placListData: [],
            ASMCL_Id: undefined,
            SPCCMCC_Id: undefined
        },
    });

    const watchedType = useWatch({ control: form.control, name: 'Type' });
    const watchedYear = useWatch({ control: form.control, name: 'ASMAY_Id' });
    const watchedClass = useWatch({ control: form.control, name: 'ASMCL_Id' });

    // Initial Data Logic
    useEffect(() => {
        if (loadData.data) {
            // Initial lists might be available here if the API provides them initially
            // But logic suggests cascading is primary for Class/House/Event
            // However, sports/category/rank are likely static or year-independent? 
            // Actually, category list usually depends on year or just master.
            // Let's assume Category/Sports come from LoadData
            if (loadData.data.categoryList) setCategoryList(loadData.data.categoryList);
            // Sports list is available in loadData.data.sportslist
        }
    }, [loadData.data]);

    // Reset fields when Type changes
    useEffect(() => {
        form.setValue('selectedSectionlist', []);
        form.setValue('ASMCL_Id', undefined);
        form.setValue('SPCCMCC_Id', undefined);
        form.setValue('placListData', []);
        setReportData(null);
        setFormData(null);
        // We keep House/Event/Sports selections? 
        // Report logic: clear them to avoid confusion
        form.setValue('selectedhouselist', []);
        form.setValue('selectedEventlist', []);
        form.setValue('selectedSportslist', []);
    }, [watchedType, form, setReportData, setFormData]);

    // Fetch Cascading Data (Classes, Houses, Events) when Year changes
    useEffect(() => {
        if (watchedYear) {
            classHouseEventMutation.mutate({ asmaY_Id: watchedYear }, {
                onSuccess: (data) => {
                    setClassList(data.classList || []);
                    setHouseList(data.houseList || []);
                    setEventList(data.eventList || []);
                }
            });
        } else {
            setClassList([]);
            setHouseList([]);
            setEventList([]);
        }
    }, [watchedYear]);

    // Fetch Sections when Class changes (and Type is CS)
    useEffect(() => {
        if (watchedYear && watchedClass && watchedType === 'CS') {
            sectionMutation.mutate({ asmaY_Id: watchedYear, asmcL_Id: watchedClass }, {
                onSuccess: (data) => {
                    setSectionList(data.sectionList || []);
                }
            });
        } else {
            setSectionList([]);
        }
    }, [watchedYear, watchedClass, watchedType]);

    function onSubmit(data: PointsRecordReportFormSchema) {
        setFormData(data); // Store form data for grid headers/logic

        const payload: any = {
            type: data.Type,
            asmaY_Id: data.ASMAY_Id,
            selectedhouselist: data.selectedhouselist || [],
            selectedeventlist: data.selectedEventlist || [],
            selectedsportslist: data.selectedSportslist || [],
        };

        if (data.Type === 'CS') {
            payload.asmcL_Id = data.ASMCL_Id;
            payload.selectedSectionlist = data.selectedSectionlist || [];
        } else if (data.Type === 'CC') {
            payload.spccmcC_Id = data.SPCCMCC_Id;
            payload.placListData = data.placListData || [];
        }

        // House type needs no extra IDs, just the common lists.

        generateReport.mutate(payload, {
            onSuccess: (responseData) => {
                setReportData(responseData);
                if (!responseData || responseData.length === 0) {
                    // Toast handled in hook, but we can also set data to empty array
                }
            }
        });
    }

    const handleReset = () => {
        form.reset();
        setReportData(null);
        setFormData(null);
        setClassList([]);
        setHouseList([]);
        setEventList([]);
        setSectionList([]);
    };

    const rankList = [
        { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' },
        { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' },
        { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' },
        { label: '10', value: '10' },
    ];

    return (
        <Card>
            <CardHeader className="bg-primary/5 border-b py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Points Record Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Report Type Radio */}
                        <FormField
                            control={form.control}
                            name="Type"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col sm:flex-row gap-6 justify-center"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="House" id="r1" />
                                                <label htmlFor="r1" className="cursor-pointer font-medium">By House</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="CS" id="r2" />
                                                <label htmlFor="r2" className="cursor-pointer font-medium">By Class/Section</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="CC" id="r3" />
                                                <label htmlFor="r3" className="cursor-pointer font-medium">Competition Category</label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            {/* Academic Year */}
                            <FormField
                                control={form.control}
                                name="ASMAY_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Academic Year <span className="text-destructive">*</span></FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={loadData.isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loadData.data?.yearlist?.map((year) => (
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

                            {/* Class Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <FormField
                                    control={form.control}
                                    name="ASMCL_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">Class <span className="text-destructive">*</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={!watchedYear}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classList.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Section Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <FormField
                                    control={form.control}
                                    name="selectedSectionlist"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">Section <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={sectionList.map(s => ({ value: s.asmS_Id.toString(), label: s.asmC_SectionName }))}
                                                    onValueChange={(vals) => field.onChange(vals.map(v => ({ asmS_Id: Number(v) })))}
                                                    defaultValue={field.value?.map(v => v.asmS_Id.toString()) || []}
                                                    placeholder="Select Sections"
                                                    disabled={!watchedClass || sectionMutation.isPending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Category Selection (Only if Type == CC) */}
                            {watchedType === 'CC' && (
                                <FormField
                                    control={form.control}
                                    name="SPCCMCC_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">Category <span className="text-destructive">*</span></FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                            // disabled={!watchedYear} // Category might depend on year, but list comes from initial load currently
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categoryList.map((cat) => (
                                                        <SelectItem key={cat.spccmcC_Id} value={cat.spccmcC_Id.toString()}>
                                                            {cat.spccmcC_CompitionCategory}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Place Selection (Only if Type == CC) */}
                            {watchedType === 'CC' && (
                                <FormField
                                    control={form.control}
                                    name="placListData"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">Place</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={rankList}
                                                    onValueChange={(vals) => field.onChange(vals.map(v => ({ spccestR_Rank: v })))}
                                                    defaultValue={field.value?.map(v => v.spccestR_Rank) || []}
                                                    placeholder="Select Place"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* House Selection */}
                            <FormField
                                control={form.control}
                                name="selectedhouselist"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">House <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={houseList.map(h => ({ value: h.spccmH_Id.toString(), label: h.spccmH_HouseName }))}
                                                onValueChange={(vals) => field.onChange(vals.map(v => ({ spccmH_Id: Number(v) })))}
                                                defaultValue={field.value?.map(v => v.spccmH_Id.toString()) || []}
                                                placeholder="Select Houses"
                                                disabled={!watchedYear}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Event Selection */}
                            <FormField
                                control={form.control}
                                name="selectedEventlist"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Event</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={eventList.map(e => ({ value: e.spccmE_Id.toString(), label: e.spccmE_EventName }))}
                                                onValueChange={(vals) => field.onChange(vals.map(v => ({ spccmE_Id: Number(v) })))}
                                                defaultValue={field.value?.map(v => v.spccmE_Id.toString()) || []}
                                                placeholder="Select Events"
                                                disabled={!watchedYear}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sports Selection */}
                            <FormField
                                control={form.control}
                                name="selectedSportslist"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Sports</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={loadData.data?.sportslist?.map(s => ({ value: s.spccmscC_Id.toString(), label: s.spccmscC_SportsCCName })) || []}
                                                onValueChange={(vals) => field.onChange(vals.map(v => ({ spccmscC_Id: Number(v) })))}
                                                defaultValue={field.value?.map(v => v.spccmscC_Id.toString()) || []}
                                                placeholder="Select Sports"
                                                disabled={loadData.isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Button
                                type="submit"
                                className="min-w-[150px] font-bold"
                                disabled={generateReport.isPending}
                            >
                                {generateReport.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                Report
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="min-w-[150px]"
                            >
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
