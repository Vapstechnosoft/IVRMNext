"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Save } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  saveMasterDesignation,
  type MasterDesignationInput,
} from "@/types/hrms/master-designation";
import { DESIGNATION_VALIDATION } from "@/lib/validation/hrms-master-validation";

type DesignationFormData = {
  designationName: string;
  basicAmount: string;
  sanctionedSeats: string;
  displaySanctionedSeats: boolean;
  order: number;
  isActive: boolean;
};

interface DesignationFormProps {
  onSuccess?: () => void;
  className?: string;
  roleId: number;
  editingId?: number | null;
  initialDesignationName?: string;
  initialBasicAmount?: string;
  initialSanctionedSeats?: string;
  initialDisplaySanctionedSeats?: boolean;
  initialOrder?: number;
  initialIsActive?: boolean;
}

export default function DesignationForm({
  onSuccess,
  className = "",
  roleId,
  editingId = null,
  initialDesignationName = "",
  initialBasicAmount = "",
  initialSanctionedSeats = "",
  initialDisplaySanctionedSeats = false,
  initialOrder = 1,
  initialIsActive = true,
}: DesignationFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesignationFormData>({
    defaultValues: {
      designationName: initialDesignationName,
      basicAmount: initialBasicAmount,
      sanctionedSeats: initialSanctionedSeats,
      displaySanctionedSeats: initialDisplaySanctionedSeats,
      order: initialOrder,
      isActive: initialIsActive,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      designationName: initialDesignationName,
      basicAmount: initialBasicAmount,
      sanctionedSeats: initialSanctionedSeats,
      displaySanctionedSeats: initialDisplaySanctionedSeats,
      order: initialOrder,
      isActive: initialIsActive,
    });
  }, [
    editingId,
    initialDesignationName,
    initialBasicAmount,
    initialSanctionedSeats,
    initialDisplaySanctionedSeats,
    initialOrder,
    initialIsActive,
    reset,
  ]);

  const onSubmit: SubmitHandler<DesignationFormData> = async (data) => {
    try {
      const inputData: MasterDesignationInput = {
        HRMDES_Id: editingId ?? 0,
        MI_Id: roleId,
        HRMDES_DesignationName: data.designationName,
        HRMDES_BasicAmount: parseFloat(data.basicAmount) || 0,
        HRMDES_SanctionedSeats: parseInt(data.sanctionedSeats) || 0,
        HRMDES_DisplaySanctionedSeatsFlag: data.displaySanctionedSeats,
        HRMDES_Order: data.order,
        HRMDES_ActiveFlag: true, // Always set to true by default
        designationlList: [],
        retrunMsg: "",
        roleId: roleId,
        DesignationDTO: [],
      };

      const response = await saveMasterDesignation(inputData);

      if (response.success) {
        toast.success("Designation saved successfully");
        reset({
          designationName: "",
          basicAmount: "",
          sanctionedSeats: "",
          displaySanctionedSeats: false,
          order: 1,
          isActive: true,
        });
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to save designation");
      }
    } catch (error: any) {
      console.error("Error saving designation:", error);
      toast.error(error.message || "Operation failed");
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
            {/* Designation Name Input */}
            <div className="space-y-2">
              <InputText
                label="Designation Name"
                required
                id="designationName"
                placeholder="Enter designation name (max 50 characters, letters only)"
                {...register(
                  "designationName",
                  DESIGNATION_VALIDATION.designation
                )}
                error={errors.designationName?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Basic Amount Input */}
            <div className="space-y-2">
              <InputText
                label="Basic Amount"
                type="number"
                required
                id="basicAmount"
                placeholder="Enter basic amount (max 10 digits including decimals)"
                {...register("basicAmount", DESIGNATION_VALIDATION.basicAmount)}
                error={errors.basicAmount?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Sanctioned Seats Input */}
            <div className="space-y-2">
              <InputText
                label="Sanctioned Seats"
                type="number"
                required
                id="sanctionedSeats"
                placeholder="Enter sanctioned seats (max 3 digits)"
                {...register(
                  "sanctionedSeats",
                  DESIGNATION_VALIDATION.sanctionedNumber
                )}
                error={errors.sanctionedSeats?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Order Input */}
            <div className="space-y-2">
              <InputText
                label="Order"
                type="number"
                required
                id="order"
                placeholder="Enter order (max 4 digits)"
                {...register("order", {
                  ...DESIGNATION_VALIDATION.order,
                  valueAsNumber: true,
                })}
                error={errors.order?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Display Sanctioned Seats Checkbox */}
            <div className="space-y-2 flex items-center pt-6">
              <input
                type="checkbox"
                id="displaySanctionedSeats"
                {...register("displaySanctionedSeats")}
                className="text-primary focus:ring-primary border-border mr-2"
              />
              <label
                htmlFor="displaySanctionedSeats"
                className="text-sm font-medium text-foreground"
              >
                Display Sanctioned Seats
              </label>
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
                {editingId ? "Update Designation" : "Save Designation"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
