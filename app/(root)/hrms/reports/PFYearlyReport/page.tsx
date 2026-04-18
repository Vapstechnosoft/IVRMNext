"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  useFinancialYearDropdown,
  useGetEmployees,
  useLeaveYearDropdown,
} from "@/hooks/hrms/useMasters";
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
import { Printer, Download, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { saveAs } from "file-saver";
import { usePFSummaryReport } from "@/hooks/hrms/useReports";

const mockPFDetails = [
  {
    hrepfsT_Id: 5978,
    hrmE_Id: 1,
    ivrM_Month_Name: "Opening Balance",
    hrepfsT_OwnContribution: 1547166,
    hrepfsT_InstituteContribution: 1470503,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 1,
  },
  {
    hrepfsT_Id: 5978,
    hrmE_Id: 1,
    ivrM_Month_Name: "April-2023",
    hrepfsT_OwnContribution: 34215,
    hrepfsT_InstituteContribution: 34215,
    hrepfsT_OwnInterest: 10637,
    hrepfsT_InstituteInterest: 10110,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5978,
    hrmE_Id: 1,
    ivrM_Month_Name: "Total Amount",
    hrepfsT_OwnContribution: 1581381,
    hrepfsT_InstituteContribution: 1504718,
    hrepfsT_OwnInterest: 143935,
    hrepfsT_InstituteInterest: 137611,
    ordercolumn: 8,
  },
  {
    hrepfsT_Id: 5979,
    hrmE_Id: 1,
    ivrM_Month_Name: "May-2023",
    hrepfsT_OwnContribution: 35187,
    hrepfsT_InstituteContribution: 35187,
    hrepfsT_OwnInterest: 10872,
    hrepfsT_InstituteInterest: 10345,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5980,
    hrmE_Id: 1,
    ivrM_Month_Name: "June-2023",
    hrepfsT_OwnContribution: 35187,
    hrepfsT_InstituteContribution: 35187,
    hrepfsT_OwnInterest: 11114,
    hrepfsT_InstituteInterest: 10587,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5980,
    hrmE_Id: 1,
    ivrM_Month_Name: "PF Transfer",
    hrepfsT_OwnContribution: 1943,
    hrepfsT_InstituteContribution: 1943,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 5,
  },
  {
    hrepfsT_Id: 5981,
    hrmE_Id: 1,
    ivrM_Month_Name: "July-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 11369,
    hrepfsT_InstituteInterest: 10842,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5982,
    hrmE_Id: 1,
    ivrM_Month_Name: "August-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 11618,
    hrepfsT_InstituteInterest: 11091,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5983,
    hrmE_Id: 1,
    ivrM_Month_Name: "September-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 11867,
    hrepfsT_InstituteInterest: 11340,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5984,
    hrmE_Id: 1,
    ivrM_Month_Name: "October-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 12116,
    hrepfsT_InstituteInterest: 11589,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5985,
    hrmE_Id: 1,
    ivrM_Month_Name: "November-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 12365,
    hrepfsT_InstituteInterest: 11838,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5986,
    hrmE_Id: 1,
    ivrM_Month_Name: "December-2023",
    hrepfsT_OwnContribution: 36216,
    hrepfsT_InstituteContribution: 36216,
    hrepfsT_OwnInterest: 12614,
    hrepfsT_InstituteInterest: 12087,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5987,
    hrmE_Id: 1,
    ivrM_Month_Name: "January-2024",
    hrepfsT_OwnContribution: 37550,
    hrepfsT_InstituteContribution: 37550,
    hrepfsT_OwnInterest: 12863,
    hrepfsT_InstituteInterest: 12336,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5988,
    hrmE_Id: 1,
    ivrM_Month_Name: "February-2024",
    hrepfsT_OwnContribution: 37550,
    hrepfsT_InstituteContribution: 37550,
    hrepfsT_OwnInterest: 13121,
    hrepfsT_InstituteInterest: 12594,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5989,
    hrmE_Id: 1,
    ivrM_Month_Name: "March-2024",
    hrepfsT_OwnContribution: 37550,
    hrepfsT_InstituteContribution: 37550,
    hrepfsT_OwnInterest: 13379,
    hrepfsT_InstituteInterest: 12852,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 5989,
    hrmE_Id: 1,
    ivrM_Month_Name: "Closing Balance",
    hrepfsT_OwnContribution: 2127579,
    hrepfsT_InstituteContribution: 2044592,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 9,
  },
  {
    hrepfsT_Id: 6448,
    hrmE_Id: 3,
    ivrM_Month_Name: "Opening Balance",
    hrepfsT_OwnContribution: 3322748,
    hrepfsT_InstituteContribution: 2585789,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 1,
  },
  {
    hrepfsT_Id: 6448,
    hrmE_Id: 3,
    ivrM_Month_Name: "April-2023",
    hrepfsT_OwnContribution: 11717,
    hrepfsT_InstituteContribution: 10467,
    hrepfsT_OwnInterest: 22844,
    hrepfsT_InstituteInterest: 17777,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6448,
    hrmE_Id: 3,
    ivrM_Month_Name: "Total Amount",
    hrepfsT_OwnContribution: 3334465,
    hrepfsT_InstituteContribution: 2596256,
    hrepfsT_OwnInterest: 279713,
    hrepfsT_InstituteInterest: 218347,
    ordercolumn: 8,
  },
  {
    hrepfsT_Id: 6449,
    hrmE_Id: 3,
    ivrM_Month_Name: "May-2023",
    hrepfsT_OwnContribution: 12059,
    hrepfsT_InstituteContribution: 10809,
    hrepfsT_OwnInterest: 22924,
    hrepfsT_InstituteInterest: 17849,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6450,
    hrmE_Id: 3,
    ivrM_Month_Name: "June-2023",
    hrepfsT_OwnContribution: 12059,
    hrepfsT_InstituteContribution: 10809,
    hrepfsT_OwnInterest: 23007,
    hrepfsT_InstituteInterest: 17924,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6450,
    hrmE_Id: 3,
    ivrM_Month_Name: "PF Transfer",
    hrepfsT_OwnContribution: 683,
    hrepfsT_InstituteContribution: 683,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 5,
  },
  {
    hrepfsT_Id: 6451,
    hrmE_Id: 3,
    ivrM_Month_Name: "July-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23095,
    hrepfsT_InstituteInterest: 18003,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6452,
    hrmE_Id: 3,
    ivrM_Month_Name: "August-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23180,
    hrepfsT_InstituteInterest: 18079,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6453,
    hrmE_Id: 3,
    ivrM_Month_Name: "September-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23266,
    hrepfsT_InstituteInterest: 18156,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6454,
    hrmE_Id: 3,
    ivrM_Month_Name: "October-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23351,
    hrepfsT_InstituteInterest: 18233,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6455,
    hrmE_Id: 3,
    ivrM_Month_Name: "November-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23437,
    hrepfsT_InstituteInterest: 18310,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6456,
    hrmE_Id: 3,
    ivrM_Month_Name: "December-2023",
    hrepfsT_OwnContribution: 12420,
    hrepfsT_InstituteContribution: 11170,
    hrepfsT_OwnInterest: 23522,
    hrepfsT_InstituteInterest: 18387,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6457,
    hrmE_Id: 3,
    ivrM_Month_Name: "January-2024",
    hrepfsT_OwnContribution: 12888,
    hrepfsT_InstituteContribution: 11638,
    hrepfsT_OwnInterest: 23607,
    hrepfsT_InstituteInterest: 18463,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6458,
    hrmE_Id: 3,
    ivrM_Month_Name: "February-2024",
    hrepfsT_OwnContribution: 12888,
    hrepfsT_InstituteContribution: 11638,
    hrepfsT_OwnInterest: 23696,
    hrepfsT_InstituteInterest: 18543,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6459,
    hrmE_Id: 3,
    ivrM_Month_Name: "March-2024",
    hrepfsT_OwnContribution: 12888,
    hrepfsT_InstituteContribution: 11638,
    hrepfsT_OwnInterest: 23784,
    hrepfsT_InstituteInterest: 18623,
    ordercolumn: 2,
  },
  {
    hrepfsT_Id: 6459,
    hrmE_Id: 3,
    ivrM_Month_Name: "Closing Balance",
    hrepfsT_OwnContribution: 3752163,
    hrepfsT_InstituteContribution: 2938838,
    hrepfsT_OwnInterest: 0,
    hrepfsT_InstituteInterest: 0,
    ordercolumn: 9,
  },
];

const mockEmployeeDetails = [
  {
    hrmE_Id: 1,
    employeeName: "DR. TERENCE HAMILTON IRELAND",
    hrmE_EmployeeCode: "175",
    hrmE_PFAccNo: "WB/19651/192",
    mI_Name: "St. James' School",
  },
  {
    hrmE_Id: 3,
    employeeName: "MR. NAYAN RANJAN CHATTERJEE",
    hrmE_EmployeeCode: "42",
    hrmE_PFAccNo: "WB/19651/091",
    mI_Name: "St. James' School",
  },
];

interface PFYearlyReportProps {
  employees: string;
  year: string;
}

const PFYearlyReportSchema = z.object({
  employees: z.string().min(1, "At least one employee must be selected"),
  year: z.string().min(1, "Year is required"),
});

export default function PFYearlyReport() {
  const [reportData, setReportData] = useState<any[]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
  const [financialYear, setFinancialYear] = useState<string>("");

  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployees();
  const { data: yearsData, isLoading: isLoadingYears } =
    useFinancialYearDropdown();

  const { mutateAsync: fetchReportData, isPending: isLoadingPFSummary } =
    usePFSummaryReport();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PFYearlyReportProps>({
    resolver: zodResolver(PFYearlyReportSchema),
    defaultValues: {
      employees: "",
      year: "",
    },
  });

  const formatedEmployees =
    employeesData?.data?.map((emp: any) => ({
      label: emp.value,
      value: emp.key.toString(),
    })) || [];

  const onSubmit = async (data: PFYearlyReportProps) => {
    console.log("form data", data);
    const selectedYear = yearsData?.data?.find(
      (y: any) => y.imfY_Id.toString() === data.year,
    );
    setFinancialYear(selectedYear?.imfY_FinancialYear || "");

    try {
      const response = await fetchReportData({
        hrmE_Id: data.employees,
        imfY_Id: data.year,
        flag: "EmployeePFreport",
      });

      if (response?.success && response?.data) {
        setReportData(response.data.reportData || []);
        setEmployeeDetails(response.data.empDetails || []);
        toast.success(response.message || "Report generated successfully");
      } else {
        console.log("API Error:", response);
        toast.error(response?.message || "Failed to fetch report data");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error("An error occurred while fetching the report");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setReportData([]);
    setEmployeeDetails([]);
    setFinancialYear("");
    reset({
      employees: "",
      year: "",
    });
  };

  const handleExport = () => {
    const divToPrint = document.getElementById("printable-report");
    if (divToPrint) {
      const blob = new Blob([divToPrint.outerHTML], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      saveAs(blob, "PFYearlyReport.xls");
    } else {
      toast.error("Report content not found");
    }
  };

  const todayDate = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");

  return (
    <>
      <style>
        {`
                @media print {
                    body * {
                        visibility: hidden;
                    }

                    #printable-report,
                    #printable-report * {
                        visibility: visible;
                    }

                    #printable-report {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                    
                    .page-break-after-always {
                        page-break-after: always;
                    }
                }
                
                #printable-report h4, #printable-report h5 {
                    margin: 0;
                    padding: 0;
                    font-size: 14px;
                }
                
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                .report-table th, .report-table td {
                    border: 1px solid #000 !important;
                    padding: 4px 8px;
                    font-size: 12px;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .font-bold {
                    font-weight: bold;
                }
                `}
      </style>
      <div className="container min-h-screen space-y-4 p-2 pt-4 md:p-4">
        <CollapsibleSection
          title="PF YEARLY REPORT"
          description="Filter the report data by selecting the year and employees."
          defaultOpen={true}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
            <div className="rounded-md p-4 w-full mx-auto  flex justify-center gap-6">
              <div className="w-1/2">
                <Label className="mb-2 block font-semibold">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value ?? ""}
                      onValueChange={(value) => field.onChange(value)}
                      disabled={isLoadingYears}
                    >
                      <SelectTrigger>
                        {isLoadingYears
                          ? "Loading years..."
                          : field.value
                            ? yearsData?.data?.find(
                                (y: any) =>
                                  y.imfY_Id.toString() === field.value,
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
              <div className="w-1/2">
                <Label className="mb-2 block font-semibold">
                  Employees <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="employees"
                  control={control}
                  disabled={isLoadingEmployees}
                  render={({ field }) => (
                    <div
                      className={
                        isLoadingEmployees
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    >
                      <MultiSelect
                        id={field.name}
                        options={formatedEmployees}
                        onValueChange={(values) => {
                          field.onChange(values.join(", "));
                        }}
                        defaultValue={
                          field.value ? field.value.split(", ") : []
                        }
                        placeholder={
                          isLoadingEmployees
                            ? "Loading employees..."
                            : "Select Employees"
                        }
                        variant="inverted"
                        className="min-h-9"
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
            <div className="flex gap-2 justify-center">
              <Button type="submit" className="w-[120px]">
                {isLoadingPFSummary ? (
                  <Loader2 className=" h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}{" "}
                Generate
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-[120px]"
                onClick={handleReset}
              >
                <X className="mr-2 h-4 w-4 " /> Cancel
              </Button>
            </div>
          </form>
        </CollapsibleSection>

        {reportData.length > 0 && (
          <CollapsibleSection
            title="PF YEARLY REPORT"
            defaultOpen={true}
            className="mt-6 shadow-sm"
          >
            <div className="flex justify-end mb-4 gap-2 border-b pb-4 print:hidden">
              <Button
                type="button"
                variant="destructive"
                className="gap-2 w-fit "
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="gap-2 w-fit "
                onClick={handleExport}
              >
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={handleReset}
              >
                <X className="h-4 w-4 " /> Cancel
              </Button>
            </div>

            <div className="space-y-12" id="printable-report">
              {employeeDetails.map((emp, index) => (
                <div
                  key={emp.hrmE_Id}
                  className="page-break-after-always border-[1px] border-black p-6"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 w-full border-b border-black pb-2 items-center">
                      <div className="text-left font-bold text-lg">
                        {emp.mI_Name || "St. James' School"}
                      </div>
                      <div className="text-center font-bold text-lg">
                        {todayDate}
                      </div>
                      <div className="text-right font-bold text-lg">
                        SLIP NO : {index + 1}
                      </div>
                    </div>

                    {/* Statement Title */}
                    <div className="text-center py-2">
                      <h4 className="font-bold text-xl uppercase">
                        PF STATEMENT as On 31 MAR{" "}
                        {financialYear.split("-")[1] || financialYear}
                      </h4>
                    </div>

                    {/* Employee Info */}
                    <div className="grid grid-cols-12 w-full gap-4 pt-2">
                      <div className="col-span-8">
                        <h5 className="font-bold">
                          EMPLOYEE :&nbsp;&nbsp;
                          <span className="font-normal">
                            {emp.hrmE_EmployeeCode}
                          </span>
                          &nbsp;&nbsp;
                          <span className="font-normal">
                            {emp.employeeName}
                          </span>
                        </h5>
                      </div>
                      <div className="col-span-4 text-right">
                        <h5 className="font-bold">
                          PF A/C NO:&nbsp;&nbsp;
                          <span className="font-normal">
                            {emp.hrmE_PFAccNo}
                          </span>
                        </h5>
                      </div>
                    </div>

                    {/* Manual Table Header for Contribution/Interest */}
                    <div className="grid grid-cols-12 w-full mt-4 border-t border-l border-r border-black font-bold text-center bg-gray-50">
                      <div className="col-span-4 py-2 border-r border-black"></div>
                      <div className="col-span-4 py-2 border-r border-black">
                        CONTRIBUTION
                      </div>
                      <div className="col-span-4 py-2">INTEREST</div>
                    </div>

                    {/* Data Table */}
                    <table className="report-table">
                      <thead>
                        <tr className="bg-gray-50 font-bold uppercase text-center">
                          <th style={{ width: "33.33%" }}>&nbsp;</th>
                          <th style={{ width: "16.66%" }}>OWN</th>
                          <th style={{ width: "16.66%" }}>SCHOOL</th>
                          <th style={{ width: "16.66%" }}>OWN</th>
                          <th style={{ width: "16.66%" }}>SCHOOL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData
                          .filter((d) => d.hrmE_Id === emp.hrmE_Id)
                          .sort((a, b) => a.ordercolumn - b.ordercolumn)
                          .map((row, idx) => (
                            <tr
                              key={idx}
                              className={
                                row.ivrM_Month_Name.includes("Total") ||
                                row.ivrM_Month_Name.includes("Balance")
                                  ? "font-bold"
                                  : ""
                              }
                            >
                              <td className="text-left">
                                {row.ivrM_Month_Name}
                              </td>
                              <td className="text-right">
                                {row.hrepfsT_OwnContribution > 0
                                  ? row.hrepfsT_OwnContribution.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )
                                  : ""}
                              </td>
                              <td className="text-right">
                                {row.hrepfsT_InstituteContribution > 0
                                  ? row.hrepfsT_InstituteContribution.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )
                                  : ""}
                              </td>
                              <td className="text-right">
                                {row.hrepfsT_OwnInterest > 0
                                  ? row.hrepfsT_OwnInterest.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )
                                  : ""}
                              </td>
                              <td className="text-right">
                                {row.hrepfsT_InstituteInterest > 0
                                  ? row.hrepfsT_InstituteInterest.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      },
                                    )
                                  : ""}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </>
  );
}
