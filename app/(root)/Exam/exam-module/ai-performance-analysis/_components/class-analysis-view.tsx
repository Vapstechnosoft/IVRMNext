'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClassAnalysis } from '@/types/exam/exam-module/ai-analysis';

interface ClassAnalysisViewProps {
    analysis: ClassAnalysis;
}

export function ClassAnalysisView({ analysis }: ClassAnalysisViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* Overview */}
            <Card className="bg-blue-50/50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">📝 Class Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-blue-800 leading-relaxed">{analysis.classOverview}</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        🏆 Top 5 Performers
                    </h3>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {analysis.topPerformers.map((student, idx) => (
                                <Card key={idx} className="bg-green-50/50 border-green-200">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-green-900 text-lg">
                                                #{idx + 1} {student.name}
                                            </CardTitle>
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                                Avg: {student.averageScore}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground">{student.analysis}</p>
                                        <div className="bg-green-100/50 p-2 rounded-md text-sm text-green-800 font-medium">
                                            ✨ {student.praise}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Weak Performers */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        ⚠️ Students Needing Support
                    </h3>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {analysis.weakPerformers.map((student, idx) => (
                                <Card key={idx} className="bg-red-50/50 border-red-200">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-red-900 text-lg">
                                                #{idx + 1} {student.name}
                                            </CardTitle>
                                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                                Avg: {student.averageScore}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground">{student.analysis}</p>
                                        <div className="bg-red-100/50 p-2 rounded-md text-sm text-red-800 font-medium">
                                            💡 {student.recommendations}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
