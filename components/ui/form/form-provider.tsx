'use client';

import { createContext, useContext, useState, useCallback, type ReactNode, useRef } from 'react';

interface FormContextType<T = any> {
    // Form states
    isAddFormOpen: boolean;
    isEditFormOpen: boolean;
    isToggleFormOpen: boolean;
    isDeleteFormOpen: boolean;
    selectedRow: T | null;

    // Actions
    openAddForm: () => void;
    closeAddForm: () => void;
    openEditForm: (row: T) => void;
    closeEditForm: () => void;
    openToggleForm: (row: T) => void;
    closeToggleForm: () => void;
    openDeleteForm: (row: T) => void;
    closeDeleteForm: () => void;
    closeAllForms: () => void;

    // Refs for scrolling
    addFormRef: React.RefObject<HTMLDivElement>;
    editFormRef: React.RefObject<HTMLDivElement>;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
    children: ReactNode;
    scrollToForm?: boolean; // Optional scroll behavior
}

export function FormProvider<T = any>({ children, scrollToForm = true }: FormProviderProps) {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isToggleFormOpen, setIsToggleFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<T | null>(null);

    const addFormRef = useRef<HTMLDivElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    const scrollToElement = useCallback(
        (ref: React.RefObject<HTMLDivElement>) => {
            if (scrollToForm) {
                setTimeout(() => {
                    ref.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    });
                }, 100);
            }
        },
        [scrollToForm]
    );

    const closeAllForms = useCallback(() => {
        setIsAddFormOpen(false);
        setIsEditFormOpen(false);
        setIsToggleFormOpen(false);
        setIsDeleteFormOpen(false);
        setSelectedRow(null);
    }, []);

    const openAddForm = useCallback(() => {
        closeAllForms();
        setIsAddFormOpen(true);
        scrollToElement(addFormRef);
    }, [closeAllForms, scrollToElement]);

    const closeAddForm = useCallback(() => {
        setIsAddFormOpen(false);
    }, []);

    const openEditForm = useCallback(
        (row: T) => {
            closeAllForms();
            setSelectedRow(row);
            setIsEditFormOpen(true);
            scrollToElement(editFormRef);
        },
        [closeAllForms, scrollToElement]
    );

    const closeEditForm = useCallback(() => {
        setIsEditFormOpen(false);
        setSelectedRow(null);
    }, []);

    const openToggleForm = useCallback((row: T) => {
        setSelectedRow(row);
        setIsToggleFormOpen(true);
    }, []);

    const closeToggleForm = useCallback(() => {
        setIsToggleFormOpen(false);
        setSelectedRow(null);
    }, []);

    const openDeleteForm = useCallback((row: T) => {
        setSelectedRow(row);
        setIsDeleteFormOpen(true);
    }, []);

    const closeDeleteForm = useCallback(() => {
        setIsDeleteFormOpen(false);
        setSelectedRow(null);
    }, []);

    return (
        <FormContext.Provider
            value={{
                isAddFormOpen,
                isEditFormOpen,
                isToggleFormOpen,
                isDeleteFormOpen,
                selectedRow,
                openAddForm,
                closeAddForm,
                openEditForm,
                closeEditForm,
                openToggleForm,
                closeToggleForm,
                openDeleteForm,
                closeDeleteForm,
                closeAllForms,
                addFormRef,
                editFormRef
            }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext<T = any>() {
    const context = useContext(FormContext) as FormContextType<T> | null;
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
}
