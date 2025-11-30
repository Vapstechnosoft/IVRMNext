"use client";
import { Label } from "@/components/ui/extension/field";
import { HRMSInputText } from "@/app/(root)/hrms/_components/hrms-input-text";
import { cn } from "@/lib/utils";
import { StandardTabActions } from "./standard-tab-actions";
export function MedicalRecordTab({
  control,
  register,
  errors,
  isSubmitting,
  onClear,
  currentTab,
  onPreviousTab,
}: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = { control, register, errors, isSubmitting };
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="border-b bg-muted px-4 py-2">
          <h3 className="font-semibold text-base text-gray-900 uppercase">
            MEDICAL RECORD
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <HRMSInputText
            label="Employee's Height"
            id="employeeHeight"
            placeholder="Height (e.g., 175.50)"
            maxLength={6}
            onKeyDown={(e) => {
                // Only allow numbers, decimal point, and control keys
                const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                  return; // Allow control keys
                }
                // Block spaces
                if (e.key === ' ') {
                  e.preventDefault();
                  return;
                }
                // Allow decimal point only if one doesn't already exist
                if (e.key === '.') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.includes('.')) {
                    e.preventDefault();
                    return;
                  }
                } else if (!/^[0-9]$/.test(e.key)) {
                  // Block anything that's not a digit
                  e.preventDefault();
                }
              }}
            {...register("employeeHeight")}
            error={errors.employeeHeight?.message}
          />
          <HRMSInputText
            label="Unit of measure (Height)"
            id="employeeHeightUnit"
            placeholder="Unit of measure"
            maxLength={10}
            {...register("employeeHeightUnit")}
            error={errors.employeeHeightUnit?.message}
          />
        </div>
        <HRMSInputText
          label="Eye Sight Issue"
          id="eyeSightIssue"
          maxLength={255}
          {...register("eyeSightIssue")}
          error={errors.eyeSightIssue?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <HRMSInputText
            label="Employee's Weight"
            id="employeeWeight"
            placeholder="Weight (e.g., 75.50)"
            maxLength={6}
            onKeyDown={(e) => {
                // Only allow numbers, decimal point, and control keys
                const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                  return; // Allow control keys
                }
                // Block spaces
                if (e.key === ' ') {
                  e.preventDefault();
                  return;
                }
                // Allow decimal point only if one doesn't already exist
                if (e.key === '.') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.includes('.')) {
                    e.preventDefault();
                    return;
                  }
                } else if (!/^[0-9]$/.test(e.key)) {
                  // Block anything that's not a digit
                  e.preventDefault();
                }
              }}
            {...register("employeeWeight")}
            error={errors.employeeWeight?.message}
          />
          <HRMSInputText
            label="Unit of measure (Weight)"
            id="employeeWeightUnit"
            placeholder="Unit of measure"
            maxLength={10}
            {...register("employeeWeightUnit")}
            error={errors.employeeWeightUnit?.message}
          />
        </div>
        <HRMSInputText
          label="Any Health Issue"
          id="anyHealthIssue"
          maxLength={500}
          {...register("anyHealthIssue")}
          error={errors.anyHealthIssue?.message}
        />
      </div>
      <div className="space-y-2">
        <Label>Identification Mark</Label>
        <textarea
          id="identificationMark"
          maxLength={255}
          {...register("identificationMark")}
          className={cn(
            "min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            errors.identificationMark
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input focus-visible:ring-ring"
          )}
          placeholder="Enter identification mark details..."
        />
        {errors.identificationMark && (
          <div className="font-medium text-[0.8rem] text-destructive">
            {errors.identificationMark.message}
          </div>
        )}
      </div>
      <StandardTabActions
        errors={errors}
        isSubmitting={isSubmitting}
        onClear={onClear}
        currentTab={currentTab}
        onPreviousTab={onPreviousTab}
      />
    </div>
  );
}
// Other Details Tab Component
