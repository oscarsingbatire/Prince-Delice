import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ShieldCheck, Truck, Sparkles, User, Search, ArrowRight, Heart } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { getCart, saveCart, CartItem } from "./CartPage";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: products = [] } = trpc.shop.getProducts.useQuery();
  const seedMutation = trpc.shop.seedInitialData.useMutation();

  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  useEffect(() => {
    // Seed initial data if empty
    seedMutation.mutateAsync(undefined).then(() => {
      utils.shop.getProducts.invalidate();
    }).catch(() => {});

    const updateCartCount = () => {
      const cart = getCart();
      const count = cart.reduce((acc, i) => acc + i.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("cart_updated", updateCartCount);
    return () => window.removeEventListener("cart_updated", updateCartCount);
  }, []);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error("Désolé, ce produit est actuellement en rupture de stock.");
      return;
    }

    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    let updated: CartItem[];

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Stock maximum atteint pour ce produit.");
        return;
      }
      updated = cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updated = [...cart, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        unit: product.unit,
        imageUrl: product.imageUrl,
        quantity: 1,
        stock: product.stock,
      }];
    }

    saveCart(updated);
    toast.success(`${product.name} ajouté au panier avec succès !`);
  };

  const categories = ["Tous", "Mangues", "Ananas", "Bananes", "Papayes", "Agrumes", "Pastèques"];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Tous" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#EADBC8] bg-white/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#1E3F20]">
          <span className="text-3xl">🍊</span> Fruits Centrafrique
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-[#D97706] transition">Catalogue</Link>
          <a href="#engagement" className="text-sm font-medium hover:text-[#D97706] transition">Fraîcheur & Logistique</a>
          <a href="#retours" className="text-sm font-medium hover:text-[#D97706] transition">Retours & Sécurité</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="outline" className="border-[#EADBC8] bg-[#FDFBF7] hover:bg-[#FEF3C7] relative text-[#1E3F20] gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D97706]" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D97706] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/account">
                <Button variant="ghost" className="gap-2 text-[#1E3F20] font-medium">
                  <User className="w-4 h-4" /> {user?.name?.split(" ")[0]}
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs">
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Button onClick={() => startLogin()} className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-sm">
              Connexion / Inscription
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#FEF3C7]/60 to-[#FDFBF7] py-16 px-6 border-b border-[#EADBC8]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-[#D97706]/10 text-[#D97706] border-[#FDE68A] px-3 py-1 text-sm font-medium">
              🌿 Récoltés à Bangui et sa Périphérie
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1E3F20] leading-tight">
              L'Excellence des Fruits de Dessert en Centrafrique
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Commandez en ligne vos mangues, ananas, bananes et fruits frais de saison. Livraison rapide et soignée dans tous les arrondissements de Bangui, paiement sécurisé par Orange Money ou carte bancaire.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#catalogue">
                <Button className="bg-[#1E3F20] hover:bg-[#152e17] text-white px-6 py-6 text-base gap-2 shadow-md">
                  Explorer le Catalogue <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <Link href="/account">
                <Button variant="outline" className="border-[#EADBC8] text-[#1E3F20] px-6 py-6 text-base">
                  Suivre ma Commande
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#1E3F20] opacity-20 blur-lg"></div>
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
              alt="Fruits frais"
              className="relative rounded-2xl shadow-xl object-cover w-full h-[380px] border border-[#EADBC8]"
            />
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="catalogue" className="max-w-7xl w-full mx-auto px-6 py-16 flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#1E3F20]">Nos Fruits de Dessert Frais</h2>
            <p className="text-muted-foreground mt-1">Sélection rigoureuse de produits locaux de première qualité.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un fruit..."
                className="pl-9 pr-4 py-2 rounded-lg border border-[#EADBC8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3F20]"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? "bg-[#1E3F20] text-white shadow-sm"
                  : "bg-white border border-[#EADBC8] text-[#2C221E] hover:bg-[#FEF3C7]/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#EADBC8]">
            <p className="text-muted-foreground">Aucun fruit ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <Card key={product.id} className="border-[#EADBC8] bg-white overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div>
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <Badge className="bg-white/90 backdrop-blur text-[#1E3F20] font-semibold">
                        {product.freshnessStatus}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-[#D97706] font-semibold uppercase tracking-wider">{product.category}</span>
                      <span className="text-xs text-muted-foreground">Stock: {product.stock} {product.unit}s</span>
                    </div>
                    <CardTitle className="font-serif text-xl text-[#1E3F20] mt-1">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-baseline justify-between pt-2">
                      <span className="font-serif text-2xl font-bold text-[#1E3F20]">
                        {Number(product.price).toLocaleString()} <span className="text-sm font-sans font-normal text-muted-foreground">XAF / {product.unit}</span>
                      </span>
                    </div>
                  </CardContent>
                </div>
                <div className="px-6 pb-6 pt-0">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> {product.stock > 0 ? "Ajouter au Panier" : "Rupture de Stock"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Engagement & Logistics Section */}
      <section id="engagement" className="bg-[#F8F5EE] border-t border-b border-[#EADBC8] py-16 px-6 mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-[#EADBC8] space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706] font-bold text-xl">
              🌿
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1E3F20]">Fraîcheur Garantie</h3>
            <p className="text-sm text-muted-foreground">
              Nos fruits sont cueillis à maturité auprès des coopératives locales de Bangui et Bimbo pour préserver toutes leurs vitamines et saveurs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EADBC8] space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1E3F20]">Livraison par Arrondissement</h3>
            <p className="text-sm text-muted-foreground">
              Couverture complète de tous les arrondissements de Bangui avec un suivi en temps réel de votre commande jusqu'à votre porte.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EADBC8] space-y-3 shadow-sm" id="retours">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1E3F20]">Retours & Réclamations 24h</h3>
            <p className="text-sm text-muted-foreground">
              Un souci avec vos fruits ? Soumettez une photo sous 24h et bénéficiez de notre compensation rapide (avoir, remboursement ou remplacement).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3F20] text-[#FDFBF7] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-serif text-2xl font-bold">Fruits Centrafrique</h2>
            <p className="text-sm text-gray-300">La référence e-commerce des fruits de dessert frais à Bangui.</p>
          </div>
          <div className="text-xs text-gray-400 text-center md:text-right">
            <p>© 2026 Fruits Centrafrique. Tous droits réservés.</p>
            <p className="mt-1">Sécurisé par HTTPS, MFA et Paiements Orange Money & Cartes Bancaires.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
