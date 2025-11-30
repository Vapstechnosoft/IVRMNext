"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/extension/field";
import { HRMSInputText } from "@/app/(root)/hrms/_components/hrms-input-text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useRef } from "react";
import { Controller, useWatch } from "react-hook-form";
import { StandardTabActions } from "./standard-tab-actions";
import { useStatesByCountryId } from "@/hooks/hrms/useEmployeeRegister";
// Note: We render SelectItem directly in the map (not via helper function)
// This ensures collectItemValues can find them by type check (child.type === SelectItem)
// Helper function to ensure SelectItem value is never empty string
const ensureNonEmptyValue = (
  value: any,
  fallback: any = null
): string | null => {
  // Handle null/undefined
  if (value == null || value === undefined) {
    if (fallback != null && fallback !== undefined) {
      const fallbackStr = String(fallback);
      if (fallbackStr.trim() !== "" && fallbackStr !== "") {
        return fallbackStr;
      }
    }
    return null;
  }
  // Handle empty string explicitly
  if (value === "") {
    if (fallback != null && fallback !== undefined && fallback !== "") {
      const fallbackStr = String(fallback);
      if (fallbackStr.trim() !== "" && fallbackStr !== "") {
        return fallbackStr;
      }
    }
    return null;
  }
  // Convert to string
  const str = String(value);
  // Check if empty or whitespace
  if (str === "" || str.trim() === "") {
    if (fallback != null && fallback !== undefined && fallback !== "") {
      const fallbackStr = String(fallback);
      if (fallbackStr.trim() !== "" && fallbackStr !== "") {
        return fallbackStr;
      }
    }
    return null;
  }
  // Final check - ensure it's not empty
  const trimmed = str.trim();
  if (trimmed === "" || trimmed.length === 0) {
    return null;
  }
  return trimmed;
};
interface AddressTabProps {
  control: any;
  register: any;
  errors: any;
  isSubmitting: boolean;
  watch: any;
  setValue: any;
  countries?: any[];
  states?: any[];
  onClear?: () => void;
}
export function AddressTab({
  control,
  register,
  errors,
  isSubmitting,
  watch,
  setValue,
  countries = [],
  states = [],
  onClear,
  currentTab,
  onPreviousTab,
}: AddressTabProps & { currentTab?: string; onPreviousTab?: () => void }) {
  // Use useWatch instead of watch() to prevent unnecessary re-renders
  const sameAsCommunicationAddress = useWatch({
    control,
    name: "sameAsCommunicationAddress",
  });
  const contactAddress = useWatch({ control, name: "contactAddress" });
  const contactArea = useWatch({ control, name: "contactArea" });
  const contactCountry = useWatch({ control, name: "contactCountry" });
  const contactState = useWatch({ control, name: "contactState" });
  const contactCity = useWatch({ control, name: "contactCity" });
  const contactPincode = useWatch({ control, name: "contactPincode" });
  const permanentCountry = useWatch({ control, name: "permanentCountry" });
  const permanentState = useWatch({ control, name: "permanentState" });
  // Convert country string to number for API call
  const contactCountryId = contactCountry ? Number(contactCountry) : null;
  const permanentCountryId = permanentCountry ? Number(permanentCountry) : null;
  // Fetch states for contact country
  const { data: contactStates = [], isLoading: isLoadingContactStates } =
    useStatesByCountryId(contactCountryId);
  // Fetch states for permanent country
  const { data: permanentStates = [], isLoading: isLoadingPermanentStates } =
    useStatesByCountryId(permanentCountryId);
  // Use fetched states if country is selected (even if empty), otherwise fall back to passed states
  const availableContactStates = contactCountryId ? contactStates : states;
  const availablePermanentStates = permanentCountryId
    ? permanentStates
    : states;
  // Copy communication address to permanent address when checkbox is checked
  // Use refs to track previous values and prevent unnecessary setValue calls
  const prevSameAsAddress = useRef(sameAsCommunicationAddress);
  const prevContactValues = useRef({
    contactAddress,
    contactArea,
    contactCountry,
    contactState,
    contactCity,
    contactPincode,
  });
  useEffect(() => {
    // Only copy if checkbox is checked AND values have actually changed
    if (sameAsCommunicationAddress) {
      const valuesChanged =
        prevContactValues.current.contactAddress !== contactAddress ||
        prevContactValues.current.contactArea !== contactArea ||
        prevContactValues.current.contactCountry !== contactCountry ||
        prevContactValues.current.contactState !== contactState ||
        prevContactValues.current.contactCity !== contactCity ||
        prevContactValues.current.contactPincode !== contactPincode;
      // Only set values if checkbox was just checked OR contact values changed
      if (
        prevSameAsAddress.current !== sameAsCommunicationAddress ||
        valuesChanged
      ) {
        setValue("permanentAddress", contactAddress || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("permanentArea", contactArea || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("permanentCountry", contactCountry || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("permanentState", contactState || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("permanentCity", contactCity || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        setValue("permanentPincode", contactPincode || "", {
          shouldValidate: false,
          shouldDirty: false,
        });
        prevContactValues.current = {
          contactAddress,
          contactArea,
          contactCountry,
          contactState,
          contactCity,
          contactPincode,
        };
      }
    }
    prevSameAsAddress.current = sameAsCommunicationAddress;
  }, [
    sameAsCommunicationAddress,
    contactAddress,
    contactArea,
    contactCountry,
    contactState,
    contactCity,
    contactPincode,
    setValue,
  ]);
  // Clear state when country changes - use ref to track previous country
  const prevContactCountry = useRef(contactCountry);
  useEffect(() => {
    // Only run if country actually changed
    if (prevContactCountry.current !== contactCountry) {
      if (contactCountry) {
        // State will be loaded by the hook, but we should clear the selected state if it doesn't belong to the new country
        const currentStateId = contactState ? Number(contactState) : null;
        if (currentStateId && contactStates.length > 0) {
          const stateExists = contactStates.some(
            (state: any) =>
              (state.IVRMMS_Id || state.value || state.id) === currentStateId
          );
          if (!stateExists) {
            setValue("contactState", "", {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }
      } else {
        setValue("contactState", "", {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
      prevContactCountry.current = contactCountry;
    }
  }, [contactCountry, contactStates, contactState, setValue]);
  // Clear permanent state when country changes - use ref to track previous country
  const prevPermanentCountry = useRef(permanentCountry);
  useEffect(() => {
    // Only run if country actually changed
    if (prevPermanentCountry.current !== permanentCountry) {
      if (permanentCountry) {
        const currentStateId = permanentState ? Number(permanentState) : null;
        if (currentStateId && permanentStates.length > 0) {
          const stateExists = permanentStates.some(
            (state: any) =>
              (state.IVRMMS_Id || state.value || state.id) === currentStateId
          );
          if (!stateExists) {
            setValue("permanentState", "", {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        }
      } else {
        setValue("permanentState", "", {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
      prevPermanentCountry.current = permanentCountry;
    }
  }, [permanentCountry, permanentStates, permanentState, setValue]);
  return (
    <div className="space-y-6">
      {/* Contact Address */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="border-b bg-muted px-4 py-2">
            <h3 className="font-semibold text-base text-gray-900 uppercase">
              CONTACT ADDRESS:
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HRMSInputText
                label="Address"
                id="contactAddress"
                maxLength={100}
                {...register("contactAddress")}
                error={errors.contactAddress?.message}
              />
              <HRMSInputText
                label="Area"
                id="contactArea"
                {...register("contactArea")}
                error={errors.contactArea?.message}
              />
              <div className="space-y-2">
                <Controller
                  name="contactCountry"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label>Country</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries
                            .filter((country: any, index: number) => {
                              const countryId =
                                country.IVRMMC_Id ??
                                country.IVRMMCO_Id ??
                                country.value ??
                                country.id ??
                                index;
                              return (
                                countryId != null &&
                                countryId !== "" &&
                                String(countryId).trim() !== ""
                              );
                            })
                            .map((country: any, index: number) => {
                              const countryIdRaw =
                                country.IVRMMC_Id ??
                                country.IVRMMCO_Id ??
                                country.value ??
                                country.id ??
                                index;
                              const countryIdStr = ensureNonEmptyValue(
                                countryIdRaw,
                                index
                              );
                              // Ensure value is never empty string
                              if (
                                !countryIdStr ||
                                countryIdStr.trim() === "" ||
                                countryIdStr === ""
                              )
                                return null;
                              const finalCountryId =
                                String(countryIdStr).trim();
                              if (finalCountryId === "") return null;
                              const countryName =
                                country.IVRMMC_CountryName ||
                                country.IVRMMCO_CountryName ||
                                country.label ||
                                country.name ||
                                `Country ${countryIdRaw}`;
                              // Render SelectItem directly so collectItemValues can find it
                              return (
                                <SelectItem
                                  key={countryIdRaw}
                                  value={finalCountryId}
                                  textValue={countryName}
                                >
                                  {countryName}
                                </SelectItem>
                              );
                            })
                            .filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  name="contactState"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label>State</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingContactStates ? (
                            <SelectItem value="loading" disabled>
                              Loading states...
                            </SelectItem>
                          ) : (
                            availableContactStates
                              .filter((state: any, index: number) => {
                                const stateId =
                                  state.IVRMMS_Id ||
                                  state.value ||
                                  state.id ||
                                  index;
                                return (
                                  stateId != null &&
                                  stateId !== "" &&
                                  String(stateId).trim() !== ""
                                );
                              })
                              .map((state: any, index: number) => {
                                const stateId =
                                  state.IVRMMS_Id ??
                                  state.value ??
                                  state.id ??
                                  index;
                                const stateIdStr = ensureNonEmptyValue(
                                  stateId,
                                  index
                                );
                                // Ensure value is never empty string
                                if (
                                  !stateIdStr ||
                                  stateIdStr.trim() === "" ||
                                  stateIdStr === ""
                                )
                                  return null;
                                const finalStateId = String(stateIdStr).trim();
                                if (finalStateId === "") return null;
                                const stateName =
                                  state.IVRMMS_Name ||
                                  state.label ||
                                  state.name ||
                                  `State ${stateId}`;
                                // Render SelectItem directly so collectItemValues can find it
                                return (
                                  <SelectItem
                                    key={stateId}
                                    value={finalStateId}
                                    textValue={stateName}
                                  >
                                    {stateName}
                                  </SelectItem>
                                );
                              })
                              .filter(Boolean)
                          )}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </div>
              <HRMSInputText
                label="City"
                id="contactCity"
                {...register("contactCity")}
                error={errors.contactCity?.message}
              />
              <HRMSInputText
                label="Pincode"
                id="contactPincode"
                maxLength={10}
                onKeyDown={(e) => {
                    // Only allow numbers (0-9) and control keys
                    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                        return; // Allow control keys
                    }
                    // Block spaces explicitly
                    if (e.key === ' ') {
                        e.preventDefault();
                        return;
                    }
                    // Only allow digits (0-9)
                    if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault(); // Block everything else
                    }
                }}
                {...register("contactPincode")}
                error={errors.contactPincode?.message}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Permanent Address */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="border-b bg-muted px-4 py-2">
            <h3 className="font-semibold text-base text-gray-900 uppercase">
              PERMANENT ADDRESS:
            </h3>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-center space-x-2">
              <Checkbox
                id="sameAsCommunicationAddress"
                checked={sameAsCommunicationAddress || false}
                onCheckedChange={(checked) => {
                  setValue("sameAsCommunicationAddress", !!checked);
                }}
              />
              <Label htmlFor="sameAsCommunicationAddress">
                Same As Communication Address
              </Label>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HRMSInputText
                label="Address"
                id="permanentAddress"
                maxLength={100}
                {...register("permanentAddress")}
                error={errors.permanentAddress?.message}
                disabled={sameAsCommunicationAddress}
              />
              <HRMSInputText
                label="Area"
                id="permanentArea"
                {...register("permanentArea")}
                error={errors.permanentArea?.message}
                disabled={sameAsCommunicationAddress}
              />
              <div className="space-y-2">
                <Controller
                  name="permanentCountry"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label>Country</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={sameAsCommunicationAddress}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries
                            .filter((country: any, index: number) => {
                              const countryId =
                                country.IVRMMC_Id ??
                                country.IVRMMCO_Id ??
                                country.value ??
                                country.id ??
                                index;
                              return (
                                countryId != null &&
                                countryId !== "" &&
                                String(countryId).trim() !== ""
                              );
                            })
                            .map((country: any, index: number) => {
                              const countryIdRaw =
                                country.IVRMMC_Id ??
                                country.IVRMMCO_Id ??
                                country.value ??
                                country.id ??
                                index;
                              const countryIdStr = ensureNonEmptyValue(
                                countryIdRaw,
                                index
                              );
                              // Ensure value is never empty string
                              if (
                                !countryIdStr ||
                                countryIdStr.trim() === "" ||
                                countryIdStr === ""
                              )
                                return null;
                              const finalCountryId =
                                String(countryIdStr).trim();
                              if (finalCountryId === "") return null;
                              const countryName =
                                country.IVRMMC_CountryName ||
                                country.IVRMMCO_CountryName ||
                                country.label ||
                                country.name ||
                                `Country ${countryIdRaw}`;
                              // Render SelectItem directly so collectItemValues can find it
                              return (
                                <SelectItem
                                  key={countryIdRaw}
                                  value={finalCountryId}
                                  textValue={countryName}
                                >
                                  {countryName}
                                </SelectItem>
                              );
                            })
                            .filter(Boolean)}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Controller
                  name="permanentState"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label>State</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={sameAsCommunicationAddress}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingPermanentStates ? (
                            <SelectItem value="loading" disabled>
                              Loading states...
                            </SelectItem>
                          ) : (
                            availablePermanentStates
                              .filter((state: any, index: number) => {
                                const stateId =
                                  state.IVRMMS_Id ||
                                  state.value ||
                                  state.id ||
                                  index;
                                return (
                                  stateId != null &&
                                  stateId !== "" &&
                                  String(stateId).trim() !== ""
                                );
                              })
                              .map((state: any, index: number) => {
                                const stateId =
                                  state.IVRMMS_Id ??
                                  state.value ??
                                  state.id ??
                                  index;
                                const stateIdStr = ensureNonEmptyValue(
                                  stateId,
                                  index
                                );
                                // Ensure value is never empty string
                                if (
                                  !stateIdStr ||
                                  stateIdStr.trim() === "" ||
                                  stateIdStr === ""
                                )
                                  return null;
                                const finalStateId = String(stateIdStr).trim();
                                if (finalStateId === "") return null;
                                const stateName =
                                  state.IVRMMS_Name ||
                                  state.label ||
                                  state.name ||
                                  `State ${stateId}`;
                                // Render SelectItem directly so collectItemValues can find it
                                return (
                                  <SelectItem
                                    key={stateId}
                                    value={finalStateId}
                                    textValue={stateName}
                                  >
                                    {stateName}
                                  </SelectItem>
                                );
                              })
                              .filter(Boolean)
                          )}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                />
              </div>
              <HRMSInputText
                label="City"
                id="permanentCity"
                {...register("permanentCity")}
                error={errors.permanentCity?.message}
                disabled={sameAsCommunicationAddress}
              />
              <HRMSInputText
                label="Pincode"
                id="permanentPincode"
                maxLength={10}
                onKeyDown={(e) => {
                    // Only allow numbers (0-9) and control keys
                    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                        return; // Allow control keys
                    }
                    // Block spaces explicitly
                    if (e.key === ' ') {
                        e.preventDefault();
                        return;
                    }
                    // Only allow digits (0-9)
                    if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault(); // Block everything else
                    }
                }}
                {...register("permanentPincode")}
                error={errors.permanentPincode?.message}
                disabled={sameAsCommunicationAddress}
              />
            </div>
          </div>
        </div>
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
// Experience Tab Component
