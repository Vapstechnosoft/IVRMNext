"use client";

import { Heading } from "@/components/layout/heading";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormError, Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save,
  RefreshCw,
  CalendarIcon,
  Upload,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import {
  type SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../lib/localdb";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  getEmployeeRegisterOnload,
  saveEmployeeRegister,
  addUpdateEmployeePersonalDetails,
  addUpdateEmployeeAddressDetails,
  addUpdateEmployeeQualificationDetails,
  addUpdateEmployeeExperienceDetails,
  addUpdateEmployeeDocumentDetails,
  addUpdateEmployeeMedicalDetails,
  addUpdateEmployeeOtherDetails,
  addUpdateEmployeeEarningDetails,
  addUpdateEmployeeDeductionDetails,
  addUpdateEmployeeArrearDetails,
  getEmployeeById,
  saveQualification,
  savePersonalDetails,
} from "@/server/hrms/employee-register";
import type {
  EmployeeRegisterOnloadResponse,
  EmployeeRegisterSaveRequest,
  EmployeePersonalDetailsRequest,
  EmployeeAddressDetailsRequest,
  EmployeeQualificationDetailsRequest,
  EmployeeExperienceDetailsRequest,
  EmployeeDocumentDetailsRequest,
  EmployeeMedicalDetailsRequest,
  EmployeeOtherDetailsRequest,
  EmployeeEarningDetailsRequest,
  EmployeeDeductionDetailsRequest,
  EmployeeArrearDetailsRequest,
  GetEmployeeByIdResponse,
  SaveQualificationRequest,
} from "@/types/hrms/employee-register";

// Employee interface with all fields
interface Employee extends BaseEntity {
  // Employee Tab
  nameOfEmployee: string;
  firstName: string;
  middleName: string;
  lastName: string;
  employeeCode: string;
  fatherName: string;
  motherName: string;
  typeOfEmployment: string;
  employeeGroup: string;
  school: string;
  designation: string;
  subjectTaught: string;
  grade: string;
  dateOfJoining: string;
  dateOfConfirmation: string;
  epf: boolean;
  ppf: boolean;
  phdResearchGuide: boolean;
  recognitionYear: string;
  teachingNonTeaching: string;
  pfApplicable: boolean;
  esiAccNo: string;
  esiDate: string;
  gratuityAccNo: string;
  pfMaxAmount: boolean;
  pfFixedAmount: boolean;
  pfAccNo: string;
  uanNumber: string;
  pfDate: string;
  esiApplicable: boolean;
  nationalSSN: string;
  religion: string;
  casteCategory: string;
  caste: string;
  dateOfBirth: string;
  dateOfRetirement: string;
  gender: string;
  maritalStatus: string;
  mobileNo: string;
  emailId: string;
  aadharNo: string;
  panCardNo: string;
  bloodGroup: string;
  salaryType: string;
  modeOfPayment: string;
  employeePhoto: string;
  employerBankName: string;
  bankAccountNo: string;

  // Address Tab
  contactAddress: string;
  contactArea: string;
  contactCountry: string;
  contactState: string;
  contactCity: string;
  contactPincode: string;
  permanentAddress: string;
  permanentArea: string;
  permanentCountry: string;
  permanentState: string;
  permanentCity: string;
  permanentPincode: string;
  sameAsCommunicationAddress: boolean;

  // Qualification Tab
  qualificationSerialNo: string;
  qualification: string;
  course: string;
  college: string;
  university: string;
  yearOfPassing: string;
  qualificationCountry: string;
  qualificationState: string;
  registrationNo: string;
  result: string;
  cgpaOrPercentage: string;
  cgpa: string;
  percentage: string;
  areaOfSpecialization: string;
  phd: boolean;
  phdDetails: string;
  medicalCouncil: string;
  thesisTitle: string;
  registrationYear: string;
  guideName: string;
  specialization: string;
  qualifiedDate: string;

  // New: Multiple Qualification entries
  qualificationDetails?: QualificationItem[];

  // New: Multiple Experience entries
  experienceDetails?: any[];

  // New: Multiple Document entries
  documentList?: any[];

  // New: Multiple Mobile entries
  mobileDetails?: Array<{ mobileNo: string; type: string }>;

  // New: Multiple Email entries
  emailDetails?: Array<{ emailId: string; type: string }>;

  // New: Multiple Bank entries
  bankDetails?: Array<{
    employerBankName: string;
    bankAccountNo: string;
    accountType: string;
  }>;

  // Experience Tab
  employeeHavingExperience: boolean;
  experienceSerialNo: string;
  organisationName: string;
  organisationAddress: string;
  experienceDepartment: string;
  experienceDesignation: string;
  dateOfJoiningExp: string;
  dateOfLeaving: string;
  noOfYears: string;
  noOfMonths: string;
  lastDrawnSalary: string;
  reasonForLeavingExp: string;

  // Upload Document Tab
  documentSerialNo: string;
  nameOfDocument: string;
  documentDescription: string;
  document: string;

  // Medical Record Tab
  employeeHeight: string;
  employeeHeightUnit: string;
  employeeWeight: string;
  employeeWeightUnit: string;
  eyeSightIssue: string;
  anyHealthIssue: string;
  identificationMark: string;

  // Other Details Tab
  biometricCode: string;
  rfCardId: string;
  msTeamsUserName: string;
  msTeamsPassword: string;
  punchRelaxation: boolean;
  stopPension: boolean;
  employeeLeft: boolean;

  // Payroll fields - Earning Details
  earnings: string;
  earningsActualPercent: string;
  earningsApplicablePercent: string;
  earningsAmount: string;
  earningsMaxAmount: string;
  earningsDetails: string;
  earningsAction: boolean;

  // Payroll fields - Deduction Details
  deductions: string;
  deductionsActualPercent: string;
  deductionsApplicablePercent: string;
  deductionsAmount: string;
  deductionsMaxAmount: string;
  deductionsDetails: string;
  deductionsAction: boolean;

  // Payroll fields - Arrear Details
  arrearHead: string;
  arrearActualPercent: string;
  arrearApplicablePercent: string;
  arrearAmount: string;
  arrearDetails: string;
  arrearAction: boolean;

  // Payroll arrays for API integration
  earningDetailsList?: any[];
  deductionDetailsList?: any[];
  arrearDetailsList?: any[];
}

// A single qualification row structure used in the redesigned Qualification tab
interface QualificationItem {
  qualification?: string;
  course?: string;
  college?: string;
  university?: string;
  yearOfPassing?: string;
  qualificationCountry?: string;
  qualificationState?: string;
  registrationNo?: string;
  result?: string;
  cgpaOrPercentage?: string;
  cgpa?: string;
  percentage?: string;
  areaOfSpecialization?: string;
  phd?: boolean;
  phdDetails?: string;
  medicalCouncil?: string;
  thesisTitle?: string;
  registrationYear?: string;
  guideName?: string;
  specialization?: string;
  qualifiedDate?: string;
}

type EmployeeForm = Omit<Employee, "id" | "createdAt">;

export default function EmployeeRegisterPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employee");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Onload dropdown states
  const [onload, setOnload] = useState<EmployeeRegisterOnloadResponse | null>(
    null
  );
  const [empTypes, setEmpTypes] = useState<any[]>([]);
  const [groupTypes, setGroupTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [casteCategories, setCasteCategories] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<any[]>([]);
  const [specialisations, setSpecialisations] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);

  const employeeDB = createLocalCrud<Employee>("employee:register");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeForm>({
    mode: "onChange",
  });

  // Load data on component mount
  useEffect(() => {
    loadOnloadDropdowns();
  }, []);

  const loadOnloadDropdowns = async () => {
    try {
      console.log("=== Fetching Employee Register Onload Dropdowns ===");
      const res = await getEmployeeRegisterOnload({
        MI_Id: 30,
        LogInUserId: 2,
      });

      console.log("=== API Response ===");
      console.log("Success:", res.success);
      console.log("Message:", res.message);
      console.log("Full Response Data:", JSON.stringify(res.data, null, 2));

      if (res.success && res.data) {
        const d = res.data as any;

        // Log all available keys in response
        console.log("Response keys:", Object.keys(d));

        setOnload(d);

        // Extract with fallbacks and default to empty array if null
        const extractedEmpTypes = Array.isArray(d.employeeTypedropdownlist)
          ? d.employeeTypedropdownlist
          : Array.isArray(d.EmployeeTypeDropdownList)
          ? d.EmployeeTypeDropdownList
          : [];

        const extractedGroupTypes = Array.isArray(d.groupTypedropdownlist)
          ? d.groupTypedropdownlist
          : Array.isArray(d.GroupTypeDropdownList)
          ? d.GroupTypeDropdownList
          : [];

        const extractedDepartments = Array.isArray(d.departmentdropdownlist)
          ? d.departmentdropdownlist
          : Array.isArray(d.DepartmentDropdownList)
          ? d.DepartmentDropdownList
          : [];

        const extractedDesignations = Array.isArray(d.designationdropdownlist)
          ? d.designationdropdownlist
          : Array.isArray(d.DesignationDropdownList)
          ? d.DesignationDropdownList
          : [];

        const extractedGrades = Array.isArray(d.gradedropdownlist)
          ? d.gradedropdownlist
          : Array.isArray(d.GradeDropdownList)
          ? d.GradeDropdownList
          : [];

        const extractedReligions = Array.isArray(d.religiondropdownlist)
          ? d.religiondropdownlist
          : Array.isArray(d.ReligionDropdownList)
          ? d.ReligionDropdownList
          : [];

        const extractedCasteCategories = Array.isArray(
          d.casteCategorydropdownlist
        )
          ? d.casteCategorydropdownlist
          : Array.isArray(d.CasteCategoryDropdownList)
          ? d.CasteCategoryDropdownList
          : [];

        const extractedCastes = Array.isArray(d.castedropdownlist)
          ? d.castedropdownlist
          : Array.isArray(d.CasteDropdownList)
          ? d.CasteDropdownList
          : [];

        const extractedGenders = Array.isArray(d.genderdropdownlist)
          ? d.genderdropdownlist
          : Array.isArray(d.GenderDropdownList)
          ? d.GenderDropdownList
          : [];

        const extractedMaritalStatuses = Array.isArray(
          d.maritalStatusdropdownlist
        )
          ? d.maritalStatusdropdownlist
          : Array.isArray(d.MaritalStatusDropdownList)
          ? d.MaritalStatusDropdownList
          : [];

        const extractedSpecialisations = Array.isArray(d.SpecialisationList)
          ? d.SpecialisationList
          : Array.isArray(d.specialisationList)
          ? d.specialisationList
          : [];

        const extractedBanks = Array.isArray(d.bankdropdownlist)
          ? d.bankdropdownlist
          : Array.isArray(d.BankDropdownList)
          ? d.BankDropdownList
          : [];

        // Set all states
        setEmpTypes(extractedEmpTypes);
        setGroupTypes(extractedGroupTypes);
        setDepartments(extractedDepartments);
        setDesignations(extractedDesignations);
        setGrades(extractedGrades);
        // Set religions (API is now returning data correctly)
        setReligions(extractedReligions);

        // Set caste categories (API is now returning data correctly)
        setCasteCategories(extractedCasteCategories);

        // Set castes (API is now returning data correctly)
        setCastes(extractedCastes);
        setGenders(extractedGenders);
        setMaritalStatuses(extractedMaritalStatuses);
        setSpecialisations(extractedSpecialisations);
        setBanks(extractedBanks);

        // Detailed logging
        console.log("=== Extracted Dropdown Counts ===");
        console.log("empTypes:", extractedEmpTypes.length);
        console.log("groupTypes:", extractedGroupTypes.length);
        console.log("departments:", extractedDepartments.length);
        console.log("designations:", extractedDesignations.length);
        console.log("grades:", extractedGrades.length);
        console.log("religions:", extractedReligions.length);
        console.log("casteCategories:", extractedCasteCategories.length);
        console.log("castes:", extractedCastes.length);
        console.log("genders:", extractedGenders.length);
        console.log("maritalStatuses:", extractedMaritalStatuses.length);
        console.log("specialisations:", extractedSpecialisations.length);
        console.log("banks:", extractedBanks.length);

        // ===== DEBUG: Log ALL dropdown structures =====
        console.log("=== ALL DROPDOWN SAMPLE STRUCTURES ===");

        if (extractedEmpTypes.length > 0) {
          console.log("Sample empType:", extractedEmpTypes[0]);
          console.log("EmpType keys:", Object.keys(extractedEmpTypes[0]));
        }

        if (extractedGroupTypes.length > 0) {
          console.log("Sample groupType:", extractedGroupTypes[0]);
          console.log("GroupType keys:", Object.keys(extractedGroupTypes[0]));
        }

        if (extractedDepartments.length > 0) {
          console.log("Sample department:", extractedDepartments[0]);
          console.log("Department keys:", Object.keys(extractedDepartments[0]));
        }

        if (extractedDesignations.length > 0) {
          console.log("Sample designation:", extractedDesignations[0]);
          console.log(
            "Designation keys:",
            Object.keys(extractedDesignations[0])
          );
        }

        if (extractedGrades.length > 0) {
          console.log("Sample grade:", extractedGrades[0]);
          console.log("Grade keys:", Object.keys(extractedGrades[0]));
        }

        if (extractedReligions.length > 0) {
          console.log("Sample religion:", extractedReligions[0]);
          console.log("Religion keys:", Object.keys(extractedReligions[0]));
        }

        if (extractedCasteCategories.length > 0) {
          console.log("Sample caste category:", extractedCasteCategories[0]);
          console.log(
            "CasteCategory keys:",
            Object.keys(extractedCasteCategories[0])
          );
        }

        if (extractedCastes.length > 0) {
          console.log("Sample caste:", extractedCastes[0]);
          console.log("Caste keys:", Object.keys(extractedCastes[0]));
        }

        if (extractedGenders.length > 0) {
          console.log("Sample gender:", extractedGenders[0]);
          console.log("Gender keys:", Object.keys(extractedGenders[0]));
        }

        if (extractedMaritalStatuses.length > 0) {
          console.log("Sample marital status:", extractedMaritalStatuses[0]);
          console.log(
            "MaritalStatus keys:",
            Object.keys(extractedMaritalStatuses[0])
          );
        }

        if (extractedSpecialisations.length > 0) {
          console.log("Sample specialisation:", extractedSpecialisations[0]);
          console.log(
            "Specialisation keys:",
            Object.keys(extractedSpecialisations[0])
          );
        }

        if (extractedBanks.length > 0) {
          console.log("Sample bank:", extractedBanks[0]);
          console.log("Bank keys:", Object.keys(extractedBanks[0]));
        }

        console.log("=== END DROPDOWN STRUCTURES ===");

        // Extract and map employee list from API
        const apiEmployeeList = Array.isArray(d.employeedetailList)
          ? d.employeedetailList
          : [];
        console.log("=== Employee List from API ===");
        console.log("Total employees:", apiEmployeeList.length);

        if (apiEmployeeList.length > 0) {
          console.log("Sample employee:", apiEmployeeList[0]);

          // Map API employees to local Employee interface
          const mappedEmployees: Employee[] = apiEmployeeList.map(
            (emp: any, index: number) => ({
              id: emp.HRME_Id || index + 1,
              createdAt: new Date().toISOString(),

              // Employee Tab
              nameOfEmployee:
                [
                  emp.HRME_EmployeeFirstName,
                  emp.HRME_EmployeeMiddleName,
                  emp.HRME_EmployeeLastName,
                ]
                  .filter(Boolean)
                  .join(" ") || "",
              firstName: emp.HRME_EmployeeFirstName || "",
              middleName: emp.HRME_EmployeeMiddleName || "",
              lastName: emp.HRME_EmployeeLastName || "",
              employeeCode: emp.HRME_EmployeeCode || "",
              fatherName: emp.HRME_FatherName || "",
              motherName: emp.HRME_MotherName || "",
              typeOfEmployment: emp.HRMET_Id?.toString() || "",
              employeeGroup: emp.HRMGT_Id?.toString() || "",
              school: emp.MI_Id?.toString() || "",
              designation: emp.HRMDES_Id?.toString() || "",
              subjectTaught: emp.HRME_SubjectsTaught || "",
              grade: emp.HRMG_Id?.toString() || "",
              dateOfJoining: emp.HRME_DOJ
                ? new Date(emp.HRME_DOJ).toISOString().split("T")[0]
                : "",
              dateOfConfirmation: emp.HRME_DOC
                ? new Date(emp.HRME_DOC).toISOString().split("T")[0]
                : "",
              epf: emp.HRME_EPFNotApplicableFlg === false,
              ppf: emp.HRME_FPFNotApplicableFlg === false,
              phdResearchGuide:
                emp.HRME_PHDResearchGuideFlg === "on" ||
                emp.HRME_PHDResearchGuideFlg === true,
              teachingNonTeaching: emp.HRME_TechNonTeachingFlg
                ? "Teaching"
                : "Non-Teaching",
              pfApplicable:
                emp.HRME_PFApplicableFlag === "on" ||
                emp.HRME_PFApplicableFlag === true,
              pfMaxAmount:
                emp.HRME_PFMaxFlag === "on" || emp.HRME_PFMaxFlag === true,
              pfFixedAmount:
                emp.HRME_PFFixedFlag === "on" || emp.HRME_PFFixedFlag === true,
              pfAccNo: emp.HRME_PFAccNo || "",
              uanNumber: emp.HRME_UINumber || "",
              pfDate: emp.HRME_PFDate
                ? new Date(emp.HRME_PFDate).toISOString().split("T")[0]
                : "",
              esiApplicable:
                emp.HRME_ESIApplicableFlag === "on" ||
                emp.HRME_ESIApplicableFlag === true,
              nationalSSN: emp.HRME_NationalSSN || "",
              religion: emp.ReligionId?.toString() || "",
              casteCategory: emp.CasteCategoryId?.toString() || "",
              caste: emp.CasteId?.toString() || "",
              dateOfBirth: emp.HRME_DOB
                ? new Date(emp.HRME_DOB).toISOString().split("T")[0]
                : "",
              dateOfRetirement: emp.HRME_ExpectedRetirementDate
                ? new Date(emp.HRME_ExpectedRetirementDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              gender: emp.IVRMMG_Id?.toString() || "",
              maritalStatus: emp.IVRMMMS_Id?.toString() || "",
              mobileNo: emp.HRME_MobileNo?.toString() || "",
              emailId: emp.HRME_EmailId || "",
              aadharNo: emp.HRME_AadharCardNo?.toString() || "",
              panCardNo: emp.HRME_PANCardNo || "",
              bloodGroup: emp.HRME_BloodGroup || "",
              salaryType: emp.HRME_SalaryType || "",
              modeOfPayment: emp.HRME_PaymentType || "",
              employeePhoto: emp.HRME_Photo || "",
              employerBankName: "",
              bankAccountNo: emp.HRME_BankAccountNo || "",

              // Address Tab
              contactAddress: emp.HRME_LocStreet || "",
              contactArea: emp.HRME_LocArea || "",
              contactCountry: emp.HRME_LocCountryId?.toString() || "",
              contactState: emp.HRME_LocStateId?.toString() || "",
              contactCity: emp.HRME_LocCity || "",
              contactPincode: emp.HRME_LocPincode?.toString() || "",
              permanentAddress: emp.HRME_PerStreet || "",
              permanentArea: emp.HRME_PerArea || "",
              permanentCountry: emp.HRME_PerCountryId?.toString() || "",
              permanentState: emp.HRME_PerStateId?.toString() || "",
              permanentCity: emp.HRME_PerCity || "",
              permanentPincode: emp.HRME_PerPincode?.toString() || "",
              sameAsCommunicationAddress: false,

              // Qualification Tab
              qualificationSerialNo: "",
              qualification: "",
              course: "",
              college: "",
              university: "",
              yearOfPassing: "",
              qualificationCountry: "",
              qualificationState: "",
              registrationNo: "",
              result: "",
              cgpaOrPercentage: "",
              cgpa: "",
              percentage: "",
              areaOfSpecialization: "",
              phd: false,
              phdDetails: "",
              medicalCouncil: "",
              thesisTitle: "",
              registrationYear: "",
              guideName: "",
              specialization: "",
              qualifiedDate: "",
              qualificationDetails: [],

              // Experience Tab
              employeeHavingExperience: false,
              experienceSerialNo: "",
              organisationName: "",
              organisationAddress: "",
              experienceDepartment: "",
              experienceDesignation: "",
              dateOfJoiningExp: "",
              dateOfLeaving: emp.HRME_DOL
                ? new Date(emp.HRME_DOL).toISOString().split("T")[0]
                : "",
              noOfYears: "",
              noOfMonths: "",
              lastDrawnSalary: "",
              reasonForLeavingExp: emp.HRME_LeavingReason || "",

              // Upload Document Tab
              documentSerialNo: "",
              nameOfDocument: "",
              documentDescription: "",
              document: "",

              // Medical Record Tab
              employeeHeight: emp.HRME_Height || "",
              employeeHeightUnit: emp.HRME_HeightUOM || "",
              employeeWeight: emp.HRME_Weight?.toString() || "",
              employeeWeightUnit: emp.HRME_WeightUOM || "",
              eyeSightIssue: emp.HRME_EyeSightIssue || "",
              anyHealthIssue: emp.HRME_AnyHealthIssue || "",
              identificationMark: emp.HRME_IdentificationMark || "",

              // Other Details Tab
              biometricCode: emp.HRME_BiometricCode || "",
              rfCardId: emp.HRME_RFCardId || "",
              msTeamsUserName: "",
              msTeamsPassword: "",
              punchRelaxation: emp.HRME_ExcPunch || false,
              stopPension: emp.HRME_PensionStoppedDate ? true : false,
              employeeLeft: emp.HRME_LeftFlag || false,

              // Payroll fields
              earnings: "",
              earningsActualPercent: "",
              earningsApplicablePercent: "",
              earningsAmount: "",
              earningsMaxAmount: "",
              earningsDetails: "",
              earningsAction: false,
              deductions: "",
              deductionsActualPercent: "",
              deductionsApplicablePercent: "",
              deductionsAmount: "",
              deductionsMaxAmount: "",
              deductionsDetails: "",
              deductionsAction: false,
              arrearHead: "",
              arrearActualPercent: "",
              arrearApplicablePercent: "",
              arrearAmount: "",
              arrearDetails: "",
              arrearAction: false,
            })
          );

          console.log("Mapped employees to table:", mappedEmployees.length);

          // Save mapped employees to localStorage
          try {
            // Clear existing data first
            employeeDB.clear();

            // Save each employee to localStorage directly using the internal storage
            const storageKey = `localdb_employee:register`;

            // Map employees to the format without id and createdAt for create
            const employeesToSave = mappedEmployees.map((employee) => {
              const { id, createdAt, ...employeeData } = employee;

              // For existing employees from API, use the API ID
              const finalId = id;
              const finalCreatedAt = createdAt;

              return {
                ...employeeData,
                id: finalId,
                createdAt: finalCreatedAt,
              };
            });

            // Save directly to localStorage
            localStorage.setItem(storageKey, JSON.stringify(employeesToSave));

            console.log(
              "Saved employees to localStorage:",
              employeesToSave.length
            );
          } catch (dbError) {
            console.error("Error saving to localStorage:", dbError);
          }
        }

        toast.success(
          `Loaded: EmpTypes(${extractedEmpTypes.length}), Groups(${extractedGroupTypes.length}), Depts(${extractedDepartments.length}), Desigs(${extractedDesignations.length}), Employees(${apiEmployeeList.length})`
        );

        // After syncing API data to IndexedDB, load employees from IndexedDB
        loadEmployees();
      } else {
        console.error("API call failed or returned no data");
        console.error("Response:", res);
        toast.error(
          res.message || "Failed to load dropdowns - check console for details"
        );
        // Even if API fails, try to load from IndexedDB
        loadEmployees();
      }
    } catch (err: any) {
      console.error("=== Error Loading Dropdowns ===");
      console.error("Error:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      toast.error(
        err.message || "Failed to load dropdowns - check console for details"
      );
      // Even if API fails, try to load from IndexedDB
      loadEmployees();
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = () => {
    try {
      setEmployees(employeeDB.list());
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setActiveTab("employee");
    reset();
    // Scroll to form after state update
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
    setSelectedPhoto(null);
    setPhotoFile(null);
    reset();
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setPhotoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      toast.success("Photo uploaded successfully");
    }
  };

  const onSubmit: SubmitHandler<EmployeeForm> = async (data: EmployeeForm) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form data:", data);
    console.log("Form errors:", errors);
    console.log("Is submitting:", isSubmitting);
    console.log("Active tab:", activeTab);

    try {
      // Different API based on active tab
      if (activeTab === "employee") {
        await handleEmployeeTabSubmit(data);
      } else if (activeTab === "address") {
        await handleAddressTabSubmit(data);
      } else if (activeTab === "qualification") {
        await handleQualificationTabSubmit(data);
      } else if (activeTab === "experience") {
        await handleExperienceTabSubmit(data);
      } else if (activeTab === "upload-document") {
        await handleDocumentTabSubmit(data);
      } else if (activeTab === "medical-record") {
        await handleMedicalTabSubmit(data);
      } else if (activeTab === "other-details") {
        await handleOtherTabSubmit(data);
      } else if (activeTab === "payroll") {
        await handlePayrollTabSubmit(data);
      } else {
        // For other tabs, use the old API for now
        await handleGeneralSubmit(data);
      }
    } catch (error: any) {
      console.error("Error submitting employee:", error);
      toast.error(error.message || "Operation failed");
    }
  };

  // Handle Employee tab submission - DO NOT SAVE here, just move to Address
  const handleEmployeeTabSubmit = async (data: EmployeeForm) => {
    const firstName = data.firstName || "";
    const middleName = data.middleName || "";
    const lastName = data.lastName || "";

    // Map form data to the new Employee Personal Details API structure
    const payload: any = {
      MI_Id: 30,
      Employeedto: {
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: editingId || 0,
        MI_Id: 30,
        HRMET_Id: data.typeOfEmployment ? parseInt(data.typeOfEmployment) : 0,
        HRMGT_Id: data.employeeGroup ? parseInt(data.employeeGroup) : 0,
        HRMD_Id: 0,
        HRMDES_Id: data.designation ? parseInt(data.designation) : 0,
        HRMG_Id: data.grade ? parseInt(data.grade) : 0,
        HRME_EmployeeFirstName: firstName,
        HRME_EmployeeMiddleName: middleName || null,
        HRME_EmployeeLastName: lastName || null,
        HRME_EmployeeCode: data.employeeCode || null,
        HRME_BiometricCode: data.biometricCode || null,
        HRME_RFCardId: data.rfCardId || null,
        HRME_PerStreet: data.permanentAddress || null,
        HRME_PerArea: data.permanentArea || null,
        HRME_PerCity: data.permanentCity || null,
        HRME_PerAdd4: null,
        HRME_PerStateId: data.permanentState
          ? parseInt(data.permanentState)
          : 0,
        HRME_PerCountryId: data.permanentCountry
          ? parseInt(data.permanentCountry)
          : 0,
        HRME_PerPincode: data.permanentPincode
          ? parseInt(data.permanentPincode)
          : 0,
        HRME_LocStreet: data.contactAddress || null,
        HRME_LocArea: data.contactArea || null,
        HRME_LocCity: data.contactCity || null,
        HRME_LocAdd4: null,
        HRME_LocStateId: data.contactState ? parseInt(data.contactState) : 0,
        HRME_LocCountryId: data.contactCountry
          ? parseInt(data.contactCountry)
          : 0,
        HRME_LocPincode: data.contactPincode
          ? parseInt(data.contactPincode)
          : 0,
        IVRMMMS_Id: data.maritalStatus ? parseInt(data.maritalStatus) : 0,
        IVRMMG_Id: data.gender ? parseInt(data.gender) : 0,
        CasteCategoryId: data.casteCategory ? parseInt(data.casteCategory) : 0,
        CasteId: data.caste ? parseInt(data.caste) : 0,
        ReligionId: data.religion ? parseInt(data.religion) : 0,
        HRME_FatherName: data.fatherName || null,
        HRME_MotherName: data.motherName || null,
        HRME_SpouseName: null,
        HRME_SpouseOccupation: null,
        HRME_SpouseMobileNo: 0,
        HRME_SpouseEmailId: null,
        HRME_SpouseAddress: null,
        HRME_DOB: data.dateOfBirth || null,
        HRME_DOJ: data.dateOfJoining || null,
        HRME_ExpectedRetirementDate: data.dateOfRetirement || null,
        HRME_PFDate: data.pfDate || null,
        HRME_ESIDate: null,
        HRME_MobileNo: data.mobileNo ? parseInt(data.mobileNo) : 0,
        HRME_EmailId: data.emailId || null,
        HRME_BloodGroup: data.bloodGroup || null,
        HRME_PaymentType: data.modeOfPayment || null,
        HRME_BankAccountNo: data.bankAccountNo || null,
        HRME_PFApplicableFlag: !!(
          data.pfApplicable || (data.pfApplicable as any) === "on"
        ),
        HRME_PFMaxFlag: !!(
          data.pfMaxAmount || (data.pfMaxAmount as any) === "on"
        ),
        HRME_PFFixedFlag: !!(
          data.pfFixedAmount || (data.pfFixedAmount as any) === "on"
        ),
        HRME_PFAccNo: data.pfAccNo || null,
        HRME_ESIAccNo: null,
        HRME_GratuityAccNo: null,
        HRME_ESIApplicableFlag: !!(
          data.esiApplicable || (data.esiApplicable as any) === "on"
        ),
        HRME_Photo: data.employeePhoto || selectedPhoto || null,
        HRME_LeftFlag: !!(
          data.employeeLeft || (data.employeeLeft as any) === "on"
        ),
        HRME_DOC: data.dateOfConfirmation || null,
        HRME_DOL: data.dateOfLeaving || null,
        HRME_LeavingReason: data.reasonForLeavingExp || null,
        HRME_Height: data.employeeHeight || null,
        HRME_HeightUOM: data.employeeHeightUnit || null,
        HRME_Weight: data.employeeWeight ? parseFloat(data.employeeWeight) : 0,
        HRME_WeightUOM: data.employeeWeightUnit || null,
        HRME_IdentificationMark: data.identificationMark || null,
        HRME_ApprovalNo: null,
        HRME_PANCardNo: data.panCardNo || null,
        HRME_AadharCardNo: data.aadharNo ? parseInt(data.aadharNo) : 0,
        HRME_SubstituteFlag: false,
        HRME_NationalSSN: data.nationalSSN || null,
        HRME_SalaryType: data.salaryType || null,
        HRME_EmployeeOrder: 0,
        HRME_ActiveFlag: !(
          data.employeeLeft || (data.employeeLeft as any) === "on"
        ),
        HRME_SubjectsTaught: data.subjectTaught || null,
        HRME_UINumber: data.uanNumber || null,
        HRME_AnyHealthIssue: data.anyHealthIssue || null,
        HRME_EyeSightIssue: data.eyeSightIssue || null,
        HRME_TransfferedTo: 0,
        HRME_RecordTransferredFlg: false,
        HRME_PHDResearchGuideFlg: !!(
          data.phdResearchGuide || (data.phdResearchGuide as any) === "on"
        ),
        HRME_TechNonTeachingFlg:
          data.teachingNonTeaching === "Teaching" ? "Teaching" : "NonTeaching",
        HRME_RGRecognitionYear: 0,
        HRME_ExcPunch: !!(
          data.punchRelaxation || (data.punchRelaxation as any) === "on"
        ),
        HRME_RetiredFlg: false,
        HRME_PensionStoppedDate: data.stopPension
          ? new Date().toISOString()
          : null,
        HRME_FPFNotApplicableFlg: !!(data.ppf || (data.ppf as any) === "on"),
        HRME_EPFNotApplicableFlg: !!(data.epf || (data.epf as any) === "on"),
        HRME_AllowSoftwareAccessFlg: false,
        employeedetailList: [],
        experienceDetails: [],
        qualificationDetails: data.qualificationDetails || [],
        documentList: [],
      },
      mobile_list_dto: [],
      email_list_dto: [],
      employeebankDTO: [],
    };

    console.log("=== Submitting Employee Personal Details ===");
    console.log("API payload:", payload);

    // Skip API call here per new requirement
    setActiveTab("address");
    toast.info("Proceed to Address tab to save Personal Details.");
  };

  // Handle Address tab submission
  const handleAddressTabSubmit = async (data: EmployeeForm) => {
    const firstName = data.firstName || "";
    const middleName = data.middleName || "";
    const lastName = data.lastName || "";

    // Build flat payload for SavePersonalDetails
    const now = new Date().toISOString();
    const payload: any = {
      CreatedDate: now,
      UpdatedDate: now,
      HRME_Id: editingId || 0,
      MI_Id: 30,
      HRMET_Id: data.typeOfEmployment ? parseInt(data.typeOfEmployment) : 0,
      HRMGT_Id: data.employeeGroup ? parseInt(data.employeeGroup) : 0,
      HRMD_Id: 0,
      HRMDES_Id: data.designation ? parseInt(data.designation) : 0,
      HRMG_Id: data.grade ? parseInt(data.grade) : 0,
      HRME_EmployeeFirstName: firstName,
      HRME_EmployeeMiddleName: middleName || "",
      HRME_EmployeeLastName: lastName || "",
      HRME_EmployeeCode: data.employeeCode || "",
      HRME_BiometricCode: data.biometricCode || "",
      HRME_RFCardId: data.rfCardId || "",
      HRME_PerStreet: data.permanentAddress || "",
      HRME_PerArea: data.permanentArea || "",
      HRME_PerCity: data.permanentCity || "",
      HRME_PerAdd4: "",
      HRME_PerStateId: data.permanentState ? parseInt(data.permanentState) : 0,
      HRME_PerCountryId: data.permanentCountry
        ? parseInt(data.permanentCountry)
        : 0,
      HRME_PerPincode: data.permanentPincode
        ? parseInt(data.permanentPincode)
        : 0,
      HRME_LocStreet: data.contactAddress || "",
      HRME_LocArea: data.contactArea || "",
      HRME_LocCity: data.contactCity || "",
      HRME_LocAdd4: "",
      HRME_LocStateId: data.contactState ? parseInt(data.contactState) : 0,
      HRME_LocCountryId: data.contactCountry
        ? parseInt(data.contactCountry)
        : 0,
      HRME_LocPincode: data.contactPincode ? parseInt(data.contactPincode) : 0,
      IVRMMMS_Id: data.maritalStatus ? parseInt(data.maritalStatus) : 0,
      IVRMMG_Id: data.gender ? parseInt(data.gender) : 0,
      CasteCategoryId: data.casteCategory ? parseInt(data.casteCategory) : 0,
      CasteId: data.caste ? parseInt(data.caste) : 0,
      ReligionId: data.religion ? parseInt(data.religion) : 0,
      HRME_FatherName: data.fatherName || "",
      HRME_MotherName: data.motherName || "",
      HRME_SpouseName: "",
      HRME_SpouseOccupation: "",
      HRME_SpouseMobileNo: 0,
      HRME_SpouseEmailId: "",
      HRME_SpouseAddress: "",
      HRME_DOB: data.dateOfBirth || now,
      HRME_DOJ: data.dateOfJoining || now,
      HRME_ExpectedRetirementDate: data.dateOfRetirement || now,
      HRME_PFDate: data.pfDate || now,
      HRME_ESIDate: now,
      HRME_MobileNo: data.mobileNo ? parseInt(data.mobileNo) : 0,
      HRME_EmailId: data.emailId || "",
      HRME_BloodGroup: data.bloodGroup || "",
      HRME_PaymentType: data.modeOfPayment || "",
      HRME_BankAccountNo: data.bankAccountNo || "",
      HRME_PFApplicableFlag: !!(
        data.pfApplicable || (data.pfApplicable as any) === "on"
      ),
      HRME_PFMaxFlag: !!(
        data.pfMaxAmount || (data.pfMaxAmount as any) === "on"
      ),
      HRME_PFFixedFlag: !!(
        data.pfFixedAmount || (data.pfFixedAmount as any) === "on"
      ),
      HRME_PFAccNo: data.pfAccNo || "",
      HRME_ESIAccNo: "",
      HRME_GratuityAccNo: "",
      HRME_ESIApplicableFlag: !!(
        data.esiApplicable || (data.esiApplicable as any) === "on"
      ),
      HRME_Photo: data.employeePhoto || selectedPhoto || "",
      HRME_LeftFlag: !!(
        data.employeeLeft || (data.employeeLeft as any) === "on"
      ),
      HRME_DOL: data.dateOfLeaving || now,
      HRME_LeavingReason: data.reasonForLeavingExp || "",
      HRME_Height: data.employeeHeight || "",
      HRME_HeightUOM: data.employeeHeightUnit || "",
      HRME_Weight: data.employeeWeight ? parseFloat(data.employeeWeight) : 0,
      HRME_WeightUOM: data.employeeWeightUnit || "",
      HRME_IdentificationMark: data.identificationMark || "",
      HRME_ApprovalNo: "",
      HRME_PANCardNo: data.panCardNo || "",
      HRME_AadharCardNo: data.aadharNo ? parseInt(data.aadharNo) : 0,
      HRME_SubstituteFlag: true,
      HRME_NationalSSN: data.nationalSSN || "",
      HRME_SalaryType: data.salaryType || "",
      HRME_EmployeeOrder: 0,
      HRME_ActiveFlag: !(
        data.employeeLeft || (data.employeeLeft as any) === "on"
      ),
      HRME_UINumber: data.uanNumber || "",
      HRME_DOC: data.dateOfConfirmation || now,
      HRME_SubjectsTaught: data.subjectTaught || "",
      HRME_AppDownloadedDeviceId: "",
      HRME_PHDResearchGuideFlg: !!(
        data.phdResearchGuide || (data.phdResearchGuide as any) === "on"
      ),
      HRME_TechNonTeachingFlg:
        data.teachingNonTeaching === "Teaching" ? "Teaching" : "NonTeaching",
      HRME_RGRecognitionYear: 0,
      HRME_AnyHealthIssue: data.anyHealthIssue || "",
      HRME_EyeSightIssue: data.eyeSightIssue || "",
      HRME_TransfferedTo: 0,
      HRME_RecordTransferredFlg: false,
      HRME_MSTeamsUserId: "",
      HRME_MSTeamsEmailId: "",
      HRME_MSTeamsPassword: "",
      HRME_ExcPunch: !!(
        data.punchRelaxation || (data.punchRelaxation as any) === "on"
      ),
      HRME_RetiredFlg: false,
      HRME_PensionStoppedDate: now,
      HRME_FPFNotApplicableFlg: !!(data.ppf || (data.ppf as any) === "on"),
      HRME_EPFNotApplicableFlg: !!(data.epf || (data.epf as any) === "on"),
      HRME_AllowSoftwareAccessFlg: false,
    };

    console.log("=== Submitting SavePersonalDetails (Address tab) ===");
    console.log("API payload:", payload);

    const response = await savePersonalDetails(payload);

    if (response.success) {
      toast.success(response.message || "Personal details saved successfully");

      // Store the HRME_Id for subsequent tab saves
      if (response.data?.HRME_Id) {
        setEditingId(response.data.HRME_Id);
      }

      // Move to next tab or reload
      if (activeTab === "address") {
        setActiveTab("qualification");
        toast.info(
          "Personal details saved. Please proceed to Qualification tab."
        );
      } else {
        await loadOnloadDropdowns();
      }
    } else {
      toast.error(response.message || "Failed to save address details");
    }
  };

  // Handle Qualification tab submission
  const handleQualificationTabSubmit = async (data: EmployeeForm) => {
    // Map qualification details from form data
    const qualificationDetails = data.qualificationDetails || [];

    if (!qualificationDetails || qualificationDetails.length === 0) {
      toast.error("Please add at least one qualification");
      return;
    }

    // Map form data to the new simplified API structure
    const qualifications: SaveQualificationRequest[] = qualificationDetails.map(
      (qual: any) => {
        // Get the current date for HRMEQ_Date if not provided
        const currentDate = new Date().toISOString();
        const qualificationDate =
          qual.qualificationDate && qual.qualificationDate.trim() !== ""
            ? qual.qualificationDate
            : currentDate; // Use current date instead of null

        return {
          HRMEQ_Id: qual.id ? parseInt(qual.id) : 0,
          MI_Id: 30,
          HRMC_Id: qual.courseId ? parseInt(qual.courseId) : 0,
          HRME_Id: editingId ? parseInt(editingId.toString()) : 0,
          HRME_QualificationName: qual.qualificationName || "N/A",
          HRMEQ_CollegeName: qual.collegeName || "N/A",
          HRMEQ_UniversityName: qual.universityName || "N/A",
          HRMEQ_YearOfPassing:
            qual.yearOfPassing && qual.yearOfPassing.toString().trim() !== ""
              ? parseInt(qual.yearOfPassing.toString())
              : 0,
          HRMEQ_RegistrationNo: qual.registrationNo || "N/A",
          HRMEQ_Result: qual.result || "N/A",
          HRMEQ_CGPAOrPerFlag: qual.cgpaOrPerFlag || "Percentage",
          HRMEQ_CGPA: qual.cgpa || "",
          HRMEQ_Percentage: qual.percentage || "",
          HRMEQ_AreaOfSpecialisation: qual.areaOfSpecialisation || "N/A",
          HRMEQ_MedicalCouncil: qual.medicalCouncil || "N/A",
          HRMEQ_Date: qualificationDate,
          HRMEQ_Hardcopy: qual.hardcopy || "",
          retrunMsg: "string", // Add missing field as per API requirement
          HRMEQ_PHDFlg: qual.isPHD || false,
          HRMEQ_StateId: qual.stateId ? parseInt(qual.stateId.toString()) : 0,
          HRMEQ_CountryId: qual.countryId
            ? parseInt(qual.countryId.toString())
            : 0,
          HRMEQ_ThesisTitle: qual.thesisTitle || "N/A",
          HRMEQ_RegistrationYear:
            qual.registrationYear &&
            qual.registrationYear.toString().trim() !== ""
              ? parseInt(qual.registrationYear.toString())
              : 0,
          HRMEQ_GuideName: qual.guideName || "N/A",
          CreatedDate: currentDate,
          UpdatedDate: currentDate,
        };
      }
    );

    console.log(
      "=== Submitting Employee Qualification Details (New Endpoint) ==="
    );
    console.log("Qualifications:", JSON.stringify(qualifications, null, 2));

    const response = await saveQualification(qualifications);

    if (response.success) {
      toast.success("Qualification details saved successfully");

      // Move to next tab or reload
      if (activeTab === "qualification") {
        setActiveTab("experience");
        toast.info(
          "Qualification details saved. Please proceed to Experience tab."
        );
        // Reload onload dropdowns after moving to next tab
        await loadOnloadDropdowns();
      } else {
        await loadOnloadDropdowns();
      }
    } else {
      toast.error(response.message || "Failed to save qualification details");
    }
  };

  // Handle Experience tab submission
  const handleExperienceTabSubmit = async (data: EmployeeForm) => {
    // Map experience details from form data
    const experienceDetails = data.experienceDetails || [];

    // Map form data to the Employee Experience Details API structure
    const payload: EmployeeExperienceDetailsRequest = {
      MI_Id: 30,
      Employeedto: {
        // Basic employee info needed for the API
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: editingId || 0,
        MI_Id: 30,
      },
      EmployeeExperienceDTO: experienceDetails.map((exp: any) => ({
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMEE_Id: exp.id ? parseInt(exp.id.toString()) : 0,
        MI_Id: 30,
        HRME_Id: editingId ? parseInt(editingId.toString()) : 0,
        HRMEE_OrganisationName: exp.organisationName || "",
        HRMEE_OrganisationAddress: exp.organisationAddress || "",
        HRMEE_Department: exp.department || "",
        HRMEE_Designation: exp.designation || "",
        HRMEE_JoinDate:
          exp.joinDate && exp.joinDate.trim() !== "" ? exp.joinDate : null,
        HRMEE_ExitDate:
          exp.exitDate && exp.exitDate.trim() !== "" ? exp.exitDate : null,
        HRMEE_NoOfYears:
          exp.noOfYears && exp.noOfYears.toString().trim() !== ""
            ? parseInt(exp.noOfYears.toString())
            : 0,
        HRMEE_NoOfMonths:
          exp.noOfMonths && exp.noOfMonths.toString().trim() !== ""
            ? parseInt(exp.noOfMonths.toString())
            : 0,
        HRMEE_AnnualSalary:
          exp.annualSalary && exp.annualSalary.toString().trim() !== ""
            ? parseFloat(exp.annualSalary.toString())
            : 0,
        HRMEE_ReasonForLeaving: exp.reasonForLeaving || "",
      })),
    };

    console.log("=== Submitting Employee Experience Details ===");
    console.log("API payload:", payload);

    const response = await addUpdateEmployeeExperienceDetails(payload);

    if (response.success) {
      toast.success(
        response.message || "Experience details saved successfully"
      );

      // Store the HRME_Id for subsequent tab saves
      if (response.data?.HRME_Id) {
        setEditingId(response.data.HRME_Id);
      }

      // Move to next tab or reload
      if (activeTab === "experience") {
        setActiveTab("document");
        toast.info("Experience details saved. Please proceed to Document tab.");
      } else {
        await loadOnloadDropdowns();
      }
    } else {
      toast.error(response.message || "Failed to save experience details");
    }
  };

  // Handle Document tab submission
  const handleDocumentTabSubmit = async (data: EmployeeForm) => {
    // Map document details from form data
    const documentDetails = data.documentList || [];

    // Map form data to the Employee Document Details API structure
    const payload: EmployeeDocumentDetailsRequest = {
      MI_Id: 30,
      Employeedto: {
        // Basic employee info needed for the API
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: editingId || 0,
        MI_Id: 30,
      },
      EmployeeDocumentDTO: documentDetails.map((doc: any) => ({
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRMEDS_Id: doc.id || 0,
        MI_Id: 30,
        HRME_Id: editingId || 0,
        HRMEDS_DocumentName: doc.documentName || "",
        HRMEDS_DocumentImageName: doc.documentImageName || "",
        HRMEDS_DucumentDescription: doc.documentDescription || "",
      })),
    };

    console.log("=== Submitting Employee Document Details ===");
    console.log("API payload:", payload);

    const response = await addUpdateEmployeeDocumentDetails(payload);

    if (response.success) {
      toast.success(response.message || "Document details saved successfully");

      // Store the HRME_Id for subsequent tab saves
      if (response.data?.HRME_Id) {
        setEditingId(response.data.HRME_Id);
      }

      // Move to next tab or reload
      if (activeTab === "document") {
        setActiveTab("medical");
        toast.info(
          "Document details saved. Please proceed to Medical Record tab."
        );
      } else {
        await loadOnloadDropdowns();
      }
    } else {
      toast.error(response.message || "Failed to save document details");
    }
  };

  // Handle Medical tab submission
  const handleMedicalTabSubmit = async (data: EmployeeForm) => {
    // Map medical details from form data
    const payload: EmployeeMedicalDetailsRequest = {
      MI_Id: 30,
      Employeedto: {
        // Basic employee info needed for the API
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: editingId || 0,
        MI_Id: 30,
      },
      HRME_Height: data.employeeHeight
        ? parseFloat(data.employeeHeight)
        : undefined,
      HRME_HeightUOM: data.employeeHeightUnit,
      HRME_Weight: data.employeeWeight
        ? parseFloat(data.employeeWeight)
        : undefined,
      HRME_WeightUOM: data.employeeWeightUnit,
      HRME_IdentificationMark: data.identificationMark,
      HRME_EyeSightIssue:
        data.eyeSightIssue === "true" ||
        data.eyeSightIssue === "Yes" ||
        data.eyeSightIssue === "1",
      HRME_AnyHealthIssue:
        data.anyHealthIssue === "true" ||
        data.anyHealthIssue === "Yes" ||
        data.anyHealthIssue === "1",
    };

    console.log("=== Submitting Employee Medical Details ===");
    console.log("API payload:", payload);

    const response = await addUpdateEmployeeMedicalDetails(payload);

    if (response.success) {
      toast.success(response.message || "Medical details saved successfully");

      // Store the HRME_Id for subsequent tab saves
      if (response.data?.HRME_Id) {
        setEditingId(response.data.HRME_Id);
      }

      // Reload data after save
      await loadOnloadDropdowns();
    } else {
      toast.error(response.message || "Failed to save medical details");
    }
  };

  // Handle Other Details tab submission
  const handleOtherTabSubmit = async (data: EmployeeForm) => {
    // Map other details from form data
    const payload: EmployeeOtherDetailsRequest = {
      MI_Id: 30,
      Employeedto: {
        // Basic employee info needed for the API
        CreatedDate: new Date().toISOString(),
        UpdatedDate: new Date().toISOString(),
        HRME_Id: editingId || 0,
        MI_Id: 30,
        HRME_BiometricCode: data.biometricCode,
        HRME_RFCardId: data.rfCardId,
        HRME_MSTeamsUserId: data.msTeamsUserName,
        HRME_MSTeamsEmailId: data.msTeamsPassword,
        HRME_ExcPunch: data.punchRelaxation,
        HRME_RetiredFlg: data.stopPension,
        HRME_LeftFlag: data.employeeLeft,
      },
      HRME_DOC: data.dateOfConfirmation,
      HRME_RetiredFlg: data.stopPension,
    };

    console.log("=== Submitting Employee Other Details ===");
    console.log("API payload:", payload);

    const response = await addUpdateEmployeeOtherDetails(payload);

    if (response.success) {
      toast.success(response.message || "Other details saved successfully");

      // Store the HRME_Id for subsequent tab saves
      if (response.data?.HRME_Id) {
        setEditingId(response.data.HRME_Id);
      }

      // Reload data after save
      await loadOnloadDropdowns();
    } else {
      toast.error(response.message || "Failed to save other details");
    }
  };

  // Handle Payroll tab submission
  const handlePayrollTabSubmit = async (data: EmployeeForm) => {
    // This will handle all three payroll sub-APIs (Earning, Deduction, Arrear)
    // Since the form might have multiple entries for each type, we need to collect them

    const firstName = data.firstName || "";
    const middleName = data.middleName || "";
    const lastName = data.lastName || "";

    // Build the common Employee DTO structure
    const commonEmployeedto = {
      CreatedDate: new Date().toISOString(),
      UpdatedDate: new Date().toISOString(),
      HRME_Id: editingId || 0,
      MI_Id: 30,
      HRMET_Id: data.typeOfEmployment ? parseInt(data.typeOfEmployment) : 0,
      HRMGT_Id: data.employeeGroup ? parseInt(data.employeeGroup) : 0,
      HRMD_Id: 0,
      HRMDES_Id: data.designation ? parseInt(data.designation) : 0,
      HRMG_Id: data.grade ? parseInt(data.grade) : 0,
      HRME_EmployeeFirstName: firstName,
      HRME_EmployeeMiddleName: middleName || "",
      HRME_EmployeeLastName: lastName || "",
      HRME_EmployeeCode: data.employeeCode || "",
      HRME_BiometricCode: data.biometricCode || "",
      HRME_RFCardId: data.rfCardId || "",
      // ... we can add more fields as needed from the form
      HRME_ActiveFlag: !data.employeeLeft,
      HRME_EmployeeOrder: 0,
      employeedetailList: [],
      experienceDetails: data.experienceDetails || [],
      qualificationDetails: data.qualificationDetails || [],
      documentList: data.documentList || [],
    };

    // Save Earning Details
    const earningDTO = Array.isArray(data.earningDetailsList)
      ? data.earningDetailsList
      : [];
    const earningPayload: EmployeeEarningDetailsRequest = {
      MI_Id: 30,
      Employeedto: commonEmployeedto,
      EarningDTO: earningDTO,
    };

    console.log("=== Submitting Payroll Details (Earning) ===");
    const earningResponse = await addUpdateEmployeeEarningDetails(
      earningPayload
    );

    if (!earningResponse.success) {
      toast.error(earningResponse.message || "Failed to save earning details");
      return;
    }

    // Save Deduction Details
    const deductionDTO = Array.isArray(data.deductionDetailsList)
      ? data.deductionDetailsList
      : [];
    const deductionPayload: EmployeeDeductionDetailsRequest = {
      MI_Id: 30,
      Employeedto: commonEmployeedto,
      DeductionDTO: deductionDTO,
    };

    console.log("=== Submitting Payroll Details (Deduction) ===");
    const deductionResponse = await addUpdateEmployeeDeductionDetails(
      deductionPayload
    );

    if (!deductionResponse.success) {
      toast.error(
        deductionResponse.message || "Failed to save deduction details"
      );
      return;
    }

    // Save Arrear Details
    const arrearDTO = Array.isArray(data.arrearDetailsList)
      ? data.arrearDetailsList
      : [];
    const arrearPayload: EmployeeArrearDetailsRequest = {
      MI_Id: 30,
      Employeedto: commonEmployeedto,
      ArrearDTO: arrearDTO,
    };

    console.log("=== Submitting Payroll Details (Arrear) ===");
    const arrearResponse = await addUpdateEmployeeArrearDetails(arrearPayload);

    if (!arrearResponse.success) {
      toast.error(arrearResponse.message || "Failed to save arrear details");
      return;
    }

    // If all three succeeded, show success
    toast.success("Payroll details saved successfully");

    // Store the HRME_Id if we got one
    if (earningResponse.data?.HRME_Id) {
      setEditingId(earningResponse.data.HRME_Id);
    }
  };

  // Handle general submission for other tabs (temporary)
  const handleGeneralSubmit = async (data: EmployeeForm) => {
    // Use separate name fields directly
    const firstName = data.firstName || "";
    const middleName = data.middleName || "";
    const lastName = data.lastName || "";

    // Map form data to API request structure
    const payload: EmployeeRegisterSaveRequest = {
      HRME_Id: editingId || 0,
      MI_Id: 30,
      LogInUserId: 0,

      // Employee basic details
      HRMET_Id: data.typeOfEmployment ? parseInt(data.typeOfEmployment) : null,
      HRMGT_Id: data.employeeGroup ? parseInt(data.employeeGroup) : null,
      HRMD_Id: null, // Department not in form
      HRMDES_Id: data.designation ? parseInt(data.designation) : null,
      HRMG_Id: data.grade ? parseInt(data.grade) : null,
      HRME_EmployeeFirstName: firstName,
      HRME_EmployeeMiddleName: middleName,
      HRME_EmployeeLastName: lastName,
      HRME_EmployeeCode: data.employeeCode,
      HRME_BiometricCode: data.biometricCode,
      HRME_RFCardId: data.rfCardId,

      // Personal details
      HRME_FatherName: data.fatherName,
      HRME_MotherName: data.motherName,
      HRME_DOB: data.dateOfBirth,
      HRME_DOJ: data.dateOfJoining,
      HRME_DOC: data.dateOfConfirmation,
      HRME_ExpectedRetirementDate: data.dateOfRetirement,
      HRME_MobileNo: data.mobileNo ? parseInt(data.mobileNo) : null,
      HRME_EmailId: data.emailId,
      HRME_BloodGroup: data.bloodGroup,

      // Gender, Religion, Caste
      IVRMMG_Id: data.gender ? parseInt(data.gender) : null,
      IVRMMMS_Id: data.maritalStatus ? parseInt(data.maritalStatus) : null,
      ReligionId: data.religion ? parseInt(data.religion) : null,
      CasteCategoryId: data.casteCategory ? parseInt(data.casteCategory) : null,
      CasteId: data.caste ? parseInt(data.caste) : null,

      // Permanent Address
      HRME_PerStreet: data.permanentAddress,
      HRME_PerArea: data.permanentArea,
      HRME_PerCity: data.permanentCity,
      HRME_PerStateId: data.permanentState
        ? parseInt(data.permanentState)
        : null,
      HRME_PerCountryId: data.permanentCountry
        ? parseInt(data.permanentCountry)
        : null,
      HRME_PerPincode: data.permanentPincode
        ? parseInt(data.permanentPincode)
        : null,

      // Local/Contact Address
      HRME_LocStreet: data.contactAddress,
      HRME_LocArea: data.contactArea,
      HRME_LocCity: data.contactCity,
      HRME_LocStateId: data.contactState ? parseInt(data.contactState) : null,
      HRME_LocCountryId: data.contactCountry
        ? parseInt(data.contactCountry)
        : null,
      HRME_LocPincode: data.contactPincode
        ? parseInt(data.contactPincode)
        : null,

      // PF & ESI details
      HRME_PFApplicableFlag: (data.pfApplicable ? "on" : "off") as any,
      HRME_PFMaxFlag: (data.pfMaxAmount ? "on" : "off") as any,
      HRME_PFFixedFlag: (data.pfFixedAmount ? "on" : "off") as any,
      HRME_PFAccNo: data.pfAccNo,
      HRME_UINumber: data.uanNumber,
      HRME_PFDate: data.pfDate,
      HRME_ESIApplicableFlag: (data.esiApplicable ? "on" : "off") as any,
      HRME_EPFNotApplicableFlg: !data.epf,
      HRME_FPFNotApplicableFlg: !data.ppf,

      // Employment details
      HRME_SubjectsTaught: data.subjectTaught,
      HRME_TechNonTeachingFlg: data.teachingNonTeaching === "Teaching",
      HRME_PHDResearchGuideFlg: (data.phdResearchGuide ? "on" : "off") as any,
      HRME_SalaryType: data.salaryType,
      HRME_PaymentType: data.modeOfPayment,
      HRME_BankAccountNo: data.bankAccountNo,

      // Identification
      HRME_PANCardNo: data.panCardNo,
      HRME_AadharCardNo: data.aadharNo ? parseInt(data.aadharNo) : null,
      HRME_NationalSSN: data.nationalSSN,

      // Medical
      HRME_Height: data.employeeHeight,
      HRME_HeightUOM: data.employeeHeightUnit,
      HRME_Weight: data.employeeWeight ? parseFloat(data.employeeWeight) : null,
      HRME_WeightUOM: data.employeeWeightUnit,
      HRME_IdentificationMark: data.identificationMark,
      HRME_EyeSightIssue: data.eyeSightIssue,
      HRME_AnyHealthIssue: data.anyHealthIssue,

      // Other details
      HRME_ExcPunch: data.punchRelaxation,
      HRME_LeftFlag: data.employeeLeft,
      HRME_DOL: data.dateOfLeaving,
      HRME_LeavingReason: data.reasonForLeavingExp,
      HRME_PensionStoppedDate: data.stopPension
        ? new Date().toISOString()
        : undefined,
      HRME_Photo: data.employeePhoto || selectedPhoto || "",
      HRME_ActiveFlag: !data.employeeLeft,

      // Arrays for related data
      employeedetailList: [],
      experienceDetails: [],
      qualificationDetails: data.qualificationDetails || [],
      documentList: [],
    };

    console.log("=== Submitting Employee Registration ===");
    console.log("Form data:", data);
    console.log("API payload:", payload);

    const response = await saveEmployeeRegister(payload);

    if (response.success) {
      toast.success(
        response.message ||
          (editingId
            ? "Employee updated successfully"
            : "Employee created successfully")
      );

      // Reload employees from API
      await loadOnloadDropdowns();
      handleFormClose();
    } else {
      toast.error(response.message || "Failed to save employee");
    }
  };

  const handleEdit = async (item: Employee) => {
    console.log("=== Editing Employee ===");
    console.log("Employee data:", item);

    try {
      // Fetch employee data from API
      const response = await getEmployeeById(item.id);

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to load employee data");
        return;
      }

      const employeeData = response.data;
      console.log("=== Employee Data from API ===");
      console.log("Employee data:", employeeData);

      // Get the main employee details (usually first item in employeedetailList)
      const empDetails = employeeData.employeedetailList?.[0] || {};

      setEditingId(item.id);

      // Reset form first
      reset();

      // Map API data to form fields
      // Employee Tab - Basic Details
      setValue("firstName", empDetails.HRME_EmployeeFirstName || "");
      setValue("middleName", empDetails.HRME_EmployeeMiddleName || "");
      setValue("lastName", empDetails.HRME_EmployeeLastName || "");
      setValue(
        "nameOfEmployee",
        `${empDetails.HRME_EmployeeFirstName || ""} ${
          empDetails.HRME_EmployeeMiddleName || ""
        } ${empDetails.HRME_EmployeeLastName || ""}`.trim()
      );
      setValue("employeeCode", empDetails.HRME_EmployeeCode || "");
      setValue("fatherName", empDetails.HRME_FatherName || "");
      setValue("motherName", empDetails.HRME_MotherName || "");
      setValue("typeOfEmployment", empDetails.HRMET_Id?.toString() || "");
      setValue("employeeGroup", empDetails.HRMGT_Id?.toString() || "");
      setValue("school", empDetails.HRMD_Id?.toString() || "");
      setValue("designation", empDetails.HRMDES_Id?.toString() || "");
      setValue("subjectTaught", empDetails.HRME_SubjectsTaught || "");
      setValue("grade", empDetails.HRMG_Id?.toString() || "");
      setValue(
        "dateOfJoining",
        empDetails.HRME_DOJ
          ? format(new Date(empDetails.HRME_DOJ), "yyyy-MM-dd")
          : ""
      );
      setValue(
        "dateOfConfirmation",
        empDetails.HRME_DOC
          ? format(new Date(empDetails.HRME_DOC), "yyyy-MM-dd")
          : ""
      );
      setValue(
        "dateOfBirth",
        empDetails.HRME_DOB
          ? format(new Date(empDetails.HRME_DOB), "yyyy-MM-dd")
          : ""
      );
      setValue(
        "dateOfRetirement",
        empDetails.HRME_ExpectedRetirementDate
          ? format(
              new Date(empDetails.HRME_ExpectedRetirementDate),
              "yyyy-MM-dd"
            )
          : ""
      );

      // Checkboxes
      setValue("epf", !empDetails.HRME_EPFNotApplicableFlg);
      setValue("ppf", !empDetails.HRME_FPFNotApplicableFlg);
      setValue(
        "phdResearchGuide",
        empDetails.HRME_PHDResearchGuideFlg || false
      );
      setValue("pfApplicable", empDetails.HRME_PFApplicableFlag || false);
      setValue("pfMaxAmount", empDetails.HRME_PFMaxFlag || false);
      setValue("pfFixedAmount", empDetails.HRME_PFFixedFlag || false);
      setValue("esiApplicable", empDetails.HRME_ESIApplicableFlag || false);
      setValue("employeeLeft", empDetails.HRME_LeftFlag || false);
      setValue("punchRelaxation", empDetails.HRME_ExcPunch || false);
      setValue("stopPension", empDetails.HRME_RetiredFlg || false);

      // PF Details
      setValue("pfAccNo", empDetails.HRME_PFAccNo || "");
      setValue("uanNumber", empDetails.HRME_UINumber || "");
      setValue(
        "pfDate",
        empDetails.HRME_PFDate
          ? format(new Date(empDetails.HRME_PFDate), "yyyy-MM-dd")
          : ""
      );
      setValue("biometricCode", empDetails.HRME_BiometricCode || "");
      setValue("rfCardId", empDetails.HRME_RFCardId || "");
      setValue("nationalSSN", empDetails.HRME_NationalSSN || "");

      // Teaching/Non-Teaching
      setValue(
        "teachingNonTeaching",
        empDetails.HRME_TechNonTeachingFlg || "Non-Teaching"
      );

      // Address Tab
      setValue("permanentAddress", empDetails.HRME_PerStreet || "");
      setValue("permanentArea", empDetails.HRME_PerArea || "");
      setValue("permanentCity", empDetails.HRME_PerCity || "");
      setValue("permanentState", empDetails.HRME_PerStateId?.toString() || "");
      setValue(
        "permanentCountry",
        empDetails.HRME_PerCountryId?.toString() || ""
      );
      setValue(
        "permanentPincode",
        empDetails.HRME_PerPincode?.toString() || ""
      );
      setValue("contactAddress", empDetails.HRME_LocStreet || "");
      setValue("contactArea", empDetails.HRME_LocArea || "");
      setValue("contactCity", empDetails.HRME_LocCity || "");
      setValue("contactState", empDetails.HRME_LocStateId?.toString() || "");
      setValue(
        "contactCountry",
        empDetails.HRME_LocCountryId?.toString() || ""
      );
      setValue("contactPincode", empDetails.HRME_LocPincode?.toString() || "");

      // Personal Details
      setValue("gender", empDetails.IVRMMG_Id?.toString() || "");
      setValue("maritalStatus", empDetails.IVRMMMS_Id?.toString() || "");
      setValue("religion", empDetails.ReligionId?.toString() || "");
      setValue("casteCategory", empDetails.CasteCategoryId?.toString() || "");
      setValue("caste", empDetails.CasteId?.toString() || "");
      setValue("mobileNo", empDetails.HRME_MobileNo?.toString() || "");
      setValue("emailId", empDetails.HRME_EmailId || "");
      setValue("aadharNo", empDetails.HRME_AadharCardNo?.toString() || "");
      setValue("panCardNo", empDetails.HRME_PANCardNo || "");
      setValue("bloodGroup", empDetails.HRME_BloodGroup || "");
      setValue("salaryType", empDetails.HRME_SalaryType || "");
      setValue("modeOfPayment", empDetails.HRME_PaymentType || "");
      setValue("bankAccountNo", empDetails.HRME_BankAccountNo || "");

      // Medical Details
      setValue("employeeHeight", empDetails.HRME_Height || "");
      setValue("employeeHeightUnit", empDetails.HRME_HeightUOM || "");
      setValue("employeeWeight", empDetails.HRME_Weight?.toString() || "");
      setValue("employeeWeightUnit", empDetails.HRME_WeightUOM || "");
      setValue("eyeSightIssue", empDetails.HRME_EyeSightIssue || "");
      setValue("anyHealthIssue", empDetails.HRME_AnyHealthIssue || "");
      setValue("identificationMark", empDetails.HRME_IdentificationMark || "");

      // Other Details
      setValue("msTeamsUserName", empDetails.HRME_MSTeamsUserId || "");
      setValue("msTeamsPassword", empDetails.HRME_MSTeamsPassword || "");
      setValue(
        "dateOfLeaving",
        empDetails.HRME_DOL
          ? format(new Date(empDetails.HRME_DOL), "yyyy-MM-dd")
          : ""
      );
      setValue("reasonForLeavingExp", empDetails.HRME_LeavingReason || "");

      // Photo
      if (empDetails.HRME_Photo) {
        setValue("employeePhoto", empDetails.HRME_Photo);
        setSelectedPhoto(empDetails.HRME_Photo);
      }

      // Qualification Details
      if (
        employeeData.qualificationDetails &&
        Array.isArray(employeeData.qualificationDetails)
      ) {
        const qualDetails = employeeData.qualificationDetails.map((q: any) => ({
          qualification: q.HRME_QualificationName || "",
          course: q.HRMC_Id?.toString() || "",
          college: q.HRMEQ_CollegeName || "",
          university: q.HRMEQ_UniversityName || "",
          yearOfPassing: q.HRMEQ_YearOfPassing?.toString() || "",
          qualificationState: q.HRMEQ_StateId?.toString() || "",
          qualificationCountry: q.HRMEQ_CountryId?.toString() || "",
          registrationNo: q.HRMEQ_RegistrationNo || "",
          result: q.HRMEQ_Result || "",
          cgpaOrPercentage: q.HRMEQ_CGPAOrPerFlag || "",
          cgpa: q.HRMEQ_CGPA || "",
          percentage: q.HRMEQ_Percentage || "",
          areaOfSpecialization: q.HRMEQ_AreaOfSpecialisation || "",
          phd: q.HRMEQ_PHDFlg || false,
          thesisTitle: q.HRMEQ_ThesisTitle || "",
          registrationYear: q.HRMEQ_RegistrationYear?.toString() || "",
          guideName: q.HRMEQ_GuideName || "",
          qualifiedDate: q.HRMEQ_Date
            ? format(new Date(q.HRMEQ_Date), "yyyy-MM-dd")
            : "",
        }));
        setValue("qualificationDetails", qualDetails);
      }

      // Document Details
      if (
        employeeData.documentList &&
        Array.isArray(employeeData.documentList)
      ) {
        const docDetails = employeeData.documentList.map((d: any) => ({
          nameOfDocument: d.HRMEDS_DocumentName || "",
          documentDescription: d.HRMEDS_DucumentDescription || "",
          document: d.HRMEDS_DocumentImageName || "",
        }));
        setValue("documentList", docDetails);
      }

      // Experience Details (if available)
      if (
        employeeData.employeeEarningsDeductionsDetails &&
        Array.isArray(employeeData.employeeEarningsDeductionsDetails)
      ) {
        // This is actually payroll data, not experience data
        // Experience might be in a different field or not in this response
        setValue("experienceDetails", []);
      }

      toast.success("Employee data loaded successfully");
    } catch (error: any) {
      console.error("Error loading employee data:", error);
      toast.error(error.message || "Failed to load employee data");
      return;
    }

    console.log("Form values set successfully");

    setIsFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const handleDelete = (id: number) => {
    try {
      employeeDB.remove(id);
      toast.success("Employee deleted successfully");
      loadEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Employee Registration"
              description="Register and manage employee information with comprehensive details"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddClick}
            size="lg"
            className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Employee Data Table Section */}
        <CollapsibleSection
          title="Employee's Details"
          description="View, search, and manage all registered employees"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <EmployeeTable
            employees={employees}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CollapsibleSection>

        {/* Employee Registration Form - Conditionally Rendered */}
        {isFormOpen && (
          <div
            ref={formRef}
            className="slide-in-from-top-4 animate-in duration-300"
          >
            <CollapsibleSection
              title={
                editingId ? "Update Employee" : "Employee Registration Form"
              }
              description="Fill in the comprehensive employee details across multiple tabs"
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

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 max-w-full"
                >
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-8">
                      <TabsTrigger value="employee">Employee</TabsTrigger>
                      <TabsTrigger value="address">Address</TabsTrigger>
                      <TabsTrigger value="qualification">
                        Qualification
                      </TabsTrigger>
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                      <TabsTrigger value="upload-document">
                        Upload Document
                      </TabsTrigger>
                      <TabsTrigger value="medical-record">
                        Medical Record
                      </TabsTrigger>
                      <TabsTrigger value="other-details">
                        Other Details
                      </TabsTrigger>
                      <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    </TabsList>

                    {/* Employee Tab */}
                    <TabsContent value="employee" className="space-y-4">
                      <EmployeeTab
                        control={control}
                        register={register}
                        errors={errors}
                        selectedPhoto={selectedPhoto}
                        onPhotoUpload={handlePhotoUpload}
                        setSelectedPhoto={setSelectedPhoto}
                        setPhotoFile={setPhotoFile}
                        options={{
                          empTypes,
                          groupTypes,
                          departments,
                          designations,
                          grades,
                          religions,
                          casteCategories,
                          castes,
                          genders,
                          maritalStatuses,
                          specialisations,
                          banks,
                        }}
                        isSubmitting={isSubmitting}
                        watch={watch}
                      />
                    </TabsContent>

                    {/* Address Tab */}
                    <TabsContent value="address" className="space-y-4">
                      <AddressTab
                        control={control}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        watch={watch}
                        setValue={setValue}
                      />
                    </TabsContent>

                    {/* Qualification Tab */}
                    <TabsContent value="qualification" className="space-y-4">
                      <QualificationTab
                        control={control}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                      />
                    </TabsContent>

                    {/* Experience Tab */}
                    <TabsContent value="experience" className="space-y-4">
                      <ExperienceTab
                        control={control}
                        register={register}
                        errors={errors}
                      />
                    </TabsContent>

                    {/* Upload Document Tab */}
                    <TabsContent value="upload-document" className="space-y-4">
                      <UploadDocumentTab
                        control={control}
                        register={register}
                        errors={errors}
                      />
                    </TabsContent>

                    {/* Medical Record Tab */}
                    <TabsContent value="medical-record" className="space-y-4">
                      <MedicalRecordTab
                        control={control}
                        register={register}
                        errors={errors}
                      />
                    </TabsContent>

                    {/* Other Details Tab */}
                    <TabsContent value="other-details" className="space-y-4">
                      <OtherDetailsTab
                        control={control}
                        register={register}
                        errors={errors}
                      />
                    </TabsContent>

                    {/* Payroll Tab */}
                    <TabsContent value="payroll" className="space-y-4">
                      <PayrollTab
                        control={control}
                        register={register}
                        errors={errors}
                      />
                    </TabsContent>
                  </Tabs>
                </form>
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared: Standard actions for tabs (till Other Details)
function StandardTabActions({
  errors,
  isSubmitting,
}: {
  errors: any;
  isSubmitting: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
      <Button
        type="submit"
        className="px-8 bg-primary text-primary-foreground hover:opacity-90"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save & Proceed"}
      </Button>
      <Button
        type="button"
        className="px-8 bg-secondary text-secondary-foreground hover:opacity-90"
      >
        Clear
      </Button>
      <Button
        type="button"
        className="px-8 bg-accent text-accent-foreground hover:opacity-90"
      >
        Set Employee Order
      </Button>
      <Button
        type="button"
        className="px-8 bg-muted text-foreground hover:opacity-90"
      >
        Import Employee Details
      </Button>
    </div>
  );
}

// Employee Tab Component
function EmployeeTab({
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
}: any) {
  return (
    <div className="space-y-6">
      {/* Main Form Fields in Two Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <InputText
            label="First Name"
            required
            id="firstName"
            {...register("firstName", {
              required: "First Name is required",
            })}
            error={errors.firstName?.message}
          />

          <InputText
            label="Middle Name"
            id="middleName"
            {...register("middleName")}
            error={errors.middleName?.message}
          />

          <InputText
            label="Last Name"
            id="lastName"
            {...register("lastName")}
            error={errors.lastName?.message}
          />

          <InputText
            label="Employee Code"
            required
            id="employeeCode"
            {...register("employeeCode", {
              required: "Employee code is required",
            })}
            error={errors.employeeCode?.message}
          />

          <InputText
            label="Father's Name"
            id="fatherName"
            {...register("fatherName")}
            error={errors.fatherName?.message}
          />

          <InputText
            label="Mother's Name"
            id="motherName"
            {...register("motherName")}
            error={errors.motherName?.message}
          />

          <Controller
            name="typeOfEmployment"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Type of Employment <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.empTypes || []).map((it: any) => (
                      <SelectItem
                        key={it.HRMET_Id || it.value}
                        value={(it.HRMET_Id ?? it.value ?? it)?.toString()}
                      >
                        {it.HRMET_EmployeeType || it.label || String(it)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="employeeGroup"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Employee Group <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.groupTypes || []).map((gt: any) => (
                      <SelectItem
                        key={gt.HRMGT_Id || gt.value}
                        value={(gt.HRMGT_Id ?? gt.value ?? gt)?.toString()}
                      >
                        {gt.HRMGT_EmployeeGroupType || gt.label || String(gt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="school"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  School <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.departments || []).map((d: any) => (
                      <SelectItem
                        key={d.HRMD_Id || d.value}
                        value={(d.HRMD_Id ?? d.value ?? d)?.toString()}
                      >
                        {d.HRMD_DepartmentName || d.label || String(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="designation"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Designation <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.designations || []).map((dg: any) => (
                      <SelectItem
                        key={dg.HRMDES_Id || dg.value}
                        value={(dg.HRMDES_Id ?? dg.value ?? dg)?.toString()}
                      >
                        {dg.HRMDES_DesignationName || dg.label || String(dg)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <InputText
            label="Subject Taught"
            id="subjectTaught"
            placeholder="Enter subject taught"
            {...register("subjectTaught")}
            error={errors.subjectTaught?.message}
          />

          <Controller
            name="grade"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Grade <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.grades || []).map((gr: any) => (
                      <SelectItem
                        key={gr.HRMG_Id || gr.Id || gr.value || gr}
                        value={(
                          gr.HRMG_Id ??
                          gr.Id ??
                          gr.value ??
                          gr
                        )?.toString()}
                      >
                        {gr.HRMG_GradeName ||
                          gr.Name ||
                          gr.label ||
                          gr.Grade ||
                          String(gr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="dateOfJoining"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Date Of Joining <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          <Controller
            name="dateOfConfirmation"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Date Of Confirmation</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
          {watch && watch("phdResearchGuide") ? (
            <InputText
              label="Recognition Year"
              id="recognitionYear"
              {...register("recognitionYear")}
              error={errors.recognitionYear?.message}
            />
          ) : null}

          <Controller
            name="teachingNonTeaching"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Teaching/NonTeaching <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Non Teaching">Non Teaching</SelectItem>
                  </SelectContent>
                </Select>
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
          {watch && watch("pfApplicable") ? (
            <div className="space-y-4 border-l-4 border-blue-500 pl-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pfMaxAmount" {...register("pfMaxAmount")} />
                  <Label htmlFor="pfMaxAmount">PF Max Amount</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pfFixedAmount" {...register("pfFixedAmount")} />
                  <Label htmlFor="pfFixedAmount">PF Fixed Amount</Label>
                </div>
              </div>

              <InputText
                label="PF Acc No."
                id="pfAccNo"
                {...register("pfAccNo")}
                error={errors.pfAccNo?.message}
              />

              <InputText
                label="UAN Number"
                id="uanNumber"
                {...register("uanNumber")}
                error={errors.uanNumber?.message}
              />

              <Controller
                name="pfDate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>PF Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
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
          {watch && watch("esiApplicable") ? (
            <div className="space-y-4 border-l-4 border-green-500 pl-4">
              <InputText
                label="ESI Acc No."
                id="esiAccNo"
                {...register("esiAccNo")}
                error={errors.esiAccNo?.message}
              />

              <InputText
                label="Gratuity Acc No."
                id="gratuityAccNo"
                {...register("gratuityAccNo")}
                error={errors.gratuityAccNo?.message}
              />

              <Controller
                name="esiDate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>ESI Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
                )}
              />
            </div>
          ) : null}

          <InputText
            label="National SSN"
            id="nationalSSN"
            {...register("nationalSSN")}
            error={errors.nationalSSN?.message}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Controller
            name="religion"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Religion <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.religions || []).map(
                      (rel: any, index: number) => {
                        // Handle different possible property names
                        const id =
                          rel.IVRMMR_Id ||
                          rel.IMR_Id ||
                          rel.Id ||
                          rel.id ||
                          rel.value ||
                          index;
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
                          <SelectItem key={id} value={id?.toString()}>
                            {name}
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="casteCategory"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Caste Category <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.casteCategories || []).map(
                      (cc: any, index: number) => {
                        // Handle different possible property names
                        const id =
                          cc.IMCC_Id || cc.Id || cc.id || cc.value || index;
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
                          <SelectItem key={id} value={id?.toString()}>
                            {name}
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="caste"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Caste <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Caste" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.castes || []).map((c: any, index: number) => {
                      // Handle different possible property names
                      const id = c.IMC_Id || c.Id || c.id || c.value || index;
                      const name =
                        c.IMC_CasteName ||
                        c.CasteName ||
                        c.Name ||
                        c.name ||
                        c.label ||
                        c.text ||
                        String(c);

                      return (
                        <SelectItem key={id} value={id?.toString()}>
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Date Of Birth <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          <Controller
            name="dateOfRetirement"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Date of Retirement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.genders || []).map((g: any) => (
                      <SelectItem
                        key={g.IVRMMG_Id || g.value}
                        value={(g.IVRMMG_Id ?? g.value ?? g)?.toString()}
                      >
                        {g.IVRMMG_GenderName ||
                          g.IVRMMG_Gender ||
                          g.label ||
                          String(g)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="maritalStatus"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Marital Status <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(options?.maritalStatuses || []).map((ms: any) => (
                      <SelectItem
                        key={ms.IVRMMMS_Id || ms.value}
                        value={(ms.IVRMMMS_Id ?? ms.value ?? ms)?.toString()}
                      >
                        {ms.IVRMMMS_MaritalStatus ||
                          ms.IVRMMMS_Name ||
                          ms.label ||
                          String(ms)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* Multiple Mobile Numbers */}
          <div className="space-y-2">
            <Label>Mobile No.</Label>
            <Controller
              name="mobileDetails"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value?.map((mobile: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Controller
                        name={`mobileDetails.${index}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <InputText
                        placeholder="Enter mobile number"
                        {...register(`mobileDetails.${index}.mobileNo`)}
                        className="flex-1 min-w-[200px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => {
                          const newValues =
                            field.value?.filter(
                              (_: any, i: number) => i !== index
                            ) || [];
                          field.onChange(newValues);
                        }}
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
                    onClick={() => {
                      field.onChange([
                        ...(field.value || []),
                        { mobileNo: "", type: "default" },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Mobile
                  </Button>
                </div>
              )}
            />
          </div>

          {/* Multiple Email IDs */}
          <div className="space-y-2">
            <Label>Email -Id</Label>
            <Controller
              name="emailDetails"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value?.map((email: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Controller
                        name={`emailDetails.${index}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <InputText
                        type="email"
                        placeholder="Enter email address"
                        {...register(`emailDetails.${index}.emailId`)}
                        className="flex-1 min-w-[200px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => {
                          const newValues =
                            field.value?.filter(
                              (_: any, i: number) => i !== index
                            ) || [];
                          field.onChange(newValues);
                        }}
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
                    onClick={() => {
                      field.onChange([
                        ...(field.value || []),
                        { emailId: "", type: "default" },
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Email
                  </Button>
                </div>
              )}
            />
          </div>

          <InputText
            label="Aadhaar No."
            id="aadharNo"
            {...register("aadharNo")}
            error={errors.aadharNo?.message}
          />

          <InputText
            label="PAN Card No."
            id="panCardNo"
            {...register("panCardNo")}
            error={errors.panCardNo?.message}
          />

          <Controller
            name="bloodGroup"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-",
                      ] as const
                    ).map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="salaryType"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Salary Type</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Monthly", "Hourly"].map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="modeOfPayment"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label>
                  Mode of Payment <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="--Select--" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Bank", "Cash"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* Employee Photo Upload */}
          <div className="space-y-2">
            <Label>Upload Employee Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
                    alt="Employee Preview"
                    className="w-full h-full object-cover rounded-lg"
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
                  className="w-full"
                  onClick={() =>
                    document.getElementById("employeePhoto")?.click()
                  }
                >
                  {selectedPhoto ? "Change Photo" : "Upload Employee Photo"}
                </Button>
                {selectedPhoto && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
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
              <div className="bg-blue-600 text-white px-4 py-2 rounded-md">
                <h3 className="font-semibold">Employee Bank Details:</h3>
              </div>

              <Controller
                name="bankDetails"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <div className="rounded-lg border bg-card">
                    <div className="bg-blue-600 text-white px-4 py-2">
                      <div className="grid grid-cols-5 gap-2 text-sm font-semibold">
                        <div>Serial No.</div>
                        <div>Employer Bank Name</div>
                        <div>Bank Account No.</div>
                        <div>Account Type</div>
                        <div>Action</div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {field.value?.map((bank: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 gap-2 items-center"
                        >
                          <div>{index + 1}</div>
                          <div>
                            <Controller
                              name={`bankDetails.${index}.employerBankName`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="--Select--" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(options?.banks || []).map((b: any) => (
                                      <SelectItem
                                        key={b.HRMBD_Id || b.BankId || b.value}
                                        value={(
                                          b.HRMBD_Id ??
                                          b.BankId ??
                                          b.value ??
                                          b
                                        )?.toString()}
                                      >
                                        {b.HRMBD_BankName ||
                                          b.BankName ||
                                          b.label ||
                                          String(b)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div>
                            <InputText
                              placeholder="Bank Account No."
                              {...register(
                                `bankDetails.${index}.bankAccountNo`
                              )}
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
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="default">
                                      Default
                                    </SelectItem>
                                    <SelectItem value="alternate">
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
                              onClick={() => {
                                const newValues =
                                  field.value?.filter(
                                    (_: any, i: number) => i !== index
                                  ) || [];
                                field.onChange(newValues);
                              }}
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
                        onClick={() => {
                          field.onChange([
                            ...(field.value || []),
                            {
                              employerBankName: "",
                              bankAccountNo: "",
                              accountType: "default",
                            },
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Bank Account
                      </Button>
                    </div>
                  </div>
                )}
              />
            </div>
          ) : null}
        </div>
      </div>

      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Address Tab Component
function AddressTab({
  control,
  register,
  errors,
  isSubmitting,
  watch,
  setValue,
}: any) {
  const sameAsCommunicationAddress = watch("sameAsCommunicationAddress");

  // Debug: Log the checkbox value
  console.log(
    "sameAsCommunicationAddress value:",
    sameAsCommunicationAddress,
    "type:",
    typeof sameAsCommunicationAddress
  );

  // Watch communication address fields
  const contactAddress = watch("contactAddress");
  const contactArea = watch("contactArea");
  const contactCountry = watch("contactCountry");
  const contactState = watch("contactState");
  const contactCity = watch("contactCity");
  const contactPincode = watch("contactPincode");

  // Copy communication address to permanent address when checkbox is checked
  React.useEffect(() => {
    if (sameAsCommunicationAddress) {
      // Copy communication address to permanent address
      setValue("permanentAddress", contactAddress || "");
      setValue("permanentArea", contactArea || "");
      setValue("permanentCountry", contactCountry || "");
      setValue("permanentState", contactState || "");
      setValue("permanentCity", contactCity || "");
      setValue("permanentPincode", contactPincode || "");
    }
  }, [sameAsCommunicationAddress]); // Only depend on checkbox state, not communication address fields
  return (
    <div className="space-y-6">
      {/* Contact Address */}
      <div className="space-y-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <h3 className="font-semibold">Contact Address:</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <InputText
            label="Address"
            id="contactAddress"
            {...register("contactAddress")}
            error={errors.contactAddress?.message}
          />
          <InputText
            label="Area"
            id="contactArea"
            {...register("contactArea")}
            error={errors.contactArea?.message}
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
            <div className="flex-1 space-y-2">
              <Controller
                name="contactCountry"
                control={control}
                render={({ field }) => (
                  <>
                    <Label>Country</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "India"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Controller
                name="contactState"
                control={control}
                render={({ field }) => (
                  <>
                    <Label>State</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "Assam"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assam">Assam</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              />
            </div>
            <div className="flex-1 space-y-2">
              <InputText
                label="City"
                id="contactCity"
                {...register("contactCity")}
                error={errors.contactCity?.message}
              />
            </div>
            <div className="flex-1 space-y-2">
              <InputText
                label="Pincode"
                id="contactPincode"
                {...register("contactPincode")}
                error={errors.contactPincode?.message}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="space-y-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <h3 className="font-semibold">Permanent Address:</h3>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="sameAsCommunicationAddress"
            checked={sameAsCommunicationAddress || false}
            onCheckedChange={(checked) => {
              setValue("sameAsCommunicationAddress", !!checked);
            }}
          />
          <Label htmlFor="sameAsCommunicationAddress">
            Same As Communication Address
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <InputText
            label="Address"
            id="permanentAddress"
            {...register("permanentAddress")}
            error={errors.permanentAddress?.message}
            disabled={sameAsCommunicationAddress}
          />
          <InputText
            label="Area"
            id="permanentArea"
            {...register("permanentArea")}
            error={errors.permanentArea?.message}
            disabled={sameAsCommunicationAddress}
          />
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-4">
            <div className="flex-1 space-y-2">
              <Controller
                name="permanentCountry"
                control={control}
                render={({ field }) => (
                  <>
                    <Label>Country</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "India"}
                      disabled={sameAsCommunicationAddress}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Controller
                name="permanentState"
                control={control}
                render={({ field }) => (
                  <>
                    <Label>State</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "Assam"}
                      disabled={sameAsCommunicationAddress}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assam">Assam</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              />
            </div>
            <div className="flex-1 space-y-2">
              <InputText
                label="City"
                id="permanentCity"
                {...register("permanentCity")}
                error={errors.permanentCity?.message}
                disabled={sameAsCommunicationAddress}
              />
            </div>
            <div className="flex-1 space-y-2">
              <InputText
                label="Pincode"
                id="permanentPincode"
                {...register("permanentPincode")}
                error={errors.permanentPincode?.message}
                disabled={sameAsCommunicationAddress}
              />
            </div>
          </div>
        </div>
      </div>
      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Experience Tab Component
function ExperienceTab({ control, register, errors, isSubmitting }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experienceDetails",
  });

  const addEmptyRow = () => {
    append({} as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">PREVIOUS EMPLOYMENT DETAILS</h3>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addEmptyRow}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Experience
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No experience added yet. Click "Add Experience" to start.
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Experience #{index + 1}</div>
              <div className="flex gap-2">
                <Badge variant="secondary">Row {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <InputText
                label="Organisation Name"
                id={`experienceDetails.${index}.organisationName`}
                {...register(`experienceDetails.${index}.organisationName`)}
              />

              <InputText
                label="Department"
                id={`experienceDetails.${index}.department`}
                {...register(`experienceDetails.${index}.department`)}
              />

              <InputText
                label="Designation"
                id={`experienceDetails.${index}.designation`}
                {...register(`experienceDetails.${index}.designation`)}
              />

              <Controller
                name={`experienceDetails.${index}.joinDate`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "dd/MM/yyyy")
                            : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
                )}
              />

              <Controller
                name={`experienceDetails.${index}.exitDate`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Exit Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "dd/MM/yyyy")
                            : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
                )}
              />

              <InputText
                label="No. Of Years"
                id={`experienceDetails.${index}.noOfYears`}
                {...register(`experienceDetails.${index}.noOfYears`)}
              />

              <InputText
                label="No. Of Months"
                id={`experienceDetails.${index}.noOfMonths`}
                {...register(`experienceDetails.${index}.noOfMonths`)}
              />

              <InputText
                label="Annual Salary"
                id={`experienceDetails.${index}.annualSalary`}
                {...register(`experienceDetails.${index}.annualSalary`)}
              />

              <div className="lg:col-span-3 md:col-span-2">
                <Label>Organisation Address</Label>
                <textarea
                  id={`experienceDetails.${index}.organisationAddress`}
                  {...register(
                    `experienceDetails.${index}.organisationAddress`
                  )}
                  className="w-full min-h-[60px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter organisation address..."
                />
              </div>

              <div className="lg:col-span-3 md:col-span-2">
                <Label>Reason For Leaving</Label>
                <textarea
                  id={`experienceDetails.${index}.reasonForLeaving`}
                  {...register(`experienceDetails.${index}.reasonForLeaving`)}
                  className="w-full min-h-[60px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter reason for leaving..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Medical Record Tab Component
function MedicalRecordTab({ control, register, errors, isSubmitting }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">Medical Record</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-2">
          <InputText
            label="Employee's Height"
            id="employeeHeight"
            placeholder="Height"
            {...register("employeeHeight")}
            error={errors.employeeHeight?.message}
          />
          <InputText
            label="Unit of measure (Height)"
            id="employeeHeightUnit"
            placeholder="Unit of measure"
            {...register("employeeHeightUnit")}
            error={errors.employeeHeightUnit?.message}
          />
        </div>

        <InputText
          label="Eye Sight Issue"
          id="eyeSightIssue"
          {...register("eyeSightIssue")}
          error={errors.eyeSightIssue?.message}
        />

        <div className="grid grid-cols-2 gap-2">
          <InputText
            label="Employee's Weight"
            id="employeeWeight"
            placeholder="Weight"
            {...register("employeeWeight")}
            error={errors.employeeWeight?.message}
          />
          <InputText
            label="Unit of measure (Weight)"
            id="employeeWeightUnit"
            placeholder="Unit of measure"
            {...register("employeeWeightUnit")}
            error={errors.employeeWeightUnit?.message}
          />
        </div>

        <InputText
          label="Any Health Issue"
          id="anyHealthIssue"
          {...register("anyHealthIssue")}
          error={errors.anyHealthIssue?.message}
        />
      </div>

      <div className="space-y-2">
        <Label>Identification Mark</Label>
        <textarea
          id="identificationMark"
          {...register("identificationMark")}
          className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter identification mark details..."
        />
      </div>
      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Other Details Tab Component
function OtherDetailsTab({ control, register, errors, isSubmitting }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">Other Details</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InputText
          label="Biometric Code"
          id="biometricCode"
          placeholder="48"
          {...register("biometricCode")}
          error={errors.biometricCode?.message}
        />

        <div className="space-y-2 flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="punchRelaxation" {...register("punchRelaxation")} />
            <Label htmlFor="punchRelaxation">Punch Relaxation ?</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="stopPension" {...register("stopPension")} />
            <Label htmlFor="stopPension">Stop Pension ?</Label>
          </div>
        </div>

        <InputText
          label="RF card ID"
          id="rfCardId"
          {...register("rfCardId")}
          error={errors.rfCardId?.message}
        />

        <div className="flex items-center space-x-2">
          <Checkbox id="employeeLeft" {...register("employeeLeft")} />
          <Label htmlFor="employeeLeft">Employee Left ?</Label>
        </div>

        <InputText
          label="MS Teams UserName"
          id="msTeamsUserName"
          placeholder="STCSAdmin"
          {...register("msTeamsUserName")}
          error={errors.msTeamsUserName?.message}
        />

        <div className="space-y-2">
          <Label>Last Working day</Label>
          <Controller
            name="lastWorkingDay"
            control={control}
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
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        <InputText
          label="MS Teams Password"
          id="msTeamsPassword"
          type="password"
          placeholder="••••••••"
          {...register("msTeamsPassword")}
          error={errors.msTeamsPassword?.message}
        />
      </div>
      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Qualification Tab Component
function QualificationTab({ control, register, errors, isSubmitting }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualificationDetails",
  });

  const addEmptyRow = () => {
    append({
      cgpaOrPercentage: "CGPA",
      qualificationCountry: "India",
      qualificationState: "Assam",
    } as QualificationItem);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">EMPLOYEE QUALIFICATION DETAILS</h3>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addEmptyRow}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Qualification
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No qualifications added yet. Click "Add Qualification" to start.
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Qualification #{index + 1}</div>
              <div className="flex gap-2">
                <Badge variant="secondary">Row {index + 1}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>

            {/* Top essentials */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <InputText
                label="Qualification"
                id={`qualificationDetails.${index}.qualification`}
                {...register(`qualificationDetails.${index}.qualification`)}
              />

              <Controller
                name={`qualificationDetails.${index}.course`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.A">B.A</SelectItem>
                        <SelectItem value="B.Sc">B.Sc</SelectItem>
                        <SelectItem value="B.Com">B.Com</SelectItem>
                        <SelectItem value="M.A">M.A</SelectItem>
                        <SelectItem value="M.Sc">M.Sc</SelectItem>
                        <SelectItem value="M.Com">M.Com</SelectItem>
                        <SelectItem value="B.Ed">B.Ed</SelectItem>
                        <SelectItem value="M.Ed">M.Ed</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <InputText
                label="College"
                id={`qualificationDetails.${index}.college`}
                {...register(`qualificationDetails.${index}.college`)}
              />

              <InputText
                label="University"
                id={`qualificationDetails.${index}.university`}
                {...register(`qualificationDetails.${index}.university`)}
              />

              <InputText
                label="Year Of Passing"
                id={`qualificationDetails.${index}.yearOfPassing`}
                {...register(`qualificationDetails.${index}.yearOfPassing`)}
              />

              <Controller
                name={`qualificationDetails.${index}.qualificationCountry`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "India"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name={`qualificationDetails.${index}.qualificationState`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Assam">Assam</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <InputText
                label="Registration No."
                id={`qualificationDetails.${index}.registrationNo`}
                {...register(`qualificationDetails.${index}.registrationNo`)}
              />

              <InputText
                label="Result"
                id={`qualificationDetails.${index}.result`}
                {...register(`qualificationDetails.${index}.result`)}
              />

              <Controller
                name={`qualificationDetails.${index}.cgpaOrPercentage`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>CGPA Or Percentage</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CGPA">CGPA</SelectItem>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <InputText
                label="CGPA"
                id={`qualificationDetails.${index}.cgpa`}
                {...register(`qualificationDetails.${index}.cgpa`)}
              />

              <InputText
                label="Percentage"
                id={`qualificationDetails.${index}.percentage`}
                {...register(`qualificationDetails.${index}.percentage`)}
              />

              <Controller
                name={`qualificationDetails.${index}.areaOfSpecialization`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Area Of Specialization</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">
                          Computer Science
                        </SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`qualificationDetails.${index}.phd`}
                  {...register(`qualificationDetails.${index}.phd` as const)}
                />
                <Label htmlFor={`qualificationDetails.${index}.phd`}>PHD</Label>
              </div>

              <InputText
                label="PHD Details"
                id={`qualificationDetails.${index}.phdDetails`}
                {...register(`qualificationDetails.${index}.phdDetails`)}
              />

              <InputText
                label="Medical Council"
                id={`qualificationDetails.${index}.medicalCouncil`}
                {...register(`qualificationDetails.${index}.medicalCouncil`)}
              />

              <InputText
                label="Thesis Title"
                id={`qualificationDetails.${index}.thesisTitle`}
                {...register(`qualificationDetails.${index}.thesisTitle`)}
              />

              <Controller
                name={`qualificationDetails.${index}.registrationYear`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Registration Year</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "yyyy")
                            : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
                )}
              />

              <InputText
                label="Guide Name"
                id={`qualificationDetails.${index}.guideName`}
                {...register(`qualificationDetails.${index}.guideName`)}
              />

              <Controller
                name={`qualificationDetails.${index}.specialization`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Teaching">Teaching</SelectItem>
                        <SelectItem value="Industry">Industry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name={`qualificationDetails.${index}.qualifiedDate`}
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Qualified Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "dd/MM/yyyy")
                            : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  </div>
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <StandardTabActions errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}

// Upload Document Tab Component
function UploadDocumentTab({ control, register, errors }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">
          DOCUMENT UPLOAD DETAILS [ONLY JPEG,DOCX,DOC,PDF FILES (0-2MB)]
        </h3>
      </div>

      {/* Document Upload Table */}
      <div className="rounded-lg border bg-card">
        <div className="bg-primary text-primary-foreground px-4 py-2">
          <div className="grid grid-cols-5 gap-2 text-sm font-semibold">
            <div>Serial NO.</div>
            <div>Name of Document</div>
            <div>Document Description</div>
            <div>Document</div>
            <div>Action</div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2 items-center">
            <div>1</div>
            <div>
              <InputText
                id="nameOfDocument"
                {...register("nameOfDocument")}
                placeholder="Name of Document"
              />
            </div>
            <div>
              <InputText
                id="documentDescription"
                {...register("documentDescription")}
                placeholder="Document Description"
              />
            </div>
            <div>
              <input
                type="file"
                id="document"
                accept=".jpeg,.jpg,.docx,.doc,.pdf"
                {...register("document")}
                className="hidden"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => document.getElementById("document")?.click()}
              >
                Upload
              </Button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payroll Tab Component
function PayrollTab({ control, register, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        <h3 className="font-semibold">Salary Details</h3>
      </div>

      {/* Earning Details */}
      <div className="space-y-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <h4 className="font-semibold">Earning Details:</h4>
        </div>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <div className="bg-primary text-primary-foreground px-2 py-1">
            <div className="grid grid-cols-8 gap-1 text-sm font-semibold min-w-[800px]">
              <div>Serial NO.</div>
              <div>Earnings</div>
              <div>Actual %</div>
              <div>% Applicable</div>
              <div>Amount</div>
              <div>Max Amount</div>
              <div>Details</div>
              <div>Action</div>
            </div>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-8 gap-1 items-center min-w-[800px]">
              <div>1</div>
              <div>
                <InputText {...register("earnings")} placeholder="Earnings" />
              </div>
              <div>
                <InputText
                  {...register("earningsActualPercent")}
                  placeholder="Actual %"
                />
              </div>
              <div>
                <InputText
                  {...register("earningsApplicablePercent")}
                  placeholder="% Applicable"
                />
              </div>
              <div>
                <InputText
                  {...register("earningsAmount")}
                  placeholder="Amount"
                />
              </div>
              <div>
                <InputText
                  {...register("earningsMaxAmount")}
                  placeholder="Max Amount"
                />
              </div>
              <div>
                <InputText
                  {...register("earningsDetails")}
                  placeholder="Details"
                />
              </div>
              <div>
                <Checkbox {...register("earningsAction")} />
              </div>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total Earning</span>
                <span>0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deduction Details */}
      <div className="space-y-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <h4 className="font-semibold">Deduction Details:</h4>
        </div>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <div className="bg-primary text-primary-foreground px-2 py-1">
            <div className="grid grid-cols-8 gap-1 text-sm font-semibold min-w-[800px]">
              <div>Serial NO.</div>
              <div>Deductions</div>
              <div>Actual %</div>
              <div>% Applicable</div>
              <div>Amount</div>
              <div>Max Amount</div>
              <div>Details</div>
              <div>Action</div>
            </div>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-8 gap-1 items-center min-w-[800px]">
              <div>1</div>
              <div>
                <InputText
                  {...register("deductions")}
                  placeholder="Deductions"
                />
              </div>
              <div>
                <InputText
                  {...register("deductionsActualPercent")}
                  placeholder="Actual %"
                />
              </div>
              <div>
                <InputText
                  {...register("deductionsApplicablePercent")}
                  placeholder="% Applicable"
                />
              </div>
              <div>
                <InputText
                  {...register("deductionsAmount")}
                  placeholder="Amount"
                />
              </div>
              <div>
                <InputText
                  {...register("deductionsMaxAmount")}
                  placeholder="Max Amount"
                />
              </div>
              <div>
                <InputText
                  {...register("deductionsDetails")}
                  placeholder="Details"
                />
              </div>
              <div>
                <Checkbox {...register("deductionsAction")} />
              </div>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total Deduction</span>
                <span>0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrear Details */}
      <div className="space-y-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          <h4 className="font-semibold">Arrear Details:</h4>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="bg-primary text-primary-foreground px-2 py-1">
            <div className="grid grid-cols-7 gap-2 text-sm font-semibold">
              <div>Serial NO.</div>
              <div>Arrear Head</div>
              <div>Actual %</div>
              <div>% Applicable</div>
              <div>Amount</div>
              <div>Details</div>
              <div>Action</div>
            </div>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-7 gap-2 items-center">
              <div>1</div>
              <div>
                <InputText
                  {...register("arrearHead")}
                  placeholder="Arrear Head"
                />
              </div>
              <div>
                <InputText
                  {...register("arrearActualPercent")}
                  placeholder="Actual %"
                />
              </div>
              <div>
                <InputText
                  {...register("arrearApplicablePercent")}
                  placeholder="% Applicable"
                />
              </div>
              <div>
                <InputText {...register("arrearAmount")} placeholder="Amount" />
              </div>
              <div>
                <InputText
                  {...register("arrearDetails")}
                  placeholder="Details"
                />
              </div>
              <div>
                <Checkbox {...register("arrearAction")} />
              </div>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total Arrear</span>
                <span>0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div className="bg-muted p-4 rounded-md">
        <div className="text-lg font-bold">Net Salary: 0.00</div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
        <Button type="button" variant="outline" className="px-8">
          PREVIOUS
        </Button>
        <Button type="button" variant="default" className="px-8">
          SUBMIT
        </Button>
        <Button type="button" variant="outline" className="px-8">
          CLEAR
        </Button>
        <Button type="button" variant="outline" className="px-8">
          CLEAR ALL
        </Button>
      </div>
    </div>
  );
}

// Employee Table Component
interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "serialNo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sl No" />
      ),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div>{continuousIndex}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First Name" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        return <div>{employee.firstName || ""}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "middleName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Middle Name" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        return <div>{employee.middleName || ""}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Name" />
      ),
      cell: ({ row }) => {
        const employee = row.original;
        return <div>{employee.lastName || ""}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "employeeCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Code" />
      ),
      cell: ({ row }) => <div>{row.getValue("employeeCode")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "employeePhoto",
      header: "Employee Photo",
      cell: ({ row }) => {
        const employee = row.original;
        const photo = employee.employeePhoto;
        return (
          <div className="flex items-center space-x-2">
            {photo ? (
              <div className="flex items-center space-x-2">
                <img
                  src={photo}
                  alt="Employee"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-600 p-0 h-auto"
                >
                  Download
                </Button>
              </div>
            ) : (
              <Button variant="link" size="sm" className="text-blue-600">
                📥 Download
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "employeeOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee Order" />
      ),
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        const continuousIndex = pageIndex * pageSize + row.index + 1;
        return <div>{continuousIndex}</div>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
                onClick={() => onEdit(row.original)}
                className="w-full justify-start"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDelete(row.original.id)}
                className="w-full justify-start text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="rounded-lg bg-card overflow-hidden">
      <DataTable
        isLoading={isLoading}
        columns={columns}
        data={employees}
        totalItems={employees.length}
        pageSizeOptions={[10, 25, 50, 100, 200]}
        showViewOptions={true}
        showExportOptions={true}
        columnPinning={{ right: ["actions"] }}
      />
    </div>
  );
}
