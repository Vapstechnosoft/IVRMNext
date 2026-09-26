'use client';
import { Award, TrendingDown, TrendingUp, Trophy, UserCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    assessmentTrends,
    gradeDistributions,
    schoolInfo,
    scoreRangeDistributions,
    summaryMetrics,
    topPerformersGroupA,
    topPerformersGroupB
} from './mockData';
import type { IFilterParams } from './types';

interface SectionComparisonReportProps {
    filterParams: IFilterParams;
}

export default function SectionComparisonReport({ filterParams }: SectionComparisonReportProps) {
    const groupAName = filterParams.sectionA || 'VIII-A (Teacher A)';
    const groupBName = filterParams.sectionB || 'VIII-B (Teacher B)';

    return (
        <div id='printable-comparison-report' className='mx-auto max-w-6xl space-y-6 bg-background p-2 sm:p-4'>
            {/* High-Fidelity Printable Document Container */}
            <div className='rounded-xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100'>
                {/* 1. Header Banner */}
                <div className='border-slate-300 border-b p-4 sm:p-6 dark:border-slate-800'>
                    <div className='flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md'>
                                <Award className='h-8 w-8' />
                            </div>
                            <div>
                                <h1 className='font-black text-slate-900 text-xl uppercase tracking-wide sm:text-2xl dark:text-white'>
                                    {schoolInfo.name}
                                </h1>
                                <p className='font-medium text-slate-600 text-xs dark:text-slate-400'>{schoolInfo.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Report Title Banner */}
                    <div className='mt-4 rounded-lg bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-4 py-2.5 text-center text-white shadow-md'>
                        <h2 className='font-black text-base uppercase tracking-wider sm:text-lg'>ACADEMIC PERFORMANCE COMPARISON REPORT</h2>
                    </div>

                    {/* Report Metadata Sub-bar */}
                    <div className='mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                        <div>
                            <span className='text-slate-500'>Academic Year: </span>
                            <span className='text-blue-900 dark:text-blue-400'>{filterParams.academicYear}</span>
                        </div>
                        <div>
                            <span className='text-slate-500'>Exam / Examination: </span>
                            <span className='text-blue-900 dark:text-blue-400'>{filterParams.exam}</span>
                        </div>
                        <div>
                            <span className='text-slate-500'>Subject: </span>
                            <span className='text-blue-900 dark:text-blue-400'>{filterParams.subject}</span>
                        </div>
                        <div>
                            <span className='text-slate-500'>Generated On: </span>
                            <span>{schoolInfo.generatedOn}</span>
                        </div>
                    </div>
                </div>

                <div className='space-y-6 p-4 sm:p-6'>
                    {/* 2. Comparison Criteria & Key Highlights Grid */}
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
                        {/* Comparison Criteria */}
                        <div className='rounded-lg border border-slate-300 bg-slate-50/70 p-4 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900/60'>
                            <div className='mb-3 border-slate-200 border-b pb-1.5 dark:border-slate-800'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    COMPARISON CRITERIA
                                </h3>
                            </div>
                            <div className='space-y-2 text-xs'>
                                <div className='flex justify-between border-slate-200 border-b border-dashed pb-1 dark:border-slate-800'>
                                    <span className='font-semibold text-slate-600 dark:text-slate-400'>Comparison Type:</span>
                                    <span className='font-bold text-slate-900 capitalize dark:text-slate-100'>
                                        {filterParams.comparisonType.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className='flex justify-between border-slate-200 border-b border-dashed pb-1 dark:border-slate-800'>
                                    <span className='font-semibold text-slate-600 dark:text-slate-400'>Class:</span>
                                    <span className='font-bold text-slate-900 dark:text-slate-100'>{filterParams.selectedClass}</span>
                                </div>
                                <div className='flex justify-between border-slate-200 border-b border-dashed pb-1 dark:border-slate-800'>
                                    <span className='font-semibold text-slate-600 dark:text-slate-400'>Sections Selected:</span>
                                    <span className='font-bold text-blue-800 dark:text-blue-400'>
                                        {groupAName} vs {groupBName}
                                    </span>
                                </div>
                                <div className='flex justify-between border-slate-200 border-b border-dashed pb-1 dark:border-slate-800'>
                                    <span className='font-semibold text-slate-600 dark:text-slate-400'>Teachers:</span>
                                    <span className='font-bold text-slate-900 dark:text-slate-100'>
                                        {filterParams.teacherA} vs {filterParams.teacherB}
                                    </span>
                                </div>
                                <div className='flex justify-between pt-0.5'>
                                    <span className='font-semibold text-slate-600 dark:text-slate-400'>Total Students (A / B):</span>
                                    <span className='font-bold text-slate-900 dark:text-slate-100'>38 / 36</span>
                                </div>
                            </div>
                        </div>

                        {/* Key Highlights Cards */}
                        <div className='rounded-lg border border-slate-300 bg-slate-50/70 p-4 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900/60'>
                            <div className='mb-3 border-slate-200 border-b pb-1.5 dark:border-slate-800'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    KEY HIGHLIGHTS
                                </h3>
                            </div>
                            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                                {/* Highlight 1 */}
                                <div className='flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/80 p-2.5 text-center dark:border-emerald-900/50 dark:bg-emerald-950/40'>
                                    <div className='mb-1 rounded-full bg-emerald-500/20 p-1 text-emerald-700 dark:text-emerald-400'>
                                        <TrendingUp className='h-4 w-4' />
                                    </div>
                                    <span className='font-medium text-[10px] text-emerald-800 uppercase dark:text-emerald-300'>
                                        Higher Average
                                    </span>
                                    <span className='font-extrabold text-emerald-900 text-xs dark:text-emerald-200'>VIII - A</span>
                                    <span className='font-black text-emerald-700 text-sm dark:text-emerald-400'>72.45</span>
                                </div>

                                {/* Highlight 2 */}
                                <div className='flex flex-col items-center justify-center rounded-lg border border-blue-200 bg-blue-50/80 p-2.5 text-center dark:border-blue-900/50 dark:bg-blue-950/40'>
                                    <div className='mb-1 rounded-full bg-blue-500/20 p-1 text-blue-700 dark:text-blue-400'>
                                        <UserCheck className='h-4 w-4' />
                                    </div>
                                    <span className='font-medium text-[10px] text-blue-800 uppercase dark:text-blue-300'>
                                        Higher Pass %
                                    </span>
                                    <span className='font-extrabold text-blue-900 text-xs dark:text-blue-200'>VIII - A</span>
                                    <span className='font-black text-blue-700 text-sm dark:text-blue-400'>92%</span>
                                </div>

                                {/* Highlight 3 */}
                                <div className='flex flex-col items-center justify-center rounded-lg border border-purple-200 bg-purple-50/80 p-2.5 text-center dark:border-purple-900/50 dark:bg-purple-950/40'>
                                    <div className='mb-1 rounded-full bg-purple-500/20 p-1 text-purple-700 dark:text-purple-400'>
                                        <Trophy className='h-4 w-4' />
                                    </div>
                                    <span className='font-medium text-[10px] text-purple-800 uppercase dark:text-purple-300'>
                                        Highest Marks
                                    </span>
                                    <span className='font-extrabold text-purple-900 text-xs dark:text-purple-200'>VIII - A</span>
                                    <span className='font-black text-purple-700 text-sm dark:text-purple-400'>98</span>
                                </div>

                                {/* Highlight 4 */}
                                <div className='flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 text-center dark:border-amber-900/50 dark:bg-amber-950/40'>
                                    <div className='mb-1 rounded-full bg-amber-500/20 p-1 text-amber-700 dark:text-amber-400'>
                                        <TrendingDown className='h-4 w-4' />
                                    </div>
                                    <span className='font-medium text-[10px] text-amber-800 uppercase dark:text-amber-300'>
                                        Lowest Marks
                                    </span>
                                    <span className='font-extrabold text-amber-900 text-xs dark:text-amber-200'>VIII - B</span>
                                    <span className='font-black text-amber-700 text-sm dark:text-amber-400'>22</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Summary Comparison Table */}
                    <div className='overflow-hidden rounded-lg border border-slate-300 dark:border-slate-800'>
                        <div className='bg-slate-100 px-4 py-2 dark:bg-slate-900'>
                            <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                SUMMARY COMPARISON
                            </h3>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left text-xs'>
                                <thead>
                                    <tr className='border-slate-300 border-b bg-blue-900 text-white dark:border-slate-800'>
                                        <th className='px-3 py-2 font-bold uppercase'>Metric</th>
                                        <th className='px-3 py-2 text-center font-bold uppercase'>{groupAName}</th>
                                        <th className='px-3 py-2 text-center font-bold uppercase'>{groupBName}</th>
                                        <th className='px-3 py-2 text-center font-bold uppercase'>Difference (A - B)</th>
                                        <th className='px-3 py-2 font-bold uppercase'>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                                    {summaryMetrics.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className={
                                                idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/60 dark:bg-slate-900/40'
                                            }>
                                            <td className='px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200'>{item.metric}</td>
                                            <td className='bg-emerald-50/40 px-3 py-2.5 text-center font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'>
                                                {item.groupAVal}
                                            </td>
                                            <td className='px-3 py-2.5 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                {item.groupBVal}
                                            </td>
                                            <td className='px-3 py-2.5 text-center font-bold text-blue-900 dark:text-blue-400'>
                                                {item.difference}
                                            </td>
                                            <td className='px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300'>
                                                <span className='inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-semibold text-[11px] text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'>
                                                    {item.remarks}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. Grade Distribution & Average Marks Line Charts Row */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Grade Distribution Bar Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
                            <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                GRADE DISTRIBUTION (%)
                            </h3>
                            <div className='h-64 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart data={gradeDistributions} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis dataKey='gradeLabel' tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor='end' />
                                        <YAxis tick={{ fontSize: 10 }} unit='%' />
                                        <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Bar dataKey='groupAPercent' name='VIII-A (Teacher A)' fill='#10b981' radius={[4, 4, 0, 0]} />
                                        <Bar dataKey='groupBPercent' name='VIII-B (Teacher B)' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Average Marks Line Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
                            <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                AVERAGE MARKS COMPARISON (By Assessment)
                            </h3>
                            <div className='h-64 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart data={assessmentTrends} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis dataKey='assessment' tick={{ fontSize: 10 }} />
                                        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Line
                                            type='monotone'
                                            dataKey='groupAScore'
                                            name='VIII-A (Teacher A)'
                                            stroke='#10b981'
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                        <Line
                                            type='monotone'
                                            dataKey='groupBScore'
                                            name='VIII-B (Teacher B)'
                                            stroke='#3b82f6'
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 5. Score Range Distribution & Top Performers Grid */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* Score Range Distribution Table */}
                        <div className='overflow-hidden rounded-lg border border-slate-300 lg:col-span-6 dark:border-slate-800'>
                            <div className='bg-slate-100 px-3 py-2 dark:bg-slate-900'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    STUDENT SCORE RANGE DISTRIBUTION
                                </h3>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-xs'>
                                    <thead>
                                        <tr className='border-slate-300 border-b bg-slate-800 text-white dark:border-slate-800'>
                                            <th className='px-2.5 py-2 font-bold uppercase'>Score Range (%)</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>VIII-A (Teacher A)</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>VIII-B (Teacher B)</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                                        {scoreRangeDistributions.map((row, i) => (
                                            <tr key={i} className='bg-white dark:bg-slate-950'>
                                                <td className='px-2.5 py-2 font-bold text-slate-800 dark:text-slate-200'>{row.range}</td>
                                                <td className='px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100'>
                                                    {row.groupACount} ({row.groupAPercent}%)
                                                </td>
                                                <td className='px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                    {row.groupBCount} ({row.groupBPercent}%)
                                                </td>
                                                <td
                                                    className={`px-2 py-2 text-center font-bold ${row.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {row.difference > 0 ? `+${row.difference}` : row.difference}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Performers Side-by-Side Tables */}
                        <div className='overflow-hidden rounded-lg border border-slate-300 lg:col-span-6 dark:border-slate-800'>
                            <div className='bg-slate-100 px-3 py-2 dark:bg-slate-900'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    TOP PERFORMERS (Subject Wise)
                                </h3>
                            </div>
                            <div className='grid grid-cols-1 divide-y border-slate-200 border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800'>
                                {/* Group A Top Performers */}
                                <div className='p-2'>
                                    <div className='mb-1.5 rounded bg-emerald-100 px-2 py-1 text-center font-bold text-[11px] text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'>
                                        VIII-A (Teacher A)
                                    </div>
                                    <table className='w-full text-xs'>
                                        <thead>
                                            <tr className='border-b font-bold text-slate-600 dark:text-slate-400'>
                                                <th className='py-1 text-center'>Rank</th>
                                                <th className='py-1 text-left'>Student Name</th>
                                                <th className='py-1 text-right'>Marks (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topPerformersGroupA.map((st, i) => (
                                                <tr key={i} className='border-slate-100 border-b dark:border-slate-900'>
                                                    <td className='py-1 text-center font-bold text-amber-600'>{st.rank}</td>
                                                    <td className='py-1 font-medium text-slate-800 dark:text-slate-200'>
                                                        {st.studentName}
                                                    </td>
                                                    <td className='py-1 text-right font-extrabold text-emerald-700 dark:text-emerald-400'>
                                                        {st.marksPercent}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Group B Top Performers */}
                                <div className='p-2'>
                                    <div className='mb-1.5 rounded bg-blue-100 px-2 py-1 text-center font-bold text-[11px] text-blue-900 dark:bg-blue-950 dark:text-blue-300'>
                                        VIII-B (Teacher B)
                                    </div>
                                    <table className='w-full text-xs'>
                                        <thead>
                                            <tr className='border-b font-bold text-slate-600 dark:text-slate-400'>
                                                <th className='py-1 text-center'>Rank</th>
                                                <th className='py-1 text-left'>Student Name</th>
                                                <th className='py-1 text-right'>Marks (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topPerformersGroupB.map((st, i) => (
                                                <tr key={i} className='border-slate-100 border-b dark:border-slate-900'>
                                                    <td className='py-1 text-center font-bold text-amber-600'>{st.rank}</td>
                                                    <td className='py-1 font-medium text-slate-800 dark:text-slate-200'>
                                                        {st.studentName}
                                                    </td>
                                                    <td className='py-1 text-right font-extrabold text-blue-700 dark:text-blue-400'>
                                                        {st.marksPercent}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. Improvement Trend & Observations */}
                    <div className='rounded-lg border border-slate-300 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40'>
                        <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                            IMPROVEMENT TREND & OBSERVATIONS (Compared to Previous Term)
                        </h3>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
                                <span className='font-bold text-[11px] text-slate-600 uppercase dark:text-slate-400'>
                                    Average Marks Improvement
                                </span>
                                <div className='mt-2 space-y-1 text-xs'>
                                    <div className='flex justify-between font-bold text-emerald-700 dark:text-emerald-400'>
                                        <span>VIII-A :</span>
                                        <span>+5.82</span>
                                    </div>
                                    <div className='flex justify-between font-semibold text-blue-700 dark:text-blue-400'>
                                        <span>VIII-B :</span>
                                        <span>+3.10</span>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
                                <span className='font-bold text-[11px] text-slate-600 uppercase dark:text-slate-400'>
                                    Pass % Improvement
                                </span>
                                <div className='mt-2 space-y-1 text-xs'>
                                    <div className='flex justify-between font-bold text-emerald-700 dark:text-emerald-400'>
                                        <span>VIII-A :</span>
                                        <span>+6%</span>
                                    </div>
                                    <div className='flex justify-between font-semibold text-blue-700 dark:text-blue-400'>
                                        <span>VIII-B :</span>
                                        <span>+4%</span>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
                                <span className='font-bold text-[11px] text-slate-600 uppercase dark:text-slate-400'>
                                    Low Performers Reduction (&lt;40%)
                                </span>
                                <div className='mt-2 space-y-1 text-xs'>
                                    <div className='flex justify-between font-bold text-emerald-700 dark:text-emerald-400'>
                                        <span>VIII-A :</span>
                                        <span>-2%</span>
                                    </div>
                                    <div className='flex justify-between font-semibold text-blue-700 dark:text-blue-400'>
                                        <span>VIII-B :</span>
                                        <span>-1%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Observations / Remarks */}
                        <div className='mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs dark:border-blue-900/50 dark:bg-blue-950/30'>
                            <h4 className='font-bold text-blue-900 uppercase dark:text-blue-300'>OBSERVATIONS / REMARKS:</h4>
                            <ul className='mt-1.5 list-disc space-y-1 pl-4 text-slate-700 dark:text-slate-300'>
                                <li>
                                    <strong>VIII-A (Teacher A)</strong> has performed better in average marks, pass percentage, and
                                    consistency.
                                </li>
                                <li>
                                    More number of students in VIII-A are in <strong>A and B grade categories</strong>.
                                </li>
                                <li>
                                    <strong>VIII-B</strong> has a higher number of low-performing students, which needs attention.
                                </li>
                                <li>Teachers are advised to review performance gaps and take remedial actions.</li>
                            </ul>
                        </div>
                    </div>

                    {/* 7. Signature Blocks */}
                    <div className='mt-8 border-slate-300 border-t pt-6 dark:border-slate-800'>
                        <div className='grid grid-cols-3 gap-4 text-center font-semibold text-slate-700 text-xs dark:text-slate-300'>
                            <div>
                                <div className='mx-auto mb-2 h-10 w-36 border-slate-400 border-b border-dashed' />
                                <span>Prepared By</span>
                                <p className='text-[10px] text-slate-500'>Exam Incharge</p>
                            </div>
                            <div>
                                <div className='mx-auto mb-2 h-10 w-36 border-slate-400 border-b border-dashed' />
                                <span>Verified By</span>
                                <p className='text-[10px] text-slate-500'>Academic Head / HOD</p>
                            </div>
                            <div>
                                <div className='mx-auto mb-2 h-10 w-36 border-slate-400 border-b border-dashed' />
                                <span>Approved By</span>
                                <p className='text-[10px] text-slate-500'>Principal / Management</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
