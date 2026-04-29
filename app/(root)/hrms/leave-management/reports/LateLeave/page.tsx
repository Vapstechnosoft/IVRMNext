'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { FormError } from "@/components/ui/extension/field";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2, Save, Search, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getLateLeaveColumns, type LateLeaveItem } from "./_components/columns";
import { useLateLeaveReport, useSubmitLateLeave } from "@/hooks/hrms/leave-management/useLateLeave";
import { getLeaveReportEmployees } from "@/server/hrms/leave-management/reports/leave-report";
import { useLeaveYearDropdown, useMonthDropdown, useMasterLeaveDropdown } from "@/hooks/hrms/useMasters";
import { useMasterGroupTypes, useLoginBasedDepartmentsByGroupType, useReportDesignations, useReportDepartments, useReportEmployeesByGroupTypeDeptAndDesignation } from "@/hooks/hrms/useReports";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { tableSearchVariables } from "@/lib/data-table.config";

const LateLeaveSchema = z.object({
    monthId: z.string({ required_error: "Leave Month is required" }).min(1, "Leave Month is required"),
    leaveYear: z.string({ required_error: "Leave Year is required" }).min(1, "Leave Year is required"),
    leaveName: z.string({ required_error: "Leave Name is required" }).min(1, "Leave Name is required"),
    typeIds: z.array(z.string()).min(1, "Please select at least one Type").default([]),
    departmentIds: z.array(z.string()).min(1, "Please select at least one Department").default([]),
    designationIds: z.array(z.string()).min(1, "Please select at least one Designation").default([]),
    emplist: z.array(z.any()).min(1, "Please select at least one Employee").default([]),
});

type LateLeaveFormValues = z.infer<typeof LateLeaveSchema>;

export default function LateLeavePage() {
    const [editData, setEditData] = useState<LateLeaveItem | null>(null);
    const [editCreditLeaves, setEditCreditLeaves] = useState<string>("");

    // ... Mock data ...
    const [reportData, setReportData] = useState<LateLeaveItem[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<LateLeaveItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [resetkey, setResetKey] = useState(0);

    const [page, setPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const [{ data: lateLeaveResponse, isLoading: isPending, refetch: refetchReport }] = useLateLeaveReport(page, pageSize);
    const { mutateAsync: submitLateLeave, isPending: isPendingSubmit } = useSubmitLateLeave();

    console.log("lateLeaveResponse", lateLeaveResponse);

    // Dropdowns
    const { data: monthData, isLoading: isLoadingMonths } = useMonthDropdown();
    const { data: leaveYearData, isLoading: isLoadingYears } = useLeaveYearDropdown();
    const { data: leaveNameData, isLoading: isLoadingLeaves } = useMasterLeaveDropdown();

    console.log("leaveNameData", leaveNameData);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitted },
    } = useForm<LateLeaveFormValues>({
        resolver: zodResolver(LateLeaveSchema),
        defaultValues: {
            monthId: "",
            leaveYear: "",
            leaveName: "",
            typeIds: [],
            departmentIds: [],
            designationIds: [],
        },
    });

    const watchGroupType = watch("typeIds") || [];
    const watchDepartment = watch("departmentIds") || [];
    const watchDesignation = watch("designationIds") || [];

    useEffect(() => {
        const selectedEmps = employees.filter(e => e.selected);
        setValue("emplist", selectedEmps, { shouldValidate: isSubmitted });
    }, [employees, isSubmitted, setValue]);

    const { data: masterGroupTypes } = useMasterGroupTypes();
    const typesToFetch = watchGroupType.join(",");
    const groupTypeIdsStr = watchGroupType?.join(",") || "0";
    const deptIdsStr = watchDepartment?.join(",") || "0";
    const { data: masterDepartments } = useReportDepartments(typesToFetch);

    const { data: masterDesignations } = useReportDesignations(groupTypeIdsStr, deptIdsStr);

    const { data: employeesData } = useReportEmployeesByGroupTypeDeptAndDesignation(
        watchGroupType.map(Number),
        watchDepartment.map(Number),
        watchDesignation.map(Number)
    );

    useEffect(() => {
        if (employeesData?.data?.employeeNames?.length) {
            setEmployees(
                employeesData.data.employeeNames.map((emp: any) => ({
                    ...emp,
                    selected: false,
                    HRELS_CreditedLeaves: emp.HRELS_CreditedLeaves || "",
                    LeaveDeductionReason: emp.LeaveDeductionReason || ""
                }))
            );
        } else {
            setEmployees([]);
        }
    }, [employeesData]);

    console.log("employeesData", employeesData);

    const groupTypeOptions = masterGroupTypes?.data?.map((item: any) => ({
        label: item?.value || item?.hrmgT_EmployeeGroupType || "Unknown",
        value: (item?.key ?? item?.hrmgT_Id)?.toString() ?? "",
    })).filter((opt: any) => opt.value !== "") || [];

    const departmentsOptions = masterDepartments?.data?.map((item: any) => ({
        label: item?.hrmD_DepartmentName || item?.value || "Unknown",
        value: (item?.hrmD_Id ?? item?.key)?.toString() ?? "",
    })).filter((opt: any) => opt.value !== "") || [];

    const designationsOptions = masterDesignations?.data?.map((item: any) => ({
        label: item?.value || item?.hrmdeS_DesignationName || "Unknown",
        value: (item?.key ?? item?.hrmdeS_Id)?.toString() ?? "",
    })).filter((opt: any) => opt.value !== "") || [];

    const onSubmit = async (data: LateLeaveFormValues) => {
        // Find all selected employees from the local editable state
        console.log("form data", data)
        const selectedEmps = employees.filter(e => e.selected);

        if (selectedEmps.length === 0) {
            toast.warning("Please select at least one employee.");
            return;
        }

        // Format them perfectly to match the exact properties your API requests
        const formattedEmployees = selectedEmps.map(emp => ({
            HRME_Id: emp.hrmE_Id || emp.HRME_Id,
            HRELS_CreditedLeaves: Number(emp.HRELS_CreditedLeaves),
            LeaveDeductionReason: emp.LeaveDeductionReason || ""
        }));

        // Attach them to the form payload directly before submission (per your Zod schema logic)
        const payload = {
            HRME_SubstituteFlag: "LeaveDeduct",
            HRELAP_Id: 0,
            HRML_Id: Number(data.leaveName),
            HRMLY_Id: Number(data.leaveYear),
            monthid: Number(data.monthId),

            // And pass the array of employees
            emplist: formattedEmployees
        };

        console.log("Final payload being saved:", payload);

        try {
            const response = await submitLateLeave(payload);
            if (response?.success && response?.data) {
                toast.success(response?.message);
                setEmployees([]);
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || "Failed to deduct leave");
            }
        } catch (error: any) {
            toast.error("Error saving deductions: " + error.message);
        }

    };



    const handleEdit = (item: LateLeaveItem) => {
        console.log("Editing item:", item);
        setEditData(item);
        setEditCreditLeaves(item.hrelaP_TotalDays?.toString() || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = (item: LateLeaveItem) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        const payload = {
            HRME_SubstituteFlag: "LeaveDelete",
            HRELAP_Id: itemToDelete.hrelaP_Id, // Send actual ID, not 0
            HRML_Id: itemToDelete.hrmL_Id,
            HRMLY_Id: itemToDelete.hrmlY_Id,
            monthid: itemToDelete.month,

            emplist: [{
                HRME_Id: itemToDelete.hrmE_Id,
                HRELS_CreditedLeaves: Number(itemToDelete.hrelaP_TotalDays || 0),
                LeaveDeductionReason: itemToDelete.leaveReason || "Late Leave Delete"
            }],

        };

        try {
            const response = await submitLateLeave(payload);
            if (response?.success) {
                toast.success("Leave deleted successfully");
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || "Failed to delete leave");
            }
        } catch (error: any) {
            toast.error("Error deleting leave: " + error.message);
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleUpdateLateLeave = async () => {
        if (!editData) return;
        if (!editCreditLeaves || isNaN(Number(editCreditLeaves))) {
            toast.warning("Please enter a valid deduction number.");
            return;
        }

        const payload = {
            HRME_SubstituteFlag: "LeaveDeduct",
            HRELAP_Id: editData.hrelaP_Id, // Send actual ID, not 0
            HRML_Id: editData.hrmL_Id,
            HRMLY_Id: editData.hrmlY_Id,
            monthid: editData.month,

            emplist: [{
                HRME_Id: editData.hrmE_Id,
                HRELS_CreditedLeaves: Number(editCreditLeaves),
                LeaveDeductionReason: editData.leaveReason || "Late Leave Update"
            }],

        };

        try {
            const response = await submitLateLeave(payload);
            if (response?.success) {
                toast.success("Leave deduction updated successfully");
                setEditData(null);
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || "Failed to update leave");
            }
        } catch (error: any) {
            toast.error("Error updating deduction: " + error.message);
        }

        setEmployees([]);
        reset({
            monthId: "",
            leaveYear: "",
            leaveName: "",
            typeIds: [],
            departmentIds: [],
            designationIds: [],
        });
        setResetKey((prev) => prev + 1);
    };

    const handleReset = () => {
        setEmployees([]);
        reset({
            monthId: "",
            leaveYear: "",
            leaveName: "",
            typeIds: [],
            departmentIds: [],
            designationIds: [],
        });
        setResetKey((prev) => prev + 1);
    };

    // Automatically load data when API returns
    useEffect(() => {
        if (lateLeaveResponse?.success && lateLeaveResponse?.data) {
            const items = Array.isArray(lateLeaveResponse.data) ? lateLeaveResponse.data :
                (lateLeaveResponse.data.data ? lateLeaveResponse.data.data : []);
            setReportData(items);
        }
    }, [lateLeaveResponse]);

    return (
        <div className="container min-h-screen space-y-4 p-2 pt-4 md:p-4">
            {editData && (
                <CollapsibleSection
                    title="LEAVE UPDATE"
                    defaultOpen={true}
                    className="mt-6"
                >
                    <div className="p-4 bg-white rounded-md mt-4 shadow ring-1 ring-black ring-opacity-5 relative z-0 overflow-x-auto">
                        <table className="w-full text-sm text-center border rounded-md">
                            <thead className="bg-violet-600 text-white">
                                <tr>
                                    <th className="p-3 border">Sno</th>
                                    <th className="p-3 border">LEAVE MONTH</th>
                                    <th className="p-3 border">LEAVE YEAR</th>
                                    <th className="p-3 border text-left">EMPLOYEE NAME</th>
                                    <th className="p-3 border">LEAVE NAME</th>
                                    <th className="p-3 border">LEAVE BALANCE</th>
                                    <th className="p-3 border">LEAVE DEDUCTED</th>
                                    <th className="p-3 border w-48">UPDATE LATE LEAVE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 border">1</td>
                                    <td className="p-3 border">{editData.monthname}</td>
                                    <td className="p-3 border">{editData.year}</td>
                                    <td className="p-3 border text-left font-medium">{editData.employeeName}</td>
                                    <td className="p-3 border">{editData.leaveName}</td>
                                    <td className="p-3 border">{editData.hrelS_CBLeaves}</td>
                                    <td className="p-3 border">{editData.hrelaP_TotalDays}</td>
                                    <td className="p-3 border">
                                        <input
                                            type="number"
                                            value={editCreditLeaves}
                                            onChange={(e) => setEditCreditLeaves(e.target.value)}
                                            step="1"
                                            className="border p-1.5 rounded w-full border-fuchsia-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-600"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex gap-4 justify-center py-4 bg-white  rounded-md mt-2">
                        <Button type="button" onClick={handleUpdateLateLeave} className="min-w-[140px] hover:shadow-xl transition-all bg-violet-600 hover:bg-violet-700" disabled={isPendingSubmit} >
                            {isPendingSubmit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {isPendingSubmit ? "Updating..." : "Update"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-w-[140px] hover:bg-slate-100 transition-colors border-slate-300"
                            onClick={() => {
                                setEditData(null);
                                handleReset();
                            }}
                        >
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                    </div>
                    </div>
                    
                </CollapsibleSection>
            )}

            {!editData && (
                <CollapsibleSection
                    title="LATE LEAVE"
                    description="Manage and view late leave transfer details."
                    defaultOpen={true}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col gap-6 p-6 rounded-xl border border-slate-200">
                            {/* FIRST ROW: Group Type, Department, Designation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                {/* Type */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">Type
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="typeIds"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={groupTypeOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select Group Types"
                                            />
                                        )}
                                    />
                                    {errors.typeIds && <FormError>{errors.typeIds.message}</FormError>}
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">Department
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="departmentIds"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={departmentsOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select Departments"
                                            />
                                        )}
                                    />
                                    {errors.departmentIds && <FormError>{errors.departmentIds.message}</FormError>}
                                </div>

                                {/* Designation */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">Designation
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="designationIds"
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={designationsOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select Designations"
                                            />
                                        )}
                                    />
                                    {errors.designationIds && <FormError>{errors.designationIds.message}</FormError>}
                                </div>
                            </div>

                            {/* SECOND ROW: Month, Year, Leave Name */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-4 border-t border-slate-100">
                                {/* Leave Month */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">
                                        Leave Month <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="monthId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingMonths}
                                            >
                                                <SelectTrigger>
                                                    {isLoadingMonths ? "Loading..." : field.value
                                                        ? monthData?.data?.find(
                                                            (y: any) => (y?.key ?? y?.id)?.toString() === field.value,
                                                        )?.value
                                                        : "Select Month"}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthData?.data?.map((m: any) => {
                                                        const mId = (m?.key ?? m?.id)?.toString();
                                                        if (!mId) return null;
                                                        return (
                                                            <SelectItem
                                                                key={mId}
                                                                value={mId}
                                                            >
                                                                {m.value}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.monthId && <FormError>{errors.monthId.message}</FormError>}
                                </div>

                                {/* Leave Year */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">
                                        Leave Year <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="leaveYear"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingYears}
                                            >
                                                <SelectTrigger>
                                                    {isLoadingYears ? "Loading..." : field.value
                                                        ? leaveYearData?.data?.find(
                                                            (y: any) => y?.hrmlY_Id?.toString() === field.value,
                                                        )?.hrmlY_LeaveYear
                                                        : "Select Leave Year"}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveYearData?.data?.map((y: any) => {
                                                        const yId = y?.hrmlY_Id?.toString();
                                                        if (!yId) return null;
                                                        return (
                                                            <SelectItem
                                                                key={yId}
                                                                value={yId}
                                                            >
                                                                {y.hrmlY_LeaveYear}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                                </div>

                                {/* Leave Name */}
                                <div className="space-y-2">
                                    <Label className="block font-semibold text-slate-700">
                                        Leave Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name="leaveName"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ""}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingLeaves}
                                            >
                                                <SelectTrigger>
                                                    {isLoadingLeaves ? "Loading..." : field.value
                                                        ? (() => {
                                                            const selected = leaveNameData?.data?.find(
                                                                (l: any) => (l?.key ?? l?.hrmL_Id)?.toString() === field.value,
                                                            );
                                                            return selected ? (selected?.value ?? selected?.hrmL_LeaveName) : "Select Leave Name";
                                                        })()
                                                        : "Select Leave Name"}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveNameData?.data?.map((l: any) => {
                                                        const lId = (l?.key ?? l?.hrmL_Id)?.toString();
                                                        if (!lId) return null;
                                                        return (
                                                            <SelectItem
                                                                key={lId}
                                                                value={lId}
                                                            >
                                                                {l?.value ?? l?.hrmL_LeaveName}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                                </div>
                            </div>
                        </div>

                        {employees.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h4 className="font-semibold text-slate-700">Select Employees for Deduction</h4>
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-3 top-[10px] h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Search employee..."
                                            className="pl-9 bg-white"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {employees.every((emp: any) => !emp.selected) && errors.emplist && <FormError>{errors.emplist.message}</FormError>}

                                <div className="rounded-md border border-slate-200 [&>div]:max-h-[400px] [&>div]:overflow-y-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b">
                                            <TableRow>
                                                <TableHead className="w-12 text-center">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setEmployees(employees.map(emp => {
                                                                if (!searchQuery || emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())) {
                                                                    return { ...emp, selected: checked };
                                                                }
                                                                return emp;
                                                            }));
                                                        }}
                                                        checked={
                                                            employees.length > 0 &&
                                                            employees.some(emp => !searchQuery || emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                                                            employees.filter(emp => !searchQuery || emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())).every(e => e.selected)
                                                        }
                                                        className="rounded border-gray-300"
                                                    />
                                                </TableHead>
                                                <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Employee Name</TableHead>
                                                <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Leave Deduction Count</TableHead>
                                                <TableHead className="font-semibold text-slate-700 whitespace-nowrap hidden md:table-cell">Leave Deduction Reason</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees.map((emp: any, index: number) => {
                                                if (searchQuery && !emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())) {
                                                    return null;
                                                }
                                                return (
                                                    <TableRow key={index} className="hover:bg-slate-50">
                                                        <TableCell className="text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={emp.selected || false}
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].selected = e.target.checked;
                                                                    setEmployees(fresh);
                                                                }}
                                                                className="rounded border-gray-300"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="w-6">{emp.employeeFullName}</TableCell>
                                                        <TableCell className="w-[150px]">
                                                            <input
                                                                type="number"
                                                                min=""
                                                                step="1"
                                                                className="w-full border rounded p-1.5 focus:ring-1 focus:ring-blue-500"
                                                                value={emp.HRELS_CreditedLeaves || ""}
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].HRELS_CreditedLeaves = e.target.value;
                                                                    setEmployees(fresh);
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell w-[300px]">
                                                            <input
                                                                type="text"
                                                                className="w-full border rounded p-1.5 focus:ring-1 focus:ring-blue-500"
                                                                value={emp.LeaveDeductionReason || ""}
                                                                placeholder="Reason..."
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].LeaveDeductionReason = e.target.value;
                                                                    setEmployees(fresh);
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center py-2">
                            <Button type="submit" className="min-w-[140px] shadow-lg  bg-violet-600 hover:bg-violet-700 transition-all" disabled={isPendingSubmit}>
                                {isPendingSubmit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {isPendingSubmit ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-w-[140px] hover:bg-slate-100 transition-colors"
                                onClick={() => {
                                    handleReset();
                                }}
                            >
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
            )}

            {/* {editData && (
                <div className="flex gap-4 justify-center py-4 bg-white shadow-sm rounded-md border border-slate-200 mt-2">
                    <Button type="button" onClick={handleUpdateLateLeave} className="min-w-[140px] shadow-lg hover:shadow-xl transition-all bg-[#4a5fe0] hover:bg-blue-700" disabled={isPendingSubmit} >
                        {isPendingSubmit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isPendingSubmit ? "Updating..." : "Update"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="min-w-[140px] hover:bg-slate-100 transition-colors border-slate-300"
                        onClick={() => { 
                            setEditData(null); 
                            handleReset(); 
                        }}
                    >
                        <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                </div>
            )} */}

            {reportData.length > 0 ? (
                <CollapsibleSection
                    title="Leave Transfer Report"
                    defaultOpen={true}
                    className="mt-6 shadow-sm"
                >
                    <div className="p-4 bg-white rounded-md mt-4 shadow ring-1 ring-black ring-opacity-5 relative z-0">
                        <DataTable
                            columns={getLateLeaveColumns(handleEdit, handleDelete, page, pageSize)}
                            data={reportData}
                            totalItems={lateLeaveResponse?.total || reportData.length}
                            showViewOptions={false}
                            isPaginationRequired={true}
                            manualPagination={true}
                            manualFiltering={true}
                            manualSorting={true}
                            isLoading={isPending}
                        />
                    </div>
                </CollapsibleSection>
            ) :
                <div className="flex items-center flex-col justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    <span className="ml-2 text-slate-500">Loading applied leave report...</span>
                </div>
            }
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && itemToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="mx-4 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl slide-in-from-bottom-4 animate-in duration-300">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Confirm Deletion</h2>
                            <p className="text-slate-500">
                                Are you sure you want to delete the deduction for <span className="font-semibold text-slate-800">{itemToDelete.employeeName}</span>?
                                <br />This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                                className="flex-1 rounded-lg h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 rounded-lg h-11 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                            >
                                {isPendingSubmit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
