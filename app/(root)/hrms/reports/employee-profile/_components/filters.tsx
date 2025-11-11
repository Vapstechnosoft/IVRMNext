'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { MultiSelect } from '@/components/ui/multi-select';
import { Search, X } from 'lucide-react';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';

interface EmployeeProfileFiltersProps {
    groupTypes: Array<{ HRMGT_Id: number; HRMGT_EmployeeGroupType: string }>;
    departments: Array<{ HRMD_Id: number; HRMD_DepartmentName: string }>;
    designations: Array<{ HRMDES_Id: number; HRMDES_DesignationName: string }>;
    selectedGroupTypes: number[];
    selectedDepartments: number[];
    selectedDesignations: number[];
    selectedEmployees: number[];
    employeeSearchQuery: string;
    filteredEmployees: EmployeeDropdown[];
    showEmployeeDropdown: boolean;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    onGroupTypeChange: (values: number[]) => void;
    onDepartmentChange: (values: number[]) => void;
    onDesignationChange: (values: number[]) => void;
    onEmployeeSearchChange: (query: string) => void;
    onSelectAllEmployees: (checked: boolean) => void;
    onEmployeeToggle: (employeeId: number, checked: boolean) => void;
    onFilterSearch: () => void;
    onSearch: () => void;
    onCancel: () => void;
    getEmployeeName: (employee: EmployeeDropdown) => string;
}

export function EmployeeProfileFilters({
    groupTypes,
    departments,
    designations,
    selectedGroupTypes,
    selectedDepartments,
    selectedDesignations,
    selectedEmployees,
    employeeSearchQuery,
    filteredEmployees,
    showEmployeeDropdown,
    isAllSelected,
    isIndeterminate,
    onGroupTypeChange,
    onDepartmentChange,
    onDesignationChange,
    onEmployeeSearchChange,
    onSelectAllEmployees,
    onEmployeeToggle,
    onFilterSearch,
    onSearch,
    onCancel,
    getEmployeeName
}: EmployeeProfileFiltersProps) {
    return (
        <CollapsibleSection
            title='EMPLOYEE PROFILE REPORT'
            description='Select group, department, designation, and employee to generate the report'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            <div className='space-y-6'>
                {/* Filter Row */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    {/* Group Type Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>Group Type</span>
                        <MultiSelect
                            options={groupTypes.map((gt) => ({
                                label: gt.HRMGT_EmployeeGroupType,
                                value: gt.HRMGT_Id.toString()
                            }))}
                            defaultValue={selectedGroupTypes.map((id) => id.toString())}
                            onValueChange={(values) => onGroupTypeChange(values.map((v) => Number.parseInt(v)))}
                            placeholder='Select group types'
                        />
                    </div>

                    {/* Department Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>Department</span>
                        <MultiSelect
                            options={departments.map((dept) => ({
                                label: dept.HRMD_DepartmentName,
                                value: dept.HRMD_Id.toString()
                            }))}
                            defaultValue={selectedDepartments.map((id) => id.toString())}
                            onValueChange={(values) => onDepartmentChange(values.map((v) => Number.parseInt(v)))}
                            placeholder='Select departments'
                        />
                    </div>

                    {/* Designation Filter */}
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>Designation</span>
                        <MultiSelect
                            options={designations.map((desg) => ({
                                label: desg.HRMDES_DesignationName,
                                value: desg.HRMDES_Id.toString()
                            }))}
                            defaultValue={selectedDesignations.map((id) => id.toString())}
                            onValueChange={(values) => onDesignationChange(values.map((v) => Number.parseInt(v)))}
                            placeholder='Select designations'
                        />
                    </div>
                </div>

                {/* Filter Search Button */}
                <div className='flex gap-2'>
                    <Button onClick={onFilterSearch} className='w-fit transition-all duration-200 hover:scale-105'>
                        <Search className='mr-2 h-4 w-4' />
                        SEARCH EMPLOYEES
                    </Button>
                    <Button variant='outline' onClick={onCancel} className='w-fit transition-all duration-200 hover:scale-105'>
                        <X className='mr-2 h-4 w-4' />
                        CLEAR
                    </Button>
                </div>

                {/* Employee Selection - Only show after filter search */}
                {showEmployeeDropdown && (
                    <div className='space-y-2'>
                        <span className='font-medium text-foreground text-sm'>
                            Employee {selectedEmployees.length > 0 && `(${selectedEmployees.length} selected)`}
                        </span>
                        <div className='space-y-2'>
                            <InputText
                                type='text'
                                placeholder='search here...'
                                value={employeeSearchQuery}
                                onChange={(e) => onEmployeeSearchChange(e.target.value)}
                            />
                            <div className='max-h-60 space-y-2 overflow-y-auto rounded-lg border p-4'>
                                {/* Select All Checkbox */}
                                {filteredEmployees.length > 0 && (
                                    <div className='sticky top-0 z-10 flex items-center space-x-2 border-b bg-background pb-2'>
                                        <Checkbox
                                            id='select-all-employees'
                                            checked={isAllSelected || (isIndeterminate && 'indeterminate')}
                                            onCheckedChange={onSelectAllEmployees}
                                            aria-label='Select all employees'
                                        />
                                        <label
                                            htmlFor='select-all-employees'
                                            className='cursor-pointer font-semibold text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            Select All ({filteredEmployees.length})
                                        </label>
                                    </div>
                                )}
                                {/* Employee List */}
                                {filteredEmployees.map((employee) => (
                                    <div key={employee.HRME_Id} className='flex items-center space-x-2'>
                                        <Checkbox
                                            id={`employee-${employee.HRME_Id}`}
                                            checked={selectedEmployees.includes(employee.HRME_Id)}
                                            onCheckedChange={(checked) => onEmployeeToggle(employee.HRME_Id, checked as boolean)}
                                        />
                                        <label
                                            htmlFor={`employee-${employee.HRME_Id}`}
                                            className='cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            {getEmployeeName(employee)}
                                        </label>
                                    </div>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <p className='py-4 text-center text-muted-foreground text-sm'>No employees found</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Only show when employees are selected */}
                {showEmployeeDropdown && selectedEmployees.length > 0 && (
                    <div className='flex gap-2'>
                        <Button onClick={onSearch} className='w-fit transition-all duration-200 hover:scale-105'>
                            <Search className='mr-2 h-4 w-4' />
                            SHOW DETAILS
                        </Button>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
}

