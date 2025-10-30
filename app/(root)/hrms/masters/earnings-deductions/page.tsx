"use client";

import { Button } from "@/components/ui/button";
import { GenericDataTable } from "@/components/ui/data-table/generic-data-table";
import { CollapsibleSection } from "@/components/ui/form/collapsible-section";
import {
  FormProvider,
  useFormContext,
} from "@/components/ui/form/form-provider";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterEarningsDeductions } from "@/hooks/hrms/useMasterEarningsDeductions";
import type {
  EarningsDeductionDetail,
  MasterEarningsDeductionsResponse,
} from "@/types/hrms/master-earnings-deductions";
import { ListOrdered, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EarningsDeductionsForm from "./_components/earnings-deductions-form";
import { columns, getEditableColumns } from "./_components/columns";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterEarningsDeductionsPage(_props: {
  searchParams: SearchParams;
}) {
  const roleId = HRMS_MI_ID;
  const { listQuery } = useMasterEarningsDeductions(roleId);

  return (
    <FormProvider<MasterEarningsDeductionsResponse>>
      <MasterEarningsDeductionsPageContent
        response={listQuery.data}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
      />
    </FormProvider>
  );
}

function MasterEarningsDeductionsPageContent({
  response,
  isLoading,
  error,
}: {
  response: any;
  isLoading: boolean;
  error: any;
}) {
  const { openAddForm } = useFormContext<MasterEarningsDeductionsResponse>();
  const { saveOrderMutation } = useMasterEarningsDeductions(HRMS_MI_ID);
  const rows: EarningsDeductionDetail[] =
    response?.data?.earningdetectionList ?? [];

  const [isEditOrderMode, setIsEditOrderMode] = useState(false);
  const [editedRows, setEditedRows] = useState<EarningsDeductionDetail[]>([]);

  const handleSetOrder = () => {
    setIsEditOrderMode(true);
    setEditedRows([...rows]);
  };

  const handleCancelOrder = () => {
    setIsEditOrderMode(false);
    setEditedRows([]);
  };

  const handleSaveOrder = async () => {
    try {
      await saveOrderMutation.mutateAsync(editedRows);
      toast.success("Order saved successfully");
      setIsEditOrderMode(false);
      setEditedRows([]);
    } catch (_error) {
      toast.error("Failed to save order");
    }
  };

  const handleOrderChange = (rowId: number, newOrder: number) => {
    setEditedRows((prev) =>
      prev.map((row) =>
        row.HRMED_Id === rowId ? { ...row, HRMED_Order: newOrder } : row
      )
    );
  };

  const displayColumns = isEditOrderMode
    ? getEditableColumns(handleOrderChange)
    : columns;

  const displayData = isEditOrderMode ? editedRows : rows;

  return (
    <div className="min-h-screen">
      <div className="container space-y-4 p-1">
        <div className="flex justify-end gap-2">
          {isEditOrderMode ? (
            <>
              <Button
                type="button"
                onClick={handleCancelOrder}
                variant="outline"
                className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveOrder}
                disabled={saveOrderMutation.isPending}
                className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Save className="h-4 w-4" />
                {saveOrderMutation.isPending ? "Saving..." : "Save Order"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleSetOrder}
                variant="outline"
                className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <ListOrdered className="h-4 w-4" />
                Set Order
              </Button>
              <Button
                type="button"
                onClick={openAddForm}
                className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Earning/Deduction
              </Button>
            </>
          )}
        </div>

        <CollapsibleSection
          defaultOpen={true}
          variant="default"
          size="lg"
          className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
        >
          <GenericDataTable<EarningsDeductionDetail>
            data={displayData}
            totalItems={displayData.length}
            columns={displayColumns}
            isLoading={isLoading}
            error={error}
            columnPinning={{ right: ["actions"] }}
            loadingMessage="Loading earnings/deductions..."
            noDataTitle="No Earnings/Deductions Found"
            noDataDescription="Get started by creating your first earning/deduction"
            errorTitle="Error Loading Earnings/Deductions"
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
  } = useFormContext<MasterEarningsDeductionsResponse>();

  return (
    <>
      {isAddFormOpen && (
        <div ref={addFormRef}>
          <CollapsibleSection
            title="Add New Earning/Deduction"
            description="Fill in the details below to create a new earning/deduction"
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
              <EarningsDeductionsForm onSuccess={closeAddForm} />
            </div>
          </CollapsibleSection>
        </div>
      )}

      {isEditFormOpen && selectedRow && (
        <div ref={editFormRef}>
          <CollapsibleSection
            title="Edit Earning/Deduction"
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
              <EarningsDeductionsForm
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
