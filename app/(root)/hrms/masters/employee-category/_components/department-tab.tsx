"use client";

import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  FormProvider,
  useFormContext,
} from "@/components/ui/form/form-provider";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterDepartment } from "@/hooks/hrms/useMasterDepartment";
import type {
  DepartmentDetail,
  MasterDepartmentResponse,
} from "@/types/hrms/master-department";
import { Plus, X } from "lucide-react";
import DepartmentForm from "../../department/_components/department-form";
import { columns } from "../../department/_components/columns";

export default function DepartmentTab() {
  const roleId = HRMS_MI_ID;
  const { listQuery } = useMasterDepartment(roleId);

  return (
    <FormProvider<MasterDepartmentResponse>>
      <DepartmentTabContent
        response={listQuery.data}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
      />
    </FormProvider>
  );
}

function DepartmentTabContent({
  response,
  isLoading,
  error,
}: {
  response: any;
  isLoading: boolean;
  error: any;
}) {
  const { openAddForm } = useFormContext<MasterDepartmentResponse>();
  const rows: DepartmentDetail[] = response?.data?.departmentList ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Department Data</h3>
          <p className="text-muted-foreground text-sm">
            View, search, and manage all departments in the system
          </p>
        </div>
        <Button
          type="button"
          onClick={openAddForm}
          className="shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <CollapsibleSection
        defaultOpen={true}
        variant="default"
        size="lg"
        className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
      >
        <GenericDataTable<DepartmentDetail>
          data={rows}
          totalItems={rows.length}
          columns={columns}
          isLoading={isLoading}
          error={error}
          columnPinning={{ right: ["actions"] }}
          loadingMessage="Loading departments..."
          noDataTitle="No Departments Found"
          noDataDescription="Get started by creating your first department"
          errorTitle="Error Loading Departments"
        />
      </CollapsibleSection>

      <FormSections />
    </div>
  );
}

function FormSections() {
  const {
    isAddFormOpen,
    isEditFormOpen,
    selectedRow,
    closeAddForm,
    closeEditForm,
    addFormRef,
    editFormRef,
  } = useFormContext<MasterDepartmentResponse>();

  return (
    <>
      {isAddFormOpen && (
        <div ref={addFormRef}>
          <CollapsibleSection
            title="Add New Department"
            description="Fill in the details below to create a new department"
            defaultOpen={true}
            variant="outline"
            size="md"
            className="slide-in-from-top-4 animate-in shadow-lg duration-300"
          >
            <div className="relative">
              <Button
                type="button"
                onClick={closeAddForm}
                variant="ghost"
                size="sm"
                className="-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-destructive" /> Close
              </Button>
              <DepartmentForm onSuccess={closeAddForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}

      {isEditFormOpen && selectedRow && (
        <div ref={editFormRef}>
          <CollapsibleSection
            title="Edit Department"
            defaultOpen={true}
            variant="outline"
            size="md"
            className="slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300"
          >
            <div className="relative">
              <Button
                type="button"
                onClick={closeEditForm}
                variant="ghost"
                size="sm"
                className="-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-destructive" /> Close
              </Button>
              <DepartmentForm
                selectedRow={selectedRow}
                onSuccess={closeEditForm}
              />
            </div>
          </CollapsibleSection>
        </div>
      )}
    </>
  );
}
