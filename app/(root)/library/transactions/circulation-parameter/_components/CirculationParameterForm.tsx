'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CirculationParameterFormValues } from '@/types/library/transactions/circulationParameter';
import { useFormContext } from 'react-hook-form';

interface CirculationParameterFormProps {
    categoryList: any[];
    bookTypeList: any[];
    classList: any[];
    departmentList: any[];
    employeeGroupList: any[];
    guestList: any[];
}

export const CirculationParameterForm = ({
    categoryList,
    bookTypeList,
    classList,
    departmentList,
    employeeGroupList,
    guestList
}: CirculationParameterFormProps) => {
    const form = useFormContext<CirculationParameterFormValues>();
    const { watch, setValue } = form;

    const bookParameterFlag = watch('bookParameterFlag');
    const issuerType = watch('issuerType');

    return (
        <div className='space-y-6'>
            <div className='mb-6 flex flex-wrap justify-center gap-8'>
                {/* Book vs Non Book Toggle */}
                <FormField
                    control={form.control}
                    name='bookParameterFlag'
                    render={({ field }) => (
                        <FormItem className='space-y-3'>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('categoryId', undefined);
                                        setValue('bookType', '');
                                    }}
                                    defaultValue={field.value}
                                    className='flex space-x-4'>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='BP' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Book Parameter</FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='NBP' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Non Book Parameter</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            <div className='mb-8 flex flex-wrap justify-center gap-8'>
                {/* Issuer Type Toggle */}
                <FormField
                    control={form.control}
                    name='issuerType'
                    render={({ field }) => (
                        <FormItem className='space-y-3'>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('classId', undefined);
                                        setValue('employeeGroupId', undefined);
                                        setValue('departmentId', undefined);
                                        setValue('guestId', undefined);
                                    }}
                                    defaultValue={field.value}
                                    className='flex flex-wrap space-x-4'>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='STUDENT' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Student</FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='STAFF' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Staff</FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='DEPARTMENT' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Department</FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem value='GUEST' />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Guest</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Conditional Book Fields */}
                {bookParameterFlag === 'BP' ? (
                    <FormField
                        control={form.control}
                        name='bookType'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Book Type <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Book Type' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Issue'>Issue</SelectItem>
                                        <SelectItem value='Reference'>Reference</SelectItem>
                                        <SelectItem value='Both'>Both</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={form.control}
                        name='categoryId'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Category Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        const category = categoryList.find((c: any) => c.lmC_Id === Number(val));
                                        if (category) setValue('categoryName', category.lmC_CategoryName);
                                    }}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Category Name' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoryList.map((c: any) => (
                                            <SelectItem key={c.lmC_Id} value={String(c.lmC_Id)}>
                                                {c.lmC_CategoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {/* Conditional Issuer Fields */}
                {issuerType === 'STUDENT' && (
                    <FormField
                        control={form.control}
                        name='classId'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classList.map((c: any) => (
                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {issuerType === 'STAFF' && (
                    <FormField
                        control={form.control}
                        name='employeeGroupId'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Employee Group <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Employee Group' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {employeeGroupList.map((e: any) => (
                                            <SelectItem key={e.hrmgT_Id} value={String(e.hrmgT_Id)}>
                                                {e.hrmgT_EmployeeGroupType}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {issuerType === 'DEPARTMENT' && (
                    <FormField
                        control={form.control}
                        name='departmentId'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Department <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Department' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departmentList.map((d: any) => (
                                            <SelectItem key={d.hrmD_Id} value={String(d.hrmD_Id)}>
                                                {d.hrmD_DepartmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {issuerType === 'GUEST' && (
                    <FormField
                        control={form.control}
                        name='guestId'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>
                                    Guest Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Guest' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {guestList.map((g: any) => (
                                            <SelectItem key={g.guest_Id} value={String(g.guest_Id)}>
                                                {g.guest_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {/* Number Inputs */}
                <FormField
                    control={form.control}
                    name='maxIssueItems'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>No. Of Items</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='Enter max items'
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='maxIssueDays'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issue Days</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='Enter max issue days'
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='maxRenewals'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Renewals</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='Enter max renewals'
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};
