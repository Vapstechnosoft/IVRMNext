"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  CalendarIcon,
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getSalaryUpdationList,
  saveSalaryUpdation,
  testSalaryUpdationAPI,
} from "@/types/hrms/salary-updation";
import { getCumulativeSalaryReportList } from "@/server/hrms/hrmsConfig/transaction/cumulative-salary-report";
import type {
  CumulativeSalaryReportResponse,
  GroupTypeDropdown,
  DepartmentDropdown,
  DesignationDropdown,
  EarningDeductionDetail,
  MonthDropdown,
  LeaveYearDropdown,
} from "@/types/hrms/cumulative-salary-report";
import type { EmployeeDropdown } from "@/types/hrms/salary-updation";

interface Employee {
  hrmE_Id: number;
  hrmE_EmployeeCode: string;
  hrmE_EmployeeFirstName: string;
  hrmE_EmployeeMiddleName?: string;
  hrmE_EmployeeLastName?: string;
  hrmgT_Id: number;
  hrmD_Id: number;
  hrmdeS_Id: number;
  hrmD_DepartmentName?: string;
  hrmdeS_DesignationName?: string;
  hrmgT_EmployeeGroupType?: string;
  // Dynamic salary fields based on heads
  [key: string]: any;
}

interface SearchForm {
  groupType: string;
  department: string;
  designation: string;
  year?: string;
  month?: string;
  leaveYear?: string;
  earningDeduction: string;
  amountType: string;
  heads: string;
}

export default function SalaryUpdationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [groupTypes, setGroupTypes] = useState<GroupTypeDropdown[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
  const [designations, setDesignations] = useState<DesignationDropdown[]>([]);
  const [availableHeads, setAvailableHeads] = useState<
    EarningDeductionDetail[]
  >([]);
  const [selectedHeads, setSelectedHeads] = useState<string[]>([]);
  const [monthOptions, setMonthOptions] = useState<MonthDropdown[]>([]);
  const [leaveYearOptions, setLeaveYearOptions] = useState<LeaveYearDropdown[]>(
    []
  );
  const roleId = 2; // TODO: Get from auth context

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SearchForm>({
    mode: "onChange",
    defaultValues: {
      groupType: "All",
      department: "All",
      designation: "All",
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      leaveYear: "",
      earningDeduction: "Earning",
      amountType: "All",
      heads: "All",
    },
  });

  const watchedGroupType = watch("groupType");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");
  const watchedHeads = watch("heads");
  const watchedEarningDeduction = watch("earningDeduction");
  const watchedAmountType = watch("amountType");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (hasSearched) {
      filterEmployees();
    }
  }, [
    watchedGroupType,
    watchedDepartment,
    watchedDesignation,
    employees,
    hasSearched,
  ]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get dropdown data from cumulative salary report API
      const response = await getCumulativeSalaryReportList(roleId);

      if (response.success && response.data) {
        const data = response.data;

        // Set dropdown data from API
        setMonthOptions(data.monthdropdown || []);
        setLeaveYearOptions(data.leaveyeardropdown || []);
        setGroupTypes(data.groupTypedropdown || []);
        setDepartments(data.departmentdropdown || []);
        setDesignations(data.designationdropdown || []);
        setAvailableHeads(data.earningdeductiondetails || []);

        // Set employees from API (if available) or use mock data for now
        if (data.employeedropdown && data.employeedropdown.length > 0) {
          // Convert API employee data to our Employee interface
          // Initialize salary fields dynamically from available heads
          const salaryFields: Record<string, number> = {};
          (data.earningdeductiondetails || []).forEach(
            (head: EarningDeductionDetail) => {
              salaryFields[head.hrmeD_Name] = 0; // Initialize all heads with 0
            }
          );

          const apiEmployees: Employee[] = data.employeedropdown.map(
            (emp: any) => ({
              hrmE_Id: emp.hrmE_Id,
              hrmE_EmployeeCode: emp.hrmE_EmployeeCode,
              hrmE_EmployeeFirstName: emp.hrmE_EmployeeFirstName,
              hrmE_EmployeeMiddleName: emp.hrmE_EmployeeMiddleName,
              hrmE_EmployeeLastName: emp.hrmE_EmployeeLastName,
              hrmgT_Id: emp.hrmgT_Id,
              hrmD_Id: emp.hrmD_Id,
              hrmdeS_Id: emp.hrmdeS_Id,
              hrmD_DepartmentName: emp.hrmD_DepartmentName,
              hrmdeS_DesignationName: emp.hrmdeS_DesignationName,
              hrmgT_EmployeeGroupType: emp.hrmgT_EmployeeGroupType,
              // Initialize all salary fields with 0, then merge any existing values from emp
              ...salaryFields,
              // If API provides salary data, merge it here (ensuring nulls are replaced with 0)
              ...Object.keys(emp).reduce(
                (acc: Record<string, any>, key: string) => {
                  if (
                    ![
                      "hrmE_Id",
                      "hrmE_EmployeeCode",
                      "hrmE_EmployeeFirstName",
                      "hrmE_EmployeeMiddleName",
                      "hrmE_EmployeeLastName",
                      "hrmgT_Id",
                      "hrmD_Id",
                      "hrmdeS_Id",
                      "hrmD_DepartmentName",
                      "hrmdeS_DesignationName",
                      "hrmgT_EmployeeGroupType",
                    ].includes(key)
                  ) {
                    acc[key] = emp[key] ?? 0; // Replace null/undefined with 0
                  }
                  return acc;
                },
                {}
              ),
            })
          );
          setEmployees(apiEmployees);
        } else {
          // Fallback to mock data if API doesn't return employees
          // Initialize salary fields dynamically from available heads
          const salaryFields: Record<string, number> = {};
          (data.earningdeductiondetails || []).forEach(
            (head: EarningDeductionDetail) => {
              salaryFields[head.hrmeD_Name] = 0; // Initialize all heads with 0
            }
          );

          const mockEmployeesBase = [
            {
              hrmE_Id: 1,
              hrmE_EmployeeCode: "STCSH00003",
              hrmE_EmployeeFirstName: "MR SUDIPTA RANJAN",
              hrmE_EmployeeLastName: "BHADURI",
              hrmgT_Id: 1,
              hrmD_Id: 2,
              hrmdeS_Id: 1,
              hrmD_DepartmentName: "JUNIOR SCHOOL",
              hrmdeS_DesignationName: "Assistant Teacher",
              hrmgT_EmployeeGroupType: "Teaching",
            },
            {
              hrmE_Id: 2,
              hrmE_EmployeeCode: "STCSH00007",
              hrmE_EmployeeFirstName: "MS RUPLEKHA",
              hrmE_EmployeeLastName: "CHATTERJEE",
              hrmgT_Id: 1,
              hrmD_Id: 2,
              hrmdeS_Id: 1,
              hrmD_DepartmentName: "JUNIOR SCHOOL",
              hrmdeS_DesignationName: "Assistant Teacher",
              hrmgT_EmployeeGroupType: "Teaching",
            },
            {
              hrmE_Id: 3,
              hrmE_EmployeeCode: "STCSH00019",
              hrmE_EmployeeFirstName: "MR JOHN",
              hrmE_EmployeeLastName: "SHAH",
              hrmgT_Id: 1,
              hrmD_Id: 2,
              hrmdeS_Id: 1,
              hrmD_DepartmentName: "JUNIOR SCHOOL",
              hrmdeS_DesignationName: "Assistant Teacher",
              hrmgT_EmployeeGroupType: "Teaching",
            },
            {
              hrmE_Id: 4,
              hrmE_EmployeeCode: "STCSH00025",
              hrmE_EmployeeFirstName: "MRS RINKI",
              hrmE_EmployeeLastName: "GHOSH",
              hrmgT_Id: 1,
              hrmD_Id: 2,
              hrmdeS_Id: 1,
              hrmD_DepartmentName: "JUNIOR SCHOOL",
              hrmdeS_DesignationName: "Assistant Teacher",
              hrmgT_EmployeeGroupType: "Teaching",
            },
            {
              hrmE_Id: 5,
              hrmE_EmployeeCode: "STCSH00044",
              hrmE_EmployeeFirstName: "MRS PARVEEN ZAHEEDA",
              hrmE_EmployeeLastName: "IMAM",
              hrmgT_Id: 1,
              hrmD_Id: 2,
              hrmdeS_Id: 1,
              hrmD_DepartmentName: "JUNIOR SCHOOL",
              hrmdeS_DesignationName: "Assistant Teacher",
              hrmgT_EmployeeGroupType: "Teaching",
            },
          ];

          // Apply salary fields to each mock employee
          const mockEmployees: Employee[] = mockEmployeesBase.map((emp) => ({
            ...emp,
            ...salaryFields,
          }));

          setEmployees(mockEmployees);
        }

        // Set selected heads to all available heads by default
        const headNames = (data.earningdeductiondetails || []).map(
          (head: EarningDeductionDetail) => head.hrmeD_Name
        );
        setSelectedHeads(headNames);
      } else {
        toast.error(response.message || "Failed to load data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (watchedGroupType && watchedGroupType !== "All") {
      const groupType = groupTypes.find(
        (g) => g.hrmgT_EmployeeGroupType === watchedGroupType
      );
      if (groupType) {
        filtered = filtered.filter(
          (emp) => emp.hrmgT_Id === groupType.hrmgT_Id
        );
      }
    }

    if (watchedDepartment && watchedDepartment !== "All") {
      const department = departments.find(
        (d) => d.hrmD_DepartmentName === watchedDepartment
      );
      if (department) {
        filtered = filtered.filter((emp) => emp.hrmD_Id === department.hrmD_Id);
      }
    }

    if (watchedDesignation && watchedDesignation !== "All") {
      const designation = designations.find(
        (d) => d.hrmdeS_DesignationName === watchedDesignation
      );
      if (designation) {
        filtered = filtered.filter(
          (emp) => emp.hrmdeS_Id === designation.hrmdeS_Id
        );
      }
    }

    setFilteredEmployees(filtered);
  };

  const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
    try {
      // Trigger search/filter based on form data
      filterEmployees();
      setHasSearched(true);
      toast.success("Search completed successfully");
    } catch (error: any) {
      console.error("Error performing search:", error);
      toast.error(error.message || "Search failed");
    }
  };

  const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
    if (selected) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.hrmE_Id));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Update selected heads based on dropdown selection
  useEffect(() => {
    if (watchedHeads === "All") {
      // Show all heads
      const allHeadNames = availableHeads.map((head) => head.hrmeD_Name);
      setSelectedHeads(allHeadNames);
    } else if (watchedHeads && watchedHeads !== "All") {
      // Show only selected head
      setSelectedHeads([watchedHeads]);
    }
  }, [watchedHeads, availableHeads]);

  const getGroupTypeName = (groupTypeId: number) => {
    const groupType = groupTypes.find((g) => g.hrmgT_Id === groupTypeId);
    return groupType?.hrmgT_EmployeeGroupType || "Unknown";
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((d) => d.hrmD_Id === departmentId);
    return department?.hrmD_DepartmentName || "Unknown";
  };

  const getDesignationName = (designationId: number) => {
    const designation = designations.find((d) => d.hrmdeS_Id === designationId);
    return designation?.hrmdeS_DesignationName || "Unknown";
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Salary Updation"
              description="Search and update employee salary records"
            />
          </div>
        </div>

        {/* Search Form */}
        <CollapsibleSection
          title="SALARY UPDATION"
          description="Search and filter employee salary records"
          defaultOpen={true}
          variant="outline"
          size="lg"
          className="shadow-lg"
          headerClassName=""
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
              {/* Group Type */}
              <div className="space-y-3">
                <Label className="font-semibold">Group Type</Label>
                <Controller
                  name="groupType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Group Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Group Types</SelectItem>
                        {groupTypes.map((groupType) => (
                          <SelectItem
                            key={groupType.hrmgT_Id}
                            value={groupType.hrmgT_EmployeeGroupType}
                          >
                            {groupType.hrmgT_EmployeeGroupType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Department */}
              <div className="space-y-3">
                <Label className="font-semibold">Department</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Departments</SelectItem>
                        {departments.map((department) => (
                          <SelectItem
                            key={department.hrmD_Id}
                            value={department.hrmD_DepartmentName}
                          >
                            {department.hrmD_DepartmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Designation */}
              <div className="space-y-3">
                <Label className="font-semibold">Designation</Label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Designations</SelectItem>
                        {designations.map((designation) => (
                          <SelectItem
                            key={designation.hrmdeS_Id}
                            value={designation.hrmdeS_DesignationName}
                          >
                            {designation.hrmdeS_DesignationName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Month */}
              <div className="space-y-3">
                <Label className="font-semibold">Month</Label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem
                            key={month.ivrM_Month_Id}
                            value={month.ivrM_Month_Id.toString()}
                          >
                            {month.ivrM_Month_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Year */}
              <div className="space-y-3">
                <Label className="font-semibold">Year</Label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveYearOptions.map((year) => (
                          <SelectItem
                            key={year.hrmlY_Id}
                            value={year.hrmlY_Id.toString()}
                          >
                            {year.hrmlY_LeaveYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Head */}
              <div className="space-y-3">
                <Label className="font-semibold">Head</Label>
                <Controller
                  name="heads"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Head" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Heads</SelectItem>
                        {availableHeads.map((head) => (
                          <SelectItem
                            key={head.hrmeD_Id}
                            value={head.hrmeD_Name}
                          >
                            {head.hrmeD_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Earning/Deduction and Amount Type */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Label className="font-semibold">Earning/Deduction</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="all-earning"
                      value="All Earning & Deduction"
                      {...register("earningDeduction")}
                      className="text-primary"
                    />
                    <Label htmlFor="all-earning">All Earning & Deduction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="earning"
                      value="Earning"
                      {...register("earningDeduction")}
                      className="text-primary"
                    />
                    <Label htmlFor="earning">Earning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="deduction"
                      value="Deduction"
                      {...register("earningDeduction")}
                      className="text-primary"
                    />
                    <Label htmlFor="deduction">Deduction</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold">Amount Type</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="all-amount"
                      value="All"
                      {...register("amountType")}
                      className="text-primary"
                    />
                    <Label htmlFor="all-amount">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="amount"
                      value="Amount"
                      {...register("amountType")}
                      className="text-primary"
                    />
                    <Label htmlFor="amount">Amount</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="percentage"
                      value="Percentage"
                      {...register("amountType")}
                      className="text-primary"
                    />
                    <Label htmlFor="percentage">Percentage</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Cancel Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="transition-all duration-200 hover:scale-105 w-fit"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                SEARCH
              </Button>
              <Button
                type="button"
                variant="outline"
                className="transition-all duration-200 hover:scale-105 w-fit"
                onClick={() => {
                  reset();
                  setHasSearched(false);
                  setSelectedEmployees([]);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                CANCEL
              </Button>
            </div>
          </form>
        </CollapsibleSection>

        {/* Employee Salary Updation Table - Only show after search */}
        {hasSearched ? (
          <CollapsibleSection
            title="EMPLOYEE SALARY UPDATION"
            description={`View and update employee salary records (${selectedEmployees.length} selected)`}
            defaultOpen={true}
            variant="default"
            size="lg"
            className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
            headerClassName=""
          >
            <SalaryUpdationTable
              employees={filteredEmployees}
              isLoading={isLoading}
              selectedEmployees={selectedEmployees}
              onEmployeeSelect={handleEmployeeSelect}
              onSelectAll={handleSelectAll}
              selectedHeads={selectedHeads}
            />
          </CollapsibleSection>
        ) : (
          <div className="flex items-center justify-center py-12 bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-muted-foreground text-lg">
                Please use the search form above to find employee salary records
              </div>
              <div className="text-sm text-muted-foreground">
                Select your criteria and click "SEARCH" to view results
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SalaryUpdationTableProps {
  employees: Employee[];
  isLoading: boolean;
  selectedEmployees: number[];
  onEmployeeSelect: (employeeId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  selectedHeads: string[];
}

function SalaryUpdationTable({
  employees,
  isLoading,
  selectedEmployees,
  onEmployeeSelect,
  onSelectAll,
  selectedHeads,
}: SalaryUpdationTableProps) {
  // Sanitize employee data to ensure no null values in salary fields
  const sanitizedEmployees = employees.map((emp) => {
    const sanitized = { ...emp };
    // Ensure all salary head fields have numeric values
    selectedHeads.forEach((headName) => {
      if (sanitized[headName] == null) {
        sanitized[headName] = 0;
      }
    });
    return sanitized;
  });

  const columns: ColumnDef<Employee>[] = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            sanitizedEmployees.length > 0 &&
            selectedEmployees.length === sanitizedEmployees.length
          }
          onCheckedChange={(value: boolean) => onSelectAll(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={selectedEmployees.includes(row.original.hrmE_Id)}
          onCheckedChange={(value: boolean) =>
            onEmployeeSelect(row.original.hrmE_Id, !!value)
          }
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "slNo",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Sl.No" />
      ),
      cell: ({ row, table }: { row: any; table: any }) => {
        const index = table
          .getSortedRowModel()
          .rows.findIndex((r: any) => r.id === row.id);
        return <div>{index + 1}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "hrmE_EmployeeCode",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Employee Code" />
      ),
      cell: ({ row }: { row: any }) => (
        <div>{row.getValue("hrmE_EmployeeCode")}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "hrmE_EmployeeName",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }: { row: any }) => {
        const employee = row.original;
        const fullName = `${employee.hrmE_EmployeeFirstName} ${
          employee.hrmE_EmployeeLastName || ""
        }`.trim();
        return <div>{fullName}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    // Dynamic columns based on selected heads
    ...selectedHeads.map((headName) => ({
      id: headName,
      accessorFn: (row: Employee) => {
        // Always return a number, never null/undefined
        const value = row[headName];
        return value == null ? 0 : Number(value);
      },
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title={headName} />
      ),
      cell: ({ row }: { row: any }) => {
        // Ensure value is never null/undefined to prevent toLocaleString errors
        const currentValue = row.original[headName] ?? 0;
        return (
          <div className="w-20">
            <input
              type="number"
              defaultValue={currentValue}
              className="w-full px-2 py-1 text-sm border rounded"
              onChange={(e) => {
                // Handle value change
                const newValue = parseFloat(e.target.value) || 0;
                // Update the employee data
                row.original[headName] = newValue;
              }}
            />
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-card overflow-hidden">
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={sanitizedEmployees}
          totalItems={sanitizedEmployees.length}
          showViewOptions={true}
          columnPinning={{ left: ["select"] }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button className="transition-all duration-200 hover:scale-105 w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          UPDATE
        </Button>
        <Button
          variant="outline"
          className="transition-all duration-200 hover:scale-105 w-fit"
        >
          <X className="h-4 w-4 mr-2" />
          CANCEL
        </Button>
      </div>
    </div>
  );
}
