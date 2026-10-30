import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Product", href: "/product", icon: Icon.Package },
    { label: "Ingredient", href: "/ingredient", icon: Icon.FlaskConical },
    { label: "Brand", href: "/brand", icon: Icon.Sparkles },
    { label: "Category", href: "/category", icon: Icon.Layers },
];

export default function Sidebar() {
    return (
        <div>
            {/* --- Sidebar (akan dipecah jadi <Sidebar /> nanti) --- */}
            <aside className="hidden w-72 shrink-0 flex-col bg-white px-6 py-8 md:flex">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-sm active">
                        <Icon.Droplet size={18} fill="white" />
                    </div>
                    <span className="text-xl font-extrabold">
                        <span className="text-[#1C3A50]">Your</span>
                        <span className="text-[#EA5D99]">Skin</span>
                    </span>
                </div>
                {/* 
                <span className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Ruang kerja
                </span> */}

                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href === usePathname();
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${isActive
                                    ? "bg-[#D7EEEF] text-[#17324A]"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-[#2F8FB8]" : "text-gray-400"} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom links */}
                <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50"
                    >
                        <Icon.Home size={18} className="text-gray-400" />
                        Back to Home
                    </Link>
                    {/* <span className="px-3 text-xs text-gray-400">Konten YourSkin</span> */}
                </div>
            </aside>
        </div>
    )
}