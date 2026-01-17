'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import type { IAlumniProfile } from '@/types/alumni/alumni-friend-request';
import { Briefcase, Calendar, GraduationCap, Loader2, Mail, MapPin, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewProfileModalProps {
    alumniId: number;
    alumniName: string;
    onClose: () => void;
}

// Static alumni profiles
const staticAlumniProfiles: Record<number, IAlumniProfile> = {
    101: {
        ALMST_Id: 101,
        alumniname: 'John Smith',
        ASMAY_Year: '2015',
        ALMST_MobileNo: '+91 9876543210',
        ALMST_emailId: 'john.smith@example.com',
        ALMST_StudentPhoto: '/images/alumni/john-smith.jpg'
    },
    102: {
        ALMST_Id: 102,
        alumniname: 'Sarah Johnson',
        ASMAY_Year: '2016',
        ALMST_MobileNo: '+91 8765432109',
        ALMST_emailId: 'sarah.j@example.com',
        ALMST_StudentPhoto: '/images/alumni/sarah-johnson.jpg'
    },
    103: {
        ALMST_Id: 103,
        alumniname: 'Michael Chen',
        ASMAY_Year: '2014',
        ALMST_MobileNo: '+91 7654321098',
        ALMST_emailId: 'michael.chen@example.com',
        ALMST_StudentPhoto: '/images/alumni/michael-chen.jpg'
    },
    104: {
        ALMST_Id: 104,
        alumniname: 'Priya Sharma',
        ASMAY_Year: '2017',
        ALMST_MobileNo: '+91 6543210987',
        ALMST_emailId: 'priya.sharma@example.com',
        ALMST_StudentPhoto: '/images/alumni/priya-sharma.jpg'
    },
    105: {
        ALMST_Id: 105,
        alumniname: 'David Wilson',
        ASMAY_Year: '2013',
        ALMST_MobileNo: '+91 5432109876',
        ALMST_emailId: 'david.wilson@example.com',
        ALMST_StudentPhoto: '/images/alumni/david-wilson.jpg'
    }
};

// Mock API function
const mockViewAlumniProfile = async ({ almsT_Id, mI_Id }: { almsT_Id: number; mI_Id: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const profile = staticAlumniProfiles[almsT_Id];

    if (profile) {
        return {
            success: true,
            data: {
                almst_profile: [profile]
            }
        };
    } else {
        return {
            success: false,
            message: 'Profile not found'
        };
    }
};

export default function ViewProfileModal({ alumniId, alumniName, onClose }: ViewProfileModalProps) {
    const [profile, setProfile] = useState<IAlumniProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const res = await mockViewAlumniProfile({ almsT_Id: alumniId, mI_Id: 0 });
                if (res.success && res.data?.almst_profile?.length) {
                    setProfile(res.data.almst_profile[0]);
                } else {
                    toast.error('Profile data not found');
                }
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [alumniId]);

    // Additional profile details for demo
    const getAdditionalDetails = (id: number) => {
        const details: Record<number, { company: string; position: string; location: string }> = {
            101: { company: 'TechCorp Inc.', position: 'Senior Software Engineer', location: 'Bangalore, India' },
            102: { company: 'Global Finance Group', position: 'Financial Analyst', location: 'Mumbai, India' },
            103: { company: 'StartUp Ventures', position: 'Founder & CEO', location: 'Silicon Valley, USA' },
            104: { company: 'Healthcare Solutions', position: 'Product Manager', location: 'Delhi, India' },
            105: { company: 'Education First', position: 'Head of Technology', location: 'Hyderabad, India' }
        };
        return details[id] || { company: 'Not specified', position: 'Not specified', location: 'Not specified' };
    };

    const additionalDetails = profile ? getAdditionalDetails(profile.ALMST_Id) : null;

    return (
        <AdaptiveDialog isOpen={true} onClose={onClose} title={`Alumni Profile: ${alumniName}`} size='lg'>
            <AdaptiveBody>
                {isLoading ? (
                    <div className='flex h-64 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    </div>
                ) : profile ? (
                    <div className='flex flex-col gap-8 p-2'>
                        {/* Profile Header */}
                        <div className='flex flex-col items-start gap-6 md:flex-row'>
                            <div className='flex w-full flex-col items-center gap-4 md:w-1/3'>
                                <div className='group relative h-48 w-48 overflow-hidden rounded-2xl border-4 border-primary/10 shadow-xl'>
                                    <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'>
                                        <User className='h-20 w-20 text-primary/30' />
                                    </div>
                                </div>
                                <div className='text-center'>
                                    <h3 className='font-bold text-primary text-xl'>{profile.alumniname}</h3>
                                    <div className='mt-1 flex items-center justify-center gap-2'>
                                        <GraduationCap className='h-4 w-4 text-muted-foreground' />
                                        <p className='font-medium text-muted-foreground text-sm'>Class of {profile.ASMAY_Year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info Cards */}
                            <div className='grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
                                <Card className='border-none bg-gradient-to-br from-blue-50 to-white shadow-sm'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='rounded-lg bg-white p-2 shadow-sm'>
                                                <Briefcase className='h-5 w-5 text-blue-600' />
                                            </div>
                                            <div>
                                                <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                    Current Position
                                                </p>
                                                <p className='font-semibold'>{additionalDetails?.position}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className='border-none bg-gradient-to-br from-green-50 to-white shadow-sm'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='rounded-lg bg-white p-2 shadow-sm'>
                                                <MapPin className='h-5 w-5 text-green-600' />
                                            </div>
                                            <div>
                                                <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                    Location
                                                </p>
                                                <p className='font-semibold'>{additionalDetails?.location}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Card className='border-none shadow-sm'>
                                <CardContent className='space-y-4 p-4'>
                                    <div className='group flex items-center gap-4'>
                                        <div className='rounded-xl bg-blue-50 p-3'>
                                            <Phone className='h-5 w-5 text-blue-600' />
                                        </div>
                                        <div>
                                            <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                Mobile Number
                                            </p>
                                            <p className='font-semibold'>{profile.ALMST_MobileNo}</p>
                                        </div>
                                    </div>

                                    <div className='group flex items-center gap-4'>
                                        <div className='rounded-xl bg-purple-50 p-3'>
                                            <Mail className='h-5 w-5 text-purple-600' />
                                        </div>
                                        <div>
                                            <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                Email Address
                                            </p>
                                            <p className='break-all font-semibold'>{profile.ALMST_emailId}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='border-none shadow-sm'>
                                <CardContent className='space-y-4 p-4'>
                                    <div className='group flex items-center gap-4'>
                                        <div className='rounded-xl bg-orange-50 p-3'>
                                            <Calendar className='h-5 w-5 text-orange-600' />
                                        </div>
                                        <div>
                                            <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                                                Passing Year
                                            </p>
                                            <p className='font-semibold'>{profile.ASMAY_Year}</p>
                                        </div>
                                    </div>

                                    <div className='group flex items-center gap-4'>
                                        <div className='rounded-xl bg-green-50 p-3'>
                                            <Briefcase className='h-5 w-5 text-green-600' />
                                        </div>
                                        <div>
                                            <p className='font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>Company</p>
                                            <p className='font-semibold'>{additionalDetails?.company}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700 text-xs italic'>
                            This profile information is shared with friends to facilitate networking and professional connections. You can
                            now connect with {profile.alumniname} directly.
                        </div>
                    </div>
                ) : (
                    <div className='flex h-64 items-center justify-center text-muted-foreground'>Failed to load profile details.</div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter className='border-t p-4'>
                <Button variant='outline' onClick={onClose} className='w-full'>
                    Close Profile
                </Button>
                {profile && <Button className='w-full'>Send Message</Button>}
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
