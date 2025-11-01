'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApproveSalaries } from '@/hooks/hrms/useTransactions';
import type { EmployeeDetail } from '@/types/hrms/salary-approval';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ApprovalTableProps {
    employees: EmployeeDetail[];
    searchCriteria: any;
}

export default function ApprovalTable({ employees, searchCriteria }: ApprovalTableProps) {
    const { mutate: approveSalaries, isPending } = useApproveSalaries();
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEmployees(employees.map((emp) => emp.HRME_Id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (employeeId: number, checked: boolean) => {
        if (checked) {
            setSelectedEmployees([...selectedEmployees, employeeId]);
        } else {
            setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
        }
    };

    const handleApprove = () => {
        if (selectedEmployees.length === 0) {
            return;
        }

        const payload = {
            MI_Id: 30,
            HRES_Year: searchCriteria.HRES_Year,
            HRES_Month: searchCriteria.HRES_Month,
            employeeIdList: selectedEmployees,
            LogInUserId: 5,
            approvalStatus: 'Approved' as const
        };

        approveSalaries(payload, {
            onSuccess: () => {
                setSelectedEmployees([]);
            }
        });
    };

    const handleReject = () => {
        if (selectedEmployees.length === 0) {
            return;
        }

        const payload = {
            MI_Id: 30,
            HRES_Year: searchCriteria.HRES_Year,
            HRES_Month: searchCriteria.HRES_Month,
            employeeIdList: selectedEmployees,
            LogInUserId: 5,
            approvalStatus: 'Rejected' as const
        };

        approveSalaries(payload, {
            onSuccess: () => {
                setSelectedEmployees([]);
            }
        });
    };

    const isAllSelected = selectedEmployees.length === employees.length;
    const isPartiallySelected = selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

    return (
        <div className='space-y-4'>
            {/* Action Bar */}
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-muted-foreground text-sm'>
                        Total Employees: {employees.length} | Selected: {selectedEmployees.length}
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button onClick={handleApprove} disabled={isPending || selectedEmployees.length === 0} variant='default'>
                        <CheckCircle className='mr-2 h-4 w-4' />
                        {isPending ? 'Processing...' : 'Approve Selected'}
                    </Button>
                    <Button onClick={handleReject} disabled={isPending || selectedEmployees.length === 0} variant='destructive'>
                        <XCircle className='mr-2 h-4 w-4' />
                        {isPending ? 'Processing...' : 'Reject Selected'}
                    </Button>
                </div>
            </div>

            {/* Employee Table */}
            <div className='overflow-x-auto rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-12'>
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label='Select all'
                                    ref={(el: any) => {
                                        if (el) {
                                            el.indeterminate = isPartiallySelected;
                                        }
                                    }}
                                />
                            </TableHead>
                            <TableHead>Sl. No</TableHead>
                            <TableHead>Employee Code</TableHead>
                            <TableHead>Employee Name</TableHead>
                            <TableHead className='text-right'>Working Days</TableHead>
                            <TableHead className='text-right'>LOP Days</TableHead>
                            <TableHead className='text-right'>Gross Salary</TableHead>
                            <TableHead className='text-right'>Basic</TableHead>
                            <TableHead className='text-right'>DA</TableHead>
                            <TableHead className='text-right'>HRA</TableHead>
                            <TableHead className='text-right'>Conveyance</TableHead>
                            <TableHead className='text-right'>Medical</TableHead>
                            <TableHead className='text-right'>Spl Allowance</TableHead>
                            <TableHead className='text-right'>Total Earning</TableHead>
                            <TableHead className='text-right'>PF</TableHead>
                            <TableHead className='text-right'>ESI</TableHead>
                            <TableHead className='text-right'>Others (C.D)</TableHead>
                            <TableHead className='text-right'>PT</TableHead>
                            <TableHead className='text-right'>Total Deduction</TableHead>
                            <TableHead className='text-right'>Salary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={21} className='h-24 text-center'>
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((employee: any, index) => {
                                const fullName = [
                                    employee.HRME_EmployeeFirstName,
                                    employee.HRME_EmployeeMiddleName,
                                    employee.HRME_EmployeeLastName
                                ]
                                    .filter(Boolean)
                                    .join(' ');

                                const isSelected = selectedEmployees.includes(employee.HRME_Id);

                                return (
                                    <TableRow key={employee.HRME_Id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleSelectEmployee(employee.HRME_Id, checked as boolean)}
                                                aria-label={`Select ${fullName}`}
                                            />
                                        </TableCell>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className='font-medium'>{employee.HRME_EmployeeCode || '-'}</TableCell>
                                        <TableCell className='whitespace-nowrap'>{fullName || '-'}</TableCell>
                                        <TableCell className='text-right'>{employee.HRES_WorkingDays || 0}</TableCell>
                                        <TableCell className='text-right'>{employee.Lopdays || 0}</TableCell>
                                        <TableCell className='text-right'>
                                            {employee.empGrossSal ? `₹${employee.empGrossSal.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.basicamount ? `₹${employee.basicamount.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>{employee.da ? `₹${employee.da.toFixed(2)}` : '₹0.00'}</TableCell>
                                        <TableCell className='text-right'>
                                            {employee.hra ? `₹${employee.hra.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.conveyance ? `₹${employee.conveyance.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.medical ? `₹${employee.medical.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.splAllowance ? `₹${employee.splAllowance.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right font-semibold'>
                                            {employee.TotalEarning ? `₹${employee.TotalEarning.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.HRES_EPF ? `₹${employee.HRES_EPF.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.esi ? `₹${employee.esi.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {employee.HRESD_Amount ? `₹${employee.HRESD_Amount.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>{employee.pt ? `₹${employee.pt.toFixed(2)}` : '₹0.00'}</TableCell>
                                        <TableCell className='text-right font-semibold'>
                                            {employee.TotalDeduction ? `₹${employee.TotalDeduction.toFixed(2)}` : '₹0.00'}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Badge variant='default' className='font-semibold'>
                                                {employee.NetSalary ? `₹${employee.NetSalary.toFixed(2)}` : '₹0.00'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
