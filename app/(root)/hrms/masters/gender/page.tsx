"use client";

import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  FormProvider,
  useFormContext,
} from "@/components/ui/form/form-provider";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterGender } from "@/hooks/hrms/useMasterGender";
import type {
  GenderItem,
  MasterGenderResponse,
} from "@/types/hrms/master-gender";
import { Plus, X } from "lucide-react";
import GenderForm from "./_components/gender-form";
import { columns } from "./_components/columns";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterGenderPage(_props: {
  searchParams: SearchParams;
}) {
  const roleId = HRMS_MI_ID;
  const { listQuery } = useMasterGender(roleId);

  return (
    <FormProvider<MasterGenderResponse>>
      <MasterGenderPageContent
        response={listQuery.data}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
      />
    </FormProvider>
  );
}

function MasterGenderPageContent({
  response,
  isLoading,
  error,
}: {
  response: any;
  isLoading: boolean;
  error: any;
}) {
  const { openAddForm } = useFormContext<MasterGenderResponse>();
  const rows: GenderItem[] = response?.data?.genderList ?? [];

  return (
    <div className="min-h-screen">
      <div className="container space-y-4 p-1">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={openAddForm}
            className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Add Gender
          </Button>
        </div>

        <CollapsibleSection
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <GenericDataTable<GenderItem>
            data={rows}
            totalItems={rows.length}
            columns={columns}
            isLoading={isLoading}
            error={error}
            columnPinning={{ right: ["actions"] }}
            loadingMessage="Loading genders..."
            noDataTitle="No Genders Found"
            noDataDescription="Get started by creating your first gender"
            errorTitle="Error Loading Genders"
          />
        </CollapsibleSection>

        <FormSections />
      </div>
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
  } = useFormContext<MasterGenderResponse>();

  return (
    <>
      {isAddFormOpen && (
        <div ref={addFormRef}>
          <CollapsibleSection
            title="Add New Gender"
            description="Fill in the details below to create a new gender"
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
              <GenderForm onSuccess={closeAddForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}

      {isEditFormOpen && selectedRow && (
        <div ref={editFormRef}>
          <CollapsibleSection
            title="Edit Gender"
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
              <GenderForm selectedRow={selectedRow} onSuccess={closeEditForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}
    </>
  );
}
