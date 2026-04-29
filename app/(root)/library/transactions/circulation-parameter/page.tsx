'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Form } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useCirculationParameterDetails,
    useSaveCirculationParameter,
    useToggleCirculationParameterStatus
} from '@/hooks/library/useCirculationParameter';
import { type CirculationParameterFormValues, circulationParameterSchema } from '@/types/library/transactions/circulationParameter';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CirculationParameterForm } from './_components/CirculationParameterForm';
import { type CirculationParameterGridData, createCirculationParameterColumns } from './_components/columns';

export default function CirculationParameterPage() {
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form initialization
    const form = useForm<CirculationParameterFormValues>({
        resolver: zodResolver(circulationParameterSchema),
        defaultValues: {
            bookParameterFlag: 'BP',
            issuerType: 'STUDENT',
            status: true
        }
    });

    const bookParameterFlag = form.watch('bookParameterFlag');

    // Hooks
    const { data: apiResponse, isLoading: isDetailsLoading } = useCirculationParameterDetails(bookParameterFlag);
    const saveMutation = useSaveCirculationParameter();
    const toggleStatusMutation = useToggleCirculationParameterStatus();

    // Extracting data from API response
    const details = apiResponse?.data || {};
    const gridData: CirculationParameterGridData[] = details.getdetails || [];
    const categoryList = details.categorylist || [];
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
                        // Mapping logic based on how backend returns and form expects
                        // This might need refinement based on exact field names in data
                        maxIssueItems: data.lmC_MaxIssueItems,
                        maxIssueDays: data.lmC_MaxIssueDays,
                        maxRenewals: data.lmC_MaxRenewals,
                        status: data.lmC_ActiveFlag
                        // Add specific logic for categoryId/bookType/etc if available in grid row
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
            LMC_CategoryName: values.bookParameterFlag === 'BP' ? values.categoryName : values.bookType,
            asmcl_id: values.classId || 0,
            HRMGT_Id: values.employeeGroupId || 0,
            HRMD_Id: values.departmentId || 0,
            Guest_Id: values.guestId || 0,
            Max_Issue_Items: values.maxIssueItems || 0,
            Max_Issue_Days: values.maxIssueDays || 0,
            Max_No_Renewals: values.maxRenewals || 0
        };

        saveMutation.mutate(payload, {
            onSuccess: () => {
                form.reset({
                    bookParameterFlag: values.bookParameterFlag,
                    issuerType: values.issuerType,
                    status: true
                });
                setEditingId(null);
            }
        });
    };

    const handleCancel = () => {
        form.reset({
            bookParameterFlag: 'BP',
            issuerType: 'STUDENT',
            status: true
        });
        setEditingId(null);
    };

    return (
        <div className='container mx-auto space-y-6 py-6'>
            <FormProvider {...form}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CollapsibleSection title='CIRCULATION PARAMETER'>
                            <CirculationParameterForm
                                categoryList={categoryList}
                                bookTypeList={bookTypeList}
                                classList={classList}
                                departmentList={departmentList}
                                employeeGroupList={employeeGroupList}
                                guestList={guestList}
                            />
                            <div className='mt-8 flex justify-center gap-4'>
                                <Button type='submit' disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <Save className='mr-2 h-4 w-4' />
                                    )}
                                    {editingId ? 'Update' : 'Save'}
                                </Button>
                                <Button type='button' variant='outline' onClick={handleCancel}>
                                    <XCircle className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </CollapsibleSection>
                    </form>
                </Form>
            </FormProvider>

            <CollapsibleSection title='CIRCULATION PARAMETER LIST'>
                <GenericDataTable columns={columns as any} data={gridData} isLoading={isDetailsLoading} />
            </CollapsibleSection>
        </div>
    );
}
