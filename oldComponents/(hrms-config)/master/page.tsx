"use client";
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `${ROUTES.HRMS.MASTERS}${ROUTES.HRMS.MASTERS_SUB_MENUS.EMPLOYEE_CATEGORY}`
    );
  }, [router]);

  return <div>Redirecting...</div>;
}
