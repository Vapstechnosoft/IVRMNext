"use client";

import React, { useState } from "react";
import { AddForm } from "./add-form";
import { ListGrid } from "./list-grid";
import {
  useGetSmsMailSettingDetails,
  useSmsMailSettingData,
} from "@/hooks/sms-email-configuration/useSmsMailSetting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SmsMailSettingPage() {
  const { data: initialData, isLoading } = useSmsMailSettingData();
  const getDetailsMutation = useGetSmsMailSettingDetails();
  const [editData, setEditData] = useState<any>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (record: any) => {
    setIsFormOpen(true);
    getDetailsMutation.mutate(
      { ises_id: record.iseS_Id, ivrmimp_id: record.ivrmimP_Id },
      {
        onSuccess: (response) => {
          setEditData(response.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      }
    );
  };

  const handleClear = () => {
    setEditData(undefined);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isFormOpen && (
        <AddForm 
          initialData={(initialData?.data as any) || undefined} 
          editData={editData} 
          onClear={handleClear}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
          <CardTitle>SMS &amp; Email Setting Details</CardTitle>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <ListGrid 
            data={(initialData?.data?.emailSmsSettingList as any[]) || []} 
            onEdit={handleEdit} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
