"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Chip, buttonVariants } from "@heroui/react";
import { Menu, X, Sprout, ArrowRight, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Brand({ size = 19 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-skin-ink">
      <span className="grid size-8 place-items-center rounded-xl bg-skin-blue text-white shadow-sm">
        <Sprout size={size - 3} />
      </span>
      <span>
        Your<span className="text-skin-blue">Skin</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[#e6eff2] bg-[#f8fcfdeb] backdrop-blur-md md:h-[74px]">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-5 md:px-8">
        <Brand />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-skin-ink md:flex">
          <Link
            href="/catalog"
            className="transition-colors hover:text-skin-blue"
          >
            Product Catalog
          </Link>
          <Link
            href="/ai-camera"
            className="flex items-center gap-1.5 transition-colors hover:text-skin-blue"
          >
            Check Your Skin
            <Chip size="sm" color="accent" variant="soft">
              NEW
            </Chip>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/brand"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Admin Space <ArrowRight size={14} />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onPress={logout}
                className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign In <ArrowRight size={14} />
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <Button
          isIconOnly
          variant="ghost"
          aria-label="Toggle navigation"
          className="md:hidden"
          onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e6eff2] bg-white px-6 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-skin-ink">
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 transition-colors hover:text-skin-blue"
            >
              Product Catalog
            </Link>
            <Link
              href="/ai-camera"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-1 transition-colors hover:text-skin-blue"
            >
              <span>Check Your Skin</span>
              <Chip size="sm" color="accent" variant="soft">
                NEW
              </Chip>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/brand"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} justify-center`}
                >
                  Admin Space <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 py-1 text-sm font-semibold text-rose-600"
                >
                  <LogOut size={16} /> Sign Out ({user?.email || "User"})
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} justify-center`}
              >
                Sign In <ArrowRight size={14} />
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
