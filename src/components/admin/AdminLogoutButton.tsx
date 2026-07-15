"use client";

// src/components/admin/AdminLogoutButton.tsx

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-medium text-gray-400 hover:text-gray-600"
    >
      로그아웃
    </button>
  );
}
