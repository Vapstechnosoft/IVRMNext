'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useRef } from 'react';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';

interface FormContextType {
    // Form states
    isAddFormOpen: boolean;
    isEditFormOpen: boolean;
    isToggleFormOpen: boolean;
    selectedRow: IMasterClassList | null;

    // Actions
    openAddForm: () => void;
    closeAddForm: () => void;
    openEditForm: (row: IMasterClassList) => void;
    closeEditForm: () => void;
    openToggleForm: (row: IMasterClassList) => void;
    closeToggleForm: () => void;
    closeAllForms: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isToggleFormOpen, setIsToggleFormOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IMasterClassList | null>(null);

    const addFormRef = useRef<HTMLDivElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    const closeAllForms = useCallback(() => {
        setIsAddFormOpen(false);
        setIsEditFormOpen(false);
        setIsToggleFormOpen(false);
        setSelectedRow(null);
    }, []);

    const openAddForm = useCallback(() => {
        closeAllForms();
        setIsAddFormOpen(true);
        setTimeout(() => {
            addFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    }, [closeAllForms]);

    const closeAddForm = useCallback(() => {
        setIsAddFormOpen(false);
    }, []);

    const openEditForm = useCallback(
        (row: IMasterClassList) => {
            closeAllForms();
            setSelectedRow(row);
            setIsEditFormOpen(true);
            setTimeout(() => {
                editFormRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
            }, 100);
        },
        [closeAllForms]
    );

    const closeEditForm = useCallback(() => {
        setIsEditFormOpen(false);
        setSelectedRow(null);
    }, []);

    const openToggleForm = useCallback((row: IMasterClassList) => {
        setSelectedRow(row);
        setIsToggleFormOpen(true);
    }, []);

    const closeToggleForm = useCallback(() => {
        setIsToggleFormOpen(false);
        setSelectedRow(null);
    }, []);

    return (
        <FormContext.Provider
            value={{
                isAddFormOpen,
                isEditFormOpen,
                isToggleFormOpen,
                selectedRow,
                openAddForm,
                closeAddForm,
                openEditForm,
                closeEditForm,
                openToggleForm,
                closeToggleForm,
                closeAllForms
            }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
}
