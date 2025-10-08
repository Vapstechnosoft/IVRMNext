import { ROUTES } from '@/constants/routes';
import { redirect } from 'next/navigation';

export default function page() {
    redirect(`${ROUTES.FEES.MASTERS}${ROUTES.FEES.MASTERS_SUB_MENUS.MASTERS_CLASS}`);
}
