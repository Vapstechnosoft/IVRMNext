'use client';

import React from 'react';

interface AddressBookViewProps {
    data: any[];
}

const AddressBookView = React.forwardRef<HTMLDivElement, AddressBookViewProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="p-4 bg-white text-black">
            <h3 className="text-xl font-bold border-b pb-2 mb-6 text-center uppercase">Address Book</h3>
            <div className="grid grid-cols-2 gap-8">
                {data.map((user, index) => (
                    <div key={index} className="border p-4 rounded shadow-sm break-inside-avoid">
                        <table className="w-full text-sm">
                            <tbody>
                                {user.pasR_FirstName && (
                                    <tr>
                                        <td className="uppercase font-bold">
                                            {user.pasR_FirstName} ({user.pasR_RegistrationNo})
                                        </td>
                                    </tr>
                                )}
                                {user.pasR_FatherName && (
                                    <tr>
                                        <td>
                                            S/o <span className="uppercase">{user.pasR_FatherName}</span>
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td>
                                        {user.pasR_ConStreet && <div className="max-w-[300px] break-words">{user.pasR_ConStreet},</div>}
                                        {user.pasR_ConArea && <div className="max-w-[300px] break-words">{user.pasR_ConArea},</div>}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="max-w-[300px] break-words">
                                            {user.pasR_ConCity}
                                            {user.pasR_ConPincode && <span> - {user.pasR_ConPincode}</span>}
                                        </div>
                                    </td>
                                </tr>
                                {user.pasR_MobileNo && (
                                    <tr>
                                        <td>Mobile No: {user.pasR_MobileNo}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
});

AddressBookView.displayName = 'AddressBookView';
export default AddressBookView;
