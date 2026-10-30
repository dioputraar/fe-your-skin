import { Brand } from "./Navbar";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e6eff2] bg-white py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-skin-muted md:px-8">
        <Brand size={17} />
        <span className="text-center text-xs text-skin-muted md:text-sm">
          Finding what works takes time. Be gentle with yourself.
        </span>
        <span className="text-xs text-skin-muted">
          © {new Date().getFullYear()} YourSkin. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

