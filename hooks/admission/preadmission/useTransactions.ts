import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCasteDropdown,
    getCountryDropdown,
    getGenderDropdown,
    getPreadmissionClassDropdown,
    getPreadmissionDocumentDropdown,
    getReferenceDropdown,
    getReligionDropdown,
    getSourceDropdown,
    getStateDropdown
} from '@/server/admission/preadmission/transactions/application_form';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useReligionDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.RELIGION_DROPDOWN],
            queryFn: async () => getReligionDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.RELIGION_DROPDOWN]
            });
        }
    };
};

export const useCasteDropdown = (religion_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.CASTE_DROPDOWN, religion_id],
            queryFn: async () => getCasteDropdown(religion_id),
            staleTime: 0,
            enabled: !!religion_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.CASTE_DROPDOWN]
            });
        }
    };
};

export const useCountryDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.COUNTRY_DROPDOWN],
            queryFn: async () => getCountryDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.COUNTRY_DROPDOWN]
            });
        }
    };
};

export const useStateDropdown = (country_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.STATE_DROPDOWN, country_id],
            queryFn: async () => getStateDropdown(country_id),
            staleTime: 0,
            enabled: !!country_id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.STATE_DROPDOWN]
            });
        }
    };
};

export const useGenderDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.GENDER_DROPDOWN],
            queryFn: async () => getGenderDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.GENDER_DROPDOWN]
            });
        }
    };
};

export const useSourceDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.SOURCE_DROPDOWN],
            queryFn: async () => getSourceDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.SOURCE_DROPDOWN]
            });
        }
    };
};

export const useReferenceDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.REFERENCE_DROPDOWN],
            queryFn: async () => getReferenceDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.REFERENCE_DROPDOWN]
            });
        }
    };
};

export const usePreadmissionDocumentsDropdown = (mi_id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_DOCUMENTS_DROPDOWN, mi_id],
            queryFn: async () => getPreadmissionDocumentDropdown(mi_id),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_DOCUMENTS_DROPDOWN]
            });
        }
    };
};

export const usePreadmissionClassDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_CLASS_DROPDOWN],
            queryFn: async () => getPreadmissionClassDropdown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_CLASS_DROPDOWN]
            });
        }
    };
};
