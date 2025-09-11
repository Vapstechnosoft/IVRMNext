import type { Role } from '@/constants';

export interface NavItem {
    id?: number;
    name: string;
    href?: string;
    description?: string;
    icon?: string;
    items?: NavItem[];
}

export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
}

export interface DataTableFilterField<TData> {
    id: keyof TData;
    label: string;
    placeholder?: string;
    options?: Option[];
}

export type UserResponseData = {
    user: string;
    role: Role;
    designation: string;
    email: string;
    token: string;
    user_image: string | null;
    navItems: NavItem[] | [];
    [key: string]: any;
};

export type ApiSearchparams = {
    page?: number;
    page_size?: number;
    search_query?: string;
    sort_column?: string;
    sort_direction?: string;
};

export interface IUserAccessibleMenus {
    menu_name: string;
    icon: string;
    pages: IUserAccessiblePages[];
}

export interface IUserAccessiblePages {
    name: string;
    url: string;
}
