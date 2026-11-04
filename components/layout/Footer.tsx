import { Brand } from "./Navbar";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e6eff2] bg-white py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 text-sm text-skin-muted md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Brand size={17} />
          <span className="text-center text-xs text-skin-muted md:text-sm">
            Finding what works takes time. Be gentle with yourself.
          </span>
          <span className="text-xs text-skin-muted">
            © {new Date().getFullYear()} YourSkin. All rights reserved.
          </span>
        </div>

        <div className="border-t border-[#eef4f6] pt-4 text-center text-xs leading-relaxed text-skin-muted/80">
          <strong className="font-semibold text-skin-ink">Disclaimer:</strong>{" "}
          Website ini merupakan proyek tiruan (dummy project) yang dibuat khusus
          untuk keperluan portofolio dan demonstrasi teknis non-komersial.
          Website ini tidak berafiliasi, disponsori, atau terafiliasi resmi
          dengan PT Paragon Technology and Innovation. Seluruh hak merek dan
          materi dagang tetap dimiliki oleh ParagonCorp.
        </div>
      </div>
    </footer>
  );
}

