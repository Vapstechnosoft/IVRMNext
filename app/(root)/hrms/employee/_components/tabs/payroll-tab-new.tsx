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
    useSaveEmployeeEarning,
    useCalculateSalary
} from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeSalaryDetailItem, SaveEarningDetailsRequest, SaveDeductionDetailsRequest, SaveArrearDetailsRequest } from '@/types/hrms/employee-register';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface PayrollTabProps {
    employeeId: number | null;
    employeeCode: string;
    grossList?: any[];
    earningList?: any[];
    detectionList?: any[];
    arrearList?: any[];
}

type EditablePayrollItem = EmployeeSalaryDetailItem & {
    localAmount?: number;
    localPercentage?: string; // Actual %
    localApplicablePercentage?: string; // % Applicable
    localMaxAmount?: number;
};

export function PayrollTab({ employeeId, employeeCode, grossList = [], earningList = [], detectionList = [], arrearList = [] }: PayrollTabProps) {
    const { data: salaryDetails, isLoading, refetch } = useEmployeeSalaryDetails(employeeId, employeeCode);
    const { data: employeeData } = useEmployeeRegisterById(employeeId);
    const saveEarningMutation = useSaveEmployeeEarning();
    const saveDeductionMutation = useSaveEmployeeDeduction();
    const saveArrearMutation = useSaveEmployeeArrear();
    const calculateSalaryMutation = useCalculateSalary();

    // Local state for editable items
    const [earnings, setEarnings] = useState<EditablePayrollItem[]>([]);
    const [deductions, setDeductions] = useState<EditablePayrollItem[]>([]);
    const [arrears, setArrears] = useState<EditablePayrollItem[]>([]);

    // Helper function to get name from lists based on HRMED_Id
    const getNameFromLists = (hrmdId: number, earnDedFlag: string): string => {
        if (earnDedFlag === 'Earning') {
            const found = earningList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_Name || '';
        } else if (earnDedFlag === 'Deduction') {
            const found = detectionList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_Name || '';
        } else if (earnDedFlag === 'Arrear') {
            const found = arrearList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_Name || '';
        } else if (earnDedFlag === 'Gross') {
            const found = grossList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_Name || '';
        }
        return '';
    };

    // Helper function to get AmountPercentFlag from lists based on HRMED_Id
    const getAmountPercentFlagFromLists = (hrmdId: number, earnDedFlag: string): string => {
        if (earnDedFlag === 'Earning') {
            const found = earningList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_AmountPercentFlag || 'Amount';
        } else if (earnDedFlag === 'Deduction') {
            const found = detectionList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_AmountPercentFlag || 'Amount';
        } else if (earnDedFlag === 'Arrear') {
            const found = arrearList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_AmountPercentFlag || 'Amount';
        } else if (earnDedFlag === 'Gross') {
            const found = grossList.find((item: any) => item.HRMED_Id === hrmdId);
            return found?.HRMED_AmountPercentFlag || 'Amount';
        }
        return 'Amount';
    };

    // Initialize local state when data loads
    useEffect(() => {
        if (salaryDetails && Array.isArray(salaryDetails)) {
            const earningsList: EditablePayrollItem[] = [];
            const deductionsList: EditablePayrollItem[] = [];
            const arrearsList: EditablePayrollItem[] = [];

            salaryDetails.forEach((item) => {
                // Get name from lists if not present in salary details
                const name = item.HRMED_Name || getNameFromLists(item.HRMED_Id, item.HRMED_EarnDedFlag);
                // Get AmountPercentFlag from lists if not present in salary details
                // Handle empty string, null, undefined, and whitespace
                const rawFlag = item.HRMED_AmountPercentFlag;
                const amountPercentFlag = (rawFlag && rawFlag.toString().trim()) 
                    ? rawFlag.toString().trim() 
                    : getAmountPercentFlagFromLists(item.HRMED_Id, item.HRMED_EarnDedFlag);
                
                const editableItem: EditablePayrollItem = {
                    ...item,
                    HRMED_Name: name, // Ensure name is set
                    HRMED_AmountPercentFlag: amountPercentFlag, // Ensure AmountPercentFlag is set
                    localAmount: item.HREED_Amount || 0,
                    localPercentage: item.HREED_Percentage || '0', // Actual %
                    localApplicablePercentage: item.HREED_ApplicablePercentage || item.HREED_Percentage || '0', // % Applicable
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
    }, [salaryDetails, earningList, detectionList, arrearList]);

    // Helper function to calculate totals with specific arrays (for immediate calculation after checkbox toggle)
    const calculateTotalsWithArrays = async (earningsArray: EditablePayrollItem[], deductionsArray: EditablePayrollItem[], arrearsArray: EditablePayrollItem[]) => {
        // Calculate the base amount (gross salary) - sum of all active earnings
        const baseAmount = earningsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);

        // If no base amount, use fallback calculation
        if (baseAmount === 0 && earningsArray.length === 0 && deductionsArray.length === 0 && arrearsArray.length === 0) {
            setCalculatedTotals({
                totalEarning: 0,
                totalDeduction: 0,
                totalArrear: 0,
                netSalary: 0
            });
            return;
        }

        try {
            const response = await calculateSalaryMutation.mutateAsync({
                MI_Id: HRMS_MI_ID,
                HRMEID_Amount: baseAmount
            });

            if (response.success && response.data) {
                setCalculatedTotals({
                    totalEarning: response.data.totalEarning ?? 0,
                    totalDeduction: response.data.totalDeduction ?? 0,
                    totalArrear: response.data.totalArrear ?? 0,
                    netSalary: response.data.netSalary ?? 0
                });
                return;
            }
        } catch (error: any) {
            // Silently fallback to client-side calculation if API fails (404, etc.)
            console.warn('Salary calculation API failed, using client-side calculation:', error?.message || 'Unknown error');
        }

        // Fallback to client-side calculation if API fails or returns no data
        const totalEarning = earningsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);

        const totalDeduction = deductionsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);

        const totalArrear = arrearsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);

        setCalculatedTotals({
            totalEarning,
            totalDeduction,
            totalArrear,
            netSalary: totalEarning + totalArrear - totalDeduction
        });
    };

    // Update handlers for earnings
    const updateEarning = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...earnings];
        updated[index] = { ...updated[index], [field]: value };
        setEarnings(updated);
        
        // If checkbox (HREED_ActiveFlag) is toggled, recalculate totals immediately with updated array
        if (field === 'HREED_ActiveFlag') {
            calculateTotalsWithArrays(updated, deductions, arrears);
        }
    };

    // Update handlers for deductions
    const updateDeduction = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...deductions];
        updated[index] = { ...updated[index], [field]: value };
        setDeductions(updated);
        
        // If checkbox (HREED_ActiveFlag) is toggled, recalculate totals immediately with updated array
        if (field === 'HREED_ActiveFlag') {
            calculateTotalsWithArrays(earnings, updated, arrears);
        }
    };

    // Update handlers for arrears
    const updateArrear = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...arrears];
        updated[index] = { ...updated[index], [field]: value };
        setArrears(updated);
        
        // If checkbox (HREED_ActiveFlag) is toggled, recalculate totals immediately with updated array
        if (field === 'HREED_ActiveFlag') {
            calculateTotalsWithArrays(earnings, deductions, updated);
        }
    };

    // State for calculated totals from API
    const [calculatedTotals, setCalculatedTotals] = useState<{
        totalEarning: number;
        totalDeduction: number;
        totalArrear: number;
        netSalary: number;
    }>({
        totalEarning: 0,
        totalDeduction: 0,
        totalArrear: 0,
        netSalary: 0
    });

    // Calculate totals using API (only active items)
    // Use max amount if > 0, otherwise use amount for the calculation request
    const calculateTotals = async () => {
        calculateTotalsWithArrays(earnings, deductions, arrears);
    };

    // Calculate totals when earnings, deductions, or arrears change (but not on checkbox toggle - handled separately)
    useEffect(() => {
        // Only calculate on initial load or when arrays change (not on checkbox toggle)
        // Checkbox toggles are handled in updateEarning/updateDeduction/updateArrear functions
        if (earnings.length > 0 || deductions.length > 0 || arrears.length > 0) {
            // Debounce to avoid multiple calls
            const timeoutId = setTimeout(() => {
                calculateTotals();
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [earnings.length, deductions.length, arrears.length]);

    // Use calculated totals from API, fallback to 0 if not calculated yet
    const totalEarning = calculatedTotals.totalEarning;
    const totalDeduction = calculatedTotals.totalDeduction;
    const totalArrear = calculatedTotals.totalArrear;
    const netSalary = calculatedTotals.netSalary;

    const handleSave = async () => {
        if (!employeeId) {
            toast.error('Employee ID is required');
            return;
        }

        try {
            // Prepare earnings payload (only active items) - exact structure as provided
            const activeEarnings = earnings.filter((item) => item.HREED_ActiveFlag);
            const earningsPayload: SaveEarningDetailsRequest = {
                Employee: {
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: employeeId
                },
                EmployeeEarningDeductionArrear: activeEarnings.map((item) => {
                    // Ensure percentage is "0" if zero or empty, not empty string
                    const percentage = item.localPercentage || item.HREED_Percentage || '0';
                    const finalPercentage = percentage === '' || percentage === null || percentage === undefined ? '0' : String(percentage);
                    
                    return {
                        HREED_Id: Number(item.HREED_Id || 0),
                        HRMED_Id: Number(item.HRMED_Id || 0),
                        HREED_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
                        HREED_Percentage: finalPercentage,
                        HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag)
                    };
                })
            };

            // Prepare deductions payload (only active items) - exact structure as provided
            const activeDeductions = deductions.filter((item) => item.HREED_ActiveFlag);
            const deductionsPayload: SaveDeductionDetailsRequest = {
                Employee: {
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: employeeId
                },
                EmployeeEarningDeductionArrear: activeDeductions.map((item) => {
                    // Ensure percentage is "0" if zero or empty, not empty string
                    const percentage = item.localPercentage || item.HREED_Percentage || '0';
                    const finalPercentage = percentage === '' || percentage === null || percentage === undefined ? '0' : String(percentage);
                    
                    return {
                        HREED_Id: Number(item.HREED_Id || 0),
                        HRMED_Id: Number(item.HRMED_Id || 0),
                        HREED_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
                        HREED_Percentage: finalPercentage,
                        HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag)
                    };
                })
            };

            // Prepare arrears payload (only active items) - exact structure as provided
            const activeArrears = arrears.filter((item) => item.HREED_ActiveFlag);
            const arrearsPayload: SaveArrearDetailsRequest = {
                Employee: {
                    MI_Id: HRMS_MI_ID,
                    HRME_Id: employeeId
                },
                EmployeeEarningDeductionArrear: activeArrears.map((item) => {
                    // Ensure percentage is "0" if zero or empty, not empty string
                    const percentage = item.localPercentage || item.HREED_Percentage || '0';
                    const finalPercentage = percentage === '' || percentage === null || percentage === undefined ? '0' : String(percentage);
                    
                    return {
                        HREED_Id: Number(item.HREED_Id || 0),
                        HRMED_Id: Number(item.HRMED_Id || 0),
                        HREED_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
                        HREED_Percentage: finalPercentage,
                        HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag)
                    };
                })
            };

            // Call all three endpoints
            const promises = [];

            if (earningsPayload.EmployeeEarningDeductionArrear.length > 0) {
                promises.push(saveEarningMutation.mutateAsync(earningsPayload));
            }

            if (deductionsPayload.EmployeeEarningDeductionArrear.length > 0) {
                promises.push(saveDeductionMutation.mutateAsync(deductionsPayload));
            }

            if (arrearsPayload.EmployeeEarningDeductionArrear.length > 0) {
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
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>EARNING DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Earnings</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>Actual %</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 text-center whitespace-nowrap'>Amount</TableHead>
                                <TableHead className='w-32 text-center whitespace-nowrap'>Max&nbsp;Amount</TableHead>
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
                                earnings.map((item, index) => {
                                    // Normalize the AmountPercentFlag value - handle null, undefined, empty string, and case variations
                                    const rawFlag = item.HRMED_AmountPercentFlag;
                                    const normalizedFlag = rawFlag 
                                        ? String(rawFlag).trim().toLowerCase() 
                                        : 'amount';
                                    const isAmountType = normalizedFlag === 'amount';
                                    const isPercentageType = normalizedFlag === 'percentage';
                                    
                                    return (
                                        <TableRow key={item.HREED_Id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.HRMED_Name || ''}</TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localPercentage || item.HREED_Percentage || '0'}
                                                    onChange={(e) => updateEarning(index, 'localPercentage', e.target.value)}
                                                    disabled={isAmountType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'}
                                                    onChange={(e) => updateEarning(index, 'localApplicablePercentage', e.target.value)}
                                                    disabled={isAmountType}
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
                                                    disabled={isPercentageType}
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
                                    );
                                })
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
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>DEDUCTION DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>Actual %</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 text-center whitespace-nowrap'>Amount</TableHead>
                                <TableHead className='w-32 text-center whitespace-nowrap'>Max&nbsp;Amount</TableHead>
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
                                deductions.map((item, index) => {
                                    // Normalize the AmountPercentFlag value - handle null, undefined, empty string, and case variations
                                    const rawFlag = item.HRMED_AmountPercentFlag;
                                    const normalizedFlag = rawFlag 
                                        ? String(rawFlag).trim().toLowerCase() 
                                        : 'amount';
                                    const isAmountType = normalizedFlag === 'amount';
                                    const isPercentageType = normalizedFlag === 'percentage';
                                    
                                    return (
                                        <TableRow key={item.HREED_Id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.HRMED_Name || ''}</TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localPercentage || item.HREED_Percentage || '0'}
                                                    onChange={(e) => updateDeduction(index, 'localPercentage', e.target.value)}
                                                    disabled={isAmountType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'}
                                                    onChange={(e) => updateDeduction(index, 'localApplicablePercentage', e.target.value)}
                                                    disabled={isAmountType}
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
                                                    disabled={isPercentageType}
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
                                    );
                                })
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
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>ARREAR DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Arrear Head</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>Actual %</TableHead>
                                <TableHead className='w-24 text-right whitespace-nowrap'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 text-center whitespace-nowrap'>Amount</TableHead>
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
                                                value={item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'}
                                                onChange={(e) => updateArrear(index, 'localApplicablePercentage', e.target.value)}
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
            <div className='rounded-md border-2 border-muted bg-muted/50 p-4'>
                <div className='flex justify-center'>
                    <span className='font-bold text-xl'>Net Salary: ₹{netSalary.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-3 pt-4'>
                <Button variant='outline' type='button'>
                    PREVIOUS
                </Button>
                <Button type='button' variant='default' onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SUBMIT'}
                </Button>
                <Button variant='outline' type='button'>
                    CLEAR
                </Button>
            </div>
        </div>
    );
}
