import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
// components/fees/FineSlabModal.tsx
import { useEffect, useState } from 'react';

interface FineSlab {
    fmfS_Id: number;
    fmfS_FineType: string;
    fmfS_FromDay: number;
    fmfS_ToDay: number;
    fmfS_ECSFlag: string;
    ftfS_Id?: number;
    ftfS_Amount?: string;
    FTFS_FineType?: string;
    FTFSE_FineType?: string;
    ftfsE_Id?: number;
    ftfsE_Amount?: string;
    isSelected: boolean;
    fmH_Id?: number;
    ftI_Id?: number;
}

interface FineSlabModalProps {
    isOpen: boolean;
    onClose: () => void;
    headId: number;
    installmentId: number;
    feeGroupId: number;
    categoryId: number;
    academicYearId: number;
    selectionType: string; // 'stud', 'stfoth', 'stfothamt'
    onSave: (regularSlabs: FineSlab[], ecsSlabs: FineSlab[]) => void;
}

export default function FineSlabModal({
    isOpen,
    onClose,
    headId,
    installmentId,
    feeGroupId,
    categoryId,
    academicYearId,
    selectionType,
    onSave
}: FineSlabModalProps) {
    const [showRegularSlab, setShowRegularSlab] = useState(false);
    const [showEcsSlab, setShowEcsSlab] = useState(false);
    const [regularSlabs, setRegularSlabs] = useState<FineSlab[]>([]);
    const [ecsSlabs, setEcsSlabs] = useState<FineSlab[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRegular, setSelectedRegular] = useState<number[]>([]);
    const [selectedEcs, setSelectedEcs] = useState<number[]>([]);

    const fineTypeOptions = [
        { value: 'Per Day', label: 'Per Day' },
        { value: 'Day Slab', label: 'Day Slab' }
    ];

    // Fetch fine slabs when modal opens
    useEffect(() => {
        if (isOpen && headId && installmentId) {
            fetchFineSlabs();
        }
    }, [isOpen, headId, installmentId]);

    const fetchFineSlabs = async () => {
        setLoading(true);
        try {
            // This would be your API call - you'll need to implement this
            const response = await fetchFineSlabDetails({
                fmG_Id: feeGroupId,
                fmcC_Id: categoryId,
                asmaY_Id: academicYearId,
                fmH_Id: headId,
                ftI_Id: installmentId,
                selectiontype: selectionType
            });

            if (response.regularSlabs) {
                setRegularSlabs(response.regularSlabs);
                setShowRegularSlab(response.regularSlabs.length > 0);

                // Initialize selected regular slabs
                const selected = response.regularSlabs.filter((slab) => slab.isSelected).map((slab) => slab.fmfS_Id);
                setSelectedRegular(selected);
            }

            if (response.ecsSlabs) {
                setEcsSlabs(response.ecsSlabs);
                setShowEcsSlab(response.ecsSlabs.length > 0);

                // Initialize selected ECS slabs
                const selected = response.ecsSlabs.filter((slab) => slab.isSelected).map((slab) => slab.fmfS_Id);
                setSelectedEcs(selected);
            }
        } catch (error) {
            console.error('Error fetching fine slabs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegularCheckboxChange = (slabId: number) => {
        setSelectedRegular((prev) => {
            if (prev.includes(slabId)) {
                return prev.filter((id) => id !== slabId);
            }
            return [...prev, slabId];
        });
    };

    const handleEcsCheckboxChange = (slabId: number) => {
        setSelectedEcs((prev) => {
            if (prev.includes(slabId)) {
                return prev.filter((id) => id !== slabId);
            }
            return [...prev, slabId];
        });
    };

    const handleFineTypeChange = (index: number, value: string, isEcs = false) => {
        if (isEcs) {
            const updated = [...ecsSlabs];
            updated[index].FTFSE_FineType = value;
            setEcsSlabs(updated);
        } else {
            const updated = [...regularSlabs];
            updated[index].FTFS_FineType = value;
            setRegularSlabs(updated);
        }
    };

    const handleAmountChange = (index: number, value: string, isEcs = false) => {
        if (isEcs) {
            const updated = [...ecsSlabs];
            updated[index].ftfsE_Amount = value;
            setEcsSlabs(updated);
        } else {
            const updated = [...regularSlabs];
            updated[index].ftfS_Amount = value;
            setRegularSlabs(updated);
        }
    };

    const handleAddToCart = () => {
        // Filter selected slabs and mark them
        const selectedRegularSlabs = regularSlabs
            .map((slab) => ({
                ...slab,
                isSelected: selectedRegular.includes(slab.fmfS_Id),
                fmH_Id: headId,
                ftI_Id: installmentId
            }))
            .filter((slab) => slab.isSelected);

        const selectedEcsSlabs = ecsSlabs
            .map((slab) => ({
                ...slab,
                isSelected: selectedEcs.includes(slab.fmfS_Id),
                fmH_Id: headId,
                ftI_Id: installmentId
            }))
            .filter((slab) => slab.isSelected);

        // Call parent save function
        onSave(selectedRegularSlabs, selectedEcsSlabs);
        onClose();
    };

    const handleCheckboxTypeChange = (type: 'regular' | 'ecs', checked: boolean) => {
        if (type === 'regular') {
            setShowRegularSlab(checked);
            if (!checked) {
                setSelectedRegular([]);
            }
        } else {
            setShowEcsSlab(checked);
            if (!checked) {
                setSelectedEcs([]);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='rounded-t-lg bg-primary p-4 text-white'>Fee Slab Details</DialogTitle>
                </DialogHeader>

                <div className='p-4'>
                    {/* Type Selection */}
                    <div className='mb-6 rounded-lg bg-gray-50 p-4 text-center'>
                        <div className='flex justify-center gap-6'>
                            <Label className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={showRegularSlab}
                                    onCheckedChange={(checked) => handleCheckboxTypeChange('regular', checked as boolean)}
                                />
                                <span className='lbl padding-8'>Regular</span>
                            </Label>
                            {selectionType === 'stud' && (
                                <Label className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={showEcsSlab}
                                        onCheckedChange={(checked) => handleCheckboxTypeChange('ecs', checked as boolean)}
                                    />
                                    <span className='lbl padding-8'>ECS</span>
                                </Label>
                            )}
                        </div>
                    </div>

                    {/* Regular Slab */}
                    {showRegularSlab && (
                        <div className='mb-8 overflow-hidden rounded-lg border'>
                            <div className='flex items-center justify-between bg-primary p-4 text-white'>
                                <h3 className='font-semibold text-lg'>Regular Slab</h3>
                            </div>
                            <div className='p-4'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SLNO</TableHead>
                                            <TableHead>Select</TableHead>
                                            <TableHead>Slab Name</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center'>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : regularSlabs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center'>
                                                    No regular slabs found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            regularSlabs.map((slab, index) => (
                                                <TableRow key={slab.fmfS_Id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedRegular.includes(slab.fmfS_Id)}
                                                            onCheckedChange={() => handleRegularCheckboxChange(slab.fmfS_Id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{slab.fmfS_FineType}</TableCell>
                                                    <TableCell>{slab.fmfS_FromDay}</TableCell>
                                                    <TableCell>{slab.fmfS_ToDay}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={slab.FTFS_FineType || ''}
                                                            onValueChange={(value) => handleFineTypeChange(index, value)}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fineTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <InputText
                                                            type='text'
                                                            value={slab.ftfS_Amount || ''}
                                                            onChange={(e) => handleAmountChange(index, e.target.value)}
                                                            placeholder='Enter Amount'
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* ECS Slab */}
                    {showEcsSlab && selectionType === 'stud' && (
                        <div className='overflow-hidden rounded-lg border'>
                            <div className='flex items-center justify-between bg-primary p-4 text-white'>
                                <h3 className='font-semibold text-lg'>ECS Slab</h3>
                            </div>
                            <div className='p-4'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SLNO</TableHead>
                                            <TableHead>Select</TableHead>
                                            <TableHead>Slab Name</TableHead>
                                            <TableHead>From</TableHead>
                                            <TableHead>To</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center'>
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : ecsSlabs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center'>
                                                    No ECS slabs found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ecsSlabs.map((slab, index) => (
                                                <TableRow key={slab.fmfS_Id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedEcs.includes(slab.fmfS_Id)}
                                                            onCheckedChange={() => handleEcsCheckboxChange(slab.fmfS_Id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{slab.fmfS_FineType}</TableCell>
                                                    <TableCell>{slab.fmfS_FromDay}</TableCell>
                                                    <TableCell>{slab.fmfS_ToDay}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={slab.FTFSE_FineType || ''}
                                                            onValueChange={(value) => handleFineTypeChange(index, value, true)}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fineTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <InputText
                                                            type='text'
                                                            value={slab.ftfsE_Amount || ''}
                                                            onChange={(e) => handleAmountChange(index, e.target.value, true)}
                                                            placeholder='Enter Amount'
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddToCart} className='gap-2'>
                        <Plus className='h-4 w-4' />
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// API function (you'll need to implement this)
async function fetchFineSlabDetails(params: any): Promise<{ regularSlabs: FineSlab[]; ecsSlabs: FineSlab[] }> {
    // Implement your API call here
    // Example:
    // const response = await apiService.create("FeeAmountEntry/getgroupmappedheads/", params);
    // return response;
    return { regularSlabs: [], ecsSlabs: [] };
}
