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
  createPreUser,
  activateDeactivatePreUsers,
  sendSmsToPreUsers,
  sendEmailToPreUsers
} from "@/server/admission/preadmission/configuration/pre_user_create";
import { format } from "date-fns";
import { Check, X, FileSpreadsheet, Printer, MessageSquare, Mail, ToggleLeft, ToggleRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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

  useEffect(() => {
    if (searchValue) {
      const lowercasedSearch = searchValue.toLowerCase();
      const filtered = reportDetails.filter((item) => 
        (item.User_Name && item.User_Name.toLowerCase().includes(lowercasedSearch)) ||
        (item.Email_Id && item.Email_Id.toLowerCase().includes(lowercasedSearch)) ||
        (item.Mob_No && item.Mob_No.toString().includes(lowercasedSearch)) ||
        (item.Name && item.Name.toLowerCase().includes(lowercasedSearch)) ||
        (item.Created_Date && format(new Date(item.Created_Date), "dd-MM-yyyy").includes(lowercasedSearch))
      );
      setFilteredDetails(filtered);
    } else {
      setFilteredDetails(reportDetails);
    }
  }, [searchValue, reportDetails]);

  const loadInitialData = async () => {
    try {
      const res = await getPreUserInitialData(2); // MI_Id = 2 as per original code
      if (res?.success && res.data.searchstudentDetails) {
        setReportDetails(res.data.searchstudentDetails);
        setFilteredDetails(res.data.searchstudentDetails);
      } else {
        setReportDetails([]);
        setFilteredDetails([]);
        toast.info("No Records Found");
      }
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("Name", values.Name);
      formData.append("Email_id", values.Email_id);
      formData.append("Mobileno", values.Mobileno);
      formData.append("Username", values.Username);
      formData.append("Password", "Password@123");
      formData.append("Otpmobl", "false");
      formData.append("Otpemail", "false");
      formData.append("Special", "Special");
      formData.append("onlinepreadminfilepath", "");

      const res = await createPreUser(formData);

      const resData: any = res;

      if (resData?.data === "created" || resData === "created") {
        toast.success("Account created successfully");
        form.reset();
        loadInitialData();
      } else if (typeof resData?.data === "string" && resData.data !== "created") {
        toast.error(resData.data);
        loadInitialData();
      } else if (typeof resData === "string" && resData !== "created") {
        toast.error(resData);
        loadInitialData();
      } else {
        toast.error("Failed To Create User");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

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
      setSelectedUsers((prev) => prev.filter((item) => item.Id !== user.Id));
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

  const handleExport = () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select records to be Exported");
      return;
    }
    toast.info("Exporting functionality not yet fully implemented on client.");
  };

  const handlePrint = () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select Records to be Printed");
      return;
    }
    
    let printContents = `
      <div style="text-align: center; margin-bottom: 20px;">
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
          <td style="padding: 8px;">${user.Name || ''}</td>
          <td style="padding: 8px;">${user.User_Name || ''}</td>
          <td style="padding: 8px;">${user.Email_Id || ''}</td>
          <td style="padding: 8px;">${user.Mob_No || ''}</td>
          <td style="padding: 8px; text-align: center;">${user.Created_Date ? format(new Date(user.Created_Date), 'dd-MM-yyyy') : ''}</td>
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
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Preadmission User Creation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-12">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-3 gap-2 items-center">
                      <FormLabel className="font-semibold text-muted-foreground m-0">Name of User <span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-2">
                        <Input {...field} placeholder="Enter Name Of The User" maxLength={60} />
                      </FormControl>
                      <div className="col-span-3"><FormMessage /></div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Mobileno"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-3 gap-2 items-center">
                      <FormLabel className="font-semibold text-muted-foreground m-0">Mobile Number <span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-2">
                        <Input {...field} placeholder="Enter Mobile Number" maxLength={10} />
                      </FormControl>
                      <div className="col-span-3"><FormMessage /></div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="Email_id"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-3 gap-2 items-center">
                      <FormLabel className="font-semibold text-muted-foreground m-0">Email -Id <span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-2">
                        <Input {...field} placeholder="Enter Email Id" type="email" />
                      </FormControl>
                      <div className="col-span-3"><FormMessage /></div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Username"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-3 gap-2 items-center">
                      <FormLabel className="font-semibold text-muted-foreground m-0">User Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl className="col-span-2">
                        <Input {...field} placeholder="Enter The UserName" maxLength={60} />
                      </FormControl>
                      <div className="col-span-3"><FormMessage /></div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 flex justify-center gap-4 mt-4 border-t pt-4">
                <Button type="submit" className="w-40">
                  <Check className="mr-2 h-4 w-4" /> Create User
                </Button>
                <Button type="button" variant="destructive" className="w-32" onClick={onClear}>
                  <X className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {reportDetails.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Preadmission Users List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="font-medium">
                Total Grid Records : <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{reportDetails.length}</span>
              </div>
              {searchValue && (
                <div className="font-medium">
                  Total Records Searched : <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{filteredDetails.length}</span>
                </div>
              )}
              <div className="ml-auto">
                <Input 
                  placeholder="search here..." 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse border">
                <thead className="text-xs uppercase bg-muted/50">
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
                    const isSelected = selectedUsers.some(item => item.Id === user.Id) || selectedUsers.includes(user);
                    return (
                      <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="border p-2 text-center">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectUser(checked as boolean, user)}
                          />
                        </td>
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{user.Name}</td>
                        <td className="border p-2">{user.User_Name}</td>
                        <td className="border p-2 break-all">{user.Email_Id}</td>
                        <td className="border p-2">{user.Mob_No}</td>
                        <td className="border p-2 text-center">
                          {user.Created_Date ? format(new Date(user.Created_Date), "dd-MM-yyyy") : ""}
                        </td>
                        <td className="border p-2 text-center">{user.Activeflag}</td>
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
