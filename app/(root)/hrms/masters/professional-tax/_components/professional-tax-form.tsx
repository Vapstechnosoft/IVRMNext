import { Button } from "@/components/ui/button";
import { FormError, Label } from "@/components/ui/extension/field";
import { InputNumber } from "@/components/ui/extension/input-number";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterProfessionalTax } from "@/hooks/hrms/useMasterProfessionalTax";
import { PROFESSIONAL_TAX_VALIDATION } from "@/lib/validation/hrms-master-validation";
import type {
  MasterProfessionalTaxInput,
  ProfessionalTaxDetail,
} from "@/types/hrms/master-professional-tax";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfessionalTaxFormProps {
  selectedRow?: ProfessionalTaxDetail;
  onSuccess?: () => void;
}

export default function ProfessionalTaxForm({
  selectedRow,
  onSuccess,
}: ProfessionalTaxFormProps) {
  const roleId = HRMS_MI_ID;
  const { saveMutation } = useMasterProfessionalTax(roleId);
  const isEditMode = !!selectedRow;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MasterProfessionalTaxInput>({
    defaultValues: {
      MI_Id: roleId,
      HRMPT_SalaryFrom: 0,
      HRMPT_SalaryTo: 0,
      HRMPT_PTax: 0,
      HRMPT_ActiveFlag: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      reset({
        HRMPT_Id: selectedRow.HRMPT_Id,
        MI_Id: selectedRow.MI_Id,
        HRMPT_SalaryFrom: selectedRow.HRMPT_SalaryFrom,
        HRMPT_SalaryTo: selectedRow.HRMPT_SalaryTo,
        HRMPT_PTax: selectedRow.HRMPT_PTax,
        HRMPT_ActiveFlag: selectedRow.HRMPT_ActiveFlag,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: MasterProfessionalTaxInput) => {
    try {
      const res = await saveMutation.mutateAsync(data);
      if (res?.success) {
        toast.success(
          isEditMode
            ? "Professional tax updated successfully"
            : "Professional tax added successfully"
        );
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(
        isEditMode
          ? "Failed to update professional tax"
          : "Failed to add professional tax"
      );
    }
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMPT_SalaryFrom">
          Salary From <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="HRMPT_SalaryFrom"
          control={control}
          rules={PROFESSIONAL_TAX_VALIDATION.salaryFrom}
          render={({ field }) => (
            <InputNumber
              id="HRMPT_SalaryFrom"
              value={field.value}
              onChange={field.onChange}
              formatOptions={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
            />
          )}
        />
        {errors.HRMPT_SalaryFrom && (
          <FormError>{errors.HRMPT_SalaryFrom.message}</FormError>
        )}
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMPT_SalaryTo">
          Salary To <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="HRMPT_SalaryTo"
          control={control}
          rules={PROFESSIONAL_TAX_VALIDATION.salaryTo}
          render={({ field }) => (
            <InputNumber
              id="HRMPT_SalaryTo"
              value={field.value}
              onChange={field.onChange}
              formatOptions={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
            />
          )}
        />
        {errors.HRMPT_SalaryTo && (
          <FormError>{errors.HRMPT_SalaryTo.message}</FormError>
        )}
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMPT_PTax">
          Professional Tax Amount <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="HRMPT_PTax"
          control={control}
          rules={PROFESSIONAL_TAX_VALIDATION.professionalTaxAmount}
          render={({ field }) => (
            <InputNumber
              id="HRMPT_PTax"
              value={field.value}
              onChange={field.onChange}
              formatOptions={{ minimumFractionDigits: 0, maximumFractionDigits: 2 }}
            />
          )}
        />
        {errors.HRMPT_PTax && (
          <FormError>{errors.HRMPT_PTax.message}</FormError>
        )}
      </div>
      <div className="col-span-full">
        <Button
          type="submit"
          className="mt-2"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
            ? "Update"
            : "Save"}
        </Button>
      </div>
    </form>
  );
}

