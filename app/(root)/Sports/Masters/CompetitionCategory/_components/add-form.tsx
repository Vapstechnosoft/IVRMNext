'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { saveMasterCompetitionCategory } from '@/server/sports/masters/competition-category';
import { masterCompetitionCategorySchema } from '@/types/sports/masters/competition-category';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddMasterCompetitionCategoryFormProps {
    onSuccess: () => void;
}

export default function AddMasterCompetitionCategoryForm({ onSuccess }: AddMasterCompetitionCategoryFormProps) {
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof masterCompetitionCategorySchema>>({
        resolver: zodResolver(masterCompetitionCategorySchema),
        defaultValues: {
            SPCCMCC_CompitionCategory: '',
            SPCCMCC_CCDesc: '',
            SPCCMCC_CCAgeFlag: false,
            SPCCMCC_CCWeightFlag: false,
            SPCCMCC_ActiveFlag: true,
            SPCCMCC_FromCCAgeYear: null,
            SPCCMCC_ToCCAgeYear: null,
            SPCCMCC_FromCCAgeMonth: null,
            SPCCMCC_ToCCAgeMonth: null,
            SPCCMCC_FromCCAgeDays: null,
            SPCCMCC_ToCCAgeDays: null,
            SPCCMCC_CCWeight: null
        },
        mode: 'onChange'
    });

    const isAgeFlagChecked = form.watch('SPCCMCC_CCAgeFlag');
    const isWeightFlagChecked = form.watch('SPCCMCC_CCWeightFlag');

    const onSubmit = async (values: z.infer<typeof masterCompetitionCategorySchema>) => {
        try {
            const result = await saveMasterCompetitionCategory(values);
            // Relaxed check usually needed for legacy APIs
            if (result.success || result?.returnval === true || result?.returnVal === 'saved') {
                toast.success('Competition Category saved successfully');
                queryClient.invalidateQueries({ queryKey: ['master-competition-categories'] });
                form.reset();
                onSuccess();
            } else if (result?.returnVal === 'duplicate') {
                toast.warning('Record already exists');
            } else {
                toast.error(result.message || 'Failed to save record');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="SPCCMCC_CompitionCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Competition Category <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Competition Category" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SPCCMCC_CCDesc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter Description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-wrap gap-6 p-4 border rounded-md bg-muted/20">
                    <FormField
                        control={form.control}
                        name="SPCCMCC_CCAgeFlag"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Age Flag
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="SPCCMCC_CCWeightFlag"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Weight Flag
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {isAgeFlagChecked && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md animate-in fade-in zoom-in-95 duration-300">
                        <div className="col-span-full font-semibold border-b pb-2 mb-2">Age Criteria Details</div>

                        <FormField
                            control={form.control}
                            name="SPCCMCC_FromCCAgeYear"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Year <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="SPCCMCC_ToCCAgeYear"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Year <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="hidden md:block"></div>

                        <FormField
                            control={form.control}
                            name="SPCCMCC_FromCCAgeMonth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Month <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" max={12} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="SPCCMCC_ToCCAgeMonth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Month <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" max={12} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="hidden md:block"></div>

                        <FormField
                            control={form.control}
                            name="SPCCMCC_FromCCAgeDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Days <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" max={31} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="SPCCMCC_ToCCAgeDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Days <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" max={31} {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {isWeightFlagChecked && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md animate-in fade-in zoom-in-95 duration-300">
                        <div className="col-span-full font-semibold border-b pb-2 mb-2">Weight Criteria Details</div>
                        <FormField
                            control={form.control}
                            name="SPCCMCC_CCWeight"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Weight <span className="text-destructive">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => {
                        form.reset();
                        onSuccess();
                    }}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
