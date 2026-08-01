"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getPreUserInitialData,
  getPreUserDetails,
  createPreUser,
  activateDeactivatePreUsers,
  sendSmsToPreUsers,
  sendEmailToPreUsers
} from "@/server/admission/preadmission/configuration/pre_user_create";
import { format } from "date-fns";
import { Check, X, FileSpreadsheet, Printer, MessageSquare, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  Name: z.string().min(1, "Enter the field Name").regex(/^[a-zA-Z\s]*$/, "The field contains only alphabets").max(60),
  Mobileno: z.string().min(10, "Mobile number must contain 10 digits").max(10).regex(/^[6-9]\d{9}$/, "Enter valid Mobile NO"),
  Email_id: z.string().email("Please enter valid email which contains '@' and '.'").min(1, "Enter Email -Id"),
  Username: z.string().min(1, "Enter the field User Name").regex(/^[a-zA-Z\s]*$/, "The field contains only alphabets").max(60),
});

export default function PreusercreatePage() {
  const [reportDetails, setReportDetails] = useState<any[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [institutionLogo, setInstitutionLogo] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      Mobileno: "",
      Email_id: "",
      Username: "",
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const fetchGridData = async () => {
    try {
      const res = await getPreUserDetails();
      if (res?.success) {
        if (res.data.searchstudentDetails) {
          setReportDetails(res.data.searchstudentDetails);
          setFilteredDetails(res.data.searchstudentDetails);
        }
        if (res.data.logo && res.data.logo.length > 0) {
          setInstitutionLogo(res.data.logo[0].logo);
        }
      } else {
        setReportDetails([]);
        setFilteredDetails([]);
      }
    } catch (error) {
      toast.error("Failed to fetch user details");
    }
  };

  const loadInitialData = async () => {
    try {
      const res = await getPreUserInitialData();
      await fetchGridData();
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        name: values.Name,
        email_id: values.Email_id,
        mobileno: values.Mobileno,
        username: values.Username,
        password: "Password@123",
        admission: "",
        onlinepreadminfilepath: "",
        Special: "Special",
        alumni: "",
        admittedyer: null,
        leftyear: null,
        classidadmitted: null,
        leftclassid: null,
        courseadmittted: null,
        courseleft: null,
        branchadmittted: null,
        branchleft: null,
        semadmittted: null,
        semleft: null
      };

      const res = await createPreUser(payload);

      if (res?.success) {
        const successMessage = res.data?.message || res.message || "Account created successfully";
        toast.success(successMessage);
        form.reset();
        loadInitialData();
      } else {
        const errorMessage = res.data?.message || res?.message || "Failed To Create User";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    if (searchValue) {
      const lowercasedSearch = searchValue.toLowerCase();
      const filtered = reportDetails.filter((item) =>
        (item.user_name && item.user_name.toLowerCase().includes(lowercasedSearch)) ||
        (item.email_id && item.email_id.toLowerCase().includes(lowercasedSearch)) ||
        (item.mob_no && item.mob_no.toString().includes(lowercasedSearch)) ||
        (item.name && item.name.toLowerCase().includes(lowercasedSearch)) ||
        (item.created_date && format(new Date(item.created_date), "dd-MM-yyyy").includes(lowercasedSearch))
      );
      setFilteredDetails(filtered);
    } else {
      setFilteredDetails(reportDetails);
    }
  }, [searchValue, reportDetails]);

  const onClear = () => {
    form.reset();
    setSearchValue("");
    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers([...filteredDetails]);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (checked: boolean, user: any) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) => prev.filter((item) => item.id !== user.id));
    }
  };

  useEffect(() => {
    if (filteredDetails.length > 0 && selectedUsers.length === filteredDetails.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, filteredDetails]);

  const handleActivateDeactivate = async (status: number) => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select users first.");
      return;
    }
    try {
      const res = await activateDeactivatePreUsers(selectedUsers, status);
      if (status === 1) {
        toast.success("Activated Successfully...!");
      } else {
        toast.success("De-Activated Successfully...!");
      }
      loadInitialData();
      setSelectedUsers([]);
      setSelectAll(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSendSms = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select users first.");
      return;
    }
    try {
      const res = await sendSmsToPreUsers(selectedUsers);
      toast.success("SMS Sent Successfully...!");
    } catch (error) {
      toast.error("Failed to Send SMS");
    }
  };

  const handleSendEmail = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select users first.");
      return;
    }
    try {
      const res = await sendEmailToPreUsers(selectedUsers);
      toast.success("Email Sent Successfully...!");
    } catch (error) {
      toast.error("Failed to Send Email");
    }
  };

  const handleExport = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select records to be Exported");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      
      const exportData = selectedUsers.map((user, index) => ({
        "SL.NO.": index + 1,
        "Name": user.name || "",
        "User Name": user.user_name || "",
        "EMAIL-ID": user.email_id || "",
        "Mobile Number": user.mob_no || "",
        "DATE": user.created_date ? format(new Date(user.created_date), "dd-MM-yyyy") : "",
        "Status": user.activeflag || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Preadmission Users");
      XLSX.writeFile(workbook, "Preadmission_Users_List.xlsx");
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data to Excel");
    }
  };

  const handlePrint = () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select Records to be Printed");
      return;
    }

    let printContents = `
      <div style="text-align: center; margin-bottom: 20px;">
        ${institutionLogo ? `<img src="${institutionLogo}" alt="Institution Logo" style="max-height: 100px; margin-bottom: 10px;" />` : ""}
        <h3><u>PREADMISSION USERS LIST</u></h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;" border="1">
        <thead>
          <tr>
            <th style="padding: 8px;">SL.NO.</th>
            <th style="padding: 8px;">Name</th>
            <th style="padding: 8px;">User Name</th>
            <th style="padding: 8px;">EMAIL-ID</th>
            <th style="padding: 8px;">Mobile Number</th>
            <th style="padding: 8px;">DATE</th>
          </tr>
        </thead>
        <tbody>
    `;

    selectedUsers.forEach((user, index) => {
      printContents += `
        <tr>
          <td style="padding: 8px; text-align: center;">${index + 1}</td>
          <td style="padding: 8px;">${user.name || ''}</td>
          <td style="padding: 8px;">${user.user_name || ''}</td>
          <td style="padding: 8px;">${user.email_id || ''}</td>
          <td style="padding: 8px;">${user.mob_no || ''}</td>
          <td style="padding: 8px; text-align: center;">${user.created_date ? format(new Date(user.created_date), 'dd-MM-yyyy') : ''}</td>
        </tr>
      `;
    });

    printContents += `
        </tbody>
      </table>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Preadmission Users List</title>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-blue-800 text-sm font-bold uppercase">Preadmission User Creation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-3xl mx-auto space-y-4">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 items-center">
                      <FormLabel className="font-semibold text-sm m-0 text-right">Name of User:<span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} placeholder="Enter Name Of The User" maxLength={60} />
                      </FormControl>
                      <div className="col-span-4"><FormMessage /></div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Mobileno"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 items-center">
                      <FormLabel className="font-semibold text-sm m-0 text-right">Mobile Number:<span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} placeholder="Enter Mobile Number" maxLength={10} />
                      </FormControl>
                      <div className="col-span-4"><FormMessage /></div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Email_id"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 items-center">
                      <FormLabel className="font-semibold text-sm m-0 text-right">Email -Id:<span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} placeholder="Enter Email Id" type="email" />
                      </FormControl>
                      <div className="col-span-4"><FormMessage /></div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Username"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 gap-4 items-center">
                      <FormLabel className="font-semibold text-sm m-0 text-right">User Name:<span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-3">
                        <Input {...field} placeholder="Enter The UserName" maxLength={60} />
                      </FormControl>
                      <div className="col-span-4"><FormMessage /></div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <Button type="submit" className="bg-[#3f51b5] hover:bg-[#303f9f] text-white w-40">
                  <Check className="mr-2 h-4 w-4" /> CREATE USER
                </Button>
                <Button type="button" variant="destructive" className="bg-[#ff5722] hover:bg-[#e64a19] text-white w-32" onClick={onClear}>
                  CLEAR
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {reportDetails.length > 0 && (
        <Card className="border-t-4 border-t-blue-500 shadow-md mt-6">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-blue-800 text-sm font-bold uppercase">Preadmission Users List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-sm">
                Total Grid Records : <span className="bg-gray-500 text-white px-2 py-1 rounded-md">{reportDetails.length}</span>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <Input
                    placeholder="search here..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-64 pl-8"
                  />
                  <div className="absolute left-2 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border">
                <thead className="text-xs uppercase bg-[#005c97] text-white">
                  <tr>
                    <th className="border p-2 text-center">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      />
                    </th>
                    <th className="border p-2 text-center">Sl.No.</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">User Name</th>
                    <th className="border p-2">Email-ID</th>
                    <th className="border p-2">Mobile Number</th>
                    <th className="border p-2 text-center">Date</th>
                    <th className="border p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetails.map((user, index) => {
                    const isSelected = selectedUsers.some(item => item.id === user.id) || selectedUsers.includes(user);
                    return (
                      <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="border p-2 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectUser(checked as boolean, user)}
                          />
                        </td>
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{user.name}</td>
                        <td className="border p-2">{user.user_name}</td>
                        <td className="border p-2 break-all">{user.email_id}</td>
                        <td className="border p-2">{user.mob_no}</td>
                        <td className="border p-2 text-center">
                          {user.created_date ? format(new Date(user.created_date), "dd-MM-yyyy") : ""}
                        </td>
                        <td className="border p-2 text-center">{user.activeflag}</td>
                      </tr>
                    );
                  })}
                  {filteredDetails.length === 0 && (
                    <tr>
                      <td colSpan={8} className="border p-4 text-center text-muted-foreground">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredDetails.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={handleExport}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
                </Button>
                <Button type="button" variant="outline" className="bg-slate-50" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button type="button" variant="default" onClick={handleSendSms} disabled={selectedUsers.length === 0}>
                  <MessageSquare className="mr-2 h-4 w-4" /> SMS
                </Button>
                <Button type="button" variant="default" onClick={handleSendEmail} disabled={selectedUsers.length === 0}>
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
                <Button type="button" variant="destructive" className="bg-green-600 hover:bg-green-700" onClick={() => handleActivateDeactivate(1)} disabled={selectedUsers.length === 0}>
                  <ToggleRight className="mr-2 h-4 w-4" /> Activate
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleActivateDeactivate(0)} disabled={selectedUsers.length === 0}>
                  <ToggleLeft className="mr-2 h-4 w-4" /> De-Activate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
