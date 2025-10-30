'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, Download, Printer, Search, Calculator, Users, DollarSign, TrendingUp, CreditCard, Percent } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createLocalCrud, type BaseEntity } from '../../../lib/localdb';

// Employee Loan Report data structure
interface EmployeeLoanRecord extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupType: string;
  department: string;
  designation: string;
  loanApplicationDate: string;
  loanType: 'Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Education Loan' | 'Emergency Loan' | 'Medical Loan';
  loanAmount: number;
  approvedAmount: number;
  interestRate: number;
  loanTenure: number; // in months
  emiAmount: number;
  loanStartDate: string;
  loanEndDate: string;
  totalInterest: number;
  totalPayableAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paidEMIs: number;
  remainingEMIs: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted';
  approvalDate: string;
  approvedBy: string;
  guarantor: string;
  loanPurpose: string;
  month: string;
  year: string;
  basicSalary: number;
  loanToSalaryRatio: number;
}

// Loan Summary
interface LoanSummary {
  totalEmployees: number;
  totalLoanRequests: number;
  totalLoanAmount: number;
  totalApprovedAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  totalInterestAmount: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  averageLoanAmount: number;
  averageInterestRate: number;
}

// Loan Type Summary
interface LoanTypeSummary {
  loanType: string;
  totalRequests: number;
  totalAmount: number;
  approvedRequests: number;
  approvedAmount: number;
  activeLoans: number;
  completedLoans: number;
  averageInterestRate: number;
  totalInterest: number;
}

// Filter options
interface FilterOptions {
  groupTypes: string[];
  departments: string[];
  designations: string[];
}

// Report filters
interface LoanFilters {
  reportScope: 'all' | 'individual';
  selectedGroupTypes: string[];
  selectedDepartments: string[];
  selectedDesignations: string[];
  month: string;
  year: string;
}

export default function LoanReportPage() {
  // Database instances
  const loanDB = createLocalCrud<EmployeeLoanRecord>('report:employee-loan');

  // State
  const [loanRecords, setLoanRecords] = useState<EmployeeLoanRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<EmployeeLoanRecord[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    groupTypes: [],
    departments: [],
    designations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const [filters, setFilters] = useState<LoanFilters>({
    reportScope: 'all',
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
      // Load Employee Loan records
      let recordList = loanDB.list();
      if (recordList.length === 0) {
        const mockData = generateMockLoanData();
        mockData.forEach(record => loanDB.create(record));
        recordList = loanDB.list(); // Reload data after creating mock records
      }
      setLoanRecords(recordList);
      
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

  // Generate mock Employee Loan data
  const generateMockLoanData = (): Omit<EmployeeLoanRecord, 'id' | 'createdAt'>[] => {
    const groupTypes = ['Test NON Teaching', 'Test Insurance', 'Teaching', 'Owner of the company', 'Non Teaching', 'Administrative'];
    const departments = ['Teaching', 'JUNIOR SCHOOL', 'SENIOR SCHOOL', 'OFFICE STAFF', 'Service Staff', 'Administrative', 'Chief executive officer'];
    const designations = ['Assistant Teacher', 'Principal', 'Vice Principal', 'Office Assistant', 'System Manager', 'Teacher Helper', 'Electrician'];
    const loanTypes: ('Personal Loan' | 'Home Loan' | 'Vehicle Loan' | 'Education Loan' | 'Emergency Loan' | 'Medical Loan')[] = 
      ['Personal Loan', 'Home Loan', 'Vehicle Loan', 'Education Loan', 'Emergency Loan', 'Medical Loan'];
    const statuses: ('Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Defaulted')[] = 
      ['Pending', 'Approved', 'Rejected', 'Active', 'Completed', 'Defaulted'];
    const approvers = ['HR Manager', 'Principal', 'Finance Head', 'Admin Manager', 'Board of Directors'];
    const purposes = [
      'Home construction', 'Vehicle purchase', 'Child education', 'Medical treatment', 
      'Personal expenses', 'Business investment', 'Debt consolidation', 'Home renovation'
    ];
    
    const employees = [
      'MR SUDIPTA RANJAN BHADURI', 'MS RUPLEKHA CHATTERJEE', 'MR JOHN SHAH', 'MRS BHASWATI DAS',
      'MR SANTANU MUKHERJEE', 'MRS PRIYA SHARMA', 'MR RAJESH KUMAR', 'MS ANITA SINGH',
      'MR AMIT KUMAR', 'MS DEEPIKA PATEL', 'MR ROHIT GUPTA', 'MRS KAVITA SINGH',
      'MR VIKRAM SHAH', 'MS NEHA AGARWAL'
    ];

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mockRecords: Omit<EmployeeLoanRecord, 'id' | 'createdAt'>[] = [];

    employees.forEach((empName, empIndex) => {
      // Generate 0-2 loan requests per employee per year
      const numLoans = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numLoans; i++) {
        const month = months[Math.floor(Math.random() * months.length)];
        const basicSalary = 35000 + (empIndex * 4000) + (Math.random() * 15000);
        const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
        
        // Loan amount varies by type
        let loanAmount = 0;
        let interestRate = 0;
        let loanTenure = 0;
        
        switch (loanType) {
          case 'Personal Loan':
            loanAmount = Math.floor(basicSalary * (2 + Math.random() * 4)); // 2-6x salary
            interestRate = 12 + Math.random() * 6; // 12-18%
            loanTenure = 12 + Math.floor(Math.random() * 48); // 1-4 years
            break;
          case 'Home Loan':
            loanAmount = Math.floor(basicSalary * (10 + Math.random() * 20)); // 10-30x salary
            interestRate = 8 + Math.random() * 4; // 8-12%
            loanTenure = 120 + Math.floor(Math.random() * 240); // 10-30 years
            break;
          case 'Vehicle Loan':
            loanAmount = Math.floor(basicSalary * (1 + Math.random() * 3)); // 1-4x salary
            interestRate = 9 + Math.random() * 5; // 9-14%
            loanTenure = 24 + Math.floor(Math.random() * 60); // 2-7 years
            break;
          case 'Education Loan':
            loanAmount = Math.floor(basicSalary * (2 + Math.random() * 6)); // 2-8x salary
            interestRate = 10 + Math.random() * 4; // 10-14%
            loanTenure = 60 + Math.floor(Math.random() * 120); // 5-15 years
            break;
          default:
            loanAmount = Math.floor(basicSalary * (1 + Math.random() * 3)); // 1-4x salary
            interestRate = 10 + Math.random() * 8; // 10-18%
            loanTenure = 12 + Math.floor(Math.random() * 36); // 1-3 years
        }
        
        const approvedAmount = Math.random() > 0.15 ? loanAmount : loanAmount * 0.8; // 85% approval rate
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const applicationDate = `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const approvalDate = status !== 'Pending' ? 
          `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '';
        
        const loanStartDate = status === 'Active' || status === 'Completed' ? 
          `2025-${String(months.indexOf(month) + 1).padStart(2, '0')}-01` : '';
        const loanEndDate = loanStartDate ? 
          `${2025 + Math.floor(loanTenure / 12)}-${String(((months.indexOf(month) + loanTenure) % 12) + 1).padStart(2, '0')}-01` : '';
        
        const totalInterest = (approvedAmount * interestRate * loanTenure) / (12 * 100);
        const totalPayableAmount = approvedAmount + totalInterest;
        const emiAmount = totalPayableAmount / loanTenure;
        
        let paidEMIs = 0;
        let paidAmount = 0;
        
        if (status === 'Active') {
          paidEMIs = Math.floor(Math.random() * (loanTenure * 0.7));
          paidAmount = paidEMIs * emiAmount;
        } else if (status === 'Completed') {
          paidEMIs = loanTenure;
          paidAmount = totalPayableAmount;
        } else if (status === 'Defaulted') {
          paidEMIs = Math.floor(Math.random() * (loanTenure * 0.3));
          paidAmount = paidEMIs * emiAmount;
        }
        
        const remainingEMIs = loanTenure - paidEMIs;
        const remainingAmount = totalPayableAmount - paidAmount;
        const loanToSalaryRatio = Math.round((loanAmount / basicSalary) * 100);

        mockRecords.push({
          employeeCode: `EMP${String(empIndex + 1).padStart(3, '0')}`,
          employeeName: empName,
          groupType: groupTypes[empIndex % groupTypes.length],
          department: departments[empIndex % departments.length],
          designation: designations[empIndex % designations.length],
          loanApplicationDate: applicationDate,
          loanType: loanType,
          loanAmount: Math.round(loanAmount),
          approvedAmount: Math.round(approvedAmount),
          interestRate: Math.round(interestRate * 100) / 100,
          loanTenure: loanTenure,
          emiAmount: Math.round(emiAmount),
          loanStartDate: loanStartDate,
          loanEndDate: loanEndDate,
          totalInterest: Math.round(totalInterest),
          totalPayableAmount: Math.round(totalPayableAmount),
          paidAmount: Math.round(paidAmount),
          remainingAmount: Math.round(remainingAmount),
          paidEMIs: paidEMIs,
          remainingEMIs: remainingEMIs,
          status: status,
          approvalDate: approvalDate,
          approvedBy: approvers[Math.floor(Math.random() * approvers.length)],
          guarantor: employees[Math.floor(Math.random() * employees.length)],
          loanPurpose: purposes[Math.floor(Math.random() * purposes.length)],
          month: month,
          year: '2025',
          basicSalary: Math.round(basicSalary),
          loanToSalaryRatio: loanToSalaryRatio
        });
      }
    });

    return mockRecords;
  };

  // Filter records based on selected criteria
  useEffect(() => {
    let filtered = loanRecords;

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
  }, [filters, loanRecords]);

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

  const handleFilterChange = (key: keyof LoanFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setShowReport(true);
    toast.success('Employee Loan Report generated');
  };

  const handleCancel = () => {
    setFilters({
      reportScope: 'all',
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
    toast.success('Employee Loan Report exported successfully');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Calculate Loan summary
  const loanSummary: LoanSummary = useMemo(() => {
    const uniqueEmployees = [...new Set(filteredRecords.map(record => record.employeeCode))];
    const pendingRequests = filteredRecords.filter(record => record.status === 'Pending').length;
    const approvedRequests = filteredRecords.filter(record => record.status === 'Approved' || record.status === 'Active' || record.status === 'Completed').length;
    const rejectedRequests = filteredRecords.filter(record => record.status === 'Rejected').length;
    const activeLoans = filteredRecords.filter(record => record.status === 'Active').length;
    const completedLoans = filteredRecords.filter(record => record.status === 'Completed').length;
    const defaultedLoans = filteredRecords.filter(record => record.status === 'Defaulted').length;

    const summary = filteredRecords.reduce((acc, record) => ({
      totalEmployees: uniqueEmployees.length,
      totalLoanRequests: filteredRecords.length,
      totalLoanAmount: acc.totalLoanAmount + record.loanAmount,
      totalApprovedAmount: acc.totalApprovedAmount + record.approvedAmount,
      totalPaidAmount: acc.totalPaidAmount + record.paidAmount,
      totalRemainingAmount: acc.totalRemainingAmount + record.remainingAmount,
      totalInterestAmount: acc.totalInterestAmount + record.totalInterest,
      pendingRequests: pendingRequests,
      approvedRequests: approvedRequests,
      rejectedRequests: rejectedRequests,
      activeLoans: activeLoans,
      completedLoans: completedLoans,
      defaultedLoans: defaultedLoans,
      averageLoanAmount: 0, // Will be calculated after
      averageInterestRate: acc.averageInterestRate + record.interestRate
    }), {
      totalEmployees: 0,
      totalLoanRequests: 0,
      totalLoanAmount: 0,
      totalApprovedAmount: 0,
      totalPaidAmount: 0,
      totalRemainingAmount: 0,
      totalInterestAmount: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      activeLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      averageLoanAmount: 0,
      averageInterestRate: 0
    });

    summary.averageLoanAmount = filteredRecords.length > 0 ? Math.round(summary.totalLoanAmount / filteredRecords.length) : 0;
    summary.averageInterestRate = filteredRecords.length > 0 ? Math.round((summary.averageInterestRate / filteredRecords.length) * 100) / 100 : 0;

    return summary;
  }, [filteredRecords]);

  // Calculate Loan Type summary
  const loanTypeSummaries: LoanTypeSummary[] = useMemo(() => {
    const typeMap = new Map<string, EmployeeLoanRecord[]>();
    
    filteredRecords.forEach(record => {
      if (!typeMap.has(record.loanType)) {
        typeMap.set(record.loanType, []);
      }
      typeMap.get(record.loanType)!.push(record);
    });

    return Array.from(typeMap.entries()).map(([loanType, records]) => {
      const approvedRecords = records.filter(r => r.status === 'Approved' || r.status === 'Active' || r.status === 'Completed');
      const activeLoans = records.filter(r => r.status === 'Active').length;
      const completedLoans = records.filter(r => r.status === 'Completed').length;
      const averageInterestRate = records.length > 0 ? 
        Math.round((records.reduce((sum, r) => sum + r.interestRate, 0) / records.length) * 100) / 100 : 0;
      
      return {
        loanType,
        totalRequests: records.length,
        totalAmount: records.reduce((sum, r) => sum + r.loanAmount, 0),
        approvedRequests: approvedRecords.length,
        approvedAmount: records.reduce((sum, r) => sum + r.approvedAmount, 0),
        activeLoans,
        completedLoans,
        averageInterestRate,
        totalInterest: records.reduce((sum, r) => sum + r.totalInterest, 0)
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredRecords]);

  // Table columns
  const columns: ColumnDef<EmployeeLoanRecord>[] = [
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
      accessorKey: 'loanType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />,
      cell: ({ row }) => {
        const type = row.getValue('loanType') as string;
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
      accessorKey: 'loanAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Amount' />,
      cell: ({ row }) => <div>₹{(row.getValue('loanAmount') as number).toLocaleString()}</div>,
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
      accessorKey: 'interestRate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Interest Rate' />,
      cell: ({ row }) => <div>{row.getValue('interestRate')}%</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'emiAmount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='EMI Amount' />,
      cell: ({ row }) => <div className="text-blue-600">₹{(row.getValue('emiAmount') as number).toLocaleString()}</div>,
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
        const variant = status === 'Approved' || status === 'Active' ? 'default' : 
                      status === 'Pending' ? 'secondary' : 
                      status === 'Rejected' || status === 'Defaulted' ? 'destructive' : 
                      status === 'Completed' ? 'default' : 'outline';
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

  // Loan type summary columns
  const typeColumns: ColumnDef<LoanTypeSummary>[] = [
    {
      accessorKey: 'loanType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' />,
      cell: ({ row }) => <div className="font-semibold">{row.getValue('loanType')}</div>,
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
      accessorKey: 'activeLoans',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Active Loans' />,
      cell: ({ row }) => <div className="text-blue-600 text-center">{row.getValue('activeLoans')}</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'averageInterestRate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Avg. Interest Rate' />,
      cell: ({ row }) => <div>{row.getValue('averageInterestRate')}%</div>,
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'totalInterest',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total Interest' />,
      cell: ({ row }) => <div className="text-purple-600">₹{(row.getValue('totalInterest') as number).toLocaleString()}</div>,
      enableSorting: true,
      enableHiding: true
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='Employee Loan Report' description='Comprehensive report for employee loan applications, approvals, and repayment tracking' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <FileText className='h-5 w-5' />
          EMPLOYEE LOAN REPORT
        </div>
        
        {/* Report Scope Selection */}
        <div className='flex justify-center'>
          <RadioGroup
            value={filters.reportScope}
            onValueChange={(value) => handleFilterChange('reportScope', value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <label htmlFor="all" className='text-sm cursor-pointer'>All</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <label htmlFor="individual" className='text-sm cursor-pointer'>Individual</label>
            </div>
          </RadioGroup>
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
                Employee Loan Report - {filters.month} {filters.year} ({filters.reportScope.toUpperCase()})
              </h3>
              <p className='text-sm text-muted-foreground'>
                Total Loans: {filteredRecords.length} | 
                Total Amount: ₹{loanSummary.totalLoanAmount.toLocaleString()} | 
                Active: {loanSummary.activeLoans}
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
                <div className='text-lg font-semibold text-foreground'>{loanSummary.totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <CreditCard className='h-3 w-3' />
                  Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-blue-600'>{loanSummary.activeLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <DollarSign className='h-3 w-3' />
                  Total Loan Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-orange-600'>₹{loanSummary.totalLoanAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground flex items-center gap-1'>
                  <Percent className='h-3 w-3' />
                  Avg. Interest Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-purple-600'>{loanSummary.averageInterestRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Loan Type Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                Loan Type Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                isLoading={isLoading}
                columns={typeColumns}
                data={loanTypeSummaries}
                totalItems={loanTypeSummaries.length}
                showViewOptions={true}
                columnPinning={{ left: ['loanType'] }}
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
                  <span className='text-sm'>Total Loan Amount:</span>
                  <span className='font-semibold'>₹{loanSummary.totalLoanAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Approved Amount:</span>
                  <span className='font-semibold text-green-600'>₹{loanSummary.totalApprovedAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Paid Amount:</span>
                  <span className='font-semibold text-blue-600'>₹{loanSummary.totalPaidAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total Remaining Amount:</span>
                  <span className='font-semibold text-orange-600'>₹{loanSummary.totalRemainingAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between border-t pt-2'>
                  <span className='text-sm'>Total Interest Amount:</span>
                  <span className='font-semibold text-purple-600'>₹{loanSummary.totalInterestAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Loan Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Pending Requests:</span>
                  <span className='font-semibold text-yellow-600'>{loanSummary.pendingRequests}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Approved Requests:</span>
                  <span className='font-semibold text-green-600'>{loanSummary.approvedRequests}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Active Loans:</span>
                  <span className='font-semibold text-blue-600'>{loanSummary.activeLoans}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Completed Loans:</span>
                  <span className='font-semibold text-green-600'>{loanSummary.completedLoans}</span>
                </div>
                <div className='flex justify-between border-t pt-2'>
                  <span className='text-sm'>Average Loan Amount:</span>
                  <span className='font-semibold text-purple-600'>₹{loanSummary.averageLoanAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Loan Details Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Employee Loan Details
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



