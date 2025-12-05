'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Eye, Plus } from "lucide-react";
import { GroupItem, SubjectRow } from "../../promotion-setting/_components/add-from";

export function ViewGroupsModal({
    subject,
    onClose,
    onAddGroup,
    groups,
    onOpenExams
}: {
    subject: SubjectRow;
    onClose: () => void;
    onAddGroup: (g: GroupItem) => void;
    groups: GroupItem[];
    onOpenExams: (g: GroupItem) => void;
}) {
    const [marks, setMarks] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [groupName, setGroupName] = useState('');
    const [groupOrder, setGroupOrder] = useState(1);
    const [maxOff, setMaxOff] = useState(0);
    const [bestOff, setBestOff] = useState(0);
    const [displayName, setDisplayName] = useState('');
    const [roundOff, setRoundOff] = useState(false);

    const leftExams = [
        { id: 101, name: 'Formative Assessment -04' },
        { id: 102, name: 'Summative Assessment-02' },
        { id: 103, name: 'Unit Test 1' }
    ];

    const [selectedExamIds, setSelectedExamIds] = useState({});
    const toggleSelectExam = (id: number) => setSelectedExamIds(p => ({ ...p, [id]: !p[id] }));

    const handleAdd = () => {
        if (!groupName || !displayName) {
            toast.error("Group Name & Display Name Required");
            return;
        }

        onAddGroup({
            id: Date.now(),
            groupName,
            displayName,
            percentage,
            marks,
            maxOff,
            bestOff,
            order: groupOrder,
            roundOffFlag: roundOff,
            exams: leftExams.filter(e => selectedExamIds[e.id]).map(e => ({
                id: e.id,
                name: e.name,
                marks: Math.floor(Math.random() * 100),
                conversionRequired: false
            }))
        });

        setGroupName(""); setDisplayName("");
        setPercentage(0); setMarks(0);
        setBestOff(0); setMaxOff(0);
        setSelectedExamIds({});
        setGroupOrder(o => o + 1);
    };

    return (
        <div className="fixed inset-0 z-[9990] flex items-start justify-center p-6">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-[9991] w-[95%] md:w-[90%] max-w-6xl bg-white rounded-xl shadow-xl border overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 font-semibold text-lg">
                    <span>{subject.name.toUpperCase()} - GROUP MAPPING</span>
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/20 p-1">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">

                    {/* LEFT EXAM TABLE */}
                    <div className="rounded border shadow-sm overflow-hidden">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100 text-sm">
                                <tr>
                                    <th className="p-2 w-12">Select</th>
                                    <th className="p-2">Exam Name</th>
                                    <th className="p-2 w-40">Converted Marks</th>
                                    <th className="p-2 w-36">Required?</th>
                                </tr>
                            </thead>

                            <tbody>
                                {leftExams.map((e, i) => (
                                    <tr key={e.id} className={`${i % 2 ? "bg-gray-50" : "bg-white"} text-sm`}>
                                        <td className="p-2 text-center">
                                            <Checkbox checked={!!selectedExamIds[e.id]} onCheckedChange={() => toggleSelectExam(e.id)} />
                                        </td>
                                        <td className="p-2">{e.name}</td>
                                        <td className="p-2">
                                            <Input placeholder="Enter marks" />
                                        </td>
                                        <td className="p-2 text-center">
                                            <Checkbox />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="space-y-3">

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Marks</Label>
                                <Input type="number" value={marks} onChange={(e) => setMarks(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Max Off</Label>
                                <Input type="number" value={maxOff} onChange={(e) => setMaxOff(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Percentage *</Label>
                                <Input type="number" value={percentage} onChange={(e) => setPercentage(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Best Off *</Label>
                                <Input type="number" value={bestOff} onChange={(e) => setBestOff(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Group Name *</Label>
                                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                            </div>
                            <div>
                                <Label>Display Name *</Label>
                                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                            </div>
                            <div>
                                <Label>Order *</Label>
                                <Input type="number" value={groupOrder} onChange={(e) => setGroupOrder(+e.target.value)} />
                            </div>

                            <div className="flex gap-2 items-center mt-7">
                                <Checkbox checked={roundOff} onCheckedChange={() => setRoundOff(!roundOff)} />
                                <Label>Round Off Required</Label>
                            </div>
                        </div>

                        <div className="w-fit flex gap-3 justify-end">
                            <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Add</Button>
                            <Button variant="outline" onClick={() => { setGroupName(""); setDisplayName(""); setSelectedExamIds({}); }}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* GROUP LIST */}
                <div className="border-t p-4">
                    <table className="min-w-full border-collapse border">
                        <thead className="bg-gray-100  text-sm">
                            <tr>
                                <th className="p-2">#</th><th className="p-2">Group</th><th className="p-2">Display</th>
                                <th className="p-2">%</th><th className="p-2">Marks</th><th className="p-2">Max</th>
                                <th className="p-2">Best</th><th className="p-2">Order</th><th className="p-2">Exams</th>
                                <th className="p-2">Round</th><th className="p-2">Remove</th>
                            </tr>
                        </thead>

                        <tbody>
                            {groups.length === 0 ? (<tr><td colSpan={11} className="text-center p-3">No Groups Added</td></tr>) : (
                                groups.map((g, i) => (
                                    <tr key={g.id} className={`${i % 2 ? "bg-gray-50" : "bg-white"} text-sm`}>
                                        <td className="p-2 text-center">{i + 1}</td>
                                        <td className="p-2">{g.groupName}</td>
                                        <td className="p-2">{g.displayName}</td>
                                        <td className="p-2 text-center">{g.percentage}</td>
                                        <td className="p-2 text-center">{g.marks}</td>
                                        <td className="p-2 text-center">{g.maxOff}</td>
                                        <td className="p-2 text-center">{g.bestOff}</td>
                                        <td className="p-2 text-center">{g.order}</td>
                                        <td className="p-2 text-center">
                                            <Button size="sm" variant="ghost" onClick={() => onOpenExams(g)}>
                                                <Eye className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </td>
                                        <td className="p-2 text-center">{g.roundOffFlag ? "✔" : ""}</td>
                                        <td className="p-2 text-center">
                                            <Button variant="ghost"><X className="h-4 w-4 text-red-600" /></Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="w-fit flex justify-center mt-4">
                        <Button onClick={onClose}>Submit & Close</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function ViewExamsModal({ group, onClose }: { group: GroupItem; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative z-[10000] w-[90%] max-w-xl bg-white rounded-xl shadow-xl border overflow-hidden">

                <div className="flex justify-between items-center px-4 py-2 bg-gray-100  font-semibold text-lg">
                    <span>{group.displayName} — EXAM MAPPING</span>
                    <Button variant="ghost" onClick={onClose} className="w-fit hover:bg-white/20 p-1">
                        Close <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-4">
                    <table className="min-w-full border">
                        <thead className="bg-gray-100  text-sm">
                            <tr>
                                <th className="p-2 w-10">#</th>
                                <th className="p-2">Exam Name</th>
                                <th className="p-2 w-20">Marks</th>
                                <th className="p-2 w-32">Conversion?</th>
                            </tr>
                        </thead>

                        <tbody>
                            {group.exams.length === 0 ? (<tr><td colSpan={4} className="p-4 text-center">No Exams Mapped</td></tr>) : (
                                group.exams.map((e, i) => (
                                    <tr key={e.id} className={`${i % 2 ? "bg-gray-50" : "bg-white"} text-sm`}>
                                        <td className="p-2 text-center">{i + 1}</td>
                                        <td className="p-2">{e.name}</td>
                                        <td className="p-2 text-center">{e.marks}</td>
                                        <td className="p-2 text-center">{e.conversionRequired ? '✔' : '✖'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="w-fit flex justify-center mt-4">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
