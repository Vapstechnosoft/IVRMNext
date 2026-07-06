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
import { getInitialData, saveAdmissionData } from "@/server/admission/hutchings/transactions/hutchings-junior-college-admission-form";
import { format } from "date-fns";
import { Check, X, FileSpreadsheet, Printer, MessageSquare, Mail, ToggleLeft, ToggleRight, Plus, Minus, Eye, CreditCard } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  PASR_FirstName: z.string().min(1, "Enter the field First Name").regex(/^[a-zA-Z\s]*$/, "The field contains only alphabets").max(60),
  PASR_MiddleName: z.string().regex(/^[a-zA-Z\s]*$/, "The field contains only alphabets").max(40).optional(),
  PASR_LastName: z.string().min(1, "Enter the field Last Name").regex(/^[a-zA-Z\s]*$/, "The field contains only alphabets").max(40),
  PASR_MobileNo: z.string().min(10, "Mobile number must contain 10 digits").max(10).regex(/^[6-9]\d{9}$/, "Enter valid Mobile NO"),
  PASR_emailId: z.string().email("Please enter valid email which contains '@' and '.'").min(1, "Enter Email -Id"),
  PASR_BirthPlace: z.string().min(1, "Please enter Place of Birth"),
  Religion_Id: z.string().min(1, "Select Religion"),
  Caste_Id: z.string().min(1, "Select Caste"),
  PASR_ExtraActivity: z.string().min(1, "Enter Extra-curricular activities If Any"),
  PASR_DOB: z.string().min(1, "Please select Birth Date"),
  ASMCL_Id: z.string().min(1, "Select Applying For"),
  ASMAY_Id: z.string().min(1, "Select Academic Year"),
  PASR_Nationality: z.string().min(1, "Select Nationality"),
  PASR_MotherTongue: z.string().min(1, "Enter Mother Tongue"),
  PASR_Sex: z.string().min(1, "Select a gender"),
  ASMST_Id: z.string().optional(),
  
  // Residential Address
  PASR_ConStreet: z.string().min(1, "Enter the Street"),
  PASR_ConArea: z.string().min(1, "Enter the Area"),
  PASR_ConCountry: z.string().min(1, "Select Country"),
  PASR_ConState: z.string().min(1, "Select State"),
  PASR_ConCity: z.string().min(1, "Enter the City Name"),
  PASR_ConPincode: z.string().min(6, "Field must contain atleast 6 characters").max(6),

  // Permanent Address
  chkbox_address: z.boolean().default(false),
  PASR_PerStreet: z.string().min(1, "Enter the Street"),
  PASR_PerArea: z.string().min(1, "Enter the Area"),
  PASR_PerCountry: z.string().min(1, "Select Country"),
  PASR_PerState: z.string().min(1, "Select State"),
  PASR_PerCity: z.string().min(1, "Enter the City Name"),
  PASR_PerPincode: z.string().min(6, "Field must contain atleast 6 characters").max(6),
  
  // Fathers Details
  PASR_FatherName: z.string().min(1, "Enter Father's Name"),
  PASR_FatherSurname: z.string().min(1, "Enter Father's Surname"),
  PASR_FatherEducation: z.string().min(1, "Enter Qualification"),
  PASR_FatherOccupation: z.string().min(1, "Enter Service/Business"),
  PASR_FatherOfficePhNo: z.string().optional(),
  PASR_FatherHomePhNo: z.string().optional(),
  PASR_FatherMobleNo: z.string().min(10, "Mobile number must contain 10 digits").max(10).regex(/^[6-9]\d{9}$/, "Enter valid Mobile NO"),

  // Mothers Details
  PASR_MotherName: z.string().min(1, "Enter Mother's Name"),
  PASR_MotherSurname: z.string().min(1, "Enter Mother's Surname"),
  PASR_MotherEducation: z.string().min(1, "Enter Qualification"),
  PASR_MotherOccupation: z.string().min(1, "Enter Service/Business"),
  PASR_MotherOfficePhNo: z.string().optional(),
  PASR_MotherHomePhNo: z.string().optional(),
  PASR_MotherMobleNo: z.string().min(10, "Mobile number must contain 10 digits").max(10).regex(/^[6-9]\d{9}$/, "Enter valid Mobile NO"),
});

export default function HutchingsAdmissionFormPage() {
  const [initialData, setInitialData] = useState<any>({});
  const [reportDetails, setReportDetails] = useState<any[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  const [siblings, setSiblings] = useState<any[]>([{ pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SiblingsSection: '', pasrS_SiblingsAdmissionNo: '' }]);
  const [previousSchools, setPreviousSchools] = useState<any[]>([{ pasrpS_PrvSchoolName: '', pasrpS_PreviousClass: '', pasrpS_PreviousPer: '', pasrpS_Board: '', pasrpS_LeftYear: '' }]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      PASR_FirstName: "",
      PASR_MiddleName: "",
      PASR_LastName: "",
      PASR_MobileNo: "",
      PASR_emailId: "",
      chkbox_address: false,
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchValue) {
      const lowercasedSearch = searchValue.toLowerCase();
      const filtered = reportDetails.filter((item) => 
        (item.name && item.name.toLowerCase().includes(lowercasedSearch)) ||
        (item.pasR_emailId && item.pasR_emailId.toLowerCase().includes(lowercasedSearch)) ||
        (item.username && item.username.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredDetails(filtered);
    } else {
      setFilteredDetails(reportDetails);
    }
  }, [searchValue, reportDetails]);

  const loadInitialData = async () => {
    try {
      const res = await getInitialData();
      if (res?.success && res.data) {
        setInitialData(res.data);
        if (res.data.studentList) {
          setReportDetails(res.data.studentList);
          setFilteredDetails(res.data.studentList);
        }
      } else {
        toast.info("No Records Found");
      }
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const submitData = {
        ...values,
        siblings,
        previousSchools
      };
      
      const res = await saveAdmissionData(submitData);

      if (res?.success) {
        toast.success(res.message || "Admission form submitted successfully");
        form.reset();
        loadInitialData();
      } else {
        toast.error("Failed To submit form");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const onClear = () => {
    form.reset();
  };

  const handleAddressCopy = (checked: boolean) => {
    if (checked) {
      const values = form.getValues();
      form.setValue("PASR_PerStreet", values.PASR_ConStreet);
      form.setValue("PASR_PerArea", values.PASR_ConArea);
      form.setValue("PASR_PerCountry", values.PASR_ConCountry);
      form.setValue("PASR_PerState", values.PASR_ConState);
      form.setValue("PASR_PerCity", values.PASR_ConCity);
      form.setValue("PASR_PerPincode", values.PASR_ConPincode);
    }
  };

  const addSibling = () => {
    if (siblings.length < 5) {
      setSiblings([...siblings, { pasrS_SiblingsName: '', pasrS_SiblingsClass: '', pasrS_SiblingsSection: '', pasrS_SiblingsAdmissionNo: '' }]);
    }
  };

  const removeSibling = (index: number) => {
    if (siblings.length > 1) {
      const newSiblings = [...siblings];
      newSiblings.splice(index, 1);
      setSiblings(newSiblings);
    }
  };
  
  const updateSibling = (index: number, field: string, value: string) => {
    const newSiblings = [...siblings];
    newSiblings[index][field] = value;
    setSiblings(newSiblings);
  };
  
  const addPreviousSchool = () => {
     setPreviousSchools([...previousSchools, { pasrpS_PrvSchoolName: '', pasrpS_PreviousClass: '', pasrpS_PreviousPer: '', pasrpS_Board: '', pasrpS_LeftYear: '' }]);
  };
  
  const updatePreviousSchool = (index: number, field: string, value: string) => {
    const newSchools = [...previousSchools];
    newSchools[index][field] = value;
    setPreviousSchools(newSchools);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Admission Form</TabsTrigger>
          <TabsTrigger value="list">Applications Filled List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-6 mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="text-xl">Hutchings Junior College Admission Form</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  
                  {/* Student Details Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">Student Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="PASR_FirstName"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">First Name <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="First Name" className="uppercase" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_MiddleName"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Middle Name</FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="Middle Name" className="uppercase" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_LastName"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Last Name <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="Surname" className="uppercase" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_MobileNo"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Mobile Number <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="Mobile Number" maxLength={10} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_emailId"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Email-Id <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="Email-Id" type="email" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_BirthPlace"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Place of Birth <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} placeholder="Place of Birth" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                         <FormField
                          control={form.control}
                          name="PASR_DOB"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Date of Birth <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} type="date" />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ASMCL_Id"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Applying For <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {initialData.classList?.map((item: any) => (
                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ASMAY_Id"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Academic Year <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {initialData.yearList?.map((item: any) => (
                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>{item.asmaY_Year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_Sex"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Gender <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_Nationality"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Nationality <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {initialData.countryList?.map((item: any) => (
                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>{item.ivrmmC_CountryName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium bg-muted p-2 rounded">Residential Address</h4>
                        <FormField
                          control={form.control}
                          name="PASR_ConStreet"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Street <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_ConArea"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Area <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_ConCountry"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Country <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {initialData.countryList?.map((item: any) => (
                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>{item.ivrmmC_CountryName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="PASR_ConCity"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">City <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_ConPincode"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Pincode <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} maxLength={6} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="chkbox_address"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleAddressCopy(checked as boolean);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Permanent Address Same As Residential Address
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium bg-muted p-2 rounded">Permanent Address</h4>
                         <FormField
                          control={form.control}
                          name="PASR_PerStreet"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Street <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} disabled={form.watch('chkbox_address')} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_PerArea"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Area <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} disabled={form.watch('chkbox_address')} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_PerCountry"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Country <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={form.watch('chkbox_address')}>
                                <FormControl className="col-span-2">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {initialData.countryList?.map((item: any) => (
                                    <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>{item.ivrmmC_CountryName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="PASR_PerCity"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">City <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} disabled={form.watch('chkbox_address')} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="PASR_PerPincode"
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 gap-2 items-center">
                              <FormLabel className="font-semibold text-muted-foreground m-0">Pincode <span className="text-destructive">*</span></FormLabel>
                              <FormControl className="col-span-2">
                                <Input {...field} maxLength={6} disabled={form.watch('chkbox_address')} />
                              </FormControl>
                              <div className="col-span-3"><FormMessage /></div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sibling Details */}
                  <div className="mb-8">
                     <h3 className="text-lg font-semibold mb-4 text-primary border-b pb-2">Siblings Details (Hutchings, Pune)</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border">
                          <thead className="text-xs uppercase bg-muted/50">
                            <tr>
                              <th className="border p-2">SL.NO</th>
                              <th className="border p-2">Name</th>
                              <th className="border p-2">Class</th>
                              <th className="border p-2">Section</th>
                              <th className="border p-2">Admission Number</th>
                              <th className="border p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {siblings.map((sibling, index) => (
                              <tr key={index}>
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">
                                  <Input value={sibling.pasrS_SiblingsName} onChange={(e) => updateSibling(index, 'pasrS_SiblingsName', e.target.value)} />
                                </td>
                                <td className="border p-2">
                                  <Input value={sibling.pasrS_SiblingsClass} onChange={(e) => updateSibling(index, 'pasrS_SiblingsClass', e.target.value)} />
                                </td>
                                <td className="border p-2">
                                  <Input value={sibling.pasrS_SiblingsSection} onChange={(e) => updateSibling(index, 'pasrS_SiblingsSection', e.target.value)} />
                                </td>
                                <td className="border p-2">
                                  <Input value={sibling.pasrS_SiblingsAdmissionNo} onChange={(e) => updateSibling(index, 'pasrS_SiblingsAdmissionNo', e.target.value)} />
                                </td>
                                <td className="border p-2 text-center flex justify-center gap-2">
                                  {index === siblings.length - 1 && siblings.length < 5 && (
                                    <Button type="button" size="icon" variant="outline" onClick={addSibling}><Plus className="h-4 w-4" /></Button>
                                  )}
                                  {siblings.length > 1 && (
                                    <Button type="button" size="icon" variant="destructive" onClick={() => removeSibling(index)}><Minus className="h-4 w-4" /></Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-6 border-t pt-6">
                    <Button type="submit" className="w-40">
                      <Check className="mr-2 h-4 w-4" /> Submit
                    </Button>
                    <Button type="button" variant="destructive" className="w-32" onClick={onClear}>
                      <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6 mt-6">
           <Card>
            <CardHeader className="border-b">
              <CardTitle>Applications Filled List</CardTitle>
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
                      <th className="border p-2 text-center">SL.NO.</th>
                      <th className="border p-2">Name</th>
                      <th className="border p-2">Class</th>
                      <th className="border p-2">Stream</th>
                      <th className="border p-2">Reg No.</th>
                      <th className="border p-2">Gender</th>
                      <th className="border p-2">Email</th>
                      <th className="border p-2 text-center">Action</th>
                      <th className="border p-2 text-center">View/Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetails.map((user, index) => (
                      <tr key={index} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{user.name}</td>
                        <td className="border p-2">{user.classname}</td>
                        <td className="border p-2">{user.streamname}</td>
                        <td className="border p-2">{user.pasR_RegistrationNo}</td>
                        <td className="border p-2">{user.pasR_Sex}</td>
                        <td className="border p-2 break-all">{user.pasR_emailId}</td>
                        <td className="border p-2 text-center">
                           <Button type="button" variant="outline" size="sm" className="rounded-full">Update</Button>
                        </td>
                        <td className="border p-2 text-center flex flex-col gap-2">
                           <Button type="button" variant="default" size="sm" className="rounded-full">
                              <Eye className="mr-2 h-4 w-4" /> View Form
                           </Button>
                           <Button type="button" variant="default" size="sm" className="rounded-full bg-green-600 hover:bg-green-700">
                              <CreditCard className="mr-2 h-4 w-4" /> Pay Fee
                           </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredDetails.length === 0 && (
                      <tr>
                        <td colSpan={9} className="border p-4 text-center text-muted-foreground">
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
