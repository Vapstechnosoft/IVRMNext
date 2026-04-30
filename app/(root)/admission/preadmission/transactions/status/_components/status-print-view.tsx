'use client';

import React from 'react';
import { format } from 'date-fns';

interface StatusPrintViewProps {
    data: any[];
    userName: string;
}

const StatusPrintView = React.forwardRef<HTMLDivElement, StatusPrintViewProps>(({ data, userName }, ref) => {
    const ddate = new Date();

    return (
        <div ref={ref} className="p-8 bg-white text-black">
            <center>
                <h4 className="text-xl font-bold underline mb-6">Status REPORT</h4>
            </center>
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-2">SL.No</th>
                        <th className="border border-black p-2 text-left">Name</th>
                        <th className="border border-black p-2">Class</th>
                        <th className="border border-black p-2 text-left">RegNo</th>
                        <th className="border border-black p-2">Status</th>
                        <th className="border border-black p-2">Mobile No.</th>
                        <th className="border border-black p-2">Remark</th>
                        <th className="border border-black p-2 text-left">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index}>
                            <td className="border border-black p-2 text-center">{index + 1}</td>
                            <td className="border border-black p-2">{user.name}</td>
                            <td className="border border-black p-2 text-center">{user.className}</td>
                            <td className="border border-black p-2">{user.pasR_RegistrationNo}</td>
                            <td className="border border-black p-2 text-center">{user.statusName}</td>
                            <td className="border border-black p-2 text-center">{user.pasR_MobileNo}</td>
                            <td className="border border-black p-2">{user.remark}</td>
                            <td className="border border-black p-2">{user.pasR_emailId}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={8} className="p-4 text-center">
                            <label className="font-bold">
                                Date: {format(ddate, 'dd/MM/yyyy')} UserName: {userName}
                            </label>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
});

StatusPrintView.displayName = 'StatusPrintView';
export default StatusPrintView;
