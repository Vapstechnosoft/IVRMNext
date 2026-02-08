'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VenueWiseParticipationReportSchema, VenueWiseParticipationReportFormSchema, IVenueWiseReportData, IVenueWiseReportDropdowns } from "@/types/sports/reports/venue-wise-participation-report";
import { useVenueWiseParticipationReport } from "@/hooks/sports/useVenueWiseParticipationReport";

interface ReportFormProps {
    dropdowns: IVenueWiseReportDropdowns;
    onReportGenerated: (data: IVenueWiseReportData[]) => void;
}

export const ReportForm = ({ dropdowns, onReportGenerated }: ReportFormProps) => {
    const { generateReport } = useVenueWiseParticipationReport();

    const form = useForm<VenueWiseParticipationReportFormSchema>({
        resolver: zodResolver(VenueWiseParticipationReportSchema),
        defaultValues: {
            Type: 'House',
            ASMAY_Id: undefined,
            ASMCL_Id: undefined,
            selectedSections: [],
            selectedHouses: [],
            selectedVenues: [],
        },
    });

    const watchedType = useWatch({ control: form.control, name: 'Type' });

    // Reset dependent fields when Type changes
    useEffect(() => {
        // We might want to clear selected values when switching types
        // form.setValue('ASMCL_Id', undefined);
        // form.setValue('selectedSections', []);
    }, [watchedType, form]);

    const onSubmit = (data: VenueWiseParticipationReportFormSchema) => {
        generateReport.mutate(data, {
            onSuccess: (responseData) => {
                onReportGenerated(responseData || []);
                toast.success('Report generated successfully');
            },
            onError: (error) => {
                console.error("Report Generation Error:", error);
                toast.error('Failed to generate report');
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Type Selection (Radio) */}
                <FormField
                    control={form.control}
                    name="Type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            {/* <FormLabel>Report Type</FormLabel> */}
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex justify-center space-x-4 p-4 border rounded-md bg-muted/20"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="House" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            By House
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="CS" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            By Class/Section
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name="ASMAY_Id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Academic Year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dropdowns?.academicYear.map((item) => (
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

                    {/* Class (Visible only for CS) */}
                    {watchedType === 'CS' && (
                        <FormField
                            control={form.control}
                            name="ASMCL_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {dropdowns?.classList.map((item) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Section (Visible only for CS - Multi Select) */}
                    {watchedType === 'CS' && (
                        <FormField
                            control={form.control}
                            name="selectedSections"
                            render={() => (
                                <FormItem>
                                    <div className="mb-2">
                                        <FormLabel>Section Name <span className="text-red-500">*</span></FormLabel>
                                    </div>
                                    <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                        {dropdowns?.sectionList.map((item) => (
                                            <FormField
                                                key={item.asmS_Id}
                                                control={form.control}
                                                name="selectedSections"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.asmS_Id}
                                                            className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.some(val => val.asmS_Id === item.asmS_Id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = field.value || [];
                                                                        return checked
                                                                            ? field.onChange([...current, { asmS_Id: item.asmS_Id }])
                                                                            : field.onChange(current.filter(val => val.asmS_Id !== item.asmS_Id));
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {item.asmC_SectionName}
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

                    {/* House Name (Visible for both? Legacy implies yes, but validation only for House type?
                        User Request: "By House" -> House dropdown. "By CS" -> Class/Section dropdowns.
                        Legacy HTML shows House dropdown block inside `col-sm-6`. It doesn't have an `ng-show`.
                        But the validation messge says `ng-required="Type=='House'"`.
                        Common Logic: Even if filtered by CS, user might want to filter by House too.
                        However, the "Radio" choice usually implies the primary grouping or filter mode.
                        Let's show it always as per legacy HTML structure (it wasn't hidden by ng-show aside from Class/Section/Venue blocks).
                        Wait, Venue block didn't have ng-show either.
                        Let's keep House visible.
                    */}
                    <FormField
                        control={form.control}
                        name="selectedHouses"
                        render={() => (
                            <FormItem>
                                <div className="mb-2">
                                    <FormLabel>House Name <span className="text-red-500">*</span></FormLabel>
                                </div>
                                <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                    {dropdowns?.houseList.map((item) => (
                                        <FormField
                                            key={item.spccmH_Id}
                                            control={form.control}
                                            name="selectedHouses"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.spccmH_Id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.some(val => val.spccmH_Id === item.spccmH_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...current, { spccmH_Id: item.spccmH_Id }])
                                                                        : field.onChange(current.filter(val => val.spccmH_Id !== item.spccmH_Id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.spccmH_HouseName}
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

                    {/* Venue Name (Multi Select) */}
                    <FormField
                        control={form.control}
                        name="selectedVenues"
                        render={() => (
                            <FormItem>
                                <div className="mb-2">
                                    <FormLabel>Venue Name <span className="text-red-500">*</span></FormLabel>
                                </div>
                                <ScrollArea className="h-[150px] w-full border rounded-md p-2">
                                    {dropdowns?.venueList.map((item) => (
                                        <FormField
                                            key={item.spccmeV_Id}
                                            control={form.control}
                                            name="selectedVenues"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.spccmeV_Id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.some(val => val.spccmeV_Id === item.spccmeV_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    return checked
                                                                        ? field.onChange([...current, { spccmeV_Id: item.spccmeV_Id }])
                                                                        : field.onChange(current.filter(val => val.spccmeV_Id !== item.spccmeV_Id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.spccmeV_EventVenue}
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
