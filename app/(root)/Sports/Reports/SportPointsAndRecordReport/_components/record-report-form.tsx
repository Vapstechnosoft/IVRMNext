'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSportPointsAndRecordReport } from '@/hooks/sports/useSportPointsAndRecordReport';
import { SportPointsAndRecordReportSchema, SportPointsAndRecordReportFormSchema } from '@/types/sports/reports/points-record-report';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ReportFormProps {
    onReportGenerated: (data: any[]) => void;
}

export const ReportForm = ({ onReportGenerated }: ReportFormProps) => {
    const { loadData, classHouseEventMutation, sectionMutation, generateReport } = useSportPointsAndRecordReport();
    const [houseList, setHouseList] = useState<any[]>([]);
    const [programList, setProgramList] = useState<any[]>([]);
    const [eventList, setEventList] = useState<any[]>([]);
    const [divisionList, setDivisionList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const form = useForm<SportPointsAndRecordReportFormSchema>({
        resolver: zodResolver(SportPointsAndRecordReportSchema),
        defaultValues: {
            qualification_type: 'others',
        },
    });

    const watchYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchClass = useWatch({ control: form.control, name: 'asmcL_Id' });
    const watchType = useWatch({ control: form.control, name: 'qualification_type' });

    useEffect(() => {
        if (watchYear) {
            classHouseEventMutation.mutate({ asmaY_Id: watchYear }, {
                onSuccess: (data) => {
                    if (data.classList) setClassList(data.classList);
                    if (data.houseList && data.houseList.length > 0) setHouseList(data.houseList);
                    if (data.events && data.events.length > 0) setProgramList(data.events);
                    else if (data.eventList && data.eventList.length > 0) setProgramList(data.eventList);
                    if (data.eventList && data.eventList.length > 0) setEventList(data.eventList);
                }
            });
        } else {
            setClassList([]);
            setHouseList([]);
            setProgramList([]);
            setEventList([]);
            form.setValue('asmcL_Id', undefined);
            form.setValue('asmS_Id', undefined);
        }
    }, [watchYear]);

    useEffect(() => {
        if (watchYear && watchClass) {
            sectionMutation.mutate({ asmaY_Id: watchYear, asmcL_Id: watchClass }, {
                onSuccess: (data) => {
                    setSectionList(data.sectionList || []);
                }
            });
        } else {
            setSectionList([]);
            form.setValue('asmS_Id', undefined);
        }
    }, [watchYear, watchClass]);

    useEffect(() => {
        if (loadData.data) {
            if (loadData.data.houseList) setHouseList(loadData.data.houseList);
            if (loadData.data.events || loadData.data.eventList) {
                setProgramList(loadData.data.events || loadData.data.eventList || []);
            }
            if (loadData.data.eventList) setEventList(loadData.data.eventList);
            if (loadData.data.divisionList) setDivisionList(loadData.data.divisionList);
        }
    }, [loadData.data]);

    const handleSubmit = (data: SportPointsAndRecordReportFormSchema) => {
        generateReport.mutate(data, {
            onSuccess: (result) => {
                // @ts-ignore
                if (result && result.length > 0) {
                    onReportGenerated(result);
                    toast.success('Report generated successfully');
                } else {
                    onReportGenerated([]);
                    toast.info('No data found for the selected criteria');
                }
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            },
        });
    };

    const handleCancel = () => {
        form.reset({
            qualification_type: 'others',
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            spccmH_Id: undefined,
            spccE_Id: undefined,
            spccmE_Id: undefined,
            spccmD_Id: undefined,
        });
        onReportGenerated([]);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Sport Point And Record Report</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Radio Buttons for Qualification Type */}
                    <FormField
                        control={form.control}
                        name="qualification_type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 p-4 bg-gray-50 rounded-md"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="eca" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">Extra Curricular Activities</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="cca" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">Co Curricular Activities</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="ih" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">Interhouse</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="others" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">Others</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Academic Year */}
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Academic Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {loadData.data?.academicYear.map((year) => (
                                                <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Class Name */}
                        <FormField
                            control={form.control}
                            name="asmcL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Name</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classList.map((cls) => (
                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Section Name */}
                        <FormField
                            control={form.control}
                            name="asmS_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section Name</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Section Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sectionList.map((sec) => (
                                                <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                    {sec.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* House Name */}
                        <FormField
                            control={form.control}
                            name="spccmH_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>House Name <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select House Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {houseList.map((house) => (
                                                <SelectItem key={house.spccmH_Id} value={String(house.spccmH_Id)}>
                                                    {house.spccmH_HouseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Program Master (Events) */}
                        <FormField
                            control={form.control}
                            name="spccE_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Master <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Program Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {programList.map((prog) => (
                                                <SelectItem key={prog.spccE_Id} value={String(prog.spccE_Id)}>
                                                    {prog.spccpM_Name || prog.spccE_EventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Event Name */}
                        <FormField
                            control={form.control}
                            name="spccmE_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event Name <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Event Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {eventList.map((evt) => (
                                                <SelectItem key={evt.spccmE_Id} value={String(evt.spccmE_Id)}>
                                                    {evt.spccmE_EventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Division Name */}
                        <FormField
                            control={form.control}
                            name="spccmD_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Division Name <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Division Name" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {divisionList.map((div) => (
                                                <SelectItem key={div.spccmD_Id} value={String(div.spccmD_Id)}>
                                                    {div.spccmD_DivisionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-center space-x-4 pt-4">
                        <Button type="submit" disabled={generateReport.isPending} className="bg-blue-600 hover:bg-blue-700">
                            {generateReport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Report
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
