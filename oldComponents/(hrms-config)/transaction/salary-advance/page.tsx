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
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  X,
  CalendarIcon,
  RefreshCw,
  Plus,
  Edit,
  Power,
  MoreHorizontal,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getSalaryAdvanceList,
  saveSalaryAdvance,
  toggleSalaryAdvanceStatus,
} from "@/types/hrms/salary-advance";
import type {
  SalaryAdvanceItem,
  EmployeeDropdown,
  LeaveYearDropdown,
  MonthDropdown,
  ModeOfPaymentDropdown,
} from "@/types/hrms/salary-advance";

// Data interfaces
interface SalaryAdvance extends SalaryAdvanceItem {
  selected?: boolean;
}

interface SalaryAdvanceForm {
  employeeId: string;
  entryDate: string;
  advanceYear: string;
  advanceMonth: string;
  appliedAmount: number;
  remarks: string;
  modeOfPayment: string;
  referenceNo: number;
}

export default function SalaryAdvancePage() {
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [filteredAdvances, setFilteredAdvances] = useState<SalaryAdvance[]>([]);
  const [selectedAdvances, setSelectedAdvances] = useState<number[]>([]);
  const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
  const [leaveYears, setLeaveYears] = useState<LeaveYearDropdown[]>([]);
  const [months, setMonths] = useState<MonthDropdown[]>([]);
  const [modeOfPayments, setModeOfPayments] = useState<ModeOfPaymentDropdown[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const roleId = 2; // TODO: Get from auth context

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<SalaryAdvanceForm>({
    mode: "onChange",
    defaultValues: {
      employeeId: "",
      entryDate: "",
      advanceYear: "",
      advanceMonth: "",
      appliedAmount: 0,
      remarks: "",
      modeOfPayment: "",
      referenceNo: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await getSalaryAdvanceList(roleId);

      console.log("=== Salary Advance Response ===");
      console.log("Success:", response.success);
      console.log("Data:", response.data);

      if (response.success && response.data) {
        // Set dropdown data from API response
        setEmployees(response.data.employeedropdown || []);
        setLeaveYears(response.data.leaveyeardropdown || []);
        setMonths(response.data.monthdropdown || []);
        setModeOfPayments(response.data.modeOfPaymentdropdown || []);

        // Set salary advance list
        const mappedAdvances: SalaryAdvance[] = (
          response.data.empadvaList || []
        ).map((advance: any) => ({
          ...advance,
          selected: false,
        }));

        setSalaryAdvances(mappedAdvances);
        setFilteredAdvances(mappedAdvances);

        console.log("Employees:", response.data.employeedropdown?.length || 0);
        console.log(
          "Leave Years:",
          response.data.leaveyeardropdown?.length || 0
        );
        console.log("Months:", response.data.monthdropdown?.length || 0);
        console.log(
          "Mode of Payments:",
          response.data.modeOfPaymentdropdown?.length || 0
        );
        console.log("Salary Advances:", mappedAdvances.length);
      } else {
        toast.error(response.message || "Failed to load data");
      }
    } catch (error: any) {
      console.error("Error loading salary advance data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<SalaryAdvanceForm> = async (
    data: SalaryAdvanceForm
  ) => {
    try {
      setIsSubmitting(true);

      const payload = {
        MI_Id: 30,
        HRME_Id: Number(data.employeeId),
        HRESA_EntryDate: data.entryDate,
        HRESA_AdvYear: Number(data.advanceYear),
        HRESA_AdvMonth: data.advanceMonth,
        HRESA_AppliedAmount: data.appliedAmount,
        HRESA_Remarks: data.remarks,
        HRESA_ActiveFlag: true,
        HRESA_AdvStatus: "Pending",
        HRESA_SanctinedAmount: 0,
        HRESA_ModeOfPayment: data.modeOfPayment,
        HRESA_ReferenceNo: data.referenceNo,
        roleId: roleId,
      };

      console.log("=== Salary Advance Save Request ===");
      console.log("Payload:", payload);

      const response = await saveSalaryAdvance(payload);

      console.log("=== Salary Advance Save Response ===");
      console.log("Success:", response.success);
      console.log("Message:", response.message);

      if (response.success) {
        toast.success(response.message || "Salary advance saved successfully");
        reset();
        setEditingId(null);
        setShowForm(false);
        loadData(); // Reload data to get updated list
      } else {
        toast.error(response.message || "Save failed");
      }
    } catch (error: any) {
      console.error("Error saving salary advance:", error);
      toast.error(error.message || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (advance: SalaryAdvance) => {
    setEditingId(advance.HRESA_Id);
    setShowForm(true);
    setValue("employeeId", advance.HRME_Id.toString());
    setValue(
      "entryDate",
      advance.HRESA_EntryDate
        ? format(new Date(advance.HRESA_EntryDate), "yyyy-MM-dd")
        : ""
    );
    setValue("advanceYear", advance.HRESA_AdvYear.toString());
    setValue("advanceMonth", advance.HRESA_AdvMonth);
    setValue("appliedAmount", advance.HRESA_AppliedAmount);
    setValue("remarks", advance.HRESA_Remarks);
    setValue("modeOfPayment", advance.HRESA_ModeOfPayment);
    setValue("referenceNo", advance.HRESA_ReferenceNo);
  };

  const handleToggleActive = async (
    advanceId: number,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      const response = await toggleSalaryAdvanceStatus(advanceId);

      if (response.success) {
        toast.success(
          `Successfully ${
            newStatus ? "activated" : "deactivated"
          } the salary advance record`
        );
        loadData(); // Reload data to reflect the changes
      } else {
        toast.error(response.message || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAdvances(filteredAdvances.map((advance) => advance.HRESA_Id));
    } else {
      setSelectedAdvances([]);
    }
  };

  const handleAdvanceSelect = (advanceId: number, selected: boolean) => {
    if (selected) {
      setSelectedAdvances((prev) => [...prev, advanceId]);
    } else {
      setSelectedAdvances((prev) => prev.filter((id) => id !== advanceId));
    }
  };

  const getEmployeeName = (employee: EmployeeDropdown) => {
    return `${employee.HRME_EmployeeFirstName} ${
      employee.HRME_EmployeeMiddleName || ""
    } ${employee.HRME_EmployeeLastName || ""}`.trim();
  };

  const getEmployeeCode = (employeeId: number) => {
    const employee = employees.find((emp) => emp.HRME_Id === employeeId);
    return employee?.HRME_EmployeeCode || `EMP${employeeId}`;
  };

  const getLeaveYearName = (yearId: number) => {
    const year = leaveYears.find((y) => y.HRMLY_Id === yearId);
    return year?.HRMLY_LeaveYear || `Year ${yearId}`;
  };

  const getMonthName = (monthId: number) => {
    const month = months.find((m) => m.IVRM_Month_Id === monthId);
    return month?.IVRM_Month_Name || `Month ${monthId}`;
  };

  const getModeOfPaymentName = (modeId: number) => {
    const mode = modeOfPayments.find((m) => m.IVRMMOD_Id === modeId);
    return mode?.IVRMMOD_ModeOfPayment || `Mode ${modeId}`;
  };

  const SalaryAdvanceTable = ({
    advances,
    isLoading,
    onSelectAll,
    onAdvanceSelect,
    onEdit,
    onToggleActive,
    getEmployeeCode,
    getEmployeeName,
    getLeaveYearName,
    getMonthName,
    getModeOfPaymentName,
  }: {
    advances: SalaryAdvance[];
    isLoading: boolean;
    onSelectAll: (selected: boolean) => void;
    onAdvanceSelect: (advanceId: number, selected: boolean) => void;
    onEdit: (advance: SalaryAdvance) => void;
    onToggleActive: (advanceId: number, currentStatus: boolean) => void;
    getEmployeeCode: (employeeId: number) => string;
    getEmployeeName: (employee: EmployeeDropdown) => string;
    getLeaveYearName: (yearId: number) => string;
    getMonthName: (monthId: number) => string;
    getModeOfPaymentName: (modeId: number) => string;
  }) => {
    const columns: ColumnDef<SalaryAdvance>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              advances.length > 0 && selectedAdvances.length === advances.length
            }
            onCheckedChange={(value) => onSelectAll(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedAdvances.includes(row.original.HRESA_Id)}
            onCheckedChange={(value) =>
              onAdvanceSelect(row.original.HRESA_Id, !!value)
            }
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "HRESA_Id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sl. No." />
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
        accessorKey: "HRME_Id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee Code" />
        ),
        cell: ({ row }) => (
          <div>{getEmployeeCode(row.getValue("HRME_Id"))}</div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "MasterEmployee",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Employee Name" />
        ),
        cell: ({ row }) => {
          const employee = row.getValue("MasterEmployee") as EmployeeDropdown;
          return <div>{getEmployeeName(employee)}</div>;
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "HRESA_AdvYear",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Advance Year" />
        ),
        cell: ({ row }) => (
          <div>{getLeaveYearName(row.getValue("HRESA_AdvYear"))}</div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "HRESA_AdvMonth",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Advance Month" />
        ),
        cell: ({ row }) => (
          <div>{getMonthName(Number(row.getValue("HRESA_AdvMonth")))}</div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "HRESA_AppliedAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Applied Amount" />
        ),
        cell: ({ row }) => (
          <div>₹{row.getValue("HRESA_AppliedAmount")?.toLocaleString()}</div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "HRESA_AdvStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue("HRESA_AdvStatus") as string;
          return (
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              )}
            >
              {status}
            </span>
          );
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: "actions",
        header: "Actions",
        accessorFn: (row: any) => {
          return row;
        },
        enableSorting: false,
        cell: ({ cell }: { cell: any }) => {
          const advance = cell.getValue() as SalaryAdvance;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <div className="flex-justify-between flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEdit(advance)}
                    className="w-full justify-start"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      onToggleActive(advance.HRESA_Id, advance.HRESA_ActiveFlag)
                    }
                    className={`w-full justify-start ${
                      advance.HRESA_ActiveFlag
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    {advance.HRESA_ActiveFlag ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    return (
      <div className="rounded-lg bg-card overflow-hidden">
        <DataTable<SalaryAdvance, any>
          columns={columns}
          data={advances}
          totalItems={advances.length}
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
              title="Salary Advance"
              description="Manage employee salary advance requests"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                reset();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Salary Advance
            </Button>
          </div>
        </div>

        {/* Form Section - Only show when showForm is true */}
        {showForm && (
          <CollapsibleSection
            title={editingId ? "Edit Salary Advance" : "Add New Salary Advance"}
            description="Enter salary advance details"
            defaultOpen={true}
            variant="default"
            size="lg"
            className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Selection */}
                <div className="space-y-2">
                  <Label>Employee *</Label>
                  <Controller
                    name="employeeId"
                    control={control}
                    rules={{ required: "Please select an employee" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem
                              key={emp.HRME_Id}
                              value={emp.HRME_Id.toString()}
                            >
                              {emp.HRME_EmployeeCode} - {getEmployeeName(emp)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.employeeId && (
                    <p className="text-sm text-red-500">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>

                {/* Entry Date */}
                <div className="space-y-2">
                  <Label>Entry Date *</Label>
                  <Controller
                    name="entryDate"
                    control={control}
                    rules={{ required: "Please select entry date" }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(new Date(field.value), "dd/MM/yyyy")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.entryDate && (
                    <p className="text-sm text-red-500">
                      {errors.entryDate.message}
                    </p>
                  )}
                </div>

                {/* Advance Year */}
                <div className="space-y-2">
                  <Label>Advance Year *</Label>
                  <Controller
                    name="advanceYear"
                    control={control}
                    rules={{ required: "Please select advance year" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveYears.map((year) => (
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
                  {errors.advanceYear && (
                    <p className="text-sm text-red-500">
                      {errors.advanceYear.message}
                    </p>
                  )}
                </div>

                {/* Advance Month */}
                <div className="space-y-2">
                  <Label>Advance Month *</Label>
                  <Controller
                    name="advanceMonth"
                    control={control}
                    rules={{ required: "Please select advance month" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem
                              key={month.IVRM_Month_Id}
                              value={month.IVRM_Month_Id.toString()}
                            >
                              {month.IVRM_Month_Name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.advanceMonth && (
                    <p className="text-sm text-red-500">
                      {errors.advanceMonth.message}
                    </p>
                  )}
                </div>

                {/* Applied Amount */}
                <div className="space-y-2">
                  <Label>Applied Amount *</Label>
                  <InputText
                    type="number"
                    step="any"
                    placeholder="Enter amount"
                    {...register("appliedAmount", {
                      required: "Please enter applied amount",
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0",
                      },
                    })}
                  />
                  {errors.appliedAmount && (
                    <p className="text-sm text-red-500">
                      {errors.appliedAmount.message}
                    </p>
                  )}
                </div>

                {/* Mode of Payment */}
                <div className="space-y-2">
                  <Label>Mode of Payment *</Label>
                  <Controller
                    name="modeOfPayment"
                    control={control}
                    rules={{ required: "Please select mode of payment" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Payment Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {modeOfPayments.map((mode) => (
                            <SelectItem
                              key={mode.IVRMMOD_Id}
                              value={mode.IVRMMOD_Id.toString()}
                            >
                              {mode.IVRMMOD_ModeOfPayment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.modeOfPayment && (
                    <p className="text-sm text-red-500">
                      {errors.modeOfPayment.message}
                    </p>
                  )}
                </div>

                {/* Reference No */}
                <div className="space-y-2">
                  <Label>Reference No</Label>
                  <InputText
                    type="number"
                    placeholder="Enter reference number"
                    {...register("referenceNo", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label>Remarks</Label>
                <InputText
                  placeholder="Enter remarks"
                  {...register("remarks")}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || formIsSubmitting}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmitting || formIsSubmitting
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CollapsibleSection>
        )}

        {/* Salary Advance List Section */}
        <CollapsibleSection
          title="Salary Advance Records"
          description={`Found ${filteredAdvances.length} salary advance records`}
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="space-y-4">
            {/* Bulk Actions */}
            {selectedAdvances.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedAdvances.length} record(s) selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement bulk actions here
                    toast.info("Bulk actions not implemented yet");
                  }}
                >
                  Bulk Actions
                </Button>
              </div>
            )}

            <SalaryAdvanceTable
              advances={filteredAdvances}
              isLoading={isLoading}
              onSelectAll={handleSelectAll}
              onAdvanceSelect={handleAdvanceSelect}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              getEmployeeCode={getEmployeeCode}
              getEmployeeName={getEmployeeName}
              getLeaveYearName={getLeaveYearName}
              getMonthName={getMonthName}
              getModeOfPaymentName={getModeOfPaymentName}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
