import Link from "next/link";
import { Button, Card, Chip, buttonVariants } from "@heroui/react";
import {
  ArrowRight,
  Camera,
  FlaskConical,
  Leaf,
  Menu,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Sprout,
} from "lucide-react";

const products = [
  { id: 1, category: "Cleanser", name: "Gentle Cloud Cleanser", brand: "YourSkin Lab", price: 89000, featured: true },
  { id: 2, category: "Serum", name: "Niacinamide 10% Serum", brand: "Daily Glow", price: 145000, featured: true },
  { id: 3, category: "Moisturizer", name: "Ceramide Barrier Cream", brand: "Calm Co.", price: 128000, featured: false },
  { id: 4, category: "Sunscreen", name: "Light Veil SPF 50", brand: "Sun Bloom", price: 99000, featured: true },
];

const ingredients = [
  { name: "Niacinamide", summary: "Evens out skin texture while gently keeping excess oil and shine in check." },
  { name: "Hyaluronic Acid", summary: "A multi-depth humectant that pulls moisture deep into the skin for bouncy hydration." },
  { name: "Ceramide", summary: "Nurtures and reinforces your skin's natural barrier so it always feels comforted." },
];

const tiles = [
  { index: "01 / PRODUCTS", title: ["Find skincare that", "feels just right."], link: "Explore catalog", bg: "bg-skin-blue-tile", Icon: FlaskConical, href: "/catalog" },
  { index: "02 / GUIDE", title: ["See your skin in", "a whole new light."], link: "Start camera check", bg: "bg-skin-pink-tile", Icon: Camera, href: "/ai-camera" },
  { index: "03 / INGREDIENTS", title: ["Understand what's", "behind the label."], link: "Read at your pace", bg: "bg-skin-green-tile", Icon: Leaf, href: "#ingredients" },
];

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const wrap = "mx-auto w-full max-w-6xl px-5 md:px-8";

function Brand({ size = 19 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-skin-ink">
      <span className="grid size-8 place-items-center rounded-xl bg-skin-blue text-white">
        <Sprout size={size - 3} />
      </span>
      <span>
        Your<span className="text-skin-blue">Skin</span>
      </span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.12em] text-skin-eyebrow">
      <span className="size-1.5 rounded-full bg-skin-pink" />
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, desc, href, cta }: { eyebrow: string; title: string; desc?: string; href: string; cta: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold text-skin-ink md:text-4xl">{title}</h2>
        {desc && <p className="mt-2 text-skin-muted">{desc}</p>}
      </div>
      <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-skin-blue hover:underline">
        {cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-30 h-16 border-b border-[#e6eff2] bg-[#f8fcfdeb] backdrop-blur-md md:h-[74px]">
        <div className={`${wrap} flex h-full items-center justify-between`}>
          <Brand />
          <nav className="hidden items-center gap-7 text-sm font-medium text-skin-ink md:flex">
            <Link href="/catalog" className="hover:text-skin-blue transition-colors">
              Product Catalog
            </Link>
            <Link href="/ai-camera" className="flex items-center gap-1.5 hover:text-skin-blue transition-colors">
              Check Your Skin
              <Chip size="sm" color="accent" variant="soft">NEW</Chip>
            </Link>
            <Link href="/product" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Admin Space <ArrowRight size={14} />
            </Link>
          </nav>
          <Button isIconOnly variant="ghost" aria-label="Open navigation" className="md:hidden">
            <Menu size={22} />
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-skin-sky">
          <div className={`${wrap} grid items-center gap-10 py-14 md:grid-cols-2 md:py-20`}>
            <div>
              <Eyebrow>MINDFUL SKINCARE</Eyebrow>
              <h1 className="mt-4 text-5xl font-bold leading-[1.05] text-skin-ink md:text-7xl">
                Get to know your skin,
                <br />
                <em className="text-skin-blue not-italic">love the ritual</em>
                <Sparkle className="ml-2 inline fill-skin-pink text-skin-pink" size={24} />
              </h1>
              <p className="mt-5 max-w-md text-lg text-skin-muted">
                Thoughtful, science-backed skincare recommendations tailored to how your skin actually feels today.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href="/catalog" className={buttonVariants({ variant: "primary", size: "lg" }) + " rounded-full bg-skin-blue"}>
                  Explore Skincare <ArrowRight size={17} />
                </Link>
                <Link href="/ai-camera" className="flex items-center gap-2 text-sm font-semibold text-skin-ink hover:text-skin-blue transition-colors">
                  <Camera size={17} /> Check skin with camera
                </Link>
              </div>
              <p className="mt-8 flex items-center gap-2 text-sm text-skin-muted">
                <ShieldCheck size={16} /> Cosmetic wellness guidance, not a medical diagnosis.
              </p>
            </div>

            <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center">
              <div className="absolute left-1/2 top-6 size-72 -translate-x-1/2 rounded-full bg-skin-sun" />
              <div className="absolute -left-4 bottom-8 size-40 rounded-full bg-skin-blue-tile blur-2xl" />
              <div className="absolute -right-2 top-20 size-36 rounded-full bg-skin-pink-tile blur-2xl" />
              <div className="relative z-10 mt-16 h-[276px] w-[184px] -rotate-6 rounded-[35px_35px_27px_27px] bg-gradient-to-r from-[#fff6e3] via-[#ffe8ca] to-[#f9dcbf] shadow-[0_22px_35px_#53676a26]">
                <div className="absolute -top-8 left-[57px] h-10 w-[70px] rounded-t-xl rounded-b-md bg-skin-pink" />
                <div className="absolute inset-x-5 top-24 rounded-xl bg-white/70 p-3 text-center text-skin-ink">
                  <span className="block text-[10px] uppercase tracking-widest text-skin-muted">daily ritual</span>
                  <strong className="block text-xl leading-tight">gentle<br />cloud</strong>
                  <small className="text-[10px] text-skin-muted">facial cleanser</small>
                </div>
              </div>
              <Sparkle className="absolute right-6 top-4 fill-skin-pink text-skin-pink" size={25} />
              <Sparkles className="absolute bottom-16 left-2 text-skin-blue" size={20} />
              <Chip className="absolute left-0 top-24 z-20 bg-white shadow-md" variant="secondary">
                <Sprout size={14} /> Know your ingredients
              </Chip>
              <Chip className="absolute bottom-24 right-0 z-20 bg-white shadow-md" variant="secondary">
                <Sparkles size={14} /> Find your rhythm
              </Chip>
              <span className="absolute bottom-0 right-2 text-[11px] tracking-widest text-skin-eyebrow">YourSkin · 001</span>
            </div>
          </div>
          <div className={`${wrap} flex items-center justify-between border-t border-[#dbe9ee] py-4 text-sm text-skin-muted`}>
            <span>Curiosity is the first step toward healthier skin.</span>
            <ArrowRight size={18} />
          </div>
        </section>

        {/* Discovery */}
        <section className={`${wrap} py-20`}>
          <SectionHeading
            eyebrow="START HERE"
            title="Little steps, big love for your skin"
            desc="Simple, easy-to-digest insights so you can choose what feels right with complete confidence."
            href="/catalog"
            cta="View all products"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {tiles.map(({ index, title, link, bg, Icon, href }) => (
              <Link key={index} href={href} className="group block">
                <Card className={`${bg} h-56 justify-between rounded-3xl border-0 p-6 shadow-none transition-transform group-hover:-translate-y-1`}>
                  <Card.Header className="flex-row items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-white text-skin-ink">
                      <Icon size={22} />
                    </span>
                    <span className="text-[11px] font-bold tracking-widest text-skin-eyebrow">{index}</span>
                  </Card.Header>
                  <Card.Content className="p-0">
                    <h3 className="text-2xl font-bold leading-snug text-skin-ink">
                      {title[0]}
                      <br />
                      {title[1]}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-skin-ink">
                      {link} <ArrowRight size={16} />
                    </span>
                  </Card.Content>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="bg-skin-pink-band py-16">
          <div className={wrap}>
            <SectionHeading
              eyebrow="OUR CURATED PICKS"
              title="Favorites worth knowing"
              desc="Thoughtfully crafted formulas made with simple, transparent ingredients."
              href="/catalog"
              cta="Browse collection"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <Link key={p.id} href={`/catalog/${p.id}`} className="group block">
                  <Card className="rounded-3xl border border-[#f1e3ea] bg-white p-3 shadow-none transition-shadow group-hover:shadow-lg">
                    <div className="relative grid h-44 place-items-center rounded-2xl bg-skin-sky">
                      <div className="h-24 w-14 rounded-xl bg-gradient-to-r from-[#fff6e3] to-[#f9dcbf] shadow">
                        <div className="mx-auto -mt-3 h-4 w-8 rounded-t bg-skin-pink" />
                      </div>
                      {p.featured && (
                        <Chip size="sm" className="absolute left-2 top-2" color="accent" variant="soft">
                          <Sparkle size={12} /> Curated
                        </Chip>
                      )}
                    </div>
                    <Card.Content className="gap-1 px-1 pt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-skin-eyebrow">{p.category}</span>
                      <h3 className="font-semibold text-skin-ink">{p.name}</h3>
                      <p className="text-sm text-skin-muted">{p.brand}</p>
                      <strong className="mt-1 text-skin-ink">{rupiah(p.price)}</strong>
                    </Card.Content>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section id="ingredients" className={`${wrap} grid gap-10 py-20 md:grid-cols-2`}>
          <div>
            <Eyebrow>INGREDIENTS, DECODED</Eyebrow>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-skin-ink md:text-5xl">
              Active ingredients
              <br />
              <em className="text-skin-blue not-italic">aren't as scary as they sound.</em>
            </h2>
            <p className="mt-4 max-w-md text-skin-muted">
              Get familiar with the most popular ingredients, what they actually do, and how they care for your skin barrier.
            </p>
            <Link href="/catalog" className={`${buttonVariants({ variant: "outline" })} mt-6 rounded-full`}>
              Explore mindfully <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {ingredients.map((item, i) => (
              <Card key={item.name} className="flex-row items-center gap-4 rounded-2xl border border-[#e6eff2] bg-white p-4 shadow-none">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl font-bold text-skin-ink ${["bg-skin-blue-tile", "bg-skin-pink-tile", "bg-skin-green-tile"][i]
                    }`}
                >
                  0{i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-skin-ink">{item.name}</h3>
                  <p className="text-sm text-skin-muted">{item.summary}</p>
                </div>
                <ArrowRight size={18} className="text-skin-muted" />
              </Card>
            ))}
          </div>
        </section>

        {/* Camera banner */}
        <section className={`${wrap} pb-20`}>
          <div className="relative grid items-center gap-8 rounded-[2rem] bg-skin-sky p-8 md:grid-cols-[auto_1fr] md:p-12">
            <div className="relative mx-auto grid size-36 place-items-center rounded-full bg-skin-blue-tile text-skin-blue">
              <Camera size={56} />
              <Sparkle className="absolute -right-1 -top-1 fill-skin-pink text-skin-pink" size={26} />
            </div>
            <div>
              <Eyebrow>A MOMENT OF REFLECTION</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-skin-ink md:text-4xl">
                Take a quick photo.
                <br />
                Receive gentle guidance.
              </h2>
              <p className="mt-3 max-w-lg text-skin-muted">
                A mindful visual check-in designed to help you understand what your skin is craving right now.
              </p>
              <Link href="/ai-camera" className={`${buttonVariants({ variant: "primary" })} mt-6 rounded-full bg-skin-blue`}>
                Try camera guide <Camera size={17} />
              </Link>
            </div>
            <p className="flex items-center gap-2 text-sm text-skin-muted md:col-span-2">
              <ShieldCheck size={17} /> Created for daily cosmetic wellness, not clinical diagnoses.
            </p>
          </div>
        </section>

        {/* Reports */}
        <section className={`${wrap} pb-16`}>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <Eyebrow>YOUR JOURNAL</Eyebrow>
              <h2 className="mt-2 text-3xl font-bold text-skin-ink">Exploration log</h2>
            </div>
            <Link href="/ai-camera" className="inline-flex items-center gap-1.5 text-sm font-semibold text-skin-blue hover:underline">
              Start a new check-in <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-2xl border border-dashed border-[#cfe1e8] p-8 text-center text-skin-muted">
            No records yet. Take your time—start whenever you feel ready.
          </div>
          <div className="mt-8 flex items-center justify-between text-sm text-skin-muted">
            <span className="flex items-center gap-2">
              <FlaskConical size={16} /> {ingredients.length} ingredients documented for you to explore
            </span>
            <Link href="/admin/ingredients" className="hover:underline">Manage catalog</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e6eff2] bg-white py-6">
        <div className={`${wrap} flex flex-wrap items-center justify-between gap-3 text-sm text-skin-muted`}>
          <Brand size={17} />
          <span>Finding what works takes time. Be gentle with yourself.</span>
          <span>© YourSkin. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
