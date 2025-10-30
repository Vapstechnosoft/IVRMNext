"use client";

import { useState, useEffect, useRef } from "react";
import { Heading } from "@/components/layout/heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { Edit, Trash2, Save, X, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { createLocalCrud, type BaseEntity } from "../../../lib/localdb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getOnloadEmployeeTypeDetails,
  saveMasterEmployeeType,
  testMasterEmployeeTypeAPI,
} from "@/types/hrms/master-employee-type";
import { getOnloadGroupTypeDetails } from "@/types/hrms/master-group-type";
import { getOnloadDepartmentDetails } from "@/types/hrms/master-department";
import { getOnloadDesignationDetails } from "@/types/hrms/master-designation";
import { getOnloadGradeDetails } from "@/types/hrms/master-grade";
import type {
  MasterEmployeeTypeResponse,
  EmployeeTypeDetail,
  MasterEmployeeTypeInput,
} from "@/types/hrms/master-employee-type";
import type { GroupTypeDetail } from "@/types/hrms/master-group-type";
import type { DepartmentDetail } from "@/types/hrms/master-department";
import type { DesignationDetail } from "@/types/hrms/master-designation";
import type { GradeDetail } from "@/types/hrms/master-grade";
import EmployeeTypeTab from "./components/EmployeeTypeTab";
import GroupTypeTab from "./components/GroupTypeTab";
import DepartmentTab from "./components/DepartmentTab";
import DesignationTab from "./components/DesignationTab";
import GradeTab from "./components/GradeTab";
import EmployeeTypeForm from "./components/EmployeeTypeForm";
import GroupTypeForm from "./components/GroupTypeForm";
import DepartmentForm from "./components/DepartmentForm";
import DesignationForm from "./components/DesignationForm";
import GradeForm from "./components/GradeForm";

// Interfaces for each form type
interface EmployeeType extends EmployeeTypeDetail {}
interface GroupType extends GroupTypeDetail {}
interface Department extends DepartmentDetail {}
interface Designation extends DesignationDetail {}
interface Grade extends GradeDetail {}

type TabType =
  | "employee-type"
  | "group-type"
  | "department"
  | "designation"
  | "grade";

export default function EmployeeCategoryPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("employee-type");

  // Helper function to get dynamic titles based on active tab
  const getTabTitles = (tab: TabType) => {
    switch (tab) {
      case "employee-type":
        return {
          formTitle: "Add New Employee Type",
          formDescription:
            "Fill in the details below to create a new employee type",
          buttonText: "Add Employee Type",
        };
      case "group-type":
        return {
          formTitle: "Add New Group Type",
          formDescription:
            "Fill in the details below to create a new group type",
          buttonText: "Add Group Type",
        };
      case "department":
        return {
          formTitle: "Add New Department",
          formDescription:
            "Fill in the details below to create a new department",
          buttonText: "Add Department",
        };
      case "designation":
        return {
          formTitle: "Add New Designation",
          formDescription:
            "Fill in the details below to create a new designation",
          buttonText: "Add Designation",
        };
      case "grade":
        return {
          formTitle: "Add New Grade",
          formDescription: "Fill in the details below to create a new grade",
          buttonText: "Add Grade",
        };
      default:
        return {
          formTitle: "Add New Employee Category",
          formDescription:
            "Fill in the details below to create a new employee category",
          buttonText: "Add Employee Category",
        };
    }
  };

  const currentTabTitles = getTabTitles(activeTab);

  // State for each form type
  const [employeeTypes, setEmployeeTypes] = useState<EmployeeType[]>([]);
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  // API state for employee types
  const [roleId, setRoleId] = useState(30); // Default role ID (MI_Id)
  const [isEmployeeTypeLoading, setIsEmployeeTypeLoading] = useState(false);

  // Form data states
  const [employeeTypeForm, setEmployeeTypeForm] = useState({
    employeeType: "",
    isActive: true,
  });
  const [groupTypeForm, setGroupTypeForm] = useState({
    groupType: "",
    groupCode: "",
    order: 1,
    isActive: true,
  });
  const [departmentForm, setDepartmentForm] = useState({
    departmentName: "",
    internalTrainingHours: "",
    order: 1,
    isActive: true,
  });
  const [designationForm, setDesignationForm] = useState({
    designationName: "",
    basicAmount: "",
    sanctionedSeats: "",
    displaySanctionedSeats: false,
    order: 1,
    isActive: true,
  });
  const [gradeForm, setGradeForm] = useState({
    gradeName: "",
    gradeDisplayName: "",
    payScaleFrom: "",
    incrementOf: "",
    payScaleTo: "",
    payScaleRange: "",
    order: 1,
    isActive: true,
  });

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Order editing states for Group Type
  const [isGroupTypeOrderEditing, setIsGroupTypeOrderEditing] = useState(false);
  const [groupTypeOrderValues, setGroupTypeOrderValues] = useState<
    Record<number, number>
  >({});

  // Order editing states for Department
  const [isDepartmentOrderEditing, setIsDepartmentOrderEditing] =
    useState(false);
  const [departmentOrderValues, setDepartmentOrderValues] = useState<
    Record<number, number>
  >({});

  // Order editing states for Designation
  const [isDesignationOrderEditing, setIsDesignationOrderEditing] =
    useState(false);
  const [designationOrderValues, setDesignationOrderValues] = useState<
    Record<number, number>
  >({});

  // Order editing states for Grade
  const [isGradeOrderEditing, setIsGradeOrderEditing] = useState(false);
  const [gradeOrderValues, setGradeOrderValues] = useState<
    Record<number, number>
  >({});

  // Form minimize states
  const [isFormMinimized, setIsFormMinimized] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  // Database instances
  const employeeTypeDB = createLocalCrud<EmployeeType>("master:employee-type");
  const groupTypeDB = createLocalCrud<GroupType>("master:group-type");
  const departmentDB = createLocalCrud<Department>("master:department");
  const designationDB = createLocalCrud<Designation>("master:designation");
  const gradeDB = createLocalCrud<Grade>("master:grade");

  useEffect(() => {
    fetchAllData();
  }, [roleId]);

  const handleAddButtonClick = () => {
    setIsFormMinimized(false);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Load all data from API
      await Promise.all([
        loadEmployeeTypes(),
        loadGroupTypes(),
        loadDepartments(),
        loadDesignations(),
        loadGrades(),
      ]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeTypes = async () => {
    try {
      setIsEmployeeTypeLoading(true);
      console.log("=== LOAD EMPLOYEE TYPES DEBUG ===");
      console.log("Role ID:", roleId);

      const response = await getOnloadEmployeeTypeDetails(roleId);
      console.log("Full API Response:", response);
      console.log("Response Success:", response.success);
      console.log("Response Data:", response.data);
      console.log("Response Message:", response.message);

      if (response.success && response.data) {
        console.log("Response data exists, checking employeeTypeList...");
        console.log("employeeTypeList:", response.data.employeeTypeList);
        console.log(
          "employeeTypeList type:",
          typeof response.data.employeeTypeList
        );
        console.log(
          "employeeTypeList length:",
          response.data.employeeTypeList?.length
        );

        // Handle response - employeeTypeList is now object[] with PascalCase properties
        const typeList = response.data.employeeTypeList || [];
        console.log("Processed typeList:", typeList);
        console.log("Processed typeList length:", typeList.length);

        if (typeList.length > 0) {
          console.log("First item structure:", typeList[0]);
          console.log("First item keys:", Object.keys(typeList[0]));
        }

        setEmployeeTypes(typeList);
        toast.success(`Loaded ${typeList.length} employee types`);
      } else {
        console.log("Response failed or no data");
        console.log("Success:", response.success);
        console.log("Data exists:", !!response.data);
        toast.error(response.message || "Failed to load employee types");
        setEmployeeTypes([]);
      }
    } catch (error) {
      console.error("=== ERROR LOADING EMPLOYEE TYPES ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      toast.error("Failed to load employee types");
      setEmployeeTypes([]);
    } finally {
      setIsEmployeeTypeLoading(false);
    }
  };

  const loadGroupTypes = async () => {
    try {
      const response = await getOnloadGroupTypeDetails(roleId);
      if (response.success && response.data) {
        // Handle response - grouptypeList is now object[] with PascalCase properties
        // Sort by order number in ascending order
        const typeList = (response.data.grouptypeList || []).sort(
          (a: GroupType, b: GroupType) =>
            (a.HRMGT_Order || 0) - (b.HRMGT_Order || 0)
        );
        setGroupTypes(typeList);
      } else {
        setGroupTypes([]);
      }
    } catch (error) {
      console.error("Error loading group types:", error);
      setGroupTypes([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await getOnloadDepartmentDetails(roleId);
      if (response.success && response.data) {
        // Handle response - departmentList is now object[] with PascalCase properties
        // Sort by order number in ascending order
        const deptList = (response.data.departmentList || []).sort(
          (a: Department, b: Department) =>
            (a.HRMD_Order || 0) - (b.HRMD_Order || 0)
        );
        setDepartments(deptList);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      setDepartments([]);
    }
  };

  const loadDesignations = async () => {
    try {
      const response = await getOnloadDesignationDetails(roleId);
      if (response.success && response.data) {
        // Handle response - designationlList is now object[] with PascalCase properties
        // Sort by order number in ascending order
        const desList = (response.data.designationlList || []).sort(
          (a: Designation, b: Designation) =>
            (a.HRMDES_Order || 0) - (b.HRMDES_Order || 0)
        );
        setDesignations(desList);
      } else {
        setDesignations([]);
      }
    } catch (error) {
      console.error("Error loading designations:", error);
      setDesignations([]);
    }
  };

  const loadGrades = async () => {
    try {
      const response = await getOnloadGradeDetails(roleId);
      if (response.success && response.data) {
        // Handle response - gradelList is now object[] with PascalCase properties
        // Sort by order number in ascending order
        const gradeList = (response.data.gradelList || []).sort(
          (a: Grade, b: Grade) => (a.HRMG_Order || 0) - (b.HRMG_Order || 0)
        );
        setGrades(gradeList);
      } else {
        setGrades([]);
      }
    } catch (error) {
      console.error("Error loading grades:", error);
      setGrades([]);
    }
  };

  // Group Type Order Management Functions
  const handleGroupTypeSetOrderClick = () => {
    if (isGroupTypeOrderEditing) {
      // Save the order changes
      handleGroupTypeSaveOrder();
    } else {
      // Start editing mode
      setIsGroupTypeOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      groupTypes.forEach((groupType) => {
        initialOrderValues[groupType.HRMGT_Id] = groupType.HRMGT_Order || 0;
      });
      setGroupTypeOrderValues(initialOrderValues);
      toast.info(
        "Order editing mode enabled. Click Set Order again to save changes."
      );
    }
  };

  const handleGroupTypeOrderChange = (id: number, value: number) => {
    setGroupTypeOrderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGroupTypeSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Import the save function
      const { saveMasterGroupType } = await import(
        "@/types/hrms/master-group-type"
      );

      // Update each group type with new order
      const updatePromises = Object.entries(groupTypeOrderValues).map(
        async ([id, order]) => {
          const groupType = groupTypes.find(
            (gt) => gt.HRMGT_Id === parseInt(id)
          );
          if (groupType && groupType.HRMGT_Order !== order) {
            const updateData = {
              HRMGT_Id: groupType.HRMGT_Id,
              MI_Id: groupType.MI_Id,
              HRMGT_EmployeeGroupType: groupType.HRMGT_EmployeeGroupType,
              HRMGT_Code: groupType.HRMGT_Code,
              HRMGT_ActiveFlag: groupType.HRMGT_ActiveFlag,
              HRMGT_Order: order,
            };

            return saveMasterGroupType(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} group types`
        );
        setIsGroupTypeOrderEditing(false);
        setGroupTypeOrderValues({});
        // Reload data to reflect changes
        loadGroupTypes();
      } else {
        toast.info("No order changes detected");
        setIsGroupTypeOrderEditing(false);
        setGroupTypeOrderValues({});
      }
    } catch (error: any) {
      console.error("Save order error:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  // Department Order Management Functions
  const handleDepartmentSetOrderClick = () => {
    if (isDepartmentOrderEditing) {
      // Save the order changes
      handleDepartmentSaveOrder();
    } else {
      // Start editing mode
      setIsDepartmentOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      departments.forEach((department) => {
        initialOrderValues[department.HRMD_Id] = department.HRMD_Order || 0;
      });
      setDepartmentOrderValues(initialOrderValues);
      toast.info(
        "Order editing mode enabled. Click Set Order again to save changes."
      );
    }
  };

  const handleDepartmentOrderChange = (id: number, value: number) => {
    setDepartmentOrderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDepartmentSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Import the save function
      const { saveMasterDepartment } = await import(
        "@/types/hrms/master-department"
      );

      // Update each department with new order
      const updatePromises = Object.entries(departmentOrderValues).map(
        async ([id, order]) => {
          const department = departments.find(
            (dept) => dept.HRMD_Id === parseInt(id)
          );
          if (department && department.HRMD_Order !== order) {
            const updateData = {
              HRMD_Id: department.HRMD_Id,
              MI_Id: department.MI_Id,
              HRMD_DepartmentName: department.HRMD_DepartmentName,
              HRMD_ActiveFlag: department.HRMD_ActiveFlag,
              HRMD_Order: order,
              HRMD_InternalTrainingMinimumHrs:
                department.HRMD_InternalTrainingMinimumHrs,
            };

            return saveMasterDepartment(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} departments`
        );
        setIsDepartmentOrderEditing(false);
        setDepartmentOrderValues({});
        // Reload data to reflect changes
        loadDepartments();
      } else {
        toast.info("No order changes detected");
        setIsDepartmentOrderEditing(false);
        setDepartmentOrderValues({});
      }
    } catch (error: any) {
      console.error("Save order error:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  // Designation Order Management Functions
  const handleDesignationSetOrderClick = () => {
    if (isDesignationOrderEditing) {
      // Save the order changes
      handleDesignationSaveOrder();
    } else {
      // Start editing mode
      setIsDesignationOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      designations.forEach((designation) => {
        initialOrderValues[designation.HRMDES_Id] =
          designation.HRMDES_Order || 0;
      });
      setDesignationOrderValues(initialOrderValues);
      toast.info(
        "Order editing mode enabled. Click Set Order again to save changes."
      );
    }
  };

  const handleDesignationOrderChange = (id: number, value: number) => {
    setDesignationOrderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDesignationSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Import the save function
      const { saveMasterDesignation } = await import(
        "@/types/hrms/master-designation"
      );

      // Update each designation with new order
      const updatePromises = Object.entries(designationOrderValues).map(
        async ([id, order]) => {
          const designation = designations.find(
            (des) => des.HRMDES_Id === parseInt(id)
          );
          if (designation && designation.HRMDES_Order !== order) {
            const updateData = {
              HRMDES_Id: designation.HRMDES_Id,
              MI_Id: designation.MI_Id,
              HRMDES_DesignationName: designation.HRMDES_DesignationName,
              HRMDES_BasicAmount: designation.HRMDES_BasicAmount,
              HRMDES_SanctionedSeats: designation.HRMDES_SanctionedSeats,
              HRMDES_DisplaySanctionedSeatsFlag:
                designation.HRMDES_DisplaySanctionedSeatsFlag,
              HRMDES_ActiveFlag: designation.HRMDES_ActiveFlag,
              HRMDES_Order: order,
              designationlList: [],
              retrunMsg: "",
              roleId: roleId,
              DesignationDTO: [],
            };

            return saveMasterDesignation(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(
          `Successfully updated order for ${successCount} designations`
        );
        setIsDesignationOrderEditing(false);
        setDesignationOrderValues({});
        // Reload data to reflect changes
        loadDesignations();
      } else {
        toast.info("No order changes detected");
        setIsDesignationOrderEditing(false);
        setDesignationOrderValues({});
      }
    } catch (error: any) {
      console.error("Save order error:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  // Grade Order Management Functions
  const handleGradeSetOrderClick = () => {
    if (isGradeOrderEditing) {
      // Save the order changes
      handleGradeSaveOrder();
    } else {
      // Start editing mode
      setIsGradeOrderEditing(true);
      // Initialize order values with current values
      const initialOrderValues: Record<number, number> = {};
      grades.forEach((grade) => {
        initialOrderValues[grade.HRMG_Id] = grade.HRMG_Order || 0;
      });
      setGradeOrderValues(initialOrderValues);
      toast.info(
        "Order editing mode enabled. Click Set Order again to save changes."
      );
    }
  };

  const handleGradeOrderChange = (id: number, value: number) => {
    setGradeOrderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGradeSaveOrder = async () => {
    try {
      setIsLoading(true);

      // Import the save function
      const { saveMasterGrade } = await import("@/types/hrms/master-grade");

      // Update each grade with new order
      const updatePromises = Object.entries(gradeOrderValues).map(
        async ([id, order]) => {
          const grade = grades.find((g) => g.HRMG_Id === parseInt(id));
          if (grade && grade.HRMG_Order !== order) {
            const updateData = {
              HRMG_Id: grade.HRMG_Id,
              MI_Id: grade.MI_Id,
              HRMG_GradeName: grade.HRMG_GradeName,
              HRMG_GradeDisplayName: grade.HRMG_GradeDisplayName,
              HRMG_PayScaleRange: grade.HRMG_PayScaleRange,
              HRMG_PayScaleFrom: grade.HRMG_PayScaleFrom,
              HRMG_IncrementOf: grade.HRMG_IncrementOf,
              HRMG_PayScaleTo: grade.HRMG_PayScaleTo,
              HRMG_ActiveFlag: grade.HRMG_ActiveFlag,
              HRMG_Order: order,
              gradelList: [],
              retrunMsg: "",
              roleId: roleId,
              GradeDTO: [],
            };

            return saveMasterGrade(updateData);
          }
          return null;
        }
      );

      const results = await Promise.all(updatePromises.filter(Boolean));
      const successCount = results.filter((r) => r?.success).length;

      if (successCount > 0) {
        toast.success(`Successfully updated order for ${successCount} grades`);
        setIsGradeOrderEditing(false);
        setGradeOrderValues({});
        // Reload data to reflect changes
        loadGrades();
      } else {
        toast.info("No order changes detected");
        setIsGradeOrderEditing(false);
        setGradeOrderValues({});
      }
    } catch (error: any) {
      console.error("Save order error:", error);
      toast.error("Failed to save order changes");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete based on active tab
  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      switch (activeTab) {
        case "employee-type":
          // Note: Delete operation would need to be implemented in the API
          toast.info(
            "Delete operation is not yet implemented in the Employee Type API"
          );
          break;
        case "group-type":
          groupTypeDB.remove(deleteId);
          toast.success("Group type deleted successfully");
          break;
        case "department":
          departmentDB.remove(deleteId);
          toast.success("Department deleted successfully");
          break;
        case "designation":
          designationDB.remove(deleteId);
          toast.success("Designation deleted successfully");
          break;
        case "grade":
          gradeDB.remove(deleteId);
          toast.success("Grade deleted successfully");
          break;
      }
      setDeleteId(null);
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  // Tab navigation
  const tabs = [
    { id: "employee-type", label: "Master Employee Type" },
    { id: "group-type", label: "Master Group Type" },
    { id: "department", label: "Master Department" },
    { id: "designation", label: "Master Designation" },
    { id: "grade", label: "Master Grade" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex-between flex-wrap gap-4">
          <Heading
            title="Employee Category Management"
            description="Manage different types of employee categories and classifications"
          />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container p-1 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Heading
              title="Employee Category Management"
              description="Manage different types of employee categories and classifications"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleAddButtonClick}
              size="lg"
              className="transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-fit"
            >
              <Plus className="h-4 w-4" />
              {currentTabTitles.buttonText}
            </Button>
          </div>
        </div>

        {/* Data Table Section - Collapsible but default open */}
        <CollapsibleSection
          title="Employee Categories Data"
          description="View, search, and manage all employee categories in the system"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
          headerClassName=""
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="employee-type">
              {console.log("=== RENDERING EMPLOYEE TYPE TAB ===")}
              {console.log("Employee Types Data:", employeeTypes)}
              {console.log("Employee Types Length:", employeeTypes.length)}
              {console.log("Employee Types Type:", typeof employeeTypes)}
              {employeeTypes.length > 0 &&
                console.log("First Employee Type:", employeeTypes[0])}
              <EmployeeTypeTab
                data={employeeTypes}
                formData={employeeTypeForm}
                setFormData={setEmployeeTypeForm}
                onRefresh={fetchAllData}
                db={employeeTypeDB}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                isFormMinimized={isFormMinimized}
                setIsFormMinimized={setIsFormMinimized}
              />
            </TabsContent>

            <TabsContent value="group-type">
              <GroupTypeTab
                data={groupTypes}
                formData={groupTypeForm}
                setFormData={setGroupTypeForm}
                onRefresh={fetchAllData}
                db={groupTypeDB}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                isFormMinimized={isFormMinimized}
                setIsFormMinimized={setIsFormMinimized}
                isOrderEditing={isGroupTypeOrderEditing}
                orderValues={groupTypeOrderValues}
                onOrderChange={handleGroupTypeOrderChange}
                onSetOrderClick={handleGroupTypeSetOrderClick}
              />
            </TabsContent>

            <TabsContent value="department">
              <DepartmentTab
                data={departments}
                formData={departmentForm}
                setFormData={setDepartmentForm}
                onRefresh={fetchAllData}
                db={departmentDB}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                isFormMinimized={isFormMinimized}
                setIsFormMinimized={setIsFormMinimized}
                isOrderEditing={isDepartmentOrderEditing}
                orderValues={departmentOrderValues}
                onOrderChange={handleDepartmentOrderChange}
                onSetOrderClick={handleDepartmentSetOrderClick}
              />
            </TabsContent>

            <TabsContent value="designation">
              <DesignationTab
                data={designations}
                formData={designationForm}
                setFormData={setDesignationForm}
                onRefresh={fetchAllData}
                db={designationDB}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                isFormMinimized={isFormMinimized}
                setIsFormMinimized={setIsFormMinimized}
                isOrderEditing={isDesignationOrderEditing}
                orderValues={designationOrderValues}
                onOrderChange={handleDesignationOrderChange}
                onSetOrderClick={handleDesignationSetOrderClick}
              />
            </TabsContent>

            <TabsContent value="grade">
              <GradeTab
                data={grades}
                formData={gradeForm}
                setFormData={setGradeForm}
                onRefresh={fetchAllData}
                db={gradeDB}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteId={deleteId}
                setDeleteId={setDeleteId}
                isFormMinimized={isFormMinimized}
                setIsFormMinimized={setIsFormMinimized}
                isOrderEditing={isGradeOrderEditing}
                orderValues={gradeOrderValues}
                onOrderChange={handleGradeOrderChange}
                onSetOrderClick={handleGradeSetOrderClick}
              />
            </TabsContent>
          </Tabs>
        </CollapsibleSection>

        {/* Add Form Section - Conditionally Rendered */}
        {!isFormMinimized && (
          <div
            ref={formRef}
            className="slide-in-from-top-4 animate-in duration-300"
          >
            <CollapsibleSection
              title={currentTabTitles.formTitle}
              description={currentTabTitles.formDescription}
              defaultOpen={true}
              variant="outline"
              size="md"
              className="shadow-lg"
              headerClassName=""
            >
              <div className="relative">
                <Button
                  onClick={() => setIsFormMinimized(true)}
                  variant="ghost"
                  size="sm"
                  className="-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 text-destructive" /> Close
                </Button>
                <div className="max-w-full">
                  {activeTab === "employee-type" && (
                    <EmployeeTypeForm
                      roleId={roleId}
                      editingId={editingId}
                      initialEmployeeType={employeeTypeForm.employeeType}
                      initialIsActive={employeeTypeForm.isActive}
                      onSuccess={() => {
                        setEditingId(null);
                        setIsFormMinimized(true);
                        fetchAllData();
                      }}
                    />
                  )}
                  {activeTab === "group-type" && (
                    <GroupTypeForm
                      roleId={roleId}
                      editingId={editingId}
                      initialGroupType={groupTypeForm.groupType}
                      initialGroupCode={groupTypeForm.groupCode}
                      initialOrder={groupTypeForm.order}
                      initialIsActive={groupTypeForm.isActive}
                      onSuccess={() => {
                        setEditingId(null);
                        setIsFormMinimized(true);
                        fetchAllData();
                      }}
                    />
                  )}
                  {activeTab === "department" && (
                    <DepartmentForm
                      roleId={roleId}
                      editingId={editingId}
                      initialDepartmentName={departmentForm.departmentName}
                      initialInternalTrainingHours={
                        departmentForm.internalTrainingHours
                      }
                      initialOrder={departmentForm.order}
                      initialIsActive={departmentForm.isActive}
                      onSuccess={() => {
                        setEditingId(null);
                        setIsFormMinimized(true);
                        fetchAllData();
                      }}
                    />
                  )}
                  {activeTab === "designation" && (
                    <DesignationForm
                      roleId={roleId}
                      editingId={editingId}
                      initialDesignationName={designationForm.designationName}
                      initialBasicAmount={designationForm.basicAmount}
                      initialSanctionedSeats={designationForm.sanctionedSeats}
                      initialDisplaySanctionedSeats={
                        designationForm.displaySanctionedSeats
                      }
                      initialOrder={designationForm.order}
                      initialIsActive={designationForm.isActive}
                      onSuccess={() => {
                        setEditingId(null);
                        setIsFormMinimized(true);
                        fetchAllData();
                      }}
                    />
                  )}
                  {activeTab === "grade" && (
                    <GradeForm
                      roleId={roleId}
                      editingId={editingId}
                      initialGradeName={gradeForm.gradeName}
                      initialGradeDisplayName={gradeForm.gradeDisplayName}
                      initialPayScaleFrom={gradeForm.payScaleFrom}
                      initialIncrementOf={gradeForm.incrementOf}
                      initialPayScaleTo={gradeForm.payScaleTo}
                      initialPayScaleRange={gradeForm.payScaleRange}
                      initialOrder={gradeForm.order}
                      initialIsActive={gradeForm.isActive}
                      onSuccess={() => {
                        setEditingId(null);
                        setIsFormMinimized(true);
                        fetchAllData();
                      }}
                    />
                  )}
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Global Delete Confirmation */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={() => setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete record?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
