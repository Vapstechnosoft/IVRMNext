'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { sportsCCNameSchema } from '@/schemas/sports/masters/sports-cc-name';
import { saveSportsCCName, getSportsCCNameMasterData } from '@/actions/sports/masters/sports-cc-name';
import { SportsCCNameDTO, SportsCCNameMasterDataDTO } from '@/types/sports/masters/sports-cc-name';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

interface AddFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: SportsCCNameDTO | null;
}

export const AddForm = ({ onSuccess, onCancel, initialData }: AddFormProps) => {
    const [masterData, setMasterData] = useState<SportsCCNameMasterDataDTO | null>(null);

    const form = useForm<z.infer<typeof sportsCCNameSchema.addOrUpdate>>({
        resolver: zodResolver(sportsCCNameSchema.addOrUpdate),
        defaultValues: {
            SPCCMSCC_Id: 0,
            SPCCMSCCG_Id: 0,
            SPCCMSCC_SportsCCName: '',
            SPCCMSCC_SportsCCDesc: '',
            SPCCMSCC_SGFlag: 'Single',
            SPCCMSCC_NoOfMembers: 1,
            SPCCMSCC_RecHighLowFlag: 'High',
            SPCCMSCC_RecInfo: '',
            SPCCMSCC_MultiAttemptFlg: false,
            SPCCMSCC_NoOfAttempts: null,
            tempDatas: [{ SPCCMSCCG_UnderEvent: '' }], // Start with one empty row
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tempDatas",
    });

    // Load Master Data
    useEffect(() => {
        getSportsCCNameMasterData().then((data) => {
            setMasterData(data);
        });
    }, []);

    // Handle Initial Data for Edit
    useEffect(() => {
        if (initialData) {
            form.reset({
                SPCCMSCC_Id: initialData.SPCCMSCC_Id,
                SPCCMSCCG_Id: initialData.SPCCMSCCG_Id,
                SPCCMSCC_SportsCCName: initialData.SPCCMSCC_SportsCCName,
                SPCCMSCC_SportsCCDesc: initialData.SPCCMSCC_SportsCCDesc,
                SPCCMSCC_SGFlag: initialData.SPCCMSCC_SGFlag as "Single" | "Group",
                SPCCMSCC_NoOfMembers: initialData.SPCCMSCC_NoOfMembers,
                SPCCMSCC_RecHighLowFlag: initialData.SPCCMSCC_RecHighLowFlag as "High" | "Low",
                SPCCMSCC_RecInfo: initialData.SPCCMSCC_RecInfo,
                SPCCMSCC_MultiAttemptFlg: initialData.SPCCMSCC_MultiAttemptFlg,
                SPCCMSCC_NoOfAttempts: initialData.SPCCMSCC_NoOfAttempts,
                tempDatas: initialData.tempDatas && initialData.tempDatas.length > 0
                    ? initialData.tempDatas
                    : [{ SPCCMSCCG_UnderEvent: '' }],
            });
        }
    }, [initialData, form]);

    const watchSGFlag = form.watch('SPCCMSCC_SGFlag');
    const watchMultiAttempt = form.watch('SPCCMSCC_MultiAttemptFlg');

    // Effect for SG Flag
    useEffect(() => {
        if (watchSGFlag === 'Single') {
            form.setValue('SPCCMSCC_NoOfMembers', 1, { shouldValidate: true });
        }
    }, [watchSGFlag, form]);

    const onSubmit = async (values: z.infer<typeof sportsCCNameSchema.addOrUpdate>) => {
        try {
            const payload: SportsCCNameDTO = {
                ...values,
                SPCCMSCC_Id: values.SPCCMSCC_Id || 0,
                SPCCMSCCG_Id: Number(values.SPCCMSCCG_Id),
                SPCCMSCC_NoOfMembers: Number(values.SPCCMSCC_NoOfMembers),
                SPCCMSCC_NoOfAttempts: values.SPCCMSCC_NoOfAttempts ? Number(values.SPCCMSCC_NoOfAttempts) : null,
                tempDatas: values.tempDatas?.map(t => ({
                    ...t,
                    SPCCMSCCG_UnderEvent: t.SPCCMSCCG_UnderEvent || ''
                })),
            };
            const result = await saveSportsCCName(payload);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="SPCCMSCCG_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group/Main Event <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="--Select--" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {masterData?.gropList.map((item) => (
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

                        <FormField
                            control={form.control}
                            name="SPCCMSCC_SportsCCDesc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter Description..." maxLength={250} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="SPCCMSCC_NoOfMembers"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No.Of Members <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter No.Of Members..."
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        // readOnly={watchSGFlag === 'Single'} // Optionally make readonly if Single
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="SPCCMSCC_SGFlag"
                            render={({ field }) => (
                                <FormItem className="space-y-3 p-3 border rounded-md">
                                    <FormLabel>SG Flag <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Single" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Single
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Group" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Group
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="SPCCMSCC_RecHighLowFlag"
                            render={({ field }) => (
                                <FormItem className="space-y-3 p-3 border rounded-md">
                                    <FormLabel>High/Low Flag <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="High" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    High
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Low" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Low
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
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
                            name="SPCCMSCC_RecInfo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rec Info</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Rec Info" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="SPCCMSCC_SportsCCName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sports Name / Sub Event <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Sports Name..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col space-y-4 p-3 border rounded-md">
                            <FormField
                                control={form.control}
                                name="SPCCMSCC_MultiAttemptFlg"
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
                                                Number Of Attempts?
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {watchMultiAttempt && (
                                <FormField
                                    control={form.control}
                                    name="SPCCMSCC_NoOfAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* <FormLabel>Number Of Attempts</FormLabel> */}
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter Number Of Attempts..."
                                                    type="number"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={e => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Sub Sub Event Dynamic Table */}
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="p-2 text-center w-16">Sl.No.</th>
                                        <th className="p-2">Sub Sub Event</th>
                                        <th className="p-2 text-center w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="border-t">
                                            <td className="p-2 text-center">{index + 1}</td>
                                            <td className="p-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`tempDatas.${index}.SPCCMSCCG_UnderEvent`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Sub Sub Event" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="flex justify-center space-x-2">
                                                    {/* Add Button only on last row */}
                                                    {index === fields.length - 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => append({ SPCCMSCCG_UnderEvent: '' })}
                                                        >
                                                            <Plus className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    )}

                                                    {/* Remove Button (if more than 1 row) */}
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                            className="text-red-500"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

                <div className="flex justify-center space-x-2 mt-6">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
