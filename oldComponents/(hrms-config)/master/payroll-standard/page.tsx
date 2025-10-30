"use client";

import { Heading } from "@/components/layout/heading";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, RefreshCw, Database } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  getOnloadPayrollStandardDetails,
  saveMasterPayrollStandardFacade,
  testMasterPayrollStandardAPI,
} from "@/server/hrms/hrmsConfig/master/payroll-standard";
import type {
  MasterPayrollStandardResponse,
  PayrollStandardDetail,
  MasterPayrollStandardInput,
  MonthDropdown,
} from "@/types/hrms/master-payroll-standard";

type PayrollStandardForm = {
  HRC_PFAccNoPrefix: string;
  HRC_PFMaxAmt: number;
  HRC_FPFPer: number;
  HRC_EPFPer: number;
  HRC_ARTFPFPer: number;
  HRC_ARTEPFPer: number;
  HRC_AccNo2: number;
  HRC_AC2MinAmount: number;
  HRC_AccNo21: number;
  HRC_AC21MinAmount: number;
  HRC_AccNo22: number;
  HRC_AC22MinAmount: number;
  HRC_EducationCess: number;
  HRC_partAmaxflag: number;
  HRC_partBmaxflag: number;
  HRC_AsPerEmpFlag: boolean;
  HRC_RetirementYrs: number;

  HRC_ECodePrefix: string;
  HRC_ESIMax: number;
  HRC_ESIMaxAmount: number;
  HRC_ESIEmplrCont: number;

  HRC_ArrSalaryFlag: boolean | string;
  HRC_CummArrFlag: boolean | string;

  HRC_SalApprovalFlg: boolean;
  HRC_SalAdvApprovalFlg: boolean;
  HRC_LoanApprovalFlg: boolean;
  HRC_LeaveApprovalFlg: boolean;
  HRC_IncrementApprovalFlg: boolean;
  HRC_ProbationApprovalFlg: boolean;

  HRC_PayMethodFlg: string;

  HRC_NoOfOptionalHolidays: number;
  HRC_FixedIncrmentFlg: boolean;
  HRC_MinimumWorkingPeriod: number;
  HRC_IncrementMonth: string;
  HRC_IncrementOnceInMonths: number;
  HRC_AlertDay: number;

  HRC_SalaryFromDay: number;
  HRC_SalaryToDay: number;
};

export default function PayrollStandardMasterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [roleId] = useState(4); // Default role ID
  const [monthOptions, setMonthOptions] = useState<MonthDropdown[]>([]);
  const [existingData, setExistingData] =
    useState<PayrollStandardDetail | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PayrollStandardForm>({
    mode: "onChange",
    defaultValues: {
      HRC_PFAccNoPrefix: "",
      HRC_PFMaxAmt: 0,
      HRC_FPFPer: 0,
      HRC_EPFPer: 0,
      HRC_ARTFPFPer: 0,
      HRC_ARTEPFPer: 0,
      HRC_AccNo2: 0,
      HRC_AC2MinAmount: 0,
      HRC_AccNo21: 0,
      HRC_AC21MinAmount: 0,
      HRC_AccNo22: 0,
      HRC_AC22MinAmount: 0,
      HRC_EducationCess: 0,
      HRC_partAmaxflag: 0,
      HRC_partBmaxflag: 0,
      HRC_AsPerEmpFlag: false,
      HRC_RetirementYrs: 0,

      HRC_ECodePrefix: "",
      HRC_ESIMax: 0,
      HRC_ESIMaxAmount: 0,
      HRC_ESIEmplrCont: 0,

      HRC_ArrSalaryFlag: false,
      HRC_CummArrFlag: false,

      HRC_SalApprovalFlg: false,
      HRC_SalAdvApprovalFlg: false,
      HRC_LoanApprovalFlg: false,
      HRC_LeaveApprovalFlg: false,
      HRC_IncrementApprovalFlg: false,
      HRC_ProbationApprovalFlg: false,

      HRC_PayMethodFlg: "",

      HRC_NoOfOptionalHolidays: 0,
      HRC_FixedIncrmentFlg: false,
      HRC_MinimumWorkingPeriod: 0,
      HRC_IncrementMonth: "",
      HRC_IncrementOnceInMonths: 0,
      HRC_AlertDay: 0,

      HRC_SalaryFromDay: 0,
      HRC_SalaryToDay: 0,
    },
  });

  // Load data on component mount
  useEffect(() => {
    // Add a small delay to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      loadPayrollStandardData();
    }, 100);

    // Cleanup function to abort ongoing requests and clear timeout
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [roleId]);

  const loadPayrollStandardData = async () => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      const response = await getOnloadPayrollStandardDetails(
        roleId,
        abortControllerRef.current?.signal
      );
      if (response.success && response.data) {
        // Set month dropdown options
        setMonthOptions(response.data.monthdropdown || []);

        // Set existing data if available
        if (
          response.data.hrStandardList &&
          response.data.hrStandardList.length > 0
        ) {
          const existingRecord = response.data.hrStandardList[0];
          setExistingData(existingRecord);
          toast.success("Loaded payroll standard configuration");

          // Populate form with existing data
          reset({
            HRC_PFAccNoPrefix: existingRecord.HRC_PFAccNoPrefix,
            HRC_PFMaxAmt: existingRecord.HRC_PFMaxAmt,
            HRC_FPFPer: existingRecord.HRC_FPFPer,
            HRC_EPFPer: existingRecord.HRC_EPFPer,
            HRC_ARTFPFPer: existingRecord.HRC_ARTFPFPer,
            HRC_ARTEPFPer: existingRecord.HRC_ARTEPFPer,
            HRC_AccNo2: existingRecord.HRC_AccNo2,
            HRC_AC2MinAmount: existingRecord.HRC_AC2MinAmount,
            HRC_AccNo21: existingRecord.HRC_AccNo21,
            HRC_AC21MinAmount: existingRecord.HRC_AC21MinAmount,
            HRC_AccNo22: existingRecord.HRC_AccNo22,
            HRC_AC22MinAmount: existingRecord.HRC_AC22MinAmount,
            HRC_EducationCess: existingRecord.HRC_EducationCess,
            HRC_partAmaxflag: existingRecord.HRC_partAmaxflag,
            HRC_partBmaxflag: existingRecord.HRC_partBmaxflag,
            HRC_AsPerEmpFlag: existingRecord.HRC_AsPerEmpFlag,
            HRC_RetirementYrs: existingRecord.HRC_RetirementYrs,

            HRC_ECodePrefix: existingRecord.HRC_ECodePrefix,
            HRC_ESIMax: existingRecord.HRC_ESIMax,
            HRC_ESIMaxAmount: existingRecord.HRC_ESIMaxAmount,
            HRC_ESIEmplrCont: existingRecord.HRC_ESIEmplrCont,

            HRC_ArrSalaryFlag: existingRecord.HRC_ArrSalaryFlag,
            HRC_CummArrFlag: existingRecord.HRC_CummArrFlag,

            HRC_SalApprovalFlg: existingRecord.HRC_SalApprovalFlg,
            HRC_SalAdvApprovalFlg: existingRecord.HRC_SalAdvApprovalFlg,
            HRC_LoanApprovalFlg: existingRecord.HRC_LoanApprovalFlg,
            HRC_LeaveApprovalFlg: existingRecord.HRC_LeaveApprovalFlg,
            HRC_IncrementApprovalFlg: existingRecord.HRC_IncrementApprovalFlg,
            HRC_ProbationApprovalFlg: existingRecord.HRC_ProbationApprovalFlg,

            HRC_PayMethodFlg: existingRecord.HRC_PayMethodFlg,

            HRC_NoOfOptionalHolidays: existingRecord.HRC_NoOfOptionalHolidays,
            HRC_FixedIncrmentFlg: existingRecord.HRC_FixedIncrmentFlg,
            HRC_MinimumWorkingPeriod: existingRecord.HRC_MinimumWorkingPeriod,
            HRC_IncrementMonth: existingRecord.HRC_IncrementMonth,
            HRC_IncrementOnceInMonths: existingRecord.HRC_IncrementOnceInMonths,
            HRC_AlertDay: existingRecord.HRC_AlertDay,

            HRC_SalaryFromDay: existingRecord.HRC_SalaryFromDay,
            HRC_SalaryToDay: existingRecord.HRC_SalaryToDay,
          });
        }
      } else {
        toast.error("Failed to load payroll standard data");
      }
    } catch (error: any) {
      console.error("Error loading payroll standard data:", error);

      // Don't show error toast if request was aborted
      if (error.name !== "AbortError" && !error.message?.includes("canceled")) {
        toast.error("Failed to load payroll standard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<PayrollStandardForm> = async (
    data: PayrollStandardForm
  ) => {
    try {
      const inputData: MasterPayrollStandardInput = {
        HRC_Id: existingData?.HRC_Id || undefined,
        MI_Id: 30,
        HRC_PFMaxAmt: data.HRC_PFMaxAmt,
        HRC_FPFPer: data.HRC_FPFPer,
        HRC_EPFPer: data.HRC_EPFPer,
        HRC_AsPerEmpFlag: data.HRC_AsPerEmpFlag,
        HRC_PFAccNoPrefix: data.HRC_PFAccNoPrefix,
        HRC_AccNo2: data.HRC_AccNo2,
        HRC_AccNo21: data.HRC_AccNo21,
        HRC_AccNo22: data.HRC_AccNo22,
        HRC_RetirementYrs: data.HRC_RetirementYrs,
        HRC_ECodePrefix: data.HRC_ECodePrefix,
        HRC_ESIMax: data.HRC_ESIMax,
        HRC_ESIEmplrCont: data.HRC_ESIEmplrCont,
        HRC_PayMethodFlg: data.HRC_PayMethodFlg,
        HRC_ArrSalaryFlag:
          typeof data.HRC_ArrSalaryFlag === "string"
            ? data.HRC_ArrSalaryFlag === "true"
            : data.HRC_ArrSalaryFlag,
        HRC_CummArrFlag:
          typeof data.HRC_CummArrFlag === "string"
            ? data.HRC_CummArrFlag === "true"
            : data.HRC_CummArrFlag,
        HRC_SalaryFromDay: data.HRC_SalaryFromDay,
        HRC_SalaryToDay: data.HRC_SalaryToDay,
        HRC_ARTFPFPer: data.HRC_ARTFPFPer,
        HRC_ARTEPFPer: data.HRC_ARTEPFPer,
        HRC_ESIMaxAmount: data.HRC_ESIMaxAmount,
        HRC_AC2MinAmount: data.HRC_AC2MinAmount,
        HRC_AC21MinAmount: data.HRC_AC21MinAmount,
        HRC_AC22MinAmount: data.HRC_AC22MinAmount,
        HRC_SalAdvApprovalFlg: data.HRC_SalAdvApprovalFlg,
        HRC_LoanApprovalFlg: data.HRC_LoanApprovalFlg,
        HRC_LeaveApprovalFlg: data.HRC_LeaveApprovalFlg,
        HRC_IncrementApprovalFlg: data.HRC_IncrementApprovalFlg,
        HRC_ProbationApprovalFlg: data.HRC_ProbationApprovalFlg,
        HRC_SalApprovalFlg: data.HRC_SalApprovalFlg,
        HRC_EducationCess: data.HRC_EducationCess,
        HRC_partAmaxflag: data.HRC_partAmaxflag,
        HRC_partBmaxflag: data.HRC_partBmaxflag,
        HRC_IncrementMonth: data.HRC_IncrementMonth,
        HRC_MinimumWorkingPeriod: data.HRC_MinimumWorkingPeriod,
        HRC_FixedIncrmentFlg: data.HRC_FixedIncrmentFlg,
        HRC_NoOfOptionalHolidays: data.HRC_NoOfOptionalHolidays,
        HRC_IncrementOnceInMonths: data.HRC_IncrementOnceInMonths,
        HRC_AlertDay: data.HRC_AlertDay,
      };

      const response = await saveMasterPayrollStandardFacade(inputData);

      if (response.success) {
        toast.success("Payroll standard configuration saved successfully");
        loadPayrollStandardData(); // Reload data
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving payroll standard:", error);
      toast.error(error.message || "Operation failed");
    }
  };

  const handleReset = () => {
    reset();
    toast.info("Form reset to default values");
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Master Payroll Standard"
              description="Configure organization-wide payroll standards and calculation rules"
            />
          </div>
        </div>

        {/* Main Configuration Form */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Provident Fund + ESI Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provident Fund */}
                <div className="space-y-4">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                    <h3 className="font-semibold">Provident Fund</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputText
                      label="PF Account Prefix"
                      id="HRC_PFAccNoPrefix"
                      required
                      {...register("HRC_PFAccNoPrefix", {
                        required: "Required",
                      })}
                      error={errors.HRC_PFAccNoPrefix?.message}
                    />
                    <InputText
                      label="PF Max Amount"
                      id="HRC_PFMaxAmt"
                      type="number"
                      required
                      {...register("HRC_PFMaxAmt", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_PFMaxAmt?.message}
                    />
                    <InputText
                      label="FPF %"
                      id="HRC_FPFPer"
                      type="number"
                      required
                      {...register("HRC_FPFPer", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_FPFPer?.message}
                    />
                    <InputText
                      label="EPF %"
                      id="HRC_EPFPer"
                      type="number"
                      required
                      {...register("HRC_EPFPer", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_EPFPer?.message}
                    />
                    <InputText
                      label="EPF % After Retirement"
                      id="HRC_ARTFPFPer"
                      type="number"
                      {...register("HRC_ARTFPFPer", { valueAsNumber: true })}
                      error={errors.HRC_ARTFPFPer?.message}
                    />
                    <InputText
                      label="EPF % After Retirement (2)"
                      id="HRC_ARTEPFPer"
                      type="number"
                      {...register("HRC_ARTEPFPer", { valueAsNumber: true })}
                      error={errors.HRC_ARTEPFPer?.message}
                    />
                    <InputText
                      label="Acc No. 2 %"
                      id="HRC_AccNo2"
                      type="number"
                      {...register("HRC_AccNo2", { valueAsNumber: true })}
                      error={errors.HRC_AccNo2?.message}
                    />
                    <InputText
                      label="A/C2 Min Amount"
                      id="HRC_AC2MinAmount"
                      type="number"
                      {...register("HRC_AC2MinAmount", { valueAsNumber: true })}
                      error={errors.HRC_AC2MinAmount?.message}
                    />
                    <InputText
                      label="Acc No. 21 %"
                      id="HRC_AccNo21"
                      type="number"
                      {...register("HRC_AccNo21", { valueAsNumber: true })}
                      error={errors.HRC_AccNo21?.message}
                    />
                    <InputText
                      label="A/C21 Min Amount"
                      id="HRC_AC21MinAmount"
                      type="number"
                      {...register("HRC_AC21MinAmount", {
                        valueAsNumber: true,
                      })}
                      error={errors.HRC_AC21MinAmount?.message}
                    />
                    <InputText
                      label="Acc No. 22 %"
                      id="HRC_AccNo22"
                      type="number"
                      {...register("HRC_AccNo22", { valueAsNumber: true })}
                      error={errors.HRC_AccNo22?.message}
                    />
                    <InputText
                      label="A/C22 Min Amount"
                      id="HRC_AC22MinAmount"
                      type="number"
                      {...register("HRC_AC22MinAmount", {
                        valueAsNumber: true,
                      })}
                      error={errors.HRC_AC22MinAmount?.message}
                    />
                    <InputText
                      label="Education Cess"
                      id="HRC_EducationCess"
                      type="number"
                      {...register("HRC_EducationCess", {
                        valueAsNumber: true,
                      })}
                      error={errors.HRC_EducationCess?.message}
                    />
                    <InputText
                      label="Part A Max Limit"
                      id="HRC_partAmaxflag"
                      type="number"
                      {...register("HRC_partAmaxflag", { valueAsNumber: true })}
                      error={errors.HRC_partAmaxflag?.message}
                    />
                    <InputText
                      label="Part B Max Limit"
                      id="HRC_partBmaxflag"
                      type="number"
                      {...register("HRC_partBmaxflag", { valueAsNumber: true })}
                      error={errors.HRC_partBmaxflag?.message}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="HRC_AsPerEmpFlag"
                        {...register("HRC_AsPerEmpFlag")}
                      />
                      <label
                        htmlFor="HRC_AsPerEmpFlag"
                        className="text-sm font-medium text-foreground"
                      >
                        As Per Employee
                      </label>
                    </div>
                    <InputText
                      label="Retirement Years"
                      id="HRC_RetirementYrs"
                      type="number"
                      {...register("HRC_RetirementYrs", {
                        valueAsNumber: true,
                      })}
                      error={errors.HRC_RetirementYrs?.message}
                    />
                  </div>
                </div>

                {/* ESI */}
                <div className="space-y-4">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                    <h3 className="font-semibold">ESI</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputText
                      label="ESI Account Prefix"
                      id="HRC_ECodePrefix"
                      required
                      {...register("HRC_ECodePrefix", { required: "Required" })}
                      error={errors.HRC_ECodePrefix?.message}
                    />
                    <InputText
                      label="ESI Max (%)"
                      id="HRC_ESIMax"
                      type="number"
                      step="0.01"
                      required
                      {...register("HRC_ESIMax", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_ESIMax?.message}
                    />
                    <InputText
                      label="ESI Max Amount"
                      id="HRC_ESIMaxAmount"
                      type="number"
                      required
                      {...register("HRC_ESIMaxAmount", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_ESIMaxAmount?.message}
                    />
                    <InputText
                      label="Employer Contribution (%)"
                      id="HRC_ESIEmplrCont"
                      type="number"
                      step="0.01"
                      required
                      {...register("HRC_ESIEmplrCont", {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      error={errors.HRC_ESIEmplrCont?.message}
                    />
                  </div>
                </div>
              </div>

              {/* Arrear Details */}
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  <h3 className="font-semibold">Arrear Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Arrear Salary Report:
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="true"
                        {...register("HRC_ArrSalaryFlag")}
                      />
                      Separate Arrear Salary Report
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="false"
                        {...register("HRC_ArrSalaryFlag")}
                      />
                      Only Arrear Head
                    </label>
                  </div>
                </div>
              </div>

              {/* Approval Process */}
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  <h3 className="font-semibold">Approval Process</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_SalApprovalFlg"
                      {...register("HRC_SalApprovalFlg")}
                    />
                    Salary Approval
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_SalAdvApprovalFlg"
                      {...register("HRC_SalAdvApprovalFlg")}
                    />
                    Salary Advance
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_LoanApprovalFlg"
                      {...register("HRC_LoanApprovalFlg")}
                    />
                    Loan
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_LeaveApprovalFlg"
                      {...register("HRC_LeaveApprovalFlg")}
                    />
                    Leave
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_IncrementApprovalFlg"
                      {...register("HRC_IncrementApprovalFlg")}
                    />
                    Increment
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="HRC_ProbationApprovalFlg"
                      {...register("HRC_ProbationApprovalFlg")}
                    />
                    Probation
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  <h3 className="font-semibold">Payment Method</h3>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {[1, 2, 3, 4, 5, 6].map((method) => (
                    <label
                      key={method}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        value={`Method${method}`}
                        {...register("HRC_PayMethodFlg")}
                      />
                      Method {method}
                    </label>
                  ))}
                </div>
              </div>

              {/* Increment Process */}
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  <h3 className="font-semibold">Increment Process</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                    label="Optional Holidays"
                    id="HRC_NoOfOptionalHolidays"
                    type="number"
                    {...register("HRC_NoOfOptionalHolidays", {
                      valueAsNumber: true,
                    })}
                    error={errors.HRC_NoOfOptionalHolidays?.message}
                  />
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="HRC_FixedIncrmentFlg"
                      {...register("HRC_FixedIncrmentFlg")}
                    />
                    <label
                      htmlFor="HRC_FixedIncrmentFlg"
                      className="text-sm font-medium text-foreground"
                    >
                      Applicable
                    </label>
                  </div>
                  <InputText
                    label="Minimum Periods"
                    id="HRC_MinimumWorkingPeriod"
                    type="number"
                    {...register("HRC_MinimumWorkingPeriod", {
                      valueAsNumber: true,
                    })}
                    error={errors.HRC_MinimumWorkingPeriod?.message}
                  />
                  <Controller
                    name="HRC_IncrementMonth"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Increment Month
                        </label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                      </div>
                    )}
                  />
                  <InputText
                    label="Increment Once In Months"
                    id="HRC_IncrementOnceInMonths"
                    type="number"
                    {...register("HRC_IncrementOnceInMonths", {
                      valueAsNumber: true,
                    })}
                    error={errors.HRC_IncrementOnceInMonths?.message}
                  />
                  <InputText
                    label="Alert Days"
                    id="HRC_AlertDay"
                    type="number"
                    {...register("HRC_AlertDay", { valueAsNumber: true })}
                    error={errors.HRC_AlertDay?.message}
                  />
                </div>
              </div>

              {/* Salary Days */}
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  <h3 className="font-semibold">Salary Days</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Controller
                    name="HRC_SalaryFromDay"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">From Day</label>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Controller
                    name="HRC_SalaryToDay"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">To Day</label>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Root Error */}
              {errors.root && <FormError>{errors.root.message}</FormError>}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="transition-all duration-200 hover:scale-105 w-fit"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      SAVE
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="transition-all duration-200 hover:scale-105 w-fit"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
