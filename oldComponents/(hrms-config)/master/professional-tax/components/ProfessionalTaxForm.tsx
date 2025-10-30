"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  PROFESSIONAL_TAX_VALIDATION,
  validateSalaryRange,
} from "@/lib/validation/hrms-master-validation";

type ProfessionalTaxFormData = {
  salaryFrom: string;
  salaryTo: string;
  professionalTaxAmount: string;
  isActive: boolean;
};

interface ProfessionalTaxFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialSalaryFrom?: string;
  initialSalaryTo?: string;
  initialProfessionalTaxAmount?: string;
  initialIsActive?: boolean;
}

export default function ProfessionalTaxForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialSalaryFrom = "",
  initialSalaryTo = "",
  initialProfessionalTaxAmount = "",
  initialIsActive = true,
}: ProfessionalTaxFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfessionalTaxFormData>({
    defaultValues: {
      salaryFrom: initialSalaryFrom,
      salaryTo: initialSalaryTo,
      professionalTaxAmount: initialProfessionalTaxAmount,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  // Watch salary values for validation
  const salaryFromValue = watch("salaryFrom");
  const salaryToValue = watch("salaryTo");

  useEffect(() => {
    reset({
      salaryFrom: initialSalaryFrom,
      salaryTo: initialSalaryTo,
      professionalTaxAmount: initialProfessionalTaxAmount,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialSalaryFrom,
    initialSalaryTo,
    initialProfessionalTaxAmount,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<ProfessionalTaxFormData> = async (data) => {
    try {
      // Validate salary range
      const salaryFromNum = parseFloat(data.salaryFrom);
      const salaryToNum = parseFloat(data.salaryTo);

      const rangeError = validateSalaryRange(salaryFromNum, salaryToNum);
      if (rangeError) {
        toast.error(rangeError);
        return;
      }

      // Here you would call your professional tax save API
      console.log("Professional Tax data:", {
        ...data,
        isActive: true, // Always set to true by default
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Professional Tax saved successfully!");
      reset({
        salaryFrom: "",
        salaryTo: "",
        professionalTaxAmount: "",
        isActive: true,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving professional tax:", error);
      toast.error(error.message || "Failed to save professional tax");
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
            {/* Salary From Input */}
            <div className="space-y-2">
              <InputText
                label="Salary From"
                type="number"
                required
                id="salaryFrom"
                placeholder="Enter salary from (max 6 digits including decimals)"
                {...register(
                  "salaryFrom",
                  PROFESSIONAL_TAX_VALIDATION.salaryFrom
                )}
                error={errors.salaryFrom?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Salary To Input */}
            <div className="space-y-2">
              <InputText
                label="Salary To"
                type="number"
                required
                id="salaryTo"
                placeholder="Enter salary to (max 6 digits including decimals)"
                {...register("salaryTo", PROFESSIONAL_TAX_VALIDATION.salaryTo)}
                error={errors.salaryTo?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Professional Tax Amount Input */}
            <div className="space-y-2">
              <InputText
                label="Professional Tax Amount"
                type="number"
                required
                id="professionalTaxAmount"
                placeholder="Enter professional tax amount (max 6 digits including decimals)"
                {...register(
                  "professionalTaxAmount",
                  PROFESSIONAL_TAX_VALIDATION.professionalTaxAmount
                )}
                error={errors.professionalTaxAmount?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Salary Range Validation */}
          {salaryFromValue && salaryToValue && (
            <div className="mt-2">
              {validateSalaryRange(
                parseFloat(salaryFromValue),
                parseFloat(salaryToValue)
              ) && (
                <div className="text-red-500 text-sm">
                  {validateSalaryRange(
                    parseFloat(salaryFromValue),
                    parseFloat(salaryToValue)
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
                {editingId
                  ? "Update Professional Tax"
                  : "Save Professional Tax"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
