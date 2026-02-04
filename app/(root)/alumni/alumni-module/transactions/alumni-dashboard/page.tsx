'use client';

import { useEffect, useState } from 'react';
import {
    getDashboardData,
    getGalleryData,
    getNoticeData,
    viewGalleryItem,
    viewNoticeItem,
    getYearwiseList,
    getClasswiseStudent,
    getBirthdayData
} from '@/server/alumni/alumni-dashboard';
import type {
    IDashboardData,
    IGallery,
    INotice,
    IYearwiseCount,
    IClasswiseStudent,
    IAlumniBirthday
} from '@/types/alumni/alumni-dashboard';
import BirthdayMarquee from './_components/birthday-marquee';
import QuickLinkCards from './_components/quick-link-cards';
import DashboardTabs from './_components/dashboard-tabs';
import CalendarSection from './_components/calendar-section';
import TotalAlumniList from './_components/total-alumni-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Eye, Download, FileText, LayoutDashboard } from 'lucide-react';

export default function AlumniDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<IDashboardData | null>(null);
    const [birthdayData, setBirthdayData] = useState<IAlumniBirthday[]>([]);

    // Modal States
    const [galleryModal, setGalleryModal] = useState<{ open: boolean; items: IGallery[] }>({ open: false, items: [] });
    const [noticeModal, setNoticeModal] = useState<{ open: boolean; items: INotice[] }>({ open: false, items: [] });
    const [yearwiseModal, setYearwiseModal] = useState<{ open: boolean; items: IYearwiseCount[] }>({ open: false, items: [] });
    const [classwiseModal, setClasswiseModal] = useState<{ open: boolean; items: IClasswiseStudent[] }>({ open: false, items: [] });

    // Detailed View States
    const [galleryDetail, setGalleryDetail] = useState<{ open: boolean; data: any[] }>({ open: false, data: [] });
    const [noticeDetail, setNoticeDetail] = useState<{ open: boolean; data: any[] }>({ open: false, data: [] });

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [dashboardRes, birthdayRes] = await Promise.allSettled([
                    getDashboardData(),
                    getBirthdayData()
                ]);

                if (dashboardRes.status === 'fulfilled') {
                    if (dashboardRes.value.success) {
                        setData(dashboardRes.value.data!);
                    } else {
                        toast.error(dashboardRes.value.message || 'Failed to fetch dashboard data');
                    }
                } else {
                    toast.error('Dashboard data fetch failed');
                }

                if (birthdayRes.status === 'fulfilled') {
                    if (birthdayRes.value.success) {
                        setBirthdayData(birthdayRes.value.data || []);
                    } else {
                        console.warn('Birthday fetch error:', birthdayRes.value.message);
                        if (dashboardRes.status === 'fulfilled' && dashboardRes.value.success) {
                            setBirthdayData(dashboardRes.value.data!.alumnibirthday || []);
                        }
                    }
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('An unexpected error occurred while loading dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleGallery = async () => {
        const res = await getGalleryData();
        if (res.success) {
            setGalleryModal({ open: true, items: res.data || [] });
        } else {
            toast.error(res.message);
        }
    };

    const handleNotice = async () => {
        const res = await getNoticeData();
        if (res.success) {
            setNoticeModal({ open: true, items: res.data || [] });
        } else {
            toast.error(res.message);
        }
    };

    const handleViewGallery = async (id: number) => {
        const res = await viewGalleryItem(id);
        if (res.success) {
            setGalleryDetail({ open: true, data: res.data! });
        } else {
            toast.error(res.message);
        }
    };

    const handleViewNotice = async (id: number) => {
        const res = await viewNoticeItem(id);
        if (res.success) {
            setNoticeDetail({ open: true, data: res.data! });
        } else {
            toast.error(res.message);
        }
    };

    const handleViewYearwise = async (id: number) => {
        const res = await getYearwiseList(id);
        if (res.success) {
            setYearwiseModal({ open: true, items: res.data! });
        } else {
            toast.error(res.message);
        }
    };

    const handleViewClasswise = async (yearId: number, classId: number) => {
        const res = await getClasswiseStudent(yearId, classId);
        if (res.success) {
            setClasswiseModal({ open: true, items: res.data! });
        } else {
            toast.error(res.message);
        }
    };

    if (loading) {
        return (
            <div className='container space-y-6 p-6'>
                <Skeleton className='h-12 w-full' />
                <div className='grid grid-cols-4 gap-4'>
                    <Skeleton className='h-32' />
                    <Skeleton className='h-32' />
                    <Skeleton className='h-32' />
                    <Skeleton className='h-32' />
                </div>
                <div className='grid grid-cols-3 gap-4'>
                    <Skeleton className='col-span-2 h-96' />
                    <Skeleton className='h-96' />
                </div>
            </div>
        );
    }

    const isAdmin = data?.rolename !== 'Alumni';

    return (
        <div className='container min-h-screen space-y-8 bg-background p-6'>
            {/* Header Section */}
            <div className='flex items-center justify-between border-b pb-4'>
                <div className='flex items-center space-x-3'>
                    <div className='rounded-xl bg-primary/10 p-2'>
                        <LayoutDashboard className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                        <h1 className='text-3xl font-bold tracking-tight'>Alumni Dashboard</h1>
                        <p className='text-sm text-muted-foreground'>Welcome back to your alumni portal</p>
                    </div>
                </div>
            </div>

            {/* Birthday Marquee */}
            <BirthdayMarquee birthdays={data?.birthdaylist || []} />

            {/* Quick Links */}
            <QuickLinkCards
                onProfile={() => router.push('/alumni/alumni-module/transactions/alumni-details')}
                onDonation={() => router.push('/alumni/alumni-module/transactions/alumni-donation')}
                onBirthday={() => router.push('/alumni/alumni-module/transactions/alumni-birthday')}
                onGallery={handleGallery}
                onNotice={handleNotice}
                onEvents={() => { }} // This will open the event calendar scroll
                onFriendRequest={() => router.push('/alumni/alumni-module/transactions/alumni-friend-request-accept')}
                totalCount={data?.friendrequestlist?.length}
                donationAmount={data?.totaldonation?.[0]?.ALDON_Amount}
            />

            {/* Main Content Areas */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                {/* Reports & Lists Tabs */}
                <div className='lg:col-span-2'>
                    <DashboardTabs
                        batchData={data?.batch || []}
                        birthdayData={birthdayData.length > 0 ? birthdayData : (data?.alumnibirthday || [])}
                        onViewYearwise={handleViewYearwise}
                        showAdminDetails={isAdmin}
                    />
                </div>

                {/* Event Calendar */}
                <div className='lg:col-span-1'>
                    <CalendarSection events={data?.calenderlist || []} />
                </div>
            </div>

            {/* Total Alumni List (Always at bottom for visibility) */}
            {isAdmin && data?.alumnilist && (
                <TotalAlumniList
                    alumni={data.alumnilist}
                    totalCount={data.alumnilist.length}
                />
            )}

            {/* --- MODALS --- */}

            {/* Gallery Modal */}
            <Dialog open={galleryModal.open} onOpenChange={(v) => setGalleryModal({ ...galleryModal, open: v })}>
                <DialogContent className='max-w-4xl'>
                    <DialogHeader>
                        <DialogTitle>Alumni Gallery</DialogTitle>
                    </DialogHeader>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
                        {galleryModal.items.map((item) => (
                            <Card key={item.algA_Id} className='cursor-pointer hover:bg-muted' onClick={() => handleViewGallery(item.algA_Id)}>
                                <CardContent className='p-4'>
                                    <h4 className='font-bold'>{item.algA_GalleryName}</h4>
                                    <p className='text-xs text-muted-foreground'>{format(new Date(item.algA_Date), 'dd MMM yyyy')}</p>
                                    <div className='mt-2 flex items-center text-primary text-xs'>
                                        <Eye className='mr-1 h-3 w-3' /> View Media
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notice Modal */}
            <Dialog open={noticeModal.open} onOpenChange={(v) => setNoticeModal({ ...noticeModal, open: v })}>
                <DialogContent className='max-w-5xl'>
                    <DialogHeader>
                        <DialogTitle>Notice Board</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className='h-[60vh]'>
                        <table className='w-full border-collapse text-sm'>
                            <thead>
                                <tr className='border-b bg-muted/50'>
                                    <th className='p-3 text-left'>Title</th>
                                    <th className='p-3 text-left'>Description</th>
                                    <th className='p-3 text-center'>Start Date</th>
                                    <th className='p-3 text-center'>End Date</th>
                                    <th className='p-3 text-center'>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {noticeModal.items.map((item) => (
                                    <tr key={item.ALNTB_Id} className='border-b'>
                                        <td className='p-3 font-medium'>{item.ALNTB_Title}</td>
                                        <td className='p-3 max-w-xs truncate'>{item.ALNTB_Description}</td>
                                        <td className='p-3 text-center'>{item.ALNTB_StartDate ? format(new Date(item.ALNTB_StartDate), 'dd-MM-yyyy') : '-'}</td>
                                        <td className='p-3 text-center'>{item.ALNTB_EndDate ? format(new Date(item.ALNTB_EndDate), 'dd-MM-yyyy') : '-'}</td>
                                        <td className='p-3 text-center'>
                                            {item.FileCount > 0 && (
                                                <button onClick={() => handleViewNotice(item.ALNTB_Id)} className='text-primary'>
                                                    <Eye className='h-4 w-4' />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Yearwise Modal */}
            <Dialog open={yearwiseModal.open} onOpenChange={(v) => setYearwiseModal({ ...yearwiseModal, open: v })}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Yearwise Alumni Count</DialogTitle>
                    </DialogHeader>
                    <table className='w-full border-collapse text-sm'>
                        <thead>
                            <tr className='border-b bg-muted/50'>
                                <th className='p-3 text-left'>Batch</th>
                                <th className='p-3 text-left'>Class</th>
                                <th className='p-3 text-center'>Total</th>
                                <th className='p-3 text-center'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yearwiseModal.items.map((item, idx) => (
                                <tr key={idx} className='border-b'>
                                    <td className='p-3'>{item.BATCHES}</td>
                                    <td className='p-3'>{item.classname}</td>
                                    <td className='p-3 text-center'>{item.NOofstudents}</td>
                                    <td className='p-3 text-center'>
                                        <button
                                            onClick={() => handleViewClasswise(item.ASMAY_Id, item.ASMCL_Id)}
                                            className='text-primary hover:underline font-medium'
                                        >
                                            View Students
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DialogContent>
            </Dialog>

            {/* Classwise Modal */}
            <Dialog open={classwiseModal.open} onOpenChange={(v) => setClasswiseModal({ ...classwiseModal, open: v })}>
                <DialogContent className='max-w-5xl'>
                    <DialogHeader>
                        <DialogTitle>Student List</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className='h-[70vh]'>
                        <table className='w-full border-collapse text-sm'>
                            <thead>
                                <tr className='border-b bg-muted/50 font-bold'>
                                    <th className='p-3 text-left'>Name</th>
                                    <th className='p-3 text-left'>Year</th>
                                    <th className='p-3 text-left'>Adm No</th>
                                    <th className='p-3 text-left'>Class</th>
                                    <th className='p-3 text-left'>Mobile</th>
                                    <th className='p-3 text-left'>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classwiseModal.items.map((item, idx) => (
                                    <tr key={idx} className='border-b'>
                                        <td className='p-3'>{item.studentname}</td>
                                        <td className='p-3 text-center'>{item.ASMAY_Year}</td>
                                        <td className='p-3'>{item.ALMST_AdmNo}</td>
                                        <td className='p-3'>{item.classname}</td>
                                        <td className='p-3'>{item.ALMST_MobileNo}</td>
                                        <td className='p-3'>{item.ALMST_emailId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Notice Detail Modal (Attachments) */}
            <Dialog open={noticeDetail.open} onOpenChange={(v) => setNoticeDetail({ ...noticeDetail, open: v })}>
                <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>Notice Attachments</DialogTitle>
                    </DialogHeader>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {noticeDetail.data.map((file, idx) => (
                            <Card key={idx} className='flex items-center space-x-4 p-4'>
                                <FileText className='h-8 w-8 text-primary' />
                                <div className='flex-1 overflow-hidden'>
                                    <p className='truncate text-sm font-medium'>{file.alntbfL_FileName}</p>
                                    <a
                                        href={file.alntbfL_FilePath}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='flex items-center text-xs text-primary hover:underline'
                                    >
                                        <Download className='mr-1 h-3 w-3' /> Download
                                    </a>
                                </div>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
