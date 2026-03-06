import { EmployeeProfileDetail } from '@/types/hrms/reports/employee-profile-report';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface EmployeeProfileCardProps {
    profile: EmployeeProfileDetail & {
        institutionName?: string;
        institutionAddress?: string;
        institutionPincode?: string;
    };
}

export function EmployeeProfileCard({ profile }: EmployeeProfileCardProps) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <Card className='mb-6 overflow-hidden print:mb-8 print:break-inside-avoid print:shadow-none print:border-none print:p-0'>
            <CardContent className='p-6 print:p-0'>
                {/* Header removed from here to be displayed once per page */}

                {/* Profile Details */}
                <div className='flex flex-col md:flex-row gap-6 print:flex-row'>
                    {/* Left Data Column */}
                    <div className='flex-1'>
                        <table className='w-full text-sm print:text-xs'>
                            <tbody>
                                <DetailRow label='Employee Code' value={profile.employeeCode} />
                                <DetailRow label='Name of Employee' value={profile.employeeName} className='uppercase' />
                                <DetailRow label='Designation' value={profile.designation} />
                                <DetailRow label='Contact Details' value={profile.contactDetails} />
                                <DetailRow label='Email-Id' value={profile.emailId} />
                                <DetailRow label='Join Date' value={formatDate(profile.joinDate)} />
                                <DetailRow label='Left Date' value={formatDate(profile.leftDate)} />
                                <DetailRow label='Total no. Of Service' value={profile.totalService} />
                                <DetailRow label='Blood Group' value={profile.bloodGroup} />
                                <DetailRow label='Address' value={profile.address} />
                                <DetailRow label='Age' value={profile.age ? `${profile.age}` : 'N/A'} />
                                <DetailRow label='Religion' value={profile.religion} />
                                <DetailRow label='DOB' value={formatDate(profile.dob)} />
                                <DetailRow label='AdharCard Number' value={profile.aadharCardNumber} />
                                <DetailRow label='Father Name' value={profile.fatherName} />
                            </tbody>
                        </table>
                    </div>

                    {/* Right Image Column */}
                    <div className='w-full md:w-48 flex justify-center md:block print:w-40'>
                        {/* Fallback image placeholder or actual photo */}
                        <div className={`w-32 h-40 border-2 ${profile.hrmE_Photo ? 'bg-muted' : 'border-primary'} bg-slate-50 flex items-center justify-center print:border-black`}>

                            {profile.hrmE_Photo ? (
                                <img
                                    src={profile.hrmE_Photo}
                                    alt="Employee Photo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-gray-500">No Photo</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className='mt-16 text-right print:mt-24'>
                    <div className='inline-block text-center mr-8'>
                        <div className='border-t border-black w-48 mb-2 mx-auto'></div>
                        <p className='text-sm font-semibold'>Signature of Nodal Officer</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function DetailRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <tr className='border-b border-t border-gray-100 last:border-0 print:border-gray-200'>
            <td className='py-2 font-bold text-gray-600 w-1/3 print:text-black print:w-40'>{label}</td>
            <td className='py-2 font-bold text-gray-500 w-4 px-2 print:text-black'>:</td>
            <td className={`py-2 font-bold px-8 text-gray-900 print:text-black ${className}`}>
                {value || 'N/A'}
            </td>
        </tr>
    );
}
