"use client";

import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  FormProvider,
  useFormContext,
} from "@/components/ui/form/form-provider";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterLoan } from "@/hooks/hrms/useMasterLoan";
import type {
  MasterLoanDetail,
  MasterLoanResponse,
} from "@/types/hrms/master-loan";
import { Plus, X } from "lucide-react";
import LoanForm from "./_components/loan-form";
import { columns } from "./_components/columns";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterLoanPage(_props: { searchParams: SearchParams }) {
  const roleId = HRMS_MI_ID;
  const { listQuery } = useMasterLoan(roleId);

  return (
    <FormProvider<MasterLoanResponse>>
      <MasterLoanPageContent
        response={listQuery.data}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
      />
    </FormProvider>
  );
}

function MasterLoanPageContent({
  response,
  isLoading,
  error,
}: {
  response: any;
  isLoading: boolean;
  error: any;
}) {
  const { openAddForm } = useFormContext<MasterLoanResponse>();
  const rows: MasterLoanDetail[] = response?.data?.gmasterloanList ?? [];

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
            Add Loan Type
          </Button>
        </div>

        <CollapsibleSection
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <GenericDataTable<MasterLoanDetail>
            data={rows}
            totalItems={rows.length}
            columns={columns}
            isLoading={isLoading}
            error={error}
            columnPinning={{ right: ["actions"] }}
            loadingMessage="Loading loan types..."
            noDataTitle="No Loan Types Found"
            noDataDescription="Get started by creating your first loan type"
            errorTitle="Error Loading Loan Types"
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
  } = useFormContext<MasterLoanResponse>();

  return (
    <>
      {isAddFormOpen && (
        <div ref={addFormRef}>
          <CollapsibleSection
            title="Add New Loan Type"
            description="Fill in the details below to create a new loan type"
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
              <LoanForm onSuccess={closeAddForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}

      {isEditFormOpen && selectedRow && (
        <div ref={editFormRef}>
          <CollapsibleSection
            title="Edit Loan Type"
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
              <LoanForm selectedRow={selectedRow} onSuccess={closeEditForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}
    </>
  );
}
