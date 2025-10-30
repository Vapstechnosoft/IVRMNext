'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import type { ColumnDef } from '@tanstack/react-table';
import { Search, X, FileText, Download, Printer } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';

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

// Employee salary slip data structure
interface EmployeeSalarySlip extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupTypeId: number;
  departmentId: number;
  designationId: number;
  departmentName: string;
  designationName: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  lopDays: number;
  leavesTaken: number;
  panCardNo: string;
  bankName: string;
  accountNumber: string;
  workingDays: number;
  presentDays: number;
  isSelected: boolean;
}

// Report filters and options
interface SalarySlipFilters {
  groupType: string;
  department: string;
  designation: string;
  month: string;
  year: string;
  slipPerPage: string;
  options: {
    lopDays: boolean;
    leaveDetails: boolean;
    panCardNo: boolean;
    bankDetails: boolean;
  };
}

export default function SalarySlipReportPage() {
  // Database instances
  const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
  const departmentDB = createLocalCrud<Department>('master:department');
  const designationDB = createLocalCrud<Designation>('master:designation');
  const salarySlipDB = createLocalCrud<EmployeeSalarySlip>('report:salary-slip');

  // State
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [salarySlips, setSalarySlips] = useState<EmployeeSalarySlip[]>([]);
  const [filteredSlips, setFilteredSlips] = useState<EmployeeSalarySlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState<SalarySlipFilters>({
    groupType: 'All',
    department: 'All',
    designation: 'All',
    month: '',
    year: '',
    slipPerPage: '',
    options: {
      lopDays: false,
      leaveDetails: false,
      panCardNo: false,
      bankDetails: false
    }
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
      
      // Load salary slip data
      let slipList = salarySlipDB.list();
      if (slipList.length === 0) {
        const mockData = generateMockSalarySlips();
        mockData.forEach(slip => salarySlipDB.create(slip));
        slipList = salarySlipDB.list(); // Reload data after creating mock records
      }
      setSalarySlips(slipList);
      setFilteredSlips(slipList);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock salary slip data
  const generateMockSalarySlips = (): Omit<EmployeeSalarySlip, 'id' | 'createdAt'>[] => {
    const employees = [
      { code: 'EMP001', name: 'MR SUDIPTA RANJAN BHADURI', groupTypeId: 1, departmentId: 1, designationId: 1, deptName: 'JUNIOR SCHOOL', desigName: 'Assistant Teacher' },
      { code: 'EMP002', name: 'MS RUPLEKHA CHATTERJEE', groupTypeId: 1, departmentId: 2, designationId: 2, deptName: 'OFFICE STAFF', desigName: 'Principal' },
      { code: 'EMP003', name: 'MR JOHN SHAH', groupTypeId: 2, departmentId: 1, designationId: 1, deptName: 'JUNIOR SCHOOL', desigName: 'Assistant Teacher' },
      { code: 'EMP004', name: 'MRS BHASWATI DAS', groupTypeId: 2, departmentId: 2, designationId: 2, deptName: 'SENIOR SCHOOL', desigName: 'Teacher Helper' },
      { code: 'EMP005', name: 'MR SANTANU MUKHERJEE', groupTypeId: 1, departmentId: 1, designationId: 2, deptName: 'SERVICE STAFF', desigName: 'System Manager' }
    ];

    const mockSlips: Omit<EmployeeSalarySlip, 'id' | 'createdAt'>[] = [];

    employees.forEach((emp, index) => {
      const basicSalary = 40000 + (index * 5000);
      const allowances = basicSalary * 0.3;
      const deductions = basicSalary * 0.15;
      const grossSalary = basicSalary + allowances;
      const netSalary = grossSalary - deductions;

      mockSlips.push({
        employeeCode: emp.code,
        employeeName: emp.name,
        groupTypeId: emp.groupTypeId,
        departmentId: emp.departmentId,
        designationId: emp.designationId,
        departmentName: emp.deptName,
        designationName: emp.desigName,
        month: 'September',
        year: '2025',
        basicSalary: Math.round(basicSalary),
        allowances: Math.round(allowances),
        deductions: Math.round(deductions),
        grossSalary: Math.round(grossSalary),
        netSalary: Math.round(netSalary),
        lopDays: Math.floor(Math.random() * 3),
        leavesTaken: Math.floor(Math.random() * 5),
        panCardNo: `ABCDE${1234 + index}F`,
        bankName: ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'][index],
        accountNumber: `${12345678901 + index}`,
        workingDays: 26,
        presentDays: 24 + Math.floor(Math.random() * 3),
        isSelected: false
      });
    });

    return mockSlips;
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

  // Filter salary slips based on selected criteria and search term
  useEffect(() => {
    let filtered = salarySlips;

    // Apply dropdown filters
    if (filters.groupType !== 'All') {
      const selectedGroupType = groupTypes.find(g => g.groupType === filters.groupType);
      if (selectedGroupType) {
        filtered = filtered.filter(slip => slip.groupTypeId === selectedGroupType.id);
      }
    }

    if (filters.department !== 'All') {
      const selectedDepartment = departments.find(d => d.departmentName === filters.department);
      if (selectedDepartment) {
        filtered = filtered.filter(slip => slip.departmentId === selectedDepartment.id);
      }
    }

    if (filters.designation !== 'All') {
      const selectedDesignation = designations.find(d => d.designationName === filters.designation);
      if (selectedDesignation) {
        filtered = filtered.filter(slip => slip.designationId === selectedDesignation.id);
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(slip => 
        slip.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSlips(filtered);
  }, [filters, salarySlips, groupTypes, departments, designations, searchTerm]);

  const handleFilterChange = (key: keyof Omit<SalarySlipFilters, 'options'>, value: string) => {
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

  const handleOptionChange = (option: keyof SalarySlipFilters['options'], checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: checked
      }
    }));
  };

  const handleSelectEmployee = (employeeId: number, checked: boolean) => {
    const updatedSlips = salarySlips.map(slip => 
      slip.id === employeeId ? { ...slip, isSelected: checked } : slip
    );
    setSalarySlips(updatedSlips);
    
    // Update in database
    const slip = updatedSlips.find(s => s.id === employeeId);
    if (slip) {
      salarySlipDB.update(employeeId, slip);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedSlips = salarySlips.map(slip => ({ ...slip, isSelected: checked }));
    setSalarySlips(updatedSlips);
    // Update in database
    updatedSlips.forEach(slip => salarySlipDB.update(slip.id, slip));
  };

  const handleGenerateSlip = () => {
    const selectedSlips = filteredSlips.filter(slip => slip.isSelected);
    if (selectedSlips.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    if (!filters.month || !filters.year) {
      toast.error('Please select month and year');
      return;
    }

    toast.success(`Salary slips generated for ${selectedSlips.length} employee(s)`);
  };

  const handleCancel = () => {
    setFilters({
      groupType: 'All',
      department: 'All',
      designation: 'All',
      month: '',
      year: '',
      slipPerPage: '',
      options: {
        lopDays: false,
        leaveDetails: false,
        panCardNo: false,
        bankDetails: false
      }
    });
    setSearchTerm('');
    
    // Clear all selections
    const updatedSlips = salarySlips.map(slip => ({ ...slip, isSelected: false }));
    setSalarySlips(updatedSlips);
    updatedSlips.forEach(slip => salarySlipDB.update(slip.id, slip));
    
    toast.info('Filters and selections cleared');
  };

  const selectedCount = filteredSlips.filter(slip => slip.isSelected).length;

  // Table columns
  const columns: ColumnDef<EmployeeSalarySlip>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value);
          }}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox 
          checked={row.original.isSelected} 
          onCheckedChange={(value) => handleSelectEmployee(row.original.id, !!value)} 
          aria-label='Select row' 
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 24
    },
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No' />,
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
    }
  ];

  return (
    <div className='min-h-screen'>
      <div className='container p-1 space-y-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <Heading title='Salary Slip' description='Generate employee salary slips with customizable options' />
          </div>
          <Button
            type='button'
            onClick={handleGenerateSlip}
            size='lg'
            className='transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit'>
            <FileText className='h-4 w-4' />
            Generate Slips
          </Button>
        </div>

        {/* Generate Employee Salary Slip Section */}
        <CollapsibleSection
          title='Salary Slip Configuration'
          description='Configure filters and options for salary slip generation'
          defaultOpen={true}
          variant='default'
          size='lg'
          className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
        
        {/* Filter Section - Row 1 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Group Type Filter */}
          <div className='space-y-2'>
            <Label>Group Type *</Label>
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
            <Label>Department *</Label>
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
            <Label>Designation *</Label>
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

        {/* Filter Section - Row 2 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Month Filter */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>Month</label>
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
            <label className='text-sm font-medium text-foreground'>Year</label>
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

          {/* Slip/page Filter */}
          <div className='space-y-2'>
            <Label>Slip/page</Label>
            <Select value={filters.slipPerPage} onValueChange={(value) => handleFilterChange('slipPerPage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 slip per page</SelectItem>
                <SelectItem value="2">2 slips per page</SelectItem>
                <SelectItem value="3">3 slips per page</SelectItem>
                <SelectItem value="4">4 slips per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options Section */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <Checkbox
              checked={filters.options.lopDays}
              onCheckedChange={(checked) => handleOptionChange('lopDays', !!checked)}
            />
            LOP Days
          </label>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <Checkbox
              checked={filters.options.leaveDetails}
              onCheckedChange={(checked) => handleOptionChange('leaveDetails', !!checked)}
            />
            Leave Details
          </label>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <Checkbox
              checked={filters.options.panCardNo}
              onCheckedChange={(checked) => handleOptionChange('panCardNo', !!checked)}
            />
            Pan Card No.
          </label>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <Checkbox
              checked={filters.options.bankDetails}
              onCheckedChange={(checked) => handleOptionChange('bankDetails', !!checked)}
            />
            Bank Details
          </label>
        </div>

        {/* Employee Table with Search */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium text-foreground'>
              Employee List ({filteredSlips.length} employees)
            </div>
            <div className='flex items-center gap-4'>
              <Input
                placeholder='search here...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-64'
              />
              {selectedCount > 0 && (
                <span className='text-sm text-muted-foreground'>
                  {selectedCount} selected
                </span>
              )}
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            isLoading={isLoading}
            columns={columns}
            data={filteredSlips}
            totalItems={filteredSlips.length}
            showViewOptions={true}
            columnPinning={{ left: ['select', 'id'] }}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
          <Button variant='outline' onClick={handleCancel}>
            <X className='mr-2 h-4 w-4' />
            CANCEL
          </Button>
          <Button 
            onClick={handleGenerateSlip} 
            disabled={selectedCount === 0}
          >
            GENERATE SLIP
          </Button>
        </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}



