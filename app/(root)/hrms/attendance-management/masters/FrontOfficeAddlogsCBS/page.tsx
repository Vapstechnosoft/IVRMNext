"use client";

import { Button } from "@/components/ui/button";
import { FormError, Label } from "@/components/ui/extension/field";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { FormProvider } from "@/components/ui/form/form-provider";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DetailedTimePicker } from "./_components/detailed-time-picker";
import {
  useReportGroupTypes,
  useReportDepartments,
  useReportDesignations,
  useReportEmployeesByGroupTypeDeptAndDesignation,
} from "@/hooks/hrms/useReports";
import {
  useSaveEmployeePunch,
  useEmployeePunchDetails,
  useTogglePunchDetail,
} from "@/hooks/hrms/attendance-management/useFrontOfficeAddLogs";
import { Loader2, Save, X, Trash2, Plus, Minus } from "lucide-react";
import {
  AdaptiveBody,
  AdaptiveDialog,
  AdaptiveFooter,
} from "@/components/ui/extension/adaptive-dialog";
import { useMemo, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  FrontOfficeAddLogsSchema,
  type FrontOfficeAddLogsFormFields,
} from "@/schemas/hrms/report";
import { zodResolver } from "@hookform/resolvers/zod";

interface FilterFormValues {
  groupType: string[];
  department: string[];
  designation: string[];
  date: Date;
  employee: string;
  punchTime: string; // HH:mm format
  inOutFlag: "I" | "O" | "";
  remarks?: string;
}

interface CartLog {
  id: string;
  hrmE_Id: number;
  employeeName: string;
  foeP_PunchDate: Date;
  foepD_PunchTime: string;
  inOutFlag: "I" | "O";
  remarks?: string;
}

export default function FrontOfficeAddLogsPage() {
  return (
    <FormProvider>
      <FrontOfficeAddLogsContent />
    </FormProvider>
  );
}

function FrontOfficeAddLogsContent() {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,

    formState: { errors },
    trigger,
  } = useForm<FilterFormValues>({
    resolver: zodResolver(FrontOfficeAddLogsSchema),
    mode: "onChange",
    defaultValues: {
      groupType: [],
      department: [],
      designation: [],
      date: new Date(),
      employee: "",
      punchTime: "HH:MM",
      inOutFlag: "",
    },
  });

  const watchedGroupType = watch("groupType");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");
  const watchedEmployee = watch("employee");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [cartLogs, setCartLogs] = useState<CartLog[]>([]);
  const [resetkey, setResetKey] = useState(0);

  // Mapped ID arrays for hook dependencies
  const groupTypeIds = useMemo(
    () => watchedGroupType.map(Number).filter(Boolean),
    [watchedGroupType],
  );
  const deptIds = useMemo(
    () => watchedDepartment.map(Number).filter(Boolean),
    [watchedDepartment],
  );
  const desigIds = useMemo(
    () => watchedDesignation.map(Number).filter(Boolean),
    [watchedDesignation],
  );

  // Data Hooks
  const { data: groupTypesData } = useReportGroupTypes();
  const { data: departmentsData } = useReportDepartments(
    groupTypeIds.toString(),
  );
  const { data: designationsData } = useReportDesignations(
    groupTypeIds.toString(),
    deptIds.toString(),
  );
  const { data: employeesData } =
    useReportEmployeesByGroupTypeDeptAndDesignation(
      groupTypeIds,
      deptIds,
      desigIds,
    );

  console.log("employeesData", watchedEmployee);

  // Fetch existing punch details
  const watchedDate = watch("date");
  const formattedDate =
    watchedEmployee && watchedDate ? format(watchedDate, "yyyy-MM-dd") : "";
  console.log("formattedDate", formattedDate);
  const {
    data: punchDetailsData,
    isLoading: isPunchDetailsLoading,
    refetch: refetchPunchDetails,
  } = useEmployeePunchDetails(formattedDate, Number(watchedEmployee));
  console.log("punchDetailsData", punchDetailsData);
  // Transforms
  const groupTypesDataTransformed = useMemo(() => {
    return (
      groupTypesData?.data?.map((gt: any) => ({
        id: gt.key || gt.hrmgT_Id,
        name: gt.value || gt.hrmgT_EmployeeGroupType,
      })) || []
    ).filter((d: any) => d.id != null);
  }, [groupTypesData]);

  const departmentsDataTransformed = useMemo(() => {
    return (
      departmentsData?.data?.map((d: any) => ({
        id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
        name:
          d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name,
      })) || []
    ).filter((d: any) => d.id != null);
  }, [departmentsData]);

  const designationsDataTransformed = useMemo(() => {
    return (
      designationsData?.data?.map((d: any) => ({
        id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
        name:
          d.hrmdeS_DesignationName ||
          d.hrmdes_designationName ||
          d.value ||
          d.name,
      })) || []
    ).filter((d: any) => d.id != null);
  }, [designationsData]);

  const employeesDataTransformed = useMemo(() => {
    const list = employeesData?.data?.employeeNames || employeesData;
    if (!list || !Array.isArray(list)) return [];

    return list
      .map((emp: any) => {
        const id = emp.hrmE_Id || emp.id;
        if (!id) return null;

        return {
          id: Number(id),
          employeeName: emp.employeeFullName || "Unknown Employee",
          employeeCode: emp.hrmE_EmployeeCode || id.toString(),
        };
      })
      .filter(Boolean);
  }, [employeesData]);

  console.log("employeesDataTransformed", employeesDataTransformed);

  const { mutateAsync: savePunch, isPending } = useSaveEmployeePunch();
  const { mutate: deletePunch, isPending: isDeleting } = useTogglePunchDetail();

  const onSubmit = async () => {
    if (cartLogs.length === 0) {
      toast.error("Cart is empty. Please add logs to cart first.");
      return;
    }

    const payload = {
      punchLogs: cartLogs.map((log) => ({
        hrmE_Id: log.hrmE_Id,
        foeP_PunchDate: format(log.foeP_PunchDate, "yyyy-MM-dd"),
        foepD_PunchTime: log.foepD_PunchTime,
        inOutFlag: log.inOutFlag,
        remarks: log.remarks,
      })),
    };

    try {
      await savePunch(payload);
      setCartLogs([]);
      reset({
        groupType: [],
        department: [],
        designation: [],
        date: new Date(),
        employee: "",
        punchTime: "HH:MM",
        inOutFlag: "",
        remarks: "",
      });
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const addToCart = async () => {
    const isValid = await trigger([
      "groupType",
      "department",
      "designation",
      "date",
      "employee",
      "punchTime",
      "inOutFlag",
    ]);

    if (!isValid) return;

    const values = watch();
    const emp = employeesDataTransformed.find(
      (e: any) => String(e.id) === values.employee,
    );

    const newLog: CartLog = {
      id: Math.random().toString(36).substr(2, 9),
      hrmE_Id: Number(values.employee),
      employeeName: emp?.employeeName || "Unknown",
      foeP_PunchDate: values.date,
      foepD_PunchTime: values.punchTime,
      inOutFlag: values.inOutFlag as "I" | "O",
      remarks: values.remarks,
    };

    setCartLogs([...cartLogs, newLog]);

    // Reset only log-related fields
    setValue("punchTime", "HH:MM");
    setValue("inOutFlag", "");
    setValue("remarks", "");
  };

  const removeFromCart = (id: string) => {
    setCartLogs(cartLogs.filter((log) => log.id !== id));
  };

  const resetCartHandler = () => {
    reset();
    setCartLogs([]);
  };

  const resetLogsHandler = () => {
    (reset(), setResetKey((prev) => prev + 1));
  };

  return (
    <div className="container min-h-screen space-y-8 p-6 bg-gray-50/50">
      {/* Filters Section - Kept for functionality, but stylized */}
      <CollapsibleSection
        defaultOpen={true}
        title="Employee Logs Insertion"
        variant="outline"
        className="shadow-sm bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 mb-8">
          <div className="space-y-2">
            <Label className="font-semibold">Group Type</Label>
            <Controller
              key={resetkey}
              name="groupType"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={groupTypesDataTransformed.map((gt: any) => ({
                    label: gt.name,
                    value: String(gt.id),
                  }))}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select Group Types"
                />
              )}
            />
            {errors.groupType && (
              <FormError>{errors.groupType.message}</FormError>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Department</Label>
            <Controller
              key={resetkey}
              name="department"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={departmentsDataTransformed.map((dept: any) => ({
                    label: dept.name,
                    value: String(dept.id),
                  }))}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select Departments"
                />
              )}
            />
            {errors.department && (
              <FormError>{errors.department.message}</FormError>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Designation</Label>
            <Controller
              key={resetkey}
              name="designation"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={designationsDataTransformed.map((desg: any) => ({
                    label: desg.name,
                    value: String(desg.id),
                  }))}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select Designations"
                />
              )}
            />
            {errors.designation && (
              <FormError>{errors.designation.message}</FormError>
            )}
          </div>
        </div>

        {/* ADD LOGS Section */}
        <div className="border rounded-md overflow-hidden bg-white">
          <div className=" px-4 py-2">
            <h2 className="text-black font-bold text-sm tracking-wide uppercase">
              ADD LOGS
            </h2>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-violet-600">
                  <th className="text-[13px] font-bold text-white border-r border py-2 px-4 text-center">
                    Date
                  </th>
                  <th className="text-[13px] font-bold text-white border-r border py-2 px-4 text-center">
                    Time
                  </th>
                  <th className="text-[13px] font-bold text-white border-r border py-2 px-4 text-center">
                    Employee Name
                  </th>
                  <th className="text-[13px] font-bold text-white border-r border py-2 px-4 text-center">
                    In/Out
                  </th>
                  <th className="text-[13px] font-bold text-white py-2 px-4 text-center">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-gray-200 p-4 min-w-[180px]">
                    <Controller
                      key={resetkey}
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col items-center gap-1">
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            placeholder="Select Date"
                            disabled={{ after: new Date() }}
                            className="border-0 border-b-2 border-blue-300 rounded-none focus-within:border-blue-500 transition-colors bg-transparent"
                          />
                          {errors.date && (
                            <FormError>{errors.date.message}</FormError>
                          )}
                        </div>
                      )}
                    />
                  </td>
                  <td className="border-r border-gray-200 p-2 min-w-[150px]">
                    <div className="flex justify-center scale-90">
                      <Controller
                        key={resetkey}
                        name="punchTime"
                        control={control}
                        render={({ field, fieldState }) => (
                          <DetailedTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>
                  </td>
                  <td className="border-r border-gray-200 p-4 min-w-[250px]">
                    <Controller
                      key={resetkey}
                      name="employee"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-1">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger className="w-full border-0 border-b-2 border-blue-300 rounded-none focus:ring-0 focus:border-blue-500">
                              <SelectValue placeholder="Select Employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeesDataTransformed.map((emp: any) => (
                                <SelectItem key={emp.id} value={String(emp.id)}>
                                  {emp.employeeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.employee && (
                            <FormError>{errors.employee.message}</FormError>
                          )}
                        </div>
                      )}
                    />
                  </td>
                  <td className="border-r border-gray-200 p-4 min-w-[150px]">
                    <Controller
                      key={resetkey}
                      name="inOutFlag"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-1">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-0 border-b-2 border-blue-300 rounded-none focus:ring-0 focus:border-blue-500 bg-transparent">
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="I">In</SelectItem>
                              <SelectItem value="O">Out</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.inOutFlag && (
                            <FormError>{errors.inOutFlag.message}</FormError>
                          )}
                        </div>
                      )}
                    />
                  </td>
                  <td className="p-4 min-w-[250px]">
                    <Controller
                      name="remarks"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          placeholder="Remarks...."
                          {...field}
                          className="min-h-[80px] border-gray-300 focus:border-blue-500 transition-colors resize-none"
                        />
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add to Cart Buttons */}
        <div className="flex justify-center gap-4 my-8">
          <Button
            type="button"
            onClick={addToCart}
            className=" text-white h-10 font-bold uppercase text-[12px] flex items-center gap-2 shadow-sm rounded-sm w-fit"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            ADD TO CART
          </Button>
          <Button
            type="button"
            onClick={resetLogsHandler}
            className=" text-white px-6 h-10 font-bold uppercase text-[12px] flex items-center gap-2 shadow-sm rounded-sm w-fit"
          >
            <X className="h-4 w-4 stroke-[3px]" />
            CANCEL
          </Button>
        </div>

        {/* Existing Logs (Punch Details) - Visible ONLY if needed, or keeping it separate
        {watchedEmployee &&
          (punchDetailsData as any)?.data?.length > 0 &&
          !cartLogs.length && (
            <CollapsibleSection
              title="EXISTING LOGS"
              defaultOpen={false}
              className=""
            >
              <div className="p-4">
                <table className="w-full text-sm border-collapse bg-white rounded-md overflow-hidden shadow-sm">
                  <thead className="bg-gray-600 text-white">
                    <tr>
                      <th className="border p-2">SL. No.</th>
                      <th className="border p-2">Time</th>
                      <th className="border p-2">IN / OUT</th>
                      <th className="border p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(punchDetailsData as any).data.map(
                      (punch: any, index: number) => (
                        <tr key={punch.foepD_Id} className="text-center">
                          <td className="border p-2">{index + 1}</td>
                          <td className="border p-2 font-bold">
                            {punch.foepD_PunchTime}
                          </td>
                          <td className="border p-2 font-bold">
                            {punch.foepD_InOutFlg === "I" ? "IN" : "OUT"}
                          </td>
                          <td className="border p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteId(punch.foepD_Id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )} */}

        {/* CART DETAILS Section */}

        {cartLogs.length > 0 && (
          <div>
            {/* Cart Details */}
            <div className="border border-blue-200 rounded-md overflow-hidden bg-white shadow-md">
              <div className=" px-4 py-2 flex justify-between items-center text-black">
                <h2 className="font-bold text-sm tracking-wide uppercase">
                  CART DETAILS
                </h2>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-violet-600 text-white">
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-2 w-[60px] text-center">
                        Sl.No
                      </th>
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-4 text-center">
                        Employee Name
                      </th>
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-4 text-center">
                        In/Out
                      </th>
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-4 text-center">
                        Date
                      </th>
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-4 text-center">
                        Time
                      </th>
                      <th className="text-[12px] font-bold border-r border-blue-400 py-2 px-4 text-center">
                        Remarks
                      </th>
                      <th className="text-[12px] font-bold py-2 px-4 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {cartLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-400 italic"
                        >
                          Cart is empty. Add logs above.
                        </td>
                      </tr>
                    ) : (
                      cartLogs.map((log, index) => (
                        <tr
                          key={log.id}
                          className="hover:bg-blue-50 transition-colors text-sm"
                        >
                          <td className="border p-2 text-center text-gray-600 font-medium">
                            {index + 1}
                          </td>
                          <td className="border p-2 text-center font-semibold text-gray-800">
                            {log.employeeName}
                          </td>
                          <td className="border p-2 text-center text-blue-700 font-bold">
                            {log.inOutFlag}
                          </td>
                          <td className="border p-2 text-center text-gray-700">
                            {format(log.foeP_PunchDate, "eee MMM dd yyyy")}
                          </td>
                          <td className="border p-2 text-center font-bold text-gray-800">
                            {log.foepD_PunchTime}
                          </td>
                          <td className="border p-2 px-4 text-gray-600">
                            {log.remarks}
                          </td>
                          <td className="border p-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => removeFromCart(log.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex justify-center gap-4 my-4">
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isPending || cartLogs.length === 0}
                className="text-white px-8 h-10 font-bold uppercase text-[12px] flex items-center gap-2 shadow-md rounded-sm w-fit"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                SAVE
              </Button>
              <Button
                type="button"
                onClick={resetCartHandler}
                className="text-white px-8 h-10 font-bold uppercase text-[12px] flex items-center gap-2 shadow-md rounded-sm w-fit"
              >
                <X className="h-4 w-4" />
                CANCEL
              </Button>
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
