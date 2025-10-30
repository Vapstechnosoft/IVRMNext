"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, X, CalendarIcon, RefreshCw, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getMassUpdationList,
  saveMassUpdation,
  searchMassUpdationEmployees,
  getEmployeeDetailsBySelection,
} from "@/types/hrms/mass-updation";
import type {
  EmployeeDropdown,
  DepartmentDropdown,
  DesignationDropdown,
  GroupTypeDropdown,
  HeadDropdown,
  EarningDeductionType,
} from "@/types/hrms/mass-updation";

// Data interfaces
interface Employee extends EmployeeDropdown {
  selected?: boolean;
}

interface MassUpdateForm {
  groupType: string[]; // multi-select of Group Types (store ids as strings)
  department: string[]; // multi-select of Departments (store ids as strings)
  designation: string[]; // multi-select of Designations (store ids as strings)
  selectedHead: string;
  updateType: "Percentage" | "Amount";
  updateValue: number;
  effectiveDate: string;
  earningDeduction: "Earning" | "Deduction";
  addRemove: "Add" | "Remove";
}

export default function MassUpdationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [groupTypes, setGroupTypes] = useState<GroupTypeDropdown[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
  const [designations, setDesignations] = useState<DesignationDropdown[]>([]);
  const [heads, setHeads] = useState<HeadDropdown[]>([]);
  const [earningDeductionTypes, setEarningDeductionTypes] = useState<
    EarningDeductionType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const roleId = 2; // TODO: Get from auth context

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<MassUpdateForm>({
    mode: "onChange",
    defaultValues: {
      groupType: [],
      department: [],
      designation: [],
      selectedHead: "",
      updateType: "Percentage",
      updateValue: 0,
      effectiveDate: "",
      earningDeduction: "Earning",
      addRemove: "Add",
    },
  });

  // Watch form values for filtering
  const watchedGroupType = watch("groupType");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");
  const watchedEarningDeduction = watch("earningDeduction");
  const watchedUpdateType = watch("updateType");

  // Filter heads based on Earning/Deduction and Amount/Percentage selections
  const filteredHeads = React.useMemo(() => {
    if (!heads || heads.length === 0) return [];

    console.log("=== Filtering Heads ===");
    console.log("Total heads:", heads.length);
    console.log("Selected Earning/Deduction:", watchedEarningDeduction);
    console.log("Selected Amount/Percentage:", watchedUpdateType);

    const filtered = heads.filter((head) => {
      // Filter by Earning/Deduction
      const earnDedMatch = head.HRMED_EarnDedFlag === watchedEarningDeduction;

      // Filter by Amount/Percentage
      const amountPercentMatch =
        head.HRMED_AmountPercentFlag === watchedUpdateType;

      console.log(
        `Head: ${head.HRMED_Name}, EarnDed: ${
          head.HRMED_EarnDedFlag
        }, AmountPercent: ${head.HRMED_AmountPercentFlag}, Match: ${
          earnDedMatch && amountPercentMatch
        }`
      );

      return earnDedMatch && amountPercentMatch;
    });

    console.log("Filtered heads count:", filtered.length);
    console.log(
      "Filtered heads:",
      filtered.map((h) => h.HRMED_Name)
    );

    return filtered;
  }, [heads, watchedEarningDeduction, watchedUpdateType]);

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

  // Reset selectedHead when Earning/Deduction or Amount/Percentage changes
  useEffect(() => {
    const currentHead = getValues("selectedHead");
    if (currentHead) {
      // Check if the current selected head is still valid in the filtered list
      const isValidHead = filteredHeads.some(
        (head) => head.HRMED_Id.toString() === currentHead
      );
      if (!isValidHead) {
        // Reset selectedHead if it's no longer valid
        reset({
          ...getValues(),
          selectedHead: "",
        });
      }
    }
  }, [filteredHeads, getValues, reset]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await getMassUpdationList(roleId);

      console.log("=== Mass Updation Response ===");
      console.log("Success:", response.success);
      console.log("Data:", response.data);

      if (response.success && response.data) {
        // Debug: Log the actual response structure
        console.log("=== Response Data Structure ===");
        console.log("groupTypedropdown:", response.data.groupTypedropdown);
        console.log("departmentdropdown:", response.data.departmentdropdown);
        console.log("designationdropdown:", response.data.designationdropdown);
        console.log("headdropdown:", response.data.headdropdown);
        console.log("eardettypelist:", response.data.eardettypelist);
        console.log("employeedropdown:", response.data.employeedropdown);

        // Set dropdown data from API response
        setGroupTypes(response.data.groupTypedropdown || []);
        setDepartments(response.data.departmentdropdown || []);
        setDesignations(response.data.designationdropdown || []);
        setHeads(response.data.headdropdown || []);
        setEarningDeductionTypes(response.data.eardettypelist || []);

        // If API returns empty arrays, add some sample data for testing
        if ((response.data.groupTypedropdown || []).length === 0) {
          console.log(
            "API returned empty dropdowns, adding sample data for testing"
          );
          setGroupTypes([
            {
              HRMGT_Id: 1,
              HRMGT_EmployeeGroupType: "Teaching Staff",
              HRMGT_Code: "TS",
              HRMGT_Order: 1,
              HRMGT_ActiveFlag: true,
              MI_Id: 30,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMGT_Id: 2,
              HRMGT_EmployeeGroupType: "Non-Teaching Staff",
              HRMGT_Code: "NTS",
              HRMGT_Order: 2,
              HRMGT_ActiveFlag: true,
              MI_Id: 30,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMGT_Id: 3,
              HRMGT_EmployeeGroupType: "Administrative Staff",
              HRMGT_Code: "AS",
              HRMGT_Order: 3,
              HRMGT_ActiveFlag: true,
              MI_Id: 30,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
          ]);
        }

        if ((response.data.departmentdropdown || []).length === 0) {
          setDepartments([
            {
              HRMD_Id: 1,
              HRMD_DepartmentName: "Computer Science",
              HRMD_Order: 1,
              HRMD_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              HRMD_InternalTrainingMinimumHrs: 40,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMD_Id: 2,
              HRMD_DepartmentName: "Mathematics",
              HRMD_Order: 2,
              HRMD_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              HRMD_InternalTrainingMinimumHrs: 40,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMD_Id: 3,
              HRMD_DepartmentName: "Physics",
              HRMD_Order: 3,
              HRMD_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              HRMD_InternalTrainingMinimumHrs: 40,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
          ]);
        }

        if ((response.data.designationdropdown || []).length === 0) {
          setDesignations([
            {
              HRMDES_Id: 1,
              HRMDES_DesignationName: "Professor",
              HRMDES_BasicAmount: 100000,
              HRMDES_SanctionedSeats: 5,
              HRMDES_DisplaySanctionedSeatsFlag: true,
              HRMDES_Order: 1,
              HRMDES_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMDES_Id: 2,
              HRMDES_DesignationName: "Associate Professor",
              HRMDES_BasicAmount: 80000,
              HRMDES_SanctionedSeats: 10,
              HRMDES_DisplaySanctionedSeatsFlag: true,
              HRMDES_Order: 2,
              HRMDES_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
            {
              HRMDES_Id: 3,
              HRMDES_DesignationName: "Assistant Professor",
              HRMDES_BasicAmount: 60000,
              HRMDES_SanctionedSeats: 15,
              HRMDES_DisplaySanctionedSeatsFlag: true,
              HRMDES_Order: 3,
              HRMDES_ActiveFlag: true,
              MI_Id: 30,
              HRMDC_ID: 1,
              CreatedDate: "2024-01-01",
              UpdatedDate: "2024-01-01",
            },
          ]);
        }

        console.log(
          "Group Types:",
          response.data.groupTypedropdown?.length || 0
        );
        console.log(
          "Departments:",
          response.data.departmentdropdown?.length || 0
        );
        console.log(
          "Designations:",
          response.data.designationdropdown?.length || 0
        );
        console.log("Heads:", response.data.headdropdown?.length || 0);
        console.log(
          "Earning/Deduction Types:",
          response.data.eardettypelist?.length || 0
        );

        // Ensure table starts empty until a successful search
        setEmployees([]);
        setFilteredEmployees([]);
      } else {
        toast.error(response.message || "Failed to load data");
      }
    } catch (error: any) {
      console.error("Error loading mass updation data:", error);
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

  const onSubmit: SubmitHandler<MassUpdateForm> = async (
    data: MassUpdateForm
  ) => {
    try {
      // Build search payload from form data
      const searchPayload = {
        MI_Id: 30,
        roleId: roleId,
        Type: "string",
        HRME_Id: 0,
        groupTypeselected: data.groupType.map((v) => Number(v)),
        departmentselected: data.department.map((v) => Number(v)),
        designationselected: data.designation.map((v) => Number(v)),
        employeeselected: [0],
        EarningDeduction: "string",
        AmountPercentage: "string",
        HREED_Amount: 0,
        HREED_Percentage: "string",
        HRMED_Id: 0,
        AddRemove: "string",
        LogInUserId: 0,
        hrmgT_IdList: data.groupType.map((v) => Number(v)),
        employeeTypeIdList: [0],
        hrmD_IdList: data.department.map((v) => Number(v)),
        hrmdeS_IdList: data.designation.map((v) => Number(v)),
        groupTypeIdList: data.groupType.map((v) => Number(v)),
      };

      console.log("=== Mass Updation Search Request ===");
      console.log("Search payload:", searchPayload);

      const response = await searchMassUpdationEmployees(searchPayload);

      console.log("=== Mass Updation Search Response ===");
      console.log("Success:", response.success);
      console.log("Message:", response.message);
      console.log("Data:", response.data);

      if (response.success && response.data) {
        // Check if API returned employee data in employeedropdown
        const hasEmployeeData =
          response.data.employeedropdown &&
          response.data.employeedropdown.length > 0;

        if (hasEmployeeData) {
          const mappedEmployees: Employee[] =
            response.data.employeedropdown.map((emp: any) => ({
              ...emp,
              selected: false,
            }));

          setEmployees(mappedEmployees);
          setFilteredEmployees(mappedEmployees);
          setHasSearched(true);
          toast.success(`Found ${mappedEmployees.length} employee records`);
        } else {
          // No employee data found
          setEmployees([]);
          setFilteredEmployees([]);
          setHasSearched(true);

          const errorMsg =
            response.data.retrunMsg ||
            "No employees found matching the criteria";
          if (
            errorMsg.toLowerCase().includes("error") ||
            errorMsg.toLowerCase().includes("no data")
          ) {
            toast.warning(errorMsg);
          } else {
            toast.info(errorMsg);
          }
        }
      } else {
        toast.error(response.message || "Search failed");
      }
    } catch (error: any) {
      console.error("Error searching employees:", error);
      toast.error(error.message || "Search failed");
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.HRME_Id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
    if (selected) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };

  const handleMassUpdate = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    const values = getValues();
    if (!values.selectedHead) {
      toast.error("Please select a Head");
      return;
    }
    if (!values.updateType) {
      toast.error("Please choose Amount or Percentage");
      return;
    }
    if (!values.updateValue || Number(values.updateValue) <= 0) {
      toast.error("Please enter a valid value");
      return;
    }

    try {
      const payload = {
        MI_Id: 30,
        roleId: roleId,
        Type: "string",
        HRME_Id: 0,
        employeeselected: selectedEmployees,
        EarningDeduction: values.earningDeduction,
        AmountPercentage: values.updateType,
        HREED_Amount:
          values.updateType === "Amount" ? Number(values.updateValue) : 0,
        HREED_Percentage:
          values.updateType === "Percentage" ? String(values.updateValue) : "0",
        HRMED_Id: Number(values.selectedHead),
        AddRemove: values.addRemove,
        LogInUserId: 0,
        // include current filter selections as lists
        groupTypeselected: values.groupType.map((v) => Number(v)),
        departmentselected: values.department.map((v) => Number(v)),
        designationselected: values.designation.map((v) => Number(v)),
        hrmgT_IdList: values.groupType.map((v) => Number(v)),
        hrmD_IdList: values.department.map((v) => Number(v)),
        hrmdeS_IdList: values.designation.map((v) => Number(v)),
        groupTypeIdList: values.groupType.map((v) => Number(v)),
      } as const;

      console.log("=== Mass Update Save Request ===");
      console.log("Payload:", payload);

      const resp = await getEmployeeDetailsBySelection(payload as any);

      console.log("=== Mass Update Save Response ===");
      console.log("Success:", resp.success);
      console.log("Message:", resp.message);
      console.log("Data:", resp.data);

      if (resp.success) {
        toast.success(resp.message || "Mass update applied successfully");
        // Optionally refresh the employee list or show updated data
        if (resp.data?.employeedropdown) {
          const updatedEmployees: Employee[] = resp.data.employeedropdown.map(
            (emp: any) => ({
              ...emp,
              selected: false,
            })
          );
          setEmployees(updatedEmployees);
          setFilteredEmployees(updatedEmployees);
        }
      } else {
        toast.error(resp.message || "Save failed");
      }
    } catch (error: any) {
      console.error("Error in mass update:", error);
      toast.error(error.message || "Save failed");
    }
  };

  const getEmployeeName = (employee: Employee) => {
    return `${employee.HRME_EmployeeFirstName} ${
      employee.HRME_EmployeeMiddleName || ""
    } ${employee.HRME_EmployeeLastName || ""}`.trim();
  };

  const getGroupTypeName = (groupTypeId: number) => {
    const groupType = groupTypes.find((gt) => gt.HRMGT_Id === groupTypeId);
    return groupType?.HRMGT_EmployeeGroupType || `Group ${groupTypeId}`;
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((d) => d.HRMD_Id === departmentId);
    return department?.HRMD_DepartmentName || `Department ${departmentId}`;
  };

  const getDesignationName = (designationId: number) => {
    const designation = designations.find((d) => d.HRMDES_Id === designationId);
    return (
      designation?.HRMDES_DesignationName || `Designation ${designationId}`
    );
  };

  const EmployeeTable = ({
    employees,
    isLoading,
    onSelectAll,
    onEmployeeSelect,
  }: {
    employees: Employee[];
    isLoading: boolean;
    onSelectAll: (selected: boolean) => void;
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
  }) => {
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
          const emp = row.original;
          return (
            <div>
              {`${emp.HRME_EmployeeFirstName} ${
                emp.HRME_EmployeeMiddleName || ""
              } ${emp.HRME_EmployeeLastName || ""}`.trim()}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: true,
      },
    ];

    return (
      <div className="rounded-lg bg-card overflow-hidden">
        <DataTable<Employee, any>
          columns={columns}
          data={employees}
          totalItems={employees.length}
          isLoading={isLoading}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Mass Updation"
              description="Update salary components for multiple employees"
            />
          </div>
        </div>

        {/* Search Form Section */}
        <CollapsibleSection
          title="Search Criteria"
          description="Select filters to search for employees"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group Type Multi-Select */}
              <div className="space-y-2">
                <Label>Group Type *</Label>
                <Controller
                  name="groupType"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={groupTypes.map((gt) => ({
                        value: gt.HRMGT_Id.toString(),
                        label: gt.HRMGT_EmployeeGroupType,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Group Types"
                      className="w-full"
                    />
                  )}
                />
              </div>

              {/* Department Multi-Select */}
              <div className="space-y-2">
                <Label>Department *</Label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={departments.map((d) => ({
                        value: d.HRMD_Id.toString(),
                        label: d.HRMD_DepartmentName,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Departments"
                      className="w-full"
                    />
                  )}
                />
              </div>

              {/* Designation Multi-Select */}
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={designations.map((d) => ({
                        value: d.HRMDES_Id.toString(),
                        label: d.HRMDES_DesignationName,
                      }))}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Designations"
                      className="w-full"
                    />
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {isSubmitting ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setEmployees([]);
                  setFilteredEmployees([]);
                  setSelectedEmployees([]);
                  setHasSearched(false);
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CollapsibleSection>

        {/* Employee Table Section - Only show after search */}
        {hasSearched && (
          <CollapsibleSection
            title="Employee Records"
            description={`Found ${filteredEmployees.length} employees`}
            defaultOpen={true}
            variant="default"
            size="lg"
            className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="space-y-4">
              {/* Earning/Deduction and Amount/Percentage Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center gap-6">
                    <span className="font-medium">Earning</span>
                    <Controller
                      name="earningDeduction"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          className="flex items-center gap-6"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Earning" id="rd-earn" />
                            <Label htmlFor="rd-earn">Earning</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Deduction" id="rd-ded" />
                            <Label htmlFor="rd-ded">Deduction</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-medium">Amount</span>
                    <Controller
                      name="updateType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          className="flex items-center gap-6"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Amount" id="rd-amt" />
                            <Label htmlFor="rd-amt">Amount</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Percentage" id="rd-per" />
                            <Label htmlFor="rd-per">Percentage</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Head</Label>
                      <Controller
                        name="selectedHead"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Head" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredHeads.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No heads available for selected
                                  Earning/Deduction and Amount/Percentage
                                </div>
                              ) : (
                                filteredHeads.map((h) => (
                                  <SelectItem
                                    key={h.HRMED_Id}
                                    value={h.HRMED_Id.toString()}
                                  >
                                    {h.HRMED_Name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {watch("updateType") === "Amount"
                          ? "Amount"
                          : "Percentage"}
                      </Label>
                      <InputText
                        type="number"
                        step="any"
                        placeholder={`Enter ${
                          watch("updateType") === "Amount"
                            ? "amount"
                            : "percentage"
                        }`}
                        {...register("updateValue", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center gap-6">
                    <span className="font-medium">Action</span>
                    <Controller
                      name="addRemove"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          className="flex items-center gap-6"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Add" id="rd-add" />
                            <Label htmlFor="rd-add">Add</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Remove" id="rd-rem" />
                            <Label htmlFor="rd-rem">Remove</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset({
                          ...getValues(),
                          earningDeduction: "Earning",
                          updateType: "Percentage",
                          updateValue: 0,
                          selectedHead: "",
                          addRemove: "Add",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
              {/* Mass Update Actions */}
              {selectedEmployees.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedEmployees.length} employee(s) selected
                  </span>
                  <Button
                    onClick={handleMassUpdate}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}

              <EmployeeTable
                employees={filteredEmployees}
                isLoading={isLoading}
                onSelectAll={handleSelectAll}
                onEmployeeSelect={handleEmployeeSelect}
              />
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
