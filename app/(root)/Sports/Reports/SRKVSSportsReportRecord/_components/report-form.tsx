'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useSRKVSSportsReportRecord } from '@/hooks/sports/useSRKVSSportsReportRecord';
import {
    SRKVSSportsReportRecordFormSchema,
    SRKVSSportsReportRecordSchema,
    ISRKVSReportData,
    ISRKVSYear,
    ISRKVSMasterEvent,
    ISRKVSCompetitionLevel,
    ISRKVSCategory,
    ISRKVSMainEvent,
    ISRKVSSubEvent,
    ISRKVSSubSubEvent,
    ISRKVSReportItem,
} from '@/types/sports/reports/srkvs-sports-report-record';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';

interface ReportFormProps {
    onReportGenerated: (data: ISRKVSReportData[]) => void;
    onTypeChange: (type: any) => void;
}

// Helper to group data
const groupData = (flatData: any[], type: string): ISRKVSReportData[] => {
    if (!flatData || flatData.length === 0) return [];

    // Check if already grouped (has RecordDetails)
    if (flatData[0].RecordDetails) return flatData as ISRKVSReportData[];

    const groups: { [key: string]: ISRKVSReportData } = {};

    flatData.forEach((item: ISRKVSReportItem) => {
        let key = '';
        if (type === 'Record' || type === 'Consolidated' || type === 'Indoor' || type === 'Outdoor' || type === 'Team' || type === 'Externals' || type === 'Selection') {
            key = item.SPCCMCC_CompitionCategory || 'Unknown';
        } else if (type === 'Start' || type === 'Finish') {
            // For Start/Finish, we might want to group by Category AND Event Group
            key = (item.SPCCMCC_CompitionCategory || '') + '_' + (item.SPCCMSCCG_SportsCCGroupName || '');
        } else {
            key = item.SPCCMCC_CompitionCategory || 'Default';
        }

        if (!groups[key]) {
            groups[key] = {
                SPCCMCC_CompitionCategory: item.SPCCMCC_CompitionCategory,
                SPCCMSCCG_SportsCCGroupName: item.SPCCMSCCG_SportsCCGroupName,
                RecordDetails: []
            };
        }
        groups[key].RecordDetails.push(item);
    });

    return Object.values(groups);
};

export const ReportForm = ({ onReportGenerated, onTypeChange }: ReportFormProps) => {
    const { loadData, getClass, getSportsName, getUomName, generateReport } = useSRKVSSportsReportRecord();
    const { data: initialData, isLoading: isInitialLoading } = loadData;

    const [academicYears, setAcademicYears] = useState<ISRKVSYear[]>([]);
    const [masterEvents, setMasterEvents] = useState<ISRKVSMasterEvent[]>([]);
    const [competitionLevels, setCompetitionLevels] = useState<ISRKVSCompetitionLevel[]>([]);
    const [categories, setCategories] = useState<ISRKVSCategory[]>([]);
    const [mainEvents, setMainEvents] = useState<ISRKVSMainEvent[]>([]);
    const [subEvents, setSubEvents] = useState<ISRKVSSubEvent[]>([]);
    const [subSubEvents, setSubSubEvents] = useState<ISRKVSSubSubEvent[]>([]);

    const form = useForm<SRKVSSportsReportRecordFormSchema>({
        resolver: zodResolver(SRKVSSportsReportRecordSchema),
        defaultValues: {
            Type: 'Record',
            ASMAY_Id: undefined,
            SPCCME_Id: undefined,
            selectedCompetitionLevels: [],
            selectedCategories: [],
            selectedSubSubEvents: [],
        },
    });

    const watchedType = useWatch({ control: form.control, name: 'Type' });
    const watchedYear = useWatch({ control: form.control, name: 'ASMAY_Id' });
    const watchedMainEvent = useWatch({ control: form.control, name: 'spccmsccG_Id' }); // Group ID
    const watchedSubEvent = useWatch({ control: form.control, name: 'spccmscC_Id' });

    const isMultiSelectType = watchedType === 'Record' || watchedType === 'Start';
    const isMultiLevel = watchedType === 'Record' || watchedType === 'Start';
    const isMultiCategory = ['Record', 'Start', 'Consolidated', 'Indoor'].includes(watchedType);

    // Initial Data Load
    useEffect(() => {
        if (initialData) {
            setAcademicYears(initialData.yearlist || []);
        }
    }, [initialData]);

    // Year Change -> Get Class (and other dropdowns)
    useEffect(() => {
        if (watchedYear) {
            getClass.mutate({ asmaY_Id: watchedYear }, {
                onSuccess: (data) => {
                    setCategories(data?.categoryList || []);
                    setCompetitionLevels(data?.competetionLevel || []);
                    setMasterEvents(data?.masterEvent || []);
                    setMainEvents(data?.getMasterEvent || []);
                }
            });
        }
    }, [watchedYear]);

    // Main Event Change -> Get Sub Events (Sports Name)
    useEffect(() => {
        if (watchedYear && watchedMainEvent) {
            if (['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType)) {
                getSportsName.mutate({ asmaY_Id: watchedYear, spccmsccG_Id: watchedMainEvent }, {
                    onSuccess: (data) => {
                        setSubEvents(data?.sportsCCList || []);
                    }
                });
            }
        }
    }, [watchedYear, watchedMainEvent, watchedType]);

    // Sub Event Change -> Get Sub Sub Events (UOM Name)
    useEffect(() => {
        if (watchedYear && watchedSubEvent) {
            if (['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType)) {
                getUomName.mutate({ asmaY_Id: watchedYear, spccmscC_Id: watchedSubEvent }, {
                    onSuccess: (data) => {
                        setSubSubEvents(data?.getsubsubevent || []);
                    }
                });
            }
        }
    }, [watchedYear, watchedSubEvent, watchedType]);

    // Propagate type change up
    useEffect(() => {
        onTypeChange(watchedType);
        // Reset dependent fields logic can be added here if reset is needed on type change
    }, [watchedType, onTypeChange]);


    const onSubmit = (data: SRKVSSportsReportRecordFormSchema) => {
        const payload: any = {
            ASMAY_Id: data.ASMAY_Id,
            Type: data.Type,
            SPCCME_Id: data.SPCCME_Id,
            Sportleveltemps: [{ SPCCME_Id: data.SPCCME_Id }]
        };

        // Handle Category Lists
        if (isMultiCategory) {
            payload.Categorylists = data.selectedCategories?.map(c => ({ SPCCMCC_Id: c.spccmcC_Id })) || [];
        } else if (data.spccmcC_Id) {
            payload.Categorylists = [{ SPCCMCC_Id: data.spccmcC_Id }];
        } else {
            payload.Categorylists = [];
        }

        // Handle Competition Levels
        if (isMultiLevel) {
            payload.CompetetionLevels = data.selectedCompetitionLevels?.map(l => ({ SPCCMCL_Id: l.spccmcL_Id })) || [];
        } else if (data.spccmcL_Id) {
            payload.CompetetionLevels = [{ SPCCMCL_Id: data.spccmcL_Id }];
        } else {
            payload.CompetetionLevels = [];
        }

        // Handle Sub Event Lists
        const isMultiSubSub = ['Indoor', 'Outdoor', 'Externals'].includes(data.Type);
        const isSingleSubSub = ['Start', 'Team', 'Finish'].includes(data.Type);

        if (isMultiSubSub) {
            payload.SubEventLists = data.selectedSubSubEvents?.map(s => ({ SPCCMSCCG_Id: s.spccmsccG_Id })) || [];
        } else if (isSingleSubSub && data.spccmsccG_Idsub) {
            payload.SubEventLists = [{ SPCCMSCCG_Id: data.spccmsccG_Idsub }];
        }

        generateReport.mutate(payload, {
            onSuccess: (responseData) => {
                const rawData = responseData?.getReport || responseData?.getReportfinish || responseData || [];
                const groupedData = groupData(rawData, data.Type);
                onReportGenerated(groupedData);
                toast.success('Report generated successfully');
            },
            onError: (error) => {
                console.error(error);
                toast.error('Failed to generate report');
            },
        });
    };

    if (isInitialLoading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md shadow-sm bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name="ASMAY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Academic Year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicYears.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Event */}
                    <FormField
                        control={form.control}
                        name="SPCCME_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Event" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {masterEvents.map((item) => (
                                            <SelectItem key={item.spccmE_Id} value={item.spccmE_Id.toString()}>
                                                {item.spccmE_EventName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Result Type */}
                    <FormField
                        control={form.control}
                        name="Type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Result <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Result Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Record">Records</SelectItem>
                                        <SelectItem value="Start">Start List</SelectItem>
                                        <SelectItem value="Finish">Finish</SelectItem>
                                        <SelectItem value="Consolidated">Consolidated</SelectItem>
                                        <SelectItem value="Indoor">Indoor</SelectItem>
                                        <SelectItem value="Outdoor">Outdoor</SelectItem>
                                        <SelectItem value="Team">Team</SelectItem>
                                        <SelectItem value="Externals">Externals</SelectItem>
                                        <SelectItem value="Selection">Selection</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Competition Level */}
                    {watchedType && (
                        <>
                            {isMultiLevel ? (
                                <FormField
                                    control={form.control}
                                    name="selectedCompetitionLevels"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel>Competition Level <span className="text-red-500">*</span></FormLabel>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                                {competitionLevels.map((item) => (
                                                    <FormField
                                                        key={item.spccmcL_Id}
                                                        control={form.control}
                                                        name="selectedCompetitionLevels"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item.spccmcL_Id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.some(val => val.spccmcL_Id === item.spccmcL_Id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const current = field.value || [];
                                                                                return checked
                                                                                    ? field.onChange([...current, { spccmcL_Id: item.spccmcL_Id }])
                                                                                    : field.onChange(current.filter(val => val.spccmcL_Id !== item.spccmcL_Id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.spccmcL_CompitionLevel}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="spccmcL_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Competition Level <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Competition Level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {competitionLevels.map((item) => (
                                                        <SelectItem key={item.spccmcL_Id} value={item.spccmcL_Id.toString()}>
                                                            {item.spccmcL_CompitionLevel}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}

                    {/* From Date */}
                    <FormField
                        control={form.control}
                        name="FromDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder="Select Date"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/* Competition Category */}
                    {watchedType && (
                        <>
                            {isMultiCategory ? (
                                <FormField
                                    control={form.control}
                                    name="selectedCategories"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel>Competition Category <span className="text-red-500">*</span></FormLabel>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                                {categories.map((item) => (
                                                    <FormField
                                                        key={item.spccmcC_Id}
                                                        control={form.control}
                                                        name="selectedCategories"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item.spccmcC_Id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.some(val => val.spccmcC_Id === item.spccmcC_Id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const current = field.value || [];
                                                                                return checked
                                                                                    ? field.onChange([...current, { spccmcC_Id: item.spccmcC_Id }])
                                                                                    : field.onChange(current.filter(val => val.spccmcC_Id !== item.spccmcC_Id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.spccmcC_CompitionCategory}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="spccmcC_Id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Competition Category <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((item) => (
                                                        <SelectItem key={item.spccmcC_Id} value={item.spccmcC_Id.toString()}>
                                                            {item.spccmcC_CompitionCategory}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}

                    {/* Meet Year */}
                    <FormField
                        control={form.control}
                        name="Meet_Year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meet Year</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Meet Year" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Conditional Event Fields */}
                    {['Start', 'Finish', 'Indoor', 'Outdoor', 'Team', 'Externals'].includes(watchedType) && (
                        <>
                            {/* Main Event */}
                            <FormField
                                control={form.control}
                                name="spccmsccG_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Main Event <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Main Event" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {mainEvents.map((item) => (
                                                    <SelectItem key={item.spccmsccG_Id} value={item.spccmsccG_Id.toString()}>
                                                        {item.spccmsccG_SportsCCGroupName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sub Event */}
                            <FormField
                                control={form.control}
                                name="spccmscC_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub Event <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Sub Event" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subEvents.map((item) => (
                                                    <SelectItem key={item.spccmscC_Id} value={item.spccmscC_Id.toString()}>
                                                        {item.spccmscC_SportsCCName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sub Sub Event */}
                            {/* Multi for Indoor, Outdoor, Externals */}
                            {['Indoor', 'Outdoor', 'Externals'].includes(watchedType) && (
                                <FormField
                                    control={form.control}
                                    name="selectedSubSubEvents"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel>Sub Sub Event <span className="text-red-500">*</span></FormLabel>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                                {subSubEvents.map((item) => (
                                                    <FormField
                                                        key={item.spccmsccG_Id}
                                                        control={form.control}
                                                        name="selectedSubSubEvents"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={item.spccmsccG_Id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.some(val => val.spccmsccG_Id === item.spccmsccG_Id)}
                                                                            onCheckedChange={(checked) => {
                                                                                const current = field.value || [];
                                                                                return checked
                                                                                    ? field.onChange([...current, { spccmsccG_Id: item.spccmsccG_Id }])
                                                                                    : field.onChange(current.filter(val => val.spccmsccG_Id !== item.spccmsccG_Id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        {item.spccmsccG_SportsCCGroupName}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Single for Start, Team, Finish */}
                            {['Start', 'Team', 'Finish'].includes(watchedType) && (
                                <FormField
                                    control={form.control}
                                    name="spccmsccG_Idsub"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sub Sub Event <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Sub Sub Event" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {subSubEvents.map((item) => (
                                                        <SelectItem key={item.spccmsccG_Id} value={item.spccmsccG_Id.toString()}>
                                                            {item.spccmsccG_SportsCCGroupName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </>
                    )}

                </div>

                <div className="flex justify-center gap-2">
                    <Button type="submit" disabled={generateReport.isPending}>
                        {generateReport.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <i className="fa fa-list-alt mr-2" aria-hidden="true"></i>}
                        Report
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => form.reset()}>
                        <i className="fa fa-times mr-2" aria-hidden="true"></i>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
