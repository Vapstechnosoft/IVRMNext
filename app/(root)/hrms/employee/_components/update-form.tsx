'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateField } from '@/components/ui/dateField';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStateDropdown } from '@/hooks/hrms/useEmployeeRegister';
import {
    useBankDropdown,
    useBloodGroupDropdown,
    useCasteCategoryDropdown,
    useCasteDropdown,
    useContactTypeDropdown,
    useCountryDropdown,
    useCourseDropdown,
    useDesignationDropdown,
    useEmployeeById,
    useEmployeeTypeDropdown,
    useGenderDropdown,
    useGradeDropdown,
    useGroupTypeDropdown,
    useInstitutionDropdown,
    useLeaveReasonDropdown,
    useMaritalStatusDropdown,
    usePaymentModeDropdown,
    useReligionDropdown,
    useSalaryTypeDropdown,
    useSaveEmployee,
    useSaveEmployeeExperience,
    useSaveEmployeeQualification,
    useScoreTypeDropdown,
    useSpecializationDropdown,
    useTeachingTypeDropdown
} from '@/hooks/hrms/useEmployeeRegister';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import { employeeRegisterSchemas, type qualificationDetailSchema } from '@/schemas/hrms/employee-register-schemas';
import type { SavePersonalDetailsApiRequest } from '@/types/hrms/employee-register';
import type { IEmployeeList } from '@/types/hrms/hrms-config/employee';
import type {
    IBankDropdown,
    IBloodGroupDropdown,
    ICasteCategoryDropdown,
    ICasteDropdown,
    IContactTypeDropdown,
    ICountryDropdown,
    ICourseDropdown,
    IDesignationDropdown,
    IEmployeeTypeDropdown,
    IGenderDropdown,
    IGradeDropdown,
    IGroupTypeDropdown,
    IInstitutionDropdown,
    ILeaveReasonDropdown,
    IMaritalStatusDropdown,
    IPaymentModeDropdown,
    IReligionDropdown,
    ISalaryTypeDropdown,
    IScoreTypeDropdown,
    ISpecializationDropdown,
    IStateDropdown,
    ITeachingTypeDropdown
} from '@/types/hrms/hrms-config/employee';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Check, ChevronLeft, ChevronRight, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import {
    employeeRegisterSteps,
    mapApiResponseToTab1Fields,
    mapApiResponseToTab2Fields,
    mapApiResponseToTab3Fields,
    mapApiResponseToTab4Fields,
    mapApiResponseToTab5Fields,
    mapApiResponseToTab6Fields,
    mapApiResponseToTab7Fields,
    mapApiResponseToTab8Fields,
    mapFormDataToApiFormat,
    mapFormDataToApiFormatWithoutAddress,
    tabFieldMap
} from './employee-register-helper';
import { PayrollTab } from './payroll-tab';

// Helper component for Qualification State Dropdown (needs to be separate component to use hooks)
function QualificationStateDropdown({
    control,
    index,
    countryId,
    setValue,
    fallbackStates = []
}: {
    control: any;
    index: number;
    countryId: string | null;
    setValue?: any;
    fallbackStates?: any[];
}) {
    const countryIdNum = countryId ? (Number.isNaN(Number(countryId)) ? null : Number(countryId)) : null;
    const { data: fetchedStates = [], isLoading } = useStateDropdown(countryIdNum);
    const availableStates: IStateDropdown[] = countryIdNum
        ? Array.isArray(fetchedStates)
            ? fetchedStates
            : []
        : (fallbackStates as IStateDropdown[]);
    const prevCountryIdRef = useRef<string | null>(countryId);
    useEffect(() => {
        if (!setValue) return;
        if (prevCountryIdRef.current !== countryId) {
            prevCountryIdRef.current = countryId;
            setValue(`qualificationDetails.${index}.qualificationState`, '', {
                shouldValidate: false
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryId, index, setValue]);
    return (
        <Controller
            name={`qualificationDetails.${index}.qualificationState`}
            control={control}
            render={({ field }) => (
                <div className='flex flex-col gap-1.5'>
                    <Label>State*</Label>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className='h-9'>
                            <SelectValue placeholder='Select State' />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value='loading' disabled>
                                    Loading states...
                                </SelectItem>
                            ) : (
                                availableStates
                                    .filter((state: IStateDropdown) => {
                                        return state.key != null && state.key !== undefined && state.key !== 0;
                                    })
                                    .map((state: IStateDropdown) => {
                                        const key = state.key?.toString().trim();
                                        if (!key || key === '') return null;
                                        const value = state.value || String(state.key);
                                        return (
                                            <SelectItem key={state.key} value={key} textValue={value}>
                                                {value}
                                            </SelectItem>
                                        );
                                    })
                                    .filter(Boolean)
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}
        />
    );
}

// Helper functions for SelectItem - prevents empty string values
const SafeSelectItem = ({
    value,
    children,
    ...props
}: {
    value: any;
    children: React.ReactNode;
    [key: string]: any;
}) => {
    if (value == null || value === undefined || value === '') {
        return null;
    }
    const strValue = String(value);
    if (strValue === '' || strValue.trim() === '' || strValue.length === 0) {
        return null;
    }
    const trimmedValue = strValue.trim();
    if (trimmedValue === '' || trimmedValue.length === 0) {
        return null;
    }
    return (
        <SelectItem {...props} value={trimmedValue}>
            {children}
        </SelectItem>
    );
};

// Type definition using imported schema
type FormFields = z.infer<typeof employeeRegisterSchemas.add>;

const steps = employeeRegisterSteps;

interface UpdateEmployeeFormProps {
    selectedRow: IEmployeeList;
    onSuccess?: () => void;
    className?: string;
}

/**
 * Update Employee Form - Standalone form for updating existing employees
 * Matches the pattern from preadmission application-form update-form
 * Loads employee details but NO old API mapping - endpoints not provided yet
 */
export default function UpdateEmployeeForm({ selectedRow, onSuccess, className = '' }: UpdateEmployeeFormProps): React.ReactElement {
    // Grade dropdown - API: /api/MasterDropDown/GetGradeList
    const { data: gradeDropdownResponse, isLoading: isLoadingGrades } = useGradeDropdown();
    // Extract data from response (handle ApiResponse wrapper if needed)
    const gradeDropdown: IGradeDropdown[] = Array.isArray(gradeDropdownResponse)
        ? gradeDropdownResponse
        : (gradeDropdownResponse as any)?.data || [];

    // Group Type dropdown - API: /api/MasterDropDown/GroupType
    const { data: groupTypeDropdownResponse, isLoading: isLoadingGroupTypes } = useGroupTypeDropdown();
    // Extract and transform data from response (handle ApiResponse wrapper if needed)
    const rawGroupTypes = Array.isArray(groupTypeDropdownResponse)
        ? groupTypeDropdownResponse
        : (groupTypeDropdownResponse as any)?.data || [];
    // Transform to { key, value } format if needed
    const groupTypeDropdown: IGroupTypeDropdown[] = rawGroupTypes
        .map((item: any) => {
            // If already in { key, value } format, return as is
            if (item.key !== undefined && item.value !== undefined) {
                return item;
            }
            // Otherwise transform from API structure { HRMGT_Id, HRMGT_EmployeeGroupType }
            return {
                key: String(item.HRMGT_Id ?? item.key ?? ''),
                value: String(item.HRMGT_EmployeeGroupType ?? item.value ?? item.label ?? '')
            };
        })
        .filter((item: IGroupTypeDropdown) => item.key != null && item.key !== undefined && item.key !== 0);

    // Employee Type dropdown - API: /api/MasterDropDown/GetEmployeeType
    const { data: employeeTypeDropdownResponse, isLoading: isLoadingEmployeeTypes } = useEmployeeTypeDropdown();
    // Extract and transform data from response (handle ApiResponse wrapper if needed)
    const rawEmployeeTypes = Array.isArray(employeeTypeDropdownResponse)
        ? employeeTypeDropdownResponse
        : (employeeTypeDropdownResponse as any)?.data || [];
    // Transform to { key, value } format if needed
    const employeeTypeDropdown: IEmployeeTypeDropdown[] = rawEmployeeTypes
        .map((item: any) => {
            // If already in { key, value } format, return as is
            if (item.key !== undefined && item.value !== undefined) {
                return item;
            }
            // Otherwise transform from API structure { HRMET_Id, HRMET_EmployeeType }
            return {
                key: String(item.HRMET_Id ?? item.key ?? ''),
                value: String(item.HRMET_EmployeeType ?? item.value ?? item.label ?? '')
            };
        })
        .filter((item: IEmployeeTypeDropdown) => item.key != null && item.key !== undefined && item.key !== 0);

    // Institution dropdown - API: /api/MasterDropDown/GetInstitutionList
    const { data: institutionDropdownResponse, isLoading: isLoadingInstitutions } = useInstitutionDropdown();
    // Extract data from response (handle ApiResponse wrapper if needed)
    const institutionDropdown: IInstitutionDropdown[] = Array.isArray(institutionDropdownResponse)
        ? institutionDropdownResponse
        : (institutionDropdownResponse as any)?.data || [];

    // Designation dropdown - API: /api/MasterDropDown/GetDesignation
    const { data: designationDropdownResponse, isLoading: isLoadingDesignations } = useDesignationDropdown();
    // Extract data from response (handle ApiResponse wrapper if needed)
    const designationDropdown: IDesignationDropdown[] = Array.isArray(designationDropdownResponse)
        ? designationDropdownResponse
        : (designationDropdownResponse as any)?.data || [];

    // Gender dropdown - API: /api/MasterDropDown/GetGenderList
    const { data: genderDropdownResponse, isLoading: isLoadingGenders } = useGenderDropdown();
    const genderDropdown: IGenderDropdown[] = Array.isArray(genderDropdownResponse)
        ? genderDropdownResponse
        : (genderDropdownResponse as any)?.data || [];

    // Marital Status dropdown - API: /api/MasterDropDown/GetMaritalStateList
    const { data: maritalStatusDropdownResponse, isLoading: isLoadingMaritalStatuses } = useMaritalStatusDropdown();
    const maritalStatusDropdown: IMaritalStatusDropdown[] = Array.isArray(maritalStatusDropdownResponse)
        ? maritalStatusDropdownResponse
        : (maritalStatusDropdownResponse as any)?.data || [];

    // Religion dropdown - API: /api/MasterDropDown/GeAllReligionList
    const { data: religionDropdownResponse, isLoading: isLoadingReligions } = useReligionDropdown();
    const religionDropdown: IReligionDropdown[] = Array.isArray(religionDropdownResponse)
        ? religionDropdownResponse
        : (religionDropdownResponse as any)?.data || [];

    // Caste Category dropdown - API: /api/MasterDropDown/GeAllCasteCategoriesList
    const { data: casteCategoryDropdownResponse, isLoading: isLoadingCasteCategories } = useCasteCategoryDropdown();
    const casteCategoryDropdown: ICasteCategoryDropdown[] = Array.isArray(casteCategoryDropdownResponse)
        ? casteCategoryDropdownResponse
        : (casteCategoryDropdownResponse as any)?.data || [];

    // Caste dropdown - API: /api/MasterDropDown/GetAllCasteList
    const { data: casteDropdownResponse, isLoading: isLoadingCastes } = useCasteDropdown();
    const casteDropdown: ICasteDropdown[] = Array.isArray(casteDropdownResponse)
        ? casteDropdownResponse
        : (casteDropdownResponse as any)?.data || [];

    // Payment Mode dropdown - API: /api/MasterDropDown/GetPaymentModeList
    const { data: paymentModeDropdownResponse, isLoading: isLoadingPaymentModes } = usePaymentModeDropdown();
    const paymentModeDropdown: IPaymentModeDropdown[] = Array.isArray(paymentModeDropdownResponse)
        ? paymentModeDropdownResponse
        : (paymentModeDropdownResponse as any)?.data || [];

    // Bank dropdown - API: /api/MasterDropDown/GetBankList
    const { data: bankDropdownResponse, isLoading: isLoadingBanks } = useBankDropdown();
    const bankDropdown: IBankDropdown[] = Array.isArray(bankDropdownResponse)
        ? bankDropdownResponse
        : (bankDropdownResponse as any)?.data || [];

    // Country dropdown - API: /api/MasterDropDown/GetCountryList
    const { data: countryDropdownResponse, isLoading: isLoadingCountries } = useCountryDropdown();
    const countryDropdown: ICountryDropdown[] = Array.isArray(countryDropdownResponse)
        ? countryDropdownResponse
        : (countryDropdownResponse as any)?.data || [];

    // Specialization dropdown - API: /api/MasterDropDown/GetSpecialisationList
    const { data: specializationDropdownResponse, isLoading: isLoadingSpecializations } = useSpecializationDropdown();
    const specializationDropdown: ISpecializationDropdown[] = Array.isArray(specializationDropdownResponse)
        ? specializationDropdownResponse
        : (specializationDropdownResponse as any)?.data || [];

    // Leave Reason dropdown - API: /api/MasterDropDown/GetLeaveReasonList
    const { data: leaveReasonDropdownResponse, isLoading: isLoadingLeaveReasons } = useLeaveReasonDropdown();
    const leaveReasonDropdown: ILeaveReasonDropdown[] = Array.isArray(leaveReasonDropdownResponse)
        ? leaveReasonDropdownResponse
        : (leaveReasonDropdownResponse as any)?.data || [];

    // Blood Group dropdown - API: /api/MasterDropDown/GetBloodGroupList
    const { data: bloodGroupDropdownResponse, isLoading: isLoadingBloodGroups } = useBloodGroupDropdown();
    const bloodGroupDropdown: IBloodGroupDropdown[] = Array.isArray(bloodGroupDropdownResponse)
        ? bloodGroupDropdownResponse
        : (bloodGroupDropdownResponse as any)?.data || [];

    // Salary Type dropdown - API: /api/MasterDropDown/GetSalaryTypeList
    const { data: salaryTypeDropdownResponse, isLoading: isLoadingSalaryTypes } = useSalaryTypeDropdown();
    const salaryTypeDropdown: ISalaryTypeDropdown[] = Array.isArray(salaryTypeDropdownResponse)
        ? salaryTypeDropdownResponse
        : (salaryTypeDropdownResponse as any)?.data || [];

    // Teaching Type dropdown - API: /api/MasterDropDown/GetTeachingTypeList
    const { data: teachingTypeDropdownResponse, isLoading: isLoadingTeachingTypes } = useTeachingTypeDropdown();
    const teachingTypeDropdown: ITeachingTypeDropdown[] = Array.isArray(teachingTypeDropdownResponse)
        ? teachingTypeDropdownResponse
        : (teachingTypeDropdownResponse as any)?.data || [];

    // Score Type dropdown - API: /api/MasterDropDown/ScoreTypeList
    const { data: scoreTypeDropdownResponse, isLoading: isLoadingScoreTypes } = useScoreTypeDropdown();
    const scoreTypeDropdown: IScoreTypeDropdown[] = Array.isArray(scoreTypeDropdownResponse)
        ? scoreTypeDropdownResponse
        : (scoreTypeDropdownResponse as any)?.data || [];

    // Contact Type dropdown - API: /api/MasterDropDown/GetContactType
    const { data: contactTypeDropdownResponse, isLoading: isLoadingContactTypes } = useContactTypeDropdown();
    const contactTypeDropdown: IContactTypeDropdown[] = Array.isArray(contactTypeDropdownResponse)
        ? contactTypeDropdownResponse
        : (contactTypeDropdownResponse as any)?.data || [];

    // Course dropdown - API: /api/MasterDropDown/GetCourseList
    const { data: courseDropdownResponse, isLoading: isLoadingCourses } = useCourseDropdown();
    const courseDropdown: ICourseDropdown[] = Array.isArray(courseDropdownResponse)
        ? courseDropdownResponse
        : (courseDropdownResponse as any)?.data || [];

    // Options object - Multiple dropdowns are integrated, others will be added one by one as APIs are provided
    const options = useMemo(() => {
        return {
            grades: gradeDropdown || [],
            groupTypes: groupTypeDropdown || [],
            empTypes: employeeTypeDropdown || [],
            institutions: institutionDropdown || [],
            designations: designationDropdown || [],
            genders: genderDropdown || [],
            maritalStatuses: maritalStatusDropdown || [],
            religions: religionDropdown || [],
            casteCategories: casteCategoryDropdown || [],
            castes: casteDropdown || [],
            modeOfPayment: paymentModeDropdown || [],
            banks: bankDropdown || [],
            countries: countryDropdown || [],
            departments: [],
            states: [],
            courses: courseDropdown || [],
            specialisations: specializationDropdown || [],
            teachingNonTeaching: teachingTypeDropdown || [],
            bloodGroups: bloodGroupDropdown || [],
            salaryTypes: salaryTypeDropdown || [],
            addressTypes: [],
            phoneTypes: contactTypeDropdown || [],
            contactTypes: contactTypeDropdown || [],
            cgpaPercentageTypes: scoreTypeDropdown || [],
            leavingReasons: leaveReasonDropdown || [],
            earningList: [],
            detectionList: [],
            arrearList: [],
            grossList: [],
            documentList: [],
            employeedetailList: []
        };
    }, [
        gradeDropdown,
        groupTypeDropdown,
        employeeTypeDropdown,
        institutionDropdown,
        designationDropdown,
        genderDropdown,
        maritalStatusDropdown,
        religionDropdown,
        casteCategoryDropdown,
        casteDropdown,
        paymentModeDropdown,
        bankDropdown,
        countryDropdown,
        courseDropdown,
        specializationDropdown,
        leaveReasonDropdown,
        bloodGroupDropdown,
        salaryTypeDropdown,
        teachingTypeDropdown,
        scoreTypeDropdown
    ]);

    const { mutate: saveEmployeeMutation, isPending } = useSaveEmployee();
    const { mutate: saveQualificationMutation, isPending: isSavingQualification } = useSaveEmployeeQualification();
    const { mutate: saveExperienceDetails, isPending: isSavingExperience } = useSaveEmployeeExperience();
    const savePersonalDetails = saveEmployeeMutation;
    const saveQualificationDetails = saveQualificationMutation;
    const saveDocumentDetails = saveEmployeeMutation;
    const saveMedicalDetails = saveEmployeeMutation;
    const _saveBankDetails = saveEmployeeMutation;
    const isSavingDocument = isPending;
    const isSavingMedical = isPending;
    const isSavingBank = isPending;

    // Update form - edit mode enabled
    const _isEditMode = true;
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [_photoFile, setPhotoFile] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [savedEmployeeId, setSavedEmployeeId] = useState<number | null>(selectedRow?.hrmE_Id || null);
    const [isFormInitialized, setIsFormInitialized] = useState(false);

    // Helper to get current tab key from step
    const getCurrentTabKey = () => steps.find((s) => s.id === currentStep)?.tabKey || 'employee';

    // Function to go to previous step
    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Function to go to next step
    const nextStep = async () => {
        // Prevent duplicate submissions
        if (isSavingQualification || isSavingExperience || isSubmittingAny) {
            console.warn('⚠️ [DEBUG] nextStep - Already saving, ignoring duplicate call');
            return;
        }

        const currentTabKey = getCurrentTabKey();
        const currentTabFields = tabFieldMap[currentTabKey] || [];

        console.log('🔍 [DEBUG] nextStep called - Step:', currentStep, 'TabKey:', currentTabKey);

        if (currentTabFields.length > 0) {
            const isValid = await trigger(currentTabFields as any);
            console.log('🔍 [DEBUG] Validation result:', isValid);
            if (!isValid) {
                const formErrors = formState.errors;
                console.log('🔍 [DEBUG] Form errors:', formErrors);

                // Function to extract error message from nested structure
                const extractErrorMessage = (errors: any): string | null => {
                    if (!errors) return null;

                    // If it's a direct error with message
                    if (typeof errors === 'string') return errors;
                    if (errors?.message) return errors.message;

                    // If it's an array (like qualificationDetails)
                    if (Array.isArray(errors)) {
                        for (const item of errors) {
                            if (item && typeof item === 'object') {
                                // Check each field in the array item
                                for (const key in item) {
                                    const fieldError = item[key];
                                    if (fieldError) {
                                        const msg = extractErrorMessage(fieldError);
                                        if (msg) return msg;
                                    }
                                }
                            }
                        }
                    }

                    // If it's an object, check nested properties
                    if (typeof errors === 'object') {
                        for (const key in errors) {
                            const nestedError = errors[key];
                            const msg = extractErrorMessage(nestedError);
                            if (msg) return msg;
                        }
                    }

                    return null;
                };

                // Extract and show first error message
                const errorMessage = extractErrorMessage(formErrors);
                if (errorMessage) {
                    toast.error(errorMessage);
                } else {
                    toast.error('Please fix the validation errors before proceeding');
                }
                return;
            }
        }

        const data = getValues();
        const currentStepId = currentStep;

        console.log('🔍 [DEBUG] Proceeding to save - Step ID:', currentStepId);
        console.log('🔍 [DEBUG] nextStep - Checking conditions:');
        console.log('  - currentStepId === 1:', currentStepId === 1);
        console.log('  - currentStepId === 2:', currentStepId === 2);
        console.log('  - currentStepId === 3:', currentStepId === 3);
        console.log('  - currentStepId === 4:', currentStepId === 4);
        console.log('  - currentStepId type:', typeof currentStepId);
        console.log('  - currentStepId value:', currentStepId);

        // For steps 1 and 2, we need to save data via API before moving to next step
        if (currentStepId === 1) {
            // Employee Information tab - call /api/EmployeeRegistration/SavePersonalDetails
            // Save employee details without address (address fields will be null)
            const payload = mapFormDataToApiFormatWithoutAddressLocal(data);
            payload.hrmE_Id = selectedRow?.hrmE_Id || 0; // Use existing employee ID

            console.log('🔍 [DEBUG] Tab 1 (Employee Information) - Form Data:', data);
            console.log('🔍 [DEBUG] Tab 1 (Employee Information) - Payload:', payload);
            console.log('🔍 [DEBUG] Tab 1 (Employee Information) - Employee ID:', payload.hrmE_Id);
            console.log('🔍 [DEBUG] Tab 1 (Employee Information) - Address Fields Check:');
            console.log('  - Contact Address:', payload.hrmE_LocStreet, payload.hrmE_LocCity, payload.hrmE_LocStateId);
            console.log('  - Permanent Address:', payload.hrmE_PerStreet, payload.hrmE_PerCity, payload.hrmE_PerStateId);
            console.log('🔍 [DEBUG] Tab 1 (Employee Information) - Calling savePersonalDetails...');

            savePersonalDetails(payload, {
                onSuccess: (response: any) => {
                    console.log('✅ [DEBUG] Tab 1 (Employee Information) - Save Success:', response);
                    // Show API response message
                    if (response?.success && response?.message) {
                        toast.success(response.message);
                    } else if (response?.message) {
                        toast.info(response.message);
                    }
                    // API returns hrmE_Id (lowercase) in response
                    const employeeId =
                        response?.data?.hrmE_Id ||
                        response?.data?.HRME_Id ||
                        response?.hrmE_Id ||
                        response?.HRME_Id ||
                        selectedRow?.hrmE_Id ||
                        0;
                    console.log('🔍 [DEBUG] Tab 1 - Extracted Employee ID:', employeeId);
                    if (employeeId && employeeId > 0) {
                        setSavedEmployeeId(employeeId);
                        setCurrentStep(2);
                    } else {
                        console.error('❌ [DEBUG] Tab 1 - Failed to get employee ID from response');
                        toast.error('Failed to get employee ID from response');
                    }
                },
                onError: (error: any) => {
                    console.error('❌ [DEBUG] Tab 1 (Employee Information) - Save Error:', error);
                    // Show API error message
                    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save employee details';
                    toast.error(errorMessage);
                }
            });
        } else if (currentStepId === 2) {
            // Address Information tab - call same endpoint /api/EmployeeRegistration/SavePersonalDetails
            // Update with address details using the hrmE_Id
            const employeeId = savedEmployeeId || selectedRow?.hrmE_Id;
            if (!employeeId) {
                console.error('❌ [DEBUG] Tab 2 - No employee ID found');
                toast.error('Please save Employee details first');
                setCurrentStep(1);
                return;
            }
            const payload = mapFormDataToApiFormatLocal(data);
            payload.hrmE_Id = employeeId; // Use the employee ID

            console.log('🔍 [DEBUG] Tab 2 (Address Information) - Form Data:', data);
            console.log('🔍 [DEBUG] Tab 2 (Address Information) - Payload:', payload);
            console.log('🔍 [DEBUG] Tab 2 (Address Information) - Employee ID:', employeeId);
            console.log('🔍 [DEBUG] Tab 2 (Address Information) - Address Fields:');
            console.log('  - Contact Address:', {
                street: payload.hrmE_LocStreet,
                area: payload.hrmE_LocArea,
                city: payload.hrmE_LocCity,
                stateId: payload.hrmE_LocStateId,
                countryId: payload.hrmE_LocCountryId,
                pincode: payload.hrmE_LocPincode
            });
            console.log('  - Permanent Address:', {
                street: payload.hrmE_PerStreet,
                area: payload.hrmE_PerArea,
                city: payload.hrmE_PerCity,
                stateId: payload.hrmE_PerStateId,
                countryId: payload.hrmE_PerCountryId,
                pincode: payload.hrmE_PerPincode
            });
            console.log('🔍 [DEBUG] Tab 2 (Address Information) - Calling savePersonalDetails...');

            savePersonalDetails(payload, {
                onSuccess: (response: any) => {
                    console.log('✅ [DEBUG] Tab 2 (Address Information) - Save Success:', response);
                    console.log('🔍 [DEBUG] Tab 2 - Full API Response:', JSON.stringify(response, null, 2));
                    console.log('🔍 [DEBUG] Tab 2 - Response Success:', response?.success);
                    console.log('🔍 [DEBUG] Tab 2 - Response Message:', response?.message);
                    console.log('🔍 [DEBUG] Tab 2 - Response Data:', response?.data);

                    // Show API response message
                    if (response?.success && response?.message) {
                        toast.success(response.message);
                    } else if (response?.message) {
                        toast.info(response.message);
                    } else if (response?.success === false) {
                        console.warn('⚠️ [DEBUG] Tab 2 - API returned success: false');
                        toast.warning('Address saved but API returned success: false. Please verify the data was saved.');
                    }

                    // Verify address fields were sent
                    console.log('🔍 [DEBUG] Tab 2 - Verification - Address fields sent in payload:');
                    console.log('  Contact:', {
                        street: payload.hrmE_LocStreet,
                        area: payload.hrmE_LocArea,
                        city: payload.hrmE_LocCity,
                        stateId: payload.hrmE_LocStateId,
                        countryId: payload.hrmE_LocCountryId,
                        pincode: payload.hrmE_LocPincode
                    });
                    console.log('  Permanent:', {
                        street: payload.hrmE_PerStreet,
                        area: payload.hrmE_PerArea,
                        city: payload.hrmE_PerCity,
                        stateId: payload.hrmE_PerStateId,
                        countryId: payload.hrmE_PerCountryId,
                        pincode: payload.hrmE_PerPincode
                    });

                    setCurrentStep(3);
                },
                onError: (error: any) => {
                    console.error('❌ [DEBUG] Tab 2 (Address Information) - Save Error:', error);
                    // Show API error message
                    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save address details';
                    toast.error(errorMessage);
                }
            });
        } else if (currentStepId === 3) {
            // Qualification tab - save qualification details
            console.log('🔍 [DEBUG] Qualification tab - Starting save process');
            const employeeId = savedEmployeeId || selectedRow?.hrmE_Id;
            console.log(
                '🔍 [DEBUG] Employee ID:',
                employeeId,
                'savedEmployeeId:',
                savedEmployeeId,
                'selectedRow?.hrmE_Id:',
                selectedRow?.hrmE_Id
            );

            if (!employeeId) {
                console.error('❌ [DEBUG] No employee ID found');
                toast.error('Please save Employee and Address details first');
                setCurrentStep(1);
                return;
            }

            const qualificationList = data.qualificationDetails || [];
            console.log('🔍 [DEBUG] Qualification list:', qualificationList, 'Length:', qualificationList.length);

            if (qualificationList.length === 0) {
                console.error('❌ [DEBUG] No qualifications found');
                setError('qualificationDetails', {
                    type: 'required',
                    message: 'Please add at least one qualification'
                });
                toast.error('Please add at least one qualification');
                return;
            }
            // Map qualification data to new API format
            console.log(
                '🔍 [DEBUG] Qualification IDs Check (nextStep):',
                qualificationList.map((q: any, i: number) => ({
                    index: i,
                    hrmeQ_Id: q.hrmeQ_Id,
                    HRMEQ_Id: q.HRMEQ_Id,
                    hasId: !!(q.hrmeQ_Id || q.HRMEQ_Id)
                }))
            );
            const qualificationsPayload = qualificationList.map((qual: any, index: number) => {
                const id = qual.hrmeQ_Id || qual.HRMEQ_Id || 0; // Check both cases
                console.log(`🔍 [DEBUG] Qualification #${index + 1} (nextStep) - ID from form:`, id);
                return {
                    hrmeQ_Id: id, // Use existing ID if updating, 0 for new
                    hrmC_Id: Number(qual.course) || 0,
                    hrmE_Id: employeeId,
                    hrmE_QualificationName: qual.qualification || '',
                    hrmeQ_CollegeName: qual.college || '',
                    hrmeQ_UniversityName: qual.university || '',
                    hrmeQ_YearOfPassing: Number(qual.yearOfPassing) || 0,
                    hrmeQ_RegistrationNo: qual.registrationNo || '',
                    hrmeQ_Result: qual.result || '',
                    hrmeQ_CGPAOrPerFlag: qual.cgpaOrPercentage || 'CGPA',
                    hrmeQ_CGPA: qual.cgpaOrPercentage === 'CGPA' ? qual.cgpa || '' : '',
                    hrmeQ_Percentage: qual.cgpaOrPercentage === 'Percentage' ? qual.cgpa || '' : '',
                    hrmeQ_AreaOfSpecialisation: qual.areaOfSpecialisation || qual.specialisation || '',
                    hrmeQ_PHDFlg: qual.phdFlag || false,
                    hrmeQ_StateId: Number(qual.qualificationState) || 0,
                    hrmeQ_CountryId: Number(qual.qualificationCountry) || 0,
                    hrmeQ_ThesisTitle: qual.thesisTitle || '',
                    hrmeQ_RegistrationYear: Number(qual.registrationYear) || 0,
                    hrmeQ_GuideName: qual.guideName || '',
                    hrmeQ_Date: qual.qualifiedDate ? new Date(qual.qualifiedDate).toISOString() : null,
                    hrmeQ_MedicalCouncil: qual.medicalCouncil || '',
                    hrmeQ_Hardcopy: qual.hardcopy || '',
                    retrunMsg: ''
                };
            });

            console.log('🔍 [DEBUG] Qualification Payload Count:', qualificationsPayload.length);
            console.log('🔍 [DEBUG] Qualification Payload:', qualificationsPayload);
            console.log('🔍 [DEBUG] Employee ID:', employeeId);
            console.log('🔍 [DEBUG] Calling saveQualificationDetails mutation ONCE with array of', qualificationsPayload.length, 'items');
            console.log('🔍 [DEBUG] saveQualificationDetails function:', typeof saveQualificationDetails);
            console.log('🔍 [DEBUG] isSavingQualification:', isSavingQualification);

            if (!saveQualificationDetails) {
                console.error('❌ [DEBUG] saveQualificationDetails is not defined!');
                toast.error('Save qualification function is not available');
                return;
            }

            if (isSavingQualification) {
                console.warn('⚠️ [DEBUG] Already saving qualification, ignoring duplicate call');
                return;
            }

            // Ensure we only call the API once with the entire array
            saveQualificationDetails(qualificationsPayload, {
                onSuccess: (response: any) => {
                    console.log('✅ [DEBUG] Qualification Save Success:', response);
                    // Show API response message
                    if (response?.success && response?.message) {
                        toast.success(response.message);
                    } else if (response?.message) {
                        toast.info(response.message);
                    }
                    setCurrentStep(4);
                },
                onError: (error: any) => {
                    console.error('❌ [DEBUG] Qualification Save Error:', error);
                    // Show API error message
                    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save qualification details';
                    toast.error(errorMessage);
                }
            });

            console.log('🔍 [DEBUG] Mutation call completed');
        } else if (currentStepId === 4) {
            // Experience tab - save experience details
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Starting save process in nextStep');
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Employee ID:', savedEmployeeId || selectedRow?.hrmE_Id);

            const employeeId = savedEmployeeId || selectedRow?.hrmE_Id;

            if (!employeeId) {
                console.error('❌ [DEBUG] Tab 4 - No employee ID found');
                toast.error('Please save Employee and Address details first');
                setCurrentStep(1);
                return;
            }

            const experienceList = data.experienceDetails || [];
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Form Data:', data);
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Experience List (Raw):', experienceList);
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Experience Count:', experienceList.length);

            if (experienceList.length === 0) {
                console.error('❌ [DEBUG] Tab 4 - No experiences found');
                setError('experienceDetails', {
                    type: 'required',
                    message: 'Please add at least one experience'
                });
                return;
            }

            // Map experience data to API format (matching API request body format)
            console.log(
                '🔍 [DEBUG] Experience IDs Check:',
                experienceList.map((e: any, i: number) => ({
                    index: i,
                    hrmeE_Id: e.hrmeE_Id,
                    HRMEE_Id: e.HRMEE_Id,
                    hasId: !!(e.hrmeE_Id || e.HRMEE_Id)
                }))
            );
            const experiencesPayload = experienceList.map((exp: any, index: number) => {
                const id = exp.hrmeE_Id || exp.HRMEE_Id || 0; // Check both cases
                console.log(`🔍 [DEBUG] Experience #${index + 1} - ID from form:`, id, 'Full exp:', exp);
                const mapped = {
                    hrmeE_Id: id, // Use existing ID if updating, 0 for new
                    hrmE_Id: employeeId,
                    hrmeE_OrganisationName: exp.organisationName || '',
                    hrmeE_OrganisationAddress: exp.organisationAddress || '',
                    hrmeE_Department: exp.department || '',
                    hrmeE_Designation: exp.designation || '',
                    hrmeE_JoinDate: exp.joinDate ? new Date(exp.joinDate).toISOString() : '',
                    hrmeE_ExitDate: exp.exitDate ? new Date(exp.exitDate).toISOString() : '',
                    hrmeE_NoOfYears: Number(exp.noOfYears) || 0,
                    hrmeE_NoOfMonths: Number(exp.noOfMonths) || 0,
                    hrmeE_AnnualSalary: Number(exp.annualSalary) || 0,
                    hrmeE_ReasonForLeaving: exp.reasonForLeaving || ''
                };
                console.log(`🔍 [DEBUG] Tab 4 - Experience #${index + 1} Mapping:`, {
                    raw: exp,
                    mapped: mapped
                });
                return mapped;
            });

            console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload Count:', experiencesPayload.length);
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload:', experiencesPayload);
            console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload (JSON):', JSON.stringify(experiencesPayload, null, 2));
            console.log(
                '🔍 [DEBUG] Tab 4 (Experience) - Calling saveExperienceDetails ONCE with array of',
                experiencesPayload.length,
                'items'
            );
            console.log('🔍 [DEBUG] Tab 4 (Experience) - saveExperienceDetails function type:', typeof saveExperienceDetails);

            if (!saveExperienceDetails) {
                console.error('❌ [DEBUG] Tab 4 - saveExperienceDetails is not defined!');
                toast.error('Experience save function is not available. Please refresh the page.');
                return;
            }

            // Ensure we only call the API once with the entire array
            saveExperienceDetails(experiencesPayload, {
                onSuccess: (response: any) => {
                    console.log('✅ [DEBUG] Tab 4 (Experience) - Save Success:', response);
                    console.log('🔍 [DEBUG] Tab 4 - Full API Response:', JSON.stringify(response, null, 2));
                    console.log('🔍 [DEBUG] Tab 4 - Response Success:', response?.success);
                    console.log('🔍 [DEBUG] Tab 4 - Response Message:', response?.message);
                    console.log('🔍 [DEBUG] Tab 4 - Response Data:', response?.data);

                    // Verify experience data was saved
                    if (response?.data && Array.isArray(response.data)) {
                        console.log('🔍 [DEBUG] Tab 4 - Response contains experience array, length:', response.data.length);
                        console.log('🔍 [DEBUG] Tab 4 - Response Experiences:', response.data);
                    }

                    // Show API response message
                    if (response?.success && response?.message) {
                        toast.success(response.message);
                    } else if (response?.message) {
                        toast.info(response.message);
                    } else if (response?.success === false) {
                        console.warn('⚠️ [DEBUG] Tab 4 - API returned success: false');
                        toast.warning('Experience saved but API returned success: false. Please verify the data was saved.');
                    }

                    setCurrentStep(5);
                },
                onError: (error: any) => {
                    console.error('❌ [DEBUG] Tab 4 (Experience) - Save Error:', error);
                    console.error('❌ [DEBUG] Tab 4 - Error Details:', JSON.stringify(error, null, 2));
                    console.error('❌ [DEBUG] Tab 4 - Error Response:', error?.response);
                    console.error('❌ [DEBUG] Tab 4 - Error Message:', error?.message);
                    // Show API error message
                    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save experience details';
                    toast.error(errorMessage);
                }
            });
        } else {
            // For other steps, just move to next step without API call
            console.log('🔍 [DEBUG] nextStep - Falling through to else clause');
            console.log('🔍 [DEBUG] nextStep - Current Step ID:', currentStepId);
            console.log('🔍 [DEBUG] nextStep - This means Tab 4 condition was NOT met!');
            console.warn('⚠️ [DEBUG] nextStep - Tab 4 API call was skipped - moving to next step without saving');
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    // Function to go to specific step
    const _goToStep = (step: number) => {
        setCurrentStep(step);
    };

    // Refs to track initialization per tab
    const _hasInitializedTab1 = useRef(false);
    const _hasInitializedTab2 = useRef(false);
    const _hasInitializedTab3 = useRef(false);
    const _hasInitializedTab4 = useRef(false);
    const _hasInitializedTab5 = useRef(false);
    const _hasInitializedTab6 = useRef(false);
    const _hasInitializedTab7 = useRef(false);

    // Track originally loaded IDs to identify deleted items
    const _originalQualificationIds = useRef<number[]>([]);
    const _originalExperienceIds = useRef<number[]>([]);
    const _hasInitializedTab8 = useRef(false);
    const _lastEmployeeId = useRef<number | null>(null);
    const _employeeDetailsRef = useRef<any>(null);

    // Fetch full employee details when in edit mode
    const { data: employeeDetails, isLoading: isLoadingEmployee } = useEmployeeById(selectedRow?.hrmE_Id || null);

    // Store employeeDetails in ref to avoid dependency issues
    useEffect(() => {
        if (employeeDetails) {
            _employeeDetailsRef.current = employeeDetails;
        }
    }, [employeeDetails]);

    // Empty default values for update form
    const formDefaultValues = useMemo(
        () => ({
            firstName: '',
            middleName: '',
            lastName: '',
            employeeCode: '',
            typeOfEmployment: '',
            employeeGroup: '',
            school: '',
            designation: '',
            gender: '',
            maritalStatus: '',
            religion: '',
            casteCategory: '',
            caste: '',
            bloodGroup: '',
            salaryType: '',
            modeOfPayment: '',
            contactCountry: '',
            contactState: '',
            permanentCountry: '',
            permanentState: '',
            sameAsCommunicationAddress: false,
            qualificationDetails: [],
            experienceDetails: [],
            documentList: [],
            mobileDetails: [{ mobileNo: '', type: 'Default' }],
            emailDetails: [{ emailId: '', type: 'Default' }],
            bankDetails: [],
            dateOfBirth: '',
            dateOfRetirement: ''
        }),
        []
    );

    const { control, register, handleSubmit, reset, watch, getValues, setValue, trigger, setError, clearErrors, formState } =
        useForm<FormFields>({
            resolver: zodResolver(employeeRegisterSchemas.add),
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: formDefaultValues
        });

    const { errors, isSubmitting } = formState;

    // Watch for country changes
    const contactCountry = useWatch({ control, name: 'contactCountry' });
    const permanentCountry = useWatch({ control, name: 'permanentCountry' });
    const dateOfBirth = useWatch({ control, name: 'dateOfBirth' });
    const sameAsCommunicationAddress = useWatch({
        control,
        name: 'sameAsCommunicationAddress'
    });
    const contactAddress = useWatch({ control, name: 'contactAddress' });
    const contactArea = useWatch({ control, name: 'contactArea' });
    const contactState = useWatch({ control, name: 'contactState' });
    const contactCity = useWatch({ control, name: 'contactCity' });
    const contactPincode = useWatch({ control, name: 'contactPincode' });
    const _permanentState = useWatch({ control, name: 'permanentState' });

    // Convert country string to number for API call
    const contactCountryId = contactCountry ? Number(contactCountry) : null;
    const permanentCountryId = permanentCountry ? Number(permanentCountry) : null;

    // Fetch states for contact country
    const { data: contactStates = [], isLoading: isLoadingContactStates } = useStateDropdown(contactCountryId);
    // Fetch states for permanent country
    const { data: permanentStates = [], isLoading: isLoadingPermanentStates } = useStateDropdown(permanentCountryId);

    // Use fetched states if country is selected, otherwise fall back to empty array
    const availableContactStates: IStateDropdown[] = contactCountryId ? (Array.isArray(contactStates) ? contactStates : []) : [];
    const availablePermanentStates: IStateDropdown[] = permanentCountryId ? (Array.isArray(permanentStates) ? permanentStates : []) : [];

    // Copy communication address to permanent address when checkbox is checked
    const prevSameAsAddress = useRef(sameAsCommunicationAddress);
    const prevContactValues = useRef({
        contactAddress,
        contactArea,
        contactCity,
        contactState,
        contactPincode,
        contactCountry
    });

    useEffect(() => {
        if (sameAsCommunicationAddress && prevSameAsAddress.current !== sameAsCommunicationAddress) {
            setValue('permanentAddress', contactAddress || '');
            setValue('permanentArea', contactArea || '');
            setValue('permanentCity', contactCity || '');
            setValue('permanentState', contactState || '');
            setValue('permanentPincode', contactPincode || '');
            setValue('permanentCountry', contactCountry || '');
        }
        prevSameAsAddress.current = sameAsCommunicationAddress;
    }, [sameAsCommunicationAddress, contactAddress, contactArea, contactCity, contactState, contactPincode, contactCountry, setValue]);

    useEffect(() => {
        if (sameAsCommunicationAddress) {
            const currentContactValues = {
                contactAddress,
                contactArea,
                contactCity,
                contactState,
                contactPincode,
                contactCountry
            };
            const hasChanged = Object.keys(currentContactValues).some(
                (key) =>
                    currentContactValues[key as keyof typeof currentContactValues] !==
                    prevContactValues.current[key as keyof typeof prevContactValues.current]
            );
            if (hasChanged) {
                setValue('permanentAddress', contactAddress || '');
                setValue('permanentArea', contactArea || '');
                setValue('permanentCity', contactCity || '');
                setValue('permanentState', contactState || '');
                setValue('permanentPincode', contactPincode || '');
                setValue('permanentCountry', contactCountry || '');
                prevContactValues.current = currentContactValues;
            }
        }
    }, [sameAsCommunicationAddress, contactAddress, contactArea, contactCity, contactState, contactPincode, contactCountry, setValue]);

    // Get employee ID from employeeDetails to use as dependency - memoize to prevent unnecessary re-renders
    const employeeIdFromDetails = useMemo(() => {
        return employeeDetails?.data?.hrmE_Id || null;
    }, [employeeDetails?.data?.hrmE_Id]);

    // DEBUG: Watch form values for dropdown fields
    const designationValue = useWatch({ control, name: 'designation' });
    const typeOfEmploymentValue = useWatch({ control, name: 'typeOfEmployment' });
    const employeeGroupValue = useWatch({ control, name: 'employeeGroup' });
    const schoolValue = useWatch({ control, name: 'school' });
    const gradeValue = useWatch({ control, name: 'grade' });

    useEffect(() => {
        if (designationValue && designationDropdown.length > 0) {
            const matchingDesignation = designationDropdown.find(
                (dg: IDesignationDropdown) => dg.key?.toString().trim() === designationValue?.toString().trim()
            );
            console.log('🔍 [DEBUG] Designation Value Watcher:', {
                formValue: designationValue,
                formValueType: typeof designationValue,
                dropdownLength: designationDropdown.length,
                matchingDesignation: matchingDesignation
                    ? {
                          key: matchingDesignation.key,
                          value: matchingDesignation.value
                      }
                    : null,
                firstFewKeys: designationDropdown.slice(0, 3).map((dg) => dg.key?.toString().trim())
            });
        }
    }, [designationValue, designationDropdown]);

    // Initialize Tab 1 (Employee Information) when employee details are loaded
    useEffect(() => {
        const currentEmployeeDetails = _employeeDetailsRef.current;
        if (
            employeeIdFromDetails &&
            currentEmployeeDetails?.data &&
            !_hasInitializedTab1.current &&
            _lastEmployeeId.current !== employeeIdFromDetails
        ) {
            _lastEmployeeId.current = employeeIdFromDetails;

            try {
                const tab1Data = mapApiResponseToTab1Fields(currentEmployeeDetails);

                // DEBUG: Log API response and mapped data
                console.log('🔍 [DEBUG] Tab 1 Data Loading:', {
                    employeeId: employeeIdFromDetails,
                    apiData: {
                        hrmdeS_Id: currentEmployeeDetails?.data?.hrmdeS_Id,
                        hrmeT_Id: currentEmployeeDetails?.data?.hrmeT_Id,
                        hrmgT_Id: currentEmployeeDetails?.data?.hrmgT_Id,
                        hrmD_Id: currentEmployeeDetails?.data?.hrmD_Id,
                        hrmG_Id: currentEmployeeDetails?.data?.hrmG_Id
                    },
                    mappedData: {
                        designation: tab1Data.designation,
                        typeOfEmployment: tab1Data.typeOfEmployment,
                        employeeGroup: tab1Data.employeeGroup,
                        school: tab1Data.school,
                        grade: tab1Data.grade
                    },
                    dropdownsLoaded: {
                        designations: designationDropdown?.length || 0,
                        employeeTypes: employeeTypeDropdown?.length || 0,
                        groupTypes: groupTypeDropdown?.length || 0,
                        institutions: institutionDropdown?.length || 0,
                        grades: gradeDropdown?.length || 0
                    }
                });

                // Set Tab 1 fields using setValue to avoid resetting the entire form
                Object.entries(tab1Data).forEach(([key, value]) => {
                    setValue(key as keyof FormFields, value as any, {
                        shouldValidate: false,
                        shouldDirty: false
                    });
                });

                // DEBUG: Log after setting values
                console.log('🔍 [DEBUG] After setValue - Form values:', {
                    designation: tab1Data.designation,
                    typeOfEmployment: tab1Data.typeOfEmployment,
                    employeeGroup: tab1Data.employeeGroup,
                    school: tab1Data.school,
                    grade: tab1Data.grade
                });

                // Set saved employee ID
                setSavedEmployeeId(employeeIdFromDetails);

                // Mark Tab 1 as initialized
                _hasInitializedTab1.current = true;
                setIsFormInitialized(true);
            } catch (error) {
                console.error('Error loading Tab 1 data:', error);
                toast.error('Failed to load employee information');
            }
        } else if (!employeeIdFromDetails && !isLoadingEmployee && !_hasInitializedTab1.current) {
            // If no employee ID and not loading, mark as initialized to show empty form
            _hasInitializedTab1.current = true;
            setIsFormInitialized(true);
        }
    }, [
        employeeIdFromDetails,
        setValue,
        setSavedEmployeeId,
        isLoadingEmployee,
        designationDropdown,
        employeeTypeDropdown,
        groupTypeDropdown,
        institutionDropdown,
        gradeDropdown
    ]);

    // Load Tab 2 (Address) data when user navigates to Tab 2
    useEffect(() => {
        if (currentStep === 2 && !_hasInitializedTab2.current && _employeeDetailsRef.current?.data) {
            try {
                const tab2Data = mapApiResponseToTab2Fields(_employeeDetailsRef.current);

                // Check if permanent address is same as contact address
                const isSameAddress =
                    tab2Data.contactAddress === tab2Data.permanentAddress &&
                    tab2Data.contactArea === tab2Data.permanentArea &&
                    tab2Data.contactCity === tab2Data.permanentCity &&
                    tab2Data.contactState === tab2Data.permanentState &&
                    tab2Data.contactCountry === tab2Data.permanentCountry &&
                    tab2Data.contactPincode === tab2Data.permanentPincode;

                if (isSameAddress) {
                    tab2Data.sameAsCommunicationAddress = true;
                }

                // Set Tab 2 fields
                Object.entries(tab2Data).forEach(([key, value]) => {
                    setValue(key as keyof FormFields, value as any, {
                        shouldValidate: false,
                        shouldDirty: false
                    });
                });

                _hasInitializedTab2.current = true;
            } catch (error) {
                console.error('Error loading Tab 2 data:', error);
            }
        }
    }, [currentStep, setValue]);

    // Load Tab 6 (Medical) data when user navigates to Tab 6
    useEffect(() => {
        if (currentStep === 6 && !_hasInitializedTab6.current && _employeeDetailsRef.current?.data) {
            try {
                const tab6Data = mapApiResponseToTab6Fields(_employeeDetailsRef.current);

                // Set Tab 6 fields
                Object.entries(tab6Data).forEach(([key, value]) => {
                    setValue(key as keyof FormFields, value as any, {
                        shouldValidate: false,
                        shouldDirty: false
                    });
                });

                _hasInitializedTab6.current = true;
            } catch (error) {
                console.error('Error loading Tab 6 data:', error);
            }
        }
    }, [currentStep, setValue]);

    // Load Tab 7 (Other Details) data when user navigates to Tab 7
    useEffect(() => {
        if (currentStep === 7 && !_hasInitializedTab7.current && _employeeDetailsRef.current?.data) {
            try {
                const tab7Data = mapApiResponseToTab7Fields(_employeeDetailsRef.current);

                // Set Tab 7 fields
                Object.entries(tab7Data).forEach(([key, value]) => {
                    setValue(key as keyof FormFields, value as any, {
                        shouldValidate: false,
                        shouldDirty: false
                    });
                });

                _hasInitializedTab7.current = true;
            } catch (error) {
                console.error('Error loading Tab 7 data:', error);
            }
        }
    }, [currentStep, setValue]);

    // Auto-calculate retirement date from DOB
    useEffect(() => {
        if (dateOfBirth) {
            try {
                const dob = new Date(dateOfBirth);
                if (!Number.isNaN(dob.getTime())) {
                    const retirementDate = new Date(dob);
                    retirementDate.setFullYear(retirementDate.getFullYear() + 60);
                    const formattedDate = format(retirementDate, 'yyyy-MM-dd');
                    setValue('dateOfRetirement', formattedDate, {
                        shouldValidate: false,
                        shouldDirty: false
                    });
                }
            } catch (_error) {
                // Invalid date, ignore
            }
        }
    }, [dateOfBirth, setValue]);

    // Memoize bank options specifically to prevent Select recreation
    const memoizedBankOptions = useMemo(() => {
        if (!options?.banks) return [];
        return (options.banks || [])
            .filter((b: IBankDropdown) => {
                return b.key != null && b.key !== undefined && b.key !== 0;
            })
            .map((b: IBankDropdown) => {
                const key = b.key?.toString().trim();
                if (!key || key === '') return null;
                return {
                    id: key,
                    name: b.value || String(b.key),
                    value: key
                };
            })
            .filter(Boolean);
    }, [options?.banks]);

    // Watch documentList for file handling
    const watchDocuments = watch('documentList');
    // Watch for OtherDetailsTab conditional fields
    const stopPension = useWatch({ control, name: 'stopPension' });
    const employeeLeft = useWatch({ control, name: 'employeeLeft' });

    // Helper function to calculate years and months between two dates
    const calculateYearsAndMonths = (startDate: string | Date, endDate: string | Date) => {
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
            return { years: 0, months: 0 };
        }
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        if (end.getDate() < start.getDate()) {
            months--;
            if (months < 0) {
                years--;
                months += 12;
            }
        }
        return { years: Math.max(0, years), months: Math.max(0, months) };
    };

    // Field arrays
    const {
        fields: mobileFields,
        append: appendMobile,
        remove: removeMobile
    } = useFieldArray({
        control,
        name: 'mobileDetails'
    });

    const {
        fields: emailFields,
        append: appendEmail,
        remove: removeEmail
    } = useFieldArray({
        control,
        name: 'emailDetails'
    });

    const {
        fields: bankFields,
        append: appendBank,
        remove: removeBank
    } = useFieldArray({
        control,
        name: 'bankDetails'
    });

    const {
        fields: qualificationFields,
        append: appendQualification,
        remove: removeQualification
    } = useFieldArray({
        control,
        name: 'qualificationDetails'
    });

    const {
        fields: experienceFields,
        append: appendExperience,
        remove: removeExperience
    } = useFieldArray({
        control,
        name: 'experienceDetails'
    });

    const {
        fields: documentFields,
        append: appendDocument,
        remove: removeDocument
    } = useFieldArray({
        control,
        name: 'documentList'
    });

    // Load Tab 3 (Qualification) data when user navigates to Tab 3
    useEffect(() => {
        if (currentStep === 3 && !_hasInitializedTab3.current && _employeeDetailsRef.current?.data) {
            try {
                const tab3Data = mapApiResponseToTab3Fields(_employeeDetailsRef.current);

                // Use replace to update qualificationDetails array
                if (tab3Data.qualificationDetails && Array.isArray(tab3Data.qualificationDetails)) {
                    // Clear existing qualifications first (remove from end to avoid index issues)
                    const currentLength = qualificationFields.length;
                    for (let i = currentLength - 1; i >= 0; i--) {
                        removeQualification(i);
                    }

                    // Add qualifications from API
                    console.log('🔍 [DEBUG] Loading Qualifications from API:', tab3Data.qualificationDetails);
                    // Track original IDs for deletion detection
                    _originalQualificationIds.current = tab3Data.qualificationDetails
                        .map((qual: any) => qual.hrmeQ_Id || qual.HRMEQ_Id || 0)
                        .filter((id: number) => id > 0);
                    console.log('🔍 [DEBUG] Original Qualification IDs:', _originalQualificationIds.current);

                    tab3Data.qualificationDetails.forEach((qual: any, index: number) => {
                        console.log(`🔍 [DEBUG] Qualification #${index + 1} - ID:`, qual.hrmeQ_Id || qual.HRMEQ_Id, 'Full object:', qual);
                        appendQualification(qual);
                    });
                }

                _hasInitializedTab3.current = true;
            } catch (error) {
                console.error('Error loading Tab 3 data:', error);
            }
        }
    }, [currentStep, appendQualification, removeQualification, qualificationFields.length]);

    // Load Tab 4 (Experience) data when user navigates to Tab 4
    useEffect(() => {
        if (currentStep === 4 && !_hasInitializedTab4.current && _employeeDetailsRef.current?.data) {
            try {
                const tab4Data = mapApiResponseToTab4Fields(_employeeDetailsRef.current);

                // Use replace to update experienceDetails array
                if (tab4Data.experienceDetails && Array.isArray(tab4Data.experienceDetails)) {
                    // Clear existing experiences first (remove from end to avoid index issues)
                    const currentLength = experienceFields.length;
                    for (let i = currentLength - 1; i >= 0; i--) {
                        removeExperience(i);
                    }

                    // Add experiences from API
                    console.log('🔍 [DEBUG] Loading Experiences from API:', tab4Data.experienceDetails);
                    // Track original IDs for deletion detection
                    _originalExperienceIds.current = tab4Data.experienceDetails
                        .map((exp: any) => exp.hrmeE_Id || exp.HRMEE_Id || 0)
                        .filter((id: number) => id > 0);
                    console.log('🔍 [DEBUG] Original Experience IDs:', _originalExperienceIds.current);

                    tab4Data.experienceDetails.forEach((exp: any, index: number) => {
                        console.log(`🔍 [DEBUG] Experience #${index + 1} - ID:`, exp.hrmeE_Id, 'Full object:', exp);
                        appendExperience(exp);
                    });
                }

                _hasInitializedTab4.current = true;
            } catch (error) {
                console.error('Error loading Tab 4 data:', error);
            }
        }
    }, [currentStep, appendExperience, removeExperience, experienceFields.length]);

    // Load Tab 5 (Documents) data when user navigates to Tab 5
    useEffect(() => {
        if (currentStep === 5 && !_hasInitializedTab5.current && _employeeDetailsRef.current?.data) {
            try {
                const tab5Data = mapApiResponseToTab5Fields(_employeeDetailsRef.current);

                // Use replace to update documentList array
                if (tab5Data.documentList && Array.isArray(tab5Data.documentList)) {
                    // Clear existing documents first (remove from end to avoid index issues)
                    const currentLength = documentFields.length;
                    for (let i = currentLength - 1; i >= 0; i--) {
                        removeDocument(i);
                    }

                    // Add documents from API
                    tab5Data.documentList.forEach((doc: any) => {
                        appendDocument(doc);
                    });
                }

                _hasInitializedTab5.current = true;
            } catch (error) {
                console.error('Error loading Tab 5 data:', error);
            }
        }
    }, [currentStep, appendDocument, removeDocument, documentFields.length]);

    // Load Tab 8 (Bank Details) data when user navigates to Tab 8
    useEffect(() => {
        if (currentStep === 8 && !_hasInitializedTab8.current && _employeeDetailsRef.current?.data) {
            try {
                const tab8Data = mapApiResponseToTab8Fields(_employeeDetailsRef.current);

                // Use replace to update bankDetails array
                if (tab8Data.bankDetails && Array.isArray(tab8Data.bankDetails)) {
                    // Clear existing bank details first (remove from end to avoid index issues)
                    const currentLength = bankFields.length;
                    for (let i = currentLength - 1; i >= 0; i--) {
                        removeBank(i);
                    }

                    // Add bank details from API
                    tab8Data.bankDetails.forEach((bank: any) => {
                        appendBank(bank);
                    });
                }

                _hasInitializedTab8.current = true;
            } catch (error) {
                console.error('Error loading Tab 8 data:', error);
            }
        }
    }, [currentStep, appendBank, removeBank, bankFields.length]);

    // Map form data to API format - use helper functions
    const mapFormDataToApiFormatLocal = (data: FormFields): SavePersonalDetailsApiRequest => {
        return mapFormDataToApiFormat(data, savedEmployeeId || 0, selectedPhoto);
    };

    const mapFormDataToApiFormatWithoutAddressLocal = (data: FormFields): SavePersonalDetailsApiRequest => {
        return mapFormDataToApiFormatWithoutAddress(data, savedEmployeeId || 0, selectedPhoto);
    };

    // Custom submit handler - same as add-form
    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Prevent duplicate submissions
        if (isSavingQualification || isSavingExperience || isSubmittingAny) {
            console.warn('⚠️ [DEBUG] onFormSubmit - Already saving, ignoring duplicate call');
            return;
        }

        const currentTabKey = getCurrentTabKey();
        const currentTabFields = tabFieldMap[currentTabKey] || [];

        if (currentTabFields.length > 0) {
            const isValid = await trigger(currentTabFields as any);
            if (!isValid) {
                const formErrors = formState.errors;
                const errorMessages: string[] = [];
                currentTabFields.forEach((field) => {
                    const fieldError = formErrors[field as keyof typeof formErrors];
                    if (fieldError) {
                        const errorMsg = typeof fieldError === 'string' ? fieldError : fieldError?.message;
                        if (errorMsg) {
                            errorMessages.push(errorMsg);
                        }
                    }
                });
                if (errorMessages.length > 0) {
                    toast.error(errorMessages[0]);
                }
                return;
            }
        }

        const data = getValues();
        const currentStepId = currentStep;

        try {
            if (currentStepId === 1) {
                // Employee tab - save without address
                const payload = mapFormDataToApiFormatWithoutAddressLocal(data);
                savePersonalDetails(payload, {
                    onSuccess: (response: any) => {
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        const employeeId = response?.data?.HRME_Id || response?.HRME_Id || savedEmployeeId || 0;
                        if (employeeId) {
                            setSavedEmployeeId(employeeId);
                            setCurrentStep(2);
                        } else {
                            toast.error('Failed to get employee ID from response');
                        }
                    },
                    onError: (error: any) => {
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save employee details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 2) {
                // Address tab
                if (!savedEmployeeId) {
                    toast.error('Please save Employee details first');
                    setCurrentStep(1);
                    return;
                }
                const payload = mapFormDataToApiFormatLocal(data);
                payload.hrmE_Id = savedEmployeeId;
                savePersonalDetails(payload, {
                    onSuccess: (response: any) => {
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        setCurrentStep(3);
                    },
                    onError: (error: any) => {
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save address details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 3) {
                // Qualification tab
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setCurrentStep(1);
                    return;
                }
                const qualificationList = data.qualificationDetails || [];
                if (qualificationList.length === 0) {
                    setError('qualificationDetails', {
                        type: 'required',
                        message: 'Please add at least one qualification'
                    });
                    return;
                }

                console.log('🔍 [DEBUG] Qualification List Count:', qualificationList.length);
                console.log('🔍 [DEBUG] Qualification List:', qualificationList);
                console.log(
                    '🔍 [DEBUG] Qualification IDs Check:',
                    qualificationList.map((q: any, i: number) => ({
                        index: i,
                        hrmeQ_Id: q.hrmeQ_Id,
                        HRMEQ_Id: q.HRMEQ_Id,
                        hasId: !!(q.hrmeQ_Id || q.HRMEQ_Id)
                    }))
                );

                // Map qualification data to new API format
                const qualificationsPayload = qualificationList.map((qual: any, index: number) => {
                    const id = qual.hrmeQ_Id || qual.HRMEQ_Id || 0; // Check both cases
                    console.log(`🔍 [DEBUG] Qualification #${index + 1} - ID from form:`, id, 'Full qual:', qual);
                    return {
                        hrmeQ_Id: id, // Use existing ID if updating, 0 for new
                        hrmC_Id: Number(qual.course) || 0,
                        hrmE_Id: savedEmployeeId,
                        hrmE_QualificationName: qual.qualification || '',
                        hrmeQ_CollegeName: qual.college || '',
                        hrmeQ_UniversityName: qual.university || '',
                        hrmeQ_YearOfPassing: Number(qual.yearOfPassing) || 0,
                        hrmeQ_RegistrationNo: qual.registrationNo || '',
                        hrmeQ_Result: qual.result || '',
                        hrmeQ_CGPAOrPerFlag: qual.cgpaOrPercentage || 'CGPA',
                        hrmeQ_CGPA: qual.cgpaOrPercentage === 'CGPA' ? qual.cgpa || '' : '',
                        hrmeQ_Percentage: qual.cgpaOrPercentage === 'Percentage' ? qual.cgpa || '' : '',
                        hrmeQ_AreaOfSpecialisation: qual.areaOfSpecialisation || qual.specialisation || '',
                        hrmeQ_PHDFlg: qual.phdFlag || false,
                        hrmeQ_StateId: Number(qual.qualificationState) || 0,
                        hrmeQ_CountryId: Number(qual.qualificationCountry) || 0,
                        hrmeQ_ThesisTitle: qual.thesisTitle || '',
                        hrmeQ_RegistrationYear: Number(qual.registrationYear) || 0,
                        hrmeQ_GuideName: qual.guideName || '',
                        hrmeQ_Date: qual.qualifiedDate ? new Date(qual.qualifiedDate).toISOString() : null,
                        hrmeQ_MedicalCouncil: qual.medicalCouncil || '',
                        hrmeQ_Hardcopy: qual.hardcopy || '',
                        retrunMsg: ''
                    };
                });

                console.log('🔍 [DEBUG] Qualification Payload Count:', qualificationsPayload.length);
                console.log('🔍 [DEBUG] Qualification Payload:', qualificationsPayload);
                console.log('🔍 [DEBUG] Employee ID:', savedEmployeeId);
                console.log('🔍 [DEBUG] Calling saveQualificationDetails ONCE with array of', qualificationsPayload.length, 'items');
                console.log('🔍 [DEBUG] isSavingQualification:', isSavingQualification);

                if (isSavingQualification) {
                    console.warn('⚠️ [DEBUG] Already saving qualification, ignoring duplicate call');
                    return;
                }

                // Ensure we only call the API once with the entire array
                saveQualificationDetails(qualificationsPayload, {
                    onSuccess: (response: any) => {
                        console.log('✅ [DEBUG] Qualification Save Success:', response);
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        setCurrentStep(4);
                    },
                    onError: (error: any) => {
                        console.error('❌ [DEBUG] Qualification Save Error:', error);
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save qualification details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 4) {
                // Experience tab - save experience details
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Condition check: currentStepId === 4', currentStepId === 4);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Starting save process');
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Employee ID:', savedEmployeeId);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Current Step ID:', currentStepId);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Type of currentStepId:', typeof currentStepId);

                if (!savedEmployeeId) {
                    console.error('❌ [DEBUG] Tab 4 - No employee ID found');
                    toast.error('Please save Employee and Address details first');
                    setCurrentStep(1);
                    return;
                }

                const experienceList = data.experienceDetails || [];
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Form Data:', data);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Experience List (Raw):', experienceList);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Experience Count:', experienceList.length);

                if (experienceList.length === 0) {
                    console.error('❌ [DEBUG] Tab 4 - No experiences found');
                    setError('experienceDetails', {
                        type: 'required',
                        message: 'Please add at least one experience'
                    });
                    return;
                }

                // Map experience data to API format (matching API request body format)
                console.log(
                    '🔍 [DEBUG] Experience IDs Check:',
                    experienceList.map((e: any, i: number) => ({
                        index: i,
                        hrmeE_Id: e.hrmeE_Id,
                        HRMEE_Id: e.HRMEE_Id,
                        hasId: !!(e.hrmeE_Id || e.HRMEE_Id)
                    }))
                );
                const experiencesPayload = experienceList.map((exp: any, index: number) => {
                    const id = exp.hrmeE_Id || exp.HRMEE_Id || 0; // Check both cases
                    console.log(`🔍 [DEBUG] Experience #${index + 1} - ID from form:`, id, 'Full exp:', exp);
                    const mapped = {
                        hrmeE_Id: id, // Use existing ID if updating, 0 for new
                        hrmE_Id: savedEmployeeId,
                        hrmeE_OrganisationName: exp.organisationName || '',
                        hrmeE_OrganisationAddress: exp.organisationAddress || '',
                        hrmeE_Department: exp.department || '',
                        hrmeE_Designation: exp.designation || '',
                        hrmeE_JoinDate: exp.joinDate ? new Date(exp.joinDate).toISOString() : '',
                        hrmeE_ExitDate: exp.exitDate ? new Date(exp.exitDate).toISOString() : '',
                        hrmeE_NoOfYears: Number(exp.noOfYears) || 0,
                        hrmeE_NoOfMonths: Number(exp.noOfMonths) || 0,
                        hrmeE_AnnualSalary: Number(exp.annualSalary) || 0,
                        hrmeE_ReasonForLeaving: exp.reasonForLeaving || ''
                    };
                    console.log(`🔍 [DEBUG] Tab 4 - Experience #${index + 1} Mapping:`, {
                        raw: exp,
                        mapped: mapped
                    });
                    return mapped;
                });

                console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload Count:', experiencesPayload.length);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload:', experiencesPayload);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - Payload (JSON):', JSON.stringify(experiencesPayload, null, 2));
                console.log(
                    '🔍 [DEBUG] Tab 4 (Experience) - Calling saveExperienceDetails ONCE with array of',
                    experiencesPayload.length,
                    'items'
                );
                console.log('🔍 [DEBUG] Tab 4 (Experience) - saveExperienceDetails function type:', typeof saveExperienceDetails);
                console.log('🔍 [DEBUG] Tab 4 (Experience) - isSavingExperience:', isSavingExperience);

                if (!saveExperienceDetails) {
                    console.error('❌ [DEBUG] Tab 4 - saveExperienceDetails is not defined!');
                    toast.error('Experience save function is not available. Please refresh the page.');
                    return;
                }

                if (isSavingExperience) {
                    console.warn('⚠️ [DEBUG] Tab 4 - Already saving experience, ignoring duplicate call');
                    return;
                }

                // Ensure we only call the API once with the entire array
                saveExperienceDetails(experiencesPayload, {
                    onSuccess: (response: any) => {
                        console.log('✅ [DEBUG] Tab 4 (Experience) - Save Success:', response);
                        console.log('🔍 [DEBUG] Tab 4 - Full API Response:', JSON.stringify(response, null, 2));
                        console.log('🔍 [DEBUG] Tab 4 - Response Success:', response?.success);
                        console.log('🔍 [DEBUG] Tab 4 - Response Message:', response?.message);
                        console.log('🔍 [DEBUG] Tab 4 - Response Data:', response?.data);

                        // Verify experience data was saved
                        if (response?.data && Array.isArray(response.data)) {
                            console.log('🔍 [DEBUG] Tab 4 - Response contains experience array, length:', response.data.length);
                            console.log('🔍 [DEBUG] Tab 4 - Response Experiences:', response.data);
                        }

                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        } else if (response?.success === false) {
                            console.warn('⚠️ [DEBUG] Tab 4 - API returned success: false');
                            toast.warning('Experience saved but API returned success: false. Please verify the data was saved.');
                        }

                        setCurrentStep(5);
                    },
                    onError: (error: any) => {
                        console.error('❌ [DEBUG] Tab 4 (Experience) - Save Error:', error);
                        console.error('❌ [DEBUG] Tab 4 - Error Details:', JSON.stringify(error, null, 2));
                        console.error('❌ [DEBUG] Tab 4 - Error Response:', error?.response);
                        console.error('❌ [DEBUG] Tab 4 - Error Message:', error?.message);
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save experience details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 5) {
                // Document tab
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setCurrentStep(1);
                    return;
                }
                const documentList = data.documentList || [];
                if (documentList.length === 0) {
                    setError('documentList', {
                        type: 'required',
                        message: 'Please add at least one document'
                    });
                    return;
                }
                const documentsPayload = documentList.map((doc: any) => {
                    const documentName = doc.documentName || doc.name || '';
                    const documentImageName = doc.document?.[0]?.name || doc.imageName || '';
                    const documentDescription = doc.description || doc.documentDescription || '';
                    return {
                        CreatedDate: new Date().toISOString(),
                        UpdatedDate: new Date().toISOString(),
                        HRME_Id: savedEmployeeId,
                        HRMEDS_DocumentName: documentName,
                        HRMEDS_DucumentDescription: documentDescription,
                        HRMEDS_DocumentImageName: documentImageName
                    };
                });
                saveDocumentDetails(documentsPayload, {
                    onSuccess: (response: any) => {
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        setCurrentStep(6);
                    },
                    onError: (error: any) => {
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save document details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 6) {
                // Medical tab
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setCurrentStep(1);
                    return;
                }
                const payload = mapFormDataToApiFormatLocal(data);
                payload.hrmE_Id = savedEmployeeId;
                saveMedicalDetails(payload, {
                    onSuccess: (response: any) => {
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        setCurrentStep(7);
                    },
                    onError: (error: any) => {
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save medical details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 7) {
                // Other details tab
                if (!savedEmployeeId) {
                    toast.error('Please save Employee and Address details first');
                    setCurrentStep(1);
                    return;
                }
                const payload = mapFormDataToApiFormatLocal(data);
                payload.hrmE_Id = savedEmployeeId;
                savePersonalDetails(payload, {
                    onSuccess: (response: any) => {
                        // Show API response message
                        if (response?.success && response?.message) {
                            toast.success(response.message);
                        } else if (response?.message) {
                            toast.info(response.message);
                        }
                        setCurrentStep(8);
                    },
                    onError: (error: any) => {
                        // Show API error message
                        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save other details';
                        toast.error(errorMessage);
                    }
                });
            } else if (currentStepId === 8) {
                // Payroll tab - handled by PayrollTab component
                toast.success('Employee update completed!');
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isSubmittingAny =
        isSubmitting || isSavingQualification || isSavingExperience || isSavingDocument || isSavingMedical || isSavingBank;

    // Show loading for dropdowns or employee details
    if (
        isLoadingGrades ||
        isLoadingGroupTypes ||
        isLoadingEmployeeTypes ||
        isLoadingInstitutions ||
        isLoadingDesignations ||
        isLoadingGenders ||
        isLoadingMaritalStatuses ||
        isLoadingReligions ||
        isLoadingCasteCategories ||
        isLoadingCastes ||
        isLoadingPaymentModes ||
        isLoadingBanks ||
        isLoadingCountries ||
        isLoadingSpecializations ||
        isLoadingLeaveReasons ||
        isLoadingBloodGroups ||
        isLoadingSalaryTypes ||
        isLoadingTeachingTypes ||
        isLoadingScoreTypes ||
        isLoadingContactTypes ||
        isLoadingEmployee
    ) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='text-muted-foreground'>Loading form data...</div>
            </div>
        );
    }

    // Form UI - standalone update form (old API mapping removed, using empty defaults until endpoints are provided)
    return (
        <div className={cn('mx-auto w-full max-w-7xl px-4 py-2', className)}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    // Only handle form submit for the last step, otherwise let nextStep handle it
                    if (currentStep === steps.length) {
                        onFormSubmit(e);
                    }
                }}
                className='space-y-6'>
                {/* Main Layout: Vertical Stepper + Form */}
                <div className='flex flex-col gap-6 lg:flex-row'>
                    {/* Stepper - Vertical on desktop, horizontal on mobile */}
                    <div className='lg:w-50 lg:flex-shrink-0'>
                        {/* Mobile: Horizontal Stepper */}
                        <div className='block overflow-x-auto lg:hidden'>
                            <div className='flex min-w-max items-center justify-between px-4'>
                                {steps.map((step, index) => {
                                    const IconComponent = getIconByName(step.icon);
                                    const isDisabled = step.tabKey === 'payroll' && !savedEmployeeId;
                                    return (
                                        <div key={step.id} className='flex flex-1 items-center'>
                                            <div className='flex flex-col items-center'>
                                                <Button
                                                    type='button'
                                                    disabled={isSubmittingAny || isDisabled}
                                                    className={cn(
                                                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                                                        currentStep === step.id
                                                            ? 'border-blue-600 bg-blue-600 text-white shadow-blue-200 shadow-lg'
                                                            : currentStep > step.id
                                                              ? 'border-green-500 bg-green-500 text-white'
                                                              : 'border-gray-300 bg-white text-gray-400'
                                                    )}>
                                                    {currentStep > step.id ? (
                                                        <Check className='h-5 w-5' />
                                                    ) : (
                                                        <span className='text-lg'>
                                                            {IconComponent && <IconComponent className='h-5 w-5' />}
                                                        </span>
                                                    )}
                                                </Button>
                                                <p
                                                    className={cn(
                                                        'mt-1 text-nowrap text-center font-medium text-xs transition-colors',
                                                        currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                                                    )}>
                                                    {step.name}
                                                </p>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={cn(
                                                        'mx-2 h-0.5 flex-1 transition-all duration-300',
                                                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                                                    )}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop: Vertical Stepper */}
                        <div className='hidden lg:block'>
                            <div className='sticky top-4 space-y-2'>
                                {steps.map((step, index) => {
                                    const IconComponent = getIconByName(step.icon);
                                    const isDisabled = step.tabKey === 'payroll' && !savedEmployeeId;
                                    return (
                                        <div key={step.id} className='flex items-start'>
                                            <div className='flex flex-col items-center'>
                                                <button
                                                    type='button'
                                                    disabled={isSubmittingAny || isDisabled}
                                                    className={cn(
                                                        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
                                                        currentStep === step.id
                                                            ? 'border-secondary bg-secondary text-white shadow-blue-200 shadow-lg'
                                                            : currentStep > step.id
                                                              ? 'border-green-500 bg-green-500 text-white'
                                                              : 'border-gray-300 bg-white text-gray-500'
                                                    )}>
                                                    {currentStep > step.id ? (
                                                        <Check className='h-6 w-6' />
                                                    ) : (
                                                        <span className='text-lg'>
                                                            {IconComponent && <IconComponent className='h-5 w-5' />}
                                                        </span>
                                                    )}
                                                </button>
                                                {index < steps.length - 1 && (
                                                    <div
                                                        className={cn(
                                                            'my-2 h-16 w-0.5 transition-all duration-300',
                                                            currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <div className='ml-4 flex-1'>
                                                <p
                                                    className={cn(
                                                        'font-medium text-sm transition-colors',
                                                        currentStep === step.id ? 'text-primary' : 'text-gray-500'
                                                    )}>
                                                    {step.name}
                                                </p>
                                                <p className='text-gray-400 text-xs'>{step.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className='min-w-0 flex-1 space-y-6'>
                        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                            <div className='max-h-[calc(100vh-2rem)] overflow-y-auto p-6 md:p-8'>
                                {/* Step 1: Employee Information */}
                                {currentStep === 1 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Employee Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please provide the employee&apos;s basic information
                                            </p>
                                        </div>
                                        <div className='space-y-6'>
                                            {/* Main Form Fields in Two Columns */}
                                            <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6'>
                                                {/* Left Column */}
                                                <div className='space-y-4'>
                                                    <InputText
                                                        label='First Name'
                                                        required
                                                        id='firstName'
                                                        maxLength={50}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!allowedKeys.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('firstName', {
                                                            required: 'First Name is required'
                                                        })}
                                                        error={errors.firstName?.message}
                                                    />
                                                    <InputText
                                                        label='Middle Name'
                                                        id='middleName'
                                                        maxLength={50}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!allowedKeys.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('middleName')}
                                                        error={errors.middleName?.message}
                                                    />
                                                    <InputText
                                                        label='Last Name'
                                                        id='lastName'
                                                        maxLength={50}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!allowedKeys.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('lastName')}
                                                        error={errors.lastName?.message}
                                                    />
                                                    <InputText
                                                        label='Employee Code'
                                                        required
                                                        id='employeeCode'
                                                        maxLength={20}
                                                        {...register('employeeCode', {
                                                            required: 'Employee code is required'
                                                        })}
                                                        error={errors.employeeCode?.message}
                                                    />
                                                    <InputText
                                                        label="Father's Name *"
                                                        id='fatherName'
                                                        maxLength={50}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!allowedKeys.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('fatherName')}
                                                        error={errors.fatherName?.message}
                                                    />
                                                    <InputText
                                                        label="Mother's Name *"
                                                        id='motherName'
                                                        maxLength={50}
                                                        onKeyDown={(e) => {
                                                            const allowedKeys = /^[a-zA-Z\s\-']$/;
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).value.endsWith(' ')) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === ' ' && (e.target as HTMLInputElement).selectionStart === 0) {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!allowedKeys.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('motherName')}
                                                        error={errors.motherName?.message}
                                                    />
                                                    <Controller
                                                        name='typeOfEmployment'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.empTypes || []).filter(
                                                                (it: IEmployeeTypeDropdown) =>
                                                                    it.key != null && it.key !== undefined && it.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Type of Employment <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`typeOfEmployment-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(options?.empTypes || [])
                                                                                .filter((it: IEmployeeTypeDropdown) => {
                                                                                    return (
                                                                                        it.key != null &&
                                                                                        it.key !== undefined &&
                                                                                        it.key !== 0
                                                                                    );
                                                                                })
                                                                                .map((it: IEmployeeTypeDropdown) => {
                                                                                    const val = it.key?.toString().trim();
                                                                                    if (!val || val === '') return null;
                                                                                    return (
                                                                                        <SafeSelectItem key={it.key} value={val}>
                                                                                            {it.value || String(it.key)}
                                                                                        </SafeSelectItem>
                                                                                    );
                                                                                })
                                                                                .filter(Boolean)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='employeeGroup'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.groupTypes || []).filter(
                                                                (gt: IGroupTypeDropdown) =>
                                                                    gt.key != null && gt.key !== undefined && gt.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Employee Group <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`employeeGroup-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(options?.groupTypes || [])
                                                                                .filter((gt: IGroupTypeDropdown) => {
                                                                                    return (
                                                                                        gt.key != null &&
                                                                                        gt.key !== undefined &&
                                                                                        gt.key !== 0
                                                                                    );
                                                                                })
                                                                                .map((gt: IGroupTypeDropdown) => {
                                                                                    const val = gt.key?.toString().trim();
                                                                                    if (!val || val === '') return null;
                                                                                    return (
                                                                                        <SafeSelectItem key={gt.key} value={val}>
                                                                                            {gt.value || String(gt.key)}
                                                                                        </SafeSelectItem>
                                                                                    );
                                                                                })
                                                                                .filter(Boolean)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='school'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.institutions || []).filter(
                                                                (inst: IInstitutionDropdown) => {
                                                                    return inst.key != null && inst.key !== undefined && inst.key !== 0;
                                                                }
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        School <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`school-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(options?.institutions || [])
                                                                                .filter((inst: IInstitutionDropdown) => {
                                                                                    return (
                                                                                        inst.key != null &&
                                                                                        inst.key !== undefined &&
                                                                                        inst.key !== 0
                                                                                    );
                                                                                })
                                                                                .map((inst: IInstitutionDropdown) => {
                                                                                    const val = inst.key?.toString().trim();
                                                                                    if (!val || val === '') return null;
                                                                                    return (
                                                                                        <SafeSelectItem key={inst.key} value={val}>
                                                                                            {inst.value || String(inst.key)}
                                                                                        </SafeSelectItem>
                                                                                    );
                                                                                })
                                                                                .filter(Boolean)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='designation'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            // DEBUG: Log designation dropdown binding
                                                            const availableOptions = (options?.designations || []).filter(
                                                                (dg: IDesignationDropdown) => {
                                                                    return dg.key != null && dg.key !== undefined && dg.key !== 0;
                                                                }
                                                            );

                                                            // Normalize both values for comparison
                                                            const fieldValueNormalized = field.value?.toString().trim();

                                                            const matchingOption = availableOptions.find((dg: IDesignationDropdown) => {
                                                                const keyNormalized = dg.key?.toString().trim();
                                                                return keyNormalized === fieldValueNormalized;
                                                            });

                                                            // DEBUG: Always log when there's a value (first time only)
                                                            if (field.value && availableOptions.length > 0) {
                                                                const hasMatch = !!matchingOption;
                                                                console.log(
                                                                    `🔍 [DEBUG] Designation Dropdown - Field Value: "${fieldValueNormalized}" (${typeof field.value}), Match Found: ${hasMatch}`,
                                                                    {
                                                                        fieldValue: field.value,
                                                                        fieldValueNormalized: fieldValueNormalized,
                                                                        fieldValueType: typeof field.value,
                                                                        matchingOption: matchingOption
                                                                            ? {
                                                                                  key: matchingOption.key,
                                                                                  value: matchingOption.value
                                                                              }
                                                                            : null,
                                                                        sampleKeys: availableOptions.slice(0, 3).map((dg) => ({
                                                                            key: dg.key,
                                                                            keyNormalized: dg.key?.toString().trim(),
                                                                            keyType: typeof dg.key,
                                                                            value: dg.value
                                                                        })),
                                                                        totalOptions: availableOptions.length
                                                                    }
                                                                );
                                                            }

                                                            // If no match found, log warning
                                                            if (field.value && !matchingOption && availableOptions.length > 0) {
                                                                console.warn('⚠️ [DEBUG] Designation Dropdown - NO MATCH FOUND:', {
                                                                    fieldValue: field.value,
                                                                    fieldValueNormalized: fieldValueNormalized,
                                                                    allAvailableKeys: availableOptions.map((dg) =>
                                                                        dg.key?.toString().trim()
                                                                    )
                                                                });
                                                            }

                                                            // Ensure value is set as string and matches dropdown format
                                                            const selectValue = field.value ? String(field.value).trim() : '';

                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Designation <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`designation-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions
                                                                                .map((dg: IDesignationDropdown) => {
                                                                                    const val = dg.key?.toString().trim();
                                                                                    if (!val || val === '') return null;
                                                                                    return (
                                                                                        <SafeSelectItem key={dg.key} value={val}>
                                                                                            {dg.value || String(dg.key)}
                                                                                        </SafeSelectItem>
                                                                                    );
                                                                                })
                                                                                .filter(Boolean)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <InputText
                                                        label='Subject Taught'
                                                        id='subjectTaught'
                                                        maxLength={50}
                                                        placeholder='Enter subject taught'
                                                        {...register('subjectTaught')}
                                                        error={errors.subjectTaught?.message}
                                                    />
                                                    <Controller
                                                        name='grade'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.grades || []).filter(
                                                                (gr: IGradeDropdown) => {
                                                                    return gr.key != null && gr.key !== undefined && gr.key !== 0;
                                                                }
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Grade <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`grade-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(options?.grades || [])
                                                                                .filter((gr: IGradeDropdown) => {
                                                                                    return (
                                                                                        gr.key != null &&
                                                                                        gr.key !== undefined &&
                                                                                        gr.key !== 0
                                                                                    );
                                                                                })
                                                                                .map((gr: IGradeDropdown) => {
                                                                                    const val = gr.key?.toString().trim();
                                                                                    if (!val || val === '') return null;
                                                                                    return (
                                                                                        <SafeSelectItem key={gr.key} value={val}>
                                                                                            {gr.value || String(gr.key)}
                                                                                        </SafeSelectItem>
                                                                                    );
                                                                                })
                                                                                .filter(Boolean)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='dateOfJoining'
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <DateField
                                                                field={field}
                                                                fieldState={fieldState}
                                                                label='Date Of Joining'
                                                                placeholder='Pick date of joining'
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name='dateOfConfirmation'
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <DateField
                                                                field={field}
                                                                fieldState={fieldState}
                                                                label='Date Of Confirmation'
                                                                placeholder='Pick date of confirmation'
                                                            />
                                                        )}
                                                    />
                                                    <div className='space-y-3'>
                                                        <Controller
                                                            name='epf'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className='flex items-center space-x-2'>
                                                                    <Checkbox
                                                                        id='epf'
                                                                        checked={!!field.value}
                                                                        onCheckedChange={(v) => field.onChange(!!v)}
                                                                    />
                                                                    <Label htmlFor='epf'>EPF</Label>
                                                                </div>
                                                            )}
                                                        />
                                                        <Controller
                                                            name='ppf'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className='flex items-center space-x-2'>
                                                                    <Checkbox
                                                                        id='ppf'
                                                                        checked={!!field.value}
                                                                        onCheckedChange={(v) => field.onChange(!!v)}
                                                                    />
                                                                    <Label htmlFor='ppf'>PPF</Label>
                                                                </div>
                                                            )}
                                                        />
                                                        <Controller
                                                            name='phdResearchGuide'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className='flex items-center space-x-2'>
                                                                    <Checkbox
                                                                        id='phdResearchGuide'
                                                                        checked={!!field.value}
                                                                        onCheckedChange={(v) => field.onChange(!!v)}
                                                                    />
                                                                    <Label htmlFor='phdResearchGuide'>PHD Research Guide ?</Label>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                    {watch?.('phdResearchGuide') ? (
                                                        <InputText
                                                            label='Recognition Year'
                                                            id='recognitionYear'
                                                            maxLength={4}
                                                            onKeyDown={(e) => {
                                                                const controlKeys = [
                                                                    'Backspace',
                                                                    'Delete',
                                                                    'Tab',
                                                                    'Escape',
                                                                    'Enter',
                                                                    'ArrowLeft',
                                                                    'ArrowRight',
                                                                    'ArrowUp',
                                                                    'ArrowDown'
                                                                ];
                                                                if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                    return;
                                                                }
                                                                if (e.key === ' ') {
                                                                    e.preventDefault();
                                                                    return;
                                                                }
                                                                if (!/^[0-9]$/.test(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            {...register('recognitionYear')}
                                                            error={errors.recognitionYear?.message}
                                                        />
                                                    ) : null}
                                                    <Controller
                                                        name='teachingNonTeaching'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            // Normalize value for string-based dropdown
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.teachingNonTeaching || []).filter(
                                                                (tt: ITeachingTypeDropdown) =>
                                                                    tt.key != null && tt.key !== '' && String(tt.key).trim() !== ''
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Teaching/NonTeaching <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`teachingNonTeaching-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((tt: ITeachingTypeDropdown) => {
                                                                                const val = tt.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={tt.key} value={val}>
                                                                                        {tt.value || String(tt.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='pfApplicable'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    id='pfApplicable'
                                                                    checked={!!field.value}
                                                                    onCheckedChange={(v) => field.onChange(!!v)}
                                                                />
                                                                <Label htmlFor='pfApplicable'>PF Applicable?</Label>
                                                            </div>
                                                        )}
                                                    />
                                                    {watch?.('pfApplicable') ? (
                                                        <div className='space-y-4 border-blue-500 border-l-4 pl-4'>
                                                            <div className='space-y-2'>
                                                                <Controller
                                                                    name='pfMaxAmount'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div className='flex items-center space-x-2'>
                                                                            <Checkbox
                                                                                id='pfMaxAmount'
                                                                                checked={!!field.value}
                                                                                onCheckedChange={(checked) => {
                                                                                    field.onChange(!!checked);
                                                                                    if (checked) {
                                                                                        setValue('pfFixedAmount', false, {
                                                                                            shouldValidate: false,
                                                                                            shouldDirty: false
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Label htmlFor='pfMaxAmount'>PF Max Amount</Label>
                                                                        </div>
                                                                    )}
                                                                />
                                                                <Controller
                                                                    name='pfFixedAmount'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div className='flex items-center space-x-2'>
                                                                            <Checkbox
                                                                                id='pfFixedAmount'
                                                                                checked={!!field.value}
                                                                                onCheckedChange={(checked) => {
                                                                                    field.onChange(!!checked);
                                                                                    if (checked) {
                                                                                        setValue('pfMaxAmount', false, {
                                                                                            shouldValidate: false,
                                                                                            shouldDirty: false
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Label htmlFor='pfFixedAmount'>PF Fixed Amount</Label>
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>
                                                            <InputText
                                                                label='PF Acc No.'
                                                                id='pfAccNo'
                                                                maxLength={22}
                                                                {...register('pfAccNo')}
                                                                error={errors.pfAccNo?.message}
                                                            />
                                                            <InputText
                                                                label='UAN Number'
                                                                id='uanNumber'
                                                                maxLength={12}
                                                                {...register('uanNumber')}
                                                                error={errors.uanNumber?.message}
                                                            />
                                                            <Controller
                                                                name='pfDate'
                                                                control={control}
                                                                render={({ field, fieldState }) => (
                                                                    <DateField
                                                                        field={field}
                                                                        fieldState={fieldState}
                                                                        label='PF Date'
                                                                        placeholder='Pick PF date'
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    ) : null}
                                                    <Controller
                                                        name='esiApplicable'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    id='esiApplicable'
                                                                    checked={!!field.value}
                                                                    onCheckedChange={(v) => field.onChange(!!v)}
                                                                />
                                                                <Label htmlFor='esiApplicable'>ESI Applicable?</Label>
                                                            </div>
                                                        )}
                                                    />
                                                    {watch?.('esiApplicable') ? (
                                                        <div className='space-y-4 border-green-500 border-l-4 pl-4'>
                                                            <InputText
                                                                label='ESI Acc No.'
                                                                id='esiAccNo'
                                                                maxLength={10}
                                                                onKeyDown={(e) => {
                                                                    const controlKeys = [
                                                                        'Backspace',
                                                                        'Delete',
                                                                        'Tab',
                                                                        'Escape',
                                                                        'Enter',
                                                                        'ArrowLeft',
                                                                        'ArrowRight',
                                                                        'ArrowUp',
                                                                        'ArrowDown'
                                                                    ];
                                                                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                        return;
                                                                    }
                                                                    if (e.key === ' ') {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    if (!/^[0-9]$/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...register('esiAccNo')}
                                                                error={errors.esiAccNo?.message}
                                                            />
                                                            <InputText
                                                                label='Gratuity Acc No.'
                                                                id='gratuityAccNo'
                                                                maxLength={25}
                                                                {...register('gratuityAccNo')}
                                                                error={errors.gratuityAccNo?.message}
                                                            />
                                                            <Controller
                                                                name='esiDate'
                                                                control={control}
                                                                render={({ field, fieldState }) => (
                                                                    <DateField
                                                                        field={field}
                                                                        fieldState={fieldState}
                                                                        label='ESI Date'
                                                                        placeholder='Pick ESI date'
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    ) : null}
                                                    <InputText
                                                        label='National SSN'
                                                        id='nationalSSN'
                                                        maxLength={9}
                                                        onKeyDown={(e) => {
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!/^[0-9]$/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('nationalSSN')}
                                                        error={errors.nationalSSN?.message}
                                                    />
                                                </div>
                                                {/* Right Column */}
                                                <div className='space-y-4'>
                                                    <Controller
                                                        name='religion'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.religions || []).filter(
                                                                (rel: IReligionDropdown) =>
                                                                    rel.key != null && rel.key !== undefined && rel.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Religion <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`religion-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((rel: IReligionDropdown) => {
                                                                                const val = rel.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={rel.key} value={val}>
                                                                                        {rel.value || String(rel.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='casteCategory'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.casteCategories || []).filter(
                                                                (cc: ICasteCategoryDropdown) =>
                                                                    cc.key != null && cc.key !== undefined && cc.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Caste Category <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`casteCategory-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((cc: ICasteCategoryDropdown) => {
                                                                                const val = cc.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={cc.key} value={val}>
                                                                                        {cc.value || String(cc.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='caste'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.castes || []).filter(
                                                                (c: ICasteDropdown) => c.key != null && c.key !== undefined && c.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Caste <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`caste-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='Select Caste' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((c: ICasteDropdown) => {
                                                                                const val = c.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={c.key} value={val}>
                                                                                        {c.value || String(c.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='dateOfBirth'
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <DateField
                                                                field={field}
                                                                fieldState={fieldState}
                                                                label='Date Of Birth'
                                                                placeholder='Pick date of birth'
                                                            />
                                                        )}
                                                    />
                                                    <Controller
                                                        name='dateOfRetirement'
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <div className='mt-5 flex flex-col gap-1.5'>
                                                                <Label htmlFor={field.name}>
                                                                    Date of Retirement
                                                                    <span className='ml-1 text-red-500'>*</span>
                                                                </Label>
                                                                <div className='flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-muted-foreground text-sm'>
                                                                    {field.value
                                                                        ? (() => {
                                                                              try {
                                                                                  const date = new Date(field.value);
                                                                                  return date.toLocaleDateString('en-GB', {
                                                                                      day: '2-digit',
                                                                                      month: '2-digit',
                                                                                      year: 'numeric'
                                                                                  });
                                                                              } catch {
                                                                                  return field.value;
                                                                              }
                                                                          })()
                                                                        : 'Pick date of retirement'}
                                                                </div>
                                                                {fieldState?.error && (
                                                                    <div className='text-destructive text-sm'>
                                                                        {fieldState.error.message}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    />
                                                    <Controller
                                                        name='gender'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.genders || []).filter(
                                                                (g: IGenderDropdown) => g.key != null && g.key !== undefined && g.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Gender <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`gender-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((g: IGenderDropdown) => {
                                                                                const val = g.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={g.key} value={val}>
                                                                                        {g.value || String(g.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='maritalStatus'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.maritalStatuses || []).filter(
                                                                (ms: IMaritalStatusDropdown) =>
                                                                    ms.key != null && ms.key !== undefined && ms.key !== 0
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Marital Status <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`maritalStatus-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((ms: IMaritalStatusDropdown) => {
                                                                                const val = ms.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={ms.key} value={val}>
                                                                                        {ms.value || String(ms.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    {/* Multiple Mobile Numbers */}
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label>
                                                            Mobile No. <span className='text-red-500'>*</span>
                                                        </Label>
                                                        <div className='space-y-2'>
                                                            {mobileFields.map((field, index) => (
                                                                <div key={field.id} className='flex items-center gap-2'>
                                                                    <Controller
                                                                        name={`mobileDetails.${index}.type`}
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                value={field.value || undefined}>
                                                                                <SelectTrigger className='w-28'>
                                                                                    <SelectValue placeholder='Select' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {(options?.contactTypes || []).length === 0 ? (
                                                                                        <SelectItem value='no-options' disabled>
                                                                                            No options available
                                                                                        </SelectItem>
                                                                                    ) : (
                                                                                        (options?.contactTypes || [])
                                                                                            .filter((item: any) => {
                                                                                                const key =
                                                                                                    item.key || item.value || item.id;
                                                                                                return (
                                                                                                    key != null &&
                                                                                                    key !== '' &&
                                                                                                    String(key).trim() !== ''
                                                                                                );
                                                                                            })
                                                                                            .map((item: any) => {
                                                                                                const key = (
                                                                                                    item.key ||
                                                                                                    item.value ||
                                                                                                    item.id
                                                                                                )
                                                                                                    ?.toString()
                                                                                                    .trim();
                                                                                                const value =
                                                                                                    item.value ||
                                                                                                    item.label ||
                                                                                                    item.name ||
                                                                                                    String(key);
                                                                                                if (!key || key === '') return null;
                                                                                                return (
                                                                                                    <SafeSelectItem key={key} value={key}>
                                                                                                        {value}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    <InputText
                                                                        placeholder='Enter mobile number'
                                                                        maxLength={10}
                                                                        {...register(`mobileDetails.${index}.mobileNo`)}
                                                                        className='min-w-[200px] flex-1'
                                                                    />
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        className='h-9 w-9 p-0'
                                                                        onClick={() => removeMobile(index)}>
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                className='w-full'
                                                                onClick={() =>
                                                                    appendMobile({
                                                                        mobileNo: '',
                                                                        type: 'Default'
                                                                    })
                                                                }>
                                                                <Plus className='mr-1 h-4 w-4' /> Add Mobile
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {/* Multiple Email IDs */}
                                                    <div className='flex flex-col gap-1.5'>
                                                        <Label>Email -Id</Label>
                                                        <div className='space-y-2'>
                                                            {emailFields.map((field, index) => (
                                                                <div key={field.id} className='flex items-center gap-2'>
                                                                    <Controller
                                                                        name={`emailDetails.${index}.type`}
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                value={field.value || undefined}>
                                                                                <SelectTrigger className='w-28'>
                                                                                    <SelectValue placeholder='Select' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {(options?.contactTypes || []).length === 0 ? (
                                                                                        <SelectItem value='no-options' disabled>
                                                                                            No options available
                                                                                        </SelectItem>
                                                                                    ) : (
                                                                                        (options?.contactTypes || [])
                                                                                            .filter((item: any) => {
                                                                                                const key =
                                                                                                    item.key || item.value || item.id;
                                                                                                return (
                                                                                                    key != null &&
                                                                                                    key !== '' &&
                                                                                                    String(key).trim() !== ''
                                                                                                );
                                                                                            })
                                                                                            .map((item: any) => {
                                                                                                const key = (
                                                                                                    item.key ||
                                                                                                    item.value ||
                                                                                                    item.id
                                                                                                )
                                                                                                    ?.toString()
                                                                                                    .trim();
                                                                                                const value =
                                                                                                    item.value ||
                                                                                                    item.label ||
                                                                                                    item.name ||
                                                                                                    String(key);
                                                                                                if (!key || key === '') return null;
                                                                                                return (
                                                                                                    <SafeSelectItem key={key} value={key}>
                                                                                                        {value}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    />
                                                                    <InputText
                                                                        type='email'
                                                                        placeholder='Enter email address'
                                                                        maxLength={100}
                                                                        {...register(`emailDetails.${index}.emailId`)}
                                                                        className='min-w-[200px] flex-1'
                                                                    />
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        className='h-9 w-9 p-0'
                                                                        onClick={() => removeEmail(index)}>
                                                                        <X className='h-4 w-4' />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                className='w-full'
                                                                onClick={() => appendEmail({ emailId: '', type: 'Default' })}>
                                                                <Plus className='mr-1 h-4 w-4' /> Add Email
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <InputText
                                                        label='Aadhaar No.'
                                                        id='aadharNo'
                                                        maxLength={12}
                                                        onKeyDown={(e) => {
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (!/^[0-9]$/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('aadharNo')}
                                                        error={errors.aadharNo?.message}
                                                    />
                                                    <InputText
                                                        label='PAN Card No.'
                                                        id='panCardNo'
                                                        maxLength={10}
                                                        onKeyDown={(e) => {
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                        }}
                                                        {...register('panCardNo')}
                                                        error={errors.panCardNo?.message}
                                                    />
                                                    <Controller
                                                        name='bloodGroup'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            // Normalize value for string-based dropdown
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.bloodGroups || []).filter(
                                                                (bg: IBloodGroupDropdown) =>
                                                                    bg.key != null && bg.key !== '' && String(bg.key).trim() !== ''
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>Blood Group</Label>
                                                                    <Select
                                                                        key={`bloodGroup-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((bg: IBloodGroupDropdown) => {
                                                                                const val = bg.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={bg.key} value={val}>
                                                                                        {bg.value || String(bg.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='salaryType'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            // Normalize value for string-based dropdown
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.salaryTypes || []).filter(
                                                                (st: ISalaryTypeDropdown) =>
                                                                    st.key != null && st.key !== '' && String(st.key).trim() !== ''
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>Salary Type</Label>
                                                                    <Select
                                                                        key={`salaryType-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((st: ISalaryTypeDropdown) => {
                                                                                const val = st.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={st.key} value={val}>
                                                                                        {st.value || String(st.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    <Controller
                                                        name='modeOfPayment'
                                                        control={control}
                                                        render={({ field, fieldState }) => {
                                                            // Normalize value for string-based dropdown
                                                            const selectValue = field.value ? String(field.value).trim() : '';
                                                            const availableOptions = (options?.modeOfPayment || []).filter(
                                                                (pm: IPaymentModeDropdown) =>
                                                                    pm.key != null && pm.key !== '' && String(pm.key).trim() !== ''
                                                            );
                                                            return (
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <Label>
                                                                        Mode of Payment <span className='text-red-500'>*</span>
                                                                    </Label>
                                                                    <Select
                                                                        key={`modeOfPayment-${selectValue}-${availableOptions.length}`}
                                                                        onValueChange={field.onChange}
                                                                        value={selectValue || undefined}>
                                                                        <SelectTrigger
                                                                            className={cn(
                                                                                fieldState.error
                                                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                                                    : 'border-input focus-visible:ring-ring'
                                                                            )}>
                                                                            <SelectValue placeholder='--Select--' />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availableOptions.map((pm: IPaymentModeDropdown) => {
                                                                                const val = pm.key?.toString().trim();
                                                                                if (!val || val === '') return null;
                                                                                return (
                                                                                    <SafeSelectItem key={pm.key} value={val}>
                                                                                        {pm.value || String(pm.key)}
                                                                                    </SafeSelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    {fieldState.error && (
                                                                        <div className='font-medium text-[0.8rem] text-destructive'>
                                                                            {fieldState.error.message}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                    {/* Employee Photo Upload */}
                                                    <div className='space-y-2'>
                                                        <Label>Upload Employee Photo</Label>
                                                        <div className='rounded-lg border-2 border-gray-300 border-dashed p-4 text-center'>
                                                            <div className='mx-auto mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
                                                                {selectedPhoto ? (
                                                                    <img
                                                                        src={selectedPhoto}
                                                                        alt='Employee Preview'
                                                                        className='h-full w-full rounded-lg object-cover'
                                                                    />
                                                                ) : (
                                                                    <Upload className='h-12 w-12 text-gray-400' />
                                                                )}
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <input
                                                                    type='file'
                                                                    id='employeePhoto'
                                                                    accept='image/*'
                                                                    onChange={handlePhotoUpload}
                                                                    className='hidden'
                                                                />
                                                                <Button
                                                                    type='button'
                                                                    variant='outline'
                                                                    className='w-full bg-gray-100'
                                                                    onClick={() => document.getElementById('employeePhoto')?.click()}>
                                                                    {selectedPhoto ? 'Change Photo' : 'Upload Employee Photo'}
                                                                </Button>
                                                                {selectedPhoto && (
                                                                    <Button
                                                                        type='button'
                                                                        size='sm'
                                                                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                                                        onClick={() => {
                                                                            setSelectedPhoto(null);
                                                                            setPhotoFile(null);
                                                                            const fileInput = document.getElementById(
                                                                                'employeePhoto'
                                                                            ) as HTMLInputElement;
                                                                            if (fileInput) fileInput.value = '';
                                                                        }}>
                                                                        Remove Photo
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Bank Details - Conditional on Mode of Payment */}
                                                    {watch('modeOfPayment') === 'Bank' ? (
                                                        <div className='space-y-4'>
                                                            <div className='rounded-md bg-gray-200 px-4 py-2'>
                                                                <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                                    EMPLOYEE BANK DETAILS:
                                                                </h3>
                                                            </div>
                                                            <div className='rounded-lg border bg-card'>
                                                                <div className='rounded-t-lg bg-gray-200 px-4 py-2 text-gray-900'>
                                                                    <div className='grid grid-cols-5 gap-2 font-semibold text-sm'>
                                                                        <div>Serial No.</div>
                                                                        <div>Employer Bank Name</div>
                                                                        <div>Bank Account No.</div>
                                                                        <div>Account Type</div>
                                                                        <div>Action</div>
                                                                    </div>
                                                                </div>
                                                                <div className='space-y-2 p-4'>
                                                                    {bankFields.map((field, index) => (
                                                                        <div key={field.id} className='grid grid-cols-5 items-center gap-2'>
                                                                            <div>{index + 1}</div>
                                                                            <div>
                                                                                <Controller
                                                                                    name={`bankDetails.${index}.employerBankName`}
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <Select
                                                                                            onValueChange={field.onChange}
                                                                                            value={field.value || ''}>
                                                                                            <SelectTrigger>
                                                                                                <SelectValue placeholder='--Select--' />
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {memoizedBankOptions.map((bank: any) => (
                                                                                                    <SafeSelectItem
                                                                                                        key={bank.id}
                                                                                                        value={bank.value}>
                                                                                                        {bank.name}
                                                                                                    </SafeSelectItem>
                                                                                                ))}
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <InputText
                                                                                    placeholder='Bank Account No.'
                                                                                    maxLength={14}
                                                                                    onKeyDown={(e) => {
                                                                                        const controlKeys = [
                                                                                            'Backspace',
                                                                                            'Delete',
                                                                                            'Tab',
                                                                                            'Escape',
                                                                                            'Enter',
                                                                                            'ArrowLeft',
                                                                                            'ArrowRight',
                                                                                            'ArrowUp',
                                                                                            'ArrowDown'
                                                                                        ];
                                                                                        if (
                                                                                            controlKeys.includes(e.key) ||
                                                                                            e.ctrlKey ||
                                                                                            e.metaKey
                                                                                        ) {
                                                                                            return;
                                                                                        }
                                                                                        if (e.key === ' ') {
                                                                                            e.preventDefault();
                                                                                            return;
                                                                                        }
                                                                                        if (!/^[0-9]$/.test(e.key)) {
                                                                                            e.preventDefault();
                                                                                        }
                                                                                    }}
                                                                                    {...register(`bankDetails.${index}.bankAccountNo`)}
                                                                                    className='w-full'
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Controller
                                                                                    name={`bankDetails.${index}.accountType`}
                                                                                    control={control}
                                                                                    render={({ field }) => (
                                                                                        <Select
                                                                                            onValueChange={field.onChange}
                                                                                            value={field.value || undefined}>
                                                                                            <SelectTrigger>
                                                                                                <SelectValue placeholder='Select' />
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {(options?.contactTypes || []).length ===
                                                                                                0 ? (
                                                                                                    <SelectItem value='no-options' disabled>
                                                                                                        No options available
                                                                                                    </SelectItem>
                                                                                                ) : (
                                                                                                    (options?.contactTypes || [])
                                                                                                        .filter((item: any) => {
                                                                                                            const key =
                                                                                                                item.key ||
                                                                                                                item.value ||
                                                                                                                item.id;
                                                                                                            return (
                                                                                                                key != null &&
                                                                                                                key !== '' &&
                                                                                                                String(key).trim() !== ''
                                                                                                            );
                                                                                                        })
                                                                                                        .map((item: any) => {
                                                                                                            const key = (
                                                                                                                item.key ||
                                                                                                                item.value ||
                                                                                                                item.id
                                                                                                            )
                                                                                                                ?.toString()
                                                                                                                .trim();
                                                                                                            const value =
                                                                                                                item.value ||
                                                                                                                item.label ||
                                                                                                                item.name ||
                                                                                                                String(key);
                                                                                                            if (!key || key === '')
                                                                                                                return null;
                                                                                                            return (
                                                                                                                <SafeSelectItem
                                                                                                                    key={key}
                                                                                                                    value={key}>
                                                                                                                    {value}
                                                                                                                </SafeSelectItem>
                                                                                                            );
                                                                                                        })
                                                                                                        .filter(Boolean)
                                                                                                )}
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='outline'
                                                                                    size='sm'
                                                                                    onClick={() => removeBank(index)}>
                                                                                    <Trash2 className='h-4 w-4' />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        type='button'
                                                                        variant='outline'
                                                                        size='sm'
                                                                        onClick={() =>
                                                                            appendBank({
                                                                                employerBankName: '',
                                                                                bankAccountNo: '',
                                                                                accountType: 'Default'
                                                                            })
                                                                        }>
                                                                        <Plus className='mr-1 h-4 w-4' /> Add Bank Account
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Address Information */}
                                {currentStep === 2 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Address Information</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please provide the employee&apos;s address details</p>
                                        </div>
                                        <div className='space-y-6'>
                                            {/* Contact Address */}
                                            <div className='space-y-4'>
                                                <div className='rounded-md border'>
                                                    <div className='border-b bg-muted px-4 py-2'>
                                                        <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                            CONTACT ADDRESS:
                                                        </h3>
                                                    </div>
                                                    <div className='p-4'>
                                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                                            <InputText
                                                                label='Address'
                                                                id='contactAddress'
                                                                maxLength={100}
                                                                {...register('contactAddress')}
                                                                error={errors.contactAddress?.message}
                                                            />
                                                            <InputText
                                                                label='Area'
                                                                id='contactArea'
                                                                {...register('contactArea')}
                                                                error={errors.contactArea?.message}
                                                            />
                                                            <div className='space-y-2'>
                                                                <Controller
                                                                    name='contactCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <Label>Country</Label>
                                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Country' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {(options?.countries || [])
                                                                                        .filter((country: ICountryDropdown) => {
                                                                                            return (
                                                                                                country.key != null &&
                                                                                                country.key !== undefined &&
                                                                                                country.key !== 0
                                                                                            );
                                                                                        })
                                                                                        .map((country: ICountryDropdown) => {
                                                                                            const key = country.key?.toString().trim();
                                                                                            if (!key || key === '') return null;
                                                                                            // Remove "Country" prefix if present
                                                                                            let displayValue =
                                                                                                country.value || String(country.key);
                                                                                            if (displayValue.startsWith('Country ')) {
                                                                                                displayValue = displayValue.replace(
                                                                                                    /^Country\s+/i,
                                                                                                    ''
                                                                                                );
                                                                                            }
                                                                                            return (
                                                                                                <SafeSelectItem
                                                                                                    key={country.key}
                                                                                                    value={key}>
                                                                                                    {displayValue}
                                                                                                </SafeSelectItem>
                                                                                            );
                                                                                        })
                                                                                        .filter(Boolean)}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </>
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <Controller
                                                                    name='contactState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <Label>State</Label>
                                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select State' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {isLoadingContactStates ? (
                                                                                        <SelectItem value='loading' disabled>
                                                                                            Loading states...
                                                                                        </SelectItem>
                                                                                    ) : (
                                                                                        availableContactStates
                                                                                            .filter((state: IStateDropdown) => {
                                                                                                return (
                                                                                                    state.key != null &&
                                                                                                    state.key !== undefined &&
                                                                                                    state.key !== 0
                                                                                                );
                                                                                            })
                                                                                            .map((state: IStateDropdown) => {
                                                                                                const key = state.key?.toString().trim();
                                                                                                if (!key || key === '') return null;
                                                                                                const value =
                                                                                                    state.value || String(state.key);
                                                                                                return (
                                                                                                    <SafeSelectItem
                                                                                                        key={`contact-state-${state.key}`}
                                                                                                        value={key}>
                                                                                                        {value}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </>
                                                                    )}
                                                                />
                                                            </div>
                                                            <InputText
                                                                label='City'
                                                                id='contactCity'
                                                                {...register('contactCity')}
                                                                error={errors.contactCity?.message}
                                                            />
                                                            <InputText
                                                                label='Pincode'
                                                                id='contactPincode'
                                                                maxLength={10}
                                                                onKeyDown={(e) => {
                                                                    const controlKeys = [
                                                                        'Backspace',
                                                                        'Delete',
                                                                        'Tab',
                                                                        'Escape',
                                                                        'Enter',
                                                                        'ArrowLeft',
                                                                        'ArrowRight',
                                                                        'ArrowUp',
                                                                        'ArrowDown'
                                                                    ];
                                                                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                        return;
                                                                    }
                                                                    if (e.key === ' ') {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    if (!/^[0-9]$/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...register('contactPincode')}
                                                                error={errors.contactPincode?.message}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Permanent Address */}
                                            <div className='space-y-4'>
                                                <div className='rounded-md border'>
                                                    <div className='border-b bg-muted px-4 py-2'>
                                                        <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                            PERMANENT ADDRESS:
                                                        </h3>
                                                    </div>
                                                    <div className='p-4'>
                                                        <div className='mb-4 flex items-center space-x-2'>
                                                            <Checkbox
                                                                id='sameAsCommunicationAddress'
                                                                checked={sameAsCommunicationAddress || false}
                                                                onCheckedChange={(checked) => {
                                                                    setValue('sameAsCommunicationAddress', !!checked);
                                                                }}
                                                            />
                                                            <Label htmlFor='sameAsCommunicationAddress'>
                                                                Same As Communication Address
                                                            </Label>
                                                        </div>
                                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                                            <InputText
                                                                label='Address'
                                                                id='permanentAddress'
                                                                maxLength={100}
                                                                {...register('permanentAddress')}
                                                                error={errors.permanentAddress?.message}
                                                                disabled={sameAsCommunicationAddress}
                                                            />
                                                            <InputText
                                                                label='Area'
                                                                id='permanentArea'
                                                                {...register('permanentArea')}
                                                                error={errors.permanentArea?.message}
                                                                disabled={sameAsCommunicationAddress}
                                                            />
                                                            <div className='space-y-2'>
                                                                <Controller
                                                                    name='permanentCountry'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <Label>Country</Label>
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                value={field.value}
                                                                                disabled={sameAsCommunicationAddress}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select Country' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {(options?.countries || [])
                                                                                        .filter((country: ICountryDropdown) => {
                                                                                            return (
                                                                                                country.key != null &&
                                                                                                country.key !== undefined &&
                                                                                                country.key !== 0
                                                                                            );
                                                                                        })
                                                                                        .map((country: ICountryDropdown) => {
                                                                                            const key = country.key?.toString().trim();
                                                                                            if (!key || key === '') return null;
                                                                                            // Remove "Country" prefix if present
                                                                                            let displayValue =
                                                                                                country.value || String(country.key);
                                                                                            if (displayValue.startsWith('Country ')) {
                                                                                                displayValue = displayValue.replace(
                                                                                                    /^Country\s+/i,
                                                                                                    ''
                                                                                                );
                                                                                            }
                                                                                            return (
                                                                                                <SafeSelectItem
                                                                                                    key={country.key}
                                                                                                    value={key}>
                                                                                                    {displayValue}
                                                                                                </SafeSelectItem>
                                                                                            );
                                                                                        })
                                                                                        .filter(Boolean)}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </>
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <Controller
                                                                    name='permanentState'
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <>
                                                                            <Label>State</Label>
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                value={field.value}
                                                                                disabled={sameAsCommunicationAddress}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder='Select State' />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {isLoadingPermanentStates ? (
                                                                                        <SelectItem value='loading' disabled>
                                                                                            Loading states...
                                                                                        </SelectItem>
                                                                                    ) : (
                                                                                        availablePermanentStates
                                                                                            .filter((state: IStateDropdown) => {
                                                                                                return (
                                                                                                    state.key != null &&
                                                                                                    state.key !== undefined &&
                                                                                                    state.key !== 0
                                                                                                );
                                                                                            })
                                                                                            .map((state: IStateDropdown) => {
                                                                                                const key = state.key?.toString().trim();
                                                                                                if (!key || key === '') return null;
                                                                                                const value =
                                                                                                    state.value || String(state.key);
                                                                                                return (
                                                                                                    <SafeSelectItem
                                                                                                        key={`permanent-state-${state.key}`}
                                                                                                        value={key}>
                                                                                                        {value}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </>
                                                                    )}
                                                                />
                                                            </div>
                                                            <InputText
                                                                label='City'
                                                                id='permanentCity'
                                                                {...register('permanentCity')}
                                                                error={errors.permanentCity?.message}
                                                                disabled={sameAsCommunicationAddress}
                                                            />
                                                            <InputText
                                                                label='Pincode'
                                                                id='permanentPincode'
                                                                maxLength={10}
                                                                onKeyDown={(e) => {
                                                                    const controlKeys = [
                                                                        'Backspace',
                                                                        'Delete',
                                                                        'Tab',
                                                                        'Escape',
                                                                        'Enter',
                                                                        'ArrowLeft',
                                                                        'ArrowRight',
                                                                        'ArrowUp',
                                                                        'ArrowDown'
                                                                    ];
                                                                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                        return;
                                                                    }
                                                                    if (e.key === ' ') {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    if (!/^[0-9]$/.test(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                {...register('permanentPincode')}
                                                                error={errors.permanentPincode?.message}
                                                                disabled={sameAsCommunicationAddress}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Qualification */}
                                {currentStep === 3 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Qualification</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please provide the employee&apos;s educational qualifications
                                            </p>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='rounded-md border'>
                                                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                                                    <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                        EMPLOYEE QUALIFICATION DETAILS
                                                    </h3>
                                                    <Button
                                                        type='button'
                                                        className='h-7 w-auto rounded-md bg-secondary px-2.5 py-1.5 text-secondary-foreground text-xs shadow-sm hover:bg-secondary/80'
                                                        onClick={() => {
                                                            appendQualification({
                                                                hrmeQ_Id: 0, // New record - use lowercase to match form field
                                                                qualification: '',
                                                                course: '',
                                                                college: '',
                                                                university: '',
                                                                yearOfPassing: '',
                                                                cgpaOrPercentage: 'CGPA',
                                                                cgpa: '',
                                                                qualificationCountry: '',
                                                                qualificationState: '',
                                                                registrationNo: '',
                                                                result: '',
                                                                areaOfSpecialisation: '',
                                                                medicalCouncil: '',
                                                                phdFlag: false,
                                                                thesisTitle: '',
                                                                registrationYear: '',
                                                                guideName: '',
                                                                qualifiedDate: '',
                                                                hardcopy: ''
                                                            } as any as z.infer<typeof qualificationDetailSchema>);
                                                        }}>
                                                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Qualification
                                                    </Button>
                                                </div>
                                            </div>
                                            {qualificationFields.length === 0 && (
                                                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                                                    No qualifications added yet. Click "Add Qualification" to start.
                                                </div>
                                            )}
                                            <div className='space-y-4'>
                                                {qualificationFields.map((field, index) => {
                                                    const qualificationDetails = watch('qualificationDetails') as any[];
                                                    const cgpaOrPercentage = qualificationDetails[index]?.cgpaOrPercentage || 'CGPA';
                                                    return (
                                                        <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                                                            <div className='mb-4 flex items-center justify-between'>
                                                                <div className='flex items-center gap-2'>
                                                                    <Badge variant='secondary'>Serial NO. {index + 1}</Badge>
                                                                    <div className='font-semibold'>Qualification #{index + 1}</div>
                                                                </div>
                                                                <Button
                                                                    type='button'
                                                                    className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                                                    onClick={() => removeQualification(index)}>
                                                                    <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                                                </Button>
                                                            </div>
                                                            <div className='space-y-4'>
                                                                {/* Row 1: Qualification, Course */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <InputText
                                                                        label='Qualification *'
                                                                        id={`qualificationDetails.${index}.qualification`}
                                                                        maxLength={50}
                                                                        {...register(`qualificationDetails.${index}.qualification`)}
                                                                    />
                                                                    <Controller
                                                                        name={`qualificationDetails.${index}.course`}
                                                                        control={control}
                                                                        render={({ field }) => {
                                                                            const courses = options?.courses || [];
                                                                            return (
                                                                                <div className='flex flex-col gap-1.5'>
                                                                                    <Label>Course *</Label>
                                                                                    <Select
                                                                                        onValueChange={field.onChange}
                                                                                        value={field.value || ''}>
                                                                                        <SelectTrigger className='h-9'>
                                                                                            <SelectValue placeholder='Select Course' />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {isLoadingCourses ? (
                                                                                                <SelectItem value='loading' disabled>
                                                                                                    Loading courses...
                                                                                                </SelectItem>
                                                                                            ) : courses.length === 0 ? (
                                                                                                <SelectItem value='no-options' disabled>
                                                                                                    No courses available
                                                                                                </SelectItem>
                                                                                            ) : (
                                                                                                courses
                                                                                                    .filter((course: ICourseDropdown) => {
                                                                                                        return (
                                                                                                            course.key != null &&
                                                                                                            course.key !== undefined &&
                                                                                                            course.key !== 0
                                                                                                        );
                                                                                                    })
                                                                                                    .map((course: ICourseDropdown) => {
                                                                                                        const key = course.key
                                                                                                            ?.toString()
                                                                                                            .trim();
                                                                                                        if (!key || key === '') return null;
                                                                                                        const value =
                                                                                                            course.value ||
                                                                                                            String(course.key);
                                                                                                        return (
                                                                                                            <SelectItem
                                                                                                                key={course.key}
                                                                                                                value={key}>
                                                                                                                {value}
                                                                                                            </SelectItem>
                                                                                                        );
                                                                                                    })
                                                                                                    .filter(Boolean)
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                                {/* Row 2: College, University */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <InputText
                                                                        label='College *'
                                                                        id={`qualificationDetails.${index}.college`}
                                                                        maxLength={100}
                                                                        {...register(`qualificationDetails.${index}.college`)}
                                                                    />
                                                                    <InputText
                                                                        label='University *'
                                                                        id={`qualificationDetails.${index}.university`}
                                                                        maxLength={100}
                                                                        {...register(`qualificationDetails.${index}.university`)}
                                                                    />
                                                                </div>
                                                                {/* Row 3: Year Of Passing, Country, State */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                                                    <InputText
                                                                        label='Year Of Passing *'
                                                                        id={`qualificationDetails.${index}.yearOfPassing`}
                                                                        maxLength={4}
                                                                        onKeyDown={(e) => {
                                                                            const controlKeys = [
                                                                                'Backspace',
                                                                                'Delete',
                                                                                'Tab',
                                                                                'Escape',
                                                                                'Enter',
                                                                                'ArrowLeft',
                                                                                'ArrowRight',
                                                                                'ArrowUp',
                                                                                'ArrowDown'
                                                                            ];
                                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                                return;
                                                                            }
                                                                            if (e.key === ' ') {
                                                                                e.preventDefault();
                                                                                return;
                                                                            }
                                                                            if (!/^[0-9]$/.test(e.key)) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        {...register(`qualificationDetails.${index}.yearOfPassing`)}
                                                                    />
                                                                    <Controller
                                                                        name={`qualificationDetails.${index}.qualificationCountry`}
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <div className='flex flex-col gap-1.5'>
                                                                                <Label>Country*</Label>
                                                                                <Select
                                                                                    onValueChange={(value) => {
                                                                                        field.onChange(value);
                                                                                        setValue(
                                                                                            `qualificationDetails.${index}.qualificationState`,
                                                                                            '',
                                                                                            {
                                                                                                shouldValidate: false
                                                                                            }
                                                                                        );
                                                                                    }}
                                                                                    value={field.value || ''}>
                                                                                    <SelectTrigger className='h-9'>
                                                                                        <SelectValue placeholder='Select Country' />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {(options?.countries || [])
                                                                                            .filter((country: ICountryDropdown) => {
                                                                                                return (
                                                                                                    country.key != null &&
                                                                                                    country.key !== undefined &&
                                                                                                    country.key !== 0
                                                                                                );
                                                                                            })
                                                                                            .map((country: ICountryDropdown) => {
                                                                                                const key = country.key?.toString().trim();
                                                                                                if (!key || key === '') return null;
                                                                                                // Remove "Country" prefix if present
                                                                                                let displayValue =
                                                                                                    country.value || String(country.key);
                                                                                                if (displayValue.startsWith('Country ')) {
                                                                                                    displayValue = displayValue.replace(
                                                                                                        /^Country\s+/i,
                                                                                                        ''
                                                                                                    );
                                                                                                }
                                                                                                return (
                                                                                                    <SafeSelectItem
                                                                                                        key={country.key}
                                                                                                        value={key}>
                                                                                                        {displayValue}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        )}
                                                                    />
                                                                    <QualificationStateDropdown
                                                                        control={control}
                                                                        index={index}
                                                                        countryId={
                                                                            (watch('qualificationDetails') as any[])?.[index]
                                                                                ?.qualificationCountry || null
                                                                        }
                                                                        setValue={setValue}
                                                                        fallbackStates={options?.states || []}
                                                                    />
                                                                </div>
                                                                {/* Row 4: Registration No., Result */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <InputText
                                                                        label='Registration No.'
                                                                        id={`qualificationDetails.${index}.registrationNo`}
                                                                        maxLength={50}
                                                                        {...register(`qualificationDetails.${index}.registrationNo`)}
                                                                    />
                                                                    <InputText
                                                                        label='Result *'
                                                                        id={`qualificationDetails.${index}.result`}
                                                                        maxLength={20}
                                                                        {...register(`qualificationDetails.${index}.result`)}
                                                                    />
                                                                </div>
                                                                {/* Row 5: CGPA Or Percentage dropdown */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <Controller
                                                                        name={`qualificationDetails.${index}.cgpaOrPercentage`}
                                                                        control={control}
                                                                        render={({ field, fieldState }) => (
                                                                            <div className='flex flex-col gap-1.5'>
                                                                                <Label>CGPA Or Percentage *</Label>
                                                                                <Select
                                                                                    onValueChange={field.onChange}
                                                                                    value={field.value || 'CGPA'}>
                                                                                    <SelectTrigger
                                                                                        className={cn(
                                                                                            'h-9',
                                                                                            fieldState.error
                                                                                                ? 'border-destructive focus-visible:ring-destructive'
                                                                                                : 'border-input focus-visible:ring-ring'
                                                                                        )}>
                                                                                        <SelectValue placeholder='Select' />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {(options?.cgpaPercentageTypes || [])
                                                                                            .filter((st: IScoreTypeDropdown) => {
                                                                                                return (
                                                                                                    st.key != null &&
                                                                                                    st.key !== '' &&
                                                                                                    String(st.key).trim() !== ''
                                                                                                );
                                                                                            })
                                                                                            .map((st: IScoreTypeDropdown) => {
                                                                                                const val = st.key?.toString().trim();
                                                                                                if (!val || val === '') return null;
                                                                                                return (
                                                                                                    <SafeSelectItem
                                                                                                        key={st.key}
                                                                                                        value={val}>
                                                                                                        {st.value || String(st.key)}
                                                                                                    </SafeSelectItem>
                                                                                                );
                                                                                            })
                                                                                            .filter(Boolean)}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                {fieldState.error && (
                                                                                    <div className='font-medium text-[0.8rem] text-destructive'>
                                                                                        {fieldState.error.message}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    />
                                                                    <InputText
                                                                        label={cgpaOrPercentage === 'Percentage' ? 'Percentage' : 'CGPA'}
                                                                        id={`qualificationDetails.${index}.cgpa`}
                                                                        maxLength={cgpaOrPercentage === 'Percentage' ? 3 : 4}
                                                                        onKeyDown={(e) => {
                                                                            const controlKeys = [
                                                                                'Backspace',
                                                                                'Delete',
                                                                                'Tab',
                                                                                'Escape',
                                                                                'Enter',
                                                                                'ArrowLeft',
                                                                                'ArrowRight',
                                                                                'ArrowUp',
                                                                                'ArrowDown'
                                                                            ];
                                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                                return;
                                                                            }
                                                                            if (e.key === ' ') {
                                                                                e.preventDefault();
                                                                                return;
                                                                            }
                                                                            if (cgpaOrPercentage === 'Percentage') {
                                                                                if (!/^[0-9]$/.test(e.key)) {
                                                                                    e.preventDefault();
                                                                                }
                                                                                return;
                                                                            }
                                                                            if (cgpaOrPercentage === 'CGPA') {
                                                                                if (e.key === '.') {
                                                                                    const target = e.target as HTMLInputElement;
                                                                                    if (target.value.includes('.')) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                } else if (!/^[0-9]$/.test(e.key)) {
                                                                                    e.preventDefault();
                                                                                }
                                                                            }
                                                                        }}
                                                                        {...register(`qualificationDetails.${index}.cgpa`)}
                                                                    />
                                                                </div>
                                                                {/* Row 6: Area Of Specialization */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <Controller
                                                                        name={`qualificationDetails.${index}.areaOfSpecialisation`}
                                                                        control={control}
                                                                        render={({ field }) => {
                                                                            const specialisations = options?.specialisations || [];
                                                                            return (
                                                                                <div className='flex flex-col gap-1.5'>
                                                                                    <Label>Area Of Specialization*</Label>
                                                                                    <Select
                                                                                        onValueChange={field.onChange}
                                                                                        value={field.value || ''}>
                                                                                        <SelectTrigger className='h-9'>
                                                                                            <SelectValue placeholder='Select' />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {specialisations
                                                                                                .filter((spec: ISpecializationDropdown) => {
                                                                                                    return (
                                                                                                        spec.key != null &&
                                                                                                        spec.key !== undefined &&
                                                                                                        spec.key !== 0
                                                                                                    );
                                                                                                })
                                                                                                .map((spec: ISpecializationDropdown) => {
                                                                                                    const key = spec.key?.toString().trim();
                                                                                                    if (!key || key === '') return null;
                                                                                                    const value =
                                                                                                        spec.value || String(spec.key);
                                                                                                    return (
                                                                                                        <SafeSelectItem
                                                                                                            key={spec.key}
                                                                                                            value={key}>
                                                                                                            {value}
                                                                                                        </SafeSelectItem>
                                                                                                    );
                                                                                                })
                                                                                                .filter(Boolean)}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                                {/* Row 7: PHD checkbox */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <div className='flex items-center space-x-2'>
                                                                        <Controller
                                                                            name={`qualificationDetails.${index}.phdFlag`}
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <div className='flex items-center space-x-2'>
                                                                                    <Checkbox
                                                                                        id={`qualificationDetails.${index}.phdFlag`}
                                                                                        checked={field.value || false}
                                                                                        onCheckedChange={field.onChange}
                                                                                    />
                                                                                    <Label
                                                                                        htmlFor={`qualificationDetails.${index}.phdFlag`}
                                                                                        className='cursor-pointer'>
                                                                                        PHD
                                                                                    </Label>
                                                                                </div>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Row 8: Thesis Title and Medical Council */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                                    <InputText
                                                                        label='Thesis Title'
                                                                        id={`qualificationDetails.${index}.thesisTitle`}
                                                                        maxLength={255}
                                                                        {...register(`qualificationDetails.${index}.thesisTitle`)}
                                                                    />
                                                                    <InputText
                                                                        label='Medical Council'
                                                                        id={`qualificationDetails.${index}.medicalCouncil`}
                                                                        maxLength={50}
                                                                        {...register(`qualificationDetails.${index}.medicalCouncil`)}
                                                                    />
                                                                </div>
                                                                {/* Row 9: Registration Year, Guide Name, Qualified Date */}
                                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                                                    <InputText
                                                                        label='Registration Year'
                                                                        id={`qualificationDetails.${index}.registrationYear`}
                                                                        maxLength={4}
                                                                        placeholder='Enter year (e.g., 2024)'
                                                                        onKeyDown={(e) => {
                                                                            const controlKeys = [
                                                                                'Backspace',
                                                                                'Delete',
                                                                                'Tab',
                                                                                'Escape',
                                                                                'Enter',
                                                                                'ArrowLeft',
                                                                                'ArrowRight',
                                                                                'ArrowUp',
                                                                                'ArrowDown'
                                                                            ];
                                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                                return;
                                                                            }
                                                                            if (e.key === ' ') {
                                                                                e.preventDefault();
                                                                                return;
                                                                            }
                                                                            if (!/^[0-9]$/.test(e.key)) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                        {...register(`qualificationDetails.${index}.registrationYear`)}
                                                                        error={
                                                                            errors.qualificationDetails?.[index]?.registrationYear?.message
                                                                        }
                                                                    />
                                                                    <InputText
                                                                        label='Guide Name'
                                                                        id={`qualificationDetails.${index}.guideName`}
                                                                        maxLength={100}
                                                                        {...register(`qualificationDetails.${index}.guideName`)}
                                                                    />
                                                                    <Controller
                                                                        name={`qualificationDetails.${index}.qualifiedDate`}
                                                                        control={control}
                                                                        render={({ field, fieldState }) => (
                                                                            <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                                                                <DateField
                                                                                    field={field}
                                                                                    fieldState={fieldState}
                                                                                    label='Qualified Date'
                                                                                    placeholder='Pick qualified date'
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Experience */}
                                {currentStep === 4 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Experience</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please provide the employee&apos;s work experience</p>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='rounded-md border'>
                                                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                                                    <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                        PREVIOUS EMPLOYMENT DETAILS
                                                    </h3>
                                                    <Button
                                                        type='button'
                                                        className='h-7 w-auto rounded-md bg-secondary px-2.5 py-1.5 text-secondary-foreground text-xs shadow-sm hover:bg-secondary/80'
                                                        onClick={() =>
                                                            appendExperience({
                                                                hrmeE_Id: 0, // New record - use lowercase to match form field
                                                                organisationName: '',
                                                                organisationAddress: '',
                                                                department: '',
                                                                designation: '',
                                                                joinDate: '',
                                                                exitDate: '',
                                                                noOfYears: '',
                                                                noOfMonths: '',
                                                                annualSalary: '',
                                                                reasonForLeaving: ''
                                                            } as any)
                                                        }>
                                                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Experience
                                                    </Button>
                                                </div>
                                            </div>
                                            {experienceFields.length === 0 && (
                                                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                                                    No experience added yet. Click "Add Experience" to start.
                                                </div>
                                            )}
                                            <div className='space-y-4'>
                                                {experienceFields.map((field, index) => (
                                                    <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                                                        <div className='mb-3 flex items-center justify-between'>
                                                            <div className='font-semibold'>Experience #{index + 1}</div>
                                                            <div className='flex gap-2'>
                                                                <Badge variant='secondary'>Row {index + 1}</Badge>
                                                                <Button
                                                                    type='button'
                                                                    className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                                                    onClick={() => removeExperience(index)}>
                                                                    <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                                                            <InputText
                                                                label='Organisation Name'
                                                                id={`experienceDetails.${index}.organisationName`}
                                                                maxLength={255}
                                                                {...register(`experienceDetails.${index}.organisationName`)}
                                                            />
                                                            <InputText
                                                                label='Department'
                                                                id={`experienceDetails.${index}.department`}
                                                                maxLength={100}
                                                                {...register(`experienceDetails.${index}.department`)}
                                                            />
                                                            <InputText
                                                                label='Designation *'
                                                                id={`experienceDetails.${index}.designation`}
                                                                maxLength={100}
                                                                {...register(`experienceDetails.${index}.designation`)}
                                                            />
                                                            <Controller
                                                                name={`experienceDetails.${index}.joinDate`}
                                                                control={control}
                                                                render={({ field, fieldState }) => {
                                                                    const experienceDetails = watch('experienceDetails') as any[];
                                                                    const exitDate = experienceDetails[index]?.exitDate;
                                                                    return (
                                                                        <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                                                            <DateField
                                                                                field={{
                                                                                    ...field,
                                                                                    onChange: (value: any) => {
                                                                                        field.onChange(value);
                                                                                        if (value && exitDate) {
                                                                                            const { years, months } =
                                                                                                calculateYearsAndMonths(value, exitDate);
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfYears`,
                                                                                                years.toString(),
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfMonths`,
                                                                                                months.toString(),
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                        } else {
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfYears`,
                                                                                                '',
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfMonths`,
                                                                                                '',
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                fieldState={fieldState}
                                                                                label='Join Date'
                                                                                placeholder='Pick join date'
                                                                            />
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                            <Controller
                                                                name={`experienceDetails.${index}.exitDate`}
                                                                control={control}
                                                                render={({ field, fieldState }) => {
                                                                    const experienceDetails = watch('experienceDetails') as any[];
                                                                    const joinDate = experienceDetails[index]?.joinDate;
                                                                    return (
                                                                        <div className='flex flex-col gap-1.5 [&>div]:mt-0'>
                                                                            <DateField
                                                                                field={{
                                                                                    ...field,
                                                                                    onChange: (value: any) => {
                                                                                        field.onChange(value);
                                                                                        if (value && joinDate) {
                                                                                            const { years, months } =
                                                                                                calculateYearsAndMonths(joinDate, value);
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfYears`,
                                                                                                years.toString(),
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfMonths`,
                                                                                                months.toString(),
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                        } else {
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfYears`,
                                                                                                '',
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                            setValue(
                                                                                                `experienceDetails.${index}.noOfMonths`,
                                                                                                '',
                                                                                                {
                                                                                                    shouldValidate: false,
                                                                                                    shouldDirty: false
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                fieldState={fieldState}
                                                                                label='Exit Date'
                                                                                placeholder='Pick exit date'
                                                                            />
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                            <InputText
                                                                label='No. Of Years'
                                                                id={`experienceDetails.${index}.noOfYears`}
                                                                {...register(`experienceDetails.${index}.noOfYears`)}
                                                                disabled
                                                                className='[&>input]:cursor-not-allowed [&>input]:bg-muted [&>input]:opacity-70'
                                                            />
                                                            <InputText
                                                                label='No. Of Months'
                                                                id={`experienceDetails.${index}.noOfMonths`}
                                                                {...register(`experienceDetails.${index}.noOfMonths`)}
                                                                disabled
                                                                className='[&>input]:cursor-not-allowed [&>input]:bg-muted [&>input]:opacity-70'
                                                            />
                                                            <InputText
                                                                label='Annual Salary'
                                                                id={`experienceDetails.${index}.annualSalary`}
                                                                maxLength={15}
                                                                {...register(`experienceDetails.${index}.annualSalary`)}
                                                            />
                                                            <div className='md:col-span-2 lg:col-span-3'>
                                                                <InputTextarea
                                                                    label='Organisation Address'
                                                                    id={`experienceDetails.${index}.organisationAddress`}
                                                                    maxLength={500}
                                                                    minHeight={60}
                                                                    {...register(`experienceDetails.${index}.organisationAddress`)}
                                                                    error={errors.experienceDetails?.[index]?.organisationAddress?.message}
                                                                    placeholder='Enter organisation address...'
                                                                />
                                                            </div>
                                                            <div className='md:col-span-2 lg:col-span-3'>
                                                                <InputTextarea
                                                                    label='Reason For Leaving'
                                                                    id={`experienceDetails.${index}.reasonForLeaving`}
                                                                    maxLength={500}
                                                                    minHeight={60}
                                                                    {...register(`experienceDetails.${index}.reasonForLeaving`)}
                                                                    error={errors.experienceDetails?.[index]?.reasonForLeaving?.message}
                                                                    placeholder='Enter reason for leaving...'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Document Upload */}
                                {currentStep === 5 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Document Upload</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please upload required documents</p>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='rounded-md border'>
                                                <div className='flex items-center justify-between border-b bg-muted px-4 py-2'>
                                                    <h3 className='font-semibold text-base text-gray-900 uppercase'>
                                                        DOCUMENT UPLOAD DETAILS [ONLY JPEG,DOCX,DOC,PDF FILES (0-2MB)]
                                                    </h3>
                                                    <Button
                                                        type='button'
                                                        className='h-7 w-auto rounded-md bg-secondary px-2.5 py-1.5 text-secondary-foreground text-xs shadow-sm hover:bg-secondary/80'
                                                        onClick={() => appendDocument({} as any)}>
                                                        <Plus className='mr-1 h-3.5 w-3.5' /> Add Document
                                                    </Button>
                                                </div>
                                            </div>
                                            {documentFields.length === 0 && (
                                                <div className='rounded-md border p-6 text-muted-foreground text-sm'>
                                                    No documents added yet. Click "Add Document" to start.
                                                </div>
                                            )}
                                            <div className='space-y-4'>
                                                {documentFields.map((field, index) => {
                                                    const selectedFile = watchDocuments?.[index]?.document?.[0];
                                                    const fileName = selectedFile?.name;
                                                    const existingFileName = (watchDocuments?.[index] as any)?.documentImageName;
                                                    const displayFileName = fileName || existingFileName;
                                                    return (
                                                        <div key={field.id} className='rounded-lg border bg-card p-4 shadow-sm'>
                                                            <div className='mb-3 flex items-center justify-between'>
                                                                <div className='font-semibold'>Document #{index + 1}</div>
                                                                <div className='flex gap-2'>
                                                                    <Badge variant='secondary'>Row {index + 1}</Badge>
                                                                    <Button
                                                                        type='button'
                                                                        className='h-7 w-auto rounded-md px-2.5 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground'
                                                                        onClick={() => removeDocument(index)}>
                                                                        <Trash2 className='mr-1 h-3.5 w-3.5' /> Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                                                                <InputText
                                                                    label='Document Name *'
                                                                    id={`documentList.${index}.documentName`}
                                                                    maxLength={255}
                                                                    {...register(`documentList.${index}.documentName`)}
                                                                    placeholder='Enter document name'
                                                                    error={errors.documentList?.[index]?.documentName?.message}
                                                                />
                                                                <InputText
                                                                    label='Description *'
                                                                    id={`documentList.${index}.documentDescription`}
                                                                    maxLength={400}
                                                                    {...register(`documentList.${index}.documentDescription`)}
                                                                    placeholder='Enter description'
                                                                    error={errors.documentList?.[index]?.documentDescription?.message}
                                                                />
                                                                <div className='space-y-2 md:col-span-2'>
                                                                    <Label>Upload Document</Label>
                                                                    <div className='flex items-center gap-2'>
                                                                        <input
                                                                            type='file'
                                                                            id={`documentList.${index}.document`}
                                                                            accept='.jpeg,.jpg,.docx,.doc,.pdf'
                                                                            {...register(`documentList.${index}.document`)}
                                                                            className='hidden'
                                                                        />
                                                                        <Button
                                                                            type='button'
                                                                            variant='outline'
                                                                            size='sm'
                                                                            className='w-fit'
                                                                            onClick={() =>
                                                                                document
                                                                                    .getElementById(`documentList.${index}.document`)
                                                                                    ?.click()
                                                                            }>
                                                                            <Upload className='mr-1 h-4 w-4' /> Choose File
                                                                        </Button>
                                                                        {displayFileName && (
                                                                            <div className='flex items-center gap-2 rounded-md bg-muted px-3 py-2'>
                                                                                <span className='text-muted-foreground text-sm'>
                                                                                    Selected:
                                                                                </span>
                                                                                <span className='max-w-xs truncate font-medium text-sm'>
                                                                                    {displayFileName}
                                                                                </span>
                                                                                {selectedFile && (
                                                                                    <Badge variant='secondary' className='ml-2'>
                                                                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                                                                    </Badge>
                                                                                )}
                                                                                {existingFileName && !selectedFile && (
                                                                                    <Badge variant='outline' className='ml-2'>
                                                                                        Existing File
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {!displayFileName && (
                                                                            <span className='text-muted-foreground text-sm'>
                                                                                No file selected
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Medical Record */}
                                {currentStep === 6 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Medical Record</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>
                                                Please provide the employee&apos;s health information
                                            </p>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='rounded-md border'>
                                                <div className='border-b bg-muted px-4 py-2'>
                                                    <h3 className='font-semibold text-base text-gray-900 uppercase'>MEDICAL RECORD</h3>
                                                </div>
                                            </div>
                                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <InputText
                                                        label="Employee's Height"
                                                        id='employeeHeight'
                                                        placeholder='Height (e.g., 175.50)'
                                                        maxLength={6}
                                                        onKeyDown={(e) => {
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === '.') {
                                                                const target = e.target as HTMLInputElement;
                                                                if (target.value.includes('.')) {
                                                                    e.preventDefault();
                                                                    return;
                                                                }
                                                            } else if (!/^[0-9]$/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('employeeHeight')}
                                                        error={errors.employeeHeight?.message}
                                                    />
                                                    <InputText
                                                        label='Unit of measure (Height)'
                                                        id='employeeHeightUnit'
                                                        placeholder='Unit of measure'
                                                        maxLength={10}
                                                        {...register('employeeHeightUnit')}
                                                        error={errors.employeeHeightUnit?.message}
                                                    />
                                                </div>
                                                <InputText
                                                    label='Eye Sight Issue'
                                                    id='eyeSightIssue'
                                                    maxLength={255}
                                                    {...register('eyeSightIssue')}
                                                    error={errors.eyeSightIssue?.message}
                                                />
                                                <div className='grid grid-cols-2 gap-4'>
                                                    <InputText
                                                        label="Employee's Weight"
                                                        id='employeeWeight'
                                                        placeholder='Weight (e.g., 75.50)'
                                                        maxLength={6}
                                                        onKeyDown={(e) => {
                                                            const controlKeys = [
                                                                'Backspace',
                                                                'Delete',
                                                                'Tab',
                                                                'Escape',
                                                                'Enter',
                                                                'ArrowLeft',
                                                                'ArrowRight',
                                                                'ArrowUp',
                                                                'ArrowDown'
                                                            ];
                                                            if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                                                                return;
                                                            }
                                                            if (e.key === ' ') {
                                                                e.preventDefault();
                                                                return;
                                                            }
                                                            if (e.key === '.') {
                                                                const target = e.target as HTMLInputElement;
                                                                if (target.value.includes('.')) {
                                                                    e.preventDefault();
                                                                    return;
                                                                }
                                                            } else if (!/^[0-9]$/.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        {...register('employeeWeight')}
                                                        error={errors.employeeWeight?.message}
                                                    />
                                                    <InputText
                                                        label='Unit of measure (Weight)'
                                                        id='employeeWeightUnit'
                                                        placeholder='Unit of measure'
                                                        maxLength={10}
                                                        {...register('employeeWeightUnit')}
                                                        error={errors.employeeWeightUnit?.message}
                                                    />
                                                </div>
                                                <InputText
                                                    label='Any Health Issue'
                                                    id='anyHealthIssue'
                                                    maxLength={500}
                                                    {...register('anyHealthIssue')}
                                                    error={errors.anyHealthIssue?.message}
                                                />
                                            </div>
                                            <InputTextarea
                                                label='Identification Mark'
                                                id='identificationMark'
                                                maxLength={255}
                                                minHeight={80}
                                                {...register('identificationMark')}
                                                error={errors.identificationMark?.message}
                                                placeholder='Enter identification mark details...'
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 7: Other Details */}
                                {currentStep === 7 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Other Details</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please provide additional information</p>
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='rounded-md border'>
                                                <div className='border-b bg-muted px-4 py-2'>
                                                    <h3 className='font-semibold text-base text-gray-900 uppercase'>OTHER DETAILS</h3>
                                                </div>
                                            </div>
                                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                                <div className='space-y-1.5'>
                                                    <InputText
                                                        label='Biometric Code'
                                                        id='biometricCode'
                                                        maxLength={50}
                                                        {...register('biometricCode')}
                                                        error={errors.biometricCode?.message}
                                                    />
                                                    <InputText
                                                        label='RF card ID'
                                                        id='rfCardId'
                                                        maxLength={50}
                                                        {...register('rfCardId')}
                                                        error={errors.rfCardId?.message}
                                                    />
                                                    <InputText
                                                        label='MS Teams UserName'
                                                        id='msTeamsUserName'
                                                        maxLength={100}
                                                        {...register('msTeamsUserName')}
                                                        error={errors.msTeamsUserName?.message}
                                                    />
                                                    <InputText
                                                        label='MS Teams Password'
                                                        id='msTeamsPassword'
                                                        type='password'
                                                        maxLength={255}
                                                        {...register('msTeamsPassword')}
                                                        error={errors.msTeamsPassword?.message}
                                                    />
                                                </div>
                                                <div className='space-y-4'>
                                                    <div className='space-y-2'>
                                                        <Label className='mb-2 block'>Options</Label>
                                                        <div className='space-y-3'>
                                                            <Controller
                                                                name='punchRelaxation'
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <div className='flex items-center space-x-2'>
                                                                        <Checkbox
                                                                            id='punchRelaxation'
                                                                            checked={!!field.value}
                                                                            onCheckedChange={(v) => field.onChange(!!v)}
                                                                        />
                                                                        <Label
                                                                            htmlFor='punchRelaxation'
                                                                            className='cursor-pointer leading-none'>
                                                                            Punch Relaxation ?
                                                                        </Label>
                                                                    </div>
                                                                )}
                                                            />
                                                            <Controller
                                                                name='stopPension'
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <div className='flex items-center space-x-2'>
                                                                        <Checkbox
                                                                            id='stopPension'
                                                                            checked={!!field.value}
                                                                            onCheckedChange={(v) => field.onChange(!!v)}
                                                                        />
                                                                        <Label
                                                                            htmlFor='stopPension'
                                                                            className='cursor-pointer leading-none'>
                                                                            Stop Pension ?
                                                                        </Label>
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    {stopPension && (
                                                        <Controller
                                                            name='dateOfStopPension'
                                                            control={control}
                                                            render={({ field, fieldState }) => (
                                                                <DateField
                                                                    field={field}
                                                                    fieldState={fieldState}
                                                                    label='Date of Stop Pension'
                                                                    placeholder='Pick date of stop pension'
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                    <Controller
                                                        name='employeeLeft'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <div className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    id='employeeLeft'
                                                                    checked={!!field.value}
                                                                    onCheckedChange={(v) => field.onChange(!!v)}
                                                                />
                                                                <Label htmlFor='employeeLeft' className='cursor-pointer leading-none'>
                                                                    Employee Left ?
                                                                </Label>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            {employeeLeft && (
                                                <div className='w-[50%] rounded-lg border bg-muted/50 p-4'>
                                                    <div className='space-y-2 md:col-span-2'>
                                                        <Controller
                                                            name='lastWorkingDay'
                                                            control={control}
                                                            render={({ field, fieldState }) => (
                                                                <DateField
                                                                    field={field}
                                                                    fieldState={fieldState}
                                                                    label='Last Working day'
                                                                    placeholder='Pick last working day'
                                                                />
                                                            )}
                                                        />
                                                        <Controller
                                                            name='reasonForLeaving'
                                                            control={control}
                                                            render={({ field }) => {
                                                                const leavingReasons = options?.leavingReasons || [];
                                                                return (
                                                                    <div className='space-y-2 md:col-span-2 '>
                                                                        <Label>Reason for Leaving *</Label>
                                                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                                                            <SelectTrigger
                                                                                className={cn(
                                                                                    errors.reasonForLeaving
                                                                                        ? 'border-destructive focus-visible:ring-destructive'
                                                                                        : 'border-input focus-visible:ring-ring'
                                                                                )}>
                                                                                <SelectValue placeholder='Select reason for leaving' />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {leavingReasons
                                                                                    .filter((reason: ILeaveReasonDropdown) => {
                                                                                        return (
                                                                                            reason.key != null &&
                                                                                            reason.key !== undefined &&
                                                                                            reason.key !== 0
                                                                                        );
                                                                                    })
                                                                                    .map((reason: ILeaveReasonDropdown) => {
                                                                                        const key = reason.key?.toString().trim();
                                                                                        if (!key || key === '') return null;
                                                                                        const value = reason.value || String(reason.key);
                                                                                        return (
                                                                                            <SafeSelectItem key={reason.key} value={key}>
                                                                                                {value}
                                                                                            </SafeSelectItem>
                                                                                        );
                                                                                    })
                                                                                    .filter(Boolean)}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {errors.reasonForLeaving && (
                                                                            <div className='font-medium text-[0.8rem] text-destructive'>
                                                                                {errors.reasonForLeaving.message}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 8: Payroll */}
                                {currentStep === 8 && (
                                    <div className='space-y-6'>
                                        <div>
                                            <h2 className='font-bold text-2xl text-gray-900'>Payroll</h2>
                                            <p className='mt-1 text-gray-500 text-sm'>Please configure salary and deductions</p>
                                        </div>
                                        {savedEmployeeId && watch('employeeCode') ? (
                                            <PayrollTab
                                                employeeId={savedEmployeeId}
                                                employeeCode={watch('employeeCode')}
                                                grossList={[]}
                                                earningList={[]}
                                                detectionList={[]}
                                                arrearList={[]}
                                                onSuccess={onSuccess}
                                            />
                                        ) : (
                                            <div className='rounded-md border p-6 text-center text-muted-foreground'>
                                                Payroll tab will be available after saving employee details.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Navigation Footer */}
                            <div className='flex items-center justify-between border-t bg-gray-50 px-6 py-4 md:px-8'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                        reset();
                                        setCurrentStep(1);
                                    }}
                                    disabled={isSubmittingAny}
                                    className='w-fit transition-all duration-200 hover:scale-105'>
                                    Reset Form
                                </Button>

                                <div className='flex gap-3'>
                                    {currentStep > 1 && (
                                        <Button type='button' variant='outline' onClick={prevStep} disabled={isSubmittingAny}>
                                            <ChevronLeft className='mr-2 h-4 w-4' />
                                            Previous
                                        </Button>
                                    )}

                                    {currentStep < steps.length ? (
                                        <Button type='button' onClick={nextStep} disabled={isSubmittingAny}>
                                            Next
                                            <ChevronRight className='ml-2 h-4 w-4' />
                                        </Button>
                                    ) : (
                                        <Button
                                            type='button'
                                            onClick={onFormSubmit}
                                            disabled={isSubmittingAny}
                                            className='min-w-[160px] transition-all duration-200 hover:scale-105'>
                                            {isSubmittingAny ? (
                                                <span>Saving...</span>
                                            ) : (
                                                <>
                                                    <Save className='mr-2 h-4 w-4' />
                                                    Submit Employee
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
