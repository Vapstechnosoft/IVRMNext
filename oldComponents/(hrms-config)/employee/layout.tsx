interface EmployeeLayoutProps {
    children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
    return <div className='container py-6'>{children}</div>;
}

