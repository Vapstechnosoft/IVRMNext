'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, X, Shield, Download, Printer, TrendingUp } from 'lucide-react';
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

// ESI report data structure
interface ESIRecord extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupTypeId: number;
  departmentId: number;
  designationId: number;
  departmentName: string;
  designationName: string;
  esiNumber: string;
  grossSalary: number;
  esiEligibleSalary: number;
  employeeESI: number;
  employerESI: number;
  totalESI: number;
  month: string;
  year: string;
  workingDays: number;
  presentDays: number;
  esiStatus: 'Active' | 'Inactive' | 'Exempted';
}

// Report filters
interface ESIReportFilters {
  groupType: string;
  department: string;
  designation: string;
  month: string;
  year: string;
}

export default function ESIReportPage() {
  // Database instances
  const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
  const departmentDB = createLocalCrud<Department>('master:department');
  const designationDB = createLocalCrud<Designation>('master:designation');
  const esiDB = createLocalCrud<ESIRecord>('report:esi');

  // State
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [esiRecords, setESIRecords] = useState<ESIRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ESIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState<ESIReportFilters>({
    groupType: 'All',
    department: 'All',
    designation: 'All',
    month: '',
    year: ''
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setGroupTypes(groupTypeDB.list().filter(g => g.isActive));
      setDepartments(departmentDB.list().filter(d => d.isActive));
      setDesignations(designationDB.list().filter(d => d.isActive));
      
      // Load ESI records
      let recordList = esiDB.list();
      if (recordList.length === 0) {
        const mockData = generateMockESIData();
        mockData.forEach(record => esiDB.create(record));
        recordList = esiDB.list(); // Reload data after creating mock records
      }
      setESIRecords(recordList);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock ESI data
  const generateMockESIData = (): Omit<ESIRecord, 'id' | 'createdAt'>[] => {
    const employees = [
      { code: 'EMP001', name: 'MR SUDIPTA RANJAN BHADURI', groupTypeId: 1, departmentId: 1, designationId: 1, deptName: 'JUNIOR SCHOOL', desigName: 'Assistant Teacher' },
      { code: 'EMP002', name: 'MS RUPLEKHA CHATTERJEE', groupTypeId: 1, departmentId: 2, designationId: 2, deptName: 'OFFICE STAFF', desigName: 'Principal' },
      { code: 'EMP003', name: 'MR JOHN SHAH', groupTypeId: 2, departmentId: 1, designationId: 1, deptName: 'JUNIOR SCHOOL', desigName: 'Assistant Teacher' },
      { code: 'EMP004', name: 'MRS BHASWATI DAS', groupTypeId: 2, departmentId: 2, designationId: 2, deptName: 'SENIOR SCHOOL', desigName: 'Teacher Helper' },
      { code: 'EMP005', name: 'MR SANTANU MUKHERJEE', groupTypeId: 1, departmentId: 1, designationId: 2, deptName: 'SERVICE STAFF', desigName: 'System Manager' }
    ];

    const mockRecords: Omit<ESIRecord, 'id' | 'createdAt'>[] = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    employees.forEach((emp, empIndex) => {
      months.forEach((month, monthIndex) => {
        const grossSalary = 25000 + (empIndex * 8000) + (Math.random() * 5000);
        const esiEligibleSalary = grossSalary > 21000 ? 21000 : grossSalary; // ESI cap
        const employeeESI = esiEligibleSalary * 0.0075; // 0.75% employee contribution
        const employerESI = esiEligibleSalary * 0.0325; // 3.25% employer contribution
        const totalESI = employeeESI + employerESI;

        mockRecords.push({
          employeeCode: emp.code,
          employeeName: emp.name,
          groupTypeId: emp.groupTypeId,
          departmentId: emp.departmentId,
          designationId: emp.designationId,
          departmentName: emp.deptName,
          designationName: emp.desigName,
          esiNumber: `ESI${emp.code.slice(-3)}${monthIndex + 1}`,
          grossSalary: Math.round(grossSalary),
          esiEligibleSalary: Math.round(esiEligibleSalary),
          employeeESI: Math.round(employeeESI),
          employerESI: Math.round(employerESI),
          totalESI: Math.round(totalESI),
          month: month,
          year: '2025',
          workingDays: 26,
          presentDays: 24 + Math.floor(Math.random() * 3),
          esiStatus: grossSalary > 21000 ? 'Active' : (grossSalary < 10000 ? 'Exempted' : 'Active')
        });
      });
    });

    return mockRecords;
  };

  // Cascading filter logic
  const availableDepartments = useMemo(() => {
    if (filters.groupType === 'All') return departments;
    // In a real app, departments would be filtered by groupType relationship
    return departments;
  }, [filters.groupType, departments]);

  const availableDesignations = useMemo(() => {
    if (filters.department === 'All') return designations;
    // In a real app, designations would be filtered by department relationship
    return designations;
  }, [filters.department, designations]);

  // Filter ESI records based on selected criteria
  useEffect(() => {
    let filtered = esiRecords;

    if (filters.groupType !== 'All') {
      const selectedGroupType = groupTypes.find(g => g.groupType === filters.groupType);
      if (selectedGroupType) {
        filtered = filtered.filter(record => record.groupTypeId === selectedGroupType.id);
      }
    }

    if (filters.department !== 'All') {
      const selectedDepartment = departments.find(d => d.departmentName === filters.department);
      if (selectedDepartment) {
        filtered = filtered.filter(record => record.departmentId === selectedDepartment.id);
      }
    }

    if (filters.designation !== 'All') {
      const selectedDesignation = designations.find(d => d.designationName === filters.designation);
      if (selectedDesignation) {
        filtered = filtered.filter(record => record.designationId === selectedDesignation.id);
      }
    }

    if (filters.month) {
      filtered = filtered.filter(record => record.month === filters.month);
    }

    if (filters.year) {
      filtered = filtered.filter(record => record.year === filters.year);
    }

    setFilteredRecords(filtered);
  }, [filters, esiRecords, groupTypes, departments, designations]);

  const handleFilterChange = (key: keyof ESIReportFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters when parent changes
    if (key === 'groupType') {
      newFilters.department = 'All';
      newFilters.designation = 'All';
    } else if (key === 'department') {
      newFilters.designation = 'All';
    }
    
    setFilters(newFilters);
  };

  const handleSearch = () => {
    if (!filters.month || !filters.year) {
      toast.error('Please select month and year');
      return;
    }
    setShowReport(true);
    toast.success('ESI report generated');
  };

  const handleCancel = () => {
    setFilters({
      groupType: 'All',
      department: 'All',
      designation: 'All',
      month: '',
      year: ''
    });
    setShowReport(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('ESI report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate ESI totals
  const esiTotals = useMemo(() => {
    return filteredRecords.reduce((acc, record) => ({
      grossSalary: acc.grossSalary + record.grossSalary,
      esiEligibleSalary: acc.esiEligibleSalary + record.esiEligibleSalary,
      employeeESI: acc.employeeESI + record.employeeESI,
      employerESI: acc.employerESI + record.employerESI,
      totalESI: acc.totalESI + record.totalESI
    }), {
      grossSalary: 0,
      esiEligibleSalary: 0,
      employeeESI: 0,
      employerESI: 0,
      totalESI: 0
    });
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<ESIRecord>[] = [
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
      accessorKey: 'esiNumber',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Number' />,
      cell: ({ row }) => <div className="font-mono">{row.getValue('esiNumber')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'grossSalary',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Salary' />,
      cell: ({ row }) => <div>₹{(row.getValue('grossSalary') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'esiEligibleSalary',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Eligible Salary' />,
      cell: ({ row }) => <div>₹{(row.getValue('esiEligibleSalary') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'employeeESI',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employee ESI (0.75%)' />,
      cell: ({ row }) => <div>₹{(row.getValue('employeeESI') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'employerESI',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employer ESI (3.25%)' />,
      cell: ({ row }) => <div>₹{(row.getValue('employerESI') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'totalESI',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total ESI' />,
      cell: ({ row }) => <div className="font-semibold">₹{(row.getValue('totalESI') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'esiStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ESI Status' />,
      cell: ({ row }) => {
        const status = row.getValue('esiStatus') as string;
        return (
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            status === 'Active' ? 'bg-green-100 text-green-800' :
            status === 'Inactive' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
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
        <Heading title='ESI Report' description='Generate Employee State Insurance contribution reports' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <Shield className='h-5 w-5' />
          ESI REPORT
        </div>
        
        {/* Filter Section - Row 1: Cascading Dropdowns */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Group Type Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Group Type: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.groupType} onValueChange={(value) => handleFilterChange('groupType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {groupTypes.map((group) => (
                  <SelectItem key={group.id} value={group.groupType}>
                    {group.groupType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Department: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.departmentName}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Designation Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Designation: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.designation} onValueChange={(value) => handleFilterChange('designation', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {availableDesignations.map((desig) => (
                  <SelectItem key={desig.id} value={desig.designationName}>
                    {desig.designationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Section - Row 2: Month and Year */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Month Filter */}
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

          {/* Year Filter */}
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
                ESI Report - {filters.month} {filters.year}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Total Records: {filteredRecords.length} employees | 
                ESI Eligible: {filteredRecords.filter(r => r.esiStatus === 'Active').length}
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

          {/* ESI Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total Gross Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>₹{esiTotals.grossSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>ESI Eligible Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>₹{esiTotals.esiEligibleSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Employee ESI (0.75%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-blue-600'>₹{esiTotals.employeeESI.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Employer ESI (3.25%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-orange-600'>₹{esiTotals.employerESI.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Total ESI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{esiTotals.totalESI.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* ESI Status Summary */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Active ESI Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>
                  {filteredRecords.filter(r => r.esiStatus === 'Active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Inactive Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-red-600'>
                  {filteredRecords.filter(r => r.esiStatus === 'Inactive').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Exempted Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-gray-600'>
                  {filteredRecords.filter(r => r.esiStatus === 'Exempted').length}
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



