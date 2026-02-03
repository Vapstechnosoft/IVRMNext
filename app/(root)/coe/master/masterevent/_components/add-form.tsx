"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/extension/field";
import { InputText } from "@/components/ui/extension/input-text";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMasterEventCoe } from "@/hooks/coe/usemMaster";
import { useMasterClassCategory } from "@/hooks/fees/useMasters";
import { masterEventCoeSchema } from "@/schemas/coe/master";
import { masterClassCategorySchema } from "@/schemas/fees/masters";
import { saveMasterEvent } from "@/server/coe/masters/masterevent";
import { addOrUpdateMasterClassCategory } from "@/server/fees/masters/class_category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type FormFields = z.infer<typeof masterEventCoeSchema.addOrUpdate>;

interface AddMasterEventCoeProps {
  onSuccess?: () => void;
  className?: string;
}

export default function AddMasterEventCoeForm({
  onSuccess,
  className = "",
}: AddMasterEventCoeProps) {
  const { refetchAll } = useMasterEventCoe();
  const [filterType, setFilterType] = useState<string>("mc");
  const handleFilterChange = (value: string) => {
    setFilterType(value);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(masterEventCoeSchema.addOrUpdate),
    mode: "onChange",
    defaultValues: {},
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      if (filterType == "mc") {
        if (data.masterevent === "") {
          toast.error("Master Event is required");
          return;
        }
        if (data.masterDescription === "") {
          toast.error("Master Description is required");
          return;
        }
        if (data.smsContent === "") {
          toast.error("SMS Content is required");
          return;
        }
        if (data.smsparameter === "") {
          toast.error("SMS Paramter is required");
          return;
        }
        if (data.emailSubject === "") {
          toast.error("Email Subject is required");
          return;
        }
        if (data.emailHeader === "") {
          toast.error("Email Header is required");
          return;
        }
        if (data.emailMessage === "") {
          toast.error("Email Message is required");
          return;
        }
        if (data.eemailParamter === "") {
          toast.error("Email Parameter is required");
          return;
        }
        if (data.emailFooter === "") {
          toast.error("Email Footeris required");
          return;
        }
      } else if (filterType == "dc") {
        if (data.masterevent === "") {
          toast.error("Master Event is required");
          return;
        }
        if (data.masterDescription === "") {
          toast.error("Master Description is required");
          return;
        }
        if (data.emailSubject === "") {
          toast.error("Email Subject is required");
          return;
        }
        if (data.emailHeader === "") {
          toast.error("Email Header is required");
          return;
        }
        if (data.emailFooter === "") {
          toast.error("Email Footer is required");
          return;
        }
      }
      const payload = {
        coemE_Id: 0,
        mI_Id: 0,
        coemE_EventName: data.masterevent,
        coemE_EventDesc: data.masterDescription,
        coemE_SMSMessage: data.smsContent,
        coemE_MailSubject: data.emailSubject,
        coemE_MailHeader: data.emailHeader,
        coemE_MailFooter: data.emailFooter,
        coemE_Mail_Message: data.emailMessage,
        coemE_MailHTMLTemplate: data.eemailParamter,
        coemE_ActiveFlag: true,
        createdDate: "2026-01-27T12:48:53.524Z",
        updatedDate: "2026-01-27T12:48:53.524Z",
        coemE_CCemailId: "string",
        coemE_BCCemailId: "string",
        coemE_CreatedBy: 0,
        coemE_UpdatedBy: 0,
        coemecaT_Id: 0,
      };
      const js = JSON.stringify(payload);
      console.log("Payload JSON:", js);
      const response = await saveMasterEvent(payload);
      if (response.success) {
        toast.success(response.message || "Master Event saved successfully");
        reset();
        refetchAll();
        onSuccess?.();
      } else {
        toast.error(response.message || "Failed to Master Event");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleReset = () => reset();

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Card className="p-4">
            <RadioGroup value={filterType} onValueChange={handleFilterChange}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {[
                  { value: "mc", label: "Manual Content" },
                  { value: "dc", label: "Default Content" },
                ].map((item) => {
                  return (
                    <div
                      key={item.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={item.value} id={item.value} />
                      <Label
                        htmlFor={item.value}
                        className="cursor-pointer text-sm"
                      >
                        {item.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputText
              label="Event Name"
              required
              id="masterevent"
              placeholder="Enter a Event Name"
              {...register("masterevent")}
              error={errors.masterevent?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />

            <InputText
              label="Event Description"
              required
              id="masterDescription"
              placeholder="Enter a Event Description"
              {...register("masterDescription")}
              error={errors.masterDescription?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {filterType === "mc" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputText
                label="SMS Content"
                defaultValue="[INSTITUTENAME]"
                required
                id="smsContent"
                placeholder="Enter a SMS Content"
                {...register("smsContent")}
                error={errors.smsContent?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />

              <InputText
                label="SMS Parameter"
                required
                id="smsparameter"
                placeholder="Enter a SMS Parameter"
                {...register("smsparameter")}
                error={errors.smsparameter?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputText
              label="Email Subject"
              required
              id="emailSubject"
              placeholder="Enter a Email Subject"
              {...register("emailSubject")}
              error={errors.emailSubject?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />

            <InputText
              label="Email Header"
              required
              id="emailHeader"
              placeholder="Enter a Email Header"
              {...register("emailHeader")}
              error={errors.emailHeader?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {filterType == "mc" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputText
                label="Email Message"
                required
                id="emailMessage"
                placeholder="Enter a Email Message"
                {...register("emailMessage")}
                error={errors.emailMessage?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />

              <InputText
                label="E-Mail Parameter"
                required
                id="eemailParamter"
                placeholder="Enter a E-Mail Parameter"
                {...register("eemailParamter")}
                error={errors.eemailParamter?.message}
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputText
              label="Email Footer"
              required
              id="emailFooter"
              placeholder="Enter a Email Footer"
              {...register("emailFooter")}
              error={errors.emailFooter?.message}
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2"
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            <div className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Save Master Event
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}
