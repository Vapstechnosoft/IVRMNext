import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    size?: 'icon' | 'text' | 'full';
    herf?: string | null;
}

export default function Logo({ className = '', herf = '', size = 'text' }: LogoProps) {
    const logoContent = (
        <div className={cn('flex items-center', className)}>
            <Image
                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/52b647fd-940b-48f0-b28c-8547e52a7109.png'
                alt='VAPS Logo'
                width={200}
                height={50}
                className="h-10 w-auto object-contain brightness-110 contrast-110 drop-shadow-sm transition-all duration-300 hover:scale-[1.02]"
                priority
            />
        </div>
    );

    return herf ? <Link href={herf}>{logoContent}</Link> : logoContent;
}
