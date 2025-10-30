import { Button } from "@/components/ui/button";
import { FormError, Label } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterGender } from "@/hooks/hrms/useMasterGender";
import { GENDER_VALIDATION } from "@/lib/validation/hrms-master-validation";
import type { GenderItem, MasterGenderInput } from "@/types/hrms/master-gender";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface GenderFormProps {
  selectedRow?: GenderItem;
  onSuccess?: () => void;
}

export default function GenderForm({
  selectedRow,
  onSuccess,
}: GenderFormProps) {
  const roleId = HRMS_MI_ID;
  const { saveMutation } = useMasterGender(roleId);
  const isEditMode = !!selectedRow;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MasterGenderInput>({
    defaultValues: {
      MI_Id: roleId,
      IVRMMG_GenderName: "",
      IVRMMG_ActiveFlag: true,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      reset({
        IVRMMG_Id: selectedRow.IVRMMG_Id,
        MI_Id: selectedRow.MI_Id,
        IVRMMG_GenderName: selectedRow.IVRMMG_GenderName,
        IVRMMG_ActiveFlag: selectedRow.IVRMMG_ActiveFlag,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: MasterGenderInput) => {
    try {
      const res = await saveMutation.mutateAsync(data);
      if (res?.success) {
        toast.success(
          isEditMode
            ? "Gender updated successfully"
            : "Gender added successfully"
        );
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update gender" : "Failed to add gender"
      );
    }
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="IVRMMG_GenderName">
          Gender Name <span className="text-destructive">*</span>
        </Label>
        <InputText
          id="IVRMMG_GenderName"
          placeholder="Enter gender name"
          {...register("IVRMMG_GenderName", GENDER_VALIDATION.genderName)}
        />
        {errors.IVRMMG_GenderName && (
          <FormError>{errors.IVRMMG_GenderName.message}</FormError>
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

