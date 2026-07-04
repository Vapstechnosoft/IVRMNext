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
        if (selectedRow) {
            form.reset({
                ivrmmB_Id: selectedRow.ivrmmB_Id,
                ivrmmB_Name: selectedRow.ivrmmB_Name,
                ivrmmB_Description: selectedRow.ivrmmB_Description,
            });
        } else {
            form.reset({
                ivrmmB_Id: 0,
                ivrmmB_Name: '',
                ivrmmB_Description: '',
            });
        }
    }, [selectedRow, form]);

    const onSubmit = async (values: MasterBoardFormValues) => {
        setIsSaving(true);
        try {
            const response = await saveMasterBoard(values);
            if (response.success || response.returnval === 'Add' || response.returnval === 'Update') {
                toast.success(response.returnval === 'Add' ? 'Record Saved Successfully' : 'Record Updated Successfully');
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
                                    <Input placeholder="Enter Board Name" maxLength={50} {...field} />
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
                                    <Textarea placeholder="Enter Board Description" maxLength={100} {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button type="submit" disabled={isSaving || !form.formState.isDirty} className="min-w-24">
                        {isSaving ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        {selectedRow ? 'Update' : 'Save'}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeAddForm} disabled={isSaving} className="min-w-24 text-destructive border-destructive hover:bg-destructive/10">
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
