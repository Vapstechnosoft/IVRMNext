"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { VMSTemplateUploadDTO } from "@/types/visitors-management/vms-template-upload-types";
import {
  useVMSTemplateMDApproval,
  StatusFilterType,
} from "@/hooks/visitors-management/use-vms-template-md-approval";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  Download,
  Send,
  X,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  FileImage,
  FileCode,
  List,
  ArrowUpDown,
  Check,
  User,
  Calendar as CalendarIcon,
  CheckSquare,
} from "lucide-react";

export default function VMSTemplateMDApprovalForm() {
  const {
    gridData,
    filteredGrid,
    selectedStatusFilter,
    isLoading,
    showApprovalForm,
    ismmT_TemplateName,
    ismmT_TemplateType,
    ismmT_Description,
    ismmT_FilePath,
    ismmT_SubmittedBy,
    ismmT_SubmittedDate,
    ismmT_Status,
    setIsmmT_Status,
    ismmT_MDRemarks,
    setIsmmT_MDRemarks,
    handleFilterClick,
    reviewTemplate,
    saveMDDecision,
    clearForm,
  } = useVMSTemplateMDApproval();

  const [searchValue, setSearchValue] = useState("");

  // Sorting State
  const [sortKey, setSortKey] = useState<keyof VMSTemplateUploadDTO>("ismmT_Id");
  const [sortReverse, setSortReverse] = useState(true);

  // Preview Modals State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<"image" | "pdf" | null>(
    null
  );

  // ---------------------------------------------------------
  // PREVIEW FILE ($scope.showmodaldetailscheck)
  // ---------------------------------------------------------
  const openPreview = (filepath?: string) => {
    if (!filepath) {
      Swal.fire("Warning", "No file uploaded to view.", "warning");
      return;
    }

    const filename = filepath.toString();
    const nameArray = filename.split(".");
    const ext = nameArray[nameArray.length - 1].toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "bmp"].includes(ext) ||
      filepath.includes("placeholder")
    ) {
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
  // DOWNLOAD FILE ($scope.downloadFile)
  // ---------------------------------------------------------
  const handleDownload = (filepath?: string) => {
    if (!filepath) {
      Swal.fire("Warning", "No file available to download.", "warning");
      return;
    }
    const a = document.createElement("a");
    a.href = filepath;
    a.target = "_blank";
    a.download =
      filepath.substring(filepath.lastIndexOf("/") + 1) || "template_file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ---------------------------------------------------------
  // SORTING & FILTERING
  // ---------------------------------------------------------
  const handleSort = (key: keyof VMSTemplateUploadDTO) => {
    if (sortKey === key) {
      setSortReverse(!sortReverse);
    } else {
      setSortKey(key);
      setSortReverse(false);
    }
  };

  const finalGrid = filteredGrid
    .filter((item) => {
      const term = searchValue.toLowerCase();
      return (
        item.ismmT_TemplateName.toLowerCase().includes(term) ||
        item.ismmT_TemplateType.toLowerCase().includes(term) ||
        item.ismmT_Description.toLowerCase().includes(term) ||
        (item.ismmT_SubmittedBy || "").toLowerCase().includes(term) ||
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
      {/* 1. MD TEMPLATE REVIEW & APPROVAL FORM CARD */}
      {showApprovalForm && (
        <Card className="shadow-md border-t-4 border-t-indigo-700 animate-in fade-in duration-300">
          <CardHeader
            style={{ backgroundColor: "#3f51b5" }}
            className="text-white flex flex-row items-center justify-between py-3 px-5 rounded-t-md"
          >
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <CheckSquare className="w-5 h-5 text-white" />
              MD PORTAL - REVIEW & APPROVE TEMPLATE REQUEST
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearForm}
              className="text-white hover:bg-indigo-600 p-1 h-auto"
            >
              <X className="w-5 h-5 text-white" />
            </Button>
          </CardHeader>

          <CardContent style={{ backgroundColor: "#f9fbfd" }} className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT COLUMN: TEMPLATE METADATA (READONLY) */}
              <div className="space-y-4">
                {/* Template Name */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Template Name :
                  </span>
                  <div
                    className="col-span-8 font-bold text-base"
                    style={{ color: "#1a237e" }}
                  >
                    {ismmT_TemplateName}
                  </div>
                </div>

                {/* Template Type */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Template Type :
                  </span>
                  <div className="col-span-8">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-300 text-xs px-2 py-0.5">
                      {ismmT_TemplateType}
                    </Badge>
                  </div>
                </div>

                {/* Submitted By */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Submitted By :
                  </span>
                  <div className="col-span-8 font-semibold text-sm text-gray-800 flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-500" /> {ismmT_SubmittedBy}
                  </div>
                </div>

                {/* Submitted Date */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Submitted Date :
                  </span>
                  <div className="col-span-8 font-semibold text-sm text-gray-800 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />{" "}
                    {ismmT_SubmittedDate || "-"}
                  </div>
                </div>

                {/* Uploaded File */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Uploaded File :
                  </span>
                  <div className="col-span-8 flex items-center gap-2">
                    {ismmT_FilePath ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-info bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-7 px-3 gap-1"
                          onClick={() => openPreview(ismmT_FilePath)}
                        >
                          <Eye className="w-3.5 h-3.5" /> View File
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 gap-1"
                          onClick={() => handleDownload(ismmT_FilePath)}
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No File Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DESCRIPTION & DECISION FORM */}
              <div className="space-y-4">
                {/* Description */}
                <div className="grid grid-cols-12 items-start">
                  <span className="col-span-4 text-sm font-semibold text-gray-700 pt-1">
                    Description :
                  </span>
                  <div className="col-span-8">
                    <div className="p-3 bg-white border rounded-md text-sm text-gray-800 min-h-[60px]">
                      {ismmT_Description}
                    </div>
                  </div>
                </div>

                {/* Approval Status Buttons */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-4 text-sm font-semibold text-gray-700">
                    Approval Status :<span className="text-red-500">*</span>
                  </span>
                  <div className="col-span-8 flex items-center gap-3">
                    <Button
                      type="button"
                      variant={ismmT_Status === "Approved" ? "default" : "outline"}
                      className={
                        ismmT_Status === "Approved"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                          : "text-gray-700 font-semibold gap-1.5"
                      }
                      onClick={() => setIsmmT_Status("Approved")}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>

                    <Button
                      type="button"
                      variant={ismmT_Status === "Rejected" ? "default" : "outline"}
                      className={
                        ismmT_Status === "Rejected"
                          ? "bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5"
                          : "text-gray-700 font-semibold gap-1.5"
                      }
                      onClick={() => setIsmmT_Status("Rejected")}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>

                {/* MD Remarks (Mandatory) */}
                <div className="grid grid-cols-12 items-start">
                  <span className="col-span-4 text-sm font-semibold text-gray-700 pt-2">
                    MD Remarks :<span className="text-red-500">*</span>
                  </span>
                  <div className="col-span-8 space-y-1">
                    <Textarea
                      rows={3}
                      placeholder="Enter mandatory approval/rejection remarks..."
                      value={ismmT_MDRemarks}
                      onChange={(e) => setIsmmT_MDRemarks(e.target.value)}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <Button
                type="button"
                style={{ backgroundColor: "#2e7d32", borderColor: "#2e7d32" }}
                className="hover:opacity-90 text-white font-semibold px-6 py-2 gap-2"
                onClick={saveMDDecision}
              >
                <CheckSquare className="w-4 h-4" /> UPDATE DECISION
              </Button>

              <Button
                type="button"
                style={{ backgroundColor: "#ff5722", borderColor: "#ff5722" }}
                className="hover:opacity-90 text-white font-semibold px-6 py-2 gap-2"
                onClick={clearForm}
              >
                <X className="w-4 h-4" /> CANCEL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. SUBMITTED TEMPLATES APPROVAL LIST GRID */}
      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader className="bg-slate-50 border-b flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
            <List className="w-5 h-5 text-blue-600" />
            SUBMITTED TEMPLATES APPROVAL LIST
          </CardTitle>

          {/* SEARCH BOX */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Here..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* STATUS FILTER BUTTONS & TOTAL RECORDS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Filter Status :</span>
              <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-100">
                {(["All", "Pending", "Approved", "Rejected"] as StatusFilterType[]).map(
                  (filter) => (
                    <Button
                      key={filter}
                      variant={selectedStatusFilter === filter ? "default" : "ghost"}
                      size="sm"
                      className={
                        selectedStatusFilter === filter
                          ? filter === "Pending"
                            ? "bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-7"
                            : filter === "Approved"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-7"
                            : filter === "Rejected"
                            ? "bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-7"
                            : "bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-7"
                          : "text-gray-700 text-xs h-7 hover:bg-gray-200"
                      }
                      onClick={() => handleFilterClick(filter)}
                    >
                      {filter}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="text-sm font-semibold">
              Total Records :{" "}
              <Badge variant="secondary" className="ml-1 text-sm bg-gray-200 text-gray-800">
                {finalGrid.length}
              </Badge>
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
                  <TableHead className="text-center">MD Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      Loading Submitted Templates...
                    </TableCell>
                  </TableRow>
                ) : finalGrid.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      No Submitted Templates Found for Selected Filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  finalGrid.map((row, idx) => (
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
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
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
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 gap-1"
                          onClick={() => reviewTemplate(row)}
                        >
                          <Pencil className="w-3.5 h-3.5" /> Review / Approve
                        </Button>
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
              Document File Preview
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
