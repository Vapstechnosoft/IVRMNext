'use client';

import { useFieldArray, UseFormReturn } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, History, X } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IAlumnusMembershipFormValues } from './schema';
import type { IYear, IClass } from '@/types/alumni/alumnus-membership';

interface ReadmittedSectionProps {
    form: UseFormReturn<IAlumnusMembershipFormValues>;
    years: IYear[];
    classes: IClass[];
}

export default function ReadmittedSection({ form, years, classes }: ReadmittedSectionProps) {
    const { fields, append, remove } = useFieldArray({
        name: 'ReadmittedStudentDTO',
        control: form.control
    });

    return (
        <CollapsibleSection title="Readmission History" defaultOpen={false} icon={<History className="h-5 w-5" />}>
            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="relative rounded-lg border bg-card p-6 shadow-sm">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-destructive hover:bg-destructive/10"
                            onClick={() => remove(index)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <FormField
                                control={form.control}
                                name={`ReadmittedStudentDTO.${index}.ALMSTRADM_YearJoined`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Joined</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                                            <SelectContent>{years.map(y => <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ReadmittedStudentDTO.${index}.ALMSTRADM_YearLeft`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Left</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                                            <SelectContent>{years.map(y => <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ReadmittedStudentDTO.${index}.ALMSTRADM_ClassJoined`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class Joined</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger></FormControl>
                                            <SelectContent>{classes.map(c => <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ReadmittedStudentDTO.${index}.ALMSTRADM_ClassLeft`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class Left</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger></FormControl>
                                            <SelectContent>{classes.map(c => <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => append({
                        ALMSTRADM_YearJoined: 0,
                        ALMSTRADM_YearLeft: 0,
                        ALMSTRADM_ClassJoined: 0,
                        ALMSTRADM_ClassLeft: 0
                    })}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Academic Period
                </Button>
            </div>
        </CollapsibleSection>
    );
}
