'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { mobileMasterPageSchema, type MobileMasterPageFormData } from '@/schemas/super-admin/configuration-setting/mobilemasterpage';
import { saveMobileMasterPage } from '@/server/super-admin/configuration-setting/mobilemasterpage';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type { IMobileMasterPage } from '@/types/super-admin/configuration-setting/mobilemasterpage';

interface MobileMasterPageFormProps {
    selectedRow?: IMobileMasterPage | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function MobileMasterPageForm({ selectedRow, onSuccess, onCancel }: MobileMasterPageFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MobileMasterPageFormData>({
        resolver: zodResolver(mobileMasterPageSchema),
        defaultValues: {
            ivrmmaP_AppPageName: '',
            ivrmmaP_Displayname: '',
            ivrmmaP_AppPageDesc: '',
            ivrmmaP_AppPageURL: '',
        },
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                ivrmmaP_AppPageName: selectedRow.ivrmmaP_AppPageName,
                ivrmmaP_Displayname: selectedRow.ivrmmaP_Displayname,
                ivrmmaP_AppPageDesc: selectedRow.ivrmmaP_AppPageDesc || '',
                ivrmmaP_AppPageURL: selectedRow.ivrmmaP_AppPageURL || '',
            });
        } else {
            reset({
                ivrmmaP_AppPageName: '',
                ivrmmaP_Displayname: '',
                ivrmmaP_AppPageDesc: '',
                ivrmmaP_AppPageURL: '',
            });
        }
    }, [selectedRow, reset]);

    async function onSubmit(data: MobileMasterPageFormData) {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                ivrmmaP_Id: selectedRow?.ivrmmaP_Id || 0,
            };

            const result = await saveMobileMasterPage(payload);

            if (result.success) {
                toast.success(result.message);
                reset();
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-[#7C3AED]">
                    {selectedRow ? 'Edit Mobile App Master Page' : 'Add Mobile App Master Page'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Page Name <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('ivrmmaP_AppPageName')}
                                placeholder="Enter page name"
                            />
                            {errors.ivrmmaP_AppPageName?.message && (
                                <FormError>{errors.ivrmmaP_AppPageName.message}</FormError>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Page Displayname <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('ivrmmaP_Displayname')}
                                placeholder="Enter display name"
                            />
                            {errors.ivrmmaP_Displayname?.message && (
                                <FormError>{errors.ivrmmaP_Displayname.message}</FormError>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Page Icon/Description <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('ivrmmaP_AppPageDesc')}
                                placeholder="Enter page icon path/description"
                            />
                            {errors.ivrmmaP_AppPageDesc?.message && (
                                <FormError>{errors.ivrmmaP_AppPageDesc.message}</FormError>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Page Keyword/URL <span className="text-red-500">*</span></Label>
                            <Input
                                {...register('ivrmmaP_AppPageURL')}
                                placeholder="Enter page keyword/URL"
                            />
                            {errors.ivrmmaP_AppPageURL?.message && (
                                <FormError>{errors.ivrmmaP_AppPageURL.message}</FormError>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="px-6 border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF]"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {selectedRow ? 'Update' : 'Save'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
