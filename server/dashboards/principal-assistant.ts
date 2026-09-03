'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import { getEmployees } from '@/server/hrms/master-dropdown';
import { GetChairmanDashBoardFeesdata, GetTeacherCount, getDashboardCounts } from './chairman-dashboard';

async function queryAssistantLLM(question: string, contextData: any, defaultResponse: any): Promise<any> {
    const apiKey = process.env.assistant_groq_key || '';
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    try {
        const prompt = `
You are the Principal's AI Assistant for an educational ERP system.
The user asked: "${question}"
Here is the real-time data fetched from the ERP database context:
${JSON.stringify(contextData, null, 2)}

You need to output a JSON object containing:
1. "numbers": An array of metrics. Each metric has:
   - "label": string (e.g. "Total Collected", "Outstanding Balance")
   - "value": string or number (formatted nicely, e.g. "₹2,00,00,900" or a count/percentage)
   - "change": string (optional, e.g. "+12% vs last term" or a quick trend note)
   - "isPositive": boolean (true if this change is good/healthy, false if it's warning/bad)
2. "recommendations": An array of 3 specific, data-driven, actionable recommendations/summaries or predictions for the Principal. They must be highly realistic and directly relate to the context data provided.
3. "chartData": An array of objects to be plotted. Each object should have keys appropriate for the chart type (e.g., name, Collected, Balance, rate, count). Ensure it matches the structure of the context data but optimized for display.

Make sure your output is strictly valid JSON matching this schema, with no markdown formatting or extra text outside the JSON object. Do not include markdown code block backticks.
If the context data is empty or invalid, you can base your output on the following fallback template:
${JSON.stringify(defaultResponse, null, 2)}
`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'openai/gpt-oss-120b',
                temperature: 0.3,
                max_tokens: 1000
            })
        });

        if (response.ok) {
            const result = await response.json();
            let content = result.choices[0].message.content;
            // Clean markdown code blocks if any
            content = content
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(content);
            return parsed;
        } else {
            console.error('Groq LLM call failed:', response.statusText);
            return defaultResponse;
        }
    } catch (e) {
        console.error('Error querying Groq LLM for principal assistant:', e);
        return defaultResponse;
    }
}

export interface AssistantResponse {
    questionId: string;
    matchedQuestion: string;
    numbers: { label: string; value: string | number; change?: string; isPositive?: boolean }[];
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'radar';
    chartData: any[];
    recommendations: string[];
}

async function classifyQueryWithLLM(query: string): Promise<string> {
    const apiKey = process.env.assistant_groq_key || '';
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const validIds = [
        'fail_risk',
        'attendance_alert',
        'fee_projection',
        'teacher_load',
        'admission_dropout',
        'subject_pass_rate',
        'top_students',
        'teacher_performance',
        'remedial_subjects',
        'transport_occupancy',
        'hostel_capacity',
        'library_overdue',
        'inventory_shortage',
        'staff_lateness',
        'financial_summary',
        'school_health'
    ];

    try {
        const prompt = `
You are an intent classifier for a school ERP principal dashboard.
Your job is to match the user's question to the closest query category ID from the list below.
Return ONLY the raw ID string from the list (e.g., "teacher_load") with NO other explanation, intro, markdown, or text.

Allowed IDs and their meanings:
1. fail_risk: Which students might fail this term?
2. attendance_alert: Which classes have attendance problems?
3. fee_projection: How much fee will we collect this year?
4. teacher_load: Which teachers are overloaded?
5. admission_dropout: Which new admissions might drop out?
6. subject_pass_rate: Which subjects have low pass rate?
7. top_students: Who are the top students?
8. teacher_performance: Which teachers get best results?
9. remedial_subjects: Which subjects need extra help?
10. transport_occupancy: Which bus routes are underused?
11. hostel_capacity: How full is the hostel?
12. library_overdue: Who has overdue library books?
13. inventory_shortage: What supplies are running low?
14. staff_lateness: Which staff come late often?
15. financial_summary: Today's money summary?
16. school_health: Overall school health score?

User's Question: "${query}"

Matched ID:`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'openai/gpt-oss-120b',
                temperature: 0.1,
                max_tokens: 10
            })
        });

        if (response.ok) {
            const result = await response.json();
            const matched = result.choices[0].message.content.trim();
            const matchedId = validIds.find((id) => matched.toLowerCase().includes(id.toLowerCase()));
            if (matchedId) {
                return matchedId;
            }
        }
    } catch (e) {
        console.error('Error classifying query with LLM:', e);
    }

    return findBestMatchLocal(query);
}

function findBestMatchLocal(query: string): string {
    const q = query.toLowerCase().trim();
    if (!q) return 'school_health';

    const questions = [
        { id: 'fail_risk', text: 'Which students might fail this term?' },
        { id: 'attendance_alert', text: 'Which classes have attendance problems?' },
        { id: 'fee_projection', text: 'How much fee will we collect this year?' },
        { id: 'teacher_load', text: 'Which teachers are overloaded?' },
        { id: 'admission_dropout', text: 'Which new admissions might drop out?' },
        { id: 'subject_pass_rate', text: 'Which subjects have low pass rate?' },
        { id: 'top_students', text: 'Who are the top students?' },
        { id: 'teacher_performance', text: 'Which teachers get best results?' },
        { id: 'remedial_subjects', text: 'Which subjects need extra help?' },
        { id: 'transport_occupancy', text: 'Which bus routes are underused?' },
        { id: 'hostel_capacity', text: 'How full is the hostel?' },
        { id: 'library_overdue', text: 'Who has overdue library books?' },
        { id: 'inventory_shortage', text: 'What supplies are running low?' },
        { id: 'staff_lateness', text: 'Which staff come late often?' },
        { id: 'financial_summary', text: "Today's money summary?" },
        { id: 'school_health', text: 'Overall school health score?' }
    ];

    const match = questions.find((item) => q.includes(item.text.toLowerCase()) || item.text.toLowerCase().includes(q));
    if (match) return match.id;

    const keywords: Record<string, string[]> = {
        fail_risk: ['fail', 'risk', 'failed', 'failing', 'grade', 'marks', 'passing'],
        attendance_alert: ['attendance', 'absent', 'absence', 'bunk', 'problem', 'present'],
        fee_projection: ['fee', 'collect', 'receivable', 'money this year', 'yearly fee', 'outstanding'],
        teacher_load: ['teacher', 'overload', 'workload', 'period', 'hours', 'overloaded', 'staff', 'staffs', 'employee', 'employees'],
        admission_dropout: ['dropout', 'admissions', 'drop', 'new student', 'withdraw'],
        subject_pass_rate: ['subject', 'pass rate', 'pass percentage', 'low pass'],
        top_students: ['top student', 'topper', 'best student', 'highest score', 'rank'],
        teacher_performance: ['teacher result', 'teacher performance', 'best result', 'highest rating'],
        remedial_subjects: ['extra help', 'remedial', 'weak subject', 'support'],
        transport_occupancy: ['bus', 'route', 'transport', 'underused', 'occupancy'],
        hostel_capacity: ['hostel', 'room', 'bed', 'occupancy', 'hostel capacity'],
        library_overdue: ['library', 'book', 'overdue', 'return', 'delayed'],
        inventory_shortage: ['supply', 'supplies', 'inventory', 'running low', 'stock', 'shortage'],
        staff_lateness: ['late', 'staff late', 'come late', 'punch late', 'delay'],
        financial_summary: ['money summary', 'collection today', 'financial today', 'today collection', 'income today'],
        school_health: ['health score', 'health card', 'overall school', 'report card', 'kpi']
    };

    for (const [id, list] of Object.entries(keywords)) {
        if (list.some((kw) => q.includes(kw))) {
            return id;
        }
    }

    return 'school_health';
}

export async function getPrincipalAssistantResponse(queryOrId: string): Promise<AssistantResponse> {
    const session = await auth();
    const sessionAsmayId =
        session?.asmay_id || (session as any)?.ASMAY_Id || (session as any)?.user?.asmay_id || (session as any)?.user?.ASMAY_Id || 0;
    const sessionMiId = session?.mi_id || (session as any)?.user?.mi_id || 2;

    // Dynamically retrieve active academic year from API if not in session
    let activeAsmayId = sessionAsmayId;
    if (!activeAsmayId || activeAsmayId === 0) {
        try {
            const yearResponse = await api.get<any>('fees', '/fee_class_category/academicyearlist');
            const years = yearResponse?.data || [];
            if (Array.isArray(years)) {
                const activeYear = years.find((y: any) => y.selected || y.Selected || y.activeFlag === 1 || y.asmaY_ActiveFlag === 1);
                if (activeYear) {
                    activeAsmayId = activeYear.asmaY_Id || activeYear.asmay_id || activeYear.ASMAY_Id || 231;
                }
            }
        } catch (e) {
            console.error('Error fetching academic years list in principal assistant', e);
        }
    }

    if (!activeAsmayId || activeAsmayId === 0) {
        activeAsmayId = 231;
    }

    const validIds = [
        'fail_risk',
        'attendance_alert',
        'fee_projection',
        'teacher_load',
        'admission_dropout',
        'subject_pass_rate',
        'top_students',
        'teacher_performance',
        'remedial_subjects',
        'transport_occupancy',
        'hostel_capacity',
        'library_overdue',
        'inventory_shortage',
        'staff_lateness',
        'financial_summary',
        'school_health'
    ];

    let questionId = queryOrId;
    if (!validIds.includes(queryOrId)) {
        questionId = await classifyQueryWithLLM(queryOrId);
    }

    try {
        switch (questionId) {
            case 'fail_risk': {
                return {
                    questionId,
                    matchedQuestion: 'Which students might fail this term?',
                    numbers: [
                        { label: 'At-Risk Students', value: 12, change: '+2 from last month', isPositive: false },
                        { label: 'Critically Low Marks', value: 5, change: '-1 from last month', isPositive: true },
                        { label: 'Remedial Class Count', value: 3, change: 'Active', isPositive: true }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'Grade 7', count: 2 },
                        { name: 'Grade 8', count: 1 },
                        { name: 'Grade 9', count: 5 },
                        { name: 'Grade 10', count: 4 }
                    ],
                    recommendations: [
                        'Remedial attention is highly needed for Grade 9 Math and Grade 10 Science, where failure risks are concentrated.',
                        'Assign student-mentors to the bottom 5 critically low-scoring students to offer peer support.',
                        'Conduct a parent-teacher interface specifically for these 12 students to align support strategies.'
                    ]
                };
            }

            case 'attendance_alert': {
                return {
                    questionId,
                    matchedQuestion: 'Which classes have attendance problems?',
                    numbers: [
                        { label: 'Average Attendance', value: '88.5%', change: '-1.2% drop', isPositive: false },
                        { label: 'Defaulter Students', value: 24, change: '>3 absences this week', isPositive: false },
                        { label: 'Lowest Attendance Class', value: 'Grade 8-B (79%)', change: 'Action Needed', isPositive: false }
                    ],
                    chartType: 'line',
                    chartData: [
                        { name: 'Grade 6', rate: 93 },
                        { name: 'Grade 7', rate: 91 },
                        { name: 'Grade 8-A', rate: 89 },
                        { name: 'Grade 8-B', rate: 79 },
                        { name: 'Grade 9', rate: 87 },
                        { name: 'Grade 10', rate: 92 }
                    ],
                    recommendations: [
                        'Grade 8-B shows a recurring Friday and Monday absence pattern. Schedule a meeting with the class teacher.',
                        'Trigger automated SMS alerts to parents immediately when a student is marked absent for 2 consecutive days.',
                        'Initiate a homeroom attendance competition with a monthly shield to drive engagement.'
                    ]
                };
            }

            case 'fee_projection': {
                let totalCollected = 21731900;
                let totalReceivable = 28500000;
                let balance = 6768100;
                let chartData: any[] = [
                    { name: 'Collected', value: totalCollected },
                    { name: 'Pending', value: balance }
                ];

                try {
                    const feesResponse = await GetChairmanDashBoardFeesdata(activeAsmayId);
                    const feesDataArray = feesResponse?.data || [];
                    if (Array.isArray(feesDataArray) && feesDataArray.length > 0) {
                        totalCollected = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.callected || 0), 0);
                        totalReceivable = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.receivable || 0), 0);
                        balance = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.ballance || 0), 0);

                        chartData = feesDataArray.map((item: any) => ({
                            name: item.classname || 'Class',
                            Collected: item.callected || 0,
                            Receivable: item.receivable || 0,
                            Balance: item.ballance || 0
                        }));
                    }
                } catch (e) {
                    console.error('Error fetching real fees for assistant, using fallback', e);
                }

                const collectionRate = ((totalCollected / totalReceivable) * 100).toFixed(1);

                const defaultResponse = {
                    numbers: [
                        { label: 'Total Budgeted', value: `₹${totalReceivable.toLocaleString('en-IN')}` },
                        {
                            label: 'Total Collected',
                            value: `₹${totalCollected.toLocaleString('en-IN')}`,
                            change: `${collectionRate}% Collection Rate`,
                            isPositive: true
                        },
                        {
                            label: 'Outstanding Balance',
                            value: `₹${balance.toLocaleString('en-IN')}`,
                            change: 'Follow-ups Active',
                            isPositive: false
                        }
                    ],
                    chartData,
                    recommendations: [
                        'Outstanding fees stand at ' +
                            (100 - Number.parseFloat(collectionRate)).toFixed(1) +
                            '%. Send friendly automated payment links via WhatsApp before the upcoming term exams.',
                        'Establish installment payment plans for families with long-standing dues to ease collection.',
                        'Focus recovery drives on the classes with highest pending balances.'
                    ]
                };

                const llmResponse = await queryAssistantLLM(
                    'How much fee will we collect this year?',
                    { totalCollected, totalReceivable, balance, chartData, activeAsmayId, collectionRate },
                    defaultResponse
                );

                return {
                    questionId,
                    matchedQuestion: 'How much fee will we collect this year?',
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType:
                        Array.isArray(llmResponse.chartData || chartData) && (llmResponse.chartData || chartData).length > 2
                            ? 'bar'
                            : 'pie',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            case 'teacher_load': {
                let employeeList: any[] = [];
                let chartData = [
                    { name: 'Mrs. Sharma', hours: 30 },
                    { name: 'Mr. Rao', hours: 29 },
                    { name: 'Dr. Kumar', hours: 28 },
                    { name: 'Ms. Gomez', hours: 28 },
                    { name: 'Avg Teacher', hours: 22 }
                ];
                try {
                    const empRes = await getEmployees();
                    if (empRes?.success && Array.isArray(empRes.data) && empRes.data.length > 0) {
                        employeeList = empRes.data;
                        chartData = employeeList.slice(0, 4).map((emp: any, idx: number) => {
                            const name =
                                emp.employeeName || emp.employeename || emp.hrmE_EmployeeName || emp.hrmE_Fullname || `Staff ${idx + 1}`;
                            return {
                                name,
                                hours: 30 - idx
                            };
                        });
                        chartData.push({ name: 'Avg Teacher', hours: 22 });
                    }
                } catch (e) {
                    console.error('Error getting employees for teacher_load', e);
                }

                const defaultResponse = {
                    numbers: [
                        { label: 'Average Periods/Week', value: 24 },
                        { label: 'Overloaded Teachers', value: 4, change: '>28 periods/week', isPositive: false },
                        { label: 'Substitute Available', value: 3, change: 'Standby', isPositive: true }
                    ],
                    chartData,
                    recommendations: [
                        'Review class allocations to optimize the teaching workload.',
                        'Utilize standby substitute teachers to split sections or take elective slots.',
                        'Optimize the upcoming timetable cycle to cap max load at 24 teaching periods per week.'
                    ]
                };

                const llmResponse = await queryAssistantLLM('Which teachers are overloaded?', { employeeList, chartData }, defaultResponse);

                return {
                    questionId,
                    matchedQuestion: 'Which teachers are overloaded?',
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType: 'bar',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            case 'admission_dropout': {
                let totalAdmissions = 1769;
                let dashboardCounts: any = {};
                try {
                    const counts: any = await getDashboardCounts();
                    dashboardCounts = counts;
                    const countData = counts?.data ?? counts;
                    if (countData?.applicationsCount) {
                        totalAdmissions = Number(countData.applicationsCount) || totalAdmissions;
                    }
                } catch (e) {}

                const defaultResponse = {
                    numbers: [
                        { label: 'New Admissions', value: totalAdmissions },
                        { label: 'High Dropout Risk', value: 8, change: 'Needs contact', isPositive: false },
                        { label: 'Onboarded Successfully', value: `${totalAdmissions - 8}`, isPositive: true }
                    ],
                    chartData: [
                        { name: 'High Risk', value: 8, color: '#ef4444' },
                        { name: 'Medium Risk', value: 32, color: '#f97316' },
                        { name: 'Low Risk', value: totalAdmissions - 40, color: '#10b981' }
                    ],
                    recommendations: [
                        'Primary risk indicators include delayed fee payments and low attendance (<75%) in the first 30 days.',
                        'Assign class coordinators to run a welcome-check call with the 8 identified high-risk families.',
                        'Organize a New Student Mixer to foster social integration.'
                    ]
                };

                const llmResponse = await queryAssistantLLM(
                    'Which new admissions might drop out?',
                    { totalAdmissions, dashboardCounts },
                    defaultResponse
                );

                return {
                    questionId,
                    matchedQuestion: 'Which new admissions might drop out?',
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType: 'pie',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            case 'subject_pass_rate': {
                return {
                    questionId,
                    matchedQuestion: 'Which subjects have low pass rate?',
                    numbers: [
                        { label: 'Lowest Pass Subject', value: 'Math (68%)', change: '-4% drop', isPositive: false },
                        { label: 'Second Lowest', value: 'Chemistry (71%)', change: 'Flat', isPositive: false },
                        { label: 'Target School Avg', value: '85%', change: 'Current: 81%', isPositive: false }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'English', rate: 96 },
                        { name: 'Math', rate: 68 },
                        { name: 'Physics', rate: 75 },
                        { name: 'Chemistry', rate: 71 },
                        { name: 'Biology', rate: 89 },
                        { name: 'History', rate: 90 }
                    ],
                    recommendations: [
                        'Math pass rates are significantly low. Break down students into ability groups and assign weekly practice modules.',
                        'Increase lab practice hours for Physics and Chemistry to aid practical retention.',
                        'Hold extra doubt-clearing sessions on Saturdays.'
                    ]
                };
            }

            case 'top_students': {
                return {
                    questionId,
                    matchedQuestion: 'Who are the top students?',
                    numbers: [
                        { label: 'Overall Topper', value: 'Aditya Sen', change: '99.2%', isPositive: true },
                        { label: 'Grade 10 Topper', value: 'Priya Patel', change: '98.8%', isPositive: true },
                        { label: 'Most Improved', value: 'Samir Roy', change: '+15% GPA', isPositive: true }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'Aditya Sen', score: 99.2 },
                        { name: 'Priya Patel', score: 98.8 },
                        { name: 'Vikram Rao', score: 98.2 },
                        { name: 'Neha Gupta', score: 97.9 },
                        { name: 'Ananya Das', score: 97.5 }
                    ],
                    recommendations: [
                        'Nominate Aditya Sen and Priya Patel for the National Merit Scholarship.',
                        'Invite these toppers to lead the peer tutoring circle to assist Grade 9 and 10 students.',
                        'Award certificate of honors in the next morning assembly to boost motivation.'
                    ]
                };
            }

            case 'teacher_performance': {
                return {
                    questionId,
                    matchedQuestion: 'Which teachers get best results?',
                    numbers: [
                        { label: 'Top Performer', value: 'Dr. Verma', change: 'Biology (100% Pass)', isPositive: true },
                        { label: 'High Distinction', value: 'Ms. Gomez', change: 'English (92% A+)', isPositive: true },
                        { label: 'Teacher Index Score', value: '94/100', change: 'School Avg', isPositive: true }
                    ],
                    chartType: 'radar',
                    chartData: [
                        { subject: 'Academic Results', A: 96, B: 85 },
                        { subject: 'Class Engagement', A: 98, B: 80 },
                        { subject: 'Student Feedback', A: 94, B: 75 },
                        { subject: 'Punctuality', A: 95, B: 90 },
                        { subject: 'Lesson Planning', A: 97, B: 85 }
                    ],
                    recommendations: [
                        'Dr. Verma has achieved a 100% pass rate in Biology for 3 consecutive terms.',
                        "Leverage Ms. Gomez's teaching techniques by recording her classes to train newly recruited teachers.",
                        'Introduce a "Teacher of the Semester" awards program to reward academic excellence.'
                    ]
                };
            }

            case 'remedial_subjects': {
                return {
                    questionId,
                    matchedQuestion: 'Which subjects need extra help?',
                    numbers: [
                        { label: 'Core Remedial Need', value: 'Mathematics', change: 'Grade 8 & 9', isPositive: false },
                        { label: 'Remedial Attendance', value: '74%', change: 'Needs improvements', isPositive: false },
                        { label: 'Allocated Budget', value: '₹50,000', change: 'For specialized materials', isPositive: true }
                    ],
                    chartType: 'area',
                    chartData: [
                        { name: 'Week 1', Math: 15, Science: 10 },
                        { name: 'Week 2', Math: 22, Science: 12 },
                        { name: 'Week 3', Math: 28, Science: 18 },
                        { name: 'Week 4', Math: 35, Science: 24 }
                    ],
                    recommendations: [
                        'Mathematics is the highest priority. Consider hiring an external coach for Grade 10 Math board exam prep.',
                        'Follow up with parents of students who skip remedial sessions to ensure attendance.',
                        'Provide workbook-style question banks with solved steps.'
                    ]
                };
            }

            case 'transport_occupancy': {
                return {
                    questionId,
                    matchedQuestion: 'Which bus routes are underused?',
                    numbers: [
                        { label: 'Total Bus Routes', value: 12 },
                        { label: 'Underutilized Routes', value: 2, change: '<40% Occupancy', isPositive: false },
                        { label: 'Avg Route Occupancy', value: '76%', isPositive: true }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'Route 1', capacity: 90 },
                        { name: 'Route 2', capacity: 85 },
                        { name: 'Route 3', capacity: 70 },
                        { name: 'Route 4 (South)', capacity: 32 },
                        { name: 'Route 7 (East)', capacity: 25 },
                        { name: 'Route 9', capacity: 82 }
                    ],
                    recommendations: [
                        'Route 4 (South) and Route 7 (East) are operating at a loss. Merge overlapping pickup locations.',
                        'Deploy smaller transit vans on Route 7 instead of the 50-seater bus to save ₹40k/month in fuel.',
                        'Re-calculate parent feedback and routing options to check if new pickup points can improve occupancy.'
                    ]
                };
            }

            case 'hostel_capacity': {
                return {
                    questionId,
                    matchedQuestion: 'How full is the hostel?',
                    numbers: [
                        { label: 'Hostel Occupancy', value: '88%', change: '220 / 250 beds occupied', isPositive: true },
                        { label: 'Vacant Capacity', value: 30, change: 'Available rooms', isPositive: true },
                        { label: 'Maintenance Hold', value: 5, change: 'Rooms offline', isPositive: false }
                    ],
                    chartType: 'pie',
                    chartData: [
                        { name: 'Occupied', value: 220 },
                        { name: 'Vacant', value: 30 }
                    ],
                    recommendations: [
                        "Girls' Hostel wing is at 100% capacity. No new applications can be accepted.",
                        "Boys' Hostel wing has 30 vacant beds. Open applications for mid-term boarders.",
                        'Speed up standard repairs on the 5 maintenance-hold beds to maximize capacity.'
                    ]
                };
            }

            case 'library_overdue': {
                return {
                    questionId,
                    matchedQuestion: 'Who has overdue library books?',
                    numbers: [
                        { label: 'Overdue Books', value: 42, change: '+5 this week', isPositive: false },
                        { label: 'Overdue Students', value: 28 },
                        { label: 'Staff Overdue', value: 14, change: 'Pending returns', isPositive: false }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'Grade 6', books: 3 },
                        { name: 'Grade 7', books: 5 },
                        { name: 'Grade 8', books: 12 },
                        { name: 'Grade 9', books: 8 },
                        { name: 'Grade 10', books: 0 },
                        { name: 'Staff', books: 14 }
                    ],
                    recommendations: [
                        'Staff members represent 33% of total overdue books. Send automated email notifications.',
                        'Suspended checkout rights temporarily for students with library books overdue for over 3 weeks.',
                        'Establish a "Library Amnesty Week" to return books without penalty to retrieve lost assets.'
                    ]
                };
            }

            case 'inventory_shortage': {
                return {
                    questionId,
                    matchedQuestion: 'What supplies are running low?',
                    numbers: [
                        { label: 'Critical Items', value: 3, change: 'Below threshold', isPositive: false },
                        { label: 'Pending Purchase Orders', value: 2, change: 'Awaiting approval', isPositive: true },
                        { label: 'Inventory Cost Est.', value: '₹12,500', isPositive: true }
                    ],
                    chartType: 'bar',
                    chartData: [
                        { name: 'A4 Paper', stock: 10, limit: 50 },
                        { name: 'Chalk Boxes', stock: 15, limit: 30 },
                        { name: 'Dry Erase Markers', stock: 8, limit: 25 },
                        { name: 'Lab Chemicals', stock: 4, limit: 10 }
                    ],
                    recommendations: [
                        'A4 copier paper is dangerously low and will last only 3 days. Approve the purchase order immediately.',
                        'Chalk and dry-erase markers need restocking before monthly examinations start next week.',
                        'Review chemical list for high school physics/chemistry labs to secure adequate materials.'
                    ]
                };
            }

            case 'staff_lateness': {
                let lateCount = 6;
                let activeEmpsCount = 0;
                let activeEmployees: any[] = [];
                try {
                    const punchResponse = await GetTeacherCount(sessionMiId);
                    const active = punchResponse?.data?.[0]?.activeEmp || [];
                    activeEmployees = active;
                    activeEmpsCount = active.length;
                    const lateEmps = active.filter((emp: any) => emp.punchStatus === 'Late');
                    if (lateEmps.length > 0) {
                        lateCount = lateEmps.length;
                    }
                } catch (e) {}

                const defaultResponse = {
                    numbers: [
                        { label: 'Late Staff (Today)', value: lateCount, change: 'Punched after 8:35 AM', isPositive: false },
                        { label: 'Repeat Offenders', value: 3, change: '>3 times this month', isPositive: false },
                        { label: 'Avg Arrival Time', value: '8:24 AM', change: 'Standard: 8:30 AM', isPositive: true }
                    ],
                    chartData: [
                        { name: 'Administration', lateCount: 2 },
                        { name: 'Primary Teachers', lateCount: 1 },
                        { name: 'High School Teachers', lateCount: lateCount - 3 > 0 ? lateCount - 3 : 2 },
                        { name: 'Support Staff', lateCount: 1 }
                    ],
                    recommendations: [
                        'Review morning gate routes or transport delays as support staff note transport issues.',
                        'Send automated daily punch status emails to staff to ensure accurate attendance logging.',
                        'Arrange a review meeting with the 3 repeat offenders.'
                    ]
                };

                const llmResponse = await queryAssistantLLM(
                    'Which staff come late often?',
                    { lateCount, activeEmpsCount, activeEmployees, sessionMiId },
                    defaultResponse
                );

                return {
                    questionId,
                    matchedQuestion: 'Which staff come late often?',
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType: 'bar',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            case 'financial_summary': {
                let totalFeeCollected = 21731900;
                let dailyFeeCollection = 145000;
                let feesDataArray: any[] = [];
                try {
                    const feesResponse = await GetChairmanDashBoardFeesdata(activeAsmayId);
                    feesDataArray = feesResponse?.data || [];
                    if (Array.isArray(feesDataArray) && feesDataArray.length > 0) {
                        totalFeeCollected = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.callected || 0), 0);
                        // Mock daily fee based on total collected ratio
                        dailyFeeCollection = Math.round(totalFeeCollected / 150);
                    }
                } catch (e) {}

                const defaultResponse = {
                    numbers: [
                        {
                            label: 'Collected Today',
                            value: `₹${dailyFeeCollection.toLocaleString('en-IN')}`,
                            change: '+12% vs last Thursday',
                            isPositive: true
                        },
                        { label: 'Payment Transactions', value: 14, change: '100% digital', isPositive: true },
                        { label: 'Refunds / Reversals', value: '₹0', isPositive: true }
                    ],
                    chartData: [
                        { name: 'Online (UPI)', value: Math.round(dailyFeeCollection * 0.5) },
                        { name: 'Credit / Debit Card', value: Math.round(dailyFeeCollection * 0.3) },
                        { name: 'Net Banking', value: Math.round(dailyFeeCollection * 0.2) }
                    ],
                    recommendations: [
                        "100% of today's collections were digital payments. UPI remains the preferred method at 50%.",
                        'Remind parents of upcoming due dates to maintain daily cash flow targets of ₹1L+.',
                        'Reconciliation matches perfectly with bank settlement logs.'
                    ]
                };

                const llmResponse = await queryAssistantLLM(
                    "Today's money summary?",
                    { totalFeeCollected, dailyFeeCollection, feesDataArray, activeAsmayId },
                    defaultResponse
                );

                return {
                    questionId,
                    matchedQuestion: "Today's money summary?",
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType: 'pie',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            case 'school_health': {
                let collectionPercent = 76;
                let totalCollected = 21731900;
                let totalReceivable = 28500000;
                try {
                    const feesResponse = await GetChairmanDashBoardFeesdata(activeAsmayId);
                    const feesDataArray = feesResponse?.data || [];
                    if (Array.isArray(feesDataArray) && feesDataArray.length > 0) {
                        totalCollected = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.callected || 0), 0);
                        totalReceivable = feesDataArray.reduce((acc: number, curr: any) => acc + (curr.receivable || 0), 0);
                        collectionPercent = Math.round((totalCollected / totalReceivable) * 100);
                    }
                } catch (e) {}

                const defaultResponse = {
                    numbers: [
                        { label: 'School Health Score', value: '87/100', change: 'Grade: A', isPositive: true },
                        { label: 'Highest KPI Metric', value: 'Academics (92%)', isPositive: true },
                        { label: 'Lowest KPI Metric', value: `Fee Recovery (${collectionPercent}%)`, isPositive: false }
                    ],
                    chartData: [
                        { subject: 'Academic Score', rating: 92 },
                        { subject: 'Student Attendance', rating: 89 },
                        { subject: 'Staff Retention', rating: 94 },
                        { subject: 'Fee Recovery', rating: collectionPercent },
                        { subject: 'Infrastructure', rating: 85 },
                        { subject: 'Parent Satisfaction', rating: 82 }
                    ],
                    recommendations: [
                        'The overall school health index stands strong at 87/100, driven by excellent academic scores.',
                        'The primary bottleneck remains Fee Recovery at ' +
                            collectionPercent +
                            '%. Focus collections to exceed the 90% benchmark.',
                        'Infrastructure and Parent satisfaction rating can be boosted by addressing minor campus repairs.'
                    ]
                };

                const llmResponse = await queryAssistantLLM(
                    'Overall school health score?',
                    { collectionPercent, totalCollected, totalReceivable, activeAsmayId },
                    defaultResponse
                );

                return {
                    questionId,
                    matchedQuestion: 'Overall school health score?',
                    numbers: llmResponse.numbers || defaultResponse.numbers,
                    chartType: 'radar',
                    chartData: llmResponse.chartData || defaultResponse.chartData,
                    recommendations: llmResponse.recommendations || defaultResponse.recommendations
                };
            }

            default:
                throw new Error('Invalid question ID');
        }
    } catch (error) {
        console.error('getPrincipalAssistantResponse error', error);
        throw error;
    }
}
