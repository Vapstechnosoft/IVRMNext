"use client";
import { HRMSDateField as DateField } from "@/app/(root)/hrms/_components/hrms-date-field";
import { HRMSInputText } from "@/app/(root)/hrms/_components/hrms-input-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/extension/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Upload, X } from "lucide-react";
// Safe SelectItem wrapper that prevents empty string values - ABSOLUTE PROTECTION
const SafeSelectItem = ({
    value,
    children,
    ...props
}: {
    value: any;
    children: React.ReactNode;
    [key: string]: any;
}) => {
    // ABSOLUTE CHECK: If value is null, undefined, or empty string, don't render
    if (value == null || value === undefined || value === "") {
        console.error("?? [SafeSelectItem - employee-tab] EMPTY VALUE DETECTED:", {
            value,
            valueType: typeof value,
            props: Object.keys(props),
            children: typeof children === "string" ? children : "ReactNode",
            stack: new Error().stack?.split("\n").slice(0, 5).join("\n"),
        });
        return null;
    }
    // Convert to string
    const strValue = String(value);
    // ABSOLUTE CHECK: If string is empty or only whitespace, don't render
    if (strValue === "" || strValue.trim() === "" || strValue.length === 0) {
        console.error("?? [SafeSelectItem - employee-tab] EMPTY STRING DETECTED:", {
            originalValue: value,
            strValue,
            strValueLength: strValue.length,
            trimmed: strValue.trim(),
            props: Object.keys(props),
            children: typeof children === "string" ? children : "ReactNode",
            stack: new Error().stack?.split("\n").slice(0, 5).join("\n"),
        });
        return null;
    }
    const trimmedValue = strValue.trim();
    // FINAL ABSOLUTE CHECK: If trimmed is empty, don't render
    if (trimmedValue === "" || trimmedValue.length === 0) {
        console.error(
            "?? [SafeSelectItem - employee-tab] EMPTY TRIMMED VALUE DETECTED:",
            {
                originalValue: value,
                strValue,
                trimmedValue,
                trimmedLength: trimmedValue.length,
                props: Object.keys(props),
                children: typeof children === "string" ? children : "ReactNode",
                stack: new Error().stack?.split("\n").slice(0, 5).join("\n"),
            }
        );
        return null;
    }
    // FINAL FINAL CHECK: Double-check trimmedValue is not empty before rendering
    if (!trimmedValue || trimmedValue === "" || trimmedValue.length === 0) {
        console.error(
            "?? [SafeSelectItem - employee-tab] FINAL CHECK FAILED - trimmedValue is empty:",
            {
                originalValue: value,
                strValue,
                trimmedValue,
                trimmedLength: trimmedValue?.length,
                stack: new Error().stack?.split("\n").slice(0, 5).join("\n"),
            }
        );
        return null;
    }
    // Only render if we have a valid non-empty string
    return (
        <SelectItem {...props} value={trimmedValue}>
            {children}
        </SelectItem>
    );
};
// Helper function to ensure SelectItem value is never empty string
const ensureNonEmptyValue = (
    value: any,
    fallback: any = null
): string | null => {
    // Handle null/undefined
    if (value == null || value === undefined) {
        if (fallback != null && fallback !== undefined) {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== "" && fallbackStr !== "") {
                return fallbackStr;
            }
        }
        return null;
    }
    // Handle empty string explicitly
    if (value === "") {
        if (fallback != null && fallback !== undefined && fallback !== "") {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== "" && fallbackStr !== "") {
                return fallbackStr;
            }
        }
        return null;
    }
    // Convert to string
    const str = String(value);
    // Check if empty or whitespace
    if (str === "" || str.trim() === "") {
        if (fallback != null && fallback !== undefined && fallback !== "") {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== "" && fallbackStr !== "") {
                return fallbackStr;
            }
        }
        return null;
    }
    // Final check - ensure it's not empty
    const trimmed = str.trim();
    if (trimmed === "" || trimmed.length === 0) {
        return null;
    }
    return trimmed;
};
import { useMemo, useState, useEffect, useRef } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { StandardTabActions } from "./standard-tab-actions";
function EmployeeTabComponent({
    control,
    register,
    errors,
    selectedPhoto,
    onPhotoUpload,
    setSelectedPhoto,
    setPhotoFile,
    options,
    isSubmitting,
    watch,
    onClear,
    setValue,
    getValues,
    currentTab,
    onPreviousTab,
}: any) {
    // DEBUG: Track renders to identify infinite loops
    const renderCount = useRef(0);
    const prevMobileFields = useRef<any[]>([]);
    const prevEmailFields = useRef<any[]>([]);
    const prevBankFields = useRef<any[]>([]);
    renderCount.current += 1;
    // State for controlling date picker popovers
    const [_dateOfJoiningOpen, _setDateOfJoiningOpen] = useState(false);
    const [_dateOfConfirmationOpen, _setDateOfConfirmationOpen] = useState(false);
    const [_pfDateOpen, _setPfDateOpen] = useState(false);
    const [_esiDateOpen, _setEsiDateOpen] = useState(false);
    const [_dateOfBirthOpen, _setDateOfBirthOpen] = useState(false);
    const [_dateOfRetirementOpen, _setDateOfRetirementOpen] = useState(false);
    // Use useFieldArray for stable array management
    const {
        fields: mobileFields,
        append: appendMobile,
        remove: removeMobile,
    } = useFieldArray({
        control,
        name: "mobileDetails",
    });
    const {
        fields: emailFields,
        append: appendEmail,
        remove: removeEmail,
    } = useFieldArray({
        control,
        name: "emailDetails",
    });
    const {
        fields: bankFields,
        append: appendBank,
        remove: removeBank,
    } = useFieldArray({
        control,
        name: "bankDetails",
    });
    // DEBUG: Track renders to identify infinite loops (moved after field array declarations)
    useEffect(() => {
        if (renderCount.current > 20) {
            console.error("?? [EmployeeTab] EXCESSIVE RENDERS DETECTED!", {
                renderCount: renderCount.current,
                mobileFieldsLength: mobileFields.length,
                emailFieldsLength: emailFields.length,
                bankFieldsLength: bankFields.length,
                stack: new Error().stack?.split("\n").slice(0, 10).join("\n"),
            });
        }
        // Track field changes
        if (mobileFields.length !== prevMobileFields.current.length) {
            prevMobileFields.current = mobileFields;
        }
        if (emailFields.length !== prevEmailFields.current.length) {
            prevEmailFields.current = emailFields;
        }
        if (bankFields.length !== prevBankFields.current.length) {
            prevBankFields.current = bankFields;
        }
    }, [mobileFields.length, emailFields.length, bankFields.length]);
    // Watch dateOfBirth to auto-calculate dateOfRetirement - use useWatch for better reactivity
    const dateOfBirth = useWatch({ control, name: "dateOfBirth" });
    // Helper function to parse DOB to Date object for fromDate prop
    const parseDOBToDate = (
        dobValue: string | Date | undefined
    ): Date | undefined => {
        if (!dobValue) return undefined;
        try {
            let dob: Date;
            if (typeof dobValue === "string") {
                // Handle date strings - could be ISO format or YYYY-MM-DD
                if (dobValue.includes("T")) {
                    dob = new Date(dobValue);
                } else {
                    // YYYY-MM-DD format - add time to avoid timezone issues
                    dob = new Date(dobValue + "T00:00:00");
                }
            } else if (dobValue instanceof Date) {
                dob = dobValue;
            } else {
                return undefined;
            }
            if (isNaN(dob.getTime())) {
                return undefined;
            }
            return dob;
        } catch (error) {
            return undefined;
        }
    };
    // Helper function to calculate retirement date
    const calculateRetirementDate = (
        dobValue: string | Date | undefined
    ): string => {
        const dob = parseDOBToDate(dobValue);
        if (!dob) return "";
        try {
            const retirementDate = new Date(dob);
            retirementDate.setFullYear(retirementDate.getFullYear() + 60);
            // Return ISO string format that DateField expects
            return retirementDate.toISOString();
        } catch (error) {
            return "";
        }
    };
    // Convert DOB to Date object for fromDate prop
    const dobDate = parseDOBToDate(dateOfBirth);
    // Auto-calculate dateOfRetirement as DOB + 60 years
    useEffect(() => {
        // Skip if dateOfBirth is falsy or empty
        if (!dateOfBirth) {
            // Clear retirement date if DOB is cleared
            const currentRetirementDate = getValues("dateOfRetirement");
            if (currentRetirementDate) {
                setValue("dateOfRetirement", "", {
                    shouldValidate: false,
                    shouldDirty: false,
                    shouldTouch: false,
                });
            }
            return;
        }
        // Check if DOB is a valid string (not empty after trim) or valid Date
        const isValidString =
            typeof dateOfBirth === "string" && dateOfBirth.trim() !== "";
        const isValidDate =
            dateOfBirth instanceof Date && !isNaN(dateOfBirth.getTime());
        if (!isValidString && !isValidDate) {
            return;
        }
        // Calculate retirement date
        const calculatedDate = calculateRetirementDate(dateOfBirth);
        if (calculatedDate && calculatedDate.trim() !== "") {
            // Use setTimeout to ensure the value is set after the current render cycle
            setTimeout(() => {
                setValue("dateOfRetirement", calculatedDate, {
                    shouldValidate: false,
                    shouldDirty: false,
                    shouldTouch: false,
                });
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateOfBirth]);
    // Select components will handle empty values gracefully
    // Removed debug options tracking to reduce console noise
    // Memoize options to prevent unnecessary re-renders - deep comparison
    const memoizedOptions = useMemo(() => {
        if (!options) return null;
        return {
            empTypes: options.empTypes || [],
            groupTypes: options.groupTypes || [],
            departments: options.departments || [],
            designations: options.designations || [],
            grades: options.grades || [],
            genders: options.genders || [],
            maritalStatuses: options.maritalStatuses || [],
            religions: options.religions || [],
            casteCategories: options.casteCategories || [],
            castes: options.castes || [],
            banks: options.banks || [],
            countries: options.countries || [],
            states: options.states || [],
            courses: options.courses || [],
            specialisations: options.specialisations || [],
            teachingNonTeaching: options.teachingNonTeaching || [],
            bloodGroups: options.bloodGroups || [],
            salaryTypes: options.salaryTypes || [],
            modeOfPayment: options.modeOfPayment || [],
            addressTypes: options.addressTypes || [],
            phoneTypes: options.phoneTypes || [],
            cgpaPercentageTypes: options.cgpaPercentageTypes || [],
            leavingReasons: options.leavingReasons || [],
            institutions: options.institutions || [],
            earningList: options.earningList || [],
            detectionList: options.detectionList || [],
            arrearList: options.arrearList || [],
            grossList: options.grossList || [],
            documentList: options.documentList || [],
            employeedetailList: options.employeedetailList || [],
        };
    }, [
        options?.empTypes?.length,
        options?.groupTypes?.length,
        options?.departments?.length,
        options?.designations?.length,
        options?.grades?.length,
        options?.genders?.length,
        options?.maritalStatuses?.length,
        options?.religions?.length,
        options?.casteCategories?.length,
        options?.castes?.length,
        options?.banks?.length,
        options?.countries?.length,
        options?.states?.length,
        options?.courses?.length,
        options?.specialisations?.length,
        options?.teachingNonTeaching?.length,
        options?.bloodGroups?.length,
        options?.salaryTypes?.length,
        options?.modeOfPayment?.length,
        options?.addressTypes?.length,
        options?.phoneTypes?.length,
        options?.cgpaPercentageTypes?.length,
        options?.leavingReasons?.length,
        options?.institutions?.length,
        options?.earningList?.length,
        options?.detectionList?.length,
        options?.arrearList?.length,
        options?.grossList?.length,
        options?.documentList?.length,
        options?.employeedetailList?.length,
    ]);
    // Memoize bank options specifically to prevent Select recreation
    const memoizedBankOptions = useMemo(() => {
        if (!memoizedOptions?.banks) return [];
        return (memoizedOptions.banks || [])
            .filter((b: any) => {
                const bankId = (b.HRMBD_Id ?? b.BankId ?? b.value ?? b)?.toString();
                return bankId && bankId.trim() !== "";
            })
            .map((b: any) => {
                const bankId = (b.HRMBD_Id ?? b.BankId ?? b.value ?? b)?.toString();
                if (!bankId || bankId.trim() === "" || bankId === "") return null;
                const finalBankId = String(bankId).trim();
                if (finalBankId === "") return null;
                const bankName = b.HRMBD_BankName || b.BankName || b.label || String(b);
                return {
                    id: finalBankId,
                    name: bankName,
                    value: finalBankId,
                };
            })
            .filter(Boolean);
    }, [memoizedOptions?.banks?.length]);
    return (
        <div className="space-y-6">
            {/* Main Form Fields in Two Columns */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 items-start">
                {/* Left Column */}
                <div className="space-y-4">
                    <HRMSInputText
                        label="First Name"
                        required
                        id="firstName"
                        maxLength={50}
                        onKeyDown={(e) => {
                            // Allow: letters, space, hyphen, apostrophe, backspace, delete, tab, escape, enter, arrow keys
                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                            const controlKeys = [
                                "Backspace",
                                "Delete",
                                "Tab",
                                "Escape",
                                "Enter",
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                            ];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Prevent multiple consecutive spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                e.preventDefault();
                                return;
                            }
                             // Prevent leading spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                e.preventDefault();
                                return;
                            }
                            if (!allowedKeys.test(e.key)) {
                                e.preventDefault(); // Block special characters
                            }
                        }}
                        {...register("firstName", {
                            required: "First Name is required",
                        })}
                        error={errors.firstName?.message}
                    />
                    <HRMSInputText
                        label="Middle Name"
                        id="middleName"
                        maxLength={50}
                        onKeyDown={(e) => {
                            // Allow: letters, space, hyphen, apostrophe, backspace, delete, tab, escape, enter, arrow keys
                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                            const controlKeys = [
                                "Backspace",
                                "Delete",
                                "Tab",
                                "Escape",
                                "Enter",
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                            ];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Prevent multiple consecutive spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                e.preventDefault();
                                return;
                            }
                             // Prevent leading spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                e.preventDefault();
                                return;
                            }
                            if (!allowedKeys.test(e.key)) {
                                e.preventDefault(); // Block special characters
                            }
                        }}
                        {...register("middleName")}
                        error={errors.middleName?.message}
                    />
                    <HRMSInputText
                        label="Last Name"
                        id="lastName"
                        maxLength={50}
                        onKeyDown={(e) => {
                            // Allow: letters, space, hyphen, apostrophe, backspace, delete, tab, escape, enter, arrow keys
                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Prevent multiple consecutive spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                e.preventDefault();
                                return;
                            }
                             // Prevent leading spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                e.preventDefault();
                                return;
                            }
                            if (!allowedKeys.test(e.key)) {
                                e.preventDefault(); // Block special characters
                            }
                        }}
                        {...register("lastName")}
                        error={errors.lastName?.message}
                    />
                    <HRMSInputText
                        label="Employee Code"
                        required
                        id="employeeCode"
                        maxLength={20}
                        {...register("employeeCode", {
                            required: "Employee code is required",
                        })}
                        error={errors.employeeCode?.message}
                    />
                    <HRMSInputText
                        label="Father's Name *"
                        id="fatherName"
                        maxLength={50}
                        onKeyDown={(e) => {
                            // Allow: letters, space, hyphen, apostrophe, backspace, delete, tab, escape, enter, arrow keys
                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Prevent multiple consecutive spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                e.preventDefault();
                                return;
                            }
                             // Prevent leading spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                e.preventDefault();
                                return;
                            }
                            if (!allowedKeys.test(e.key)) {
                                e.preventDefault(); // Block special characters
                            }
                        }}
                        {...register("fatherName")}
                        error={errors.fatherName?.message}
                    />
                    <HRMSInputText
                        label="Mother's Name *"
                        id="motherName"
                        maxLength={50}
                        onKeyDown={(e) => {
                            // Allow: letters, space, hyphen, apostrophe, backspace, delete, tab, escape, enter, arrow keys
                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Prevent multiple consecutive spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                e.preventDefault();
                                return;
                            }
                             // Prevent leading spaces
                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                e.preventDefault();
                                return;
                            }
                            if (!allowedKeys.test(e.key)) {
                                e.preventDefault(); // Block special characters
                            }
                        }}
                        {...register("motherName")}
                        error={errors.motherName?.message}
                    />
                    <Controller
                        name="typeOfEmployment"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Type of Employment <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.empTypes || [])
                                            .filter((it: any) => {
                                                // Aggressively filter out items with empty string IDs
                                                const id1 = it.HRMET_Id;
                                                const id2 = it.value;
                                                const id3 = it;
                                                // Check each ID - must be non-null, non-undefined, non-empty-string, and non-whitespace
                                                const valid1 =
                                                    id1 != null &&
                                                    id1 !== undefined &&
                                                    id1 !== "" &&
                                                    String(id1).trim() !== "";
                                                const valid2 =
                                                    id2 != null &&
                                                    id2 !== undefined &&
                                                    id2 !== "" &&
                                                    String(id2).trim() !== "";
                                                const valid3 =
                                                    id3 != null &&
                                                    id3 !== undefined &&
                                                    id3 !== "" &&
                                                    String(id3).trim() !== "";
                                                return valid1 || valid2 || valid3;
                                            })
                                            .map((it: any) => {
                                                // Try each ID in order, use first valid one
                                                let val: string | null = null;
                                                if (
                                                    it.HRMET_Id != null &&
                                                    it.HRMET_Id !== "" &&
                                                    String(it.HRMET_Id).trim() !== ""
                                                ) {
                                                    val = ensureNonEmptyValue(it.HRMET_Id);
                                                } else if (
                                                    it.value != null &&
                                                    it.value !== "" &&
                                                    String(it.value).trim() !== ""
                                                ) {
                                                    val = ensureNonEmptyValue(it.value);
                                                } else if (
                                                    it != null &&
                                                    it !== "" &&
                                                    String(it).trim() !== ""
                                                ) {
                                                    val = ensureNonEmptyValue(it);
                                                }
                                                // Final check - if still null or empty, skip this item
                                                if (
                                                    !val ||
                                                    val === "" ||
                                                    val.trim() === "" ||
                                                    val.length === 0
                                                )
                                                    return null;
                                                return (
                                                    <SafeSelectItem key={val} value={val}>
                                                        {it.HRMET_EmployeeType || it.label || String(it)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="employeeGroup"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Employee Group <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.groupTypes || [])
                                            .filter((gt: any) => {
                                                const val = gt.HRMGT_Id ?? gt.value ?? gt;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((gt: any) => {
                                                const val = (gt.HRMGT_Id ?? gt.value ?? gt)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={gt.HRMGT_Id || gt.value || String(gt)}
                                                        value={finalVal}
                                                    >
                                                        {gt.HRMGT_EmployeeGroupType ||
                                                            gt.label ||
                                                            String(gt)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="school"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    School <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.departments || [])
                                            .filter((d: any) => {
                                                const val = d.HRMD_Id ?? d.value ?? d;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((d: any) => {
                                                const val = (d.HRMD_Id ?? d.value ?? d)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={d.HRMD_Id || d.value || String(d)}
                                                        value={finalVal}
                                                    >
                                                        {d.HRMD_DepartmentName || d.label || String(d)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="designation"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Designation <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.designations || [])
                                            .filter((dg: any) => {
                                                const val = dg.HRMDES_Id ?? dg.value ?? dg;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((dg: any) => {
                                                const val = (
                                                    dg.HRMDES_Id ??
                                                    dg.value ??
                                                    dg
                                                )?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={dg.HRMDES_Id || dg.value || String(dg)}
                                                        value={finalVal}
                                                    >
                                                        {dg.HRMDES_DesignationName ||
                                                            dg.label ||
                                                            String(dg)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <HRMSInputText
                        label="Subject Taught"
                        id="subjectTaught"
                        maxLength={50}
                        placeholder="Enter subject taught"
                        {...register("subjectTaught")}
                        error={errors.subjectTaught?.message}
                    />
                    <Controller
                        name="grade"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Grade <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.grades || [])
                                            .filter((gr: any) => {
                                                const val = gr.HRMG_Id ?? gr.Id ?? gr.value ?? gr;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((gr: any) => {
                                                const val = (
                                                    gr.HRMG_Id ??
                                                    gr.Id ??
                                                    gr.value ??
                                                    gr
                                                )?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={gr.HRMG_Id || gr.Id || gr.value || String(gr)}
                                                        value={finalVal}
                                                    >
                                                        {gr.HRMG_GradeName ||
                                                            gr.Name ||
                                                            gr.label ||
                                                            gr.Grade ||
                                                            String(gr)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="dateOfJoining"
                        control={control}
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label="Date Of Joining"
                                placeholder="Pick date of joining"
                            />
                        )}
                    />
                    <Controller
                        name="dateOfConfirmation"
                        control={control}
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label="Date Of Confirmation"
                                placeholder="Pick date of confirmation"
                            />
                        )}
                    />
                    <div className="space-y-3">
                        <Controller
                            name="epf"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="epf"
                                        checked={!!field.value}
                                        onCheckedChange={(v) => field.onChange(!!v)}
                                    />
                                    <Label htmlFor="epf">EPF</Label>
                                </div>
                            )}
                        />
                        <Controller
                            name="ppf"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ppf"
                                        checked={!!field.value}
                                        onCheckedChange={(v) => field.onChange(!!v)}
                                    />
                                    <Label htmlFor="ppf">PPF</Label>
                                </div>
                            )}
                        />
                        <Controller
                            name="phdResearchGuide"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="phdResearchGuide"
                                        checked={!!field.value}
                                        onCheckedChange={(v) => field.onChange(!!v)}
                                    />
                                    <Label htmlFor="phdResearchGuide">PHD Research Guide ?</Label>
                                </div>
                            )}
                        />
                    </div>
                    {/* Recognition Year - Conditional on PHD Research Guide */}
                    {watch?.("phdResearchGuide") ? (
                        <HRMSInputText
                            label="Recognition Year"
                            id="recognitionYear"
                            maxLength={4}
                            onKeyDown={(e) => {
                                // Only allow numbers (0-9) and control keys
                                const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                    return; // Allow control keys
                                }
                                // Block spaces explicitly
                                if (e.key === ' ') {
                                    e.preventDefault();
                                    return;
                                }
                                // Only allow digits (0-9)
                                if (!/^[0-9]$/.test(e.key)) {
                                    e.preventDefault(); // Block everything else
                                }
                            }}
                            {...register("recognitionYear")}
                            error={errors.recognitionYear?.message}
                        />
                    ) : null}
                    <Controller
                        name="teachingNonTeaching"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Teaching/NonTeaching <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Teaching">Teaching</SelectItem>
                                        <SelectItem value="Non Teaching">Non Teaching</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="pfApplicable"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pfApplicable"
                                    checked={!!field.value}
                                    onCheckedChange={(v) => field.onChange(!!v)}
                                />
                                <Label htmlFor="pfApplicable">PF Applicable?</Label>
                            </div>
                        )}
                    />
                    {/* PF Fields - Conditional on PF Applicable */}
                    {watch?.("pfApplicable") ? (
                        <div className="space-y-4 border-blue-500 border-l-4 pl-4">
                            <div className="space-y-2">
                                <Controller
                                    name="pfMaxAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="pfMaxAmount"
                                                checked={!!field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(!!checked);
                                                    // If this is checked, uncheck the other
                                                    if (checked) {
                                                        setValue("pfFixedAmount", false, {
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="pfMaxAmount">PF Max Amount</Label>
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="pfFixedAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="pfFixedAmount"
                                                checked={!!field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(!!checked);
                                                    // If this is checked, uncheck the other
                                                    if (checked) {
                                                        setValue("pfMaxAmount", false, {
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                        });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="pfFixedAmount">PF Fixed Amount</Label>
                                        </div>
                                    )}
                                />
                            </div>
                            <HRMSInputText
                                label="PF Acc No."
                                id="pfAccNo"
                                maxLength={22}
                                {...register("pfAccNo")}
                                error={errors.pfAccNo?.message}
                            />
                            <HRMSInputText
                                label="UAN Number"
                                id="uanNumber"
                                maxLength={12}
                                {...register("uanNumber")}
                                error={errors.uanNumber?.message}
                            />
                            <Controller
                                name="pfDate"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label="PF Date"
                                        placeholder="Pick PF date"
                                    />
                                )}
                            />
                        </div>
                    ) : null}
                    <Controller
                        name="esiApplicable"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="esiApplicable"
                                    checked={!!field.value}
                                    onCheckedChange={(v) => field.onChange(!!v)}
                                />
                                <Label htmlFor="esiApplicable">ESI Applicable?</Label>
                            </div>
                        )}
                    />
                    {/* ESI Fields - Conditional on ESI Applicable */}
                    {watch?.("esiApplicable") ? (
                        <div className="space-y-4 border-green-500 border-l-4 pl-4">
                            <HRMSInputText
                                label="ESI Acc No."
                                id="esiAccNo"
                                maxLength={10}
                                onKeyDown={(e) => {
                                    // Only allow numbers (0-9) and control keys
                                    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                        return; // Allow control keys
                                    }
                                    // Block spaces explicitly
                                    if (e.key === ' ') {
                                        e.preventDefault();
                                        return;
                                    }
                                    // Only allow digits (0-9)
                                    if (!/^[0-9]$/.test(e.key)) {
                                        e.preventDefault(); // Block everything else
                                    }
                                }}
                                {...register("esiAccNo")}
                                error={errors.esiAccNo?.message}
                            />
                            <HRMSInputText
                                label="Gratuity Acc No."
                                id="gratuityAccNo"
                                maxLength={25}
                                {...register("gratuityAccNo")}
                                error={errors.gratuityAccNo?.message}
                            />
                            <Controller
                                name="esiDate"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label="ESI Date"
                                        placeholder="Pick ESI date"
                                    />
                                )}
                            />
                        </div>
                    ) : null}
                    <HRMSInputText
                        label="National SSN"
                        id="nationalSSN"
                        maxLength={9}
                        onKeyDown={(e) => {
                            // Only allow numbers (0-9) and control keys
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Block spaces explicitly
                            if (e.key === ' ') {
                                e.preventDefault();
                                return;
                            }
                            // Only allow digits (0-9)
                            if (!/^[0-9]$/.test(e.key)) {
                                e.preventDefault(); // Block everything else
                            }
                        }}
                        {...register("nationalSSN")}
                        error={errors.nationalSSN?.message}
                    />
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                    <Controller
                        name="religion"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Religion <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.religions || [])
                                            .filter((rel: any, index: number) => {
                                                const id =
                                                    rel.IVRMMR_Id ||
                                                    rel.IMR_Id ||
                                                    rel.Id ||
                                                    rel.id ||
                                                    rel.value ||
                                                    index;
                                                const val = id?.toString();
                                                return val && val.trim() !== "";
                                            })
                                            .map((rel: any, index: number) => {
                                                // Handle different possible property names
                                                const id =
                                                    rel.IVRMMR_Id ??
                                                    rel.IMR_Id ??
                                                    rel.Id ??
                                                    rel.id ??
                                                    rel.value ??
                                                    index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === "" || idStr === "")
                                                    return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === "") return null;
                                                const name =
                                                    rel.IVRMMR_Name ||
                                                    rel.IMR_ReligionName ||
                                                    rel.ReligionName ||
                                                    rel.Name ||
                                                    rel.name ||
                                                    rel.label ||
                                                    rel.text ||
                                                    String(rel);
                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="casteCategory"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Caste Category <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.casteCategories || [])
                                            .filter((cc: any, index: number) => {
                                                const id =
                                                    cc.IMCC_Id || cc.Id || cc.id || cc.value || index;
                                                const val = id?.toString();
                                                return val && val.trim() !== "";
                                            })
                                            .map((cc: any, index: number) => {
                                                // Handle different possible property names
                                                const id =
                                                    cc.IMCC_Id ?? cc.Id ?? cc.id ?? cc.value ?? index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === "" || idStr === "")
                                                    return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === "") return null;
                                                const name =
                                                    cc.IMCC_CategoryName ||
                                                    cc.IMCC_CasteCategoryName ||
                                                    cc.CasteCategoryName ||
                                                    cc.Name ||
                                                    cc.name ||
                                                    cc.label ||
                                                    cc.text ||
                                                    String(cc);
                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                    <Controller
                        name="caste"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Caste <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="Select Caste" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.castes || [])
                                            .filter((c: any, index: number) => {
                                                const id = c.IMC_Id || c.Id || c.id || c.value || index;
                                                const val = id?.toString();
                                                return val && val.trim() !== "";
                                            })
                                            .map((c: any, index: number) => {
                                                // Handle different possible property names
                                                const id = c.IMC_Id ?? c.Id ?? c.id ?? c.value ?? index;
                                                const idStr = ensureNonEmptyValue(id, index);
                                                // Ensure value is never empty string
                                                if (!idStr || idStr.trim() === "" || idStr === "")
                                                    return null;
                                                const finalVal = String(idStr).trim();
                                                if (finalVal === "") return null;
                                                const name =
                                                    c.IMC_CasteName ||
                                                    c.CasteName ||
                                                    c.Name ||
                                                    c.name ||
                                                    c.label ||
                                                    c.text ||
                                                    String(c);
                                                return (
                                                    <SafeSelectItem key={id} value={finalVal}>
                                                        {name}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label="Date Of Birth"
                                placeholder="Pick date of birth"
                            />
                        )}
                    />
                    <Controller
                        name="dateOfRetirement"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="mt-5 flex flex-col gap-1.5">
                                <Label htmlFor={field.name}>
                                    Date of Retirement
                                    <span className="ml-1 text-red-500">*</span>
                                </Label>
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                                    {field.value
                                        ? (() => {
                                            try {
                                                const date = new Date(field.value);
                                                return date.toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                });
                                            } catch {
                                                return field.value;
                                            }
                                        })()
                                        : "Pick date of retirement"}
                                </div>
                                {fieldState?.error && (
                                    <div className="text-sm text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Gender <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.genders || [])
                                            .filter((g: any) => {
                                                const val = g.IVRMMG_Id ?? g.value ?? g;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((g: any) => {
                                                const val = (g.IVRMMG_Id ?? g.value ?? g)?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={g.IVRMMG_Id || g.value || String(g)}
                                                        value={finalVal}
                                                    >
                                                        {g.IVRMMG_GenderName ||
                                                            g.IVRMMG_Gender ||
                                                            g.label ||
                                                            String(g)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="maritalStatus"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Marital Status <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(options?.maritalStatuses || [])
                                            .filter((ms: any) => {
                                                const val = ms.IVRMMMS_Id ?? ms.value ?? ms;
                                                return (
                                                    val != null && val !== "" && String(val).trim() !== ""
                                                );
                                            })
                                            .map((ms: any) => {
                                                const val = (
                                                    ms.IVRMMMS_Id ??
                                                    ms.value ??
                                                    ms
                                                )?.toString();
                                                // Ensure value is never empty string
                                                if (!val || val.trim() === "" || val === "")
                                                    return null;
                                                const finalVal = String(val).trim();
                                                if (finalVal === "") return null;
                                                return (
                                                    <SafeSelectItem
                                                        key={ms.IVRMMMS_Id || ms.value || String(ms)}
                                                        value={finalVal}
                                                    >
                                                        {ms.IVRMMMS_MaritalStatus ||
                                                            ms.IVRMMMS_Name ||
                                                            ms.label ||
                                                            String(ms)}
                                                    </SafeSelectItem>
                                                );
                                            })
                                            .filter(Boolean)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                    {/* Multiple Mobile Numbers */}
                    <div className="flex flex-col gap-1.5">
                        <Label>
                            Mobile No. <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                            {mobileFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <Controller
                                        name={`mobileDetails.${index}.type`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Default">Default</SelectItem>
                                                    <SelectItem value="Alternate">Alternate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <HRMSInputText
                                        placeholder="Enter mobile number"
                                        maxLength={10}
                                        {...register(`mobileDetails.${index}.mobileNo`)}
                                        className="min-w-[200px] flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0"
                                        onClick={() => removeMobile(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => appendMobile({ mobileNo: "", type: "Default" })}
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Mobile
                            </Button>
                        </div>
                    </div>
                    {/* Multiple Email IDs */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Email -Id</Label>
                        <div className="space-y-2">
                            {emailFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <Controller
                                        name={`emailDetails.${index}.type`}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Default">Default</SelectItem>
                                                    <SelectItem value="Alternate">Alternate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <HRMSInputText
                                        type="email"
                                        placeholder="Enter email address"
                                        maxLength={100}
                                        {...register(`emailDetails.${index}.emailId`)}
                                        className="min-w-[200px] flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0"
                                        onClick={() => removeEmail(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => appendEmail({ emailId: "", type: "Default" })}
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Email
                            </Button>
                        </div>
                    </div>
                    <HRMSInputText
                        label="Aadhaar No."
                        id="aadharNo"
                        maxLength={12}
                        onKeyDown={(e) => {
                            // Only allow numbers (0-9) and control keys
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            // Block spaces explicitly
                            if (e.key === ' ') {
                                e.preventDefault();
                                return;
                            }
                            // Only allow digits (0-9)
                            if (!/^[0-9]$/.test(e.key)) {
                                e.preventDefault(); // Block everything else
                            }
                        }}
                        {...register("aadharNo")}
                        error={errors.aadharNo?.message}
                    />
                    <HRMSInputText
                        label="PAN Card No."
                        id="panCardNo"
                        maxLength={10}
                        onKeyDown={(e) => {
                            const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                return; // Allow control keys
                            }
                            //Block spaces explicitly
                            if(e.key === ' ') {
                                e.preventDefault();
                                return;
                            }
                        }}
                        {...register("panCardNo")}
                        error={errors.panCardNo?.message}
                    />
                    <Controller
                        name="bloodGroup"
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>Blood Group</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    />
                    <Controller
                        name="salaryType"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>Salary Type</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">monthly</SelectItem>
                                        <SelectItem value="hourly">hourly</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    <Controller
                        name="modeOfPayment"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1.5">
                                <Label>
                                    Mode of Payment <span className="text-red-500">*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger
                                        className={cn(
                                            fieldState.error
                                                ? "border-destructive focus-visible:ring-destructive"
                                                : "border-input focus-visible:ring-ring"
                                        )}
                                    >
                                        <SelectValue placeholder="--Select--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bank">Bank</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <div className="font-medium text-[0.8rem] text-destructive">
                                        {fieldState.error.message}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                    {/* Employee Photo Upload */}
                    <div className="space-y-2">
                        <Label>Upload Employee Photo</Label>
                        <div className="rounded-lg border-2 border-gray-300 border-dashed p-4 text-center">
                            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                {selectedPhoto ? (
                                    <img
                                        src={selectedPhoto}
                                        alt="Employee Preview"
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    <Upload className="h-12 w-12 text-gray-400" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    id="employeePhoto"
                                    accept="image/*"
                                    onChange={onPhotoUpload}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full bg-gray-100"
                                    onClick={() =>
                                        document.getElementById("employeePhoto")?.click()
                                    }
                                >
                                    {selectedPhoto ? "Change Photo" : "Upload Employee Photo"}
                                </Button>
                                {selectedPhoto && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => {
                                            setSelectedPhoto(null);
                                            setPhotoFile(null);
                                            const fileInput = document.getElementById(
                                                "employeePhoto"
                                            ) as HTMLInputElement;
                                            if (fileInput) fileInput.value = "";
                                        }}
                                    >
                                        Remove Photo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Bank Details - Conditional on Mode of Payment */}
                    {watch("modeOfPayment") === "Bank" ? (
                        <div className="space-y-4">
                            <div className="rounded-md bg-gray-200 px-4 py-2">
                                <h3 className="font-semibold text-base text-gray-900 uppercase">
                                    EMPLOYEE BANK DETAILS:
                                </h3>
                            </div>
                            <div className="rounded-lg border bg-card">
                                <div className="bg-gray-200 px-4 py-2 text-gray-900 rounded-t-lg">
                                    <div className="grid grid-cols-5 gap-2 font-semibold text-sm">
                                        <div>Serial No.</div>
                                        <div>Employer Bank Name</div>
                                        <div>Bank Account No.</div>
                                        <div>Account Type</div>
                                        <div>Action</div>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4">
                                    {bankFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-5 items-center gap-2"
                                        >
                                            <div>{index + 1}</div>
                                            <div>
                                                <Controller
                                                    name={`bankDetails.${index}.employerBankName`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value || ""}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="--Select--" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {memoizedBankOptions.map((bank: any) => (
                                                                    <SafeSelectItem
                                                                        key={bank.id}
                                                                        value={bank.value}
                                                                    >
                                                                        {bank.name}
                                                                    </SafeSelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <HRMSInputText
                                                    placeholder="Bank Account No."
                                                    maxLength={14}
                                                    onKeyDown={(e) => {
                                                        // Only allow numbers (0-9) and control keys
                                                        const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                                                        if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                            return; // Allow control keys
                                                        }
                                                        // Block spaces explicitly
                                                        if (e.key === ' ') {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        // Only allow digits (0-9)
                                                        if (!/^[0-9]$/.test(e.key)) {
                                                            e.preventDefault(); // Block everything else
                                                        }
                                                    }}
                                                    {...register(`bankDetails.${index}.bankAccountNo`)}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Controller
                                                    name={`bankDetails.${index}.accountType`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value || undefined}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Default">Default</SelectItem>
                                                                <SelectItem value="Alternate">
                                                                    Alternate
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeBank(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            appendBank({
                                                employerBankName: "",
                                                bankAccountNo: "",
                                                accountType: "Default",
                                            })
                                        }
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Add Bank Account
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <StandardTabActions
                errors={errors}
                isSubmitting={isSubmitting}
                onClear={onClear}
                currentTab={currentTab}
                onPreviousTab={onPreviousTab}
            />
        </div>
    );
}
// Export component - removed memo to prevent issues with form state updates
export const EmployeeTab = EmployeeTabComponent;
