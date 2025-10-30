"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  MoreHorizontal,
  Edit,
  Power,
  X,
  CalendarIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EMPLOYEE_LOAN_VALIDATION } from "@/lib/validation/hrms-transaction-validation";
import {
  getEmployeeLoanList,
  saveEmployeeLoan,
  activateDeactivateEmployeeLoan,
  type EmployeeDropdown,
  type MasterLoanDropdown,
  type ModeOfPaymentDropdown,
  type EmployeeLoanRecord,
} from "@/types/hrms/employee-loan";

interface EmployeeLoanForm {
  employeeId: number;
  loanTypeId: number;
  amount: number;
  installments: number;
  startDate: string;
  modeOfPayment?: string;
  referenceNo?: string;
  loanInterest?: number;
  loanEMI?: number;
}

export default function EmployeeLoanPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loans, setLoans] = useState<EmployeeLoanRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);
  const [loanTypes, setLoanTypes] = useState<MasterLoanDropdown[]>([]);
  const [paymentModes, setPaymentModes] = useState<ModeOfPaymentDropdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);
  const roleId = 2; // You can make this dynamic based on user role

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeLoanForm>({
    mode: "onChange",
    defaultValues: {
      employeeId: 0,
      loanTypeId: 0,
      amount: 0,
      installments: 0,
      startDate: "",
      modeOfPayment: "",
      referenceNo: "",
      loanInterest: 0,
      loanEMI: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await getEmployeeLoanList(roleId);

      console.log("=== Employee Loan API Response ===");
      console.log("Success:", response.success);
      console.log("Message:", response.message);
      console.log("Full Response Data:", response.data);

      if (response.success && response.data) {
        // Extract employees from employeedropdown or from emploanList
        let employeeList = response.data.employeedropdown || [];

        // If employeedropdown is empty, try to extract unique employees from emploanList
        if (
          employeeList.length === 0 &&
          response.data.emploanList?.length > 0
        ) {
          console.log("Attempting to extract employees from emploanList...");
          const uniqueEmployees = new Map();
          response.data.emploanList.forEach((loan: any, index: number) => {
            console.log(`Processing loan ${index}:`, loan);
            console.log(
              `MasterEmployee in loan ${index}:`,
              loan.MasterEmployee
            );
            if (loan.MasterEmployee && loan.MasterEmployee.HRME_Id > 0) {
              console.log(
                `Adding employee ${loan.MasterEmployee.HRME_Id} to unique list`
              );
              uniqueEmployees.set(
                loan.MasterEmployee.HRME_Id,
                loan.MasterEmployee
              );
            } else {
              console.log(`Skipping loan ${index} - no valid MasterEmployee`);
            }
          });
          employeeList = Array.from(uniqueEmployees.values());
          console.log(
            "Extracted employees from emploanList:",
            employeeList.length
          );
          console.log("Extracted employee list:", employeeList);
        }

        // If still no employees, check if there's employee data at root level
        if (employeeList.length === 0 && response.data.hrmE_EmployeeFirstName) {
          console.log(
            "Found employee data at root level, creating employee object..."
          );
          const rootEmployee = {
            HRME_Id: response.data.HRME_Id || 0,
            HRME_EmployeeFirstName: response.data.hrmE_EmployeeFirstName,
            HRME_EmployeeMiddleName:
              response.data.hrmE_EmployeeMiddleName || "",
            HRME_EmployeeLastName: response.data.hrmE_EmployeeLastName || "",
            HRME_EmployeeCode: response.data.hrmE_EmployeeCode || "",
          };
          if (rootEmployee.HRME_Id > 0) {
            employeeList = [rootEmployee];
            console.log("Created employee from root data:", rootEmployee);
          } else {
            console.log("Root employee has invalid ID (0), skipping...");
            console.log(
              "This appears to be a template response. Employee dropdown will remain empty."
            );
            console.log("To populate employees, you may need to:");
            console.log("1. Create actual loan records with valid employees");
            console.log("2. Use a different API endpoint to get employee list");
            console.log("3. Check if the API requires different parameters");
          }
        }

        setEmployees(employeeList);
        setLoanTypes(response.data.masterloandropdown || []);
        setPaymentModes(response.data.modeOfPaymentdropdown || []);
        setLoans(response.data.emploanList || []);

        console.log("=== Data Set ===");
        console.log(
          "Employees (from dropdown):",
          response.data.employeedropdown?.length || 0
        );
        console.log("Employees (extracted):", employeeList.length);
        console.log(
          "Loan Types:",
          response.data.masterloandropdown?.length || 0
        );
        console.log(
          "Payment Modes:",
          response.data.modeOfPaymentdropdown?.length || 0
        );
        console.log("Loans:", response.data.emploanList?.length || 0);

        // Check if there are any other fields that might contain employee data
        console.log(
          "Available fields in response.data:",
          Object.keys(response.data)
        );

        // Log the first loan item to see its structure
        if (response.data.emploanList?.length > 0) {
          console.log(
            "First loan item structure:",
            response.data.emploanList[0]
          );
          console.log(
            "MasterEmployee in first loan:",
            response.data.emploanList[0].MasterEmployee
          );
          console.log("All loan items:", response.data.emploanList);
        }
      } else {
        toast.error(response.message || "Failed to load data");
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    reset({
      employeeId: 0,
      loanTypeId: 0,
      amount: 0,
      installments: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      modeOfPayment: "",
      referenceNo: "",
      loanInterest: 0,
      loanEMI: 0,
    });
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset();
  };

  const onSubmit: SubmitHandler<EmployeeLoanForm> = async (
    data: EmployeeLoanForm
  ) => {
    try {
      const loanData = {
        hreL_Id: editingId || undefined,
        mI_Id: 30,
        hrmE_Id: data.employeeId,
        roleId: roleId,
        hrmlN_Id: data.loanTypeId,
        hreL_AppliedDate: data.startDate,
        hreL_LoanAmount: data.amount,
        hreL_LoanInsallments: data.installments,
        hreL_LoanStatus: "Applied", // default status when creating via UI
        hreL_SanctionedAmount: 0,
        hreL_LoanInterest: data.loanInterest || 0,
        hreL_LaonEMI: data.loanEMI || 0,
        hreL_ModeOfPayment: data.modeOfPayment || "",
        hreL_ReferenceNo: data.referenceNo || "",
        hreL_ActiveFlag: true,
      };

      const response = await saveEmployeeLoan(loanData);

      if (response.success) {
        toast.success(
          editingId
            ? "Employee loan updated successfully"
            : "Employee loan created successfully"
        );
        loadData();
        handleFormClose();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (item: EmployeeLoanRecord) => {
    setEditingId(item.HREL_Id);
    reset({
      employeeId: item.HRME_Id,
      loanTypeId: item.HRMLN_Id,
      amount: item.HREL_LoanAmount,
      installments: item.HREL_LoanInsallments,
      startDate: item.HREL_AppliedDate
        ? format(new Date(item.HREL_AppliedDate), "yyyy-MM-dd")
        : "",
      modeOfPayment: item.HREL_ModeOfPayment || "",
      referenceNo: item.HREL_ReferenceNo || "",
      loanInterest: item.HREL_LoanInterest || 0,
      loanEMI: item.HREL_LaonEMI || 0,
    });
    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await activateDeactivateEmployeeLoan({
        HREL_Id: id,
        HREL_ActiveFlag: !currentStatus,
        roleId: roleId,
      });

      if (response.success) {
        toast.success(
          `Employee loan ${
            !currentStatus ? "activated" : "deactivated"
          } successfully`
        );
        // Add a small delay to ensure the API has processed the change
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp) => emp?.HRME_Id === employeeId);
    if (!employee) return "Unknown Employee";

    const firstName = employee.HRME_EmployeeFirstName || "";
    const middleName = employee.HRME_EmployeeMiddleName || "";
    const lastName = employee.HRME_EmployeeLastName || "";

    return (
      `${firstName} ${middleName} ${lastName}`.trim() || "Unknown Employee"
    );
  };

  const getEmployeeCode = (employeeId: number) => {
    const employee = employees.find((emp) => emp?.HRME_Id === employeeId);
    return employee?.HRME_EmployeeCode || "Unknown";
  };

  const getLoanTypeName = (loanTypeId: number) => {
    const loanType = loanTypes.find((type) => type?.HRMLN_Id === loanTypeId);
    return loanType?.HRML_LoanType || "Unknown Loan Type";
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Employee Loan"
              description="Manage employee loan applications and track loan status"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAddClick}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Plus className="h-4 w-4" />
              Add Employee Loan
            </Button>
          </div>
        </div>

        {/* Employee Loan Data Table Section */}
        <CollapsibleSection
          title="Employee Loan Records"
          description="View, search, and manage all employee loans"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <EmployeeLoanTable
            loans={loans}
            isLoading={isLoading}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            getEmployeeName={getEmployeeName}
            getEmployeeCode={getEmployeeCode}
            getLoanTypeName={getLoanTypeName}
          />
        </CollapsibleSection>

        {/* Employee Loan Form - Conditionally Rendered */}
        {isFormOpen && (
          <div
            ref={formRef}
            className="slide-in-from-top-4 animate-in duration-300"
          >
            <CollapsibleSection
              title={editingId ? "Update Employee Loan" : "Add Employee Loan"}
              description="Fill in the employee loan details"
              defaultOpen={true}
              variant="outline"
              size="lg"
              className="shadow-lg"
              headerClassName=""
            >
              <div className="relative">
                <Button
                  onClick={handleFormClose}
                  variant="ghost"
                  size="sm"
                  className="-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 text-destructive" /> Close
                </Button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* First Row: Employee, Applied Date, Loan Type, Mode of Payment, Reference No */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Controller
                      name="employeeId"
                      control={control}
                      rules={EMPLOYEE_LOAN_VALIDATION.employeeId}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Employee *</Label>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <SelectTrigger
                              className={cn(
                                "transition-colors focus:ring-2 focus:ring-primary/20",
                                errors.employeeId && "border-destructive"
                              )}
                            >
                              <SelectValue placeholder="Select or search Employee in the list" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.length > 0 ? (
                                employees
                                  .filter((emp) => emp?.HRME_Id != null)
                                  .map((employee) => (
                                    <SelectItem
                                      key={employee.HRME_Id}
                                      value={employee.HRME_Id.toString()}
                                    >
                                      {employee.HRME_EmployeeCode} -{" "}
                                      {employee.HRME_EmployeeFirstName}{" "}
                                      {employee.HRME_EmployeeMiddleName || ""}{" "}
                                      {employee.HRME_EmployeeLastName || ""}
                                    </SelectItem>
                                  ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No employees available. This appears to be a
                                  template response.
                                  <br />
                                  <span className="text-xs">
                                    To add employees, create loan records with
                                    valid employee data.
                                  </span>
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {errors.employeeId && (
                            <p className="text-sm text-destructive">
                              {errors.employeeId.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Applied Date *</Label>
                      <Controller
                        name="startDate"
                        control={control}
                        rules={EMPLOYEE_LOAN_VALIDATION.appliedDate}
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
                                  ? format(new Date(field.value), "PPP")
                                  : "Select Date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                      {errors.startDate && (
                        <p className="text-sm text-destructive">
                          {errors.startDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Controller
                      name="loanTypeId"
                      control={control}
                      rules={EMPLOYEE_LOAN_VALIDATION.loanTypeId}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Loan Type *</Label>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={field.value?.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {loanTypes
                                .filter((type) => type?.HRMLN_Id != null)
                                .map((loanType) => (
                                  <SelectItem
                                    key={loanType.HRMLN_Id}
                                    value={loanType.HRMLN_Id.toString()}
                                  >
                                    {loanType.HRML_LoanType} (Max: ₹
                                    {loanType.HRML_Max?.toLocaleString() || 0})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {errors.loanTypeId && (
                            <p className="text-sm text-destructive">
                              {errors.loanTypeId.message}
                            </p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      name="modeOfPayment"
                      control={control}
                      rules={EMPLOYEE_LOAN_VALIDATION.modeOfPayment}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Mode Of Payment *</Label>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentModes
                                .filter(
                                  (mode) =>
                                    mode?.IVRMMOD_Id != null &&
                                    mode?.IVRMMOD_ModeOfPayment
                                )
                                .map((mode) => (
                                  <SelectItem
                                    key={mode.IVRMMOD_Id}
                                    value={mode.IVRMMOD_ModeOfPayment}
                                  >
                                    {mode.IVRMMOD_ModeOfPayment}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Controller
                      name="referenceNo"
                      control={control}
                      rules={EMPLOYEE_LOAN_VALIDATION.referenceNo}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Reference No.</Label>
                          <InputText
                            label="Reference No."
                            id="referenceNo"
                            placeholder="Enter reference number (max 20 characters, numbers only)"
                            {...field}
                            error={errors.referenceNo?.message}
                            className="transition-colors focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* Second Row: Loan Amount, Loan Interest, Loan Installments, Loan EMI */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <InputText
                      label="Loan Amount *"
                      type="number"
                      id="amount"
                      step="0.01"
                      placeholder="Enter loan amount (max 10 digits including decimals)"
                      {...register(
                        "amount",
                        EMPLOYEE_LOAN_VALIDATION.loanAmount
                      )}
                      error={errors.amount?.message}
                      className="transition-colors focus:ring-2 focus:ring-primary/20"
                    />

                    <InputText
                      label="Loan Interest *"
                      type="number"
                      id="loanInterest"
                      step="0.01"
                      placeholder="Enter loan interest (max 5 digits including decimals)"
                      {...register(
                        "loanInterest",
                        EMPLOYEE_LOAN_VALIDATION.loanInterest
                      )}
                      error={errors.loanInterest?.message}
                      className="transition-colors focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <InputText
                      label="Loan Installments (IN MONTHS) *"
                      type="number"
                      id="installments"
                      placeholder="Enter loan installments (max 4 digits)"
                      {...register(
                        "installments",
                        EMPLOYEE_LOAN_VALIDATION.loanInstallments
                      )}
                      error={errors.installments?.message}
                      className="transition-colors focus:ring-2 focus:ring-primary/20"
                    />

                    <InputText
                      label="Loan EMI *"
                      type="number"
                      id="loanEMI"
                      step="0.01"
                      placeholder="Enter loan EMI (max 10 digits including decimals)"
                      {...register("loanEMI", EMPLOYEE_LOAN_VALIDATION.loanEMI)}
                      error={errors.loanEMI?.message}
                      className="transition-colors focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Removed additional fields (Sanctioned Amount, Status, Remarks) to match old form */}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFormClose}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? "Saving..."
                        : editingId
                        ? "Update"
                        : "Save"}
                    </Button>
                  </div>
                </form>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}

// Employee Loan Table Component
interface EmployeeLoanTableProps {
  loans: EmployeeLoanRecord[];
  isLoading: boolean;
  onEdit: (loan: EmployeeLoanRecord) => void;
  onToggleActive: (id: number, currentStatus: boolean) => void;
  getEmployeeName: (employeeId: number) => string;
  getEmployeeCode: (employeeId: number) => string;
  getLoanTypeName: (loanTypeId: number) => string;
}

function EmployeeLoanTable({
  loans,
  isLoading,
  onEdit,
  onToggleActive,
  getEmployeeName,
  getEmployeeCode,
  getLoanTypeName,
}: EmployeeLoanTableProps) {
  const columns: ColumnDef<EmployeeLoanRecord>[] = [
    {
      id: "serialNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="S.No." />
      ),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div>{continuousIndex}</div>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "employee",
      accessorKey: "HRME_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) => {
        const employeeId = row.getValue("employee") as number;
        return (
          <div>
            <div className="font-medium">{getEmployeeName(employeeId)}</div>
            <div className="text-sm text-muted-foreground">
              {getEmployeeCode(employeeId)}
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "loanType",
      accessorKey: "HRMLN_Id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loan Type" />
      ),
      cell: ({ row }) => <div>{getLoanTypeName(row.getValue("loanType"))}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "amount",
      accessorKey: "HREL_LoanAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("amount")).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "installments",
      accessorKey: "HREL_LoanInsallments",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loan Installments" />
      ),
      cell: ({ row }) => <div>{row.getValue("installments")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "emi",
      accessorKey: "HREL_LaonEMI",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loan EMI" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("emi") || 0).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "appliedDate",
      accessorKey: "HREL_AppliedDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applied Date" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("appliedDate") as string;
        return <div>{date ? format(new Date(date), "dd/MM/yyyy") : "-"}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "status",
      accessorKey: "HREL_LoanStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const loan = row.original;
        const isActive = loan.HREL_ActiveFlag === true;

        return (
          <Badge
            variant={isActive ? "success" : "destructive"}
            className="text-xs"
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "totalPending",
      accessorKey: "HREL_TotalPending",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Pending" />
      ),
      cell: ({ row }) => (
        <div>₹{Number(row.getValue("totalPending") || 0).toLocaleString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const loan = row.original;
        const isActive = loan.HREL_ActiveFlag === true;

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
                  onClick={() => onEdit(loan)}
                  className="w-full justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onToggleActive(loan.HREL_Id, isActive)}
                  className={`w-full justify-start ${
                    isActive ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="rounded-lg bg-card overflow-hidden">
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={loans}
        totalItems={loans.length}
        showViewOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
