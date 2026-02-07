'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndividualAnalysis, StudentPerformance } from '@/types/exam/exam-module/ai-analysis';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface StudentAnalysisViewProps {
    student: StudentPerformance;
    analysis: IndividualAnalysis;
}

export function StudentAnalysisView({ student, analysis }: StudentAnalysisViewProps) {
    const chartData = student.subjects.map(s => ({
        subject: s.subject,
        score: s.percentage
    }));

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                    <h2 className="text-2xl font-bold">{student.name}</h2>
                    <p className="text-muted-foreground">Index: {student.index}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{student.averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
            </div>

            <Tabs defaultValue="weakest" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="weakest">📉 Weakest</TabsTrigger>
                    <TabsTrigger value="improvement">⚠️ Improve</TabsTrigger>
                    <TabsTrigger value="strong">✅ Strong</TabsTrigger>
                    <TabsTrigger value="overall">📊 Overall</TabsTrigger>
                </TabsList>

                <TabsContent value="weakest" className="mt-4">
                    <Card className="bg-red-50/50 border-red-200">
                        <CardContent className="pt-6">
                            <h3 className="text-xl font-bold text-red-700 mb-2">
                                {analysis.weakestSubject.name} (Score: {analysis.weakestSubject.score})
                            </h3>
                            <p className="text-red-900 leading-relaxed">
                                {analysis.weakestSubject.analysis}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="improvement" className="mt-4">
                    <div className="space-y-4">
                        {analysis.needsImprovement.map((subject, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-lg mb-2">
                                        {subject.name} (Score: {subject.score})
                                    </h4>
                                    <div className="bg-yellow-50 text-yellow-900 p-3 rounded-md border border-yellow-200">
                                        💡 {subject.recommendation}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="strong" className="mt-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        {analysis.strongSubjects.map((subject, i) => (
                            <Card key={i} className="bg-green-50/50 border-green-200">
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-green-900 mb-1">
                                        {subject.name}
                                    </h4>
                                    <p className="text-sm font-medium text-green-700 mb-2">
                                        Score: {subject.score}
                                    </p>
                                    <p className="text-sm text-green-800">
                                        {subject.praise}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="overall" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-blue-50/50 border-blue-200">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-blue-900 mb-2">📝 Assessment</h3>
                                <p className="text-blue-800 leading-relaxed">
                                    {analysis.overallAssessment}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-purple-50/50 border-purple-200">
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-purple-900 mb-2">🎯 Strategy</h3>
                                <p className="text-purple-800 leading-relaxed whitespace-pre-line">
                                    {analysis.improvementStrategy}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Chart */}
            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-6">Subject Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar
                                    dataKey="score"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
