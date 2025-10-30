interface TransactionLayoutProps {
    children: React.ReactNode;
}

export default function TransactionLayout({ children }: TransactionLayoutProps) {
    return <div className='container py-6'>{children}</div>;
}

