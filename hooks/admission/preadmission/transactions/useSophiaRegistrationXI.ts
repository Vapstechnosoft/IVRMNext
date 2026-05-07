import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { server } from '@/server/admission/preadmission/transactions/sophia_registration_xi';

export const useSophiaRegistrationXIInitialData = (orgId: number, instId: number) => {
    return useQuery({
        queryKey: ['sophiaRegistrationXIInitialData', orgId, instId],
        queryFn: () => server.getInitialData(orgId, instId),
    });
};

export const useSophiaRegistrationXICaste = () => {
    return useMutation({
        mutationFn: (imccId: number) => server.getCaste(imccId),
    });
};

export const useSophiaRegistrationXIClassChange = () => {
    return useMutation({
        mutationFn: (payload: { classId: number; asmayId: number }) => server.onClassChange(payload.classId, payload.asmayId),
    });
};

export const useSophiaRegistrationXIStreams = () => {
    return useMutation({
        mutationFn: (classId: number) => server.getStreams(classId),
    });
};

export const useSophiaRegistrationXISubjects = () => {
    return useMutation({
        mutationFn: (payload: { classId: number; asmstId: number }) => server.getSubjects(payload.classId, payload.asmstId),
    });
};

export const useSophiaRegistrationXIStates = () => {
    return useMutation({
        mutationFn: (countryId: number) => server.getStates(countryId),
    });
};

export const useSophiaRegistrationXIDistricts = () => {
    return useMutation({
        mutationFn: (stateId: number) => server.getDistricts(stateId),
    });
};

export const useSophiaRegistrationXISave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => server.saveRegistration(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        },
    });
};

export const useSophiaRegistrationXIDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => server.deleteRegistration(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        },
    });
};

export const useSophiaRegistrationXIToggleStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => server.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        },
    });
};
