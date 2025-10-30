import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError, Label } from "@/components/ui/extension/field";
import { Input } from "@/components/ui/input";
import { HRMS_MI_ID } from "@/constants/hrms-config";
import { useMasterCourse } from "@/hooks/hrms/useMasterCourse";
import { COURSE_VALIDATION } from "@/lib/validation/hrms-master-validation";
import type { CourseItem, MasterCourseInput } from "@/types/hrms/master-course";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

interface CourseFormProps {
  selectedRow?: CourseItem;
  onSuccess?: () => void;
}

export default function CourseForm({
  selectedRow,
  onSuccess,
}: CourseFormProps) {
  const roleId = HRMS_MI_ID;
  const { saveMutation } = useMasterCourse(roleId);
  const isEditMode = !!selectedRow;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MasterCourseInput>({
    defaultValues: {
      MI_Id: roleId,
      HRMC_QulaificationName: "",
      HRMC_QualificationDesc: "",
      HRMC_Order: 0,
      HRMC_ActiveFlag: true,
      HRMC_DefaultQualFag: false,
      HRMC_SpecialisationFlag: false,
    },
  });

  useEffect(() => {
    if (selectedRow) {
      reset({
        HRMC_Id: selectedRow.HRMC_Id,
        MI_Id: selectedRow.MI_Id,
        HRMC_QulaificationName: selectedRow.HRMC_QulaificationName,
        HRMC_QualificationDesc: selectedRow.HRMC_QualificationDesc,
        HRMC_Order: selectedRow.HRMC_Order,
        HRMC_ActiveFlag: selectedRow.HRMC_ActiveFlag,
        HRMC_DefaultQualFag: selectedRow.HRMC_DefaultQualFag,
        HRMC_SpecialisationFlag: selectedRow.HRMC_SpecialisationFlag,
      });
    }
  }, [selectedRow, reset]);

  const onSubmit = async (data: MasterCourseInput) => {
    try {
      const res = await saveMutation.mutateAsync(data);
      if (res?.success) {
        toast.success(
          isEditMode
            ? "Course updated successfully"
            : "Course added successfully"
        );
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update course" : "Failed to add course"
      );
    }
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMC_QulaificationName">
          Qualification Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="HRMC_QulaificationName"
          placeholder="Enter qualification name"
          {...register("HRMC_QulaificationName", COURSE_VALIDATION.courseName)}
        />
        {errors.HRMC_QulaificationName && (
          <FormError>{errors.HRMC_QulaificationName.message}</FormError>
        )}
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMC_QualificationDesc">
          Description <span className="text-destructive">*</span>
        </Label>
        <Input
          id="HRMC_QualificationDesc"
          placeholder="Enter description"
          {...register(
            "HRMC_QualificationDesc",
            COURSE_VALIDATION.courseDescription
          )}
        />
        {errors.HRMC_QualificationDesc && (
          <FormError>{errors.HRMC_QualificationDesc.message}</FormError>
        )}
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="HRMC_Order">Order</Label>
        <Input
          id="HRMC_Order"
          type="number"
          placeholder="Enter order"
          {...register("HRMC_Order", { valueAsNumber: true })}
        />
      </div>
      <div className="flex items-center gap-4 pt-7">
        <label className="flex items-center gap-2">
          <Controller
            name="HRMC_DefaultQualFag"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <span>Default Qualification</span>
        </label>
        <label className="flex items-center gap-2">
          <Controller
            name="HRMC_SpecialisationFlag"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <span>Has Specialization</span>
        </label>
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

