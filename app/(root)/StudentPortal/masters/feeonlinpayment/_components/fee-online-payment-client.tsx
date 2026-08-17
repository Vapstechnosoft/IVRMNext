"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FeeStructure,
  GroupTermMapping,
  OnlineGroupTermMapping,
} from "@/types/student-portal/masters/fee_online_payment";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getAmountDetails, savePayment } from "../actions";

import Script from "next/script";

import { useFeeDefaulterReport } from "@/hooks/fees/useReports";
import { useOnliePaymentDetails } from "@/hooks/student-portal/useStudentFeeOnlinePayment";
import { toast } from "sonner";
import { OnlinePaymentSeelctedTermDetails, OpenOnlinePaymentGateway } from "@/server/student-portal/masters/fee_online_payment";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function FeeOnlinePaymentClient() {
  // Get academic years data
  const { data: yearsResponse, isLoading: isLoadingYears } =
    useFeeDefaulterReport();
  const academicYearsList = Array.isArray(yearsResponse)
    ? yearsResponse
    : yearsResponse?.data || [];

  // State declarations with proper initialization
  const [academicYear, setAcademicYear] = useState<number | undefined>(
    undefined,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [groupTermList, setGroupTermList] = useState<OnlineGroupTermMapping[]>([]);
  const [feeDetails, setFeeDetails] = useState<FeeStructure[]>([]);
  const [paymentGateWayList, setPaymentGateWayList] = useState<any[]>([]);
  const [totalAmt, setTotalAmt] = useState(0);
  const [rebateAmount, setrebateAmount] = useState(0);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [gateway, setGateway] = useState<string>("");
  const [isShowing, setIsShowing] = useState(false);

  // Fetch student information based on selected academic year
  const { data: onlinepaymentDetails, isLoading: isLoadingOnlinePayment } =
    useOnliePaymentDetails({
      configset: "T",
    });

  // Set default academic year when data loads
  useEffect(() => {
    if (!isLoadingYears && academicYearsList.length > 0 && !isInitialized) {
      const firstYear = academicYearsList[0];
      setAcademicYear(firstYear.asmaY_Id);
      setIsInitialized(true);
    }
  }, [academicYearsList, isLoadingYears, isInitialized]);
  const [summary, setSummary] = useState({
    currentYearCharges: 0,
    currentYearPaid: 0,
    currentYearOutstanding: 0,
    currentYearConcession: 0,
  });
  // Build group-term mapping from the response data
  useEffect(() => {
    if (onlinepaymentDetails?.data) {
      const data = onlinepaymentDetails.data;
      const customgrplist = data.customgrplist || [];
      const termlst = data.termlst || [];

      // Map groups with their terms
      const mapping: OnlineGroupTermMapping[] = customgrplist.map((grp: any) => ({
        grp: {
          ...grp,
          checkedgrplst: false,
          grpdisable: false,
        },
        trm_list: termlst
          .filter((trm: any) => trm.fmgG_Id === grp.fmgG_Id)
          .map((trm: any) => ({
            ...trm,
            checkedheadlst: false,
            termdisablechk: false,
          })),
      }));

      setGroupTermList(mapping);
      if (
        data.filonlinepaymentgrid &&
        Array.isArray(data.filonlinepaymentgrid)
      ) {
        const charges = data.filonlinepaymentgrid.reduce(
          (acc: number, curr: any) => acc + (curr.fsS_NetAmount || 0),
          0,
        );
        const paid = data.filonlinepaymentgrid.reduce(
          (acc: number, curr: any) => acc + (curr.fsS_PaidAmount || 0),
          0,
        );
        const outstanding = data.filonlinepaymentgrid.reduce(
          (acc: number, curr: any) => acc + (curr.fsS_ToBePaid || 0),
          0,
        );
        const concession = data.filonlinepaymentgrid.reduce(
          (acc: number, curr: any) => acc + (curr.fsS_ConcessionAmount || 0),
          0,
        );

        setSummary({
          currentYearCharges: charges,
          currentYearPaid: paid,
          currentYearOutstanding: outstanding,
          currentYearConcession: concession,
        });
      }
    }
  }, [onlinepaymentDetails]);
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN");
  };
  // Example usage of session
  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      console.log("Session details:", session);
      console.log("role testing", session?.role.toUpperCase());
    };
    fetchSession();
  }, []);

  // Handle group checkbox change
  const handleGroupCheck = (grpIndex: number, checked: boolean) => {
    const newList = [...groupTermList];
    newList[grpIndex].grp.checkedgrplst = checked;
    newList[grpIndex].trm_list.forEach((trm) => {
      if (typeof trm === "object" && !trm.termdisablechk) {
        trm.checkedheadlst = checked;
      }
    });
    setGroupTermList(newList);
  };

  // Handle term checkbox change
  const handleTermCheck = (
    grpIndex: number,
    trmIndex: number,
    checked: boolean,
  ) => {
    const newList = [...groupTermList];
    if (typeof newList[grpIndex].trm_list[trmIndex] === "object") {
      newList[grpIndex].trm_list[trmIndex].checkedheadlst = checked;
    }

    // Update group check state based on terms
    const someTermsChecked = newList[grpIndex].trm_list.some(
      (t) => t.checkedheadlst,
    );

    if (someTermsChecked) {
      newList[grpIndex].grp.checkedgrplst = true;
    } else {
      newList[grpIndex].grp.checkedgrplst = false;
    }

    setGroupTermList(newList);
  };

  // Handle show details
  const handleShowDetails = async () => {
    const selectedList = groupTermList
      .filter((g) => g.grp.checkedgrplst)
      .map((g) => ({
        grp: {
          fmgG_Id: g.grp.fmgG_Id,
        },
        trm_list: g.trm_list
          .filter(
            (t: { checkedheadlst: boolean }) =>
              typeof t === "object" && t.checkedheadlst,
          )
          .map((t) => ({
            fmT_Id: t.fmT_Id,
          })),
      }));

    if (
      selectedList.length === 0 ||
      selectedList.some((g) => g.trm_list.length === 0)
    ) {
      toast.error("Please select at least one Group and Term");
      return;
    }
    setIsShowing(true);
    const payload = {
      asmcL_Id: studentData?.asmcL_ID || 0,
      fyP_PayModeType: "Portal",
      selected_list: selectedList,
    };

    const result = await OnlinePaymentSeelctedTermDetails(payload);
    if (result.success && result.data) {
      setFeeDetails(result.data.fillstudentviewdetails || []);
      setPaymentGateWayList(result.data.fillpaymentgateway || []);
      setShowPaymentDetails(true);
      const total = (result.data.fillstudentviewdetails || []).reduce(
        (acc: number, curr: any) => acc + (curr.fsS_ToBePaid || 0),
        0,
      );
      setrebateAmount(result.data.fsS_RebateAmount);
      setTotalAmt(total);
    }
    setIsShowing(false);
  };

  // Handle payment
const handlePayment = async () => {
    if (!gateway) {
        toast.error("Please select a payment gateway");
        return;
    }

    // Get selected groups and terms from groupTermList
    const selectedList = groupTermList
        .filter((g) => g.grp.checkedgrplst)
        .map((g) => ({
            grp: {
                fmgG_GroupName: g.grp.fmgG_GroupName,
                fmgG_Id: g.grp.fmgG_Id
            },
            trm_list: g.trm_list
                .filter((t) => t.checkedheadlst)
                .map((t) => ({
                    fmgG_GroupName: t.fmgG_GroupName,
                    fmgG_Id: t.fmgG_Id,
                    fmT_Name: t.fmT_Name,
                    fmT_Id: t.fmT_Id,
                    fmT_Order: t.fmT_Order || null,
                    preAdmFlag: t.preAdmFlag || false,
                    fmT_Amount: t.fmT_Amount || 0
                }))
        }));

    // Build the complete payload
    const payload = {
        asmcL_ID: studentData?.asmcL_ID || 0,
        onlinepaygteway: gateway,
        fyP_PayModeType: "Portal",
        topayamount: totalAmt,
        automanualreceiptno: 1,
        selected_list: selectedList,
        fillstudent: [
            {
                amst_Id: studentData?.amst_Id || 0,
                amsT_FirstName: studentData?.amsT_FirstName || "",
                amsT_MiddleName: studentData?.amsT_MiddleName || "",
                amsT_LastName: studentData?.amsT_LastName || "",
                amsT_RegistrationNo: studentData?.amsT_RegistrationNo || "",
                amsT_AdmNo: studentData?.amsT_AdmNo || "",
                amaY_RollNo: studentData?.amaY_RollNo || 0,
                classname: studentData?.classname || "",
                sectionname: studentData?.sectionname || "",
                asmcL_ID: studentData?.asmcL_ID || 0,
                amst_mobile: studentData?.amst_mobile || 0,
                amst_email_id: studentData?.amst_email_id || "",
                asysT_Id: studentData?.asysT_Id || 0,
                amsT_PerCity: studentData?.amsT_PerCity || ""
            }
        ],
        userid: 0,
        trans_id: "string",
        recenocol: [
            {
                receiptno: "string",
                amt: 0
            }
        ],
        selectedlist_partialpayment: [],
        // feeDetails.map((detail) => ({
        //     fmA_Id: detail.fmA_Id || 0,
        //     fmG_Id: detail.fmG_Id || 0,
        //     fmT_Id: detail.fmT_Id || 0,
        //     ftI_Id: detail.ftI_Id || 0,
        //     fmH_Id: detail.fmH_Id || 0,
        //     fmH_Flag: detail.fmH_Flag || "string",
        //     fsS_ToBePaid: detail.fsS_ToBePaid || 0
        // })),
        strdatanew: "string",
        fsS_RebateAmount: 0,
        fmoT_Amount: 0,
        ftiidss: "string",
        grpidss: "string",
        pendingamount: 0,
        fsS_FineAmount: 0,
        totalconcession: 0,
        validationvalue: "string",
        l_Name: "string",
        url: "string"
    };

    try {
        const response = await OpenOnlinePaymentGateway(payload);
        
        if (response.success && response.data) {
            // Check if the response contains Razorpay data
            if (response.data.merchantkey && response.data.trans_id) {
                const rzpData = response.data;
                const options = {
                    key: rzpData.merchantkey,
                    amount: rzpData.fmA_Amount * 100 || totalAmt * 100,
                    currency: "INR",
                    name: "Edumeeting School",
                    description: "Fee Payment",
                    image: "/assets/images/logo.png",
                    order_id: rzpData.trans_id,
                    handler: (response: any) => {
                        toast.success("Payment Successful: " + response.razorpay_payment_id);
                        // Optionally verify payment
                        // verifyPayment(response);
                    },
                    prefill: {
                        name: studentData?.amsT_FirstName || "",
                        email: studentData?.amst_email_id || "",
                        contact: String(studentData?.amst_mobile || "")
                    },
                    theme: {
                        color: "#3399cc"
                    },
                    modal: {
                        ondismiss: function() {
                            toast.info("Payment cancelled");
                        }
                    }
                };
                
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                // Handle non-Razorpay gateway response
                toast.success("Payment initiated successfully!");
                // Redirect or handle success
            }
        } else {
            toast.error(response.message || "Payment failed. Please try again.");
        }
    } catch (error) {
        console.error("Payment error:", error);
        toast.error("An error occurred while processing payment.");
    }
};

  // Get student data from fillstudent array
  const studentData = onlinepaymentDetails?.data?.fillstudent?.[0] || {};

  // Loading state
  if (isLoadingYears || isLoadingOnlinePayment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">Loading...</div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Script for Razorpay */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Card>
        <CardHeader>
          <CardTitle>Fee Online Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Academic Year Selection */}
          <div className="flex items-center space-x-4">
            <label className="w-1/4 font-semibold">
              Academic Year: <span className="text-red-500">*</span>
            </label>
            <Select
              value={academicYear ? String(academicYear) : ""}
              onValueChange={(val) => setAcademicYear(Number(val))}
              disabled={isLoadingYears}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue
                  placeholder={
                    isLoadingYears ? "Loading..." : "Select Academic Year"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {academicYearsList.map((item: any) => (
                  <SelectItem
                    key={item.asmaY_Id}
                    value={item.asmaY_Id.toString()}
                  >
                    {item.asmaY_Year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Student Information */}
            <div className="rounded-md border p-4">
              <h3 className="mb-4 font-bold text-primary">
                Student Information
              </h3>
              {isLoadingOnlinePayment ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2">Loading student details...</span>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Name</span>
                    <span className="col-span-2">
                      : {studentData?.amsT_FirstName || ""}{" "}
                      {studentData?.amsT_MiddleName || ""}{" "}
                      {studentData?.amsT_LastName || ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Class/Section/Roll No</span>
                    <span className="col-span-2">
                      : {studentData?.classname || ""} /{" "}
                      {studentData?.sectionname || ""} /{" "}
                      {studentData?.amaY_RollNo || ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Adm No</span>
                    <span className="col-span-2">
                      : {studentData?.amsT_AdmNo || ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Reg No</span>
                    <span className="col-span-2">
                      : {studentData?.amsT_RegistrationNo || ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Mobile No</span>
                    <span className="col-span-2">
                      : {studentData?.amst_mobile || ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-semibold">Email Id</span>
                    <span className="col-span-2">
                      : {studentData?.amst_email_id || ""}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Group Selection */}
            <div className="rounded-md border p-4">
              <h3 className="mb-4 font-bold text-primary">
                Group List <span className="text-red-500">*</span>
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {groupTermList.length > 0 ? (
                  groupTermList.map((grpItem, grpIndex) => (
                    <div
                      key={`${grpItem.grp.fmgG_Id}-${grpIndex}`}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={grpItem.grp.checkedgrplst}
                          onCheckedChange={(checked) =>
                            handleGroupCheck(grpIndex, !!checked)
                          }
                          disabled={grpItem.grp.grpdisable}
                        />
                        <span className="font-medium">
                          {grpItem.grp.fmgG_GroupName}
                        </span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {grpItem.trm_list.map((trm, trmIndex) => (
                          <div
                            key={`${trm.fmT_Id}-${trmIndex}`}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={trm.checkedheadlst}
                              onCheckedChange={(checked) =>
                                handleTermCheck(grpIndex, trmIndex, !!checked)
                              }
                              disabled={trm.termdisablechk}
                            />
                            <span>{trm.fmT_Name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No groups available for the selected academic year
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Section - Full Width Below */}
          <div className="w-full">
            <Card className="border-2 border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-3">Fee Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-gray-600 font-medium">
                      Current Year Charges
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      ₹ {formatCurrency(summary.currentYearCharges)}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="text-xs text-gray-600 font-medium">
                      Current Year Paid
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ₹ {formatCurrency(summary.currentYearPaid)}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-xs text-gray-600 font-medium">
                      Current Year Outstanding
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      ₹ {formatCurrency(summary.currentYearOutstanding)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 font-medium">
                      Current Year Concession
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      ₹ {formatCurrency(summary.currentYearConcession)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-2">
            <Button
              type="submit"
              disabled={isShowing}
              onClick={handleShowDetails}
            >
              Show
            </Button>
            <Button
              variant="destructive"
              onClick={() => window.location.reload()}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPaymentDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fee Details Table */}
            <div className="rounded-md border">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="border p-2 text-center">
                        <Checkbox checked={true} disabled />
                      </th>
                      <th className="border p-2">SLNO</th>
                      <th className="border p-2">Head Name</th>
                      <th className="border p-2">Installment Name</th>
                      <th className="border p-2">Opening Balance</th>
                      <th className="border p-2">Receivable</th>
                      <th className="border p-2">Charges</th>
                      <th className="border p-2">Concession</th>
                      <th className="border p-2">Fine</th>
                      <th className="border p-2">Payable Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeDetails.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="border p-2 text-center">
                          <Checkbox checked={true} disabled />
                        </td>
                        <td className="border p-2 text-center">{index + 1}</td>
                        <td className="border p-2">{row.fmH_FeeName}</td>
                        <td className="border p-2">{row.ftI_Name}</td>
                        <td className="border p-2 text-right">
                          {row.fsS_OBArrearAmount}
                        </td>
                        <td className="border p-2 text-right">
                          {row.fsS_NetAmount}
                        </td>
                        <td className="border p-2 text-right">
                          {row.fsS_TotalToBePaid}
                        </td>
                        <td className="border p-2 text-right">
                          {row.fsS_ConcessionAmount}
                        </td>
                        <td className="border p-2 text-right">
                          {row.fsS_FineAmount}
                        </td>
                        <td className="border p-2 text-right">
                          {row.fsS_ToBePaid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mt-4 flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-4">
                <label className="font-bold">Total Rebate:</label>
                <Input
                  value={`₹ ${rebateAmount.toLocaleString("en-IN")}`}
                  readOnly
                  className="w-40 bg-muted font-bold text-center"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="font-bold">Total Payable:</label>
                <Input
                  value={`₹ ${totalAmt.toLocaleString("en-IN")}`}
                  readOnly
                  className="w-40 bg-muted font-bold text-center"
                />
              </div>

              <div className="mt-4 flex space-x-6 items-center justify-center ">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 items-center justify-center ">
                  {paymentGateWayList.map((row) => (
                    <div
                      key={row.fpgD_Id}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        gateway === row.fpgD_PGName
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setGateway(row.fpgD_PGName)}
                    >
                      <input
                        type="radio"
                        checked={gateway === row.fpgD_PGName}
                        readOnly
                        className="sr-only"
                      />
                      {row.fpgD_Image ? (
                        <img
                          src={row.fpgD_Image}
                          alt={row.fpgD_PGName}
                          className="h-12 w-auto object-contain mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-sm font-medium text-center ${row.fpgD_Image ? "mt-1" : ""}`}
                      ></span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={handlePayment}
              >
                CLICK HERE TO PAY NOW
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
