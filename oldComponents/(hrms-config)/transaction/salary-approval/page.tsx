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
import { MultiSelect } from "@/components/ui/multi-select";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, MoreHorizontal, Eye, X, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getSalaryApprovalProcess,
  testSalaryApprovalProcessAPI,
  searchSalaryApprovalBySelection,
} from "@/server/hrms/hrmsConfig/transaction/salary-approval";
import type {
  SalaryApprovalOnloadResponse,
  SalaryApprovalGroupType,
  SalaryApprovalDepartment,
  SalaryApprovalDesignation,
  SalaryApprovalLeaveYear,
} from "@/types/hrms/salary-approval";
import type { SalaryApprovalSearchInput } from "@/types/hrms/salary-approval-search";

interface GroupType extends SalaryApprovalGroupType {
  // Extended from API response
}

interface Department extends SalaryApprovalDepartment {
  // Extended from API response
}

interface Designation extends SalaryApprovalDesignation {
  // Extended from API response
}

interface Employee {
  hrmE_Id: number;
  hrmE_EmployeeCode: string;
  hrmE_EmployeeName: string;
  hrmgT_Id: number;
  hrmD_Id: number;
  hrmdeS_Id: number;
  workingDays: number;
  lopsDays: number;
  grossSalary: number;
  basic: number;
  da: number;
  hra: number;
  conveyance: number;
  medical: number;
  splAllowance: number;
  totalEarning: number;
  pf: number;
  esi: number;
  others: number;
  pt: number;
  totalDeduction: number;
  netSalary: number;
  salaryStatus: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  approvedDate?: string;
  remarks?: string;
}

interface SearchForm {
  groupType: string[]; // multi-select of Group Types (store ids as strings)
  department: string[]; // multi-select of Departments (store ids as strings)
  designation: string[]; // multi-select of Designations (store ids as strings)
  year?: string;
  month?: string;
  leaveYear?: string;
}

export default function SalaryApprovalPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [roleId] = useState(2); // Default role ID
  const [monthOptions, setMonthOptions] = useState<any[]>([]);
  const [leaveYearOptions, setLeaveYearOptions] = useState<
    SalaryApprovalLeaveYear[]
  >([]);

  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SearchForm>({
    mode: "onChange",
    defaultValues: {
      groupType: [],
      department: [],
      designation: [],
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      leaveYear: "",
    },
  });

  // Watch form values for filtering
  const watchedGroupType = watch("groupType");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");

  useEffect(() => {
    loadData();
  }, [roleId]);

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
      const response = await getSalaryApprovalProcess(30); // Using MI_Id = 30
      if (response.success && response.data) {
        // Set dropdown options from API
        setGroupTypes(response.data.groupTypedropdownlist || []);
        setDepartments(response.data.departmentdropdownlist || []);
        setDesignations(response.data.designationdropdownlist || []);
        setLeaveYearOptions(response.data.leaveyeardropdown || []);
        // monthdropdown is null in the API response, so we'll create mock month data
        setMonthOptions([
          { id: 1, name: "January" },
          { id: 2, name: "February" },
          { id: 3, name: "March" },
          { id: 4, name: "April" },
          { id: 5, name: "May" },
          { id: 6, name: "June" },
          { id: 7, name: "July" },
          { id: 8, name: "August" },
          { id: 9, name: "September" },
          { id: 10, name: "October" },
          { id: 11, name: "November" },
          { id: 12, name: "December" },
        ]);

        // Ensure table starts empty until a successful search
        setEmployees([]);
        setFilteredEmployees([]);
      } else {
        toast.error("Failed to load salary approval data");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load salary approval data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (watchedGroupType && watchedGroupType.length > 0) {
      const groupTypeIds = new Set(watchedGroupType.map((v) => Number(v)));
      filtered = filtered.filter((emp) => groupTypeIds.has(emp.hrmgT_Id));
    }

    if (watchedDepartment && watchedDepartment.length > 0) {
      const departmentIds = new Set(watchedDepartment.map((v) => Number(v)));
      filtered = filtered.filter((emp) => departmentIds.has(emp.hrmD_Id));
    }

    if (watchedDesignation && watchedDesignation.length > 0) {
      const designationIds = new Set(watchedDesignation.map((v) => Number(v)));
      filtered = filtered.filter((emp) => designationIds.has(emp.hrmdeS_Id));
    }

    setFilteredEmployees(filtered);
  };

  const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
    try {
      // Build payload from form
      const payload: SalaryApprovalSearchInput = {
        MI_Id: 30,
        HRES_Year: data.year || "",
        HRES_Month: data.month || "",
        groupTypeIdList: (data.groupType || []).map((v) => Number(v)),
        hrmD_IdList: (data.department || []).map((v) => Number(v)),
        hrmdeS_IdList: (data.designation || []).map((v) => Number(v)),
        LogInUserId: 0,
      };

      const res = await searchSalaryApprovalBySelection(payload);
      if (!res.success) {
        throw new Error(res.message || "Search failed");
      }

      // Check if API returned any employee data
      const hasEmployeeData =
        res.data &&
        ((Array.isArray(res.data.ReportData) &&
          res.data.ReportData.length > 0) ||
          (Array.isArray(res.data.employeeDetails) &&
            res.data.employeeDetails.length > 0) ||
          (Array.isArray(res.data.masterEmployeeList) &&
            res.data.masterEmployeeList.length > 0) ||
          (Array.isArray(res.data.employeeSalaryslipDetails) &&
            res.data.employeeSalaryslipDetails.length > 0));

      if (hasEmployeeData) {
        // Use the first available data array
        const dataBlock: any[] =
          Array.isArray(res.data.ReportData) && res.data.ReportData.length > 0
            ? res.data.ReportData
            : Array.isArray(res.data.employeeDetails) &&
              res.data.employeeDetails.length > 0
            ? res.data.employeeDetails
            : Array.isArray(res.data.masterEmployeeList) &&
              res.data.masterEmployeeList.length > 0
            ? res.data.masterEmployeeList
            : Array.isArray(res.data.employeeSalaryslipDetails) &&
              res.data.employeeSalaryslipDetails.length > 0
            ? res.data.employeeSalaryslipDetails
            : [];

        const mapped: Employee[] = dataBlock.map((row: any, idx: number) => ({
          hrmE_Id: row.HRME_Id || row.hrmE_Id || idx + 1,
          hrmE_EmployeeCode:
            row.hrmE_EmployeeCode || row.HRME_EmployeeCode || "",
          hrmE_EmployeeName:
            row.HRME_EmployeeName || row.hrmE_EmployeeName || "",
          hrmgT_Id: row.HRMGT_Id || row.hrmgT_Id || 0,
          hrmD_Id: row.HRMD_Id || row.hrmD_Id || 0,
          hrmdeS_Id: row.HRMDES_Id || row.hrmdeS_Id || 0,
          workingDays: row.HRES_WorkingDays || row.workingDays || 0,
          lopsDays: row.Lopdays || row.lopsDays || 0,
          grossSalary: row.empGrossSal || row.grossSalary || 0,
          basic: row.basicamount || row.basic || 0,
          da: row.da || 0,
          hra: row.hra || 0,
          conveyance: row.conveyance || 0,
          medical: row.medical || 0,
          splAllowance: row.splAllowance || 0,
          totalEarning: row.totalEarning || 0,
          pf: row.HRES_EPF || row.pf || 0,
          esi: row.esi || 0,
          others: row.HRESD_Amount || row.others || 0,
          pt: row.pt || 0,
          totalDeduction: row.totalDeduction || 0,
          netSalary: row.netSalary || 0,
          salaryStatus: (row.salaryStatus || "Pending") as
            | "Pending"
            | "Approved"
            | "Rejected",
          approvedBy: row.approvedBy,
          approvedDate: row.approvedDate,
          remarks: row.remarks,
        }));

        setEmployees(mapped);
        setFilteredEmployees(mapped);
        toast.success(`Found ${mapped.length} employee records`);
      } else {
        // No employee data found
        setEmployees([]);
        setFilteredEmployees([]);

        // Check if there's a specific error message from the API
        const errorMsg =
          res.data?.retrunMsg ||
          "No employee data found for the selected criteria";
        toast.error(errorMsg);

        // Log the full response for debugging
        console.log("API Response (no employee data):", res.data);
      }

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
      // Only select pending employees
      const pendingEmployees = filteredEmployees.filter(
        (emp) => emp.salaryStatus === "Pending"
      );
      setSelectedEmployees(pendingEmployees.map((emp) => emp.hrmE_Id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const getGroupTypeName = (groupTypeId: number) => {
    const groupType = groupTypes.find((g) => g.HRMGT_Id === groupTypeId);
    return groupType?.HRMGT_EmployeeGroupType || "Unknown";
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((d) => d.HRMD_Id === departmentId);
    return department?.HRMD_DepartmentName || "Unknown";
  };

  const getDesignationName = (designationId: number) => {
    const designation = designations.find((d) => d.HRMDES_Id === designationId);
    return designation?.HRMDES_DesignationName || "Unknown";
  };

  const handleTestAPI = async () => {
    try {
      const response = await testSalaryApprovalProcessAPI(30);
      if (response.success) {
        toast.success("API connection successful");
      } else {
        toast.error("API connection failed");
      }
    } catch (error) {
      console.error("API test error:", error);
      toast.error("API connection failed");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Salary Approval"
              description="Search and manage employee salary records"
            />
          </div>
        </div>

        {/* Search Form */}
        <CollapsibleSection
          title="SALARY APPROVAL PROCESS"
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
                      options={groupTypes.map((g) => ({
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
                      options={departments.map((d) => ({
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
                      options={designations.map((d) => ({
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
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem
                            key={month.id}
                            value={month.id.toString()}
                          >
                            {month.name}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveYearOptions.map((year) => (
                          <SelectItem
                            key={year.HRMLY_Id}
                            value={year.HRMLY_Id.toString()}
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
                }}
              >
                <X className="h-4 w-4 mr-2" />
                CANCEL
              </Button>
            </div>
          </form>
        </CollapsibleSection>

        {/* Employee Salary Approval Table - Only show after search */}
        {hasSearched ? (
          <CollapsibleSection
            title="EMPLOYEE SALARY REPORT"
            description={`View, search, and manage all employee salary records (${selectedEmployees.length} selected)`}
            defaultOpen={true}
            variant="default"
            size="lg"
            className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
            headerClassName=""
          >
            <SalaryApprovalTable
              employees={filteredEmployees}
              isLoading={isLoading}
              selectedEmployees={selectedEmployees}
              onEmployeeSelect={handleEmployeeSelect}
              onSelectAll={handleSelectAll}
              getGroupTypeName={getGroupTypeName}
              getDepartmentName={getDepartmentName}
              getDesignationName={getDesignationName}
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

// Salary Approval Table Component
interface SalaryApprovalTableProps {
  employees: Employee[];
  isLoading: boolean;
  selectedEmployees: number[];
  onEmployeeSelect: (employeeId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  getGroupTypeName: (groupTypeId: number) => string;
  getDepartmentName: (departmentId: number) => string;
  getDesignationName: (designationId: number) => string;
}

function SalaryApprovalTable({
  employees,
  isLoading,
  selectedEmployees,
  onEmployeeSelect,
  onSelectAll,
  getGroupTypeName,
  getDepartmentName,
  getDesignationName,
}: SalaryApprovalTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "select",
      header: ({ table }) => {
        const pendingEmployees = employees.filter(
          (emp) => emp.salaryStatus === "Pending"
        );
        return (
          <Checkbox
            checked={
              pendingEmployees.length > 0 &&
              selectedEmployees.length === pendingEmployees.length
            }
            onCheckedChange={(value) => onSelectAll(!!value)}
            aria-label="Select all pending"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={selectedEmployees.includes(row.original.hrmE_Id)}
          onCheckedChange={(value) =>
            onEmployeeSelect(row.original.hrmE_Id, !!value)
          }
          disabled={row.original.salaryStatus !== "Pending"}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "slNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sl.No" />
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
      accessorKey: "hrmE_EmployeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Code" />
      ),
      cell: ({ row }) => <div>{row.getValue("hrmE_EmployeeCode")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "hrmE_EmployeeName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("hrmE_EmployeeName")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "workingDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Working Days" />
      ),
      cell: ({ row }) => <div>{row.getValue("workingDays")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "lopsDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lops Days" />
      ),
      cell: ({ row }) => <div>{row.getValue("lopsDays")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "grossSalary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gross Salary" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("grossSalary")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "basic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BASIC" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("basic")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "da",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DA" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("da")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "hra",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HRA" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("hra")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "conveyance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Conveyance" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("conveyance")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "medical",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Medical" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("medical")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "splAllowance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Spl Allowance" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("splAllowance")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "totalEarning",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Earning" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("totalEarning")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "pf",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PF" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("pf")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "esi",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ESI" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("esi")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "others",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Others (C.D)" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("others")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "pt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PT" />
      ),
      cell: ({ row }) => (
        <div className="w-20">
          <input
            type="number"
            defaultValue={row.getValue("pt")}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "totalDeduction",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Deduction" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("totalDeduction")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "salaryStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="S" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("salaryStatus") as string;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "Pending":
              return "secondary";
            case "Approved":
              return "success";
            case "Rejected":
              return "destructive";
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
