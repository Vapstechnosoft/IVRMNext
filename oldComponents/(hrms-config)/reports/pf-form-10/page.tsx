'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Download, Printer, Shield, Calculator } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';

// Form 10 data structure (Annual PF Statement)
interface Form10Record extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  pfNumber: string;
  fatherName: string;
  dateOfJoining: string;
  dateOfLeaving?: string;
  openingBalance: number;
  employeeContribution: number;
  employerContribution: number;
  vpfContribution: number;
  interestEarned: number;
  totalContribution: number;
  withdrawalAmount: number;
  closingBalance: number;
  month: string;
  year: string;
  financialYear: string;
}

// Form 10 summary
interface Form10Summary {
  totalEmployees: number;
  totalOpeningBalance: number;
  totalEmployeeContribution: number;
  totalEmployerContribution: number;
  totalVPFContribution: number;
  totalInterestEarned: number;
  totalWithdrawals: number;
  totalClosingBalance: number;
}

// Report filters
interface Form10Filters {
  month: string;
  year: string;
}

export default function Form10Page() {
  // Database instances
  const form10DB = createLocalCrud<Form10Record>('report:form-10');

  // State
  const [form10Records, setForm10Records] = useState<Form10Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Form10Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [filters, setFilters] = useState<Form10Filters>({
    month: '',
    year: ''
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load Form 10 records
      let recordList = form10DB.list();
      if (recordList.length === 0) {
        const mockData = generateMockForm10Data();
        mockData.forEach(record => form10DB.create(record));
        recordList = form10DB.list(); // Reload data after creating mock records
      }
      setForm10Records(recordList);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock Form 10 data
  const generateMockForm10Data = (): Omit<Form10Record, 'id' | 'createdAt'>[] => {
    const employees = [
      { code: 'EMP001', name: 'MR SUDIPTA RANJAN BHADURI', father: 'LATE RANJAN BHADURI', joining: '2020-04-01' },
      { code: 'EMP002', name: 'MS RUPLEKHA CHATTERJEE', father: 'MR SUBRATA CHATTERJEE', joining: '2021-06-15' },
      { code: 'EMP003', name: 'MR JOHN SHAH', father: 'MR DINESH SHAH', joining: '2019-08-20' },
      { code: 'EMP004', name: 'MRS BHASWATI DAS', father: 'MR KRISHNA DAS', joining: '2022-01-10' },
      { code: 'EMP005', name: 'MR SANTANU MUKHERJEE', father: 'MR BIMAL MUKHERJEE', joining: '2020-11-25' },
      { code: 'EMP006', name: 'MRS PRIYA SHARMA', father: 'MR RAJESH SHARMA', joining: '2021-03-12' },
      { code: 'EMP007', name: 'MR RAJESH KUMAR', father: 'MR SURESH KUMAR', joining: '2020-07-08' },
      { code: 'EMP008', name: 'MS ANITA SINGH', father: 'MR VIJAY SINGH', joining: '2022-09-05' }
    ];

    const months = ['March']; // Form 10 is typically generated for financial year end (March)
    const mockRecords: Omit<Form10Record, 'id' | 'createdAt'>[] = [];

    employees.forEach((emp, empIndex) => {
      months.forEach((month) => {
        const yearsOfService = new Date().getFullYear() - new Date(emp.joining).getFullYear();
        const openingBalance = Math.max(0, (yearsOfService - 1) * 25000 + (empIndex * 10000));
        const monthlyContribution = 1800 + (empIndex * 200);
        const employeeContribution = monthlyContribution * 12;
        const employerContribution = monthlyContribution * 12;
        const vpfContribution = Math.random() > 0.6 ? monthlyContribution * 6 : 0; // Some employees have VPF
        const interestEarned = (openingBalance + employeeContribution + employerContribution) * 0.085; // 8.5% interest
        const withdrawalAmount = Math.random() > 0.8 ? Math.random() * 50000 : 0; // Some withdrawals
        const totalContribution = employeeContribution + employerContribution + vpfContribution;
        const closingBalance = openingBalance + totalContribution + interestEarned - withdrawalAmount;

        mockRecords.push({
          employeeCode: emp.code,
          employeeName: emp.name,
          pfNumber: `PF${emp.code.slice(-3)}/2025`,
          fatherName: emp.father,
          dateOfJoining: emp.joining,
          dateOfLeaving: Math.random() > 0.9 ? '2024-12-31' : undefined, // Some employees left
          openingBalance: Math.round(openingBalance),
          employeeContribution: Math.round(employeeContribution),
          employerContribution: Math.round(employerContribution),
          vpfContribution: Math.round(vpfContribution),
          interestEarned: Math.round(interestEarned),
          totalContribution: Math.round(totalContribution),
          withdrawalAmount: Math.round(withdrawalAmount),
          closingBalance: Math.round(closingBalance),
          month: month,
          year: '2025',
          financialYear: '2024-25'
        });
      });
    });

    return mockRecords;
  };

  // Filter Form 10 records based on selected month/year
  useEffect(() => {
    let filtered = form10Records;

    if (filters.month) {
      filtered = filtered.filter(record => record.month === filters.month);
    }

    if (filters.year) {
      filtered = filtered.filter(record => record.year === filters.year);
    }

    setFilteredRecords(filtered);
  }, [filters, form10Records]);

  const handleFilterChange = (key: keyof Form10Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (!filters.month || !filters.year) {
      toast.error('Please select month and year');
      return;
    }
    setShowForm(true);
    toast.success('Form 10 generated');
  };

  const handleCancel = () => {
    setFilters({
      month: '',
      year: ''
    });
    setShowForm(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('Form 10 exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate Form 10 summary
  const form10Summary: Form10Summary = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      totalEmployees: acc.totalEmployees + 1,
      totalOpeningBalance: acc.totalOpeningBalance + record.openingBalance,
      totalEmployeeContribution: acc.totalEmployeeContribution + record.employeeContribution,
      totalEmployerContribution: acc.totalEmployerContribution + record.employerContribution,
      totalVPFContribution: acc.totalVPFContribution + record.vpfContribution,
      totalInterestEarned: acc.totalInterestEarned + record.interestEarned,
      totalWithdrawals: acc.totalWithdrawals + record.withdrawalAmount,
      totalClosingBalance: acc.totalClosingBalance + record.closingBalance
    }), {
      totalEmployees: 0,
      totalOpeningBalance: 0,
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalVPFContribution: 0,
      totalInterestEarned: 0,
      totalWithdrawals: 0,
      totalClosingBalance: 0
    });
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<Form10Record>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div className="text-center">{continuousIndex}</div>;
      },
      enableSorting: false,
      enableHiding: false,
      size: 80
    },
    {
      accessorKey: 'employeeCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('employeeCode')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'employeeName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
      cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'pfNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title='PF Number' />,
      cell: ({ row }) => <div className="font-mono">{row.getValue('pfNumber')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'fatherName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Father's Name" />,
      cell: ({ row }) => <div>{row.getValue('fatherName')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'openingBalance',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Opening Balance' />,
      cell: ({ row }) => <div>₹{(row.getValue('openingBalance') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'employeeContribution',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Contribution' />,
      cell: ({ row }) => <div>₹{(row.getValue('employeeContribution') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'employerContribution',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employer Contribution' />,
      cell: ({ row }) => <div>₹{(row.getValue('employerContribution') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'interestEarned',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Interest Earned' />,
      cell: ({ row }) => <div>₹{(row.getValue('interestEarned') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'closingBalance',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Closing Balance' />,
      cell: ({ row }) => <div className="font-semibold">₹{(row.getValue('closingBalance') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='PF Form 10' description='Annual Statement of Individual Employee Account in Provident Fund' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <Shield className='h-5 w-5' />
          PF FORM 10
        </div>
        
        {/* Simple Month/Year Selection */}
        <div className='flex items-center justify-center gap-6'>
          {/* Month Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Month: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Year: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <SelectItem key={`year-${year}`} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center gap-2 pt-4'>
          <Button onClick={handleGenerate} className='bg-blue-600 hover:bg-blue-700'>
            GENERATE
          </Button>
          <Button variant='outline' onClick={handleCancel}>
            CANCEL
          </Button>
        </div>
      </div>

      {/* Form 10 Results */}
      {showForm && (
        <div className='space-y-4'>
          {/* Form 10 Header */}
          <div className='flex items-center justify-between p-4 border rounded-lg bg-card'>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Form 10 - {filters.month} {filters.year}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Annual PF Statement | Total Employees: {filteredRecords.length} | 
                Total PF Balance: ₹{form10Summary.totalClosingBalance.toLocaleString()}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleExport} prefix={<Download className='size-4' />}>
                Export
              </Button>
              <Button variant='outline' onClick={handlePrint} prefix={<Printer className='size-4' />}>
                Print
              </Button>
            </div>
          </div>

          {/* Form 10 Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>{form10Summary.totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Opening Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-blue-600'>₹{form10Summary.totalOpeningBalance.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-orange-600'>₹{(form10Summary.totalEmployeeContribution + form10Summary.totalEmployerContribution + form10Summary.totalVPFContribution).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Closing Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{form10Summary.totalClosingBalance.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Form 10 Breakdown */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Calculator className='h-4 w-4' />
                  PF Account Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Opening Balance:</span>
                  <span className='font-semibold text-blue-600'>₹{form10Summary.totalOpeningBalance.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Employee Contribution:</span>
                  <span className='font-semibold'>₹{form10Summary.totalEmployeeContribution.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Employer Contribution:</span>
                  <span className='font-semibold'>₹{form10Summary.totalEmployerContribution.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>VPF Contribution:</span>
                  <span className='font-semibold'>₹{form10Summary.totalVPFContribution.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Interest Earned:</span>
                  <span className='font-semibold text-orange-600'>₹{form10Summary.totalInterestEarned.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Withdrawals:</span>
                  <span className='font-semibold text-red-600'>₹{form10Summary.totalWithdrawals.toLocaleString()}</span>
                </div>
                <div className='flex justify-between border-t pt-2 font-semibold'>
                  <span>Closing Balance:</span>
                  <span className='text-green-600'>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Statement Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Financial Year:</span>
                  <span className='font-semibold'>2024-25</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Statement Period:</span>
                  <span className='font-semibold'>{filters.month} {filters.year}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Organization:</span>
                  <span className='font-semibold'>VAPS SCHOOL</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>PF Code:</span>
                  <span className='font-semibold'>WB/KOL/12345</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Interest Rate:</span>
                  <span className='font-semibold'>8.5% p.a.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <DataTable
            isLoading={isLoading}
            columns={columns}
            data={filteredRecords}
            totalItems={filteredRecords.length}
            showViewOptions={true}
            columnPinning={{ left: ['id'] }}
          />

          {/* Official Form 10 Format */}
          <div className='p-8 border rounded-lg bg-card'>
            <div className='text-center space-y-6'>
              <div className='space-y-2'>
                <h1 className='text-xl font-bold text-foreground'>EMPLOYEES' PROVIDENT FUND ORGANISATION</h1>
                <h2 className='text-lg font-semibold text-foreground'>FORM 10 - ANNUAL STATEMENT</h2>
                <h3 className='text-base font-medium text-foreground'>Individual Employee Account in Provident Fund</h3>
              </div>
              
              <div className='text-left space-y-4 max-w-4xl mx-auto'>
                <div className='grid grid-cols-2 gap-8 text-sm'>
                  <div className='space-y-2'>
                    <div><strong>Establishment Name:</strong> VAPS SCHOOL</div>
                    <div><strong>Establishment Code:</strong> WB/KOL/12345</div>
                    <div><strong>Establishment ID:</strong> WBKOL12345000</div>
                  </div>
                  <div className='space-y-2'>
                    <div><strong>Financial Year:</strong> 2024-25</div>
                    <div><strong>Statement Period:</strong> {filters.month} {filters.year}</div>
                    <div><strong>Total Employees:</strong> {form10Summary.totalEmployees}</div>
                  </div>
                </div>
                
                <div className='border rounded-lg p-4 space-y-4'>
                  <h3 className='font-semibold text-center'>PROVIDENT FUND ACCOUNT SUMMARY</h3>
                  
                  <div className='grid grid-cols-2 gap-8 text-sm'>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>Opening Balance:</span>
                        <span>₹{form10Summary.totalOpeningBalance.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Employee Contribution:</span>
                        <span>₹{form10Summary.totalEmployeeContribution.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Employer Contribution:</span>
                        <span>₹{form10Summary.totalEmployerContribution.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>VPF Contribution:</span>
                        <span>₹{form10Summary.totalVPFContribution.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span>Interest Earned (8.5%):</span>
                        <span>₹{form10Summary.totalInterestEarned.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Additions:</span>
                        <span>₹{(form10Summary.totalEmployeeContribution + form10Summary.totalEmployerContribution + form10Summary.totalVPFContribution + form10Summary.totalInterestEarned).toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Withdrawals:</span>
                        <span>₹{form10Summary.totalWithdrawals.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between font-semibold'>
                        <span>Net Balance:</span>
                        <span>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className='border-t pt-3'>
                    <div className='flex justify-between font-bold text-lg'>
                      <span>CLOSING BALANCE AS ON {filters.month?.toUpperCase()} {filters.year}:</span>
                      <span className='text-green-600'>₹{form10Summary.totalClosingBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className='text-sm space-y-2'>
                  <div><strong>Important Notes:</strong></div>
                  <ul className='list-disc list-inside space-y-1 text-xs'>
                    <li>This statement shows the annual summary of PF accounts for all employees.</li>
                    <li>Interest is calculated at 8.5% per annum as per EPFO guidelines.</li>
                    <li>Employee and Employer contributions are made at 12% each of basic salary.</li>
                    <li>VPF (Voluntary Provident Fund) contributions are additional voluntary contributions by employees.</li>
                    <li>All amounts are in Indian Rupees (₹).</li>
                  </ul>
                </div>
                
                <div className='pt-8 flex justify-between'>
                  <div className='text-sm'>
                    <div className='font-semibold'>Prepared By</div>
                    <div className='mt-2'>HR Department</div>
                    <div className='mt-6 border-t border-gray-300 w-32'></div>
                    <div className='text-xs mt-1'>Signature & Date</div>
                  </div>
                  <div className='text-sm text-right'>
                    <div className='font-semibold'>Authorized Signatory</div>
                    <div className='mt-2'>Principal/Director</div>
                    <div className='mt-6 border-t border-gray-300 w-32 ml-auto'></div>
                    <div className='text-xs mt-1'>Signature & Seal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



