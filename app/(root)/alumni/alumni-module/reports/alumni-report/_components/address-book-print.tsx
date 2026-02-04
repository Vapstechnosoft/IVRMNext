'use client';

import { IAlumniReportResultItem } from "@/types/alumni/alumni-report";
import React from "react";

interface AddressBookPrintProps {
    data: IAlumniReportResultItem[];
}

export const AddressBookPrint = React.forwardRef<HTMLDivElement, AddressBookPrintProps>(
    ({ data }, ref) => {
        return (
            <div ref={ref} className="p-4 bg-white text-black print:p-0">
                <div className="grid grid-cols-2 gap-4">
                    {data.map((item) => (
                        <div
                            key={item.almst_Id}
                            className="border border-black p-4 h-[180px] w-full flex flex-col justify-center break-inside-avoid text-[11px] leading-tight"
                        >
                            <div className="font-bold underline mb-1">
                                ({item.ASMAY_Id_NEW_Left || item.ASMAY_Id_Left}) ({item.ALMST_MembershipId}) ({item.ALMMC_MembershipCategory})
                            </div>
                            <div className="text-sm font-bold uppercase mb-1">
                                {item.amsT_FirstName}
                            </div>
                            <div className="whitespace-pre-wrap flex-grow mb-1">
                                {item.ALMST_FullAddess}
                            </div>
                            <div className="font-medium">
                                Mob: {item.amsT_MobileNo}
                            </div>
                            <div className="truncate">
                                Email: {item.amsT_emailId}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

AddressBookPrint.displayName = "AddressBookPrint";
