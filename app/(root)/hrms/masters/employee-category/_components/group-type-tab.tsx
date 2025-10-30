"use client";

import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  FormProvider,
  useFormContext,
} from "@/components/ui/form/form-provider";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterGroupType } from "@/hooks/hrms/useMasterGroupType";
import type {
  GroupTypeDetail,
  MasterGroupTypeResponse,
} from "@/types/hrms/master-group-type";
import { Plus, X } from "lucide-react";
import GroupTypeForm from "../../group-type/_components/group-type-form";
import { columns } from "../../group-type/_components/columns";

export default function GroupTypeTab() {
  const roleId = HRMS_MI_ID;
  const { listQuery } = useMasterGroupType(roleId);

  return (
    <FormProvider<MasterGroupTypeResponse>>
      <GroupTypeTabContent
        response={listQuery.data}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
      />
    </FormProvider>
  );
}

function GroupTypeTabContent({
  response,
  isLoading,
  error,
}: {
  response: any;
  isLoading: boolean;
  error: any;
}) {
  const { openAddForm } = useFormContext<MasterGroupTypeResponse>();
  const rows: GroupTypeDetail[] = response?.data?.grouptypeList ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Group Type Data</h3>
          <p className="text-muted-foreground text-sm">
            View, search, and manage all group types in the system
          </p>
        </div>
        <Button
          type="button"
          onClick={openAddForm}
          className="shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Add Group Type
        </Button>
      </div>

      <CollapsibleSection
        defaultOpen={true}
        variant="default"
        size="lg"
        className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
      >
        <GenericDataTable<GroupTypeDetail>
          data={rows}
          totalItems={rows.length}
          columns={columns}
          isLoading={isLoading}
          error={error}
          columnPinning={{ right: ["actions"] }}
          loadingMessage="Loading group types..."
          noDataTitle="No Group Types Found"
          noDataDescription="Get started by creating your first group type"
          errorTitle="Error Loading Group Types"
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
  } = useFormContext<MasterGroupTypeResponse>();

  return (
    <>
      {isAddFormOpen && (
        <div ref={addFormRef}>
          <CollapsibleSection
            title="Add New Group Type"
            description="Fill in the details below to create a new group type"
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
              <GroupTypeForm onSuccess={closeAddForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}

      {isEditFormOpen && selectedRow && (
        <div ref={editFormRef}>
          <CollapsibleSection
            title="Edit Group Type"
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
              <GroupTypeForm
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
