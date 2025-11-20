'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useEmployeeRegisterById,
    useEmployeeSalaryDetails,
    useSaveEmployeeArrear,
    useSaveEmployeeDeduction,
    useSaveEmployeeEarning
} from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeSalaryDetailItem } from '@/types/hrms/employee-register';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface PayrollTabProps {
    employeeId: number | null;
    employeeCode: string;
}

type EditablePayrollItem = EmployeeSalaryDetailItem & {
    localAmount?: number;
    localPercentage?: string;
    localMaxAmount?: number;
};

export function PayrollTab({ employeeId, employeeCode }: PayrollTabProps) {
    const { data: salaryDetails, isLoading, refetch } = useEmployeeSalaryDetails(employeeId, employeeCode);
    const { data: employeeData } = useEmployeeRegisterById(employeeId);
    const saveEarningMutation = useSaveEmployeeEarning();
    const saveDeductionMutation = useSaveEmployeeDeduction();
    const saveArrearMutation = useSaveEmployeeArrear();

    // Local state for editable items
    const [earnings, setEarnings] = useState<EditablePayrollItem[]>([]);
    const [deductions, setDeductions] = useState<EditablePayrollItem[]>([]);
    const [arrears, setArrears] = useState<EditablePayrollItem[]>([]);

    // Initialize local state when data loads
    useEffect(() => {
        if (salaryDetails && Array.isArray(salaryDetails)) {
            const earningsList: EditablePayrollItem[] = [];
            const deductionsList: EditablePayrollItem[] = [];
            const arrearsList: EditablePayrollItem[] = [];

            salaryDetails.forEach((item) => {
                const editableItem: EditablePayrollItem = {
                    ...item,
                    localAmount: item.HREED_Amount || 0,
                    localPercentage: item.HREED_Percentage || '0',
                    localMaxAmount: item.HREED_ApplicableMaxValue || 0
                };

                if (item.HRMED_EarnDedFlag === 'Earning') {
                    earningsList.push(editableItem);
                } else if (item.HRMED_EarnDedFlag === 'Deduction') {
                    deductionsList.push(editableItem);
                } else if (item.HRMED_EarnDedFlag === 'Arrear') {
                    arrearsList.push(editableItem);
                }
            });

            setEarnings(earningsList);
            setDeductions(deductionsList);
            setArrears(arrearsList);
        }
    }, [salaryDetails]);

    // Update handlers for earnings
    const updateEarning = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...earnings];
        updated[index] = { ...updated[index], [field]: value };
        setEarnings(updated);
    };

    // Update handlers for deductions
    const updateDeduction = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...deductions];
        updated[index] = { ...updated[index], [field]: value };
        setDeductions(updated);
    };

    // Update handlers for arrears
    const updateArrear = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...arrears];
        updated[index] = { ...updated[index], [field]: value };
        setArrears(updated);
    };

    // Calculate totals (only active items)
    const totalEarning = useMemo(() => {
        return earnings
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => sum + (item.localAmount || item.HREED_Amount || 0), 0);
    }, [earnings]);

    const totalDeduction = useMemo(() => {
        return deductions
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => sum + (item.localAmount || item.HREED_Amount || 0), 0);
    }, [deductions]);

    const totalArrear = useMemo(() => {
        return arrears.filter((item) => item.HREED_ActiveFlag).reduce((sum, item) => sum + (item.localAmount || item.HREED_Amount || 0), 0);
    }, [arrears]);

    const netSalary = totalEarning + totalArrear - totalDeduction;

    const handleSave = async () => {
        if (!employeeId) {
            toast.error('Employee ID is required');
            return;
        }

        try {
            // Get employee details for required fields
            const empDetails = (employeeData?.employeedetailList?.[0] || {}) as any;

            // Helper function to create base payload wrapper with employee data
            const createBasePayload = () => ({
                Type: 'string',
                TabName: 'string',
                retrunMsg: '',
                grossList: [],
                arrearList: [],
                employeedropdowndetails: [],
                configurationDetails: {
                    retrunMsg: '',
                    monthdropdown: [],
                    hrStandardList: [],
                    HRC_ECodePrefix: '',
                    HRC_PayMethodFlg: '',
                    HRC_PFAccNoPrefix: '',
                    HRC_IncrementMonth: ''
                },
                employeeEarningsDeductionsDetails: [],
                incrementDetails: [],
                ArrearDTO: [],
                DeductionDTO: [],
                EarningDTO: [],
                detectionList: [],
                earningList: [],
                gradedropdownlist: [],
                designationdropdownlist: [],
                departmentdropdownlist: [],
                groupTypedropdownlist: [],
                employeeTypedropdownlist: [],
                employeedetailList: [],
                LogInUserId: 0,
                groupTypeIdList: [],
                hrmdeS_IdList: [],
                hrmD_IdList: [],
                employeeTypeIdList: [],
                hrmgT_IdList: [],
                departmentdropdown: [],
                designationdropdown: [],
                // Required employee fields
                HRME_PHOTO: empDetails?.HRME_Photo || '',
                employeedept: [],
                dropdownvalus: [],
                employeedesig: [],
                employeegrade: [],
                HRMG_GradeName: empDetails?.HRMG_GradeName || '',
                employeeemptype: [],
                employeedropdown: [],
                HRME_EmployeeCode: employeeCode || '',
                HRMET_EmployeeType: empDetails?.HRMET_EmployeeType || '',
                HRMG_PayScaleRange: empDetails?.HRMG_PayScaleRange || '',
                HRMD_DepartmentName: empDetails?.HRMD_DepartmentName || '',
                employeeempgrouptype: [],
                HRMDES_DesignationName: empDetails?.HRMDES_DesignationName || '',
                hrmE_EmployeeFirstName: empDetails?.HRME_EmployeeFirstName || '',
                HRMGT_EmployeeGroupType: empDetails?.HRMGT_EmployeeGroupType || ''
            });

            // Prepare earnings payload (only active items) - wrapped with base payload
            const earningsPayload = earnings
                .filter((item) => item.HREED_ActiveFlag)
                .map((item) => ({
                    HREED_Id: item.HREED_Id || 0,
                    HRME_Id: employeeId,
                    HRMED_Id: item.HRMED_Id || 0,
                    HREED_Amount: item.localAmount || item.HREED_Amount || 0,
                    HREED_Percentage: item.localPercentage || item.HREED_Percentage || '0',
                    HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag || 'Amount',
                    HRMED_EarnDedFlag: 'Earning',
                    HRMED_Name: item.HRMED_Name || '',
                    HREED_ApplicableMaxValue: item.localMaxAmount || item.HREED_ApplicableMaxValue || 0,
                    HREED_MaxApplicableFlg: item.HREED_MaxApplicableFlg || false,
                    HREED_ActiveFlag: item.HREED_ActiveFlag || false,
                    MI_Id: HRMS_MI_ID,
                    roleId: 0,
                    ...createBasePayload()
                }));

            // Prepare deductions payload (only active items) - wrapped with base payload
            const deductionsPayload = deductions
                .filter((item) => item.HREED_ActiveFlag)
                .map((item) => ({
                    HREED_Id: item.HREED_Id || 0,
                    HRME_Id: employeeId,
                    HRMED_Id: item.HRMED_Id || 0,
                    HREED_Amount: item.localAmount || item.HREED_Amount || 0,
                    HREED_Percentage: item.localPercentage || item.HREED_Percentage || '0',
                    HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag || 'Amount',
                    HRMED_EarnDedFlag: 'Deduction',
                    HRMED_Name: item.HRMED_Name || '',
                    HREED_ApplicableMaxValue: item.localMaxAmount || item.HREED_ApplicableMaxValue || 0,
                    HREED_MaxApplicableFlg: item.HREED_MaxApplicableFlg || false,
                    HREED_ActiveFlag: item.HREED_ActiveFlag || false,
                    MI_Id: HRMS_MI_ID,
                    roleId: 0,
                    ...createBasePayload()
                }));

            // Prepare arrears payload (only active items) - wrapped with base payload
            const arrearsPayload = arrears
                .filter((item) => item.HREED_ActiveFlag)
                .map((item) => ({
                    HREED_Id: item.HREED_Id || 0,
                    HRME_Id: employeeId,
                    HRMED_Id: item.HRMED_Id || 0,
                    HREED_Amount: item.localAmount || item.HREED_Amount || 0,
                    HREED_Percentage: item.localPercentage || item.HREED_Percentage || '0',
                    HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag || 'Amount',
                    HRMED_EarnDedFlag: 'Arrear',
                    HRMED_Name: item.HRMED_Name || '',
                    HREED_ApplicableMaxValue: item.localMaxAmount || item.HREED_ApplicableMaxValue || 0,
                    HREED_MaxApplicableFlg: item.HREED_MaxApplicableFlg || false,
                    HREED_ActiveFlag: item.HREED_ActiveFlag || false,
                    MI_Id: HRMS_MI_ID,
                    roleId: 0,
                    ...createBasePayload()
                }));

            // Call all three endpoints
            const promises = [];

            if (earningsPayload.length > 0) {
                promises.push(saveEarningMutation.mutateAsync(earningsPayload));
            }

            if (deductionsPayload.length > 0) {
                promises.push(saveDeductionMutation.mutateAsync(deductionsPayload));
            }

            if (arrearsPayload.length > 0) {
                promises.push(saveArrearMutation.mutateAsync(arrearsPayload));
            }

            if (promises.length === 0) {
                toast.info('No active payroll items to save');
                return;
            }
            const results = await Promise.all(promises);

            // Results processed below

            // Check if any API call failed
            const failedResults = results.filter((result) => !result?.success);
            if (failedResults.length > 0) {
                const errorMessages = failedResults
                    .map((result) => result?.message || 'Unknown error')
                    .filter((msg, index, arr) => arr.indexOf(msg) === index) // Remove duplicates
                    .join(', ');
                toast.error(`Failed to save payroll details: ${errorMessages}`);
                return;
            }
            await refetch();
            toast.success('Payroll details saved successfully');
        } catch (error: any) {
            console.error('🔍 [PAYROLL SAVE] Form - Error saving payroll details:', error);
            console.error('🔍 [PAYROLL SAVE] Form - Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response,
                data: error.data
            });
            toast.error(error.message || 'Failed to save payroll details');
        }
    };

    const isSaving = saveEarningMutation.isPending || saveDeductionMutation.isPending || saveArrearMutation.isPending;

    if (isLoading) {
        return <div className='rounded-md border p-6 text-center text-muted-foreground'>Loading payroll details...</div>;
    }

    return (
        <div className='space-y-6'>
            {/* Earning Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold'>Earning Details</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Earnings</TableHead>
                                <TableHead className='w-24 text-right'>Actual %</TableHead>
                                <TableHead className='w-24 text-right'>% Applicable</TableHead>
                                <TableHead className='w-32 text-right'>Amount</TableHead>
                                <TableHead className='w-32 text-right'>Max Amount</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className='w-16'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earnings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-muted-foreground'>
                                        No earning details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                earnings.map((item, index) => (
                                    <TableRow key={item.HREED_Id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.HRMED_Name || ''}</TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateEarning(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateEarning(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                onChange={(e) =>
                                                    updateEarning(index, 'localAmount', Number.parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                onChange={(e) =>
                                                    updateEarning(index, 'localMaxAmount', Number.parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={item.HREED_ActiveFlag || false}
                                                onCheckedChange={(checked) => updateEarning(index, 'HREED_ActiveFlag', checked)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>Total Earning: ₹{totalEarning.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Deduction Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold'>Deduction Details</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead className='w-24 text-right'>Actual %</TableHead>
                                <TableHead className='w-24 text-right'>% Applicable</TableHead>
                                <TableHead className='w-32 text-right'>Amount</TableHead>
                                <TableHead className='w-32 text-right'>Max Amount</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className='w-16'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deductions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-muted-foreground'>
                                        No deduction details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deductions.map((item, index) => (
                                    <TableRow key={item.HREED_Id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.HRMED_Name || ''}</TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateDeduction(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateDeduction(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                onChange={(e) =>
                                                    updateDeduction(index, 'localAmount', Number.parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                onChange={(e) =>
                                                    updateDeduction(index, 'localMaxAmount', Number.parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={item.HREED_ActiveFlag || false}
                                                onCheckedChange={(checked) => updateDeduction(index, 'HREED_ActiveFlag', checked)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>Total Deduction: ₹{totalDeduction.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Arrear Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold'>Arrear Details</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Arrear Head</TableHead>
                                <TableHead className='w-24 text-right'>Actual %</TableHead>
                                <TableHead className='w-24 text-right'>% Applicable</TableHead>
                                <TableHead className='w-32 text-right'>Amount</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className='w-16'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {arrears.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className='text-center text-muted-foreground'>
                                        No arrear details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                arrears.map((item, index) => (
                                    <TableRow key={item.HREED_Id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.HRMED_Name || ''}</TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateArrear(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateArrear(index, 'localPercentage', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                onChange={(e) => updateArrear(index, 'localAmount', Number.parseFloat(e.target.value) || 0)}
                                            />
                                        </TableCell>
                                        <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={item.HREED_ActiveFlag || false}
                                                onCheckedChange={(checked) => updateArrear(index, 'HREED_ActiveFlag', checked)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>Total Arrear: ₹{totalArrear.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Net Salary */}
            <div className='rounded-md border-2 border-primary bg-primary/5 p-4'>
                <div className='flex justify-center'>
                    <span className='font-bold text-xl'>Net Salary: ₹{netSalary.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-4'>
                <Button variant='outline' type='button'>
                    PREVIOUS
                </Button>
                <Button type='button' className='bg-primary text-primary-foreground' onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SUBMIT'}
                </Button>
                <Button variant='outline' type='button'>
                    CLEAR
                </Button>
            </div>
        </div>
    );
}
