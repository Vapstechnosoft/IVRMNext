'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form } from '@/components/ui/form';
import {
    useCirculationData,
    useCirculationParameterDetails,
    useSaveCirculationParameter,
    useToggleCirculationParameterStatus
} from '@/hooks/library/useCirculationParameter';
import { type CirculationParameterFormValues, circulationParameterSchema } from '@/types/library/transactions/circulationParameter';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CirculationParameterForm } from './_components/CirculationParameterForm';
import { type CirculationParameterGridData, createCirculationParameterColumns } from './_components/columns';

export default function CirculationParameterPage() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [dynamicCategoryList, setDynamicCategoryList] = useState<any[]>([]);

    // Form initialization
    const form = useForm<CirculationParameterFormValues>({
        resolver: zodResolver(circulationParameterSchema),
        defaultValues: {
            bookParameterFlag: 'BP',
            issuerType: 'STUDENT',
            status: true,
            bookType: 'Issue'
        }
    });

    const bookParameterFlag = form.watch('bookParameterFlag');

    // Hooks
    const { data: apiResponse, isLoading: isDetailsLoading } = useCirculationParameterDetails({ MI_Id: 30, IVRMUL_Id: 21602 });
    const categoryMutation = useCirculationData();
    const saveMutation = useSaveCirculationParameter();
    const toggleStatusMutation = useToggleCirculationParameterStatus();

    // Fetch category list when Non-Book Parameter is selected
    useEffect(() => {
        if (bookParameterFlag === 'NBP') {
            const payload = {
                pk_id: 0,
                lmC_CategoryName: "BP",
                reflag: "Y",
                issue: 5,
                items: 10,
                renewal: 2,
                activeflg: true,
                flgtype: "Non-Book",
                type: "Library",
                alldata: [],
                fillemp: []
            };
            categoryMutation.mutate(payload, {
                onSuccess: (res: any) => {
                    if (res?.categorylist) {
                        setDynamicCategoryList(res.categorylist as any[]);
                    }
                }
            });
        }
    }, [bookParameterFlag]);

    // Extracting data from API response
    const details = apiResponse?.data || {};
    const gridData: CirculationParameterGridData[] = details.getdetails || [];

    // Fallback to dynamicCategoryList if NBP, otherwise use what comes from details
    const categoryList = bookParameterFlag === 'NBP' ? dynamicCategoryList : (details.categorylist || []);
    const bookTypeList = details.booktypelist || [];
    const classList = details.classlist || [];
    const departmentList = details.departmentlist || [];
    const employeeGroupList = details.group_list || [];
    const guestList = details.guest_list || [];

    const columns = useMemo(
        () =>
            createCirculationParameterColumns({
                onEdit: (data) => {
                    setEditingId(data.lmC_Id);
                    form.reset({
                        id: data.lmC_Id,
                        bookParameterFlag: data.lmB_BookTypeflag || 'BP',
                        issuerType: data.schclgflag || 'STUDENT',
                        maxIssueItems: data.lmC_MaxIssueItems,
                        maxIssueDays: data.lmC_MaxIssueDays,
                        maxRenewals: data.lmC_MaxRenewals,
                        status: data.lmC_ActiveFlag,
                        bookType: data.lmB_BookTypeflag === 'BP' ? data.lmC_CategoryName : undefined,
                        categoryId: data.lmB_BookTypeflag === 'NBP' ? data.lmC_Id : undefined,
                        categoryName: data.lmB_BookTypeflag === 'NBP' ? data.lmC_CategoryName : undefined
                    });
                },
                onToggleStatus: (data) => {
                    toggleStatusMutation.mutate({ LMC_Id: data.lmC_Id });
                }
            }),
        [form, toggleStatusMutation]
    );

    const onSubmit = async (values: CirculationParameterFormValues) => {
        const payload = {
            LMC_Id: editingId || 0,
            LMB_BookTypeflag: values.bookParameterFlag,
            schclgflag: values.issuerType,
            LMC_CategoryName: values.bookParameterFlag === 'BP' ? values.bookType : values.categoryName,
            asmcl_id: values.classId || 0,
            HRMGT_Id: values.employeeGroupId || 0,
            HRMD_Id: values.departmentId || 0,
            Guest_Id: values.guestId || 0,
            Max_Issue_Items: values.maxIssueItems || 0,
            Max_Issue_Days: values.maxIssueDays || 0,
            Max_No_Renewals: values.maxRenewals || 0,
            MI_Id: 30
        };

        saveMutation.mutate(payload, {
            onSuccess: () => {
                form.reset({
                    bookParameterFlag: values.bookParameterFlag,
                    issuerType: values.issuerType,
                    status: true,
                    bookType: 'Issue'
                });
                setEditingId(null);
            }
        });
    };

    const handleCancel = () => {
        form.reset({
            bookParameterFlag: 'BP',
            issuerType: 'STUDENT',
            status: true,
            bookType: 'Issue'
        });
        setEditingId(null);
    };

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <FormProvider {...form}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                            <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                                CIRCULATION PARAMETER
                            </div>
                            <div className='p-6'>
                                <CirculationParameterForm
                                    categoryList={categoryList}
                                    bookTypeList={bookTypeList}
                                    classList={classList}
                                    departmentList={departmentList}
                                    employeeGroupList={employeeGroupList}
                                    guestList={guestList}
                                />
                                <div className='mt-8 flex justify-center gap-4'>
                                    <Button type='submit' disabled={saveMutation.isPending} className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#4251b1] hover:bg-[#35418e] text-white shadow-sm rounded-sm'>
                                        {saveMutation.isPending ? (
                                            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                                        ) : (
                                            <Save className='mr-1.5 h-3.5 w-3.5' />
                                        )}
                                        {editingId ? 'UPDATE' : 'SAVE'}
                                    </Button>
                                    <Button type='button' onClick={handleCancel} className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#ff5a30] hover:bg-[#e64d26] text-white shadow-sm rounded-sm'>
                                        <XCircle className='mr-1.5 h-3.5 w-3.5' />
                                        CANCEL
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </FormProvider>

            <div className='bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400 overflow-hidden'>
                <div className='bg-[#4251b1] text-white px-4 py-2 font-semibold text-sm'>
                    CIRCULATION PARAMETER LIST
                </div>
                <div className='p-6'>
                    <GenericDataTable columns={columns as any} data={gridData} isLoading={isDetailsLoading} />
                </div>
            </div>
        </div>
    );
}
