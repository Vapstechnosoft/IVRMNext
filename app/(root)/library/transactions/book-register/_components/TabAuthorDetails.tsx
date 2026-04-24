'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { Trash } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

export default function TabAuthorDetails({ dropdownData }: { dropdownData: any }) {
    const {
        control,
        register,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'accessionList'
    });

    const handleAddCopies = () => {
        append({ lmbanO_No: '' });
    };

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                    <Label>Author</Label>
                    <Controller
                        control={control}
                        name='lmAU_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Author' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.authorlst?.map((item: any) => (
                                        <SelectItem key={item.lmaU_Id} value={item.lmaU_Id.toString()}>
                                            {item.lmaU_AuthorFirstName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Room No <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lRM_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Room' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.roomList?.map((item: any) => (
                                        <SelectItem key={item.lrma_id} value={item.lrma_id.toString()}>
                                            {item.lrma_roomname}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lRM_Id && <FormError>{errors.lRM_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Rack <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lRAM_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Rack' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.racklist?.map((item: any) => (
                                        <SelectItem key={item.lraM_Id} value={item.lraM_Id.toString()}>
                                            {item.lraM_RackName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lRAM_Id && <FormError>{errors.lRAM_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Shelf <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lSM_Id'
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(Number(val))}
                                value={field.value ? field.value.toString() : undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Shelf' />
                                </SelectTrigger>
                                <SelectContent>
                                    {dropdownData?.shelflist?.map((item: any) => (
                                        <SelectItem key={item.lsM_Id} value={item.lsM_Id.toString()}>
                                            {item.lsM_ShelfNo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lSM_Id && <FormError>{errors.lSM_Id.message}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Available Status <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        control={control}
                        name='lmbanO_AvialableStatus'
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Status' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='Available'>Available</SelectItem>
                                    <SelectItem value='Reference'>Reference Only</SelectItem>
                                    <SelectItem value='Lost'>Lost</SelectItem>
                                    <SelectItem value='Written Off'>Written Off</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.lmbanO_AvialableStatus && <FormError>{errors.lmbanO_AvialableStatus.message}</FormError>}
                </div>
            </div>

            <div className='rounded-md border p-4'>
                <div className='mb-4 flex items-center justify-between'>
                    <h4 className='font-medium'>Accession Numbers</h4>
                    <Button type='button' onClick={handleAddCopies} variant='outline' size='sm'>
                        Add Copy
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Accession No <span className='text-red-500'>*</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <InputText
                                        {...register(`accessionList.${index}.lmbanO_No` as const)}
                                        placeholder='Enter Accession No'
                                        error={errors.accessionList?.[index]?.lmbanO_No?.message}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button type='button' variant='ghost' size='icon' onClick={() => remove(index)}>
                                        <Trash className='h-4 w-4 text-destructive' />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {errors.accessionList && typeof errors.accessionList.message === 'string' && (
                    <FormError>{errors.accessionList.message}</FormError>
                )}
            </div>
        </div>
    );
}
