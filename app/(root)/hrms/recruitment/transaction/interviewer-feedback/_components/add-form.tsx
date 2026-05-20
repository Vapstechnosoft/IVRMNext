"use client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FormError, Label } from "@/components/ui/extension/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetCandidateAndInterviewers,
  useSaveInterviewerFeedback,
} from "@/hooks/hrms/recruitment/transactions/useTransactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { any, z } from "zod";
const interviewerFeedbackSchema = z.object({
  candidateId: z.string().min(1, "Candidate is required"),
  interviewStatus: z.string().min(1, "Interview is required"),
  interviewerId: z.string().min(1, "Interviewer is required"),
  rating: z.string().min(1, "Rating is required"),
  feedback: z.string().min(1, "Feedback is required"),
  status: z.string().min(1, "status is required"),
  interviewDate: z.string().min(1, "Date of Birth is required"),
});
type FormFields = z.infer<typeof interviewerFeedbackSchema>;

const statusOptions = [
  { value: "1", label: "Completed" },
  { value: "2", label: "InProgress" },
];
interface AddInterviewerFeedbackFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}
export default function AddInterviewerFeedbackForm({
  onSuccess,
  onCancel,
  className = "",
}: AddInterviewerFeedbackFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(interviewerFeedbackSchema),
    mode: "onChange",
  });

  const { mutateAsync: saveInterviewerFeedback, isPending: isSaving } =
    useSaveInterviewerFeedback();
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const InterviewStatus = statusOptions.find(
      (sta: any) => sta.value === data.interviewStatus,
    );
    try {
      const payload = {
        hrciS_Id: Number(data.interviewerId),

        // Interview Status Id
        hrcisC_Id: Number(data.interviewStatus),

        // Candidate Id
        hrcD_Id: Number(data.candidateId),

        // Feedback
        hrciS_InterviewFeedBack: data.feedback,

        // Candidate Status
        hrciS_CandidateStatus: data.status,

        // Interview Status Text
        hrcisC_Status: InterviewStatus?.label,

        // Interview Date
        hrciS_Datetime: data.interviewDate,

        // Interviewer Id / Group Id
        hrcmG_Id: Number(data.interviewerId),
      };

      console.log("Payload:", payload);

      const response = await saveInterviewerFeedback(payload);
      console.log("Response:", response);

      toast.success("Interviewer feedback added successfully");

      reset();

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add interviewer feedback");
    }
  };

  const { data: response, isLoading: isLoadingData } =
    useGetCandidateAndInterviewers();

  const candidates = response?.data?.candidates || [];
  const interviewers = response?.data?.interviewers || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col gap-4 ${className}`}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="block text-sm font-medium">
              Candidate Name:<span className="text-red-500">*</span>
            </Label>
            <Controller
              name="candidateId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingData}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingData ? "Loading..." : "Select Candidate"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates?.map((candidate: any, index: number) => (
                      <SelectItem
                        key={`candidate-${candidate.hrcD_Id}-${index}`}
                        value={candidate.hrcD_Id?.toString()}
                      >
                        {candidate.hrcD_FullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.candidateId && (
              <FormError>{errors.candidateId.message}</FormError>
            )}
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-sm">
              Interview Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="interviewStatus"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Interview Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions?.map((status: any, index: number) => (
                      <SelectItem
                        key={`status-${status.value}-${index}`}
                        value={status.value}
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.interviewStatus && (
              <FormError>{errors.interviewStatus.message}</FormError>
            )}
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium">
              Interviewer Name:<span className="text-red-500">*</span>
            </Label>
            <Controller
              name="interviewerId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingData}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingData ? "Loading..." : "Select Interviewer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewers?.map((interviewer: any, index: number) => (
                      <SelectItem
                        key={`${interviewer?.id}-${interviewer?.hrmE_Id}-${index}`}
                        value={
                          (
                            interviewer?.hrmE_Id || interviewer?.id
                          )?.toString() || ""
                        }
                      >
                        {interviewer.employee_fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.interviewerId && (
              <FormError>{errors.interviewerId.message}</FormError>
            )}
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-sm">
              Rating <span className="text-red-500">*</span>
            </label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rating && <FormError>{errors.rating.message}</FormError>}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block font-medium text-sm">
              Status <span className="text-red-500">*</span>
            </label>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Short Listed">Short Listed</SelectItem>
                    <SelectItem value="Selected">Selected</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {errors.status && <FormError>{errors.status.message}</FormError>}
          </div>

          {/* Interview Date */}
          <div className="space-y-2">
            <Label>
              Interview Date <span className="text-red-500 font-bold">*</span>
            </Label>

            <Controller
              name="interviewDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  setDate={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                  disabled={{ after: new Date() }}
                  placeholder="Select Interview Date"
                />
              )}
            />

            {errors.interviewDate && (
              <FormError>{errors.interviewDate.message}</FormError>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block font-medium text-sm">
              Feedback <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter feedback"
              rows={4}
              {...register("feedback")}
            />
            {errors.feedback && (
              <FormError>{errors.feedback.message}</FormError>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-2 border-t pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-500 text-white hover:bg-orange-600"
          isLoading={isSubmitting}
          loadingText="Saving..."
        >
          <div className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Save & Proceed
          </div>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            onCancel?.();
          }}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
