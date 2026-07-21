"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SmsEmailSettingList } from "@/types/sms-email-configuration/sms-mail-setting";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import {
  useToggleEmailActive,
  useToggleSmsActive,
  useViewEmailTemplate,
} from "@/hooks/sms-email-configuration/useSmsMailSetting";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";

interface ListGridProps {
  data: SmsEmailSettingList[];
  onEdit: (record: SmsEmailSettingList) => void;
}

export function ListGrid({ data, onEdit }: ListGridProps) {
  const toggleSmsMutation = useToggleSmsActive();
  const toggleEmailMutation = useToggleEmailActive();
  const viewTemplateMutation = useViewEmailTemplate();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateHtml, setTemplateHtml] = useState("");

  const handleToggleSms = (record: SmsEmailSettingList) => {
    const mgs = record.iseS_SMSActiveFlag === false ? "Activate" : "De-Activate";
    Swal.fire({
      title: "Are You Sure?",
      text: `Do You Want to ${mgs} SMS Settings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: `Yes, ${mgs} It!`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleSmsMutation.mutate(record);
      }
    });
  };

  const handleToggleEmail = (record: SmsEmailSettingList) => {
    const mgs = record.iseS_MailActiveFlag === false ? "Activate" : "De-Activate";
    Swal.fire({
      title: "Are You Sure?",
      text: `Do You Want to ${mgs} Email Settings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: `Yes, ${mgs} It!`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleEmailMutation.mutate(record);
      }
    });
  };

  const handleViewEmailTemplate = (templateContent: string) => {
    setTemplateHtml(templateContent);
    setIsTemplateModalOpen(true);
  };

  const columns: ColumnDef<SmsEmailSettingList>[] = [
    {
      id: "sl_no",
      header: () => <div className="text-center">SL NO</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "iseS_Template_Name",
      header: () => <div className="text-center">Header</div>,
      cell: ({ row }) => <div className="text-center">{row.original.iseS_Template_Name}</div>,
    },
    {
      accessorKey: "iseS_SMSMessage",
      header: () => <div className="text-center">SMS Message</div>,
      cell: ({ row }) => (
        <div className="max-w-xs break-words text-center mx-auto">
          {row.original.iseS_SMSMessage}
        </div>
      )
    },
    {
      accessorKey: "iseS_Mail_Message",
      header: () => <div className="text-center">Email Message</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => {
              if (row.original.ismhtmL_Id) {
                viewTemplateMutation.mutate(row.original.ismhtmL_Id, {
                  onSuccess: (res) => {
                    if (res.data && res.data.length > 0) {
                      handleViewEmailTemplate(res.data[0].ismhtmL_HTMLTemplate);
                    } else {
                      handleViewEmailTemplate(row.original.iseS_MailHTMLTemplate || row.original.iseS_Mail_Message || "");
                    }
                  },
                });
              } else {
                handleViewEmailTemplate(row.original.iseS_MailHTMLTemplate || row.original.iseS_Mail_Message || "");
              }
            }}
          >
            <Eye className="w-4 h-4 mr-1" /> View Email Template
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "iseS_SMSActiveFlag",
      header: () => <div className="text-center">SMS Active</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Button
            variant="link"
            className={`p-0 h-auto font-bold ${
              row.original.iseS_SMSActiveFlag ? "text-green-500" : "text-red-500"
            }`}
            onClick={() => handleToggleSms(row.original)}
          >
            {row.original.iseS_SMSActiveFlag ? "Activated" : "Deactivated"}
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "iseS_MailActiveFlag",
      header: () => <div className="text-center">Email Active</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Button
            variant="link"
            className={`p-0 h-auto font-bold ${
              row.original.iseS_MailActiveFlag ? "text-green-500" : "text-red-500"
            }`}
            onClick={() => handleToggleEmail(row.original)}
          >
            {row.original.iseS_MailActiveFlag ? "Activated" : "Deactivated"}
          </Button>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="text-primary"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns as any}
        data={data}
        totalItems={data.length}
      />

      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Template</DialogTitle>
          </DialogHeader>
          <div
            className="mt-4 p-4 border rounded"
            dangerouslySetInnerHTML={{ __html: templateHtml }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
