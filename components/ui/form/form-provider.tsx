// 'use client';

// import { type ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';

// interface FormContextType<T = any> {
//     // Form states
//     isAddFormOpen: boolean;
//     isEditFormOpen: boolean;
//     isToggleFormOpen: boolean;
//     isDeleteFormOpen: boolean;
//     selectedRow: T | null;

//     // Actions
//     openAddForm: () => void;
//     closeAddForm: () => void;
//     openEditForm: (row: T) => void;
//     closeEditForm: () => void;
//     openToggleForm: (row: T) => void;
//     closeToggleForm: () => void;
//     openDeleteForm: (row: T) => void;
//     closeDeleteForm: () => void;
//     closeAllForms: () => void;

//     // Refs for scrolling
//     addFormRef: React.RefObject<HTMLDivElement>;
//     editFormRef: React.RefObject<HTMLDivElement>;
// }

// const FormContext = createContext<FormContextType | null>(null);

// interface FormProviderProps {
//     children: ReactNode;
//     scrollToForm?: boolean;
//     scrollToTopOnClose?: boolean;
// }

// export function FormProvider<T = any>({ children, scrollToForm = true, scrollToTopOnClose = true }: FormProviderProps) {
//     const [isAddFormOpen, setIsAddFormOpen] = useState(false);
//     const [isEditFormOpen, setIsEditFormOpen] = useState(false);
//     const [isToggleFormOpen, setIsToggleFormOpen] = useState(false);
//     const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
//     const [selectedRow, setSelectedRow] = useState<T | null>(null);

//     const addFormRef = useRef<HTMLDivElement>(null);
//     const editFormRef = useRef<HTMLDivElement>(null);

//     const scrollToElement = useCallback(
//         (ref: React.RefObject<HTMLDivElement>) => {
//             if (scrollToForm) {
//                 setTimeout(() => {
//                     ref.current?.scrollIntoView({
//                         behavior: 'smooth',
//                         block: 'end'
//                     });
//                 }, 100);
//             }
//         },
//         [scrollToForm]
//     );

//     const scrollToTop = useCallback(() => {
//         if (scrollToTopOnClose) {
//             window.scrollTo({
//                 top: 0,
//                 behavior: 'smooth'
//             });
//         }
//     }, [scrollToTopOnClose]);

//     const closeAllForms = useCallback(() => {
//         setIsAddFormOpen(false);
//         setIsEditFormOpen(false);
//         setIsToggleFormOpen(false);
//         setIsDeleteFormOpen(false);
//         setSelectedRow(null);
//         scrollToTop();
//     }, [scrollToTop]);

//     const openAddForm = useCallback(() => {
//         closeAllForms();
//         setIsAddFormOpen(true);
//         scrollToElement(addFormRef);
//     }, [closeAllForms, scrollToElement]);

//     const closeAddForm = useCallback(() => {
//         setIsAddFormOpen(false);
//         scrollToTop();
//     }, [scrollToTop]);

//     const openEditForm = useCallback(
//         (row: T) => {
//             closeAllForms();
//             setSelectedRow(row);
//             setIsEditFormOpen(true);
//             scrollToElement(editFormRef);
//         },
//         [closeAllForms, scrollToElement]
//     );

//     const closeEditForm = useCallback(() => {
//         setIsEditFormOpen(false);
//         setSelectedRow(null);
//         scrollToTop();
//     }, [scrollToTop]);

//     const openToggleForm = useCallback((row: T) => {
//         setSelectedRow(row);
//         setIsToggleFormOpen(true);
//     }, []);

//     const closeToggleForm = useCallback(() => {
//         setIsToggleFormOpen(false);
//         setSelectedRow(null);
//         scrollToTop();
//     }, [scrollToTop]);

//     const openDeleteForm = useCallback((row: T) => {
//         setSelectedRow(row);
//         setIsDeleteFormOpen(true);
//     }, []);

//     const closeDeleteForm = useCallback(() => {
//         setIsDeleteFormOpen(false);
//         setSelectedRow(null);
//         scrollToTop();
//     }, [scrollToTop]);

//     return (
//         <FormContext.Provider
//             value={{
//                 isAddFormOpen,
//                 isEditFormOpen,
//                 isToggleFormOpen,
//                 isDeleteFormOpen,
//                 selectedRow,
//                 openAddForm,
//                 closeAddForm,
//                 openEditForm,
//                 closeEditForm,
//                 openToggleForm,
//                 closeToggleForm,
//                 openDeleteForm,
//                 closeDeleteForm,
//                 closeAllForms,
//                 addFormRef,
//                 editFormRef
//             }}>
//             {children}
//         </FormContext.Provider>
//     );
// }

// export function useFormContext<T = any>() {
//     const context = useContext(FormContext) as FormContextType<T> | null;
//     if (!context) {
//         throw new Error('useFormContext must be used within a FormProvider');
//     }
//     return context;
// }

'use client';

import { type ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';

interface FormContextType<T = any> {
    // Form states
    isAddFormOpen: boolean;
    isEditFormOpen: boolean;
    isToggleFormOpen: boolean;
    isDeleteFormOpen: boolean;
    isDetailsViewOpen: boolean; // 👈 New for Grade details view
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
    openDetailsView: (row: T) => void; // 👈 New action
    closeDetailsView: () => void; // 👈 New action
    closeAllForms: () => void;

    // Refs for scrolling
    addFormRef: React.RefObject<HTMLDivElement>;
    editFormRef: React.RefObject<HTMLDivElement>;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
    children: ReactNode;
    scrollToForm?: boolean;
    scrollToTopOnClose?: boolean;
    scrollIntoViewDirection?: 'start' | 'center' | 'end' | 'nearest';
}

export function FormProvider<T = any>({
    children,
    scrollToForm = true,
    scrollToTopOnClose = true,
    scrollIntoViewDirection = 'end'
}: FormProviderProps) {
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isToggleFormOpen, setIsToggleFormOpen] = useState(false);
    const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
    const [isDetailsViewOpen, setIsDetailsViewOpen] = useState(false); // 👈 New state
    const [selectedRow, setSelectedRow] = useState<T | null>(null);

    const addFormRef = useRef<HTMLDivElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);

    const scrollToElement = useCallback(
        (ref: React.RefObject<HTMLDivElement>) => {
            if (scrollToForm) {
                setTimeout(() => {
                    ref.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: scrollIntoViewDirection
                    });
                }, 100);
            }
        },
        [scrollToForm]
    );

    const scrollToTop = useCallback(() => {
        if (scrollToTopOnClose) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [scrollToTopOnClose]);

    const closeAllForms = useCallback(() => {
        setIsAddFormOpen(false);
        setIsEditFormOpen(false);
        setIsToggleFormOpen(false);
        setIsDeleteFormOpen(false);
        setIsDetailsViewOpen(false); // 👈 Close details view also
        setSelectedRow(null);
        scrollToTop();
    }, [scrollToTop]);

    const openAddForm = useCallback(() => {
        closeAllForms();
        setIsAddFormOpen(true);
        scrollToElement(addFormRef);
    }, [closeAllForms, scrollToElement]);

    const closeAddForm = useCallback(() => {
        setIsAddFormOpen(false);
        scrollToTop();
    }, [scrollToTop]);

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
        scrollToTop();
    }, [scrollToTop]);

    const openToggleForm = useCallback((row: T) => {
        setSelectedRow(row);
        setIsToggleFormOpen(true);
    }, []);

    const closeToggleForm = useCallback(() => {
        setIsToggleFormOpen(false);
        setSelectedRow(null);
        scrollToTop();
    }, [scrollToTop]);

    const openDeleteForm = useCallback((row: T) => {
        setSelectedRow(row);
        setIsDeleteFormOpen(true);
    }, []);

    const closeDeleteForm = useCallback(() => {
        setIsDeleteFormOpen(false);
        setSelectedRow(null);
        scrollToTop();
    }, [scrollToTop]);

    // 👇 New methods for Grade Details View
    const openDetailsView = useCallback(
        (row: T) => {
            closeAllForms();
            setSelectedRow(row);
            setIsDetailsViewOpen(true);
        },
        [closeAllForms]
    );

    const closeDetailsView = useCallback(() => {
        setIsDetailsViewOpen(false);
        setSelectedRow(null);
        scrollToTop();
    }, [scrollToTop]);

    return (
        <FormContext.Provider
            value={{
                isAddFormOpen,
                isEditFormOpen,
                isToggleFormOpen,
                isDeleteFormOpen,
                isDetailsViewOpen, // 👈 Include this
                selectedRow,
                openAddForm,
                closeAddForm,
                openEditForm,
                closeEditForm,
                openToggleForm,
                closeToggleForm,
                openDeleteForm,
                closeDeleteForm,
                openDetailsView, // 👈 Include this
                closeDetailsView, // 👈 Include this
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
