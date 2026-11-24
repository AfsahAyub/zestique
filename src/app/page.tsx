"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type MenuItem = {
  id: number;
  name: string;
  price: number | string;
  description: string | null;
};

const photos = {
  biryani: "https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=900",
  pulao: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=900&auto=format&fit=crop&q=85",
  curry: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900",
qorma: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&auto=format&fit=crop&q=85",
burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=85",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&auto=format&fit=crop&q=85",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&auto=format&fit=crop&q=85",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=900&auto=format&fit=crop&q=85",
  steak: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=85",
  dessert: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop&q=85",
  default: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900&auto=format&fit=crop&q=85",
};

function dishPhoto(name: string): string {
  const n = name.toLowerCase();
  if (/biryani|baryani|biriyani/.test(n)) return photos.biryani;
  if (/pulao|pilaf|plao/.test(n)) return photos.pulao;
  if (/qorma|korma/.test(n)) return photos.qorma;
if (/karahi|karhai|curry|handi|tikka|masala/.test(n)) return photos.curry;
  if (/zinger|burger|shawarma/.test(n)) return photos.burger;
  if (/pizza/.test(n)) return photos.pizza;
  if (/fries|chips/.test(n)) return photos.fries;
  if (/pasta|spaghetti|macaroni/.test(n)) return photos.pasta;
  if (/sandwich|club/.test(n)) return photos.sandwich;
  if (/steak|grill|bbq/.test(n)) return photos.steak;
  if (/ice[\s-]?cream|gelato|kulfi/.test(n))
  return "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=900";

if (/brownie/.test(n))
  return "https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=900";

if (/cake|dessert|sweet/.test(n))
  return photos.dessert;
  return photos.default;
}

function DishImage({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const source = dishPhoto(name);
  return (
    <div className="h-64 overflow-hidden bg-[#E7D9C8] md:h-72">
      {/* External images can fail; the fallback keeps the card readable. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={name}
        src={failed ? photos.default : source}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="zestique-image h-full w-full object-cover"
      />
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadMenu() {
      try {
        const response = await fetch("/api/menu");
        if (!response.ok) throw new Error("Could not load menu");
        const data = (await response.json()) as MenuItem[];
        if (active) setItems(data);
      } catch {
        if (active) setError("Menu load nahi ho saka. Database connection check karein.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMenu();
    return () => { active = false; };
  }, []);

  function startEdit(dish: MenuItem) {
    setEditingId(dish.id);
    setName(dish.name);
    setPrice(String(dish.price));
    setDescription(dish.description ?? "");
    setError("");
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
  }

  async function saveItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !name.trim() ||
      name.trim().length > 255 ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      Number(price) > 99999999.99
    ) {
      setError("Valid dish name aur price enter karein.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    const isEditing = editingId !== null;

    try {
      const response = await fetch("/api/menu", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEditing ? { id: editingId } : {}),
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const problem = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(problem.error || (isEditing ? "Update failed" : "Add failed"));
      }

      const savedDish = (await response.json()) as MenuItem;
      if (isEditing) {
        setItems((previous) =>
          previous.map((dish) => (dish.id === savedDish.id ? savedDish : dish))
        );
      } else {
        setItems((previous) => [savedDish, ...previous]);
      }

      resetForm();
      setMessage(isEditing ? "Dish successfully updated!" : "Dish successfully added!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dish save nahi ho saki.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    const browser = globalThis as unknown as { confirm: (message: string) => boolean };
    if (!browser.confirm("Kya aap ye dish permanently delete karna chahti hain?")) return;
    setDeletingId(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setItems((previous) => previous.filter((dish) => dish.id !== id));
      if (editingId === id) resetForm();
      setMessage("Dish successfully deleted!");
    } catch {
      setError("Dish delete nahi ho saki.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F6F0E6] text-[#18382F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        .zestique-serif { font-family: 'Playfair Display', Georgia, serif; }
        .zestique-sans { font-family: 'DM Sans', Arial, sans-serif; }
        @keyframes zestiqueFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .zestique-fade { animation: zestiqueFadeUp .9s ease-out both; }
        .zestique-fade-delay { animation: zestiqueFadeUp 1.1s ease-out .2s both; }
        .zestique-image { transition: transform .7s ease; }
        .zestique-image:hover { transform: scale(1.06); }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { .zestique-fade, .zestique-fade-delay { animation: none; } .zestique-image { transition: none; } }
      `}</style>

      <header className="zestique-sans absolute left-0 right-0 top-0 z-30 border-b border-white/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
          <a href="#home" className="zestique-serif text-3xl font-semibold tracking-wide text-[#F6F0E6] md:text-4xl">Zestique<span className="text-[#C6A46A]">.</span></a>
          <nav className="hidden items-center gap-10 text-sm font-semibold tracking-widest text-white md:flex">
            <a href="#home" className="transition hover:text-[#D8B77D]">HOME</a>
            <a href="#about" className="transition hover:text-[#D8B77D]">ABOUT</a>
            <a href="#menu" className="transition hover:text-[#D8B77D]">MENU</a>
            <a href="#contact" className="transition hover:text-[#D8B77D]">CONTACT</a>
          <a
  href="/logout"
  className="rounded-full border border-[#D8B77D] px-5 py-2 text-[#D8B77D] transition hover:bg-[#D8B77D] hover:text-black"
>
  LOGOUT
</a>
</nav>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded border border-white/50 px-4 py-2 text-sm text-white md:hidden" aria-label="Toggle navigation">MENU</button>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-5 bg-[#18382F] px-6 py-6 text-sm font-semibold tracking-widest text-white md:hidden">
            {([ ["HOME", "#home"], ["ABOUT", "#about"], ["MENU", "#menu"], ["CONTACT", "#contact"] ] as const).map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a href="/logout" onClick={() => setMenuOpen(false)} className="text-[#D8B77D]">LOGOUT</a>
          </nav>
        )}
      </header>

      <section id="home" className="relative flex min-h-[92vh] items-center justify-center bg-[#18382F] px-6 py-36 text-center text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&auto=format&fit=crop&q=85')" }} />
        <div className="absolute inset-0 bg-[#10271F]/75" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="zestique-fade mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-[#C6A46A]" />
            <p className="zestique-sans text-xs font-semibold tracking-[0.35em] text-[#E0BE82] md:text-sm">THE ART OF FINE DINING</p>
            <span className="h-px w-10 bg-[#C6A46A]" />
          </div>
          <h1 className="zestique-serif zestique-fade text-6xl font-medium leading-[1.12] md:text-8xl">Where Every<br /><span className="italic text-[#D6B57C]">Flavor Tells</span><br />a Story</h1>
          <p className="zestique-sans zestique-fade-delay mx-auto mt-8 max-w-2xl text-base leading-8 text-[#E8E2D8] md:text-lg">A celebration of extraordinary flavors, beautiful moments, and unforgettable dining experiences.</p>
          <a href="#menu" className="zestique-sans zestique-fade-delay mt-10 inline-block bg-[#C6A46A] px-10 py-4 text-sm font-bold tracking-widest text-[#18382F] transition hover:bg-[#E3C38E]">EXPLORE OUR MENU</a>
        </div>
        <div className="zestique-sans absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-[0.3em] text-[#D6B57C]">SCROLL TO DISCOVER ↓</div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:px-12 md:py-32">
        <div className="relative">
          <div className="overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&auto=format&fit=crop&q=85" alt="Elegant restaurant dining table" className="zestique-image h-[420px] w-full object-cover md:h-[550px]" />
          </div>
          <div className="zestique-serif absolute -bottom-6 right-[-8px] bg-[#18382F] px-8 py-6 text-2xl italic text-[#E7D1AA] md:right-[-25px]">Made with love</div>
        </div>
        <div className="md:pl-10">
          <p className="zestique-sans mb-5 text-sm font-bold tracking-[0.3em] text-[#B28D55]">DISCOVER OUR STORY</p>
          <h2 className="zestique-serif text-5xl leading-tight text-[#49362C] md:text-6xl">More Than<br />Just a <span className="italic text-[#A47D45]">Meal.</span></h2>
          <div className="my-8 h-1 w-16 bg-[#C6A46A]" />
          <p className="zestique-sans text-base leading-9 text-[#756D62] md:text-lg">Welcome to Zestique, where passion meets the plate. We believe that exceptional food is about more than taste — it is about creating memories, sharing stories, and celebrating life&apos;s beautiful moments.</p>
          <p className="zestique-sans mt-6 text-base leading-9 text-[#756D62]">From thoughtfully selected ingredients to carefully crafted dishes, every detail is designed to make your experience special.</p>
          <a href="#menu" className="zestique-sans mt-9 inline-block border-b-2 border-[#C6A46A] pb-2 text-sm font-bold tracking-widest text-[#18382F] transition hover:text-[#A47D45]">DISCOVER OUR CUISINE →</a>
        </div>
      </section>

      <section className="bg-[#18382F] px-6 py-16 text-center text-[#F6F0E6] md:py-20">
        <p className="zestique-sans text-xs font-bold tracking-[0.35em] text-[#D6B57C]">THE ZESTIQUE EXPERIENCE</p>
        <h2 className="zestique-serif mx-auto mt-6 max-w-4xl text-3xl leading-relaxed italic md:text-5xl">“Good food brings people together. Great food creates memories.”</h2>
      </section>

      <section id="menu" className="bg-[#EFE6D9] px-6 py-24 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="zestique-sans mb-4 text-sm font-bold tracking-[0.3em] text-[#A47D45]">CRAFTED WITH PASSION</p>
            <h2 className="zestique-serif text-5xl text-[#49362C] md:text-6xl">Our Signature <span className="italic">Dishes</span></h2>
            <p className="zestique-sans mx-auto mt-5 max-w-2xl text-base leading-8 text-[#756D62]">Explore a selection of delicious creations made to delight every palate.</p>
          </div>

          {loading ? <p className="mb-8 text-center text-[#756D62]">Loading menu...</p> : null}
          {!loading && items.length === 0 ? <p className="mb-8 text-center text-[#756D62]">No dishes in the database yet. Add your first dish below.</p> : null}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((dish) => (
              <article key={dish.id} className="group overflow-hidden bg-[#FFFCF7] shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                <DishImage name={dish.name} />
                <div className="p-7">
                  <p className="zestique-sans text-xs font-bold tracking-[0.22em] text-[#B28D55]">ZESTIQUE SPECIAL</p>
                  <h3 className="zestique-serif mt-3 text-2xl font-semibold text-[#49362C]">{dish.name}</h3>
                  <p className="zestique-sans mt-4 min-h-16 text-sm leading-7 text-[#756D62]">{dish.description || "Freshly prepared with care at Zestique."}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E0D4] pt-5">
                    <span className="zestique-serif text-2xl font-bold text-[#18382F]">Rs. {Number(dish.price).toLocaleString("en-PK")}</span>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="#dish-editor"
                        onClick={() => startEdit(dish)}
                        className="rounded border border-[#18382F] px-4 py-2 text-sm font-semibold text-[#18382F] transition hover:bg-[#E7E0D4]"
                      >
                        Edit Dish
                      </a>
                      <button
                        type="button"
                        onClick={() => void deleteItem(dish.id)}
                        disabled={deletingId === dish.id || saving}
                        className="rounded bg-[#49362C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18382F] disabled:opacity-50"
                      >
                        {deletingId === dish.id ? "Deleting..." : "Delete Dish"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div id="dish-editor" className="mx-auto mt-14 max-w-2xl scroll-mt-8 bg-[#FFFCF7] p-7 shadow-lg md:p-10">
            <h3 className="zestique-serif mb-6 text-center text-3xl font-semibold text-[#49362C]">
              {editingId !== null ? "Edit Dish" : "Add a New Dish"}
            </h3>
            <form onSubmit={saveItem} className="space-y-5">
              <input type="text" placeholder="Dish name" aria-label="Dish name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName((e.target as unknown as { value: string }).value)} required maxLength={255} className="w-full border border-[#D8CBB9] bg-white p-4 text-[#18382F]" />
              <input type="number" placeholder="Price in Rs." aria-label="Price in rupees" value={price} onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice((e.target as unknown as { value: string }).value)} min="0.01" step="0.01" required className="w-full border border-[#D8CBB9] bg-white p-4 text-[#18382F]" />
              <textarea placeholder="Dish description" aria-label="Dish description" value={description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription((e.target as unknown as { value: string }).value)} rows={3} className="w-full border border-[#D8CBB9] bg-white p-4 text-[#18382F]" />
              <button type="submit" disabled={saving} className="w-full bg-[#18382F] px-6 py-4 font-semibold text-white transition hover:bg-[#285043] disabled:opacity-50">
                {saving ? "Saving..." : editingId !== null ? "SAVE CHANGES" : "ADD DISH"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                  className="w-full border border-[#49362C] px-6 py-3 font-semibold text-[#49362C] transition hover:bg-[#F1EAE0] disabled:opacity-50"
                >
                  CANCEL EDIT
                </button>
              )}
            </form>
            {message ? <p role="status" className="mt-4 text-center text-green-700">{message}</p> : null}
            {error ? <p role="alert" className="mt-4 text-center text-red-600">{error}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid bg-[#49362C] md:grid-cols-2">
        <div className="min-h-[350px] bg-cover bg-center md:min-h-[500px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1100&auto=format&fit=crop&q=85')" }} />
        <div className="flex flex-col justify-center px-8 py-20 text-[#F6F0E6] md:px-16">
          <p className="zestique-sans text-xs font-bold tracking-[0.3em] text-[#D6B57C]">A PLACE TO REMEMBER</p>
          <h2 className="zestique-serif mt-6 text-4xl leading-tight md:text-6xl">Beautiful Food.<br />Beautiful Moments.</h2>
          <p className="zestique-sans mt-7 max-w-lg text-base leading-9 text-[#E4D9CC]">Whether it&apos;s a special celebration or a simple evening out, Zestique welcomes you to enjoy an atmosphere of warmth, comfort, and elegance.</p>
          <a href="#contact" className="zestique-sans mt-9 w-fit border border-[#C6A46A] px-8 py-4 text-sm font-bold tracking-widest text-[#E7D1AA] transition hover:bg-[#C6A46A] hover:text-[#18382F]">GET IN TOUCH</a>
        </div>
      </section>

      <footer id="contact" className="bg-[#102B23] px-6 py-16 text-center text-[#F6F0E6]">
        <h2 className="zestique-serif text-5xl font-semibold">Zestique<span className="text-[#C6A46A]">.</span></h2>
        <p className="zestique-sans mt-5 text-sm tracking-widest text-[#D6B57C]">WHERE FLAVOR MEETS ELEGANCE</p>
        <div className="mx-auto my-9 h-px max-w-md bg-white/20" />
        <nav className="zestique-sans flex flex-wrap justify-center gap-7 text-sm text-[#E4D9CC]">
          <a href="#home" className="hover:text-[#D6B57C]">Home</a>
          <a href="#about" className="hover:text-[#D6B57C]">About</a>
          <a href="#menu" className="hover:text-[#D6B57C]">Menu</a>
          <a href="#contact" className="hover:text-[#D6B57C]">Contact</a>
        </nav>
        <p className="zestique-sans mt-12 text-xs text-[#B9B6AE]">© 2026 Zestique. All rights reserved.</p>
      </footer>
    </main>
  );
}


