'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OtherDetailsTabProps {
    formData: any;
    setFormData: (data: any) => void;
}

export const OtherDetailsTab = ({ formData, setFormData }: OtherDetailsTabProps) => {
    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Year when Student Joined */}
                <div className="space-y-2">
                    <Label htmlFor="academic_year_join">Academic Year when Student Joined</Label>
                    <Input
                        id="academic_year_join"
                        value={formData.academic_year_join || ''}
                        onChange={(e) => handleChange('academic_year_join', e.target.value)}
                        placeholder="e.g. 2020-2021"
                    />
                </div>

                {/* Language Studied */}
                <div className="space-y-2">
                    <Label htmlFor="language_stud">Language Studied</Label>
                    <Input
                        id="language_stud"
                        value={formData.language_stud || ''}
                        onChange={(e) => handleChange('language_stud', e.target.value)}
                        placeholder="e.g. English, Hindi"
                    />
                </div>

                {/* Class Studied */}
                <div className="space-y-2">
                    <Label htmlFor="last_class">Class in which Student was studying</Label>
                    <Input
                        id="last_class"
                        value={formData.last_class || ''}
                        onChange={(e) => handleChange('last_class', e.target.value)}
                    />
                </div>

                {/* Subjects Studied */}
                <div className="space-y-2">
                    <Label htmlFor="subjects_stud">Subjects Studied</Label>
                    <Input
                        id="subjects_stud"
                        value={formData.subjects_stud || ''}
                        onChange={(e) => handleChange('subjects_stud', e.target.value)}
                    />
                </div>

                {/* Extra Curricular Activities */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="extracurricular">Extra Curricular Activities</Label>
                    <Textarea
                        id="extracurricular"
                        value={formData.extracurricular || ''}
                        onChange={(e) => handleChange('extracurricular', e.target.value)}
                    />
                </div>

                {/* Games Played */}
                <div className="space-y-2 col-span-full">
                    <Label htmlFor="games_played">Games Played</Label>
                    <Textarea
                        id="games_played"
                        value={formData.games_played || ''}
                        onChange={(e) => handleChange('games_played', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
