'use client';

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { useFinancialYearDropdown, useGetEmployees } from "@/hooks/hrms/useMasters";
import { useVPFSummaryReport } from "@/hooks/hrms/useReports";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FormError } from "@/components/ui/extension/field";
import { Loader2, Printer, Download, Search, X } from "lucide-react";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { saveAs } from "file-saver";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Schema ---

const VPFSummaryReportSchema = z.object({
  employees: z.string().min(1, "At least one employee must be selected"),
  year: z.string().min(1, "Year is required"),
  flag: z.enum(["VPFTotalReport", "VPFGrandTotalReport", "VPFStatementReport"]),
});

type VPFSummaryReportFormValues = z.infer<typeof VPFSummaryReportSchema>;

// --- Component ---

export default function VPFSummaryReport() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
  const [financialYear, setFinancialYear] = useState<string>("");
  const [selectedFlag, setSelectedFlag] = useState<string>("VPFTotalReport");
  const [resetKey, setResetKey] = useState<number>(0);

  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployees();
  const { data: yearsData, isLoading: isLoadingYears } = useFinancialYearDropdown();
  const { mutateAsync: getVPFSummaryReport, isPending: isLoadingVPFSummary } = useVPFSummaryReport();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VPFSummaryReportFormValues>({
    resolver: zodResolver(VPFSummaryReportSchema),
    defaultValues: {
      employees: "",
      year: "",
      flag: "VPFTotalReport",
    },
  });

  const formatedEmployees = useMemo(() => {
    return (
      employeesData?.data?.map((emp: any) => ({
        label: emp.value,
        value: emp.key.toString(),
      })) || []
    );
  }, [employeesData]);

  const onSubmit = async (data: VPFSummaryReportFormValues) => {
    const selectedYear = yearsData?.data?.find(
      (y: any) => y.imfY_Id.toString() === data.year
    );
    setFinancialYear(selectedYear?.imfY_FinancialYear || "");
    setSelectedFlag(data.flag);

    const payload = {
      hrmE_Id: data.employees,
      imfY_Id: data.year,
      flag: data.flag,
    };

    try {
      const response = await getVPFSummaryReport(payload);
      if (response?.success && response?.data) {
        console.log("VPF Summary Report Response:", response);
        setReportData(response?.data?.reportData || []);
        setEmployeeDetails(response?.data?.empDetails || []);
        toast.success(`Data fetched successfully`);
      } else {
        toast.error(response?.message || "Failed to fetch report data");
      }
    } catch (error) {
      console.error("VPF Summary Report Error:", error);
      toast.error("An error occurred while fetching the report data");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-report");
    if (!printContent) return;

    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const windowName = "Print" + uniqueName;
    const printWindow = window.open(windowUrl, windowName, "left=50,top=50,width=800,height=600");

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>VPF Summary Report</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              th { background-color: #f9f9f9; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h2 { margin: 0; }
              .header h3 { margin: 5px 0; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleReset = () => {
    setReportData([]);
    setEmployeeDetails([]);
    setFinancialYear("");
    reset({
      employees: "",
      year: "",
      flag: "VPFTotalReport",
    });
    setResetKey(prev => prev + 1);
  };

  const handleExport = () => {
    const table = document.getElementById("printable-report");
    if (table) {
      const blob = new Blob([table.outerHTML], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      saveAs(blob, `VPF_Summary_Report_${financialYear}.xls`);
    } else {
      toast.error("Report content not found");
    }
  };

  // --- Calculations for Summary Table ---
  const totals = useMemo(() => {
    if (selectedFlag !== "VPFTotalReport" || reportData.length === 0) return null;
    return reportData.reduce(
      (acc, curr) => {
        acc.ob += Number(curr.hrevpfsT_VOBAmount || 0);
        acc.cont += Number(curr.hrevpfsT_Contribution || 0);
        acc.int += Number(curr.hrevpfsT_Intersest || 0);
        acc.total += Number(curr.grandtotal || curr.GRANDTOTAL || 0);
        acc.settle += Number(curr.hrevpfsT_SettledAmount || 0);
        acc.cb += Number(curr.hrevpfsT_ClosingBalance || 0);
        return acc;
      },
      {
        ob: 0, cont: 0, int: 0, total: 0, settle: 0, cb: 0
      }
    );
  }, [reportData, selectedFlag]);

  const formateFunction = (value: string) => {
    return Number(value).toFixed(0);
  }

  return (
    <div className="container min-h-screen space-y-4 p-2 pt-4 md:p-4 animate-in fade-in duration-500">
      <CollapsibleSection
        title="VPF SUMMARY REPORT"
        description="Select report type, year and employees to generate the report."
        defaultOpen={true}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-6 p-6 rounded-xl border border-slate-200">
            {/* Report Type Radio Group */}
            <Controller
              name="flag"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap justify-center gap-8"
                >
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <RadioGroupItem value="VPFTotalReport" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer font-medium text-slate-700">VPF Summary Report</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <RadioGroupItem value="VPFGrandTotalReport" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer font-medium text-slate-700">VPF Grand Total Report</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <RadioGroupItem value="VPFStatementReport" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer font-medium text-slate-700">VPF Statement Report</Label>
                  </div>
                </RadioGroup>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Year Selection */}
              <div className="space-y-2">
                <Label className="block font-semibold text-slate-700">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Controller
                  key={resetKey}
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value?.toString() ?? ""}
                      onValueChange={(value) =>
                        field.onChange(value)
                      }
                      disabled={isLoadingYears}
                    >
                      <SelectTrigger>
                        {isLoadingYears ? "Loading..." : field.value
                          ? yearsData?.data?.find(
                            (y: any) => y.imfY_Id.toString() === field.value,
                          )?.imfY_FinancialYear
                          : "Select Year"}
                      </SelectTrigger>
                      <SelectContent>
                        {yearsData?.data?.map((year: any) => (
                          <SelectItem
                            key={year.imfY_Id}
                            value={year.imfY_Id.toString()}
                          >
                            {year.imfY_FinancialYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.year && <FormError>{errors.year.message}</FormError>}
              </div>

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label className="block font-semibold text-slate-700">
                  Employees <span className="text-destructive">*</span>
                </Label>
                <Controller
                  key={`emp-${resetKey}`}
                  name="employees"
                  control={control}
                  render={({ field }) => (
                    <div className={isLoadingEmployees ? "pointer-events-none opacity-50" : ""}>
                      <MultiSelect
                        id={field.name}
                        options={formatedEmployees}
                        onValueChange={(values) => {
                          field.onChange(values.join(","));
                        }}
                        defaultValue={field.value ? field.value.split(",") : []}
                        placeholder={isLoadingEmployees ? "Loading employees..." : "Select Employees"}
                        variant="inverted"
                        className="min-h-9 bg-white"
                        disabled={isLoadingEmployees}
                      />
                    </div>
                  )}
                />
                {errors.employees && (
                  <FormError>{errors.employees.message}</FormError>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button type="submit" className="min-w-[140px] shadow-lg hover:shadow-xl transition-all" disabled={isLoadingVPFSummary}>
              {isLoadingVPFSummary ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4 " />
              )}{" "}
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-[140px] hover:bg-slate-100 transition-colors"
              onClick={handleReset}
            >
              <X className="mr-2 h-4 w-4 " /> Cancel
            </Button>
          </div>
        </form>
      </CollapsibleSection>

      {reportData.length > 0 && (
        <CollapsibleSection
          title="REPORT DETAILS"
          defaultOpen={true}
          className="mt-6 border-none shadow-xl bg-white overflow-hidden rounded-xl"
        >
          <div className="flex justify-end p-4 gap-3 border-b bg-slate-50/50 print:hidden">
            <Button
              type="button"
              variant="destructive"
              className="gap-2 shadow-md w-fit"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2 shadow-sm w-fit"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2 shadow-sm w-fit"
              onClick={handleReset}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>

          <div className="p-6 overflow-x-auto" id="printable-report">
            {/* Header Section for Print */}
            <div className="text-center mb-8 space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                {employeeDetails[0]?.mI_Name || "VPF REPORT"}
              </h1>
              <h2 className="text-lg font-semibold text-slate-600 uppercase">
                {selectedFlag === "VPFTotalReport"
                  ? "VPF SUMMARY for financial year"
                  : selectedFlag === "VPFGrandTotalReport"
                    ? "VPF Grand Total for financial year"
                    : "VPF Statement for financial year"}
                {" "}{financialYear}
              </h2>
            </div>

            {/* VPF Summary Report Table */}
            {selectedFlag === "VPFTotalReport" && (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-violet-500 text-white">
                    <th className="border border-slate-300 p-2 font-bold text-left">EMPLOYEE</th>
                    <th className="border border-slate-300 p-2 font-bold">OPENING BALANCE</th>
                    <th className="border border-slate-300 p-2 font-bold">CONTRIBUTION</th>
                    <th className="border border-slate-300 p-2 font-bold">INTEREST</th>
                    <th className="border border-slate-300 p-2 font-bold">TOTAL</th>
                    <th className="border border-slate-300 p-2 font-bold">SETTLEMENT</th>
                    <th className="border border-slate-300 p-2 font-bold">CLOSING BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 p-2 text-left font-medium">
                        {(user.hrmE_EmployeeFirstName || user.HRME_EmployeeFirstName || user.employeeName)}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">{formateFunction(user.hrevpfsT_VOBAmount || 0)}</td>
                      <td className="border border-slate-300 p-2 text-center">{formateFunction(user.hrevpfsT_Contribution || 0)}</td>
                      <td className="border border-slate-300 p-2 text-center">{formateFunction(user.hrevpfsT_Intersest || 0)}</td>
                      <td className="border border-slate-300 p-2 text-center">{formateFunction(user.grandtotal || user.GRANDTOTAL || 0)}</td>
                      <td className="border border-slate-300 p-2 text-center">{formateFunction(user.hrevpfsT_SettledAmount || 0)}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{formateFunction(user.hrevpfsT_ClosingBalance || 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="font-bold">
                  <tr>
                    <td className="border border-slate-300 p-2 text-left uppercase">GRAND TOTAL</td>
                    <td className="border border-slate-300 p-2 text-center">{(totals?.ob || 0)}</td>
                    <td className="border border-slate-300 p-2 text-center">{totals?.cont}</td>
                    <td className="border border-slate-300 p-2 text-center">{totals?.int}</td>
                    <td className="border border-slate-300 p-2 text-center">{totals?.total}</td>
                    <td className="border border-slate-300 p-2 text-center">{totals?.settle}</td>
                    <td className="border border-slate-300 p-2 text-center">{totals?.cb}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* VPF Grand Total Report Table */}
            {selectedFlag === "VPFGrandTotalReport" && (
              <table className="w-full max-w-2xl mx-auto border-collapse text-sm shadow-sm ring-1 ring-slate-200 rounded-lg overflow-hidden border border-slate-300">
                <tbody className="divide-y divide-slate-200">
                  {[
                    { label: "OPENING BALANCE", key: "hrevpfsT_VOBAmount" },
                    { label: "VPF CONTRIBUTION", key: "hrevpfsT_Contribution" },
                    { label: "PF TRANSFER", key: "hrevpfsT_TransferAmount" },
                    { label: "INTEREST", key: "hrevpfsT_Intersest" },
                    { label: "NON REFUNDABLE LOAN", key: "hrevpfsT_WithdrawnAmount" },
                    { label: "CLOSING BALANCE", key: "hrevpfsT_ClosingBalance" },
                    { label: "SETTLEMENT BALANCE", key: "hrevpfsT_SettledAmount" },
                  ].map((row, idx) => {
                    const totalValue = reportData.reduce((acc, curr) => acc + (Number(curr[row.key]) || 0), 0);
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-3 border border-slate-300 font-semibold text-slate-700 text-center w-1/2">{row.label}</td>
                        <td className="p-3 border border-slate-300 text-center w-1/2">{totalValue}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {/* VPF Statement Report Table */}
            {selectedFlag === "VPFStatementReport" && (
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-3 w-[10%]">SL NO.</th>
                    <th className="border border-slate-300 p-3 w-[30%] text-left">EMPLOYEE NAME</th>
                    <th className="border border-slate-300 p-3 w-[20%]">PF AC NO</th>
                    <th className="border border-slate-300 p-3 w-[10%]">SLIP NO</th>
                    <th className="border border-slate-300 p-3 w-[30%]">SIGNATURE</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-3 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-3 text-left font-medium">
                        {item.hrmE_EmployeeFirstName || item.HRME_EmployeeFirstName || item.employeeName}
                      </td>
                      <td className="border border-slate-300 p-3 text-center">{item.hrmE_PFAccNo || item.HRME_PFAccNo}</td>
                      <td className="border border-slate-300 p-3 text-center">{item.hrmE_EmployeeOrder || item.HRME_EmployeeOrder || idx + 1}</td>
                      <td className="border border-slate-300 p-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
