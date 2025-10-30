import { Button } from "@/components/ui/button";
import { FormError, Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterSpecialization } from "@/hooks/hrms/useMasterSpecialization";
import { SPECIALIZATION_VALIDATION } from "@/lib/validation/hrms-master-validation";
import type {
  MasterSpecializationInput,
  SpecializationItem,
} from "@/types/hrms/master-specialization";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface SpecializationFormProps {
  selectedRow?: SpecializationItem;
  onSuccess?: () => void;
}

export default function SpecializationForm({
  selectedRow,
  onSuccess,
}: SpecializationFormProps) {
  const roleId = HRMS_MI_ID;
  const { saveMutation } = useMasterSpecialization(roleId);
  const isEditMode = !!selectedRow;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MasterSpecializationInput>({
    defaultValues: {
      MI_Id: roleId,
      HRMSPL_SpecialisationName: "",
      HRMSPL_ActiveFlg: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      reset({
        HRMSPL_Id: selectedRow.HRMSPL_Id,
        MI_Id: selectedRow.MI_Id,
        HRMSPL_SpecialisationName: selectedRow.HRMSPL_SpecialisationName,
        HRMSPL_ActiveFlg: selectedRow.HRMSPL_ActiveFlg,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: MasterSpecializationInput) => {
    try {
      const res = await saveMutation.mutateAsync(data);
      if (res?.success) {
        toast.success(
          isEditMode
            ? "Specialization updated successfully"
            : "Specialization added successfully"
        );
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(
        isEditMode
          ? "Failed to update specialization"
          : "Failed to add specialization"
      );
    }
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMSPL_SpecialisationName">
          Specialization Name <span className="text-destructive">*</span>
        </Label>
        <InputText
          id="HRMSPL_SpecialisationName"
          placeholder="Enter specialization name"
          {...register(
            "HRMSPL_SpecialisationName",
            SPECIALIZATION_VALIDATION.specializationName
          )}
        />
        {errors.HRMSPL_SpecialisationName && (
          <FormError>{errors.HRMSPL_SpecialisationName.message}</FormError>
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

