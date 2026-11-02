"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Product",
    href: "/product",
    icon: Icon.Package,
    permission: ["VIEW_PRODUCT", "MANAGE_PRODUCT"],
  },
  {
    label: "Ingredient",
    href: "/ingredient",
    icon: Icon.FlaskConical,
    permission: ["VIEW_INGREDIENT", "MANAGE_INGREDIENT"],
  },
  {
    label: "Brand",
    href: "/brand",
    icon: Icon.Sparkles,
    permission: ["VIEW_BRAND", "MANAGE_BRAND"],
  },
  {
    label: "Category",
    href: "/category",
    icon: Icon.Layers,
    permission: ["VIEW_CATEGORY", "MANAGE_CATEGORY"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  return (
    <div>
      <aside className="hidden h-screen sticky top-0 w-72 shrink-0 flex-col bg-white px-6 py-8 md:flex border-r border-[#e6eff2]">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-sm">
            <Icon.Droplet size={18} fill="white" />
          </div>
          <span className="text-xl font-extrabold">
            <span className="text-[#1C3A50]">Your</span>
            <span className="text-[#EA5D99]">Skin</span>
          </span>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mb-6 rounded-2xl bg-[#f5f9fb] p-3.5 border border-[#e1edf2]">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-skin-blue text-white font-bold text-xs uppercase shadow-xs">
                {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-bold text-[#17324A]">
                  {user.full_name || user.email.split("@")[0]}
                </p>
                <span className="inline-block rounded-full bg-skin-sky px-2 py-0.5 text-[10px] font-semibold text-skin-blue">
                  {user.role || "ADMIN"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items (Dinamis sesuai Permission User) */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {NAV_ITEMS.filter(
            (item) => !item.permission || hasPermission(item.permission)
          ).map((item) => {
            const isActive = item.href === pathname;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#D7EEEF] text-[#17324A]"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ItemIcon
                  size={18}
                  className={isActive ? "text-[#2F8FB8]" : "text-gray-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="mt-auto flex flex-col gap-1.5 border-t border-gray-100 pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Icon.Home size={18} className="text-gray-400" />
            Back to Home
          </Link>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <Icon.LogOut size={18} className="text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}
