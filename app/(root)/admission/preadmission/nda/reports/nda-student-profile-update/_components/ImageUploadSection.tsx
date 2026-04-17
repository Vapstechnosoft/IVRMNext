import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNdaUploadProfilePic } from '@/hooks/admission/preadmission/useNdaStudentProfileUpdate';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

interface ImageUploadSectionProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    borderColor?: string;
    statusLabel?: string;
    statusColor?: string;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
    label,
    value,
    onChange,
    placeholder = "Upload Photo",
    borderColor = "border-primary",
    statusLabel,
    statusColor = "text-black"
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: uploadPic, isPending: isUploading } = useNdaUploadProfilePic();
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image file (JPEG/JPG/PNG)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit matching legacy
            toast.error("Image size should be less than 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("File", file);
        formData.append("Id", "0");

        try {
            const res = await uploadPic(formData);
            if (res) {
                const uploadedUrl = typeof res === 'string' ? res : (res as any).data;
                onChange(uploadedUrl);
                setPreviewUrl(URL.createObjectURL(file));
                toast.success(`${label} uploaded successfully`);
            }
        } catch (error) {
            console.error(`Error uploading ${label}:`, error);
            toast.error(`Failed to upload ${label}`);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-background to-accent/20 border border-border/50 shadow-inner group transition-all duration-300 hover:shadow-lg">
            <span className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{label}</span>
            
            <div className={cn(
                "relative w-48 h-56 rounded-xl border-2 overflow-hidden bg-muted flex items-center justify-center transition-all duration-500",
                borderColor,
                isUploading ? "animate-pulse" : ""
            )}>
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <User className="w-12 h-12 opacity-20" />
                        <span className="text-xs font-medium opacity-50 italic">No Image</span>
                    </div>
                )}
                
                {isUploading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <Spinner className="w-8 h-8 text-primary" />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                        size="icon" 
                        variant="secondary" 
                        className="rounded-full h-10 w-10"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        type="button"
                    >
                        <Upload className="h-5 w-5" />
                    </Button>
                    {previewUrl && (
                        <Button 
                            size="icon" 
                            variant="destructive" 
                            className="rounded-full h-10 w-10"
                            onClick={() => {
                                setPreviewUrl(null);
                                onChange("");
                            }}
                            disabled={isUploading}
                            type="button"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
            />

            <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full border-dashed border-2 hover:border-solid hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                type="button"
            >
                <Camera className="mr-2 h-4 w-4" />
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {statusLabel && (
                <div className="mt-2 text-center">
                   <p className={cn("text-xs font-bold uppercase", statusColor)}>
                     STATUS: {statusLabel}
                   </p>
                </div>
            )}
        </div>
    );
};
