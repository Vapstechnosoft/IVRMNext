'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Save, X } from 'lucide-react';

import { masterBoardSchema, MasterBoardFormValues } from '@/schemas/admission/oldsharedhost/masters/master-board';
import { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';
import { saveMasterBoard } from '@/server/admission/oldsharedhost/masters/master-board';

export default function AddMasterBoardForm({ onSuccess }: { onSuccess: () => void }) {
    const { selectedRow, closeAddForm } = useFormContext<IMasterBoard>();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<MasterBoardFormValues>({
        resolver: zodResolver(masterBoardSchema),
        defaultValues: {
            ivrmmB_Id: 0,
            ivrmmB_Name: '',
            ivrmmB_Description: '',
        },
    });

    useEffect(() => {
        form.reset({
            ivrmmB_Id: 0,
            ivrmmB_Name: '',
            ivrmmB_Description: '',
        });
    }, [form]);

    const onSubmit = async (values: MasterBoardFormValues) => {
        setIsSaving(true);
        try {
            const response = await saveMasterBoard(values);
            if (response.success || response.returnval === 'Add') {
                toast.success('Record Saved Successfully');
                onSuccess();
            } else if (response.returnval === 'Duplicate') {
                toast.error('Master Board Already Exists');
            } else {
                toast.error(response.message || 'Operation Failed');
            }
        } catch (error) {
            toast.error('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Board Name */}
                    <FormField
                        control={form.control}
                        name="ivrmmB_Name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Board Name <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Enter Board Name" 
                                        maxLength={50} 
                                        onPaste={(e) => e.preventDefault()}
                                        {...field} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Board Description */}
                    <FormField
                        control={form.control}
                        name="ivrmmB_Description"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>
                                    Board Description <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Enter Board Description" 
                                        maxLength={100} 
                                        rows={3} 
                                        onPaste={(e) => e.preventDefault()}
                                        {...field} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-start items-center gap-4 mt-6 border-t pt-4">
                    <Button type="button" variant="outline" onClick={() => window.location.reload()} disabled={isSaving} className="min-w-24 font-semibold shadow-sm hover:bg-slate-50">
                        Reset
                    </Button>
                    <Button type="submit" disabled={isSaving || !form.formState.isDirty} className="min-w-24 bg-[#ff6b35] hover:bg-[#e05b25] text-white border-0 shadow-sm font-semibold">
                        {isSaving ? <Spinner className="mr-2 h-4 w-4 text-white" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Master Board
                    </Button>
                </div>
            </form>
        </Form>
    );
}
