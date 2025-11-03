'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

interface Employee extends BaseEntity {
    employeeCode: string;
    employeeName: string;
    employeeFirstName: string;
    employeeMiddleName?: string;
    employeeLastName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    employmentType?: 'Permanent' | 'Probationary' | 'Contract' | 'Temporary';
    gender?: 'Male' | 'Female' | 'Other';
}

// Report filters
interface OfferLetterFilters {
    type: string;
    department: string;
    designation: string;
    selectedEmployee: string;
    currentDate: Date;
    reportType: 'Experience Certificate' | 'Offer Letter';
}

export default function EmployeeOfferLetterPage() {
    // Database instances
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const employeeDB = createLocalCrud<Employee>('employee:register');

    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);

    const [filters, setFilters] = useState<OfferLetterFilters>({
        type: '',
        department: '',
        designation: '',
        selectedEmployee: '',
        currentDate: new Date(),
        reportType: 'Experience Certificate'
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
                mockData.forEach((group) => groupTypeDB.create(group));
                groupList = groupTypeDB.list();
            }
            setGroupTypes(groupList.filter((g) => g.isActive));

            let deptList = departmentDB.list();
            if (deptList.length === 0) {
                const mockData = generateMockDepartments();
                mockData.forEach((dept) => departmentDB.create(dept));
                deptList = departmentDB.list();
            }
            setDepartments(deptList.filter((d) => d.isActive));

            let desigList = designationDB.list();
            if (desigList.length === 0) {
                const mockData = generateMockDesignations();
                mockData.forEach((desig) => designationDB.create(desig));
                desigList = designationDB.list();
            }
            setDesignations(desigList.filter((d) => d.isActive));

            // Load employees
            let empList = employeeDB.list();
            if (empList.length === 0) {
                const mockData = generateMockEmployees();
                mockData.forEach((emp) => employeeDB.create(emp));
                empList = employeeDB.list();
            }
            setEmployees(empList);
            setFilteredEmployees(empList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate mock data
    const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
        return [
            { groupType: 'Teaching', groupCode: 'T', order: 1, isActive: true },
            { groupType: 'Non Teaching', groupCode: 'NT', order: 2, isActive: true },
            { groupType: 'Administrative', groupCode: 'ADM', order: 3, isActive: true }
        ];
    };

    const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
        return [
            { departmentName: 'Teaching', internalTrainingHours: '40', order: 1, isActive: true },
            { departmentName: 'JUNIOR SCHOOL', internalTrainingHours: '35', order: 2, isActive: true },
            { departmentName: 'SENIOR SCHOOL', internalTrainingHours: '40', order: 3, isActive: true },
            { departmentName: 'OFFICE STAFF', internalTrainingHours: '40', order: 4, isActive: true }
        ];
    };

    const generateMockDesignations = (): Omit<Designation, 'id' | 'createdAt'>[] => {
        return [
            { designationName: 'Senior yoga teacher', basicAmount: '50000', sanctionedSeats: '5', displaySanctionedSeats: true, order: 1, isActive: true },
            { designationName: 'Principal', basicAmount: '100000', sanctionedSeats: '1', displaySanctionedSeats: true, order: 2, isActive: true },
            { designationName: 'Assistant Teacher', basicAmount: '40000', sanctionedSeats: '10', displaySanctionedSeats: true, order: 3, isActive: true },
            { designationName: 'Vice Principal', basicAmount: '80000', sanctionedSeats: '2', displaySanctionedSeats: true, order: 4, isActive: true }
        ];
    };

    const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'chandrakala j k',
                employeeFirstName: 'chandrakala',
                employeeMiddleName: 'j',
                employeeLastName: 'k',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                departmentName: 'Teaching',
                designationName: 'Senior yoga teacher',
                dateOfJoining: '2021-05-01',
                employmentType: 'Permanent',
                gender: 'Female'
            }
        ];
    };

    // Filter employees based on selected criteria
    useEffect(() => {
        let filtered = employees;

        if (filters.type) {
            filtered = filtered.filter((emp) => {
                const selectedType = groupTypes.find((gt) => gt.groupType === filters.type);
                return selectedType && emp.groupTypeId === selectedType.id;
            });
        }

        if (filters.department) {
            filtered = filtered.filter((emp) => {
                const selectedDept = departments.find((d) => d.departmentName === filters.department);
                return selectedDept && emp.departmentId === selectedDept.id;
            });
        }

        if (filters.designation) {
            filtered = filtered.filter((emp) => {
                const selectedDesig = designations.find((d) => d.designationName === filters.designation);
                return selectedDesig && emp.designationId === selectedDesig.id;
            });
        }

        setFilteredEmployees(filtered);
    }, [filters.type, filters.department, filters.designation, employees, groupTypes, departments, designations]);

    const handleFilterChange = (key: keyof OfferLetterFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));

        // Reset employee when filters change
        if (key !== 'selectedEmployee' && key !== 'currentDate' && key !== 'reportType') {
            setFilters((prev) => ({ ...prev, selectedEmployee: '' }));
        }
    };

    const handleSearch = () => {
        if (!filters.selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }

        if (!filters.type || !filters.department || !filters.designation) {
            toast.error('Please select Type, Department, and Designation');
            return;
        }

        setShowReport(true);
        toast.success(`${filters.reportType} generated successfully`);
    };

    const handleCancel = () => {
        setFilters({
            type: '',
            department: '',
            designation: '',
            selectedEmployee: '',
            currentDate: new Date(),
            reportType: 'Experience Certificate'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    // Get selected employee details
    const selectedEmployeeDetails = useMemo(() => {
        if (!filters.selectedEmployee) return null;
        return employees.find((emp) => emp.id.toString() === filters.selectedEmployee) || null;
    }, [filters.selectedEmployee, employees]);

    // Format employee name with title (Mr/Ms)
    const getEmployeeNameWithTitle = (employee: Employee | null) => {
        if (!employee) return '';
        const title = employee.gender === 'Male' ? 'Mr' : employee.gender === 'Female' ? 'Ms' : 'Mr/Ms';
        const fullName = `${employee.employeeFirstName} ${employee.employeeMiddleName || ''} ${employee.employeeLastName || ''}`.trim();
        return `${title}.${fullName}`;
    };

    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <CollapsibleSection
                title='EMPLOYEE OFFER AND EXPERIENCE REPORT'
                description='Configure filters to generate offer letters and experience certificates'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <div className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            {/* Type Selection */}
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>
                                    Type: <span className='text-red-500'>*</span>
                                </span>
                                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groupTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.groupType}>
                                                {type.groupType}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department Selection */}
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>
                                    Department: <span className='text-red-500'>*</span>
                                </span>
                                <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.departmentName}>
                                                {dept.departmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Designation Selection */}
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>
                                    Designation: <span className='text-red-500'>*</span>
                                </span>
                                <Select value={filters.designation} onValueChange={(value) => handleFilterChange('designation', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations.map((desig) => (
                                            <SelectItem key={desig.id} value={desig.designationName}>
                                                {desig.designationName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Employee Selection */}
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>
                                    Employee: <span className='text-red-500'>*</span>
                                </span>
                                <Select
                                    value={filters.selectedEmployee}
                                    onValueChange={(value) => handleFilterChange('selectedEmployee', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select or search Employee' />
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

                        {/* Right Column */}
                        <div className='space-y-4'>
                            {/* Current Date */}
                            <div className='space-y-2'>
                                <span className='font-medium text-foreground text-sm'>
                                    Current Date: <span className='text-red-500'>*</span>
                                </span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !filters.currentDate && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {filters.currentDate ? format(filters.currentDate, 'dd-MM-yyyy') : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <CalendarYear
                                            mode='single'
                                            selected={filters.currentDate}
                                            onDayClick={(day) => handleFilterChange('currentDate', day)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Report Type Radio Buttons */}
                            <div className='space-y-3'>
                                <span className='font-medium text-foreground text-sm'>Report Type:</span>
                                <RadioGroup
                                    value={filters.reportType}
                                    onValueChange={(value) => handleFilterChange('reportType', value as 'Experience Certificate' | 'Offer Letter')}
                                    className='space-y-3'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Experience Certificate' id='experience-certificate' />
                                        <label htmlFor='experience-certificate' className='cursor-pointer text-sm'>
                                            Experience Certificate
                                        </label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Offer Letter' id='offer-letter' />
                                        <label htmlFor='offer-letter' className='cursor-pointer text-sm'>
                                            Offer Letter
                                        </label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-2 pt-4'>
                        <Button onClick={handleSearch}>
                            <Search className='mr-2 h-4 w-4' />
                            SEARCH
                        </Button>
                        <Button variant='outline' onClick={handleCancel}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Report Results */}
            {showReport && selectedEmployeeDetails && (
                <CollapsibleSection
                    title='EMPLOYEE OFFER AND EXPERIENCE REPORT'
                    description={`${filters.reportType} - ${selectedEmployeeDetails.employeeName}`}
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-6'>
                        {/* Experience Certificate */}
                        {filters.reportType === 'Experience Certificate' && (
                            <div className='rounded-lg border bg-white p-8'>
                                <div className='space-y-6'>
                                    {/* Date */}
                                    <div className='text-right text-sm'>
                                        <span className='font-semibold'>DATE: {format(filters.currentDate, 'dd-MM-yyyy')}</span>
                                    </div>

                                    {/* Heading */}
                                    <div className='text-center'>
                                        <h2 className='font-bold text-lg uppercase'>TO WHOMSOEVER IT MAY CONCERN</h2>
                                    </div>

                                    {/* Certificate Content */}
                                    <div className='mx-auto max-w-3xl space-y-4 text-sm leading-relaxed'>
                                        <p className='text-justify'>
                                            This is to certify that{' '}
                                            <strong>{getEmployeeNameWithTitle(selectedEmployeeDetails)}</strong> is a{' '}
                                            <strong>
                                                {selectedEmployeeDetails.employmentType === 'Permanent' ||
                                                selectedEmployeeDetails.employmentType === 'Probationary'
                                                    ? selectedEmployeeDetails.employmentType
                                                    : 'Permanent'}
                                            </strong>{' '}
                                            employee of Our Institution working as a{' '}
                                            <strong>{selectedEmployeeDetails.designationName}</strong> since{' '}
                                            <strong>{format(new Date(selectedEmployeeDetails.dateOfJoining), 'dd-MM-yyyy')}</strong>.
                                        </p>

                                        {selectedEmployeeDetails.dateOfLeaving && (
                                            <p className='text-justify'>
                                                The employee served from{' '}
                                                <strong>{format(new Date(selectedEmployeeDetails.dateOfJoining), 'dd-MM-yyyy')}</strong> to{' '}
                                                <strong>{format(new Date(selectedEmployeeDetails.dateOfLeaving), 'dd-MM-yyyy')}</strong>.
                                            </p>
                                        )}
                                    </div>

                                    {/* Signature Section */}
                                    <div className='mt-12 flex flex-col items-end space-y-2 text-sm'>
                                        <div className='font-semibold'>Mrs. Phebe Sheela Rani</div>
                                        <div>MANAGER</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Offer Letter */}
                        {filters.reportType === 'Offer Letter' && (
                            <div className='rounded-lg border bg-white p-8'>
                                <div className='space-y-6'>
                                    {/* Date */}
                                    <div className='text-right text-sm'>
                                        <span className='font-semibold'>DATE: {format(filters.currentDate, 'dd-MM-yyyy')}</span>
                                    </div>

                                    {/* Employee Details */}
                                    <div className='space-y-1 text-sm'>
                                        <div>
                                            <strong>{getEmployeeNameWithTitle(selectedEmployeeDetails)}</strong>
                                        </div>
                                        <div>Employee Code: {selectedEmployeeDetails.employeeCode}</div>
                                        {selectedEmployeeDetails.departmentName && (
                                            <div>{selectedEmployeeDetails.departmentName}</div>
                                        )}
                                    </div>

                                    {/* Subject */}
                                    <div className='space-y-2 text-sm'>
                                        <div>
                                            <strong>Subject: Offer of Employment</strong>
                                        </div>
                                    </div>

                                    {/* Letter Content */}
                                    <div className='mx-auto max-w-3xl space-y-4 text-sm leading-relaxed'>
                                        <p className='text-justify'>Dear {selectedEmployeeDetails.employeeFirstName},</p>

                                        <p className='text-justify'>
                                            We are pleased to offer you the position of <strong>{selectedEmployeeDetails.designationName}</strong> in the{' '}
                                            <strong>{selectedEmployeeDetails.departmentName}</strong> department at our institution.
                                        </p>

                                        <p className='text-justify'>
                                            Your employment will commence from{' '}
                                            <strong>{format(filters.currentDate, 'dd-MM-yyyy')}</strong>. We are confident that your skills and
                                            experience will be a valuable addition to our team.
                                        </p>

                                        <p className='text-justify'>
                                            Please confirm your acceptance of this offer by signing and returning a copy of this letter within 7
                                            days.
                                        </p>

                                        <p className='text-justify'>We look forward to welcoming you to our organization.</p>
                                    </div>

                                    {/* Signature Section */}
                                    <div className='mt-12 flex flex-col items-end space-y-2 text-sm'>
                                        <div className='font-semibold'>Mrs. Phebe Sheela Rani</div>
                                        <div>MANAGER</div>
                                        <div>VAPS SCHOOL</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='flex justify-center gap-2 border-t pt-4'>
                            <Button variant='outline' onClick={handlePrint}>
                                <Printer className='mr-2 h-4 w-4' />
                                PRINT
                            </Button>
                            <Button variant='outline' onClick={handleCancel}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

