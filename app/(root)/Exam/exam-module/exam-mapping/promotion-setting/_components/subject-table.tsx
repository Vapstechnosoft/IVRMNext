'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GroupItem, SubjectRow } from '../../promotion-setting/_components/add-from';

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

    const [selectedExamIds, setSelectedExamIds] = useState<Record<number, boolean>>({});

    const toggleSelectExam = (id: number) => setSelectedExamIds((p) => ({ ...p, [id]: !(p[id] ?? false) }));

    const handleAdd = () => {
        if (!groupName || !displayName) {
            toast.error('Group Name & Display Name Required');
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
            exams: leftExams
                .filter((e) => selectedExamIds[e.id])
                .map((e) => ({
                    id: e.id,
                    name: e.name,
                    marks: Math.floor(Math.random() * 100),
                    conversionRequired: false
                }))
        });

        setGroupName('');
        setDisplayName('');
        setPercentage(0);
        setMarks(0);
        setBestOff(0);
        setMaxOff(0);
        setSelectedExamIds({});
        setGroupOrder((o) => o + 1);
    };

    return (
        <div className='fixed inset-0 z-[9990] flex items-start justify-center p-6'>
            <div className='absolute inset-0 bg-black/50' onClick={onClose} />

            <div className='relative z-[9991] w-[95%] max-w-6xl overflow-hidden rounded-xl border bg-white shadow-xl md:w-[90%]'>
                {/* HEADER */}
                <div className='flex items-center justify-between bg-gray-100 px-4 py-2 font-semibold text-lg'>
                    <span>{subject.name.toUpperCase()} - GROUP MAPPING</span>
                    <Button variant='ghost' onClick={onClose} className='p-1 hover:bg-white/20'>
                        <X className='h-5 w-5' />
                    </Button>
                </div>

                <div className='grid grid-cols-1 gap-6 p-5 md:grid-cols-2'>
                    {/* LEFT EXAM TABLE */}
                    <div className='overflow-hidden rounded border shadow-sm'>
                        <table className='min-w-full border-collapse'>
                            <thead className='bg-gray-100 text-sm'>
                                <tr>
                                    <th className='w-12 p-2'>Select</th>
                                    <th className='p-2'>Exam Name</th>
                                    <th className='w-40 p-2'>Converted Marks</th>
                                    <th className='w-36 p-2'>Required?</th>
                                </tr>
                            </thead>

                            <tbody>
                                {leftExams.map((e, i) => (
                                    <tr key={e.id} className={`${i % 2 ? 'bg-gray-50' : 'bg-white'} text-sm`}>
                                        <td className='p-2 text-center'>
                                            <Checkbox checked={!!selectedExamIds[e.id]} onCheckedChange={() => toggleSelectExam(e.id)} />
                                        </td>
                                        <td className='p-2'>{e.name}</td>
                                        <td className='p-2'>
                                            <Input placeholder='Enter marks' />
                                        </td>
                                        <td className='p-2 text-center'>
                                            <Checkbox />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT FORM */}
                    <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <Label>Marks</Label>
                                <Input type='number' value={marks} onChange={(e) => setMarks(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Max Off</Label>
                                <Input type='number' value={maxOff} onChange={(e) => setMaxOff(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Percentage *</Label>
                                <Input type='number' value={percentage} onChange={(e) => setPercentage(+e.target.value)} />
                            </div>
                            <div>
                                <Label>Best Off *</Label>
                                <Input type='number' value={bestOff} onChange={(e) => setBestOff(+e.target.value)} />
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
                                <Input type='number' value={groupOrder} onChange={(e) => setGroupOrder(+e.target.value)} />
                            </div>

                            <div className='mt-7 flex items-center gap-2'>
                                <Checkbox checked={roundOff} onCheckedChange={() => setRoundOff(!roundOff)} />
                                <Label>Round Off Required</Label>
                            </div>
                        </div>

                        <div className='flex w-fit justify-end gap-3'>
                            <Button onClick={handleAdd}>
                                <Plus className='mr-2 h-4 w-4' />
                                Add
                            </Button>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setGroupName('');
                                    setDisplayName('');
                                    setSelectedExamIds({});
                                }}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {groups.length > 0 && (
                    <div className='border-t p-4'>
                        <table className='min-w-full border-collapse border'>
                            <thead className='bg-gray-100 text-sm'>
                                <tr>
                                    <th className='p-2'>#</th>
                                    <th className='p-2'>Group</th>
                                    <th className='p-2'>Display</th>
                                    <th className='p-2'>%</th>
                                    <th className='p-2'>Marks</th>
                                    <th className='p-2'>Max</th>
                                    <th className='p-2'>Best</th>
                                    <th className='p-2'>Order</th>
                                    <th className='p-2'>Exams</th>
                                    <th className='p-2'>Round</th>
                                    <th className='p-2'>Remove</th>
                                </tr>
                            </thead>

                            <tbody className="[&>tr:hover>td]:!bg-accent/90" >
                                {groups.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className='p-3 text-center'>
                                            No Groups Added
                                        </td>
                                    </tr>
                                ) : (
                                    groups.map((g, i) => (
                                        <tr
                                            key={g.id}
                                            className={`
                                                ${i % 2 ? 'bg-gray-50' : 'bg-white'}
                                                hover:[&>td]:!bg-accent/90
                                                text-sm transition-colors
                                            `}
                                        >

                                            <td className='p-2 text-center'>{i + 1}</td>
                                            <td className='p-2'>{g.groupName}</td>
                                            <td className='p-2'>{g.displayName}</td>
                                            <td className='p-2 text-center'>{g.percentage}</td>
                                            <td className='p-2 text-center'>{g.marks}</td>
                                            <td className='p-2 text-center'>{g.maxOff}</td>
                                            <td className='p-2 text-center'>{g.bestOff}</td>
                                            <td className='p-2 text-center'>{g.order}</td>
                                            <td className='p-2 text-center'>
                                                <Button size='sm' variant='ghost' onClick={() => onOpenExams(g)}>
                                                    <Eye className='h-4 w-4 text-blue-600' />
                                                </Button>
                                            </td>
                                            <td className='p-2 text-center'>{g.roundOffFlag ? '✔' : ''}</td>
                                            <td className='p-2 text-center'>
                                                <Button variant='ghost'>
                                                    <X className='h-4 w-4 text-red-600' />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className='mt-4 flex w-fit justify-center'>
                            <Button onClick={onClose}>Submit & Close</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export function ViewExamsModal({ group, onClose }: { group: GroupItem; onClose: () => void }) {
    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center p-6'>
            <div className='absolute inset-0 bg-black/50' onClick={onClose} />

            <div className='relative z-[10000] w-[90%] max-w-xl overflow-hidden rounded-xl border bg-white shadow-xl'>
                <div className='flex items-center justify-between bg-gray-100 px-4 py-2 font-semibold text-lg'>
                    <span>{group.displayName} — EXAM MAPPING</span>
                    <Button variant='ghost' onClick={onClose} className='w-fit p-1 hover:bg-white/20'>
                        Close <X className='h-5 w-5' />
                    </Button>
                </div>

                <div className='p-4'>
                    <table className='min-w-full border'>
                        <thead className='bg-gray-100 text-sm'>
                            <tr>
                                <th className='w-10 p-2'>#</th>
                                <th className='p-2'>Exam Name</th>
                                <th className='w-20 p-2'>Marks</th>
                                <th className='w-32 p-2'>Conversion?</th>
                            </tr>
                        </thead>

                        <tbody>
                            {group.exams.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className='p-4 text-center'>
                                        No Exams Mapped
                                    </td>
                                </tr>
                            ) : (
                                group.exams.map((e, i) => (
                                    <tr key={e.id} className={`${i % 2 ? 'bg-gray-50' : 'bg-white'} text-sm`}>
                                        <td className='p-2 text-center'>{i + 1}</td>
                                        <td className='p-2'>{e.name}</td>
                                        <td className='p-2 text-center'>{e.marks}</td>
                                        <td className='p-2 text-center'>{e.conversionRequired ? '✔' : '✖'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className='mt-4 flex w-fit justify-center'>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
