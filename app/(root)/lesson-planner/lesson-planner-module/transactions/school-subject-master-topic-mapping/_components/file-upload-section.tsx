'use client';

import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, Trash, Upload } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { ChangeEvent, useState } from 'react';

interface FileUploadSectionProps {
    name: string;
    label: string;
    files: any[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpload: (index: number, file: File) => void;
}

export function FileUploadSection({ name, label, files, onAdd, onRemove, onUpload }: FileUploadSectionProps) {
    const { control } = useFormContext();

    const handleFileChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(index, e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2 border p-4 rounded-md">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">{label}</h3>
                <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={files.length >= 10}>
                    <Upload className="h-4 w-4 mr-2" /> Add
                </Button>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-center p-2">Sl.No</th>
                        <th className="text-center p-2">File</th>
                        <th className="text-center p-2">View</th>
                        <th className="text-center p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index} className="border-b last:border-0">
                            <td className="text-center p-2">{index + 1}</td>
                            <td className="text-center p-2">
                                <Input
                                    type="file"
                                    className="cursor-pointer"
                                    accept="image/*, application/pdf, video/mp4, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                    onChange={(e) => handleFileChange(index, e)}
                                />
                                {file.lpmtR_FileName && <span className="text-xs text-green-600 block mt-1">{file.lpmtR_FileName}</span>}
                            </td>
                            <td className="text-center p-2">
                                {(file.lpmtR_Resources) && (
                                    <Button type="button" variant="ghost" size="icon" title="View" onClick={() => window.open(file.lpmtR_Resources, '_blank')}>
                                        <Eye className="h-4 w-4 text-blue-500" />
                                    </Button>
                                )}
                            </td>
                            <td className="text-center p-2">
                                {files.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)} className="text-red-500">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
