'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import {
    useEmployeeById,
    useEmployeeEarningsDeductions,
    useGetEmployeeSalaryDetailsByHead,
    useSaveEmployeeSalaryDetails,
    useUpdateEmployeeSalaryDetailsByHead
} from '@/hooks/hrms/useEmployeeRegister';
import type { EmployeeSalaryDetailItem } from '@/types/hrms/employee-register';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
interface PayrollTabProps {
    employeeId: number | null;
    employeeCode: string;
    // grossList, earningList, detectionList, arrearList removed as per refactor to use API only
    MI_Id?: number;
    onSuccess?: () => void;
}
type EditablePayrollItem = EmployeeSalaryDetailItem & {
    localAmount?: number;
    localPercentage?: string; // Actual %
    localApplicablePercentage?: string; // % Applicable
    localMaxAmount?: number;
};
const DEFAULT_EMPTY_ARRAY: any[] = [];

export function PayrollTab({ employeeId, employeeCode, MI_Id: propMI_Id, onSuccess }: PayrollTabProps) {
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const { data: response, isLoading: isLoadingEmployee, refetch } = useEmployeeById(employeeId);
    const { data: salaryDetailsData, isLoading: isLoadingED } = useEmployeeEarningsDeductions(employeeId);
    const employeemiId = response?.data?.employee?.[0]?.mI_Id;

    // Prioritize the specific API response as requested by user
    const salaryDetails = Array.isArray(salaryDetailsData) ? salaryDetailsData : (salaryDetailsData as any)?.data || DEFAULT_EMPTY_ARRAY;
    console.log('🔍 [PayrollTab] Loaded salaryDetails from API:', salaryDetails);

    const queryClient = useQueryClient();
    const MI_Id = propMI_Id || employeemiId || employeemiId || HRMS_MI_ID;
    const isLoading = isLoadingEmployee || isLoadingED;

    const updateSalaryByHeadMutation = useUpdateEmployeeSalaryDetailsByHead({ suppressSuccessToast: true });
    // Local state for editable items
    const [earnings, setEarnings] = useState<EditablePayrollItem[]>([]);
    const [deductions, setDeductions] = useState<EditablePayrollItem[]>([]);
    const [arrears, setArrears] = useState<EditablePayrollItem[]>([]);
    const [grossDetails, setGrossDetails] = useState<EditablePayrollItem | null>(null);

    const earningsRef = useRef(earnings);
    earningsRef.current = earnings;
    const deductionsRef = useRef(deductions);
    deductionsRef.current = deductions;
    const arrearsRef = useRef(arrears);
    arrearsRef.current = arrears;
    const grossRef = useRef(grossDetails);
    grossRef.current = grossDetails;

    const dirtyRowsRef = useRef<{
        earnings: Set<number>;
        deductions: Set<number>;
        arrears: Set<number>;
        gross: boolean;
    }>({
        earnings: new Set(),
        deductions: new Set(),
        arrears: new Set(),
        gross: false
    });

    const _getEmployeeSalaryDetailsByHeadMutation = useGetEmployeeSalaryDetailsByHead();

    // Helper to extract effective percentage for an item
    const getHeadPercentage = (item: EditablePayrollItem): number => {
        // If localApplicablePercentage was modified and > 0
        const localApp = Number.parseFloat(String(item.localApplicablePercentage ?? ''));
        if (!Number.isNaN(localApp) && localApp > 0) return localApp;

        // If localPercentage was modified and > 0
        const localPerc = Number.parseFloat(String(item.localPercentage ?? ''));
        if (!Number.isNaN(localPerc) && localPerc > 0) return localPerc;

        // Employee saved percentages
        const hreedApp = Number.parseFloat(String(item.HREED_ApplicablePercentage ?? (item as any).hreeD_ApplicablePercentage ?? ''));
        if (!Number.isNaN(hreedApp) && hreedApp > 0) return hreedApp;

        const hreedPerc = Number.parseFloat(String(item.HREED_Percentage ?? (item as any).hreeD_Percentage ?? ''));
        if (!Number.isNaN(hreedPerc) && hreedPerc > 0) return hreedPerc;

        // Master percentage from HRMED master head
        const masterPerc = Number.parseFloat(
            String(
                (item as any).HRMED_AmountPercent ??
                    (item as any).hrmeD_AmountPercent ??
                    (item as any).hrmed_amountpercent ??
                    (item as any).HRMED_Percentage ??
                    (item as any).hrmeD_Percentage ??
                    (item as any).AmountPercent ??
                    (item as any).amountPercent ??
                    ''
            )
        );
        if (!Number.isNaN(masterPerc) && masterPerc > 0) return masterPerc;

        return 0;
    };

    // Helper to check if item is percentage based
    const isPercentageHead = (item: EditablePayrollItem, perc: number): boolean => {
        const rawFlag =
            item.HRMED_AmountPercentFlag ??
            (item as any).hrmeD_AmountPercentFlag ??
            (item as any).hrmed_amountpercentflag ??
            (item as any).AmountPercentFlag;
        const flagStr = String(rawFlag || '')
            .trim()
            .toLowerCase();
        return flagStr === 'percentage' || perc > 0;
    };

    // Recalculate all percentage-based items from Gross amount
    const calculateHeadsFromGross = (
        grossAmount: number,
        currentEarnings = earningsRef.current,
        currentDeductions = deductionsRef.current,
        currentArrears = arrearsRef.current
    ) => {
        const updateItem = (item: EditablePayrollItem) => {
            const perc = getHeadPercentage(item);
            if (isPercentageHead(item, perc) && perc > 0) {
                const calculatedAmount = Number(((grossAmount * perc) / 100).toFixed(2));
                const percStr = String(perc);
                return {
                    ...item,
                    HRMED_AmountPercentFlag: 'Percentage',
                    localPercentage: percStr,
                    localApplicablePercentage: percStr,
                    HREED_Percentage: percStr,
                    HREED_ApplicablePercentage: percStr,
                    localAmount: calculatedAmount,
                    HREED_Amount: calculatedAmount,
                    HREED_ActiveFlag: true
                };
            }
            return item;
        };

        const updateDeductionItem = (item: EditablePayrollItem) => {
            const perc = getHeadPercentage(item);
            if (isPercentageHead(item, perc) && perc > 0) {
                const percStr = String(perc);
                return {
                    ...item,
                    HRMED_AmountPercentFlag: 'Percentage',
                    localPercentage: percStr,
                    localApplicablePercentage: percStr,
                    HREED_Percentage: percStr,
                    HREED_ApplicablePercentage: percStr,
                    localAmount: 0,
                    HREED_Amount: 0,
                    HREED_ActiveFlag: true
                };
            }
            return item;
        };

        const newEarnings = currentEarnings.map(updateItem);
        const newDeductions = currentDeductions.map(updateDeductionItem);
        const newArrears = currentArrears.map(updateItem);

        return { newEarnings, newDeductions, newArrears };
    };

    // Initialize local state when data loads
    useEffect(() => {
        // Show only items returned by the API as requested by user
        const initializeList = (flag: string) => {
            return (salaryDetails || [])
                .filter((sd: any) => (sd.HRMED_EarnDedFlag || sd.hrmeD_EarnDedFlag) === flag)
                .map((existingItem: any) => {
                    const hrmedId = existingItem.HRMED_Id || existingItem.hrmeD_Id;
                    const amount = existingItem.HREED_Amount ?? existingItem.hreeD_Amount ?? 0;

                    // Fallback to master percentage if saved percentage is empty or '0'
                    const rawPerc = existingItem.HREED_Percentage ?? existingItem.hreeD_Percentage;
                    const masterPerc =
                        existingItem.HRMED_AmountPercent ??
                        existingItem.hrmeD_AmountPercent ??
                        existingItem.hrmed_amountpercent ??
                        existingItem.HRMED_Percentage ??
                        existingItem.hrmeD_Percentage ??
                        existingItem.AmountPercent ??
                        existingItem.amountPercent;

                    const percentage =
                        rawPerc !== undefined &&
                        rawPerc !== null &&
                        String(rawPerc) !== '0' &&
                        String(rawPerc) !== '0.00' &&
                        String(rawPerc) !== ''
                            ? String(rawPerc)
                            : masterPerc !== undefined && masterPerc !== null && String(masterPerc) !== ''
                              ? String(masterPerc)
                              : '0';

                    const rawAppPerc = existingItem.HREED_ApplicablePercentage ?? existingItem.hreeD_ApplicablePercentage;
                    const appPercentage =
                        rawAppPerc !== undefined &&
                        rawAppPerc !== null &&
                        String(rawAppPerc) !== '0' &&
                        String(rawAppPerc) !== '0.00' &&
                        String(rawAppPerc) !== ''
                            ? String(rawAppPerc)
                            : percentage;

                    const maxVal = existingItem.HREED_ApplicableMaxValue ?? existingItem.hreeD_ApplicableMaxValue ?? 0;
                    const rawFlag =
                        existingItem.HRMED_AmountPercentFlag ??
                        existingItem.hrmeD_AmountPercentFlag ??
                        existingItem.hrmed_amountpercentflag ??
                        existingItem.AmountPercentFlag;
                    const amountPercentFlag = rawFlag ? String(rawFlag).trim() : Number(percentage) > 0 ? 'Percentage' : 'Amount';
                    const active = Boolean(existingItem.HREED_ActiveFlag ?? existingItem.hreeD_ActiveFlag ?? Number(percentage) > 0);
                    const isDedPerc = flag === 'Deduction' && (amountPercentFlag.toLowerCase() === 'percentage' || Number(percentage) > 0);
                    const effectiveAmount = isDedPerc ? 0 : amount;

                    return {
                        ...existingItem,
                        HREED_Id: existingItem.HREED_Id ?? existingItem.hreeD_Id ?? 0,
                        HRMED_Id: hrmedId,
                        HRMED_Name: existingItem.HRMED_Name ?? existingItem.hrmeD_Name ?? '',
                        HRMED_EarnDedFlag: flag,
                        HRMED_AmountPercentFlag: amountPercentFlag,
                        HREED_ActiveFlag: active,
                        HREED_Amount: effectiveAmount,
                        HREED_Percentage: percentage,
                        HREED_ApplicablePercentage: appPercentage,
                        HREED_ApplicableMaxValue: maxVal,
                        // Local state for editing
                        localAmount: effectiveAmount,
                        localPercentage: percentage,
                        localApplicablePercentage: appPercentage,
                        localMaxAmount: maxVal,
                        HREED_MaxApplicableFlg: Boolean(existingItem.HREED_MaxApplicableFlg ?? existingItem.hreeD_MaxApplicableFlg ?? true)
                    } as EditablePayrollItem;
                });
        };

        let earningsList = initializeList('Earning');
        let deductionsList = initializeList('Deduction');
        let arrearsList = initializeList('Arrear');

        // Handle Gross separately
        const existingGross = (salaryDetails || []).find((sd: any) => (sd.HRMED_EarnDedFlag || sd.hrmeD_EarnDedFlag) === 'Gross');
        const grossAmount = existingGross ? (existingGross.HREED_Amount ?? existingGross.hreeD_Amount ?? 0) : 0;

        if (existingGross) {
            const hrmedId = existingGross.HRMED_Id || existingGross.hrmeD_Id;
            setGrossDetails({
                ...existingGross,
                HREED_Id: existingGross.HREED_Id ?? existingGross.hreeD_Id ?? 0,
                HRMED_Id: hrmedId,
                HRMED_Name: existingGross.HRMED_Name ?? existingGross.hrmeD_Name ?? 'GROSS',
                HRMED_EarnDedFlag: 'Gross',
                HRMED_AmountPercentFlag: existingGross.HRMED_AmountPercentFlag ?? existingGross.hrmeD_AmountPercentFlag ?? 'Amount',
                HREED_ActiveFlag: Boolean(existingGross.HREED_ActiveFlag ?? existingGross.hreeD_ActiveFlag ?? true),
                HREED_Amount: grossAmount,
                HREED_Percentage: existingGross.HREED_Percentage ?? existingGross.hreeD_Percentage ?? '0',
                HREED_ApplicablePercentage: existingGross.HREED_ApplicablePercentage ?? existingGross.hreeD_ApplicablePercentage ?? '0',
                HREED_ApplicableMaxValue: existingGross.HREED_ApplicableMaxValue ?? existingGross.hreeD_ApplicableMaxValue ?? 0,
                localAmount: grossAmount,
                localPercentage: existingGross.HREED_Percentage ?? existingGross.hreeD_Percentage ?? '0',
                localApplicablePercentage: existingGross.HREED_ApplicablePercentage ?? existingGross.hreeD_ApplicablePercentage ?? '0',
                localMaxAmount: existingGross.HREED_ApplicableMaxValue ?? existingGross.hreeD_ApplicableMaxValue ?? 0,
                HREED_MaxApplicableFlg: Boolean(existingGross.HREED_MaxApplicableFlg ?? existingGross.hreeD_MaxApplicableFlg ?? true)
            } as EditablePayrollItem);
        } else {
            setGrossDetails({
                HREED_Id: 0,
                HRMED_Id: 0,
                HRMED_Name: 'GROSS',
                HRMED_EarnDedFlag: 'Gross',
                HRMED_AmountPercentFlag: 'Amount',
                HREED_ActiveFlag: true,
                HREED_Amount: 0,
                HREED_Percentage: '0',
                HREED_ApplicablePercentage: '0',
                HREED_ApplicableMaxValue: 0,
                localAmount: 0,
                localPercentage: '0',
                localApplicablePercentage: '0',
                localMaxAmount: 0,
                HREED_MaxApplicableFlg: true
            } as EditablePayrollItem);
        }

        // If gross amount is present, automatically calculate percentage-based heads that have 0 amount
        if (grossAmount > 0) {
            const calculated = calculateHeadsFromGross(grossAmount, earningsList, deductionsList, arrearsList);
            earningsList = calculated.newEarnings;
            deductionsList = calculated.newDeductions;
            arrearsList = calculated.newArrears;
        }

        earningsRef.current = earningsList;
        deductionsRef.current = deductionsList;
        arrearsRef.current = arrearsList;

        setEarnings(earningsList);
        setDeductions(deductionsList);
        setArrears(arrearsList);
        calculateTotalsWithArrays(earningsList, deductionsList, arrearsList);
    }, [salaryDetails]);
    // Helper function to calculate totals with specific arrays (client-side calculation)
    const calculateTotalsWithArrays = (
        earningsArray: EditablePayrollItem[],
        deductionsArray: EditablePayrollItem[],
        arrearsArray: EditablePayrollItem[]
    ) => {
        // Client-side calculation: Calculate totals from active items
        // Use max amount if > 0, otherwise use amount
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
    // Validation helper functions
    const validatePercentage = (value: string): string => {
        if (value === '' || value === '-') return '0';
        const numValue = Number.parseFloat(value);
        if (Number.isNaN(numValue)) return '0';
        if (numValue < 0) return '0';
        if (numValue > 100) return '100';
        return value;
    };
    const validateAmount = (value: string): number => {
        if (value === '' || value === '-') return 0;
        // Remove any non-digit characters except decimal point
        let cleanValue = value.replace(/[^\d.]/g, '');
        // Remove negative sign if present (we don't allow negatives)
        cleanValue = cleanValue.replace(/-/g, '');
        // Check for max 15 digits (excluding decimal point)
        const digitsOnly = cleanValue.replace(/\./g, '');
        if (digitsOnly.length > 15) {
            // Truncate to 15 digits - keep integer part and allow some decimal places
            const truncatedDigits = digitsOnly.substring(0, 15);
            // If there was a decimal, try to preserve it
            if (cleanValue.includes('.')) {
                const parts = cleanValue.split('.');
                const intDigits = parts[0].replace(/\./g, '').length;
                const maxDecimals = Math.min(parts[1]?.length || 0, 15 - intDigits);
                const intPart = truncatedDigits.substring(0, intDigits);
                const decPart = maxDecimals > 0 ? truncatedDigits.substring(intDigits, intDigits + maxDecimals) : '';
                const result = decPart ? `${intPart}.${decPart}` : intPart;
                const numValue = Number.parseFloat(result);
                return Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
            }
            const numValue = Number.parseFloat(truncatedDigits);
            return Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
        }
        const numValue = Number.parseFloat(cleanValue);
        if (Number.isNaN(numValue)) return 0;
        return Math.max(0, numValue); // Ensure no negative values
    };
    // State for calculation trigger (kept as fallback)
    const _handleCalculateServerSide = async (
        currentEarnings = earningsRef.current,
        currentDeductions = deductionsRef.current,
        currentArrears = arrearsRef.current,
        currentGross = grossRef.current
    ) => {
        if (!employeemiId) return;

        // Construct standard payload for calculation
        const allItems = [...currentEarnings, ...currentDeductions, ...currentArrears, ...(currentGross ? [currentGross] : [])].map(
            (item) => ({
                ...item,
                HREED_Amount: item.localAmount ?? item.HREED_Amount ?? 0,
                HREED_Percentage: item.localPercentage || item.HREED_Percentage || '0',
                HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag)
            })
        );

        const payload = {
            mI_Id: Number(employeemiId),
            employeeEarningsDeductionsDetails: allItems
        };

        try {
            const result = await _getEmployeeSalaryDetailsByHeadMutation.mutateAsync(payload);

            const calcResult = result as any;
            if (calcResult?.success && calcResult?.data?.employeeEarningsDeductionsDetails) {
                // Merge calculated results back into state
                const newDetails = calcResult.data.employeeEarningsDeductionsDetails as EditablePayrollItem[];

                const newEarnings: EditablePayrollItem[] = [];
                const newDeductions: EditablePayrollItem[] = [];
                const newArrears: EditablePayrollItem[] = [];
                let newGross: EditablePayrollItem | null = null;

                newDetails.forEach((item) => {
                    // Get name from salary details only (API driven)
                    const name = item.HRMED_Name || item.hrmeD_Name || '';
                    const rawFlag = item.HRMED_AmountPercentFlag;
                    const amountPercentFlag = rawFlag?.toString().trim()
                        ? rawFlag.toString().trim()
                        : item.hrmeD_AmountPercentFlag || 'Amount';

                    const editableItem: EditablePayrollItem = {
                        ...item,
                        HRMED_Name: name,
                        HRMED_AmountPercentFlag: amountPercentFlag,
                        HREED_ActiveFlag: item.HREED_ActiveFlag !== undefined ? Boolean(item.HREED_ActiveFlag) : false,
                        localAmount: item.HREED_Amount || 0,
                        localPercentage: item.HREED_Percentage || '0',
                        localApplicablePercentage: item.HREED_ApplicablePercentage || item.HREED_Percentage || '0',
                        localMaxAmount: item.HREED_ApplicableMaxValue || 0
                    };

                    if (item.HRMED_EarnDedFlag === 'Earning') {
                        newEarnings.push(editableItem);
                    } else if (item.HRMED_EarnDedFlag === 'Deduction') {
                        newDeductions.push(editableItem);
                    } else if (item.HRMED_EarnDedFlag === 'Arrear') {
                        newArrears.push(editableItem);
                    } else if (item.HRMED_EarnDedFlag === 'Gross') {
                        newGross = editableItem;
                    }
                });

                earningsRef.current = newEarnings;
                deductionsRef.current = newDeductions;
                arrearsRef.current = newArrears;
                if (newGross) grossRef.current = newGross;

                setEarnings(newEarnings);
                setDeductions(newDeductions);
                setArrears(newArrears);
                if (newGross) setGrossDetails(newGross);

                // Also update totals
                calculateTotalsWithArrays(newEarnings, newDeductions, newArrears);
            }
        } catch (error) {
            console.error('Calculation error', error);
        }
    };

    const handleAutoSave = async (item: EditablePayrollItem) => {
        if (!employeeId) return;

        const effectiveMiId = Number(MI_Id || employeemiId || HRMS_MI_ID || 30);

        // Construct payload matching backend DTO structure with both casings
        const payload = {
            // PascalCase keys for C# backend DTO binding
            HREED_Id: Number(item.HREED_Id || 0),
            MI_Id: effectiveMiId,
            HRME_Id: Number(employeeId),
            HRMED_Id: Number(item.HRMED_Id || 0),
            HRMED_Name: item.HRMED_Name || '',
            HREED_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
            HREED_Percentage: String(item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'),
            HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag),
            HREED_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true),
            HREED_ApplicableMaxValue: Number(item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0),
            // camelCase keys
            hreeD_Id: Number(item.HREED_Id || 0),
            mI_Id: effectiveMiId,
            hrmE_Id: Number(employeeId),
            hrmeD_Id: Number(item.HRMED_Id || 0),
            hrmeD_Name: item.HRMED_Name || '',
            hreeD_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
            hreeD_Percentage: String(item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'),
            hreeD_ActiveFlag: Boolean(item.HREED_ActiveFlag),
            hreeD_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true),
            hreeD_ApplicableMaxValue: Number(item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0),
            updatedDate: new Date().toISOString(),
            hreeD_UpdatedBy: 0 // Logged in user ID from backend session
        };

        try {
            console.log(`[PAYROLL AUTO-SAVE] Payload for head ${item.HRMED_Id}:`, payload);
            await updateSalaryByHeadMutation.mutateAsync(payload);
        } catch (error) {
            console.error(`❌ [AUTO-SAVE ERROR] Failed for head ${item.HRMED_Id}:`, error);
        }
    };

    // Update handlers for earnings
    const updateEarning = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...earningsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        // If percentage is updated, sync localApplicablePercentage and calculate Amount from Gross
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
            const perc = Number.parseFloat(String(validatedValue)) || 0;
            const currentGross = grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0;
            if (currentGross > 0 && perc >= 0) {
                const calculatedAmount = Number(((currentGross * perc) / 100).toFixed(2));
                newProps.localAmount = calculatedAmount;
                newProps.HREED_Amount = calculatedAmount;
            }
        }

        // If checkbox is toggled ON, and Gross > 0 with percentage > 0 and amount is 0, calculate Amount
        if (field === 'HREED_ActiveFlag' && validatedValue === true) {
            const perc = getHeadPercentage(currentItem);
            const currentGross = grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0;
            if (currentGross > 0 && perc > 0 && (!currentItem.localAmount || currentItem.localAmount === 0)) {
                const calculatedAmount = Number(((currentGross * perc) / 100).toFixed(2));
                newProps.localAmount = calculatedAmount;
                newProps.HREED_Amount = calculatedAmount;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        earningsRef.current = updated;
        setEarnings(updated);
        dirtyRowsRef.current.earnings.add(index);

        calculateTotalsWithArrays(updated, deductionsRef.current, arrearsRef.current);
        return updated;
    };

    // Update handlers for deductions
    const updateDeduction = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...deductionsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        // If percentage is updated, sync localApplicablePercentage; for percentage deductions, keep amount at 0
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
            const perc = Number.parseFloat(String(validatedValue)) || 0;
            if (perc > 0) {
                newProps.localAmount = 0;
                newProps.HREED_Amount = 0;
            }
        }

        // If checkbox is toggled ON, and deduction has percentage, keep amount at 0
        if (field === 'HREED_ActiveFlag' && validatedValue === true) {
            const perc = getHeadPercentage(currentItem);
            if (perc > 0) {
                newProps.localAmount = 0;
                newProps.HREED_Amount = 0;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        deductionsRef.current = updated;
        setDeductions(updated);
        dirtyRowsRef.current.deductions.add(index);

        calculateTotalsWithArrays(earningsRef.current, updated, arrearsRef.current);
        return updated;
    };

    // Update handlers for arrears
    const updateArrear = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...arrearsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        // If percentage is updated, sync localApplicablePercentage and calculate Amount from Gross
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
            const perc = Number.parseFloat(String(validatedValue)) || 0;
            const currentGross = grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0;
            if (currentGross > 0 && perc >= 0) {
                const calculatedAmount = Number(((currentGross * perc) / 100).toFixed(2));
                newProps.localAmount = calculatedAmount;
                newProps.HREED_Amount = calculatedAmount;
            }
        }

        // If checkbox is toggled ON, and Gross > 0 with percentage > 0 and amount is 0, calculate Amount
        if (field === 'HREED_ActiveFlag' && validatedValue === true) {
            const perc = getHeadPercentage(currentItem);
            const currentGross = grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0;
            if (currentGross > 0 && perc > 0 && (!currentItem.localAmount || currentItem.localAmount === 0)) {
                const calculatedAmount = Number(((currentGross * perc) / 100).toFixed(2));
                newProps.localAmount = calculatedAmount;
                newProps.HREED_Amount = calculatedAmount;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        arrearsRef.current = updated;
        setArrears(updated);
        dirtyRowsRef.current.arrears.add(index);

        calculateTotalsWithArrays(earningsRef.current, deductionsRef.current, updated);
        return updated;
    };

    // Triggered when focus leaves an entire table row (clicking outside)
    const handleRowBlur = async (type: 'Earning' | 'Deduction' | 'Arrear', index: number) => {
        const dirtySet =
            type === 'Earning'
                ? dirtyRowsRef.current.earnings
                : type === 'Deduction'
                  ? dirtyRowsRef.current.deductions
                  : dirtyRowsRef.current.arrears;

        if (!dirtySet.has(index)) return;
        dirtySet.delete(index);

        const list = type === 'Earning' ? earningsRef.current : type === 'Deduction' ? deductionsRef.current : arrearsRef.current;
        const item = list[index];
        if (!item) return;

        await handleAutoSave(item);
    };

    // Update handlers for gross
    const updateGross = (field: keyof EditablePayrollItem, value: any) => {
        let validatedValue = value;
        if (field === 'localAmount') {
            validatedValue = validateAmount(String(value));
        }

        const baseGross =
            grossDetails ||
            ({
                HREED_Id: 0,
                HRMED_Id: 0,
                HRMED_Name: 'GROSS',
                HRMED_EarnDedFlag: 'Gross',
                HRMED_AmountPercentFlag: 'Amount',
                HREED_ActiveFlag: true,
                HREED_Amount: 0,
                HREED_Percentage: '0',
                HREED_ApplicablePercentage: '0',
                HREED_ApplicableMaxValue: 0,
                localAmount: 0,
                localPercentage: '0',
                localApplicablePercentage: '0',
                localMaxAmount: 0,
                HREED_MaxApplicableFlg: true
            } as EditablePayrollItem);

        const updatedGross = {
            ...baseGross,
            [field]: validatedValue,
            ...(field === 'localAmount' ? { HREED_Amount: validatedValue } : {})
        };
        grossRef.current = updatedGross;
        setGrossDetails(updatedGross);
        dirtyRowsRef.current.gross = true;
        return updatedGross;
    };

    const onBlurGross = async (updated = grossDetails) => {
        if (!updated) return;
        dirtyRowsRef.current.gross = false;

        const grossAmount = updated.localAmount ?? updated.HREED_Amount ?? 0;
        if (grossAmount > 0) {
            const { newEarnings, newDeductions, newArrears } = calculateHeadsFromGross(
                grossAmount,
                earningsRef.current,
                deductionsRef.current,
                arrearsRef.current
            );
            earningsRef.current = newEarnings;
            deductionsRef.current = newDeductions;
            arrearsRef.current = newArrears;
            setEarnings(newEarnings);
            setDeductions(newDeductions);
            setArrears(newArrears);
            calculateTotalsWithArrays(newEarnings, newDeductions, newArrears);

            // Auto-save gross head
            await handleAutoSave(grossRef.current || updated);

            // Auto-save recalculated heads that have amount > 0
            const autoSaves: Promise<any>[] = [];
            newEarnings.forEach((item) => {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    autoSaves.push(handleAutoSave(item));
                }
            });
            newDeductions.forEach((item) => {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    autoSaves.push(handleAutoSave(item));
                }
            });
            newArrears.forEach((item) => {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    autoSaves.push(handleAutoSave(item));
                }
            });
            if (autoSaves.length > 0) {
                await Promise.all(autoSaves);
            }
        } else {
            await handleAutoSave(grossRef.current || updated);
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
    // Calculate totals using client-side calculation
    const calculateTotals = () => {
        calculateTotalsWithArrays(earningsRef.current, deductionsRef.current, arrearsRef.current);
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
    }, [earnings, deductions, arrears]);
    // Use calculated totals from API, fallback to 0 if not calculated yet
    const totalEarning = calculatedTotals.totalEarning;
    const totalDeduction = calculatedTotals.totalDeduction;
    const totalArrear = calculatedTotals.totalArrear;
    const netSalary = calculatedTotals.netSalary;

    const saveEmployeeSalaryDetailsMutation = useSaveEmployeeSalaryDetails();

    const handleSave = async () => {
        if (!employeeId) {
            toast.error('Employee ID is required');
            return;
        }

        // Save gross and all active heads before final submit
        const pendingSaves: Promise<any>[] = [];
        if (grossRef.current) {
            pendingSaves.push(handleAutoSave(grossRef.current));
        }
        earningsRef.current.forEach((item) => {
            if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                pendingSaves.push(handleAutoSave(item));
            }
        });
        deductionsRef.current.forEach((item) => {
            if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                pendingSaves.push(handleAutoSave(item));
            }
        });
        arrearsRef.current.forEach((item) => {
            if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                pendingSaves.push(handleAutoSave(item));
            }
        });
        dirtyRowsRef.current.earnings.clear();
        dirtyRowsRef.current.deductions.clear();
        dirtyRowsRef.current.arrears.clear();
        dirtyRowsRef.current.gross = false;

        if (pendingSaves.length > 0) {
            await Promise.all(pendingSaves);
        }

        try {
            console.log(`🔍 [PayrollTab] Submitting Final Save for Employee ID: ${employeeId}, MI_Id: ${MI_Id}`);
            const result = await saveEmployeeSalaryDetailsMutation.mutateAsync({
                hrme_id: employeeId,
                MI_Id: MI_Id || 0
            });

            if (result?.success || result?.success === undefined) {
                refetch();
                toast.success(result?.message || 'Salary details saved successfully');
                // Call onSuccess if provided and still mounted
                if (isMountedRef.current && onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error('Save error:', error);
            // Error handling is already in the hook but we catch here to prevent crash
        }
    };
    const isSaving = saveEmployeeSalaryDetailsMutation.isPending;
    if (isLoading) {
        return <div className='rounded-md border p-6 text-center text-muted-foreground'>Loading payroll details...</div>;
    }
    return (
        <div className='space-y-6'>
            {/* Gross Salary Details */}
            {
                <div className='rounded-md border bg-white p-4'>
                    <div className='flex items-center gap-4'>
                        <h3 className='min-w-[150px] font-semibold text-base text-gray-900 uppercase'>GROSS SALARY:</h3>
                        <div className='flex items-center gap-2'>
                            <span className='font-medium text-sm'>Amount:</span>
                            <Input
                                type='number'
                                className='h-9 w-40 text-right'
                                value={grossDetails?.localAmount ?? grossDetails?.HREED_Amount ?? 0}
                                onChange={(e) => updateGross('localAmount', e.target.value)}
                                onBlur={(e) => {
                                    const validated = validateAmount(e.target.value);
                                    const updated = updateGross('localAmount', validated);
                                    if (updated) onBlurGross(updated);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                    }
                                }}
                                min={0}
                                max={999999999999999}
                                step={0.01}
                            />
                        </div>
                    </div>
                </div>
            }

            {/* Earning Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>EARNING DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16'>Action</TableHead>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Earnings</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead>Details</TableHead>
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
                                    const normalizedFlag = rawFlag ? String(rawFlag).trim().toLowerCase() : 'amount';
                                    const _isAmountType = normalizedFlag === 'amount';
                                    const isPercentageType = normalizedFlag === 'percentage';
                                    return (
                                        <TableRow
                                            key={item.HREED_Id || index}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    handleRowBlur('Earning', index);
                                                }
                                            }}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={item.HREED_ActiveFlag || false}
                                                    onCheckedChange={(checked) => updateEarning(index, 'HREED_ActiveFlag', checked)}
                                                />
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.HRMED_Name || ''}</TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localPercentage || item.HREED_Percentage || '0'}
                                                    onChange={(e) => updateEarning(index, 'localPercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateEarning(index, 'localPercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={true}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={
                                                        item.localApplicablePercentage ??
                                                        item.HREED_ApplicablePercentage ??
                                                        item.HREED_Percentage ??
                                                        '0'
                                                    }
                                                    onChange={(e) => updateEarning(index, 'localApplicablePercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateEarning(index, 'localApplicablePercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={true}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-right'
                                                    value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                    onChange={(e) => updateEarning(index, 'localAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateEarning(index, 'localAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    // disabled={!item.HREED_ActiveFlag || isPercentageType}
                                                    disabled = {false}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-right'
                                                    value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                    onChange={(e) => updateEarning(index, 'localMaxAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateEarning(index, 'localMaxAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag}
                                                />
                                            </TableCell>
                                            <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
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
                                <TableHead className='w-16'>Action</TableHead>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead>Details</TableHead>
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
                                    const normalizedFlag = rawFlag ? String(rawFlag).trim().toLowerCase() : 'amount';
                                    const _isAmountType = normalizedFlag === 'amount';
                                    const headPerc = getHeadPercentage(item);
                                    const isPercentageType = normalizedFlag === 'percentage' || headPerc > 0;
                                    return (
                                        <TableRow
                                            key={item.HREED_Id || index}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    handleRowBlur('Deduction', index);
                                                }
                                            }}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={item.HREED_ActiveFlag || false}
                                                    onCheckedChange={(checked) => updateDeduction(index, 'HREED_ActiveFlag', checked)}
                                                />
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.HRMED_Name || ''}</TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={item.localPercentage || item.HREED_Percentage || '0'}
                                                    onChange={(e) => updateDeduction(index, 'localPercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateDeduction(index, 'localPercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={true}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-right'
                                                    value={
                                                        item.localApplicablePercentage ??
                                                        item.HREED_ApplicablePercentage ??
                                                        item.HREED_Percentage ??
                                                        '0'
                                                    }
                                                    onChange={(e) => updateDeduction(index, 'localApplicablePercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateDeduction(index, 'localApplicablePercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={true}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-right'
                                                    value={isPercentageType ? 0 : (item.localAmount ?? item.HREED_Amount ?? 0)}
                                                    onChange={(e) => updateDeduction(index, 'localAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateDeduction(index, 'localAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-right'
                                                    value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                    onChange={(e) => updateDeduction(index, 'localMaxAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateDeduction(index, 'localMaxAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag}
                                                />
                                            </TableCell>
                                            <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
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
                                <TableHead className='w-16'>Action</TableHead>
                                <TableHead className='w-16'>Serial NO.</TableHead>
                                <TableHead>Arrear Head</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-right'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {arrears.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-muted-foreground'>
                                        No arrear details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                arrears.map((item, index) => (
                                    <TableRow
                                        key={item.HREED_Id || index}
                                        onBlur={(e) => {
                                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                handleRowBlur('Arrear', index);
                                            }
                                        }}>
                                        <TableCell>
                                            <Checkbox
                                                checked={item.HREED_ActiveFlag || false}
                                                onCheckedChange={(checked) => updateArrear(index, 'HREED_ActiveFlag', checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.HRMED_Name || ''}</TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={item.localPercentage || item.HREED_Percentage || '0'}
                                                onChange={(e) => updateArrear(index, 'localPercentage', e.target.value)}
                                                onBlur={(e) => {
                                                    const validated = validatePercentage(e.target.value);
                                                    updateArrear(index, 'localPercentage', validated);
                                                }}
                                                min={0}
                                                max={100}
                                                step={0.01}
                                                disabled={true}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-20 text-right'
                                                value={
                                                    item.localApplicablePercentage ??
                                                    item.HREED_ApplicablePercentage ??
                                                    item.HREED_Percentage ??
                                                    '0'
                                                }
                                                onChange={(e) => updateArrear(index, 'localApplicablePercentage', e.target.value)}
                                                onBlur={(e) => {
                                                    const validated = validatePercentage(e.target.value);
                                                    updateArrear(index, 'localApplicablePercentage', validated);
                                                }}
                                                min={0}
                                                max={100}
                                                step={0.01}
                                                disabled={true}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                onChange={(e) => updateArrear(index, 'localAmount', e.target.value)}
                                                onBlur={(e) => {
                                                    const validated = validateAmount(e.target.value);
                                                    updateArrear(index, 'localAmount', validated);
                                                }}
                                                min={0}
                                                max={999999999999999}
                                                step={0.01}
                                                disabled={!item.HREED_ActiveFlag}
                                            />
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Input
                                                type='number'
                                                className='h-8 w-24 text-right'
                                                value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                onChange={(e) => updateArrear(index, 'localMaxAmount', e.target.value)}
                                                onBlur={(e) => {
                                                    const validated = validateAmount(e.target.value);
                                                    updateArrear(index, 'localMaxAmount', validated);
                                                }}
                                                min={0}
                                                max={999999999999999}
                                                step={0.01}
                                                disabled={!item.HREED_ActiveFlag}
                                            />
                                        </TableCell>
                                        <TableCell>{item.HREED_MaxApplicableFlg ? 'Yes' : 'No'}</TableCell>
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
            <div className='flex w-full items-center justify-center gap-3 pt-4'>
                {/* <Button variant='outline' type='button'>
                    PREVIOUS
                </Button> */}
                <Button type='button' variant='default' onClick={handleSave} disabled={isSaving} className='w-fit'>
                    {isSaving ? 'SAVING...' : 'SUBMIT SALARY INFO'}
                </Button>
                {/* <Button variant='outline' type='button'>
                    CLEAR
                </Button> */}
            </div>
        </div>
    );
}
