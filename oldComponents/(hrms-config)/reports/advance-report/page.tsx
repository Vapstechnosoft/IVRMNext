'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Download, Printer, Search, Calculator, Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';

// Employee Advance Report data structure
interface EmployeeAdvanceRecord extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupType: string;
  department: string;
  designation: string;
  advanceRequestDate: string;
  advanceType: 'Salary Advance' | 'Festival Advance' | 'Medical Advance' | 'Emergency Advance' | 'Travel Advance';
  advanceAmount: number;
  approvedAmount: number;
  advanceReason: string;
  approvalDate: string;
  approvedBy: string;
  recoveryStartDate: string;
  recoveryEndDate: string;
  totalInstallments: number;
  installmentAmount: number;
  recoveredAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Partially Recovered' | 'Fully Recovered';
  month: string;
  year: string;
  basicSalary: number;
  advancePercentage: number;
}

// Advance Summary
interface AdvanceSummary {
  totalEmployees: number;
  totalAdvanceRequests: number;
  totalAdvanceAmount: number;
  totalApprovedAmount: number;
  totalRecoveredAmount: number;
  totalRemainingAmount: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  fullyRecoveredRequests: number;
  averageAdvanceAmount: number;
}

// Advance Type Summary
interface AdvanceTypeSummary {
  advanceType: string;
  totalRequests: number;
  totalAmount: number;
  approvedRequests: number;
  approvedAmount: number;
  recoveredAmount: number;
  remainingAmount: number;
}

// Filter options
interface FilterOptions {
  groupTypes: string[];
  departments: string[];
  designations: string[];
}

// Report filters
interface AdvanceFilters {
  selectedGroupTypes: string[];
  selectedDepartments: string[];
  selectedDesignations: string[];
  month: string;
  year: string;
}

export default function AdvanceReportPage() {
  // Database instances
  const advanceDB = createLocalCrud<EmployeeAdvanceRecord>('report:employee-advance');

  // State
  const [advanceRecords, setAdvanceRecords] = useState<EmployeeAdvanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EmployeeAdvanceRecord[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    groupTypes: [],
    departments: [],
    designations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState<AdvanceFilters>({
    selectedGroupTypes: [],
    selectedDepartments: [],
    selectedDesignations: [],
    month: '',
    year: ''
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load Employee Advance records
      let recordList = advanceDB.list();
      if (recordList.length === 0) {
        const mockData = generateMockAdvanceData();
        mockData.forEach(record => advanceDB.create(record));
        recordList = advanceDB.list(); // Reload data after creating mock records
      }
      setAdvanceRecords(recordList);
      
      // Extract filter options
      const groupTypes = [...new Set(recordList.map(r => r.groupType))];
      const departments = [...new Set(recordList.map(r => r.department))];
      const designations = [...new Set(recordList.map(r => r.designation))];
      
      setFilterOptions({
        groupTypes,
        departments,
        designations
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock Employee Advance data
  const generateMockAdvanceData = (): Omit<EmployeeAdvanceRecord, 'id' | 'createdAt'>[] => {
    const groupTypes = ['Test NON Teaching', 'Test Insurance', 'Teaching', 'Owner of the company', 'Non Teaching', 'Administrative'];
    const departments = ['Teaching', 'JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'Service Staff', 'Administrative', 'Principal'];
    const designations = ['Assistant Teacher', 'Principal', 'Vice Principal', 'Office Assistant', 'System Manager', 'Teacher Helper', 'Electrician'];
    const advanceTypes: ('Salary Advance' | 'Festival Advance' | 'Medical Advance' | 'Emergency Advance' | 'Travel Advance')[] = 
      ['Salary Advance', 'Festival Advance', 'Medical Advance', 'Emergency Advance', 'Travel Advance'];
    const statuses: ('Pending' | 'Approved' | 'Rejected' | 'Partially Recovered' | 'Fully Recovered')[] = 
      ['Pending', 'Approved', 'Rejected', 'Partially Recovered', 'Fully Recovered'];
    const approvers = ['HR Manager', 'Principal', 'Finance Head', 'Admin Manager'];
    const reasons = [
      'Medical emergency', 'Festival expenses', 'Home renovation', 'Child education fees', 
      'Marriage expenses', 'Travel expenses', 'Personal loan repayment', 'Family emergency'
    ];
    
    const employees = [
      'MR SUDIPTA RANJAN BHADURI', 'MS RUPLEKHA CHATTERJEE', 'MR JOHN SHAH', 'MRS BHASWATI DAS',
      'MR SANTANU MUKHERJEE', 'MRS PRIYA SHARMA', 'MR RAJESH KUMAR', 'MS ANITA SINGH',
      'MR AMIT KUMAR', 'MS DEEPIKA PATEL', 'MR ROHIT GUPTA', 'MRS KAVITA SINGH'
    ];

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mockRecords: Omit<EmployeeAdvanceRecord, 'id' | 'createdAt'>[] = [];

    employees.forEach((empName, empIndex) => {
      // Generate 1-3 advance requests per employee per year
      const numAdvances = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numAdvances; i++) {
        const month = months[Math.floor(Math.random() * months.length)];
        const basicSalary = 30000 + (empIndex * 3000) + (Math.random() * 10000);
        const advanceAmount = Math.floor(basicSalary * (0.2 + Math.random() * 0.5)); // 20-70% of basic salary
        const approvedAmount = Math.random() > 0.1 ? advanceAmount : advanceAmount * 0.8; // 90% approval rate
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const advanceType = advanceTypes[Math.floor(Math.random() * advanceTypes.length)];
        
        const requestDate = `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const approvalDate = status !== 'Pending' ? 
          `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '';
        
        const totalInstallments = Math.floor(Math.random() * 12) + 1; // 1-12 installments
        const installmentAmount = Math.floor(approvedAmount / totalInstallments);
        
        let recoveredAmount = 0;
        if (status === 'Fully Recovered') {
          recoveredAmount = approvedAmount;
        } else if (status === 'Partially Recovered') {
          recoveredAmount = Math.floor(approvedAmount * (0.1 + Math.random() * 0.8));
        }
        
        const remainingAmount = approvedAmount - recoveredAmount;
        const advancePercentage = Math.round((advanceAmount / basicSalary) * 100);

        mockRecords.push({
          employeeCode: `EMP${String(empIndex + 1).padStart(3, '0')}`,
          employeeName: empName,
          groupType: groupTypes[empIndex % groupTypes.length],
          department: departments[empIndex % departments.length],
          designation: designations[empIndex % designations.length],
          advanceRequestDate: requestDate,
          advanceType: advanceType,
          advanceAmount: Math.round(advanceAmount),
          approvedAmount: Math.round(approvedAmount),
          advanceReason: reasons[Math.floor(Math.random() * reasons.length)],
          approvalDate: approvalDate,
          approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
          recoveryStartDate: status === 'Approved' || status.includes('Recovered') ? 
            `2025-${String(months.indexOf(month) + 2).padStart(2, '0')}-01` : '',
          recoveryEndDate: status === 'Approved' || status.includes('Recovered') ? 
            `2025-${String(months.indexOf(month) + totalInstallments + 1).padStart(2, '0')}-01` : '',
          totalInstallments: totalInstallments,
          installmentAmount: installmentAmount,
          recoveredAmount: Math.round(recoveredAmount),
          remainingAmount: Math.round(remainingAmount),
          status: status,
          month: month,
          year: '2025',
          basicSalary: Math.round(basicSalary),
          advancePercentage: advancePercentage
        });
      }
    });

    return mockRecords;
  };

  // Filter records based on selected criteria
  useEffect(() => {
    let filtered = advanceRecords;

    // Filter by group types
    if (filters.selectedGroupTypes.length > 0) {
      filtered = filtered.filter(record => filters.selectedGroupTypes.includes(record.groupType));
    }

    // Filter by departments
    if (filters.selectedDepartments.length > 0) {
      filtered = filtered.filter(record => filters.selectedDepartments.includes(record.department));
    }

    // Filter by designations
    if (filters.selectedDesignations.length > 0) {
      filtered = filtered.filter(record => filters.selectedDesignations.includes(record.designation));
    }

    // Filter by month
    if (filters.month) {
      filtered = filtered.filter(record => record.month === filters.month);
    }

    // Filter by year
    if (filters.year) {
      filtered = filtered.filter(record => record.year === filters.year);
    }

    setFilteredRecords(filtered);
  }, [filters, advanceRecords]);

  const handleCheckboxChange = (category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleSelectAllChange = (category: 'selectedGroupTypes' | 'selectedDepartments' | 'selectedDesignations', checked: boolean) => {
    let allOptions: string[] = [];
    
    switch (category) {
      case 'selectedGroupTypes':
        allOptions = filterOptions.groupTypes;
        break;
      case 'selectedDepartments':
        allOptions = filterOptions.departments;
        break;
      case 'selectedDesignations':
        allOptions = filterOptions.designations;
        break;
    }

    setFilters(prev => ({
      ...prev,
      [category]: checked ? allOptions : []
    }));
  };

  const handleFilterChange = (key: keyof AdvanceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setShowReport(true);
    toast.success('Employee Advance Report generated');
  };

  const handleCancel = () => {
    setFilters({
      selectedGroupTypes: [],
      selectedDepartments: [],
      selectedDesignations: [],
      month: '',
      year: ''
    });
    setShowReport(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('Employee Advance Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate Advance summary
  const advanceSummary: AdvanceSummary = useMemo(() => {
    const uniqueEmployees = [...new Set(filteredRecords.map(record => record.employeeCode))];
    const pendingRequests = filteredRecords.filter(record => record.status === 'Pending').length;
    const approvedRequests = filteredRecords.filter(record => record.status === 'Approved' || record.status.includes('Recovered')).length;
    const rejectedRequests = filteredRecords.filter(record => record.status === 'Rejected').length;
    const fullyRecoveredRequests = filteredRecords.filter(record => record.status === 'Fully Recovered').length;

    const summary = filteredRecords.reduce((acc, record) => ({
      totalEmployees: uniqueEmployees.length,
      totalAdvanceRequests: filteredRecords.length,
      totalAdvanceAmount: acc.totalAdvanceAmount + record.advanceAmount,
      totalApprovedAmount: acc.totalApprovedAmount + record.approvedAmount,
      totalRecoveredAmount: acc.totalRecoveredAmount + record.recoveredAmount,
      totalRemainingAmount: acc.totalRemainingAmount + record.remainingAmount,
      pendingRequests: pendingRequests,
      approvedRequests: approvedRequests,
      rejectedRequests: rejectedRequests,
      fullyRecoveredRequests: fullyRecoveredRequests,
      averageAdvanceAmount: 0 // Will be calculated after
    }), {
      totalEmployees: 0,
      totalAdvanceRequests: 0,
      totalAdvanceAmount: 0,
      totalApprovedAmount: 0,
      totalRecoveredAmount: 0,
      totalRemainingAmount: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      fullyRecoveredRequests: 0,
      averageAdvanceAmount: 0
    });

    summary.averageAdvanceAmount = filteredRecords.length > 0 ? Math.round(summary.totalAdvanceAmount / filteredRecords.length) : 0;

    return summary;
  }, [filteredRecords]);

  // Calculate Advance Type summary
  const advanceTypeSummaries: AdvanceTypeSummary[] = useMemo(() => {
    const typeMap = new Map<string, EmployeeAdvanceRecord[]>();
    
    filteredRecords.forEach(record => {
      if (!typeMap.has(record.advanceType)) {
        typeMap.set(record.advanceType, []);
      }
      typeMap.get(record.advanceType)!.push(record);
    });

    return Array.from(typeMap.entries()).map(([advanceType, records]) => {
      const approvedRecords = records.filter(r => r.status === 'Approved' || r.status.includes('Recovered'));
      
      return {
        advanceType,
        totalRequests: records.length,
        totalAmount: records.reduce((sum, r) => sum + r.advanceAmount, 0),
        approvedRequests: approvedRecords.length,
        approvedAmount: records.reduce((sum, r) => sum + r.approvedAmount, 0),
        recoveredAmount: records.reduce((sum, r) => sum + r.recoveredAmount, 0),
        remainingAmount: records.reduce((sum, r) => sum + r.remainingAmount, 0)
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<EmployeeAdvanceRecord>[] = [
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
      accessorKey: 'department',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
      cell: ({ row }) => <div className="text-sm">{row.getValue('department')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'advanceType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Type' />,
      cell: ({ row }) => {
        const type = row.getValue('advanceType') as string;
        return (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'advanceAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Amount' />,
      cell: ({ row }) => <div>₹{(row.getValue('advanceAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'approvedAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Approved Amount' />,
      cell: ({ row }) => <div className="text-green-600">₹{(row.getValue('approvedAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'recoveredAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Recovered Amount' />,
      cell: ({ row }) => <div className="text-blue-600">₹{(row.getValue('recoveredAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'remainingAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Remaining Amount' />,
      cell: ({ row }) => <div className="text-orange-600">₹{(row.getValue('remainingAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'Approved' ? 'default' : 
                      status === 'Pending' ? 'secondary' : 
                      status === 'Rejected' ? 'destructive' : 
                      status === 'Fully Recovered' ? 'default' : 'outline';
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true
    }
  ];

  // Advance type summary columns
  const typeColumns: ColumnDef<AdvanceTypeSummary>[] = [
    {
      accessorKey: 'advanceType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Type' />,
      cell: ({ row }) => <div className="font-semibold">{row.getValue('advanceType')}</div>,
      enableSorting: true,
      enableHiding: false
    },
    {
      accessorKey: 'totalRequests',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Requests' />,
      cell: ({ row }) => <div className="text-center">{row.getValue('totalRequests')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Amount' />,
      cell: ({ row }) => <div>₹{(row.getValue('totalAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'approvedRequests',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Approved Requests' />,
      cell: ({ row }) => <div className="text-green-600 text-center">{row.getValue('approvedRequests')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'approvedAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Approved Amount' />,
      cell: ({ row }) => <div className="text-green-600">₹{(row.getValue('approvedAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'recoveredAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Recovered Amount' />,
      cell: ({ row }) => <div className="text-blue-600">₹{(row.getValue('recoveredAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'remainingAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Remaining Amount' />,
      cell: ({ row }) => <div className="text-orange-600">₹{(row.getValue('remainingAmount') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='Employee Advance Report' description='Comprehensive report for employee advance requests, approvals, and recovery status' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <FileText className='h-5 w-5' />
          EMPLOYEE ADVANCE REPORT
        </div>
        
        {/* Filter Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Group Type Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-foreground'>Group Type:</label>
              <span className='text-red-500'>*</span>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id="all-groups"
                  checked={filters.selectedGroupTypes.length === filterOptions.groupTypes.length}
                  onCheckedChange={(checked) => handleSelectAllChange('selectedGroupTypes', checked as boolean)}
                />
                <label htmlFor="all-groups" className='text-sm cursor-pointer'>All</label>
              </div>
            </div>
            <div className='border rounded-lg p-3 h-32 overflow-y-auto space-y-2'>
              {filterOptions.groupTypes.map((groupType) => (
                <div key={groupType} className='flex items-center gap-2'>
                  <Checkbox
                    id={`group-${groupType}`}
                    checked={filters.selectedGroupTypes.includes(groupType)}
                    onCheckedChange={(checked) => handleCheckboxChange('selectedGroupTypes', groupType, checked as boolean)}
                  />
                  <label htmlFor={`group-${groupType}`} className='text-sm cursor-pointer'>
                    {groupType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Department Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-foreground'>Department:</label>
              <span className='text-red-500'>*</span>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id="all-departments"
                  checked={filters.selectedDepartments.length === filterOptions.departments.length}
                  onCheckedChange={(checked) => handleSelectAllChange('selectedDepartments', checked as boolean)}
                />
                <label htmlFor="all-departments" className='text-sm cursor-pointer'>All</label>
              </div>
            </div>
            <div className='border rounded-lg p-3 h-32 overflow-y-auto space-y-2'>
              {filterOptions.departments.map((department) => (
                <div key={department} className='flex items-center gap-2'>
                  <Checkbox
                    id={`dept-${department}`}
                    checked={filters.selectedDepartments.includes(department)}
                    onCheckedChange={(checked) => handleCheckboxChange('selectedDepartments', department, checked as boolean)}
                  />
                  <label htmlFor={`dept-${department}`} className='text-sm cursor-pointer'>
                    {department}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Designation Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium text-foreground'>Designation:</label>
              <span className='text-red-500'>*</span>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id="all-designations"
                  checked={filters.selectedDesignations.length === filterOptions.designations.length}
                  onCheckedChange={(checked) => handleSelectAllChange('selectedDesignations', checked as boolean)}
                />
                <label htmlFor="all-designations" className='text-sm cursor-pointer'>All</label>
              </div>
            </div>
            <div className='border rounded-lg p-3 h-32 overflow-y-auto space-y-2'>
              {filterOptions.designations.map((designation) => (
                <div key={designation} className='flex items-center gap-2'>
                  <Checkbox
                    id={`desig-${designation}`}
                    checked={filters.selectedDesignations.includes(designation)}
                    onCheckedChange={(checked) => handleCheckboxChange('selectedDesignations', designation, checked as boolean)}
                  />
                  <label htmlFor={`desig-${designation}`} className='text-sm cursor-pointer'>
                    {designation}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        <div className='flex items-center justify-center gap-6 pt-4'>
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
          <Button onClick={handleSearch}>
            <Search className='mr-2 h-4 w-4' />
            SEARCH
          </Button>
          <Button variant='outline' onClick={handleCancel}>
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
                Employee Advance Report - {filters.month} {filters.year}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Total Requests: {filteredRecords.length} | 
                Total Amount: ₹{advanceSummary.totalAdvanceAmount.toLocaleString()} | 
                Pending: {advanceSummary.pendingRequests}
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

          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <Users className='h-3 w-3' />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>{advanceSummary.totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <CreditCard className='h-3 w-3' />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-blue-600'>{advanceSummary.totalAdvanceRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <DollarSign className='h-3 w-3' />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-orange-600'>₹{advanceSummary.totalAdvanceAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  Recovered Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{advanceSummary.totalRecoveredAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Advance Type Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                Advance Type Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                isLoading={isLoading}
                columns={typeColumns}
                data={advanceTypeSummaries}
                totalItems={advanceTypeSummaries.length}
                showViewOptions={true}
                columnPinning={{ left: ['advanceType'] }}
              />
            </CardContent>
          </Card>

          {/* Detailed Summary */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Calculator className='h-4 w-4' />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Advance Amount:</span>
                  <span className='font-semibold'>₹{advanceSummary.totalAdvanceAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Approved Amount:</span>
                  <span className='font-semibold text-green-600'>₹{advanceSummary.totalApprovedAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Recovered Amount:</span>
                  <span className='font-semibold text-blue-600'>₹{advanceSummary.totalRecoveredAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Remaining Amount:</span>
                  <span className='font-semibold text-orange-600'>₹{advanceSummary.totalRemainingAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between border-t pt-2'>
                  <span className='text-sm'>Average Advance Amount:</span>
                  <span className='font-semibold text-purple-600'>₹{advanceSummary.averageAdvanceAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Request Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Pending Requests:</span>
                  <span className='font-semibold text-yellow-600'>{advanceSummary.pendingRequests}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Approved Requests:</span>
                  <span className='font-semibold text-green-600'>{advanceSummary.approvedRequests}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Rejected Requests:</span>
                  <span className='font-semibold text-red-600'>{advanceSummary.rejectedRequests}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Fully Recovered:</span>
                  <span className='font-semibold text-blue-600'>{advanceSummary.fullyRecoveredRequests}</span>
                </div>
                <div className='flex justify-between border-t pt-2'>
                  <span className='text-sm'>Report Period:</span>
                  <span className='font-semibold'>{filters.month} {filters.year}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Advance Details Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Employee Advance Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                isLoading={isLoading}
                columns={columns}
                data={filteredRecords}
                totalItems={filteredRecords.length}
                showViewOptions={true}
                columnPinning={{ left: ['id'] }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


