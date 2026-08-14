'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RefreshCcw, FileText, Loader2 } from 'lucide-react';
import { SportHouseReportFormData, sportHouseReportSchema } from '../schema';
import { useSportHouseReport } from '@/hooks/sports/useSportHouseReport';
import { MultiSelect } from '@/components/ui/multi-select';
import { useEffect, useState } from 'react';
import { IClass, IHouse, ISection, ISportHouseReportData } from '../types';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: ISportHouseReportData[] | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { initialData, classHouseMutation, sectionMutation, reportMutation } = useSportHouseReport();

    const [classList, setClassList] = useState<IClass[]>([]);
    const [houseList, setHouseList] = useState<IHouse[]>([]);
    const [sectionList, setSectionList] = useState<ISection[]>([]);

    const form = useForm<SportHouseReportFormData>({
        resolver: zodResolver(sportHouseReportSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: undefined,
            spccmH_Id: [],
            asmcL_Id: undefined,
            asmS_Id: []
        },
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchedClass = useWatch({ control: form.control, name: 'asmcL_Id' });

    // Reset fields when Report Type changes
    useEffect(() => {
        form.setValue('asmcL_Id', undefined);
        form.setValue('asmS_Id', []);
        form.setValue('spccmH_Id', []);
        // We keep asmaY_Id as it is likely common

        // If switching types, we might need to re-fetch or clear lists appropriately
        // But since both depend on Year, and Year is preserved, and Class/House fetch happens on Year change...
        // If Year is already selected, we might want to ensure lists are populated.
        // However, fetching happens when watchedYear changes. If watchedYear doesn't change, we might need manual trigger or useEffect on type too if logic differed.
        // In this case, get_class returns both classList and houseList. So we have them.
    }, [watchedType, form]);

    // Fetch Classes and Houses when Year changes
    useEffect(() => {
        if (watchedYear) {
            classHouseMutation.mutate({ asmaY_Id: watchedYear }, {
                onSuccess: (data) => {
                    setClassList(data.classList || []);
                    setHouseList(data.houseList || []);
                }
            });
        } else {
            setClassList([]);
            setHouseList([]);
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

    function onSubmit(data: SportHouseReportFormData) {
        const payload: any = {
            type: data.type,
            asmaY_Id: data.asmaY_Id,
        };

        if (data.type === 'House') {
            payload.selectedhouselist = data.spccmH_Id?.map(id => ({ spccmH_Id: id }));
            payload.asmcL_Id = 0; // Backend expectation from legacy code
        } else {
            payload.asmcL_Id = data.asmcL_Id;
            payload.selectedSectionlist = data.asmS_Id?.map(id => ({ asmS_Id: id }));
            payload.selectedhouselist = data.spccmH_Id?.map(id => ({ spccmH_Id: id })) || [];
        }

        reportMutation.mutate(payload, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData);
                if (responseData && responseData.length > 0) {
                    toast.success('Report generated successfully');
                } else {
                    toast.info('No records found');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            }
        });
    }

    const handleReset = () => {
        form.reset();
        setClassList([]);
        setHouseList([]);
        setSectionList([]);
        onReset();
        window.location.reload();
    };

    return (
        <Card>
            <CardHeader className="bg-primary/5 border-b py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Sport House Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Report Type Radio */}
                        <div className="space-y-3">
                            <Label>Report Type</Label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-2">
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col sm:flex-row gap-4"
                                        >
                                            <div className="flex items-center space-x-2 border rounded-md p-3 w-full sm:w-auto hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="House" id="r1" />
                                                <label htmlFor="r1" className="cursor-pointer font-medium">By House</label>
                                            </div>
                                            <div className="flex items-center space-x-2 border rounded-md p-3 w-full sm:w-auto hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="CS" id="r2" />
                                                <label htmlFor="r2" className="cursor-pointer font-medium">By Class/Section</label>
                                            </div>
                                        </RadioGroup>
                                        {errors.type && <span className="text-xs font-medium text-destructive">{errors.type.message}</span>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            {/* Academic Year */}
                            <div className="flex flex-col gap-2">
                                <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">Academic Year</Label>
                                <Controller
                                    control={control}
                                    name="asmaY_Id"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-1">
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={initialData.isLoading}
                                            >
                                                <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.data?.yearlist?.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.asmaY_Id && <span className="text-xs font-medium text-destructive">{errors.asmaY_Id.message}</span>}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* House Selection (Visible for both types) */}
                            <div className="flex flex-col gap-2">
                                <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">House</Label>
                                <Controller
                                    control={control}
                                    name="spccmH_Id"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-1">
                                            <MultiSelect
                                                options={houseList.map(h => ({ value: h.spccmH_Id.toString(), label: h.spccmH_HouseName }))}
                                                onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                defaultValue={field.value?.map(String) || []}
                                                placeholder="Select Houses"
                                                disabled={!watchedYear || classHouseMutation.isPending}
                                                className={errors.spccmH_Id ? 'border-destructive ring-destructive/20' : ''}
                                            />
                                            {errors.spccmH_Id && <span className="text-xs font-medium text-destructive">{errors.spccmH_Id.message}</span>}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <div className="flex flex-col gap-2">
                                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">Class</Label>
                                    <Controller
                                        control={control}
                                        name="asmcL_Id"
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-1">
                                                <Select
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                    value={field.value?.toString()}
                                                    disabled={!watchedYear}
                                                >
                                                    <SelectTrigger className={errors.asmcL_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                        <SelectValue placeholder="Select Class" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classList.map((cls) => (
                                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                {cls.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.asmcL_Id && <span className="text-xs font-medium text-destructive">{errors.asmcL_Id.message}</span>}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Section Selection (Only if Type == CS) */}
                            {watchedType === 'CS' && (
                                <div className="flex flex-col gap-2">
                                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">Section</Label>
                                    <Controller
                                        control={control}
                                        name="asmS_Id"
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-1">
                                                <MultiSelect
                                                    options={sectionList.map(s => ({ value: s.asmS_Id.toString(), label: s.asmC_SectionName }))}
                                                    onValueChange={(vals) => field.onChange(vals.map(Number))}
                                                    defaultValue={field.value?.map(String) || []}
                                                    placeholder="Select Sections"
                                                    disabled={!watchedClass || sectionMutation.isPending}
                                                    className={errors.asmS_Id ? 'border-destructive ring-destructive/20' : ''}
                                                />
                                                {errors.asmS_Id && <span className="text-xs font-medium text-destructive">{errors.asmS_Id.message}</span>}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Button
                                type="submit"
                                className="min-w-[150px] font-bold shadow-md hover:shadow-lg transition-all"
                                disabled={reportMutation.isPending}
                            >
                                {reportMutation.isPending ? (
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
                                className="min-w-[150px] border-2 hover:bg-muted"
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
