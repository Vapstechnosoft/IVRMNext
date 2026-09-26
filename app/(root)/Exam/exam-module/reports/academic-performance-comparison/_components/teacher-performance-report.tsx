'use client';

import { Award, BookOpen, CheckCircle2, GraduationCap, TrendingUp, User } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    classSectionPerformances,
    schoolInfo,
    subjectPerformances,
    teacherOverallTopPerformers,
    teacherOverviewStats,
    teacherProfile
} from './mockData';
import type { IFilterParams } from './types';

interface TeacherPerformanceReportProps {
    filterParams: IFilterParams;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const pieGradeData = [
    { name: 'Grade A (80%+)', value: 24.65 },
    { name: 'Grade B (60-79%)', value: 46.48 },
    { name: 'Grade C (40-59%)', value: 19.72 },
    { name: 'Grade D (33-39%)', value: 6.34 },
    { name: 'Grade E (<33%)', value: 2.82 }
];

const trendData = [
    { period: 'Previous Term', teacherAvg: 66.12, benchmark: 61.45 },
    { period: 'Unit Test 1', teacherAvg: 68.34, benchmark: 64.32 },
    { period: 'Term 1 Exam', teacherAvg: 71.85, benchmark: 67.1 }
];

export default function TeacherPerformanceReport({ filterParams }: TeacherPerformanceReportProps) {
    return (
        <div id='printable-teacher-report' className='mx-auto max-w-6xl space-y-6 bg-background p-2 sm:p-4'>
            {/* High-Fidelity Printable Document Container */}
            <div className='rounded-xl border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100'>
                {/* 1. Header Banner */}
                <div className='border-slate-300 border-b p-4 sm:p-6 dark:border-slate-800'>
                    <div className='flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md'>
                                <GraduationCap className='h-8 w-8' />
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
                        <h2 className='font-black text-base uppercase tracking-wider sm:text-lg'>TEACHER WISE PERFORMANCE REPORT</h2>
                        <p className='font-semibold text-[11px] text-blue-200 uppercase tracking-wide'>(Based on Exam Results)</p>
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
                            <span className='text-blue-900 dark:text-blue-400'>{filterParams.subject || 'All Subjects'}</span>
                        </div>
                        <div>
                            <span className='text-slate-500'>Class: </span>
                            <span className='text-blue-900 dark:text-blue-400'>{filterParams.selectedClass || 'All Classes'}</span>
                        </div>
                        <div>
                            <span className='text-slate-500'>Generated On: </span>
                            <span>{schoolInfo.generatedOn}</span>
                        </div>
                    </div>
                </div>

                <div className='space-y-6 p-4 sm:p-6'>
                    {/* 2. Teacher Profile & Performance Overview Card */}
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
                        {/* Teacher Details Card */}
                        <div className='flex flex-col items-center gap-4 rounded-lg border border-slate-300 bg-slate-50/70 p-4 sm:flex-row lg:col-span-5 dark:border-slate-800 dark:bg-slate-900/60'>
                            <div className='flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-slate-200 text-slate-600 shadow-md dark:bg-slate-800 dark:text-slate-300'>
                                <User className='h-10 w-10' />
                            </div>
                            <div className='space-y-1 text-center text-xs sm:text-left'>
                                <span className='font-bold text-[10px] text-blue-800 uppercase dark:text-blue-400'>TEACHER DETAILS</span>
                                <h3 className='font-black text-base text-slate-900 dark:text-slate-100'>{teacherProfile.name}</h3>
                                <div className='grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-600 dark:text-slate-400'>
                                    <div>
                                        <span className='font-medium'>Employee ID:</span>{' '}
                                        <span className='font-bold text-slate-800 dark:text-slate-200'>{teacherProfile.employeeId}</span>
                                    </div>
                                    <div>
                                        <span className='font-medium'>Department:</span>{' '}
                                        <span className='font-bold text-slate-800 dark:text-slate-200'>{teacherProfile.department}</span>
                                    </div>
                                    <div>
                                        <span className='font-medium'>Designation:</span>{' '}
                                        <span className='font-bold text-slate-800 dark:text-slate-200'>{teacherProfile.designation}</span>
                                    </div>
                                    <div>
                                        <span className='font-medium'>Date of Joining:</span>{' '}
                                        <span className='font-bold text-slate-800 dark:text-slate-200'>{teacherProfile.joiningDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Overview Stat Badges */}
                        <div className='rounded-lg border border-slate-300 bg-slate-50/70 p-4 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/60'>
                            <div className='mb-3 border-slate-200 border-b pb-1.5 dark:border-slate-800'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    PERFORMANCE OVERVIEW (All Classes & Sections)
                                </h3>
                            </div>
                            <div className='grid grid-cols-3 gap-2.5 sm:grid-cols-6'>
                                <div className='rounded-lg border border-blue-200 bg-white p-2 text-center dark:border-blue-900 dark:bg-slate-950'>
                                    <BookOpen className='mx-auto mb-0.5 h-4 w-4 text-blue-600' />
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Total Classes</span>
                                    <span className='font-black text-slate-900 text-sm dark:text-white'>
                                        {teacherOverviewStats.totalClasses}
                                    </span>
                                </div>

                                <div className='rounded-lg border border-indigo-200 bg-white p-2 text-center dark:border-indigo-900 dark:bg-slate-950'>
                                    <User className='mx-auto mb-0.5 h-4 w-4 text-indigo-600' />
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Total Students</span>
                                    <span className='font-black text-slate-900 text-sm dark:text-white'>
                                        {teacherOverviewStats.totalStudents}
                                    </span>
                                </div>

                                <div className='rounded-lg border border-emerald-200 bg-white p-2 text-center dark:border-emerald-900 dark:bg-slate-950'>
                                    <TrendingUp className='mx-auto mb-0.5 h-4 w-4 text-emerald-600' />
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Average Marks</span>
                                    <span className='font-black text-emerald-700 text-sm dark:text-emerald-400'>
                                        {teacherOverviewStats.averageMarks}
                                    </span>
                                </div>

                                <div className='rounded-lg border border-teal-200 bg-white p-2 text-center dark:border-teal-900 dark:bg-slate-950'>
                                    <CheckCircle2 className='mx-auto mb-0.5 h-4 w-4 text-teal-600' />
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Pass %</span>
                                    <span className='font-black text-sm text-teal-700 dark:text-teal-400'>
                                        {teacherOverviewStats.passPercentage}%
                                    </span>
                                </div>

                                <div className='rounded-lg border border-purple-200 bg-white p-2 text-center dark:border-purple-900 dark:bg-slate-950'>
                                    <Award className='mx-auto mb-0.5 h-4 w-4 text-purple-600' />
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Highest Marks</span>
                                    <span className='font-black text-purple-700 text-sm dark:text-purple-400'>
                                        {teacherOverviewStats.highestMarks}
                                    </span>
                                </div>

                                <div className='rounded-lg border border-amber-200 bg-white p-2 text-center dark:border-amber-900 dark:bg-slate-950'>
                                    <span className='mx-auto mb-0.5 block font-bold text-amber-600 text-xs'>↓</span>
                                    <span className='block font-medium text-[9px] text-slate-500 uppercase'>Lowest Marks</span>
                                    <span className='font-black text-amber-700 text-sm dark:text-amber-400'>
                                        {teacherOverviewStats.lowestMarks}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Subject-Wise Performance & Average Marks Comparison Grid */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* 1. Subject-Wise Performance Table */}
                        <div className='overflow-hidden rounded-lg border border-slate-300 lg:col-span-7 dark:border-slate-800'>
                            <div className='bg-slate-100 px-3 py-2 dark:bg-slate-900'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    1. SUBJECT-WISE PERFORMANCE (All Classes)
                                </h3>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-xs'>
                                    <thead>
                                        <tr className='border-slate-300 border-b bg-blue-900 text-white dark:border-slate-800'>
                                            <th className='px-3 py-2 font-bold uppercase'>Subject</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Total Students</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Average Marks</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Pass %</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Highest</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Lowest</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Avg Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                                        {subjectPerformances.map((sub, i) => (
                                            <tr
                                                key={i}
                                                className={
                                                    i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/60 dark:bg-slate-900/40'
                                                }>
                                                <td className='px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200'>{sub.subject}</td>
                                                <td className='px-2 py-2.5 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                    {sub.totalStudents}
                                                </td>
                                                <td className='bg-emerald-50/30 px-2 py-2.5 text-center font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'>
                                                    {sub.averageMarks}
                                                </td>
                                                <td className='px-2 py-2.5 text-center font-bold text-blue-700 dark:text-blue-400'>
                                                    {sub.passPercentage}%
                                                </td>
                                                <td className='px-2 py-2.5 text-center font-semibold text-slate-800 dark:text-slate-200'>
                                                    {sub.highestMarks}
                                                </td>
                                                <td className='px-2 py-2.5 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                    {sub.lowestMarks}
                                                </td>
                                                <td className='px-2 py-2.5 text-center font-extrabold text-indigo-700 dark:text-indigo-400'>
                                                    {sub.avgGrade}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 2. Average Marks Comparison Bar Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-950'>
                            <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                2. AVERAGE MARKS COMPARISON (By Subject)
                            </h3>
                            <div className='h-60 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart data={subjectPerformances} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis dataKey='subject' tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor='end' />
                                        <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={(value: number) => [value, 'Average Marks']} />
                                        <Bar dataKey='averageMarks' fill='#3b82f6' radius={[4, 4, 0, 0]}>
                                            {subjectPerformances.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 4. Class/Section Wise Performance & Pass Percentage Chart */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* 3. Class / Section Wise Performance Table */}
                        <div className='overflow-hidden rounded-lg border border-slate-300 lg:col-span-7 dark:border-slate-800'>
                            <div className='bg-slate-100 px-3 py-2 dark:bg-slate-900'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    3. CLASS / SECTION WISE PERFORMANCE
                                </h3>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-xs'>
                                    <thead>
                                        <tr className='border-slate-300 border-b bg-slate-800 text-white dark:border-slate-800'>
                                            <th className='px-2.5 py-2 font-bold uppercase'>Class</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Section</th>
                                            <th className='px-2 py-2 font-bold uppercase'>Subject</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Total Students</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Average Marks</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Pass %</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Highest</th>
                                            <th className='px-2 py-2 text-center font-bold uppercase'>Lowest</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                                        {classSectionPerformances.map((cs, i) => (
                                            <tr key={i} className='bg-white dark:bg-slate-950'>
                                                <td className='px-2.5 py-2 font-bold text-slate-800 dark:text-slate-200'>{cs.className}</td>
                                                <td className='px-2 py-2 text-center font-extrabold text-blue-800 dark:text-blue-400'>
                                                    {cs.section}
                                                </td>
                                                <td className='px-2 py-2 font-medium text-slate-700 dark:text-slate-300'>{cs.subject}</td>
                                                <td className='px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                    {cs.totalStudents}
                                                </td>
                                                <td className='px-2 py-2 text-center font-extrabold text-emerald-700 dark:text-emerald-400'>
                                                    {cs.averageMarks}
                                                </td>
                                                <td className='px-2 py-2 text-center font-bold text-blue-700 dark:text-blue-400'>
                                                    {cs.passPercentage}%
                                                </td>
                                                <td className='px-2 py-2 text-center font-semibold text-slate-800 dark:text-slate-200'>
                                                    {cs.highestMarks}
                                                </td>
                                                <td className='px-2 py-2 text-center font-semibold text-slate-700 dark:text-slate-300'>
                                                    {cs.lowestMarks}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. Pass Percentage Comparison Horizontal Bar Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-950'>
                            <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                4. PASS PERCENTAGE COMPARISON (By Class / Section)
                            </h3>
                            <div className='h-60 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <BarChart
                                        layout='vertical'
                                        data={classSectionPerformances}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis type='number' domain={[70, 100]} unit='%' tick={{ fontSize: 10 }} />
                                        <YAxis type='category' dataKey={(d) => `${d.className}-${d.section}`} tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={(val: number) => [`${val}%`, 'Pass Rate']} />
                                        <Bar dataKey='passPercentage' fill='#10b981' radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 5. Grade Distribution Donut & 6. Improvement Trend Line Chart */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* 5. Grade Distribution Donut Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-950'>
                            <h3 className='mb-3 font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                5. GRADE DISTRIBUTION (All Subjects)
                            </h3>
                            <div className='h-56 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <Pie
                                            data={pieGradeData}
                                            cx='50%'
                                            cy='50%'
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={4}
                                            dataKey='value'>
                                            {pieGradeData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [`${value}%`, 'Students']} />
                                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 6. Improvement Trend Line Chart */}
                        <div className='rounded-lg border border-slate-300 bg-white p-4 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-950'>
                            <div className='mb-3 flex items-center justify-between'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    6. IMPROVEMENT TREND (Average Marks)
                                </h3>
                                <div className='rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-xs dark:bg-emerald-950 dark:text-emerald-300'>
                                    Overall Improvement: <span className='text-emerald-700 dark:text-emerald-400'>+4.67</span>
                                </div>
                            </div>
                            <div className='h-56 w-full'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                                        <XAxis dataKey='period' tick={{ fontSize: 10 }} />
                                        <YAxis domain={[55, 80]} tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        <Line
                                            type='monotone'
                                            dataKey='teacherAvg'
                                            name='Teacher Average Marks'
                                            stroke='#10b981'
                                            strokeWidth={3}
                                            dot={{ r: 6 }}
                                        />
                                        <Line
                                            type='monotone'
                                            dataKey='benchmark'
                                            name='School Benchmark'
                                            stroke='#94a3b8'
                                            strokeWidth={2}
                                            strokeDasharray='4 4'
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 7. Top Performers (Overall) & 8. Remarks & Signatures */}
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* 7. Top Performers Overall Table */}
                        <div className='overflow-hidden rounded-lg border border-slate-300 lg:col-span-6 dark:border-slate-800'>
                            <div className='bg-slate-100 px-3 py-2 dark:bg-slate-900'>
                                <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                    7. TOP PERFORMERS (Overall)
                                </h3>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left text-xs'>
                                    <thead>
                                        <tr className='border-slate-300 border-b bg-slate-800 text-white dark:border-slate-800'>
                                            <th className='px-2.5 py-2 text-center font-bold uppercase'>Rank</th>
                                            <th className='px-2.5 py-2 font-bold uppercase'>Student Name</th>
                                            <th className='px-2 py-2 font-bold uppercase'>Class - Section</th>
                                            <th className='px-2 py-2 font-bold uppercase'>Subject</th>
                                            <th className='px-2.5 py-2 text-right font-bold uppercase'>Marks (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                                        {teacherOverallTopPerformers.map((st, i) => (
                                            <tr key={i} className='bg-white dark:bg-slate-950'>
                                                <td className='px-2.5 py-2 text-center font-bold text-amber-600'>{st.rank}</td>
                                                <td className='px-2.5 py-2 font-bold text-slate-800 dark:text-slate-200'>
                                                    {st.studentName}
                                                </td>
                                                <td className='px-2 py-2 font-medium text-slate-700 dark:text-slate-300'>
                                                    {st.classSection}
                                                </td>
                                                <td className='px-2 py-2 font-medium text-slate-700 dark:text-slate-300'>{st.subject}</td>
                                                <td className='px-2.5 py-2 text-right font-extrabold text-emerald-700 dark:text-emerald-400'>
                                                    {st.marksPercent}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 8. Remarks */}
                        <div className='rounded-lg border border-slate-300 bg-slate-50/60 p-4 lg:col-span-6 dark:border-slate-800 dark:bg-slate-900/40'>
                            <h3 className='font-extrabold text-blue-900 text-xs uppercase tracking-wider dark:text-blue-400'>
                                8. REMARKS & ACADEMIC EVALUATION
                            </h3>
                            <ul className='mt-3 list-disc space-y-2 pl-4 text-slate-700 text-xs dark:text-slate-300'>
                                <li>
                                    Overall teacher performance is <strong>satisfactory with consistent improvement</strong> across
                                    assessment terms.
                                </li>
                                <li>
                                    Strong performance demonstrated in <strong>Computer Science and Mathematics</strong>.
                                </li>
                                <li>
                                    More students need support in improving in <strong>Grade D and Grade E categories</strong>.
                                </li>
                                <li>Continue periodic assessments, remedial classes, and active academic guidance.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Signature Blocks */}
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
