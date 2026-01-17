'use client';

import type { IMasterCompetitionLevel } from '@/types/sports/masters/competition-level';
import AddMasterCompetitionLevelForm from './add-form';

export default function UpdateMasterCompetitionLevelForm({
    selectedRow,
    onSuccess
}: {
    selectedRow: IMasterCompetitionLevel;
    onSuccess: () => void;
}) {
    return <AddMasterCompetitionLevelForm selectedRow={selectedRow} onSuccess={onSuccess} />;
}
