"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/extension/field";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { ColumnDef } from "@tanstack/react-table";
import { Calculator, X, RefreshCw, TestTube } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getSalaryCalculationOnload,
  searchSalaryCalculationBySelection,
  saveSalaryCalculation,
  testSalaryCalculationAPI,
  generateSalaryForSelectedEmployees,
} from "@/server/hrms/hrmsConfig/transaction/salary-calculation";
import type {
  SalaryCalculationOnloadResponse,
  SalaryCalculationSearchRequest,
  SalaryCalculationGenerateRequest,
  EmployeeDropdown,
  MonthDropdown,
  LeaveYearDropdown,
  DepartmentDropdown,
  DesignationDropdown,
  GroupTypeDropdown,
  SalaryCalculationInput,
} from "@/types/hrms/salary-calculation";

interface Employee extends EmployeeDropdown {
  calculationStatus: "Not Calculated" | "Calculated" | "Recalculated";
  calculatedDate?: string;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netSalary?: number;
}

interface SearchForm {
  groupType: string[]; // multi-select of Group Types (store ids as strings)
  department: string[]; // multi-select of Departments (store ids as strings)
  designation: string[]; // multi-select of Designations (store ids as strings)
  salaryMonth: string;
  salaryYear: string;
}

export default function SalaryCalculationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [monthOptions, setMonthOptions] = useState<MonthDropdown[]>([]);
  const [leaveYearOptions, setLeaveYearOptions] = useState<LeaveYearDropdown[]>(
    []
  );
  const [departmentOptions, setDepartmentOptions] = useState<
    DepartmentDropdown[]
  >([]);
  const [designationOptions, setDesignationOptions] = useState<
    DesignationDropdown[]
  >([]);
  const [groupTypeOptions, setGroupTypeOptions] = useState<GroupTypeDropdown[]>(
    []
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(
    null
  );

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isSubmitting },
  } = useForm<SearchForm>({
    mode: "onChange",
    defaultValues: {
      groupType: [],
      department: [],
      designation: [],
      salaryMonth: "",
      salaryYear: new Date().getFullYear().toString(),
    },
  });

  const watchedGroupType = watch("groupType");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");

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
      const payload = {
        MI_Id: 30,
        LogInUserId: 0,
      };

      const response = await getSalaryCalculationOnload(payload);

      if (response.success && response.data) {
        console.log("=== Salary Calculation Onload Response ===");
        console.log("Success:", response.success);
        console.log("Message:", response.message);
        console.log("Full Response Data:", response.data);

        // Set dropdown options from API response
        setMonthOptions(response.data.monthdropdown || []);
        setLeaveYearOptions(response.data.leaveyeardropdown || []);
        setDepartmentOptions(response.data.departmentdropdown || []);
        setDesignationOptions(response.data.designationdropdown || []);
        setGroupTypeOptions(response.data.groupTypedropdown || []);

        console.log("Loaded dropdown data:", {
          months: response.data.monthdropdown?.length || 0,
          years: response.data.leaveyeardropdown?.length || 0,
          departments: response.data.departmentdropdown?.length || 0,
          designations: response.data.designationdropdown?.length || 0,
          groupTypes: response.data.groupTypedropdown?.length || 0,
          employees: response.data.employeedropdown?.length || 0,
        });

        // Set employee data with calculation status from employeedropdown
        const employeeList = response.data.employeedropdown || [];
        const designations = response.data.designationdropdown || [];

        const employeesWithStatus: Employee[] = employeeList.map((emp) => {
          // Get basic salary from designation
          const designation = designations.find(
            (d: DesignationDropdown) => d.HRMDES_Id === emp.HRMDES_Id
          );
          const basicSalary = designation?.HRMDES_BasicAmount || 0;

          return {
            ...emp,
            calculationStatus: "Not Calculated" as const,
            basicSalary,
            allowances: 0,
            deductions: 0,
            netSalary: basicSalary,
          };
        });
        setEmployees(employeesWithStatus);
      } else {
        console.error("API call failed or returned no data");
        toast.error("Failed to load salary calculation data");
      }
    } catch (error: any) {
      console.error("Error loading salary calculation data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (watchedGroupType && watchedGroupType.length > 0) {
      const groupTypeIds = new Set(watchedGroupType.map((v) => Number(v)));
      filtered = filtered.filter((emp) => groupTypeIds.has(emp.HRMGT_Id));
    }

    if (watchedDepartment && watchedDepartment.length > 0) {
      const departmentIds = new Set(watchedDepartment.map((v) => Number(v)));
      filtered = filtered.filter((emp) => departmentIds.has(emp.HRMD_Id));
    }

    if (watchedDesignation && watchedDesignation.length > 0) {
      const designationIds = new Set(watchedDesignation.map((v) => Number(v)));
      filtered = filtered.filter((emp) => designationIds.has(emp.HRMDES_Id));
    }

    setFilteredEmployees(filtered);
  };

  const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
    try {
      // Build search payload
      const payload: SalaryCalculationSearchRequest = {
        MI_Id: 30,
        HRES_Year: data.salaryYear || "",
        HRES_Month: data.salaryMonth || "",
        groupTypeIdList: (data.groupType || []).map((v) => Number(v)),
        hrmD_IdList: (data.department || []).map((v) => Number(v)),
        hrmdeS_IdList: (data.designation || []).map((v) => Number(v)),
        LogInUserId: 0,
      };

      console.log("=== Searching Salary Calculation ===");
      console.log("Search payload:", payload);

      const response = await searchSalaryCalculationBySelection(payload);

      if (response.success && response.data) {
        console.log("Search response:", response.data);

        // Update employees from search result
        const employeeList = response.data.employeedropdown || [];
        const designations = designationOptions;

        const employeesWithStatus: Employee[] = employeeList.map((emp) => {
          // Get basic salary from designation
          const designation = designations.find(
            (d: DesignationDropdown) => d.HRMDES_Id === emp.HRMDES_Id
          );
          const basicSalary = designation?.HRMDES_BasicAmount || 0;

          return {
            ...emp,
            calculationStatus: "Not Calculated" as const,
            basicSalary,
            allowances: 0,
            deductions: 0,
            netSalary: basicSalary,
          };
        });

        setEmployees(employeesWithStatus);
        setFilteredEmployees(employeesWithStatus);
        setHasSearched(true);
        setCurrentSearchData(data); // Store current search data for salary generation

        // Set date range based on selected month and year
        if (data.salaryMonth && data.salaryYear) {
          const monthData = monthOptions.find(
            (m) => m.IVRM_Month_Name === data.salaryMonth
          );
          if (monthData) {
            const year = parseInt(data.salaryYear);
            const monthIndex = monthData.IVRM_Month_Id - 1;
            const fromDate = new Date(year, monthIndex, 1);
            const toDate = new Date(year, monthIndex + 1, 0);

            setFromDate(fromDate.toLocaleDateString("en-GB"));
            setToDate(toDate.toLocaleDateString("en-GB"));
          }
        }

        toast.success(
          `Search completed successfully. Found ${employeesWithStatus.length} employees`
        );
      } else {
        setEmployees([]);
        setFilteredEmployees([]);
        setHasSearched(true);
        toast.error(
          response.message || "No employees found for the selected criteria"
        );
      }
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
      setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await testSalaryCalculationAPI();
      if (response.success) {
        toast.success("API connection successful!");
      } else {
        toast.error("API connection failed");
      }
    } catch (error: any) {
      toast.error(error.message || "API test failed");
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleGenerateSalary = async () => {
    console.log("=== handleGenerateSalary called ===");
    console.log("Selected employees:", selectedEmployees);
    console.log("Current search data:", currentSearchData);

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee to generate salary");
      return;
    }

    if (!currentSearchData) {
      toast.error("Please perform a search first before generating salary");
      return;
    }

    try {
      setIsLoading(true);

      // Build the salary generation request
      const payload: SalaryCalculationGenerateRequest = {
        MI_Id: 30,
        HRES_Year: currentSearchData.salaryYear,
        HRES_Month: currentSearchData.salaryMonth,
        employeeIdList: selectedEmployees,
        LogInUserId: 0,
      };

      console.log("=== Generating Salary for Selected Employees ===");
      console.log("Selected employees:", selectedEmployees);
      console.log("Search data:", currentSearchData);
      console.log("Payload:", payload);

      const response = await generateSalaryForSelectedEmployees(payload);

      if (response.success) {
        const processedCount = response.data?.processedCount || 0;
        const failedCount = response.data?.failedCount || 0;

        toast.success(
          `Salary generation completed! Processed: ${processedCount}, Failed: ${failedCount}`
        );

        // Update employee status to "Calculated"
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            selectedEmployees.includes(emp.HRME_Id)
              ? { ...emp, calculationStatus: "Calculated" as const }
              : emp
          )
        );
        setFilteredEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            selectedEmployees.includes(emp.HRME_Id)
              ? { ...emp, calculationStatus: "Calculated" as const }
              : emp
          )
        );

        // Clear selection after successful generation
        setSelectedEmployees([]);
      } else {
        toast.error(response.message || "Failed to generate salary");
      }
    } catch (error: any) {
      console.error("Error generating salary:", error);
      toast.error(error.message || "Failed to generate salary");
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Salary Calculation"
              description="Search and calculate employee salaries"
            />
          </div>
        </div>

        {/* Search Form */}
        <CollapsibleSection
          title="SALARY CALCULATION"
          description="Search and filter employee salary records"
          defaultOpen={true}
          variant="outline"
          size="lg"
          className="shadow-lg"
          headerClassName=""
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* Group Type (MultiSelect) */}
              <div className="space-y-3">
                <Label className="font-semibold">Group Type</Label>
                <Controller
                  name="groupType"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={groupTypeOptions.map((g) => ({
                        label: g.HRMGT_EmployeeGroupType,
                        value: String(g.HRMGT_Id),
                      }))}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select Group Types"
                      className="w-full"
                      maxHeight={240}
                    />
                  )}
                />
              </div>

              {/* Department (MultiSelect) */}
              <div className="space-y-3">
                <Label className="font-semibold">Department</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={departmentOptions.map((d) => ({
                        label: d.HRMD_DepartmentName,
                        value: String(d.HRMD_Id),
                      }))}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select Departments"
                      className="w-full"
                      maxHeight={240}
                    />
                  )}
                />
              </div>

              {/* Designation (MultiSelect) */}
              <div className="space-y-3">
                <Label className="font-semibold">Designation</Label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={designationOptions.map((d) => ({
                        label: d.HRMDES_DesignationName,
                        value: String(d.HRMDES_Id),
                      }))}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      placeholder="Select Designations"
                      className="w-full"
                      maxHeight={240}
                    />
                  )}
                />
              </div>

              {/* Month */}
              <div className="space-y-3">
                <Label className="font-semibold">Month</Label>
                <Controller
                  name="salaryMonth"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem
                            key={month.IVRM_Month_Id}
                            value={month.IVRM_Month_Name}
                          >
                            {month.IVRM_Month_Name}
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
                  name="salaryYear"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveYearOptions.map((year) => (
                          <SelectItem
                            key={year.HRMLY_Id}
                            value={year.HRMLY_LeaveYear}
                          >
                            {year.HRMLY_LeaveYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                  setFromDate("");
                  setToDate("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                CANCEL
              </Button>
            </div>
          </form>
        </CollapsibleSection>

        {/* Employee List Table - Only show after search */}
        {hasSearched ? (
          <CollapsibleSection
            title="EMPLOYEE LIST"
            description={`View and calculate employee salaries (${selectedEmployees.length} selected)`}
            defaultOpen={true}
            variant="default"
            size="lg"
            className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
            headerClassName=""
          >
            <SalaryCalculationTable
              employees={filteredEmployees}
              isLoading={isLoading}
              selectedEmployees={selectedEmployees}
              onEmployeeSelect={handleEmployeeSelect}
              onSelectAll={handleSelectAll}
              onGenerateSalary={handleGenerateSalary}
              fromDate={fromDate}
              toDate={toDate}
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

interface SalaryCalculationTableProps {
  employees: Employee[];
  isLoading: boolean;
  selectedEmployees: number[];
  onEmployeeSelect: (employeeId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onGenerateSalary: () => void;
  fromDate: string;
  toDate: string;
}

function SalaryCalculationTable({
  employees,
  isLoading,
  selectedEmployees,
  onEmployeeSelect,
  onSelectAll,
  onGenerateSalary,
  fromDate,
  toDate,
}: SalaryCalculationTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            employees.length > 0 &&
            selectedEmployees.length === employees.length
          }
          onCheckedChange={(value) => onSelectAll(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedEmployees.includes(row.original.HRME_Id)}
          onCheckedChange={(value) =>
            onEmployeeSelect(row.original.HRME_Id, !!value)
          }
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "slNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SL. No" />
      ),
      cell: ({ row, table }) => {
        const index = table
          .getSortedRowModel()
          .rows.findIndex((r) => r.id === row.id);
        return <div>{index + 1}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "HRME_EmployeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Code" />
      ),
      cell: ({ row }) => <div>{row.getValue("HRME_EmployeeCode")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "HRME_EmployeeFirstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        const fullName = `${employee.HRME_EmployeeFirstName} ${
          employee.HRME_EmployeeMiddleName || ""
        } ${employee.HRME_EmployeeLastName || ""}`.trim();
        return <div>{fullName}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "basicSalary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Basic Salary" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("basicSalary")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "allowances",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Allowances" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("allowances")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "deductions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deductions" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("deductions")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "netSalary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Net Salary" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("netSalary")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "calculationStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("calculationStatus") as string;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "Not Calculated":
              return "secondary";
            case "Calculated":
              return "success";
            case "Recalculated":
              return "default";
            default:
              return "secondary";
          }
        };
        return (
          <Badge variant={getStatusVariant(status) as any}>{status}</Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Date Range Display */}
      {fromDate && toDate && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Date From: {fromDate} To {toDate}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="search here..."
                className="px-3 py-1 text-sm border rounded-md w-48"
              />
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-card overflow-hidden">
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={employees}
          totalItems={employees.length}
          showViewOptions={true}
          columnPinning={{ left: ["select"] }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={() => {
            console.log("Button clicked!");
            alert("Button clicked!");
            onGenerateSalary();
          }}
          disabled={selectedEmployees.length === 0}
          className="transition-all duration-200 hover:scale-105 w-fit"
        >
          <Calculator className="h-4 w-4 mr-2" />
          GENERATE PAY
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
