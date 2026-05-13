import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

export default function TabAuthorDetails({
    dropdownData,
    onSave,
    onPrevious,
    onCancel,
    onClear
}: {
    dropdownData: any;
    onSave: () => void;
    onPrevious: () => void;
    onCancel: () => void;
    onClear: () => void;
}) {
    const {
        control,
        register,
        setValue,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'accessionList'
    });

    const [numCopies, setNumCopies] = useState<string>('');

    const handleAddCopies = () => {
        const count = parseInt(numCopies);
        if (isNaN(count) || count <= 0) return;
        
        for (let i = 0; i < count; i++) {
            append({ lmbanO_No: '', lmbanO_AvialableStatus: 'Available' });
        }
        setNumCopies('');
    };

    const rackList = dropdownData?.racklist || dropdownData?.rackList || [];
    const authorList = dropdownData?.authorlst || dropdownData?.authorList || [];
    const accessoriesList = dropdownData?.accessoriesList || [];

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6 lg:flex-row'>
                {/* AUTHOR ENTRY & PRICE DETAILS */}
                <div className='flex-1 space-y-4 rounded-md border p-4'>
                    <h3 className='font-bold text-blue-800 border-b pb-2 uppercase tracking-wide'>Author Entry & Price Details</h3>
                    
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='master-author' />
                        <Label htmlFor='master-author'>Master Author</Label>
                    </div>

                    <div className='grid grid-cols-1 gap-4'>
                        <InputText label='First Name' required {...register('lmB_AuthorFirstName')} />
                        <InputText label='Middle Name' {...register('lmB_AuthorMiddleName')} />
                        <InputText label='Last Name' {...register('lmB_AuthorLastName')} />

                        <div className='flex flex-col gap-1.5'>
                            <Label>Book Status <span className='text-red-500'>*</span></Label>
                            <Controller
                                control={control}
                                name='lmbanO_AvialableStatus'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select Status--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Available'>Available</SelectItem>
                                            <SelectItem value='Lost'>Lost</SelectItem>
                                            <SelectItem value='Issued'>Issued</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <Label>Rack name <span className='text-red-500'>*</span></Label>
                            <Controller
                                control={control}
                                name='lmrA_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--select field--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rackList.map((item: any) => (
                                                <SelectItem key={item.lmrA_Id} value={item.lmrA_Id.toString()}>
                                                    {item.lmrA_RackName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <InputText label='Price/copy' type='number' {...register('lmB_Price')} />

                        <div className='flex flex-col gap-1.5'>
                            <Label>Discount Type</Label>
                            <Controller
                                control={control}
                                name='mB_Disc_Type'
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Rs' id='d-rs' />
                                            <Label htmlFor='d-rs'>Rs</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='percentage' id='d-perc' />
                                            <Label htmlFor='d-perc'>% age</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <InputText label='Discount(Amt)' type='number' {...register('mB_Discount')} />
                        <InputText label='Total Price' type='number' {...register('lmB_NetPrice')} readOnly className='bg-gray-50' />
                    </div>
                </div>

                {/* ACCESSORIES DETAILS & ACCESSION */}
                <div className='flex-1 space-y-6'>
                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='font-bold text-blue-800 border-b pb-2 uppercase tracking-wide'>Accessories Details</h3>
                        <div className='flex flex-col gap-1.5'>
                            <Label>Accessories</Label>
                            <Controller
                                control={control}
                                name='lmaC_Id'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accessoriesList.map((item: any) => (
                                                <SelectItem key={item.lmaC_Id} value={item.lmaC_Id.toString()}>
                                                    {item.lmaC_AccessoriesName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className='flex items-center space-x-2'>
                            <Controller
                                control={control}
                                name='with_Accessories'
                                render={({ field }) => (
                                    <Checkbox
                                        id='with-acc'
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor='with-acc'>With Accessories</Label>
                        </div>
                    </div>

                    <div className='space-y-4 rounded-md border p-4'>
                        <h3 className='font-bold text-blue-800 border-b pb-2 uppercase tracking-wide text-center'>Accession</h3>
                        <div className='flex items-end gap-2'>
                            <div className='flex-1'>
                                <Label>No. Of Copies <span className='text-red-500'>*</span></Label>
                                <InputText
                                    value={numCopies}
                                    onChange={(e) => setNumCopies(e.target.value)}
                                    placeholder='Enter No. Of Copies'
                                />
                            </div>
                            <Button type='button' onClick={handleAddCopies} className='bg-orange-500 hover:bg-orange-600 px-6'>
                                OK
                            </Button>
                        </div>

                        <div className='max-h-[200px] overflow-auto rounded-md border'>
                            <Table>
                                <TableHeader className='bg-blue-600'>
                                    <TableRow>
                                        <TableHead className='text-white'>SL No</TableHead>
                                        <TableHead className='text-white'>Accession No</TableHead>
                                        <TableHead className='text-white w-10'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <InputText
                                                    {...register(`accessionList.${index}.lmbanO_No` as const)}
                                                    className='h-8'
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section (Placeholder for Grid in Image 3) */}
            <div className='rounded-md border p-4'>
                 <div className='text-xs text-red-500 mb-2 italic'>
                    * File Must Be Upload jpeg,Png,pdf, Document<br/>
                    * File size should be less than 5 MB
                 </div>
                 <Table>
                    <TableHeader className='bg-blue-600'>
                        <TableRow>
                            <TableHead className='text-white'>SL.No.</TableHead>
                            <TableHead className='text-white'>Upload</TableHead>
                            <TableHead className='text-white'>View</TableHead>
                            <TableHead className='text-white'>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>
                                <Button type='button' variant='outline' className='bg-yellow-400 hover:bg-yellow-500 w-full text-xs h-8'>
                                    Choose File
                                </Button>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                                <Button type='button' variant='ghost' size='icon'>
                                    <Plus className='h-4 w-4 text-blue-600' />
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                 </Table>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4 border-t'>
    <Button type='button' variant='default' onClick={onPrevious} className='bg-blue-600 hover:bg-blue-700 uppercase text-xs font-bold px-6'>
        Previous
    </Button>
    <Button type='button' variant='destructive' onClick={onClear} className='bg-red-500 hover:bg-red-600 uppercase text-xs font-bold px-6'>
        Clear
    </Button>
    <Button type='button' variant='warning' onClick={onCancel} className='bg-orange-500 hover:bg-orange-600 uppercase text-xs font-bold px-6'>
        Cancel
    </Button>
    <Button type='button' variant='default' onClick={onSave} className='bg-blue-800 hover:bg-blue-900 uppercase text-xs font-bold px-6'>
        Save
    </Button>
</div>
        </div>
    );
}
