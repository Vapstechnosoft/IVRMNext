'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alumniReportSchema, AlumniReportFormValues } from "./schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IAlumniAcademicYear, IAlumniClass } from "@/types/alumni/alumni-search";
import { ICountry, IState, IDistrict } from "@/types/alumni/alumni-report";
import { useEffect, useState } from "react";
import { getStates, getDistricts } from "@/server/alumni/alumni-report";
import { Search, RotateCcw, FileText } from "lucide-react";
import { toast } from "sonner";

interface AlumniReportFilterFormProps {
    initialData: {
        yearList: IAlumniAcademicYear[];
        classList: IAlumniClass[];
        countrylist: ICountry[];
        citylist: { almsT_ConCity: string }[];
        occupationlist: { designation: string }[];
    };
    onSubmit: (values: AlumniReportFormValues) => void;
    onReset: () => void;
    loading: boolean;
}

export function AlumniReportFilterForm({ initialData, onSubmit, onReset, loading }: AlumniReportFilterFormProps) {
    const [states, setStates] = useState<IState[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    const form = useForm<AlumniReportFormValues>({
        resolver: zodResolver(alumniReportSchema),
        defaultValues: {
            sall: 1,
            batchIds: [],
            countryIds: [],
            stateIds: [],
            districtIds: [],
            classIds: [],
            city: "",
            occupation: "",
            showEmail: true,
            showPhone: true,
        },
    });

    const selectedCountries = form.watch("countryIds");
    const selectedStates = form.watch("stateIds");

    useEffect(() => {
        const fetchStates = async () => {
            if (selectedCountries && selectedCountries.length > 0) {
                setLoadingStates(true);
                try {
                    const response = await getStates(selectedCountries.map(id => ({ IVRMMC_Id: id })));
                    if (response.success && response.data) {
                        setStates(response.data.statelist || []);
                    }
                } catch (error) {
                    toast.error("Failed to fetch states");
                } finally {
                    setLoadingStates(false);
                }
            } else {
                setStates([]);
                form.setValue("stateIds", []);
            }
        };
        fetchStates();
    }, [selectedCountries, form]);

    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedStates && selectedStates.length > 0) {
                setLoadingDistricts(true);
                try {
                    const response = await getDistricts(selectedStates.map(id => ({ IVRMMS_Id: id })));
                    if (response.success && response.data) {
                        setDistricts(response.data.districtlist || []);
                    }
                } catch (error) {
                    toast.error("Failed to fetch districts");
                } finally {
                    setLoadingDistricts(false);
                }
            } else {
                setDistricts([]);
                form.setValue("districtIds", []);
            }
        };
        fetchDistricts();
    }, [selectedStates, form]);

    const handleReset = () => {
        form.reset();
        onReset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sall"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Report Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value.toString()}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="1" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Alumni Report</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="0" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Address Book</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="batchIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={initialData.yearList.map(y => ({ label: y.asmaY_Year, value: y.asmaY_Id.toString() }))}
                                            onValueChange={(vals) => field.onChange(vals.map(v => parseInt(v)))}
                                            defaultValue={field.value.map(v => v.toString())}
                                            placeholder="Select Batches"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="countryIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={initialData.countrylist.map(c => ({ label: c.ivrmmC_CountryName, value: c.ivrmmC_Id.toString() }))}
                                            onValueChange={(vals) => field.onChange(vals.map(v => parseInt(v)))}
                                            defaultValue={field.value?.map(v => v.toString()) || []}
                                            placeholder="Select Countries"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stateIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={states.map(s => ({ label: s.ivrmmS_Name, value: s.ivrmmS_Id.toString() }))}
                                            onValueChange={(vals) => field.onChange(vals.map(v => parseInt(v)))}
                                            defaultValue={field.value?.map(v => v.toString()) || []}
                                            placeholder={loadingStates ? "Loading states..." : "Select States"}
                                            disabled={!selectedCountries?.length}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="districtIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>District</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={districts.map(d => ({ label: d.ivrmmD_Name, value: d.ivrmmD_Id.toString() }))}
                                            onValueChange={(vals) => field.onChange(vals.map(v => parseInt(v)))}
                                            defaultValue={field.value?.map(v => v.toString()) || []}
                                            placeholder={loadingDistricts ? "Loading districts..." : "Select Districts"}
                                            disabled={!selectedStates?.length}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="classIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={initialData.classList.map(c => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                            onValueChange={(vals) => field.onChange(vals.map(v => parseInt(v)))}
                                            defaultValue={field.value?.map(v => v.toString()) || []}
                                            placeholder="Select Classes"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select City" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData.citylist.map((c, i) => (
                                                    <SelectItem key={i} value={c.almsT_ConCity}>
                                                        {c.almsT_ConCity}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Occupation" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData.occupationlist.map((o, i) => (
                                                    <SelectItem key={i} value={o.designation}>
                                                        {o.designation}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex space-x-6 p-4 border rounded-md bg-muted/50">
                            <FormField
                                control={form.control}
                                name="showEmail"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">Show Email</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="showPhone"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">Show Phone No.</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <Button type="submit" disabled={loading}>
                        <FileText className="mr-2 h-4 w-4" />
                        {loading ? "Generating..." : "Show Report"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
