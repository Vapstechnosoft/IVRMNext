"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
  vmsTemplateUploadSchema,
  VMSTemplateUploadSchema,
} from "@/schemas/visitors-management/vms-template-upload-schema";
import { VMSTemplateUploadDTO } from "@/types/visitors-management/vms-template-upload-types";
import { useVMSTemplateUpload } from "@/hooks/visitors-management/use-vms-template-upload";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  FileText,
  Upload,
  Eye,
  Download,
  Send,
  X,
  Search,
  Pencil,
  FileImage,
  FileCode,
  List,
  ArrowUpDown,
} from "lucide-react";

export default function VMSTemplateUploadForm() {
  const { gridData, templateTypes, isLoading, saveData, deactivateData } =
    useVMSTemplateUpload();

  const [searchValue, setSearchValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sorting State
  const [sortKey, setSortKey] = useState<keyof VMSTemplateUploadDTO>("ismmT_Id");
  const [sortReverse, setSortReverse] = useState(true);

  // Preview Modals State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<"image" | "pdf" | null>(
    null
  );

  const form = useForm<VMSTemplateUploadSchema>({
    resolver: zodResolver(vmsTemplateUploadSchema),
    defaultValues: {
      ismmT_Id: 0,
      ismmT_TemplateName: "",
      ismmT_TemplateType: "",
      ismmT_FilePath: "",
      ismmT_Description: "",
    },
  });

  const filePath = form.watch("ismmT_FilePath");

  // ---------------------------------------------------------
  // 1. FILE UPLOAD HANDLING ($scope.uploadFile)
  // ---------------------------------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Local preview URL
      const tempUrl = URL.createObjectURL(file);
      form.setValue("ismmT_FilePath", tempUrl, { shouldValidate: true });

      Swal.fire({
        title: "Success",
        text: `File Selected: ${file.name}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // ---------------------------------------------------------
  // 2. CLEAR FORM ($scope.Clearid)
  // ---------------------------------------------------------
  const handleClear = () => {
    form.reset({
      ismmT_Id: 0,
      ismmT_TemplateName: "",
      ismmT_TemplateType: "",
      ismmT_FilePath: "",
      ismmT_Description: "",
    });
    setSelectedFile(null);
  };

  // ---------------------------------------------------------
  // 3. SAVE / REQUEST FOR APPROVAL ($scope.saverecord)
  // ---------------------------------------------------------
  const onSubmit = async (data: VMSTemplateUploadSchema) => {
    await saveData(data, handleClear);
  };

  // ---------------------------------------------------------
  // 4. EDIT DATA ($scope.EditData)
  // ---------------------------------------------------------
  const handleEdit = (record: VMSTemplateUploadDTO) => {
    if (!record) return;
    form.reset({
      ismmT_Id: record.ismmT_Id,
      ismmT_TemplateName: record.ismmT_TemplateName,
      ismmT_TemplateType: record.ismmT_TemplateType,
      ismmT_FilePath: record.ismmT_FilePath || "",
      ismmT_Description: record.ismmT_Description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------------------------------------------------------
  // 5. PREVIEW FILE ($scope.showmodaldetailscheck)
  // ---------------------------------------------------------
  const openPreview = (filepath?: string) => {
    if (!filepath) {
      Swal.fire("Warning", "No file uploaded to view.", "warning");
      return;
    }

    const filename = filepath.toString();
    const nameArray = filename.split(".");
    const ext = nameArray[nameArray.length - 1].toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext) || filepath.includes("placeholder")) {
      setPreviewFileType("image");
      setPreviewUrl(filepath);
    } else if (["pdf", "txt"].includes(ext) || filepath.includes("pdf")) {
      setPreviewFileType("pdf");
      setPreviewUrl(filepath);
    } else {
      window.open(filepath, "_blank");
    }
  };

  // ---------------------------------------------------------
  // 6. DOWNLOAD FILE ($scope.downloadFile)
  // ---------------------------------------------------------
  const handleDownload = (filepath?: string) => {
    if (!filepath) {
      Swal.fire("Warning", "No file available to download.", "warning");
      return;
    }
    const a = document.createElement("a");
    a.href = filepath;
    a.target = "_blank";
    a.download = filepath.substring(filepath.lastIndexOf("/") + 1) || "template_file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ---------------------------------------------------------
  // 7. SORTING & FILTERING
  // ---------------------------------------------------------
  const handleSort = (key: keyof VMSTemplateUploadDTO) => {
    if (sortKey === key) {
      setSortReverse(!sortReverse);
    } else {
      setSortKey(key);
      setSortReverse(false);
    }
  };

  const filteredGrid = gridData
    .filter((item) => {
      const term = searchValue.toLowerCase();
      return (
        item.ismmT_TemplateName.toLowerCase().includes(term) ||
        item.ismmT_TemplateType.toLowerCase().includes(term) ||
        item.ismmT_Description.toLowerCase().includes(term) ||
        (item.ismmT_Status || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      if (valA < valB) return sortReverse ? 1 : -1;
      if (valA > valB) return sortReverse ? -1 : 1;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* 1. DEPARTMENT HEAD - TEMPLATE UPLOAD FORM CARD */}
      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5 text-blue-600" />
            TEMPLATE APPROVAL SYSTEM - DEPARTMENT HEAD
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  {/* Template Name */}
                  <FormField
                    control={form.control}
                    name="ismmT_TemplateName"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                        <FormLabel className="sm:col-span-4 font-semibold text-gray-700">
                          Template Name :<span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="sm:col-span-8 space-y-1">
                          <FormControl>
                            <Input
                              placeholder="Enter Template Name"
                              maxLength={200}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Template Type */}
                  <FormField
                    control={form.control}
                    name="ismmT_TemplateType"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                        <FormLabel className="sm:col-span-4 font-semibold text-gray-700">
                          Template Type :<span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="sm:col-span-8 space-y-1">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="--Select Template Type--" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templateTypes.map((t) => (
                                <SelectItem key={t.id} value={t.name}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Upload Template File */}
                  <FormField
                    control={form.control}
                    name="ismmT_FilePath"
                    render={() => (
                      <FormItem className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2">
                        <FormLabel className="sm:col-span-4 font-semibold text-gray-700 pt-2">
                          Upload Template :<span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="sm:col-span-8 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              readOnly
                              placeholder={
                                selectedFile?.name || filePath || "No file chosen"
                              }
                              className="bg-gray-50"
                            />
                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-1 shrink-0 text-sm">
                              <Upload className="w-4 h-4" /> Browse...
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
                          </p>
                          <FormMessage />

                          {filePath && (
                            <button
                              type="button"
                              onClick={() => openPreview(filePath)}
                              className="text-sm text-cyan-600 hover:underline flex items-center gap-1 font-medium pt-1"
                            >
                              <Eye className="w-4 h-4" /> Preview Uploaded File
                            </button>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="ismmT_Description"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2">
                        <FormLabel className="sm:col-span-4 font-semibold text-gray-700 pt-2">
                          Description :<span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="sm:col-span-8 space-y-1">
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Enter Template Description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <hr className="my-4" />

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  type="submit"
                  style={{ backgroundColor: "#3f51b5", borderColor: "#3f51b5" }}
                  className="hover:opacity-90 text-white font-semibold px-6 py-2 gap-2"
                >
                  <Send className="w-4 h-4" /> REQUEST FOR APPROVAL
                </Button>

                <Button
                  type="button"
                  style={{ backgroundColor: "#ff5722", borderColor: "#ff5722" }}
                  className="hover:opacity-90 text-white font-semibold px-6 py-2 gap-2"
                  onClick={handleClear}
                >
                  <X className="w-4 h-4" /> CANCEL
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 2. DETAILS GRID - SUBMITTED TEMPLATES */}
      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
            <List className="w-5 h-5 text-blue-600" />
            TEMPLATE DETAILS GRID
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* SEARCH & TOTAL RECORDS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-semibold">
              Total Records :{" "}
              <Badge variant="secondary" className="ml-1 text-sm">
                {filteredGrid.length}
              </Badge>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Here..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* GRID TABLE */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 font-bold">
                  <TableHead className="text-center w-12">S.No</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("ismmT_TemplateName")}
                  >
                    <div className="flex items-center gap-1">
                      Template Name <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("ismmT_TemplateType")}
                  >
                    <div className="flex items-center gap-1">
                      Template Type <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead
                    className="text-center cursor-pointer"
                    onClick={() => handleSort("ismmT_SubmittedDate")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Submitted Date <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer"
                    onClick={() => handleSort("ismmT_Status")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </TableHead>
                  <TableHead>MD Remarks</TableHead>
                  <TableHead className="text-center">View / Download</TableHead>
                  <TableHead className="text-center">Status / Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      Loading Template Records...
                    </TableCell>
                  </TableRow>
                ) : filteredGrid.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      No Template Requests Found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrid.map((row, idx) => (
                    <TableRow key={row.ismmT_Id}>
                      <TableCell className="text-center font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {row.ismmT_TemplateName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-sky-50 text-sky-700 border-sky-300"
                        >
                          {row.ismmT_TemplateType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {row.ismmT_Description}
                      </TableCell>
                      <TableCell>{row.ismmT_SubmittedBy}</TableCell>
                      <TableCell className="text-center">
                        {row.ismmT_SubmittedDate || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.ismmT_Status === "Pending" && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            Pending
                          </Badge>
                        )}
                        {row.ismmT_Status === "Approved" && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Approved
                          </Badge>
                        )}
                        {row.ismmT_Status === "Rejected" && (
                          <Badge className="bg-rose-600 hover:bg-rose-700 text-white">
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="italic text-gray-600">
                        {row.ismmT_MDRemarks || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.ismmT_FilePath ? (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => openPreview(row.ismmT_FilePath)}
                              className="text-cyan-600 hover:text-cyan-800"
                              title="View File"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(row.ismmT_FilePath)}
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Download File"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleEdit(row)}
                            className="text-cyan-600 hover:text-cyan-800"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deactivateData(row)}
                            className={
                              row.ismmT_ActiveFlag
                                ? "text-rose-600 hover:underline text-xs font-semibold"
                                : "text-emerald-600 hover:underline text-xs font-semibold"
                            }
                          >
                            {row.ismmT_ActiveFlag ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PREVIEW MODAL */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              {previewFileType === "image" ? (
                <FileImage className="w-5 h-5" />
              ) : (
                <FileCode className="w-5 h-5" />
              )}
              File Preview
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 flex items-center justify-center bg-gray-50 rounded-md">
            {previewFileType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl || ""}
                alt="File Preview"
                className="max-h-[450px] object-contain rounded border"
              />
            ) : (
              <iframe
                src={previewUrl || ""}
                className="w-full h-[480px] rounded border"
                title="Document Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
