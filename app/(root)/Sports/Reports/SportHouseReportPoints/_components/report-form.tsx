'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, List, X, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import {
    sportHouseReportPointsSchema,
    type SportHouseReportPointsFormSchema,
    type ISportHouseReportPointsRequest,
    type ISportHouseReportPointsDropdowns,
    type ISportHouseReportPointsResponse
} from "@/types/sports/reports/sport-house-report-points";
import { useSportHouseReportPoints } from "@/hooks/sports/useSportHouseReportPoints";
import { getClassesForYear } from "@/server/sports/reports/sport-house-report-points";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportFormProps {
    onReportGenerated: (data: ISportHouseReportPointsResponse, payload: ISportHouseReportPointsRequest) => void;
    onReset: () => void;
    isPending?: boolean;
}

export default function ReportForm({ onReportGenerated, onReset, isPending }: ReportFormProps) {
    const { initialData, generateReport } = useSportHouseReportPoints();

    const [classList, setClassList] = useState<NonNullable<ISportHouseReportPointsDropdowns['classList']>>([]);
    const [sectionList, setSectionList] = useState<NonNullable<ISportHouseReportPointsDropdowns['sectionList']>>([]);
    const [houseList, setHouseList] = useState<NonNullable<ISportHouseReportPointsDropdowns['houseList']>>([]);

    const [houseFilter, setHouseFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const form = useForm<SportHouseReportPointsFormSchema>({
        resolver: zodResolver(sportHouseReportPointsSchema),
        defaultValues: {
            asmaY_Id: undefined,
            selectedhouselist: [],
            Classelectedlist: [],
            selectedSectionlist: [],
            EME_Id: undefined,
        },
    });

    const {
        control,
        formState: { errors }
    } = form;

    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });

    // Populate initial dropdowns from initialData
    useEffect(() => {
        if (initialData.data) {
            if (initialData.data.houseList && initialData.data.houseList.length > 0) {
                setHouseList(initialData.data.houseList);
            }
            if (initialData.data.classList && initialData.data.classList.length > 0) {
                setClassList(initialData.data.classList);
            }
            if (initialData.data.sectionList && initialData.data.sectionList.length > 0) {
                setSectionList(initialData.data.sectionList);
            }
        }
    }, [initialData.data]);

    // Fetch Classes, Houses, and Sections when Academic Year changes
    useEffect(() => {
        if (watchedYear) {
            const fetchData = async () => {
                try {
                    const data = await getClassesForYear(watchedYear);
                    if (data.classList && data.classList.length > 0) {
                        setClassList(data.classList);
                    }
                    if (data.houseList && data.houseList.length > 0) {
                        setHouseList(data.houseList);
                    }
                    if (data.sectionList && data.sectionList.length > 0) {
                        setSectionList(data.sectionList);
                    }
                } catch (error) {
                    console.error("Failed to fetch classes/houses", error);
                    toast.error("Failed to load classes and houses");
                }
            };
            fetchData();
        }
    }, [watchedYear]);

    const onSubmit = (data: SportHouseReportPointsFormSchema) => {
        // Attach names to selected arrays so grid can generate dynamic columns and rows
        const enrichedHouses = data.selectedhouselist.map(h => {
            const found = houseList.find(item => item.spccmH_Id === h.spccmH_Id);
            return {
                spccmH_Id: h.spccmH_Id,
                spccmH_HouseName: found?.spccmH_HouseName || h.spccmH_HouseName || `House ${h.spccmH_Id}`,
                SPCCMH_HouseName: found?.spccmH_HouseName || h.spccmH_HouseName || `House ${h.spccmH_Id}`
            };
        });

        const enrichedClasses = data.Classelectedlist.map(c => {
            const found = classList.find(item => item.asmcL_Id === c.asmcL_Id);
            return {
                asmcL_Id: c.asmcL_Id,
                asmcL_ClassName: found?.asmcL_ClassName || c.asmcL_ClassName || `Class ${c.asmcL_Id}`
            };
        });

        const enrichedSections = data.selectedSectionlist.map(s => {
            const found = sectionList.find(item => item.asmS_Id === s.asmS_Id);
            return {
                asmS_Id: s.asmS_Id,
                asmC_SectionName: found?.asmC_SectionName || s.asmC_SectionName || `Section ${s.asmS_Id}`
            };
        });

        const payload: ISportHouseReportPointsRequest = {
            ASMAY_Id: data.asmaY_Id,
            Classelectedlist: enrichedClasses,
            selectedhouselist: enrichedHouses,
            selectedSectionlist: enrichedSections,
            EME_Id: data.EME_Id,
        };

        generateReport.mutate(payload, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData, payload);
                toast.success('House Report generated successfully!');
            },
            onError: (err) => {
                console.error("Error generating house report:", err);
                toast.error('Failed to generate House Report');
            }
        });
    };

    const handleCancel = () => {
        form.reset();
        setHouseFilter('');
        setClassFilter('');
        setSectionFilter('');
        if (initialData.data) {
            setClassList(initialData.data.classList || []);
            setHouseList(initialData.data.houseList || []);
            setSectionList(initialData.data.sectionList || []);
        }
        onReset();
    };

    const toggleAll = (list: any[], idKey: string, fieldName: any, checked: boolean) => {
        if (checked) {
            form.setValue(fieldName, list.map(item => ({ [idKey]: item[idKey] })));
        } else {
            form.setValue(fieldName, []);
        }
    };

    const filteredHouses = houseList?.filter(h => h.spccmH_HouseName.toLowerCase().includes(houseFilter.toLowerCase())) || [];
    const filteredClasses = classList?.filter(c => c.asmcL_ClassName.toLowerCase().includes(classFilter.toLowerCase())) || [];
    const filteredSections = sectionList?.filter(s => s.asmC_SectionName.toLowerCase().includes(sectionFilter.toLowerCase())) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        House Report
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Academic Year */}
                        <div className="flex flex-col gap-2">
                            <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">
                                Academic Year:
                            </Label>
                            <Controller
                                control={control}
                                name="asmaY_Id"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-1">
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString() || ""}
                                            disabled={initialData.isLoading}
                                        >
                                            <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder={initialData.isLoading ? "Loading..." : "Select Academic Year"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData.data?.yearlist?.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.asmaY_Id && <span className="text-xs font-medium text-destructive">{errors.asmaY_Id.message}</span>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* House Selection */}
                        <div className="flex flex-col gap-2">
                            <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">
                                House Name :
                            </Label>
                            <Controller
                                control={control}
                                name="selectedhouselist"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-1">
                                        <div className={`border rounded-md p-2 bg-background ${errors.selectedhouselist ? 'border-destructive' : ''}`}>
                                            <div className="flex items-center space-x-2 p-2 border-b bg-muted/30">
                                                <Checkbox
                                                    id="select-all-houses-pts"
                                                    checked={houseList && houseList.length > 0 && field.value?.length === houseList.length}
                                                    onCheckedChange={(checked) => toggleAll(houseList || [], 'spccmH_Id', 'selectedhouselist', !!checked)}
                                                />
                                                <label htmlFor="select-all-houses-pts" className="text-sm font-medium cursor-pointer">All</label>
                                                <div className="relative ml-auto w-1/2">
                                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="search here..."
                                                        className="h-7 pl-8 text-xs"
                                                        value={houseFilter}
                                                        onChange={(e) => setHouseFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full p-2">
                                                {filteredHouses.length > 0 ? filteredHouses.map((item) => (
                                                    <div key={item.spccmH_Id} className="flex items-center space-x-3 mb-2">
                                                        <Checkbox
                                                            id={`house-pts-${item.spccmH_Id}`}
                                                            checked={field.value?.some(val => val.spccmH_Id === item.spccmH_Id)}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...current, { spccmH_Id: item.spccmH_Id }]);
                                                                } else {
                                                                    field.onChange(current.filter(val => val.spccmH_Id !== item.spccmH_Id));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`house-pts-${item.spccmH_Id}`} className="text-sm cursor-pointer hover:text-primary">
                                                            {item.spccmH_HouseName}
                                                        </label>
                                                    </div>
                                                )) : <div className="text-muted-foreground text-sm p-4 text-center">No houses found</div>}
                                            </ScrollArea>
                                        </div>
                                        {errors.selectedhouselist && <span className="text-xs font-medium text-destructive">{errors.selectedhouselist.message}</span>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Class Name Selection */}
                        <div className="flex flex-col gap-2">
                            <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">
                                Class Name :
                            </Label>
                            <Controller
                                control={control}
                                name="Classelectedlist"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-1">
                                        <div className={`border rounded-md p-2 bg-background ${errors.Classelectedlist ? 'border-destructive' : ''}`}>
                                            <div className="flex items-center space-x-2 p-2 border-b bg-muted/30">
                                                <Checkbox
                                                    id="select-all-classes-pts"
                                                    checked={classList && classList.length > 0 && field.value?.length === classList.length}
                                                    onCheckedChange={(checked) => toggleAll(classList || [], 'asmcL_Id', 'Classelectedlist', !!checked)}
                                                />
                                                <label htmlFor="select-all-classes-pts" className="text-sm font-medium cursor-pointer">All</label>
                                                <div className="relative ml-auto w-1/2">
                                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="search here..."
                                                        className="h-7 pl-8 text-xs"
                                                        value={classFilter}
                                                        onChange={(e) => setClassFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full p-2">
                                                {filteredClasses.length > 0 ? filteredClasses.map((item) => (
                                                    <div key={item.asmcL_Id} className="flex items-center space-x-3 mb-2">
                                                        <Checkbox
                                                            id={`class-pts-${item.asmcL_Id}`}
                                                            checked={field.value?.some(val => val.asmcL_Id === item.asmcL_Id)}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...current, { asmcL_Id: item.asmcL_Id }]);
                                                                } else {
                                                                    field.onChange(current.filter(val => val.asmcL_Id !== item.asmcL_Id));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`class-pts-${item.asmcL_Id}`} className="text-sm cursor-pointer hover:text-primary">
                                                            {item.asmcL_ClassName}
                                                        </label>
                                                    </div>
                                                )) : <div className="text-muted-foreground text-sm p-4 text-center">No classes found</div>}
                                            </ScrollArea>
                                        </div>
                                        {errors.Classelectedlist && <span className="text-xs font-medium text-destructive">{errors.Classelectedlist.message}</span>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Section Selection */}
                        <div className="flex flex-col gap-2">
                            <Label className="after:ml-0.5 after:text-red-500 after:content-['*'] text-sm font-semibold">
                                Section Name :
                            </Label>
                            <Controller
                                control={control}
                                name="selectedSectionlist"
                                render={({ field }) => (
                                    <div className="flex flex-col gap-1">
                                        <div className={`border rounded-md p-2 bg-background ${errors.selectedSectionlist ? 'border-destructive' : ''}`}>
                                            <div className="flex items-center space-x-2 p-2 border-b bg-muted/30">
                                                <Checkbox
                                                    id="select-all-sections-pts"
                                                    checked={sectionList && sectionList.length > 0 && field.value?.length === sectionList.length}
                                                    onCheckedChange={(checked) => toggleAll(sectionList || [], 'asmS_Id', 'selectedSectionlist', !!checked)}
                                                />
                                                <label htmlFor="select-all-sections-pts" className="text-sm font-medium cursor-pointer">All</label>
                                                <div className="relative ml-auto w-1/2">
                                                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="search here..."
                                                        className="h-7 pl-8 text-xs"
                                                        value={sectionFilter}
                                                        onChange={(e) => setSectionFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <ScrollArea className="h-[150px] w-full p-2">
                                                {filteredSections.length > 0 ? filteredSections.map((item) => (
                                                    <div key={item.asmS_Id} className="flex items-center space-x-3 mb-2">
                                                        <Checkbox
                                                            id={`section-pts-${item.asmS_Id}`}
                                                            checked={field.value?.some(val => val.asmS_Id === item.asmS_Id)}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...current, { asmS_Id: item.asmS_Id }]);
                                                                } else {
                                                                    field.onChange(current.filter(val => val.asmS_Id !== item.asmS_Id));
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={`section-pts-${item.asmS_Id}`} className="text-sm cursor-pointer hover:text-primary">
                                                            {item.asmC_SectionName}
                                                        </label>
                                                    </div>
                                                )) : <div className="text-muted-foreground text-sm p-4 text-center">No sections found</div>}
                                            </ScrollArea>
                                        </div>
                                        {errors.selectedSectionlist && <span className="text-xs font-medium text-destructive">{errors.selectedSectionlist.message}</span>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-6 border-t">
                    <Button type="submit" disabled={isPending || generateReport.isPending} className="px-10 font-semibold">
                        {(isPending || generateReport.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <List className="mr-2 h-4 w-4" />}
                        Report
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleCancel} className="px-10 font-semibold">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
