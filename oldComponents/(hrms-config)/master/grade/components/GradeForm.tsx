"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  GRADE_VALIDATION,
  validatePayScaleRange,
} from "@/lib/validation/hrms-master-validation";

type GradeFormData = {
  gradeName: string;
  gradeDisplayName: string;
  payScaleFrom: string;
  payScaleTo: string;
  increment: string;
  isActive: boolean;
};

interface GradeFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialGradeName?: string;
  initialGradeDisplayName?: string;
  initialPayScaleFrom?: string;
  initialPayScaleTo?: string;
  initialIncrement?: string;
  initialIsActive?: boolean;
}

export default function GradeForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialGradeName = "",
  initialGradeDisplayName = "",
  initialPayScaleFrom = "",
  initialPayScaleTo = "",
  initialIncrement = "",
  initialIsActive = true,
}: GradeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GradeFormData>({
    defaultValues: {
      gradeName: initialGradeName,
      gradeDisplayName: initialGradeDisplayName,
      payScaleFrom: initialPayScaleFrom,
      payScaleTo: initialPayScaleTo,
      increment: initialIncrement,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  // Watch pay scale values for validation
  const payScaleFromValue = watch("payScaleFrom");
  const payScaleToValue = watch("payScaleTo");

  useEffect(() => {
    reset({
      gradeName: initialGradeName,
      gradeDisplayName: initialGradeDisplayName,
      payScaleFrom: initialPayScaleFrom,
      payScaleTo: initialPayScaleTo,
      increment: initialIncrement,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialGradeName,
    initialGradeDisplayName,
    initialPayScaleFrom,
    initialPayScaleTo,
    initialIncrement,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<GradeFormData> = async (data) => {
    try {
      // Validate pay scale range
      const payScaleFromNum = parseFloat(data.payScaleFrom);
      const payScaleToNum = parseFloat(data.payScaleTo);

      const rangeError = validatePayScaleRange(payScaleFromNum, payScaleToNum);
      if (rangeError) {
        toast.error(rangeError);
        return;
      }

      // Here you would call your grade save API
      console.log("Grade data:", {
        ...data,
        isActive: true, // Always set to true by default
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Grade saved successfully!");
      reset({
        gradeName: "",
        gradeDisplayName: "",
        payScaleFrom: "",
        payScaleTo: "",
        increment: "",
        isActive: true,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast.error(error.message || "Failed to save grade");
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Information Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Grade Name Input */}
            <div className="space-y-2">
              <InputText
                label="Grade Name"
                required
                id="gradeName"
                placeholder="Enter grade name (max 50 characters, letters only)"
                {...register("gradeName", GRADE_VALIDATION.gradeName)}
                error={errors.gradeName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Grade Display Name Input */}
            <div className="space-y-2">
              <InputText
                label="Grade Display Name"
                required
                id="gradeDisplayName"
                placeholder="Enter grade display name (max 50 characters, letters only)"
                {...register(
                  "gradeDisplayName",
                  GRADE_VALIDATION.gradeDisplayName
                )}
                error={errors.gradeDisplayName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pay Scale From Input */}
            <div className="space-y-2">
              <InputText
                label="Pay Scale From"
                type="number"
                required
                id="payScaleFrom"
                placeholder="Enter pay scale from (max 10 digits including decimals)"
                {...register("payScaleFrom", GRADE_VALIDATION.payScaleFrom)}
                error={errors.payScaleFrom?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Pay Scale To Input */}
            <div className="space-y-2">
              <InputText
                label="Pay Scale To"
                type="number"
                required
                id="payScaleTo"
                placeholder="Enter pay scale to (max 10 digits including decimals)"
                {...register("payScaleTo", GRADE_VALIDATION.payScaleTo)}
                error={errors.payScaleTo?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Increment Input */}
            <div className="space-y-2">
              <InputText
                label="Increment"
                type="number"
                required
                id="increment"
                placeholder="Enter increment (max 3 digits)"
                {...register("increment", GRADE_VALIDATION.increment)}
                error={errors.increment?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Pay Scale Range Validation */}
          {payScaleFromValue && payScaleToValue && (
            <div className="mt-2">
              {validatePayScaleRange(
                parseFloat(payScaleFromValue),
                parseFloat(payScaleToValue)
              ) && (
                <div className="text-red-500 text-sm">
                  {validatePayScaleRange(
                    parseFloat(payScaleFromValue),
                    parseFloat(payScaleToValue)
                  )}
                </div>
              )}
            </div>
          )}

          {/* Root Error */}
          {errors.root && <FormError>{errors.root.message}</FormError>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="order-2 sm:order-1 transition-all duration-200 hover:scale-105 w-fit"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="order-1 sm:order-2 transition-all duration-200 hover:scale-105 w-fit"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Update Grade" : "Save Grade"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
