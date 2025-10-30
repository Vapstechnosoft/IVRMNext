'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, X, Banknote, Download, Printer, CreditCard, Wallet } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';
import { cn } from '@/lib/utils';

// Data interfaces
interface GroupType extends BaseEntity {
  groupType: string;
  groupCode: string;
  order: number;
  isActive: boolean;
}

interface Department extends BaseEntity {
  departmentName: string;
  internalTrainingHours: string;
  order: number;
  isActive: boolean;
}

interface Designation extends BaseEntity {
  designationName: string;
  basicAmount: string;
  sanctionedSeats: string;
  displaySanctionedSeats: boolean;
  order: number;
  isActive: boolean;
}

// Bank cash report data structure
interface BankCashRecord extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupType: string;
  departmentName: string;
  designationName: string;
  paymentMode: 'Bank' | 'Cash';
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  grossSalary: number;
  netSalary: number;
  deductions: number;
  month: string;
  year: string;
  paymentDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

// Report filters
interface BankCashReportFilters {
  selectedTypes: string[];
  selectedDepartments: string[];
  selectedDesignations: string[];
  paymentMode: 'Bank' | 'Cash';
  month: string;
  year: string;
}

export default function BankCashReportPage() {
  // Database instances
  const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
  const departmentDB = createLocalCrud<Department>('master:department');
  const designationDB = createLocalCrud<Designation>('master:designation');
  const bankCashDB = createLocalCrud<BankCashRecord>('report:bank-cash');

  // State
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [bankCashRecords, setBankCashRecords] = useState<BankCashRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BankCashRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState<BankCashReportFilters>({
    selectedTypes: [],
    selectedDepartments: [],
    selectedDesignations: [],
    paymentMode: 'Bank',
    month: '',
    year: ''
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load master data
      let groupList = groupTypeDB.list();
      if (groupList.length === 0) {
        const mockData = generateMockGroupTypes();
        mockData.forEach(group => groupTypeDB.create(group));
        groupList = groupTypeDB.list(); // Reload data after creating mock records
      }
      setGroupTypes(groupList.filter(g => g.isActive));

      let deptList = departmentDB.list();
      if (deptList.length === 0) {
        const mockData = generateMockDepartments();
        mockData.forEach(dept => departmentDB.create(dept));
        deptList = departmentDB.list(); // Reload data after creating mock records
      }
      setDepartments(deptList.filter(d => d.isActive));

      let desigList = designationDB.list();
      if (desigList.length === 0) {
        const mockData = generateMockDesignations();
        mockData.forEach(desig => designationDB.create(desig));
        desigList = designationDB.list(); // Reload data after creating mock records
      }
      setDesignations(desigList.filter(d => d.isActive));
      
      // Load bank cash records
      let recordList = bankCashDB.list();
      if (recordList.length === 0) {
        const mockData = generateMockBankCashData();
        mockData.forEach(record => bankCashDB.create(record));
        recordList = bankCashDB.list(); // Reload data after creating mock records
      }
      setBankCashRecords(recordList);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data
  const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
    return [
      { groupType: 'Test NON Teaching', groupCode: 'TNT', order: 1, isActive: true },
      { groupType: 'Test Insurance', groupCode: 'TI', order: 2, isActive: true },
      { groupType: 'Teaching', groupCode: 'T', order: 3, isActive: true },
      { groupType: 'Owner of the company', groupCode: 'OC', order: 4, isActive: true },
      { groupType: 'Non Teaching', groupCode: 'NT', order: 5, isActive: true },
      { groupType: 'Administrative', groupCode: 'ADM', order: 6, isActive: true },
      { groupType: 'test', groupCode: 'TST', order: 7, isActive: true }
    ];
  };

  const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
    return [
      { departmentName: 'Teaching', internalTrainingHours: '40', order: 1, isActive: true },
      { departmentName: 'JUNIOR SCHOOL', internalTrainingHours: '35', order: 2, isActive: true },
      { departmentName: 'SENIOR SCHOOL', internalTrainingHours: '40', order: 3, isActive: true },
      { departmentName: 'OFFICE STAFF', internalTrainingHours: '40', order: 4, isActive: true },
      { departmentName: 'Service Staff', internalTrainingHours: '40', order: 5, isActive: true },
      { departmentName: 'Administrative', internalTrainingHours: '40', order: 6, isActive: true },
      { departmentName: 'Chief executive officer', internalTrainingHours: '40', order: 7, isActive: true },
      { departmentName: 'Principal', internalTrainingHours: '40', order: 8, isActive: true }
    ];
  };

  const generateMockDesignations = (): Omit<Designation, 'id' | 'createdAt'>[] => {
    return [
      { designationName: 'Assistant Teacher', basicAmount: '25000', sanctionedSeats: '10', displaySanctionedSeats: true, order: 1, isActive: true },
      { designationName: 'Principal', basicAmount: '60000', sanctionedSeats: '1', displaySanctionedSeats: true, order: 2, isActive: true },
      { designationName: 'Vice Principal', basicAmount: '50000', sanctionedSeats: '2', displaySanctionedSeats: true, order: 3, isActive: true },
      { designationName: 'Office Assistant', basicAmount: '20000', sanctionedSeats: '5', displaySanctionedSeats: true, order: 4, isActive: true },
      { designationName: 'System Manager', basicAmount: '40000', sanctionedSeats: '2', displaySanctionedSeats: true, order: 5, isActive: true },
      { designationName: 'Teacher Helper', basicAmount: '15000', sanctionedSeats: '8', displaySanctionedSeats: true, order: 6, isActive: true },
      { designationName: 'Electrician', basicAmount: '18000', sanctionedSeats: '3', displaySanctionedSeats: true, order: 7, isActive: true },
      { designationName: 'Ayah', basicAmount: '12000', sanctionedSeats: '5', displaySanctionedSeats: true, order: 8, isActive: true }
    ];
  };

  const generateMockBankCashData = (): Omit<BankCashRecord, 'id' | 'createdAt'>[] => {
    const employees = [
      { code: 'EMP001', name: 'MR SUDIPTA RANJAN BHADURI', groupType: 'Teaching', dept: 'JUNIOR SCHOOL', desig: 'Assistant Teacher' },
      { code: 'EMP002', name: 'MS RUPLEKHA CHATTERJEE', groupType: 'Administrative', dept: 'OFFICE STAFF', desig: 'Principal' },
      { code: 'EMP003', name: 'MR JOHN SHAH', groupType: 'Teaching', dept: 'SENIOR SCHOOL', desig: 'Assistant Teacher' },
      { code: 'EMP004', name: 'MRS BHASWATI DAS', groupType: 'Non Teaching', dept: 'Service Staff', desig: 'Teacher Helper' },
      { code: 'EMP005', name: 'MR SANTANU MUKHERJEE', groupType: 'Administrative', dept: 'OFFICE STAFF', desig: 'System Manager' }
    ];

    const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];
    const mockRecords: Omit<BankCashRecord, 'id' | 'createdAt'>[] = [];

    employees.forEach((emp, empIndex) => {
      const grossSalary = 30000 + (empIndex * 8000) + (Math.random() * 10000);
      const deductions = grossSalary * 0.18;
      const netSalary = grossSalary - deductions;
      const paymentMode = Math.random() > 0.3 ? 'Bank' : 'Cash';

      mockRecords.push({
        employeeCode: emp.code,
        employeeName: emp.name,
        groupType: emp.groupType,
        departmentName: emp.dept,
        designationName: emp.desig,
        paymentMode: paymentMode,
        bankName: paymentMode === 'Bank' ? banks[empIndex % banks.length] : undefined,
        accountNumber: paymentMode === 'Bank' ? `${12345678901 + empIndex}` : undefined,
        ifscCode: paymentMode === 'Bank' ? `${['SBIN', 'HDFC', 'ICIC', 'UTIB', 'PUNB'][empIndex % 5]}000${empIndex + 1}234` : undefined,
        grossSalary: Math.round(grossSalary),
        netSalary: Math.round(netSalary),
        deductions: Math.round(deductions),
        month: 'September',
        year: '2025',
        paymentDate: '2025-09-30',
        paymentStatus: ['Paid', 'Pending', 'Failed'][Math.floor(Math.random() * 3)] as 'Paid' | 'Pending' | 'Failed'
      });
    });

    return mockRecords;
  };

  // Filter records based on selected criteria
  useEffect(() => {
    let filtered = bankCashRecords;

    if (filters.selectedTypes.length > 0) {
      filtered = filtered.filter(record => filters.selectedTypes.includes(record.groupType));
    }

    if (filters.selectedDepartments.length > 0) {
      filtered = filtered.filter(record => filters.selectedDepartments.includes(record.departmentName));
    }

    if (filters.selectedDesignations.length > 0) {
      filtered = filtered.filter(record => filters.selectedDesignations.includes(record.designationName));
    }

    filtered = filtered.filter(record => record.paymentMode === filters.paymentMode);

    if (filters.month) {
      filtered = filtered.filter(record => record.month === filters.month);
    }

    if (filters.year) {
      filtered = filtered.filter(record => record.year === filters.year);
    }

    setFilteredRecords(filtered);
  }, [filters, bankCashRecords]);

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const handleDepartmentToggle = (dept: string) => {
    setFilters(prev => ({
      ...prev,
      selectedDepartments: prev.selectedDepartments.includes(dept)
        ? prev.selectedDepartments.filter(d => d !== dept)
        : [...prev.selectedDepartments, dept]
    }));
  };

  const handleDesignationToggle = (desig: string) => {
    setFilters(prev => ({
      ...prev,
      selectedDesignations: prev.selectedDesignations.includes(desig)
        ? prev.selectedDesignations.filter(d => d !== desig)
        : [...prev.selectedDesignations, desig]
    }));
  };

  const handleSelectAllTypes = () => {
    const allTypes = groupTypes.map(g => g.groupType);
    setFilters(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.length === allTypes.length ? [] : allTypes
    }));
  };

  const handleSelectAllDepartments = () => {
    const allDepts = departments.map(d => d.departmentName);
    setFilters(prev => ({
      ...prev,
      selectedDepartments: prev.selectedDepartments.length === allDepts.length ? [] : allDepts
    }));
  };

  const handleSelectAllDesignations = () => {
    const allDesigs = designations.map(d => d.designationName);
    setFilters(prev => ({
      ...prev,
      selectedDesignations: prev.selectedDesignations.length === allDesigs.length ? [] : allDesigs
    }));
  };

  const handleFilterChange = (key: keyof Omit<BankCashReportFilters, 'selectedTypes' | 'selectedDepartments' | 'selectedDesignations'>, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    if (!filters.month || !filters.year) {
      toast.error('Please select month and year');
      return;
    }
    setShowReport(true);
    toast.success('Bank/Cash report generated');
  };

  const handleCancel = () => {
    setFilters({
      selectedTypes: [],
      selectedDepartments: [],
      selectedDesignations: [],
      paymentMode: 'Bank',
      month: '',
      year: ''
    });
    setShowReport(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('Bank/Cash report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    return {
      totalEmployees: filteredRecords.length,
      totalGrossSalary: filteredRecords.reduce((sum, r) => sum + r.grossSalary, 0),
      totalNetSalary: filteredRecords.reduce((sum, r) => sum + r.netSalary, 0),
      totalDeductions: filteredRecords.reduce((sum, r) => sum + r.deductions, 0),
      bankPayments: filteredRecords.filter(r => r.paymentMode === 'Bank').length,
      cashPayments: filteredRecords.filter(r => r.paymentMode === 'Cash').length,
      paidRecords: filteredRecords.filter(r => r.paymentStatus === 'Paid').length,
      pendingRecords: filteredRecords.filter(r => r.paymentStatus === 'Pending').length
    };
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<BankCashRecord>[] = [
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
      accessorKey: 'departmentName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
      cell: ({ row }) => <div>{row.getValue('departmentName')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'designationName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
      cell: ({ row }) => <div>{row.getValue('designationName')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'paymentMode',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Payment Mode' />,
      cell: ({ row }) => {
        const mode = row.getValue('paymentMode') as string;
        return (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1',
            mode === 'Bank' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          )}>
            {mode === 'Bank' ? <CreditCard className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
            {mode}
          </span>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'bankName',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' />,
      cell: ({ row }) => <div>{row.getValue('bankName') || '-'}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'accountNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Account Number' />,
      cell: ({ row }) => <div className="font-mono">{row.getValue('accountNumber') || '-'}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'netSalary',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
      cell: ({ row }) => <div className="font-semibold">₹{(row.getValue('netSalary') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.getValue('paymentStatus') as string;
        return (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status === 'Paid' ? 'bg-green-100 text-green-800' :
            status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          )}>
            {status}
          </span>
        );
      },
      enableSorting: true,
      enableHiding: true
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='Bank Cash Report' description='Generate bank and cash payment reports for employees' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <Banknote className='h-5 w-5' />
          BANK / CASH REPORT
        </div>
        
        {/* Filter Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Type Selection */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium text-foreground'>
                Type: <span className='text-red-500'>*</span>
              </label>
              <Button 
                variant='outline' 
                size='sm' 
                onClick={handleSelectAllTypes}
                className='text-xs'
              >
                {filters.selectedTypes.length === groupTypes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className='border rounded-md p-3 max-h-40 overflow-y-auto bg-background'>
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm cursor-pointer font-medium'>
                  <Checkbox
                    checked={filters.selectedTypes.length === groupTypes.length}
                    onCheckedChange={handleSelectAllTypes}
                  />
                  All
                </label>
                {groupTypes.map((type) => (
                  <label key={type.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                    <Checkbox
                      checked={filters.selectedTypes.includes(type.groupType)}
                      onCheckedChange={() => handleTypeToggle(type.groupType)}
                    />
                    {type.groupType}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Department Selection */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium text-foreground'>
                Department: <span className='text-red-500'>*</span>
              </label>
              <Button 
                variant='outline' 
                size='sm' 
                onClick={handleSelectAllDepartments}
                className='text-xs'
              >
                {filters.selectedDepartments.length === departments.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className='border rounded-md p-3 max-h-40 overflow-y-auto bg-background'>
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm cursor-pointer font-medium'>
                  <Checkbox
                    checked={filters.selectedDepartments.length === departments.length}
                    onCheckedChange={handleSelectAllDepartments}
                  />
                  All
                </label>
                {departments.map((dept) => (
                  <label key={dept.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                    <Checkbox
                      checked={filters.selectedDepartments.includes(dept.departmentName)}
                      onCheckedChange={() => handleDepartmentToggle(dept.departmentName)}
                    />
                    {dept.departmentName}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Designation Selection */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium text-foreground'>
                Designation: <span className='text-red-500'>*</span>
              </label>
              <Button 
                variant='outline' 
                size='sm' 
                onClick={handleSelectAllDesignations}
                className='text-xs'
              >
                {filters.selectedDesignations.length === designations.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className='border rounded-md p-3 max-h-40 overflow-y-auto bg-background'>
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm cursor-pointer font-medium'>
                  <Checkbox
                    checked={filters.selectedDesignations.length === designations.length}
                    onCheckedChange={handleSelectAllDesignations}
                  />
                  All
                </label>
                {designations.map((desig) => (
                  <label key={desig.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                    <Checkbox
                      checked={filters.selectedDesignations.includes(desig.designationName)}
                      onCheckedChange={() => handleDesignationToggle(desig.designationName)}
                    />
                    {desig.designationName}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Mode and Date Selection */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Payment Mode Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-foreground'>Payment Mode:</label>
            <div className='flex items-center gap-6'>
              <label className='flex items-center gap-2 text-sm cursor-pointer'>
                <input
                  type='radio'
                  name='paymentMode'
                  value='Bank'
                  checked={filters.paymentMode === 'Bank'}
                  onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                  className='text-primary focus:ring-primary'
                />
                Bank <span className='text-red-500'>*</span>
              </label>
              <label className='flex items-center gap-2 text-sm cursor-pointer'>
                <input
                  type='radio'
                  name='paymentMode'
                  value='Cash'
                  checked={filters.paymentMode === 'Cash'}
                  onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                  className='text-primary focus:ring-primary'
                />
                Cash <span className='text-red-500'>*</span>
              </label>
            </div>
          </div>

          {/* Month and Year Selection */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Month: <span className='text-red-500'>*</span>
              </label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger>
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

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>
                Year: <span className='text-red-500'>*</span>
              </label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
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
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4'>
          <Button onClick={handleSearch}>
            <Search className='mr-2 h-4 w-4' />
            SEARCH
          </Button>
          <Button variant='outline' onClick={handleCancel} prefix={<X className='size-4' />}>
            CANCEL
          </Button>
        </div>
      </div>

      {/* Report Results */}
      {showReport && (
        <div className='space-y-4'>
          {/* Report Header */}
          <div className='flex items-center justify-between p-4 border rounded-lg bg-card'>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                {filters.paymentMode} Payment Report - {filters.month} {filters.year}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Total Records: {filteredRecords.length} employees | 
                Payment Mode: {filters.paymentMode}
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

          {/* Summary Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>{summaryStats.totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Gross Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>₹{summaryStats.totalGrossSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-red-600'>₹{summaryStats.totalDeductions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Net Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{summaryStats.totalNetSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Mode Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <CreditCard className='h-4 w-4' />
                  Bank Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Total Bank Payments:</span>
                    <span className='font-semibold'>{summaryStats.bankPayments}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Bank Payment Amount:</span>
                    <span className='font-semibold text-blue-600'>
                      ₹{filteredRecords.filter(r => r.paymentMode === 'Bank').reduce((sum, r) => sum + r.netSalary, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Wallet className='h-4 w-4' />
                  Cash Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Total Cash Payments:</span>
                    <span className='font-semibold'>{summaryStats.cashPayments}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Cash Payment Amount:</span>
                    <span className='font-semibold text-green-600'>
                      ₹{filteredRecords.filter(r => r.paymentMode === 'Cash').reduce((sum, r) => sum + r.netSalary, 0).toLocaleString()}
                    </span>
                  </div>
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
        </div>
      )}
    </div>
  );
}
