'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, Award } from 'lucide-react';
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

interface Employee extends BaseEntity {
  employeeCode: string;
  employeeName: string;
  groupTypeId: number;
  departmentId: number;
  designationId: number;
  departmentName: string;
  designationName: string;
  dateOfJoining: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
}

// Salary certificate data structure
interface SalaryCertificate extends BaseEntity {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designationName: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  certificateDate: string;
  certificateNumber: string;
}

// Report filters
interface SalaryCertificateFilters {
  groupType: string;
  department: string;
  designation: string;
  month: string;
  year: string;
  selectedEmployee: string;
}

export default function SalaryCertificatePage() {
  // Database instances
  const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
  const departmentDB = createLocalCrud<Department>('master:department');
  const designationDB = createLocalCrud<Designation>('master:designation');
  const employeeDB = createLocalCrud<Employee>('employee:register');
  const certificateDB = createLocalCrud<SalaryCertificate>('report:salary-certificate');

  // State
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const [filters, setFilters] = useState<SalaryCertificateFilters>({
    groupType: 'All',
    department: 'All',
    designation: 'All',
    month: '',
    year: '',
    selectedEmployee: ''
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

      // Load employees
      let empList = employeeDB.list();
      if (empList.length === 0) {
        const mockData = generateMockEmployees();
        mockData.forEach(emp => employeeDB.create(emp));
        empList = employeeDB.list(); // Reload data after creating mock records
      }
      setEmployees(empList);
      setFilteredEmployees(empList);
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

  const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
    return [
      {
        employeeCode: 'EMP001',
        employeeName: 'MR SUDIPTA RANJAN BHADURI',
        groupTypeId: 3,
        departmentId: 2,
        designationId: 1,
        departmentName: 'JUNIOR SCHOOL',
        designationName: 'Assistant Teacher',
        dateOfJoining: '2020-01-15',
        basicSalary: 25000,
        allowances: 7500,
        deductions: 3250,
        grossSalary: 32500,
        netSalary: 29250
      },
      {
        employeeCode: 'EMP002',
        employeeName: 'MS RUPLEKHA CHATTERJEE',
        groupTypeId: 6,
        departmentId: 4,
        designationId: 2,
        departmentName: 'OFFICE STAFF',
        designationName: 'Principal',
        dateOfJoining: '2018-06-10',
        basicSalary: 60000,
        allowances: 18000,
        deductions: 7800,
        grossSalary: 78000,
        netSalary: 70200
      },
      {
        employeeCode: 'EMP003',
        employeeName: 'MR JOHN SHAH',
        groupTypeId: 3,
        departmentId: 3,
        designationId: 1,
        departmentName: 'SENIOR SCHOOL',
        designationName: 'Assistant Teacher',
        dateOfJoining: '2019-03-20',
        basicSalary: 25000,
        allowances: 7500,
        deductions: 3250,
        grossSalary: 32500,
        netSalary: 29250
      },
      {
        employeeCode: 'EMP004',
        employeeName: 'MRS BHASWATI DAS',
        groupTypeId: 5,
        departmentId: 5,
        designationId: 6,
        departmentName: 'Service Staff',
        designationName: 'Teacher Helper',
        dateOfJoining: '2021-09-01',
        basicSalary: 15000,
        allowances: 4500,
        deductions: 1950,
        grossSalary: 19500,
        netSalary: 17550
      },
      {
        employeeCode: 'EMP005',
        employeeName: 'MR SANTANU MUKHERJEE',
        groupTypeId: 5,
        departmentId: 4,
        designationId: 5,
        departmentName: 'OFFICE STAFF',
        designationName: 'System Manager',
        dateOfJoining: '2017-04-12',
        basicSalary: 40000,
        allowances: 12000,
        deductions: 5200,
        grossSalary: 52000,
        netSalary: 46800
      }
    ];
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

  // Filter employees based on selected criteria
  useEffect(() => {
    let filtered = employees;

    if (filters.groupType !== 'All') {
      const selectedGroupType = groupTypes.find(g => g.groupType === filters.groupType);
      if (selectedGroupType) {
        filtered = filtered.filter(emp => emp.groupTypeId === selectedGroupType.id);
      }
    }

    if (filters.department !== 'All') {
      const selectedDepartment = departments.find(d => d.departmentName === filters.department);
      if (selectedDepartment) {
        filtered = filtered.filter(emp => emp.departmentId === selectedDepartment.id);
      }
    }

    if (filters.designation !== 'All') {
      const selectedDesignation = designations.find(d => d.designationName === filters.designation);
      if (selectedDesignation) {
        filtered = filtered.filter(emp => emp.designationId === selectedDesignation.id);
      }
    }

    setFilteredEmployees(filtered);
  }, [filters.groupType, filters.department, filters.designation, employees, groupTypes, departments, designations]);

  const handleFilterChange = (key: keyof SalaryCertificateFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters when parent changes
    if (key === 'groupType') {
      newFilters.department = 'All';
      newFilters.designation = 'All';
      newFilters.selectedEmployee = '';
    } else if (key === 'department') {
      newFilters.designation = 'All';
      newFilters.selectedEmployee = '';
    } else if (key === 'designation') {
      newFilters.selectedEmployee = '';
    }
    
    setFilters(newFilters);
  };

  const handleGenerateSlip = () => {
    if (!filters.month || !filters.year || !filters.selectedEmployee) {
      toast.error('Please select month, year, and employee');
      return;
    }
    setShowCertificate(true);
    toast.success('Salary certificate generated');
  };

  const handleCancel = () => {
    setFilters({
      groupType: 'All',
      department: 'All',
      designation: 'All',
      month: '',
      year: '',
      selectedEmployee: ''
    });
    setShowCertificate(false);
    toast.info('Filters cleared');
  };

  const handleExport = () => {
    toast.success('Salary certificate exported');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  // Get selected employee details
  const selectedEmployeeDetails = useMemo(() => {
    if (!filters.selectedEmployee) return null;
    return employees.find(emp => emp.id.toString() === filters.selectedEmployee);
  }, [filters.selectedEmployee, employees]);

  return (
    <div className='space-y-6'>
      <div className='flex-between flex-wrap gap-4'>
        <Heading title='Salary Certificate' description='Generate official salary certificates for employees' />
      </div>

      {/* Report Configuration Section */}
      <div className='space-y-4 p-4 border rounded-lg bg-card'>
        <div className='flex items-center gap-2 text-lg font-semibold text-foreground'>
          <Award className='h-5 w-5' />
          SALARY CERTIFICATE
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

        {/* Filter Section - Row 2: Month, Year, Employee */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                    <SelectItem key={`year-${year}`} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Selection */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>
              Employee: <span className='text-red-500'>*</span>
            </label>
            <Select value={filters.selectedEmployee} onValueChange={(value) => handleFilterChange('selectedEmployee', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.employeeName} ({emp.employeeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4'>
          <Button onClick={handleGenerateSlip} className='bg-blue-600 hover:bg-blue-700'>
            GENERATE SLIP
          </Button>
          <Button variant='outline' onClick={handleCancel}>
            CANCEL
          </Button>
        </div>
      </div>

      {/* Certificate Results */}
      {showCertificate && selectedEmployeeDetails && (
        <div className='space-y-4'>
          {/* Certificate Header */}
          <div className='flex items-center justify-between p-4 border rounded-lg bg-card'>
            <div>
              <h3 className='text-lg font-semibold text-foreground'>
                Salary Certificate - {selectedEmployeeDetails.employeeName}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Period: {filters.month} {filters.year} | 
                Employee Code: {selectedEmployeeDetails.employeeCode}
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

          {/* Salary Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Basic Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>₹{selectedEmployeeDetails.basicSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Allowances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-foreground'>₹{selectedEmployeeDetails.allowances.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-red-600'>₹{selectedEmployeeDetails.deductions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>Net Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-lg font-semibold text-green-600'>₹{selectedEmployeeDetails.netSalary.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Salary Certificate */}
          <div className='p-8 border rounded-lg bg-card'>
            <div className='text-center space-y-6'>
              <div className='space-y-2'>
                <h1 className='text-2xl font-bold text-foreground'>VAPS SCHOOL</h1>
                <h2 className='text-xl font-semibold text-foreground'>SALARY CERTIFICATE</h2>
              </div>
              
              <div className='text-left space-y-4 max-w-2xl mx-auto'>
                <p className='text-sm'>
                  <strong>Certificate No:</strong> SC/{filters.year}/{String(selectedEmployeeDetails.id).padStart(4, '0')}
                </p>
                
                <p className='text-sm'>
                  This is to certify that <strong>{selectedEmployeeDetails.employeeName}</strong> 
                  (Employee Code: <strong>{selectedEmployeeDetails.employeeCode}</strong>) 
                  is employed with our organization as <strong>{selectedEmployeeDetails.designationName}</strong> 
                  in the <strong>{selectedEmployeeDetails.departmentName}</strong> department.
                </p>
                
                <div className='border-t border-b py-4 space-y-2'>
                  <h3 className='font-semibold text-sm'>Salary Details for {filters.month} {filters.year}:</h3>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='space-y-1'>
                      <div className='flex justify-between'>
                        <span>Basic Salary:</span>
                        <span>₹{selectedEmployeeDetails.basicSalary.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Allowances:</span>
                        <span>₹{selectedEmployeeDetails.allowances.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between font-semibold'>
                        <span>Gross Salary:</span>
                        <span>₹{selectedEmployeeDetails.grossSalary.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex justify-between'>
                        <span>Deductions:</span>
                        <span>₹{selectedEmployeeDetails.deductions.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between font-semibold text-green-600'>
                        <span>Net Salary:</span>
                        <span>₹{selectedEmployeeDetails.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className='text-sm'>
                  This certificate is issued for official purposes as requested by the employee.
                </p>
                
                <div className='pt-6'>
                  <p className='text-sm'>
                    Date: <strong>{new Date().toLocaleDateString()}</strong>
                  </p>
                </div>
                
                <div className='pt-8 flex justify-between'>
                  <div className='text-sm'>
                    <div className='font-semibold'>Employee Signature</div>
                    <div className='mt-8 border-t border-gray-300 w-32'></div>
                  </div>
                  <div className='text-sm text-right'>
                    <div className='font-semibold'>Authorized Signatory</div>
                    <div className='mt-2'>HR Department</div>
                    <div>VAPS SCHOOL</div>
                    <div className='mt-6 border-t border-gray-300 w-32 ml-auto'></div>
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



