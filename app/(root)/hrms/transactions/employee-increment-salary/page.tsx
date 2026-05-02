'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { useEmployeeIncrementGrid, useDeleteEmployeeIncrementMaster, useAddOrUpdateEmployeeSalaryIncrement } from '@/hooks/hrms/useTransactions';
import { useEmployeesForNoticeBoard } from '@/hooks/upload/transactions/use-notice-board';
import { getHeadDropdown } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import { getEmployeeIncrementColumns } from './_components/columns';
import { Badge } from '@/components/ui/badge';
import { useGetEmployees } from '@/hooks/hrms/useMasters';

export default function EmployeeIncrementSalaryPage() {
    const [heads, setHeads] = useState<any[]>([]);
    const [isHeadsLoading, setIsHeadsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Fetch Employees using existing hook
    const { data: employeesData, isLoading: isEmployeesLoading } = useGetEmployees();

    // Fetch Heads
    useEffect(() => {
        const fetchHeads = async () => {
            setIsHeadsLoading(true);
            try {
                const result = await getHeadDropdown();
                setHeads(result.headdropdown || []);
            } catch (error) {
                console.error('Failed to fetch heads:', error);
                toast.error('Failed to load salary heads');
            } finally {
                setIsHeadsLoading(false);
            }
        };
        fetchHeads();
    }, []);

    // Mutation
    const { mutate: saveIncrement, isPending: isSaving } = useAddOrUpdateEmployeeSalaryIncrement();

    // Grid Data
    const { data: gridData, isLoading: isGridLoading } = useEmployeeIncrementGrid();
    const { mutate: deleteIncrement, isPending: isDeleting } = useDeleteEmployeeIncrementMaster();

    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this record?')) {
            deleteIncrement(id);
        }
    };

    const columns = useMemo(() => getEmployeeIncrementColumns(handleDelete), []);

    const filteredData = useMemo(() => {
        console.log("🚀 ~ filteredData ~ gridData:", gridData)
        if (!gridData) return [];
        if (!searchTerm) return gridData;
        return gridData.filter((item: any) =>
            item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.hrmeD_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.hrmD_DepartmentName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [gridData, searchTerm]);

    const tableResponse = useMemo(() => ({
        success: true,
        data: filteredData,
        total: filteredData.length,
        page: 1,
        page_size: 10
    }), [filteredData]);

    const tableProps = useDataTableProps(tableResponse);

    // Form Setup
    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            selectedEmployees: [] as string[],
            incrementDate: new Date(),
            headId: undefined as string | undefined,
            type: 'Percentage',
            value: ''
        }
    });

    const onSubmit = async (data: any) => {

        console.log("🚀 ~ onSubmit ~ data:", data)
        const payload = {
            hrmeD_Id: Number(data.headId),
            hreiceD_Amount: data.type === 'Amount' ? Number(data.value) : 0,
            hreiceD_Percentage: data.type === 'Percentage' ? data.value.toString() : '0',
            employee: data.selectedEmployees.map((empId: string) => ({
                hrmE_Id: Number(empId)
            }))
        };

        saveIncrement(payload, {
            onSuccess: () => {
                reset();
                setIsFormOpen(false);
            }
        });
    };

    const handleCancel = () => {
        reset();
        setIsFormOpen(false);
    };

    return (
        <div className='min-h-screen p-4 bg-background'>
            <div className='container mx-auto space-y-6'>
                <div className='flex flex-end gap-2'>
                    <Button
                        type='button'
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Earning/Deduction
                    </Button>
                </div>
                {/* Grid Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    title={
                        <div className='flex items-center gap-4'>
                            <span>Employee Increment List</span>
                            <Badge variant='secondary' className='bg-primary/10 text-primary border-primary/20 font-bold'>
                                Total Records: {filteredData.length}
                            </Badge>
                        </div>
                    }
                    variant='outline'
                    size='lg'
                    className='shadow-xl rounded-xl '
                >
                    <div className='p-6 space-y-4'>
                        <GenericDataTable
                            {...tableProps}
                            columns={columns}
                            isLoading={isGridLoading || isDeleting}
                            showViewOptions={false}
                        />
                    </div>
                </CollapsibleSection>

                {
                    isFormOpen && (
                        <CollapsibleSection defaultOpen={true} title="Salary Increment Details" variant='outline' size='lg' className='shadow-xl rounded-xl overflow-hidden'>
                            <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-8'>
                                {/* Form content remains same */}
                                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                                    {/* Employee Selection */}
                                    <div className='space-y-3'>
                                        <Label className='text-base font-semibold'>
                                            Employee <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='selectedEmployees'
                                            control={control}
                                            rules={{ required: 'Please select at least one employee' }}
                                            render={({ field, fieldState }) => (
                                                <>
                                                    <MultiSelect
                                                        options={
                                                            employeesData?.data?.map((emp: any) => ({
                                                                label: emp.value,
                                                                value: emp.key.toString()
                                                            })) || []
                                                        }
                                                        defaultValue={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder='Search here...'
                                                        maxHeight={240}
                                                        className={`w-full border-2 focus:border-primary transition-all ${fieldState.error ? 'border-destructive' : ''}`}
                                                    />
                                                    {fieldState.error && (
                                                        <p className='text-xs font-medium text-destructive mt-1'>{fieldState.error.message}</p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>


                                    {/* Increment Date */}
                                    <div className='space-y-3'>
                                        <Label className='text-base font-semibold'>
                                            Increment Date <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='incrementDate'
                                            control={control}
                                            rules={{ required: 'Increment date is required' }}
                                            render={({ field, fieldState }) => (
                                                <>
                                                    <DatePicker
                                                        date={field.value}
                                                        setDate={field.onChange}
                                                        className={`w-full border-2 h-12 flex items-center ${fieldState.error ? 'border-destructive' : ''}`}
                                                    />
                                                    {fieldState.error && (
                                                        <p className='text-xs font-medium text-destructive mt-1'>{fieldState.error.message}</p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>

                                    {/* Type (Percentage/Amount) */}
                                    <div className='space-y-3'>
                                        <div className='pt-2'>
                                            <Label className='text-base font-semibold'>
                                                {watch('type')}: <span className='text-destructive'>*</span>
                                            </Label>
                                            <Controller
                                                name='value'
                                                control={control}
                                                rules={{
                                                    required: `${watch('type')} is required`,
                                                    validate: (val) => !isNaN(Number(val)) || 'Please enter a valid number'
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <>
                                                        <InputText
                                                            {...field}
                                                            placeholder={`Enter ${watch('type')}`}
                                                            className={`w-full focus:border-primary transition-all text-lg h-12 ${fieldState.error ? 'border-destructive' : ''}`}
                                                        />
                                                        {fieldState.error && (
                                                            <p className='text-xs font-medium text-destructive mt-1'>{fieldState.error.message}</p>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>
                                        <div className='p-3 bg-muted/30 rounded-lg'>
                                            <Controller
                                                name='type'
                                                control={control}
                                                render={({ field }) => (
                                                    <RadioGroup
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        className='flex flex-row justify-around gap-6'>
                                                        <div className='flex items-center gap-3 group cursor-pointer'>
                                                            <RadioGroupItem value='Percentage' id='type-percentage' className='w-5 h-5  text-primary focus:ring-primary' />
                                                            <Label htmlFor='type-percentage' className='cursor-pointer text-base font-medium transition-colors group-hover:text-primary'>
                                                                Percentage
                                                            </Label>
                                                        </div>
                                                        <div className='flex items-center gap-3 group cursor-pointer'>
                                                            <RadioGroupItem value='Amount' id='type-amount' className='w-5 h-5  text-primary focus:ring-primary' />
                                                            <Label htmlFor='type-amount' className='cursor-pointer text-base font-medium transition-colors group-hover:text-primary'>
                                                                Amount
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    {/* Head Selection */}
                                    <div className='space-y-3'>
                                        <Label className='text-base font-semibold'>
                                            Head <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            name='headId'
                                            control={control}
                                            rules={{ required: 'Please select a salary head' }}
                                            render={({ field, fieldState }) => (
                                                <>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className={`w-full border-2 h-12 text-base focus:ring-primary ${fieldState.error ? 'border-destructive' : ''}`}>
                                                            <SelectValue placeholder='Select Head' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {isHeadsLoading ? (
                                                                <SelectItem value='loading' disabled>Loading...</SelectItem>
                                                            ) : (
                                                                heads.map((head) => (
                                                                    <SelectItem key={head.HRMED_Id} value={head.HRMED_Id.toString()}>
                                                                        {head.HRMED_Name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && (
                                                        <p className='text-xs font-medium text-destructive mt-1'>{fieldState.error.message}</p>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </div>
                                </div>

                                 {/* Actions */}
                                <div className='flex justify-end items-center gap-3 pt-10'>
                                      <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className='w-32 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all rounded-xl'
                                       >
                                        <X className='w-4 h-4 mr-2' />
                                        CANCEL
                                    </Button>
                                    <Button
                                        type='submit'
                                        disabled={isSaving || isEmployeesLoading || isHeadsLoading}
                                        className='w-32 transition-all rounded-xl'>
                                        {isSaving ? (
                                            <span className='flex items-center gap-2'>
                                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                                                SAVING...
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-2 uppercase'>
                                                <Save className='w-4 h-4' />
                                                Save
                                            </span>
                                        )}
                                    </Button>
                                  
                                </div>
                            </form>
                        </CollapsibleSection>
                    )
                }


            </div>
        </div>
    );
}
