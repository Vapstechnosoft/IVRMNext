"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { birthdayReportSchema, type IBirthdayReportFormValues } from "./schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { FileSearch, RotateCcw } from "lucide-react";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";

interface ReportFilterFormProps {
    onSubmit: (values: IBirthdayReportFormValues) => void;
    isLoading: boolean;
}

const MONTHS = [
    { value: "01", label: "JANUARY" },
    { value: "02", label: "FEBRUARY" },
    { value: "03", label: "MARCH" },
    { value: "04", label: "APRIL" },
    { value: "05", label: "MAY" },
    { value: "06", label: "JUNE" },
    { value: "07", label: "JULY" },
    { value: "08", label: "AUGUST" },
    { value: "09", label: "SEPTEMBER" },
    { value: "10", label: "OCTOBER" },
    { value: "11", label: "NOVEMBER" },
    { value: "12", label: "DECEMBER" },
];

export default function ReportFilterForm({ onSubmit, isLoading }: ReportFilterFormProps) {
    const form = useForm<IBirthdayReportFormValues>({
        resolver: zodResolver(birthdayReportSchema),
        defaultValues: {
            all1: "1",
            flag: "S",
        },
    });

    const reportType = form.watch("all1");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CollapsibleSection title="Report Search Criteria" defaultOpen={true}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Report Type (Between Days / Month Wise) */}
                        <div className="space-y-4 p-4 border rounded-lg bg-accent/10">
                            <FormField
                                control={form.control}
                                name="all1"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Report Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="1" /></FormControl>
                                                    <FormLabel className="font-normal">Between Days</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="0" /></FormControl>
                                                    <FormLabel className="font-normal">Month Wise</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Participant Status (Studying / Left) */}
                        <div className="space-y-4 p-4 border rounded-lg bg-accent/10">
                            <FormField
                                control={form.control}
                                name="flag"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Participant Status</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="S" /></FormControl>
                                                    <FormLabel className="font-normal">Studying</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="L" /></FormControl>
                                                    <FormLabel className="font-normal">Left</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {reportType === "1" ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="fromdate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>From Date</FormLabel>
                                            <FormControl>
                                                <DatePicker date={field.value} setDate={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="todate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>To Date</FormLabel>
                                            <FormControl>
                                                <DatePicker date={field.value} setDate={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : (
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Month</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Month" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {MONTHS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <div className="flex justify-center gap-4 pt-8 border-t mt-8">
                        <Button type="submit" size="lg" disabled={isLoading} className="min-w-[150px]">
                            <FileSearch className="mr-2 h-5 w-5" /> Generate Report
                        </Button>
                        <Button type="button" variant="outline" size="lg" className="min-w-[150px]" onClick={() => form.reset()}>
                            <RotateCcw className="mr-2 h-5 w-5" /> Reset
                        </Button>
                    </div>
                </CollapsibleSection>
            </form>
        </Form>
    );
}
