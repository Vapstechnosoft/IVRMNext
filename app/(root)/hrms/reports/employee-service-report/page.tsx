'use client';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useFilterEmployeeOfferAndExperienceData, useGetEmployeeDetailsBySelection } from '@/hooks/hrms/useReports';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ExperienceCertificateTemplate } from './_components/experience-certificate-template';
import { EmployeeServiceFilters, type ServiceReportFilters } from './_components/filters';
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
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    currentSalary: number;
}
// Employee service report data structure
interface EmployeeServiceRecord extends BaseEntity {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    departmentName: string;
    designationName: string;
    dateOfJoining: string;
    dateOfLeaving?: string;
    serviceLength: string;
    currentStatus: 'Active' | 'Left';
    reportType: 'Experience Certificate' | 'Service Record';
    reportDate: string;
    totalExperience: string;
    currentSalary: number;
    achievements: string[];
    reportingManager: string;
}
export default function EmployeeServiceReportPage() {
    const roleId = HRMS_MI_ID;
    // API hooks
    const filterMutation = useFilterEmployeeOfferAndExperienceData();
    const searchMutation = useGetEmployeeDetailsBySelection();
    // Database instances (for dropdowns - group types, departments, designations)
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeData, setSelectedEmployeeData] = useState<{
        employeeName: string;
        employeeCode?: string;
        designation: string;
        department?: string;
        dateOfJoining: string;
        employmentType?: 'Permanent' | 'Probationary';
        gender?: 'Male' | 'Female' | 'Other';
    } | null>(null);
    const [signatoryName, setSignatoryName] = useState<string>('Mrs. Phebe Sheela Rani');
    const [signatoryDesignation, setSignatoryDesignation] = useState<string>('MANAGER');
    const [_isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<ServiceReportFilters>({
        type: '',
        department: '',
        designation: '',
        selectedEmployee: '',
        currentDate: new Date('2025-09-17'),
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
                groupList = groupTypeDB.list(); // Reload data after creating mock records
            }
            setGroupTypes(groupList.filter((g) => g.isActive));
            let deptList = departmentDB.list();
            if (deptList.length === 0) {
                const mockData = generateMockDepartments();
                mockData.forEach((dept) => departmentDB.create(dept));
                deptList = departmentDB.list(); // Reload data after creating mock records
            }
            setDepartments(deptList.filter((d) => d.isActive));
            let desigList = designationDB.list();
            if (desigList.length === 0) {
                const mockData = generateMockDesignations();
                mockData.forEach((desig) => designationDB.create(desig));
                desigList = designationDB.list(); // Reload data after creating mock records
            }
            setDesignations(desigList.filter((d) => d.isActive));
            // Employees will be loaded via API when filters are selected
            setEmployees([]);
            setFilteredEmployees([]);
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
            {
                groupType: 'Administrative',
                groupCode: 'ADM',
                order: 3,
                isActive: true
            }
        ];
    };
    const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
        return [
            {
                departmentName: 'JUNIOR SCHOOL',
                internalTrainingHours: '35',
                order: 1,
                isActive: true
            },
            {
                departmentName: 'SENIOR SCHOOL',
                internalTrainingHours: '40',
                order: 2,
                isActive: true
            },
            {
                departmentName: 'OFFICE STAFF',
                internalTrainingHours: '40',
                order: 3,
                isActive: true
            },
            {
                departmentName: 'SERVICE STAFF',
                internalTrainingHours: '40',
                order: 4,
                isActive: true
            }
        ];
    };
    const generateMockDesignations = (): Omit<Designation, 'id' | 'createdAt'>[] => {
        return [
            {
                designationName: 'Assistant Teacher',
                basicAmount: '25000',
                sanctionedSeats: '10',
                displaySanctionedSeats: true,
                order: 1,
                isActive: true
            },
            {
                designationName: 'Principal',
                basicAmount: '60000',
                sanctionedSeats: '1',
                displaySanctionedSeats: true,
                order: 2,
                isActive: true
            },
            {
                designationName: 'Office Assistant',
                basicAmount: '20000',
                sanctionedSeats: '5',
                displaySanctionedSeats: true,
                order: 3,
                isActive: true
            },
            {
                designationName: 'System Manager',
                basicAmount: '40000',
                sanctionedSeats: '2',
                displaySanctionedSeats: true,
                order: 4,
                isActive: true
            }
        ];
    };
    const _generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'MR SUDIPTA RANJAN BHADURI',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                departmentName: 'JUNIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2020-01-15',
                currentSalary: 45000
            },
            {
                employeeCode: 'EMP002',
                employeeName: 'MS RUPLEKHA CHATTERJEE',
                groupTypeId: 3,
                departmentId: 3,
                designationId: 2,
                departmentName: 'OFFICE STAFF',
                designationName: 'Principal',
                dateOfJoining: '2018-06-10',
                currentSalary: 65000
            },
            {
                employeeCode: 'EMP003',
                employeeName: 'MR JOHN SHAH',
                groupTypeId: 1,
                departmentId: 2,
                designationId: 1,
                departmentName: 'SENIOR SCHOOL',
                designationName: 'Assistant Teacher',
                dateOfJoining: '2019-03-20',
                dateOfLeaving: '2024-08-15',
                currentSalary: 42000
            },
            {
                employeeCode: 'EMP004',
                employeeName: 'MRS BHASWATI DAS',
                groupTypeId: 2,
                departmentId: 4,
                designationId: 3,
                departmentName: 'SERVICE STAFF',
                designationName: 'Office Assistant',
                dateOfJoining: '2021-09-01',
                currentSalary: 28000
            },
            {
                employeeCode: 'EMP005',
                employeeName: 'MR SANTANU MUKHERJEE',
                groupTypeId: 2,
                departmentId: 3,
                designationId: 4,
                departmentName: 'OFFICE STAFF',
                designationName: 'System Manager',
                dateOfJoining: '2017-04-12',
                currentSalary: 55000
            }
        ];
    };
    const _generateMockServiceRecords = (): Omit<EmployeeServiceRecord, 'id' | 'createdAt'>[] => {
        return employees.map((emp, index) => {
            const joiningDate = new Date(emp.dateOfJoining);
            const currentDate = new Date();
            const serviceYears = currentDate.getFullYear() - joiningDate.getFullYear();
            const serviceMonths = currentDate.getMonth() - joiningDate.getMonth();
            return {
                employeeId: index + 1,
                employeeCode: emp.employeeCode,
                employeeName: emp.employeeName,
                departmentName: emp.departmentName,
                designationName: emp.designationName,
                dateOfJoining: emp.dateOfJoining,
                dateOfLeaving: emp.dateOfLeaving,
                serviceLength: `${serviceYears} years ${serviceMonths > 0 ? serviceMonths : 0} months`,
                currentStatus: emp.dateOfLeaving ? 'Left' : 'Active',
                reportType: 'Experience Certificate',
                reportDate: '2025-09-17',
                totalExperience: `${serviceYears + 2} years`, // Including previous experience
                currentSalary: emp.currentSalary,
                achievements: ['Excellent Performance', 'Team Leadership', 'Project Management'],
                reportingManager: 'MR PRINCIPAL'
            };
        });
    };
    // Filter employees using API when filters change
    useEffect(() => {
        // Only call API if we have at least one filter selected
        if (!filters.type && !filters.department && !filters.designation) {
            setFilteredEmployees([]);
            setEmployees([]);
            return;
        }
        // Find IDs for selected filters
        const selectedType = groupTypes.find((gt) => gt.groupType === filters.type);
        const selectedDept = departments.find((d) => d.departmentName === filters.department);
        const selectedDesig = designations.find((d) => d.designationName === filters.designation);
        const filterRequest = {
            MI_Id: roleId,
            HRMGT_Id: selectedType?.id || 0,
            HRMD_Id: selectedDept?.id || 0,
            HRMDES_Id: selectedDesig?.id || 0,
            LogInUserId: 0
        };
        filterMutation.mutate(filterRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const employeeList = response.data.employeedropdown || [];
                    const mappedEmployees: Employee[] = employeeList.map((emp: any) => ({
                        id: emp.HRME_Id || 0,
                        createdAt: new Date(),
                        employeeCode: emp.HRME_EmployeeCode || '',
                        employeeName:
                            `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim(),
                        groupTypeId: emp.HRMGT_Id || 0,
                        departmentId: emp.HRMD_Id || 0,
                        designationId: emp.HRMDES_Id || 0,
                        departmentName: emp.HRMD_DepartmentName || '',
                        designationName: emp.HRMDES_DesignationName || '',
                        dateOfJoining: emp.HRME_DOJ || '',
                        dateOfLeaving: emp.HRME_DOL || undefined,
                        currentSalary: 0
                    }));
                    setEmployees(mappedEmployees);
                    setFilteredEmployees(mappedEmployees);
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to filter employees');
            }
        });
    }, [filters.type, filters.department, filters.designation, groupTypes, departments, designations, roleId]);
    const handleFilterChange = (key: keyof ServiceReportFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        // Reset dependent filters when parent changes
        if (key === 'type') {
            newFilters.department = '';
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'department') {
            newFilters.designation = '';
            newFilters.selectedEmployee = '';
        } else if (key === 'designation') {
            newFilters.selectedEmployee = '';
        }
        setFilters(newFilters);
    };
    const handleSearch = () => {
        // Always show report template when search is clicked, even without data or on errors
        setShowReport(true);
        if (!filters.type || !filters.department || !filters.designation || !filters.selectedEmployee) {
            toast.error('Please fill all required fields');
            return;
        }
        // Find IDs for selected filters
        const selectedType = groupTypes.find((gt) => gt.groupType === filters.type);
        const selectedDept = departments.find((d) => d.departmentName === filters.department);
        const selectedDesig = designations.find((d) => d.designationName === filters.designation);
        const searchRequest = {
            MI_Id: roleId,
            HRMGT_Id: selectedType?.id || 0,
            HRMD_Id: selectedDept?.id || 0,
            HRMDES_Id: selectedDesig?.id || 0,
            LogInUserId: 0
        };
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    // Extract institution details for signatory if available
                    const institutionDetails = (response.data as any).institutionDetails;
                    if (institutionDetails) {
                        // Try to get signatory name from institution details
                        // This might be in different fields depending on API structure
                        const managerName =
                            institutionDetails.ManagerName ||
                            institutionDetails.SignatoryName ||
                            institutionDetails.MI_ManagerName ||
                            'Mrs. Phebe Sheela Rani';
                        const managerDesignation =
                            institutionDetails.ManagerDesignation || institutionDetails.SignatoryDesignation || 'MANAGER';
                        setSignatoryName(managerName);
                        setSignatoryDesignation(managerDesignation);
                    }
                    const employeeList = response.data.employeedropdown || [];
                    const selectedEmployee = employeeList.find((emp: any) => emp.HRME_Id?.toString() === filters.selectedEmployee);
                    if (selectedEmployee) {
                        // Determine employment type from employee type
                        const employmentType =
                            selectedEmployee.HRMET_EmployeeType === 'Permanent'
                                ? 'Permanent'
                                : selectedEmployee.HRMET_EmployeeType === 'Probationary'
                                  ? 'Probationary'
                                  : undefined;
                        // Determine gender (if available in API response)
                        const genderName = (selectedEmployee as any).IVRMMG_GenderName || (selectedEmployee as any).HRME_Gender;
                        const gender =
                            genderName === 'M' || genderName === 'Male'
                                ? 'Male'
                                : genderName === 'F' || genderName === 'Female'
                                  ? 'Female'
                                  : undefined;
                        setSelectedEmployeeData({
                            employeeName:
                                `${selectedEmployee.HRME_EmployeeFirstName || ''} ${selectedEmployee.HRME_EmployeeMiddleName || ''} ${selectedEmployee.HRME_EmployeeLastName || ''}`.trim(),
                            employeeCode: selectedEmployee.HRME_EmployeeCode || '',
                            designation: selectedEmployee.HRMDES_DesignationName || '',
                            department: selectedEmployee.HRMD_DepartmentName || '',
                            dateOfJoining: selectedEmployee.HRME_DOJ || '',
                            employmentType,
                            gender
                        });
                        toast.success('Experience certificate generated successfully');
                    } else {
                        toast.error('Selected employee not found');
                    }
                } else {
                    toast.error(response.message || 'Failed to generate experience certificate');
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to generate experience certificate');
            }
        });
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
        setSelectedEmployeeData(null);
        toast.info('Filters cleared');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Get selected employee details for filter display
    const selectedEmployeeDetails = useMemo(() => {
        if (!filters.selectedEmployee) return null;
        const employee = employees.find((emp) => emp.id.toString() === filters.selectedEmployee);
        if (!employee) return null;
        return { employee };
    }, [filters.selectedEmployee, employees]);
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeServiceFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                filteredEmployees={filteredEmployees}
                selectedEmployeeDetails={selectedEmployeeDetails}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />
            {/* Report Results */}
            {showReport && (
                <ExperienceCertificateTemplate
                    employeeData={selectedEmployeeData}
                    currentDate={filters.currentDate}
                    signatoryName={signatoryName}
                    signatoryDesignation={signatoryDesignation}
                    isLoading={searchMutation.isPending}
                    onPrint={handlePrint}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}
