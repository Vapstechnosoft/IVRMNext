'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, X, List, Download, Printer, Calculator } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';
import { cn } from '@/lib/utils';

// Data interfaces from employee-category masters
interface GroupType extends BaseEntity {
  groupType: string;
  groupCode: string;
  order: number;
  isActive: boolean;
}

// Head wise report data structure
interface HeadWiseRecord extends BaseEntity {
  salaryHead: string;
  headType: 'Earning' | 'Deduction';
  groupType: string;
  departmentName: string;
  totalEmployees: number;
  totalAmount: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
  month: string;
  year: string;
}

// Report filters
interface HeadWiseReportFilters {
  selectedGroupTypes: string[];
  month: string;
  year: string;
}

export default function HeadWiseReportPage() {
  // Database instances
  const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
  const headWiseDB = createLocalCrud<HeadWiseRecord>('report:head-wise');

  // State
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [headWiseRecords, setHeadWiseRecords] = useState<HeadWiseRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HeadWiseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState<HeadWiseReportFilters>({
    selectedGroupTypes: [],
    month: '',
    year: ''
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load group types
      let groupList = groupTypeDB.list();
      if (groupList.length === 0) {
        const mockData = generateMockGroupTypes();
        mockData.forEach(group => groupTypeDB.create(group));
        groupList = groupTypeDB.list(); // Reload data after creating mock records
      }
      setGroupTypes(groupList.filter(g => g.isActive));
      
      // Load head wise records
      let recordList = headWiseDB.list();
      if (recordList.length === 0) {
        const mockData = generateMockHeadWiseData();
        mockData.forEach(record => headWiseDB.create(record));
        recordList = headWiseDB.list(); // Reload data after creating mock records
      }
      setHeadWiseRecords(recordList);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock group types
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

  // Generate mock head wise data
  const generateMockHeadWiseData = (): Omit<HeadWiseRecord, 'id' | 'createdAt'>[] => {
    const salaryHeads = [
      { name: 'Basic Pay', type: 'Earning' as const },
      { name: 'DA', type: 'Earning' as const },
      { name: 'HRA', type: 'Earning' as const },
      { name: 'Special Allowance', type: 'Earning' as const },
      { name: 'Transport Allowance', type: 'Earning' as const },
      { name: 'PF Deduction', type: 'Deduction' as const },
      { name: 'ESI Deduction', type: 'Deduction' as const },
      { name: 'Professional Tax', type: 'Deduction' as const },
      { name: 'Income Tax', type: 'Deduction' as const }
    ];

    const groupTypeNames = ['Test NON Teaching', 'Test Insurance', 'Teaching', 'Owner of the company', 'Non Teaching', 'Administrative', 'test'];
    const departments = ['JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'SERVICE STAFF', 'ADMINISTRATIVE'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const mockRecords: Omit<HeadWiseRecord, 'id' | 'createdAt'>[] = [];

    salaryHeads.forEach((head) => {
      groupTypeNames.forEach((groupType) => {
        departments.forEach((dept) => {
          months.forEach((month) => {
            const totalEmployees = 3 + Math.floor(Math.random() * 8);
            const baseAmount = head.type === 'Earning' ? 15000 + Math.random() * 25000 : 2000 + Math.random() * 8000;
            const totalAmount = baseAmount * totalEmployees;
            const averageAmount = totalAmount / totalEmployees;
            const maxAmount = averageAmount * 1.5;
            const minAmount = averageAmount * 0.7;

            mockRecords.push({
              salaryHead: head.name,
              headType: head.type,
              groupType: groupType,
              departmentName: dept,
              totalEmployees,
              totalAmount: Math.round(totalAmount),
              averageAmount: Math.round(averageAmount),
              maxAmount: Math.round(maxAmount),
              minAmount: Math.round(minAmount),
              month: month,
              year: '2025'
            });
          });
        });
      });
    });

    return mockRecords;
  };

  // Filter head wise records based on selected criteria
  useEffect(() => {
    let filtered = headWiseRecords;

    if (filters.selectedGroupTypes.length > 0) {
      filtered = filtered.filter(record => filters.selectedGroupTypes.includes(record.groupType));
    }

    if (filters.month) {
      filtered = filtered.filter(record => record.month === filters.month);
    }

    if (filters.year) {
      filtered = filtered.filter(record => record.year === filters.year);
    }

    setFilteredRecords(filtered);
  }, [filters, headWiseRecords]);

  const handleGroupTypeToggle = (groupType: string) => {
    setFilters(prev => ({
      ...prev,
      selectedGroupTypes: prev.selectedGroupTypes.includes(groupType)
        ? prev.selectedGroupTypes.filter(g => g !== groupType)
        : [...prev.selectedGroupTypes, groupType]
    }));
  };

  const handleSelectAllGroupTypes = () => {
    const allGroupTypeNames = groupTypes.map(g => g.groupType);
    setFilters(prev => ({
      ...prev,
      selectedGroupTypes: prev.selectedGroupTypes.length === allGroupTypeNames.length 
        ? [] 
        : allGroupTypeNames
    }));
  };

  const handleFilterChange = (key: keyof Omit<HeadWiseReportFilters, 'selectedGroupTypes'>, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    if (!filters.month || !filters.year) {
      toast.error('Please select month and year');
      return;
    }
    setShowReport(true);
    toast.success('Head wise report generated');
  };

  const handleCancel = () => {
    setFilters({
      selectedGroupTypes: [],
      month: '',
      year: ''
    });
    setShowReport(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('Head wise report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const earningRecords = filteredRecords.filter(r => r.headType === 'Earning');
    const deductionRecords = filteredRecords.filter(r => r.headType === 'Deduction');

    return {
      totalEarnings: earningRecords.reduce((sum, r) => sum + r.totalAmount, 0),
      totalDeductions: deductionRecords.reduce((sum, r) => sum + r.totalAmount, 0),
      totalEmployees: new Set(filteredRecords.map(r => `${r.groupType}-${r.departmentName}`)).size,
      earningHeads: new Set(earningRecords.map(r => r.salaryHead)).size,
      deductionHeads: new Set(deductionRecords.map(r => r.salaryHead)).size
    };
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<HeadWiseRecord>[] = [
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
      accessorKey: 'salaryHead',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Salary Head' />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('salaryHead')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'headType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.getValue('headType') as string;
        return (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            type === 'Earning' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}>
            {type}
          </span>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'groupType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group Type' />,
      cell: ({ row }) => <div>{row.getValue('groupType')}</div>,
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
      accessorKey: 'totalEmployees',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employees' />,
      cell: ({ row }) => <div className="text-center">{row.getValue('totalEmployees')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Amount' />,
      cell: ({ row }) => <div className="font-semibold">₹{(row.getValue('totalAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'averageAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Average Amount' />,
      cell: ({ row }) => <div>₹{(row.getValue('averageAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'maxAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Max Amount' />,
      cell: ({ row }) => <div className="text-green-600">₹{(row.getValue('maxAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'minAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Min Amount' />,
      cell: ({ row }) => <div className="text-orange-600">₹{(row.getValue('minAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='Head Wise Report' description='Generate salary head wise analysis and reports' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <List className='h-5 w-5' />
          HEADER WISE REPORT
        </div>
        
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column - Group Type Selection */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-foreground'>
                  Group Type: <span className='text-red-500'>*</span>
                </label>
                <Button 
                  variant='outline' 
                  size='sm' 
                  onClick={handleSelectAllGroupTypes}
                  className='text-xs'
                >
                  {filters.selectedGroupTypes.length === groupTypes.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className='border rounded-md p-3 max-h-48 overflow-y-auto bg-background'>
                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm cursor-pointer font-medium'>
                    <Checkbox
                      checked={filters.selectedGroupTypes.length === groupTypes.length}
                      onCheckedChange={handleSelectAllGroupTypes}
                    />
                    All
                  </label>
                  {groupTypes.map((group) => (
                    <label key={group.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                      <Checkbox
                        checked={filters.selectedGroupTypes.includes(group.groupType)}
                        onCheckedChange={() => handleGroupTypeToggle(group.groupType)}
                      />
                      {group.groupType}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Month and Year */}
          <div className='space-y-4'>
            {/* Month Selection */}
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

            {/* Year Selection */}
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
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Group Types Display */}
            {filters.selectedGroupTypes.length > 0 && (
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>Selected Group Types:</label>
                <div className='text-sm text-muted-foreground'>
                  {filters.selectedGroupTypes.length} group type(s) selected
                </div>
              </div>
            )}
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
                Head Wise Report - {filters.month} {filters.year}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Total Records: {filteredRecords.length} salary heads | 
                Group Types: {filters.selectedGroupTypes.length}
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{summaryStats.totalEarnings.toLocaleString()}</div>
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
                <CardTitle className='text-sm text-muted-foreground'>Earning Heads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>{summaryStats.earningHeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Deduction Heads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>{summaryStats.deductionHeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Net Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-blue-600'>
                  ₹{(summaryStats.totalEarnings - summaryStats.totalDeductions).toLocaleString()}
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

          {/* Head Type Analysis */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Earnings Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Calculator className='h-4 w-4' />
                  Earnings Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {Array.from(new Set(filteredRecords.filter(r => r.headType === 'Earning').map(r => r.salaryHead))).map((head) => {
                    const headTotal = filteredRecords
                      .filter(r => r.salaryHead === head && r.headType === 'Earning')
                      .reduce((sum, r) => sum + r.totalAmount, 0);
                    
                    return (
                      <div key={head} className='flex justify-between items-center'>
                        <span className='text-sm'>{head}</span>
                        <span className='text-sm font-semibold text-green-600'>₹{headTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Deductions Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Calculator className='h-4 w-4' />
                  Deductions Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {Array.from(new Set(filteredRecords.filter(r => r.headType === 'Deduction').map(r => r.salaryHead))).map((head) => {
                    const headTotal = filteredRecords
                      .filter(r => r.salaryHead === head && r.headType === 'Deduction')
                      .reduce((sum, r) => sum + r.totalAmount, 0);
                    
                    return (
                      <div key={head} className='flex justify-between items-center'>
                        <span className='text-sm'>{head}</span>
                        <span className='text-sm font-semibold text-red-600'>₹{headTotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}




