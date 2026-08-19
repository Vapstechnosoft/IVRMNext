'use client';

import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import { IMonthEndReportData } from '@/types/sports/reports/month-end-report';

interface MonthEndReportChartProps {
    data: IMonthEndReportData;
}

export default function MonthEndReportChart({ data }: MonthEndReportChartProps) {
    const chartData = [
        {
            name: 'Total',
            Count: data?.total_count_student ?? 0,
            color: '#2b90a6' // Teal cyan as in screenshot
        },
        {
            name: 'Not participated',
            Count: data?.not_patr_std ?? 0,
            color: '#c54b4b' // Red as in screenshot
        },
        {
            name: 'Participated student',
            Count: data?.total_partic_student ?? 0,
            color: '#2b90a6'
        },
        {
            name: 'Winners',
            Count: data?.total_winner_student ?? 0,
            color: '#2b90a6'
        }
    ];

    // Compute Y-Axis upper limit
    const maxVal = Math.max(
        data?.total_count_student || 0,
        data?.not_patr_std || 0,
        data?.total_partic_student || 0,
        data?.total_winner_student || 0,
        6
    );

    return (
        <div className="mt-8 border border-slate-300 rounded-md overflow-hidden bg-white shadow-sm">
            {/* Box Header matching legacy UI style */}
            <div className="border-t-2 border-t-blue-600 border-b border-b-orange-400 bg-slate-50 px-4 py-2 flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 tracking-wider uppercase">
                    SPORTS MONTH END REPORT
                </h4>
                <span className="text-slate-500 font-bold text-sm select-none cursor-pointer">—</span>
            </div>

            {/* Chart Area */}
            <div className="p-4 sm:p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#cbd5e1" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#475569', fontSize: 11 }}
                                axisLine={{ stroke: '#94a3b8' }}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, Math.max(6, Math.ceil(maxVal * 1.2))]}
                                tick={{ fill: '#475569', fontSize: 11 }}
                                axisLine={{ stroke: '#94a3b8' }}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                iconType="square"
                                iconSize={12}
                                wrapperStyle={{ paddingTop: '15px', fontSize: '11px', color: '#475569' }}
                            />
                            <Bar dataKey="Count" name="Count" maxBarSize={110}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
