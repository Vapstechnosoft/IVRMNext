import type { ActiveNavigation } from './navigation-system';

// Internal shared state
const navigationContext: {
    activeNavigation: ActiveNavigation | null;
    setActiveNavigation: (nav: ActiveNavigation | null) => void;
    requestedModule: string | null;
    setRequestedModule: (moduleName: string | null) => void;
    moduleFilter: string | null;
    setModuleFilter: (filter: string | null) => void;
    isFilteredOnly: boolean;
} = {
    activeNavigation: null,
    setActiveNavigation: () => { },
    requestedModule: null,
    setRequestedModule: () => { },
    moduleFilter: null,
    setModuleFilter: () => { },
    isFilteredOnly: false
};

// Hook for NavigationSystem to update the state
export function setNavigationContext(nav: ActiveNavigation | null) {
    navigationContext.activeNavigation = nav;
}

export function setRequestedModule(moduleName: string | null) {
    navigationContext.requestedModule = moduleName;
    window.dispatchEvent(new CustomEvent('module-request', { detail: moduleName }));
}

export function setModuleFilter(filter: string | null) {
    navigationContext.moduleFilter = filter;
    window.dispatchEvent(new CustomEvent('module-filter', { detail: filter }));
}

// API for PageNavigation (and anywhere else) to read it
export function getNavigationContext() {
    return navigationContext;
}
