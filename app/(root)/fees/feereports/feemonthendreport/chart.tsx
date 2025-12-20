'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type Props = {
    cash: number;
    bank: number;
    online: number;
    rtgs: number;
    card: number;
    ecs: number;
    cashRefund: number;
    bankRefund: number;
    defaulters: number;
};

export function FeeMonthEndChart({ cash, bank, online, rtgs, card, ecs, cashRefund, bankRefund, defaulters }: Props) {
    const data = [
        { name: 'Cash', Count: cash },
        { name: 'Bank', Count: bank },
        { name: 'Online', Count: online },
        { name: 'RTGS', Count: rtgs },
        { name: 'Card', Count: card },
        { name: 'ECS', Count: ecs },
        { name: 'CashRefund', Count: cashRefund },
        { name: 'BankRefund', Count: bankRefund },
        { name: 'Defaulters', Count: defaulters }
    ];

    return (
        <div className='mt-6 border p-4'>
            <ResponsiveContainer width='100%' height={300}>
                <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis interval={1} />
                    <Legend />
                    <Bar dataKey='Count' fill='#FFD700' /> {/* gold */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
