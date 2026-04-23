'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PS7ReportDisplayProps {
    data: any;
    year: string;
}




export function PS7ReportDisplay({ data, year }: PS7ReportDisplayProps) {
    if (!data || !data.employeeDetails || data.employeeDetails.length === 0) return null;

    const currentYearStr = year || new Date().getFullYear().toString();
    const nextYearNum = parseInt(currentYearStr) + 1;

    const handlePrint = () => {
        window.print();
    };

    const response = data 

    return (
        <>
            <style>
                {`
            @media print {
                body * {
                visibility: hidden;
                }

                #printable-report,
                #printable-report * {
                visibility: visible;
                }

                #printable-report {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                }
            }
            `}
            </style>
            <div id="printable-report">
                <div className="flex justify-end w-full print:hidden">
                    <Button onClick={() => handlePrint()} className="mb-4 w-fit" variant="destructive" >Print</Button>
                </div>
                {response?.employeeDetails.map((emp: any, index: number) => {
                    // Filter details for this specific employee
                    const empDetails = response?.details.filter((d: any) => d.hrmE_Id === emp.hrmE_Id);

                    // Calculate totals
                    const totalWages = empDetails.reduce((acc: number, cur: any) => acc + (cur.sumCondition || 0), 0);
                    const totalPension = empDetails.reduce((acc: number, cur: any) => acc + (cur.pensionAmount || 0), 0);

                    return (
                        <div key={emp.hrmE_Id || index}>
                            <Card key={emp.hrmE_Id || index} className="p-8 mt-4 shadow-md border-t-4 border-t-primary bg-white" >
                                <div className="text-center space-y-2 mb-8">
                                    <h4 className="font-semibold text-lg">(For Exempted Established only)</h4>
                                    <h4 className="font-bold text-xl uppercase tracking-wider text-primary">The Employees' Pension Scheme, 1995</h4>
                                    <h4 className="font-semibold tracking-wide">(Paragraph 19)</h4>
                                    <h4 className="font-bold text-lg mt-6 pt-4 border-t w-max mx-auto px-8">
                                        Contribution Card for the member for the year {currentYearStr} To {nextYearNum}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-12 gap-4 mb-10 text-sm bg-muted/10 p-6 rounded-lg border">
                                    <div className="col-span-5 space-y-3 font-semibold text-muted-foreground">
                                        <p>(1) Account Number :</p>
                                        <p>(2) Name (in Block Capitals) :</p>
                                        <p>(3) Father's/Husband's Name :</p>
                                        <p>(4) Name & Address of the Established :</p>
                                        <p>(5) Whether Opted to contributed on wages, excess of Rs. :</p>
                                    </div>
                                    <div className="col-span-7 space-y-3 font-bold text-gray-800">
                                        <p className="text-primary">{emp.hrmE_PFAccNo || '-'}</p>
                                        <p>{emp.hrmE_EmployeeName || '-'}</p>
                                        <p>{emp.hrmE_FatherName || '-'}</p>
                                        <p>{emp.mI_Name} {emp.mI_Address1}</p>
                                        <p>15000.00</p>
                                    </div>
                                </div>

                                <div className="border rounded-md overflow-hidden mb-8 shadow-sm">
                                    <table className="w-full text-center text-sm">
                                        <thead className="bg-[#f0f4f8] text-gray-700">
                                            <tr className="border-b">
                                                <th className="p-3 border-r font-bold w-[15%]">Month</th>
                                                <th className="p-3 border-r font-bold w-[30%]">Amount of Wages retaining allownace,<br />if any & DA includ.Cash value of food <br />concession paid during the month</th>
                                                <th className="p-3 border-r font-bold w-[20%]">Contribution to pension <br /> Fund 8.33%</th>
                                                <th className="p-3 border-r font-bold w-[20%]">No.of days / period of non <br />contributing service</th>
                                                <th className="p-3 font-bold w-[15%]">Remarks</th>
                                            </tr>
                                            <tr className="border-b bg-[#e2e8f0]/50 text-xs font-semibold">
                                                <td className="p-1 border-r">(1)</td>
                                                <td className="p-1 border-r">(2)</td>
                                                <td className="p-1 border-r">(3)</td>
                                                <td className="p-1 border-r">(4)</td>
                                                <td className="p-1">(5)</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empDetails.length > 0 ? (
                                                empDetails.map((detail: any, i: number) => (
                                                    <tr key={i} className="border-b hover:bg-muted/10 transition-colors">
                                                        <td className="p-2 border-r font-medium pl-6">{detail.monthName}</td>
                                                        <td className="p-2 border-r">{detail.sumCondition}</td>
                                                        <td className="p-2 border-r">{detail.pensionAmount}</td>
                                                        <td className="p-2 border-r"></td>
                                                        {i === 0 && (
                                                            <td className="p-2 text-xs align-top bg-muted/5 text-left pl-3 text-muted-foreground" rowSpan={empDetails.length}>
                                                                {emp.hrmE_PensionStoppedDate ? (
                                                                    <>
                                                                        Date Of Leaving {new Date(emp.hrmE_PensionStoppedDate).toLocaleDateString()}<br />
                                                                        Service<br />
                                                                        Reason of Leaving<br />
                                                                        Service,<br />
                                                                        Date OF Attaining<br />
                                                                        The age of 58 Years <br />
                                                                        For Stoppage Of <br />
                                                                        Contribution
                                                                    </>
                                                                ) : null}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-muted-foreground bg-muted/5">No records found for this employee</td>
                                                </tr>
                                            )}

                                            {empDetails.length > 0 && (
                                                <tr className="font-extrabold bg-[#f8fafc] border-t-2 border-slate-300">
                                                    <td className="p-3 border-r  pl-6">TOTAL</td>
                                                    <td className="p-3 border-r text-primary text-lg">{totalWages}</td>
                                                    <td className="p-3 border-r text-primary text-lg">{totalPension}</td>
                                                    <td className="p-3 border-r"></td>
                                                    <td className="p-3 bg-muted/5"></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-6 text-sm text-justify mb-16 bg-blue-50/50 p-6 rounded-lg border border-blue-100 leading-relaxed font-medium text-slate-800">
                                    <p>
                                        (1) Certificate that the difference between total number of contribution shown under Column (3) of the above table and that Arrieved at on total wages shows in column (2) at the prescribed rate is solely due to the rounding off contribution to the nearest Re. under the rules.
                                    </p>
                                    <p>
                                        (2) Certificate that the total amount of contributions indicated under col.(3) i.e. <span className="font-extrabold text-primary text-base px-1">{totalPension}.00</span> has already been of remitted in full in account No. 10 (Pension Fund Contribution).
                                    </p>
                                </div>

                                <div className="flex justify-between items-end pt-12 pb-6 px-10">
                                    <div className="text-base font-semibold text-gray-700">Date : <span className="border-b border-dashed border-gray-400 w-32 inline-block"></span></div>
                                    <div className="text-base font-semibold border-t-2 border-gray-800 pt-3 px-8 text-gray-800">Signature of the Employer (with Official Seal)</div>
                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
