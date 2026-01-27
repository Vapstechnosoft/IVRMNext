// app/(root)/fees/feereports/feedefaulterreport/page.tsx
"use client";

import {
  useAcademicYearDropdown,
  useStudentClassDropDown,
} from "@/hooks/fees/useMasters";
import {
  useFeeBusRouteDefaulterreport,
  useFeeClassListDefaulterreport,
  useFeeCustomGroupDefaulterreport,
  useFeeDefaulterReport,
  useFeeGroupDefaulterreport,
  useFeeSectionListDefaulterreport,
  useFeeTermDefaulterreport,
  useFeeTransInstallmentYearlyfeecollectionreport,
} from "@/hooks/fees/useReports";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";
import { FormError } from "@/components/ui/extension/field";
import { feesStudentTransactionSchema } from "@/schemas/fees/trasactions";
import { useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getCoeReport } from "@/server/coe/masters/masterevent";
import { toast } from "sonner";
import { coeMonthEndReportSchema } from "@/schemas/coe/master";
import { InputText } from "@/components/ui/extension/input-text";
import { getCoeMonthEndReport } from "@/server/coe/masters/report";

const Checkbox = ({
  checked,
  indeterminate,
  onCheckedChange,
  ...props
}: any) => {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <BaseCheckbox
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    />
  );
};

type FormFields = z.infer<typeof coeMonthEndReportSchema.addOrUpdate>;



export default function coeMonthEndReport() {

  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(coeMonthEndReportSchema.addOrUpdate),
    mode: "onChange",
    defaultValues: {
      asmaY_Id: undefined,
      month: undefined,
    },
  });



  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const handleReset = () => {
    reset();
    window.location.reload();
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      if (!data.month) {
        toast.error("Month is required");
        return;
      }
      const payload = {
        month: data.month ?? "",
        year: data.asmaY_Id ?? 0,
      };

      const js = JSON.stringify(payload);
      console.log("Payload JSON:", js);

      const response = await getCoeMonthEndReport(payload);

      if (response.success) {
        toast.success(response.message || "Coe Report Fetched successfully");
      } else {
        toast.error(response.message || "Failed to Fetch Coe Report");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
  const [selectedclassId, setSelectedClassId] = useState<number | null>(null);
  const { data: academicYearData, isLoading: loadingYears } =
    useFeeDefaulterReport();
  const { data: feeclassData, isLoading: feeclassDataLoading } =
    useStudentClassDropDown(true);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="mx-auto max-w-7xl">
          <Card className="border-0 shadow-xl">
            <div className="flex flex-col items-center justify-center space-y-6 p-6">
              {/* Filter Type Radio Group */}
              {/* Academic Year */}
              <div className="flex w-full max-w-md items-center justify-between gap-4">
                <Label
                  htmlFor="asmaY_Id"
                  className="whitespace-nowrap font-semibold"
                >
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="asmaY_Id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={field.value || "empty"}
                      onValueChange={(val) => {
                        const id = Number(val);
                        field.onChange(id);
                        setSelectedAsmayId(id);
                      }}
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? String(field.value)
                          : ""
                      }
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="--Select Academic Year--" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingYears ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          academicYearData?.data?.map((item: any) => (
                            <SelectItem
                              key={item.asmaY_Id}
                              value={item.asmaY_Id.toString()}
                            >
                              {item.asmaY_Year}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.asmaY_Id && (
                <div className="flex w-full max-w-md items-center justify-between gap-4">
                  <div className="w-[145px]"></div>
                  <FormError>{errors.asmaY_Id.message}</FormError>
                </div>
              )}

              {/* Month Selection (for Monthly filter) */}

              <div className="flex w-full max-w-md items-center justify-between gap-4">
                <Label
                  htmlFor="month"
                  className="whitespace-nowrap font-semibold"
                >
                  Month <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={field.value || "empty"}
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months?.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={String(item.value)}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex w-full max-w-md items-center justify-between gap-4">
                <Label
                  htmlFor="ieName"
                  className="whitespace-nowrap font-semibold"
                >
                  IE Name
                </Label>
                <InputText
                  id="ieName"
                  placeholder="Enter a SMS Parameter"
                  {...register("ieName")}
                  error={errors.ieName?.message}
                  className="transition-colors focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex w-full max-w-md justify-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Loading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="min-w-[120px]"
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
