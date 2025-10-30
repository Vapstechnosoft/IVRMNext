"use client";

import { Heading } from "@/components/layout/heading";
import { Button } from "@/components/ui/button";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import { MultiSelect } from "@/components/ui/multi-select";
import { InputText } from "@/components/ui/extension/input-text";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Printer, User } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  getEmployeeProfileReportOnload,
  searchEmployeeProfileDetails,
  filterEmployeesBySelection,
} from "@/server/hrms/hrmsConfig/reports/employee-profile-report";
import type {
  GroupTypeDropdown,
  DepartmentDropdown,
  DesignationDropdown,
  EmployeeDropdown,
} from "@/types/hrms/employee-profile-report";
import Image from "next/image";

export default function EmployeeProfileReportPage() {
  const [roleId] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  // Dropdown data
  const [groupTypes, setGroupTypes] = useState<GroupTypeDropdown[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdown[]>([]);
  const [designations, setDesignations] = useState<DesignationDropdown[]>([]);
  const [employees, setEmployees] = useState<EmployeeDropdown[]>([]);

  // Filter states (multi-select)
  const [selectedGroupTypes, setSelectedGroupTypes] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [selectedDesignations, setSelectedDesignations] = useState<number[]>(
    []
  );
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  // Employee search
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<
    EmployeeDropdown[]
  >([]);

  // Selected employee details
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] =
    useState<any>(null);

  // Load data on mount
  useEffect(() => {
    loadOnloadData();
  }, []);

  const handleFilterEmployees = useCallback(async () => {
    try {
      const request = {
        MI_Id: roleId,
        LogInUserId: 2,
        hrmgT_IdList: selectedGroupTypes.length > 0 ? selectedGroupTypes : [0],
        hrmD_IdList: selectedDepartments.length > 0 ? selectedDepartments : [0],
        hrmdeS_IdList:
          selectedDesignations.length > 0 ? selectedDesignations : [0],
      };

      const response = await filterEmployeesBySelection(request);

      if (response.success && response.data.employeedropdown) {
        setEmployees(response.data.employeedropdown);
        setFilteredEmployees(response.data.employeedropdown);
      }
    } catch (error: any) {
      console.error("Error filtering employees:", error);
      toast.error("Failed to filter employees");
    }
  }, [roleId, selectedGroupTypes, selectedDepartments, selectedDesignations]);

  // Filter employees when criteria change
  useEffect(() => {
    handleFilterEmployees();
  }, [handleFilterEmployees]);

  // Filter employees based on search query
  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.HRME_EmployeeCode.toLowerCase().includes(
          employeeSearchQuery.toLowerCase()
        ) ||
        `${emp.HRME_EmployeeFirstName} ${emp.HRME_EmployeeMiddleName || ""} ${
          emp.HRME_EmployeeLastName || ""
        }`
          .toLowerCase()
          .includes(employeeSearchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employeeSearchQuery, employees]);

  const loadOnloadData = async () => {
    try {
      setIsLoading(true);
      const response = await getEmployeeProfileReportOnload(roleId);

      if (response.success && response.data) {
        setGroupTypes(response.data.groupTypedropdown || []);
        setDepartments(response.data.departmentdropdown || []);
        setDesignations(response.data.designationdropdown || []);
        setEmployees(response.data.employeedropdown || []);
        setFilteredEmployees(response.data.employeedropdown || []);
      } else {
        toast.error("Failed to load data");
      }
    } catch (error: any) {
      console.error("Error loading onload data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setIsLoading(true);
      const request = {
        MI_Id: roleId,
        groupTypeIds: selectedGroupTypes,
        departmentIds: selectedDepartments,
        designationIds: selectedDesignations,
        employeeIds: [selectedEmployee],
        roleId: roleId,
      };

      const response = await searchEmployeeProfileDetails(request);

      if (response.success && response.data) {
        // Map the API response to our display format
        const employeeData = response.data;

        // Get the selected employee from the employees list
        const employee = employees.find(
          (emp) => emp.HRME_Id === selectedEmployee
        );

        if (employee) {
          // Map the API response fields to our display format
          const details = {
            EmployeeCode: employee.HRME_EmployeeCode,
            EmployeeName: `${employee.HRME_EmployeeFirstName} ${
              employee.HRME_EmployeeMiddleName || ""
            } ${employee.HRME_EmployeeLastName || ""}`.trim(),
            Designation:
              designations.find((d) => d.HRMDES_Id === employee.HRMDES_Id)
                ?.HRMDES_DesignationName || "-",
            InstitutionName: employeeData.institutionDetails?.MI_Name || "-",
            ContactDetails: employee.HRME_MobileNo
              ? [employee.HRME_MobileNo]
              : [],
            EmailId: employee.HRME_EmailID || "-",
            JoinDate: employee.HRME_DateOfJoining
              ? new Date(employee.HRME_DateOfJoining).toLocaleDateString()
              : "-",
            LeftDate: employee.HRME_DateOfLeaving
              ? new Date(employee.HRME_DateOfLeaving).toLocaleDateString()
              : "-",
            TotalServiceDays: employee.HRME_DateOfJoining
              ? Math.floor(
                  (new Date().getTime() -
                    new Date(employee.HRME_DateOfJoining).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0,
            BloodGroup: "-",
            Address: "-",
            Age: "-",
            Religion: "-",
            DOB: "-",
            AadharCardNumber: "-",
            FatherName: "-",
            ProfilePhoto: employee.HRME_ProfilePhoto,
          };

          setSelectedEmployeeDetails(details);
          setShowReport(true);
          toast.success("Employee profile details retrieved successfully");
        } else {
          toast.error("Employee not found");
        }
      } else {
        toast.error("Failed to retrieve employee details");
      }
    } catch (error: any) {
      console.error("Error searching employee details:", error);
      toast.error("Failed to retrieve employee details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedGroupTypes([]);
    setSelectedDepartments([]);
    setSelectedDesignations([]);
    setSelectedEmployee(null);
    setEmployeeSearchQuery("");
    setShowReport(false);
    setSelectedEmployeeDetails(null);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  // Get employee name
  const getEmployeeName = (employee: EmployeeDropdown) => {
    return `${employee.HRME_EmployeeFirstName} ${
      employee.HRME_EmployeeMiddleName || ""
    } ${employee.HRME_EmployeeLastName || ""}`.trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex-between flex-wrap gap-4">
        <Heading
          title="Employee Profile Report"
          description="Generate comprehensive employee profile reports"
        />
      </div>

      {/* Employee Selection Section */}
      {!showReport && (
        <CollapsibleSection
          title="EMPLOYEE PROFILE REPORT"
          description="Select group, department, designation, and employee to generate the report"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="space-y-6">
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Group Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Group Type: All
                </label>
                <MultiSelect
                  options={groupTypes.map((gt) => ({
                    label: gt.HRMGT_EmployeeGroupType,
                    value: gt.HRMGT_Id.toString(),
                  }))}
                  selected={selectedGroupTypes.map((id) => id.toString())}
                  onChange={(values) =>
                    setSelectedGroupTypes(values.map((v) => parseInt(v)))
                  }
                  placeholder="Select group types"
                />
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Department: All
                </label>
                <MultiSelect
                  options={departments.map((dept) => ({
                    label: dept.HRMD_DepartmentName,
                    value: dept.HRMD_Id.toString(),
                  }))}
                  selected={selectedDepartments.map((id) => id.toString())}
                  onChange={(values) =>
                    setSelectedDepartments(values.map((v) => parseInt(v)))
                  }
                  placeholder="Select departments"
                />
              </div>

              {/* Designation Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Designation: All
                </label>
                <MultiSelect
                  options={designations.map((desg) => ({
                    label: desg.HRMDES_DesignationName,
                    value: desg.HRMDES_Id.toString(),
                  }))}
                  selected={selectedDesignations.map((id) => id.toString())}
                  onChange={(values) =>
                    setSelectedDesignations(values.map((v) => parseInt(v)))
                  }
                  placeholder="Select designations"
                />
              </div>
            </div>

            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Employee: All
              </label>
              <div className="space-y-2">
                <InputText
                  type="text"
                  placeholder="search here..."
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                />
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.HRME_Id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`employee-${employee.HRME_Id}`}
                        checked={selectedEmployee === employee.HRME_Id}
                        onCheckedChange={(checked) => {
                          setSelectedEmployee(
                            checked ? employee.HRME_Id : null
                          );
                        }}
                      />
                      <label
                        htmlFor={`employee-${employee.HRME_Id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {getEmployeeName(employee)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="transition-all duration-200 hover:scale-105 w-fit"
              >
                <Search className="mr-2 h-4 w-4" />
                SHOW DETAILS
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="transition-all duration-200 hover:scale-105 w-fit"
              >
                <X className="mr-2 h-4 w-4" />
                CANCEL
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Employee Profile Report Section */}
      {showReport && selectedEmployeeDetails && (
        <CollapsibleSection
          title="EMPLOYEE PROFILE REPORT"
          description="Employee profile details"
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <div className="space-y-6">
            {/* School Header */}
            <div className="text-center space-y-1 border-b pb-4">
              <h2 className="text-2xl font-bold">VAPS SCHOOL</h2>
              <p>3, CHURCH ROAD, WEST BENGAL, INDIA</p>
              <p>HOWRAH - 711101.</p>
              <p className="text-sm font-semibold">EMPLOYEE PROFILE REPORT</p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Employee Code:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.EmployeeCode || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Name of Employee:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.EmployeeName || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Designation:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.Designation || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Institution Name:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.InstitutionName || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Contact Details:
                    </p>
                    <p className="text-sm">
                      {(selectedEmployeeDetails.ContactDetails || []).join(
                        ", "
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email-Id:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.EmailId || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Join Date:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.JoinDate || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Left Date:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.LeftDate || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total no. Of Service:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.TotalServiceDays || "-"} Days
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Blood Group:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.BloodGroup || "-"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Address:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.Address || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Age:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.Age || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Religion:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.Religion || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      DOB:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.DOB || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      AadharCard Number:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.AadharCardNumber || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Father Name:
                    </p>
                    <p className="text-sm">
                      {selectedEmployeeDetails.FatherName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Section */}
              <div className="flex flex-col items-center justify-start space-y-4">
                <div className="w-48 h-48 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {selectedEmployeeDetails.ProfilePhoto ? (
                    <img
                      src={selectedEmployeeDetails.ProfilePhoto}
                      alt="Employee Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Signature of Nodal Officer
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="transition-all duration-200 hover:scale-105 w-fit"
              >
                <Printer className="mr-2 h-4 w-4" />
                PRINT
              </Button>
              <Button
                onClick={handleCancel}
                className="transition-all duration-200 hover:scale-105 w-fit"
              >
                <X className="mr-2 h-4 w-4" />
                CANCEL
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
