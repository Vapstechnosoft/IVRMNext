import { ROUTES } from '@/constants/routes';
import { redirect } from 'next/navigation';

export default function page() {
    redirect(`${ROUTES.ADMISSION.MASTERS}${ROUTES.ADMISSION.MASTERS_SUB_MENUS.MASTERS_CLASS}`);
}
