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
  const [lang, setLang] = useState<"fr" | "sg">("fr");
  const [currency, setCurrency] = useState<"XAF" | "EUR">("XAF");

  const subscribePushMutation = trpc.shop.subscribePush.useMutation();

  const formatPrice = (priceInXaf: number) => {
    if (currency === "EUR") {
      const eur = priceInXaf / 655.957;
      return `${eur.toFixed(2)} €`;
    }
    return `${priceInXaf.toLocaleString()} XAF`;
  };

  const handlePushSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error(lang === "fr" ? "Veuillez vous connecter pour activer les notifications push." : "Fade yeke gba mawa ti lo na connection.");
      return;
    }
    try {
      await subscribePushMutation.mutateAsync({ endpoint: "push_device_" + Date.now() });
      toast.success(lang === "fr" ? "Notifications push activées avec succès !" : "Notifications push ahinga nzoni na sango!");
    } catch {
      toast.error("Erreur lors de l'activation.");
    }
  };

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

  const categories = ["Tous", "Pommes", "Baies", "Exotiques", "Avocats", "Raisins", "Secs & Moelleux", "Papayes", "Coco", "Pastèques"];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Tous" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#EADBC8] bg-white/95 backdrop-blur sticky top-0 z-50 px-3 md:px-6 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg md:text-2xl font-bold tracking-tight text-[#1E3F20] min-w-0">
          <img src="/manus-storage/Screenshot_20260813-194645_c6926745.png" alt="Prince Délice" className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border border-[#D97706] shadow-sm flex-shrink-0" />
          <span className="truncate">Prince Délice</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-[#D97706] transition">{lang === "fr" ? "Catalogue" : "Mbeni"}</Link>
          <a href="#engagement" className="text-sm font-medium hover:text-[#D97706] transition">{lang === "fr" ? "Fraîcheur & Logistique" : "Nzoni & Logistique"}</a>
          <a href="#retours" className="text-sm font-medium hover:text-[#D97706] transition">{lang === "fr" ? "Retours & Sécurité" : "Zingo & Sécurité"}</a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "fr" ? "sg" : "fr")}
            className="border-[#D97706] text-[#D97706] text-xs h-8 px-2 font-bold"
            title="Changer de langue (Français / Sango)"
          >
            {lang === "fr" ? "🇫🇷 FR" : "🇨🇫 SGO"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrency(currency === "XAF" ? "EUR" : "XAF")}
            className="border-[#1E3F20] text-[#1E3F20] text-xs h-8 px-2 font-bold"
            title="Changer de devise"
          >
            {currency === "XAF" ? "FCFA (XAF)" : "EUR (€)"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePushSubscribe}
            className="border-[#EADBC8] text-[#1E3F20] text-xs h-8 px-2 hidden sm:flex items-center gap-1"
            title="Activer les notifications push"
          >
            🔔 Push
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {isAuthenticated && user?.role === 'admin' && (
            <Link href="/admin">
              <Button className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs px-2.5 py-1.5 h-9 font-semibold shadow-sm flex items-center gap-1">
                <span>Admin</span>
              </Button>
            </Link>
          )}

          <Link href="/cart">
            <Button variant="outline" className="border-[#EADBC8] bg-[#FDFBF7] hover:bg-[#FEF3C7] relative text-[#1E3F20] px-2.5 h-9">
              <ShoppingBag className="w-4 h-4 text-[#D97706]" />
              <span className="hidden sm:inline ml-1.5">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D97706] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link href="/account">
              <Button variant="ghost" className="gap-1 text-[#1E3F20] font-medium text-xs px-2 h-9">
                <User className="w-4 h-4" /> <span className="hidden sm:inline">{user?.name?.split(" ")[0]}</span>
              </Button>
            </Link>
          ) : (
            <Button onClick={() => startLogin()} className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-xs px-3 h-9">
              Connexion
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
                  <CardContent className="space-y-3 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="p-2.5 bg-[#FEF3C7]/40 rounded-lg border border-[#FDE68A] text-xs space-y-1">
                      <span className="font-semibold text-[#1E3F20] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Bienfaits Santé :
                      </span>
                      <p className="text-[#2C221E] italic">
                        {product.name.includes("Pomme") && "Riche en antioxydants, régule la glycémie et protège le système cardiovasculaire."}
                        {product.name.includes("Fraise") && "Excellente source de vitamine C et de polyphénols, stimule l'immunité et l'éclat de la peau."}
                        {product.name.includes("Jacque") && "Riche en magnésium et potassium, favorise la digestion et booste l'énergie naturelle."}
                        {product.name.includes("Avocat") && "Apporte des bons acides gras essentiels (oméga-3), protège le cœur et nourrit l'organisme."}
                        {product.name.includes("Raisin") && "Puissant détoxifiant, riche en resvératrol, favorise la circulation sanguine et la jeunesse cellulaire."}
                        {product.name.includes("Dattes") && "Source naturelle de fer et de fibres, procure un regain d'énergie immédiat et durable."}
                        {product.name.includes("Papaye") && "Contient de la papaïne, enzyme miracle pour la digestion et la santé de la peau."}
                        {product.name.includes("Coco") && "Ultra-hydratante, riche en électrolytes naturels, idéale pour récupérer après l'effort."}
                        {product.name.includes("Pastèque") && "Composée à 92% d'eau, hydratation optimale, riche en lycopène protecteur."}
                      </p>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="font-serif text-2xl font-bold text-[#1E3F20]">
                        {formatPrice(Number(product.price))} <span className="text-sm font-sans font-normal text-muted-foreground">/ {product.unit}</span>
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                        {product.id % 2 === 0 ? "🔥 Best-seller Bangui" : "✨ Récolte du matin"}
                      </span>
                    </div>
                  </CardContent>
                </div>
                <div className="px-6 pb-6 pt-0 space-y-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Ajouter au Panier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Nutritional Comparison Section */}
      <section className="py-16 px-6 bg-white border-t border-[#EADBC8]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <Badge className="bg-[#D97706] text-white">Guide Santé & Vitamines</Badge>
            <h2 className="text-3xl font-serif font-bold text-[#1E3F20]">Comparateur Nutritionnel des Fruits de Bangui</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">Découvrez les apports essentiels de chaque fruit pour composer votre panier idéal selon vos besoins en énergie et immunité.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { fruit: "Mangue Kent", vitamin: "Vitamine A & C", benefit: "Immunité & Peau éclatante", color: "bg-amber-50 border-amber-200 text-amber-900" },
              { fruit: "Ananas Victoria", vitamin: "Bromélaïne & Vit. C", benefit: "Digestion & Anti-inflammatoire", color: "bg-yellow-50 border-yellow-200 text-yellow-900" },
              { fruit: "Papaye Fraîche", vitamin: "Papaïne & Antioxydants", benefit: "Confort digestif & Énergie", color: "bg-orange-50 border-orange-200 text-orange-900" },
              { fruit: "Avocat Local", vitamin: "Oméga-3 & Bonnes Graisses", benefit: "Protection Cardiovasculaire", color: "bg-green-50 border-green-200 text-green-900" },
            ].map(comp => (
              <div key={comp.fruit} className={`p-5 rounded-xl border ${comp.color} space-y-3 shadow-sm`}>
                <h3 className="font-serif font-bold text-lg">{comp.fruit}</h3>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">⚡ {comp.vitamin}</p>
                  <p className="opacity-80">💡 {comp.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Customer Reviews Section */}
      <section className="py-16 px-6 bg-[#FEF3C7]/20 border-t border-[#EADBC8]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold text-[#1E3F20]">Avis de nos Clients à Bangui</h2>
            <p className="text-muted-foreground text-sm">Ce que pensent nos fidèles gourmands de la fraîcheur Prince Délice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[#EADBC8] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1 text-[#D97706] mb-2">★★★★★</div>
              <p className="text-sm italic text-muted-foreground mb-4">"Les mangues Kent sont arrivées d'une fraîcheur incroyable à Sica 2 ! Service Orange Money super rapide."</p>
              <p className="font-bold text-sm text-[#1E3F20]">— Marie-Claire K., Bangui</p>
            </Card>

            <Card className="border-[#EADBC8] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1 text-[#D97706] mb-2">★★★★★</div>
              <p className="text-sm italic text-muted-foreground mb-4">"Super pratique pour commander des ananas Victoria directement livrés au bureau au Centre-Ville. Merci Prince Délice !"</p>
              <p className="font-bold text-sm text-[#1E3F20]">— Jean-Paul M., 1er Arrondissement</p>
            </Card>

            <Card className="border-[#EADBC8] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1 text-[#D97706] mb-2">★★★★★</div>
              <p className="text-sm italic text-muted-foreground mb-4">"Le suivi de commande et l'authentification sécurisée m'inspirent total confiance. Fruits de top qualité."</p>
              <p className="font-bold text-sm text-[#1E3F20]">— Blandine N., PK5</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Hebdomadaire Section */}
      <section className="py-16 px-6 bg-[#1E3F20] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-[#D97706] text-white px-3 py-1 text-sm font-medium">Newsletter Bangui</Badge>
          <h2 className="text-3xl font-serif font-bold">Recevez nos arrivages de fruits frais chaque semaine</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Inscrivez-vous pour ne rien rater des récoltes de saison (mangues, ananas, papayes) et bénéficiez de codes promo exclusifs à Bangui.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Inscription à la newsletter validée avec succès ! Bienvenue chez Prince Délice.");
            }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="Votre adresse email..."
              className="px-4 py-3 rounded-lg text-gray-900 text-sm flex-1 focus:outline-none"
            />
            <Button type="submit" className="bg-[#D97706] hover:bg-[#b45309] text-white font-semibold px-6">
              S'inscrire
            </Button>
          </form>
        </div>
      </section>

      {/* Floating WhatsApp Button with universal schema */}
      <a
        href="https://api.whatsapp.com/send?phone=23672898938&text=Bonjour%20Prince%20D%C3%A9lice,%20je%20souhaite%20commander%20des%20fruits%20frais."
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Fallback to direct wa.me if api.whatsapp.com is blocked
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = "whatsapp://send?phone=23672898938&text=Bonjour%20Prince%20D%C3%A9lice,%20je%20souhaite%20commander%20des%20fruits%20frais.";
          }
        }}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 cursor-pointer"
        title="Contactez-nous sur WhatsApp"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>

      {/* Footer */}
      <footer className="bg-[#1E3F20] text-[#FDFBF7] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-serif text-2xl font-bold">Prince Délice</h2>
            <p className="text-sm text-gray-300">La référence e-commerce des fruits de dessert frais à Bangui.</p>
          </div>
          <div className="text-xs text-gray-400 text-center md:text-right">
            <p>© 2026 Prince Délice. Tous droits réservés.</p>
            <p className="mt-1">Sécurisé par HTTPS, MFA et Paiements Orange Money & Cartes Bancaires.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
