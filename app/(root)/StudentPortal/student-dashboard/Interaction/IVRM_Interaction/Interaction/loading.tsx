import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className='container mx-auto max-w-6xl p-4'>
            <div className='w-full rounded-lg border border-t-4 border-t-primary bg-card text-card-foreground shadow-lg'>
                <div className='flex flex-row items-center justify-between border-b p-6 pb-2'>
                    <Skeleton className='h-8 w-[200px]' />
                </div>
                <div className='p-6'>
                    <div className='mx-auto mb-8 grid w-[400px] grid-cols-2 gap-2 md:mx-0'>
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                    </div>
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <Skeleton className='h-6 w-[100px]' />
                            <Skeleton className='h-9 w-[80px]' />
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className='flex items-center space-x-4 rounded border p-4'>
                                <Skeleton className='h-12 w-12 rounded-full' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-4 w-[250px]' />
                                    <Skeleton className='h-4 w-[200px]' />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
