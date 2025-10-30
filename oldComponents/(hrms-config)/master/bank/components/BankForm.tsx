"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { BANK_VALIDATION } from "@/lib/validation/hrms-master-validation";

type BankFormData = {
  bankName: string;
  accountNumber: string;
  bankAddress: string;
  branchName: string;
  ifscCode: string;
  isActive: boolean;
};

interface BankFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId?: number;
  editingId?: number | null;
  initialBankName?: string;
  initialAccountNumber?: string;
  initialBankAddress?: string;
  initialBranchName?: string;
  initialIfscCode?: string;
  initialIsActive?: boolean;
}

export default function BankForm({
  onSuccess,
  className = "",
  roleId = 30,
  editingId = null,
  initialBankName = "",
  initialAccountNumber = "",
  initialBankAddress = "",
  initialBranchName = "",
  initialIfscCode = "",
  initialIsActive = true,
}: BankFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BankFormData>({
    defaultValues: {
      bankName: initialBankName,
      accountNumber: initialAccountNumber,
      bankAddress: initialBankAddress,
      branchName: initialBranchName,
      ifscCode: initialIfscCode,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      bankName: initialBankName,
      accountNumber: initialAccountNumber,
      bankAddress: initialBankAddress,
      branchName: initialBranchName,
      ifscCode: initialIfscCode,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialBankName,
    initialAccountNumber,
    initialBankAddress,
    initialBranchName,
    initialIfscCode,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<BankFormData> = async (data) => {
    try {
      // Here you would call your bank save API
      console.log("Bank data:", {
        ...data,
        isActive: true, // Always set to true by default
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Bank saved successfully!");
      reset({
        bankName: "",
        accountNumber: "",
        bankAddress: "",
        branchName: "",
        ifscCode: "",
        isActive: true,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving bank:", error);
      toast.error(error.message || "Failed to save bank");
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
            {/* Bank Name Input */}
            <div className="space-y-2">
              <InputText
                label="Bank Name"
                required
                id="bankName"
                placeholder="Enter bank name (max 50 characters, letters only)"
                {...register("bankName", BANK_VALIDATION.bankName)}
                error={errors.bankName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Account Number Input */}
            <div className="space-y-2">
              <InputText
                label="Account Number"
                required
                id="accountNumber"
                placeholder="Enter account number (max 10 digits)"
                {...register("accountNumber", BANK_VALIDATION.accountNumber)}
                error={errors.accountNumber?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Bank Address Input */}
            <div className="space-y-2">
              <InputText
                label="Bank Address"
                required
                id="bankAddress"
                placeholder="Enter bank address (max 50 characters, alphanumeric)"
                {...register("bankAddress", BANK_VALIDATION.bankAddress)}
                error={errors.bankAddress?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Branch Name Input */}
            <div className="space-y-2">
              <InputText
                label="Branch Name"
                required
                id="branchName"
                placeholder="Enter branch name (max 50 characters, alphanumeric)"
                {...register("branchName", BANK_VALIDATION.branchName)}
                error={errors.branchName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* IFSC Code Input */}
            <div className="space-y-2">
              <InputText
                label="IFSC Code"
                required
                id="ifscCode"
                placeholder="Enter IFSC code (e.g., ABCD0123456)"
                {...register("ifscCode", BANK_VALIDATION.ifscCode)}
                error={errors.ifscCode?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

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
                {editingId ? "Update Bank" : "Save Bank"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
