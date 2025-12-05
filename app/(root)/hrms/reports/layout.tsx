interface ReportsLayoutProps {
    children: React.ReactNode;
}
export default function ReportsLayout({ children }: ReportsLayoutProps) {
    return <div className='container py-6'>{children}</div>;
}
