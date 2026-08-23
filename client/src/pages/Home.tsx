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
  const [darkMode, setDarkMode] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [detectedNeighborhood, setDetectedNeighborhood] = useState<string | null>(null);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Simulated geocoding in Bangui (e.g. 3ème Arrondissement / PK5)
          setDetectedNeighborhood("3ème Arrondissement (Secteur PK5 - Bangui)");
          toast.success("Position GPS détectée : 3ème Arrondissement (Livraison prioritaire disponible !)");
        },
        () => {
          toast.error("Impossible de détecter la position GPS.");
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const subscribePushMutation = trpc.shop.subscribePush.useMutation();
  const submitSupportRequestMutation = trpc.shop.submitSupportRequest.useMutation();

  const handleChatSend = async (content: string) => {
    const message = content.trim();
    if (!message || submitSupportRequestMutation.isPending) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: message }]);
    setChatInput('');
    try {
      await submitSupportRequestMutation.mutateAsync({ message, phone: user?.phone || undefined });
      const needsExpert = /expert|conseiller|problème|réclamation|remboursement/i.test(message);
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: needsExpert
          ? "Votre demande a bien été transmise à notre équipe. Veuillez attendre l'avis d'un expert Prince Délice ; nous vous répondrons ici ou par WhatsApp au +236 72 89 89 38."
          : "Merci pour votre message ! Notre équipe vous répondra rapidement ici ou par WhatsApp au +236 72 89 89 38."
      }]);
    } catch (err: any) {
      toast.error(err.message || "Votre message n'a pas pu être transmis.");
      setChatMessages(prev => [...prev, { sender: 'agent', text: "Nous n'avons pas pu enregistrer votre demande. Veuillez réessayer." }]);
    }
  };

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
      <header className="border-b border-[#EADBC8] bg-white/95 backdrop-blur sticky top-0 z-50 px-2 md:px-6 py-2.5 flex items-center justify-between gap-1 flex-wrap sm:flex-nowrap">
        <Link href="/" className="flex items-center gap-1.5 font-serif text-base md:text-2xl font-bold tracking-tight text-[#1E3F20] min-w-0 flex-shrink-0">
          <img src="/manus-storage/Screenshot_20260813-194645_c6926745.png" alt="Prince Délice" className="w-8 h-8 md:w-11 md:h-11 rounded-full object-cover border border-[#D97706] shadow-sm flex-shrink-0" />
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
            className="border-[#EADBC8] text-[#1E3F20] text-xs h-8 px-2 flex items-center gap-1"
            title="Activer les notifications push"
          >
            🔔 Push
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDarkMode(!darkMode);
              document.documentElement.classList.toggle("dark", !darkMode);
              toast.success(!darkMode ? "Mode Sombre activé" : "Mode Clair activé");
            }}
            className="border-[#EADBC8] text-[#1E3F20] text-xs h-8 px-2"
            title="Basculer le mode sombre / clair"
          >
            {darkMode ? "☀️" : "🌙"}
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

      {/* Visual Notification Banner for Active Deliveries */}
      <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-inner">
        <span className="animate-pulse">🚚</span>
        <span><strong>Alerte Livraison Bangui :</strong> Vos commandes « En cours de livraison » sont acheminées en direct par nos coursiers vers votre secteur ! Suivez la progression dans votre Espace Client.</span>
      </div>

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

      {/* GPS Location & VIP Tiers Banner */}
      <section className="py-8 px-6 bg-[#FEF3C7]/40 border-b border-[#EADBC8]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif font-bold text-lg text-[#1E3F20]">📍 Livraison géolocalisée à Bangui</h3>
            <p className="text-xs text-muted-foreground">
              {detectedNeighborhood ? `Arrondissement détecté : ${detectedNeighborhood}` : "Détectez votre position pour un calcul instantané des frais et délais de livraison."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={detectLocation} className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-xs">
              Détecter ma position GPS
            </Button>
            <Button onClick={() => toast.success("Statut VIP Actuel : OR (150 points - 10% de réduction sur chaque panier)")} variant="outline" className="border-[#D97706] text-[#D97706] text-xs">
              💎 Mon Statut VIP
            </Button>
          </div>
        </div>
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

      {/* Monthly Subscription: Panier Fraîcheur */}
      <section className="py-16 px-6 bg-[#FEF3C7]/30 border-t border-[#EADBC8]">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-[#D97706]/40 shadow-sm text-center space-y-6">
          <Badge className="bg-[#D97706] text-white px-3 py-1 text-xs">Nouveau : Abonnement Bangui</Badge>
          <h2 className="text-3xl font-serif font-bold text-[#1E3F20]">Abonnement Mensuel "Panier Fraîcheur"</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Recevez chaque semaine un panier assorti de fruits de saison fraîchement cueillis (Mangues, Ananas, Papayes, Bananes) livrés directement chez vous à Bangui sans frais de livraison supplémentaires.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <span className="font-serif text-2xl font-bold text-[#1E3F20]">15 000 XAF <span className="text-xs text-muted-foreground font-normal">/ mois (4 livraisons)</span></span>
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  startLogin();
                  return;
                }
                toast.success("Abonnement 'Panier Fraîcheur' activé avec succès ! Notre équipe vous contactera pour planifier la première livraison.");
              }}
              className="bg-[#D97706] hover:bg-[#b45309] text-white px-6 py-2.5"
            >
              S'abonner maintenant
            </Button>
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
              className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-200 border border-white/30 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
            <Button type="submit" className="bg-[#D97706] hover:bg-[#b45309] text-white font-semibold px-6">
              S'inscrire
            </Button>
          </form>

          <div className="pt-4 flex justify-center">
            <Button
              onClick={() => {
                toast.success("Application PWA Prince Délice prête pour installation ! Ajoutez-la à votre écran d'accueil depuis le menu de votre navigateur.");
              }}
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 text-xs gap-2"
            >
              📱 Installer l'application PWA
            </Button>
          </div>
        </div>
      </section>

      {/* Direct Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#EADBC8] overflow-hidden flex flex-col">
            <div className="bg-[#1E3F20] text-white p-3.5 flex justify-between items-center">
              <span className="font-serif font-bold text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" /> Support Prince Délice
              </span>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200 text-sm font-bold">✕</button>
            </div>
            <div className="p-3 h-64 overflow-y-auto space-y-3 bg-[#FDFBF7] text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#EADBC8] max-w-[85%] shadow-sm">
                <p className="font-bold text-[#1E3F20] mb-0.5">Conseiller (En ligne)</p>
                <p className="text-gray-700">Bonjour ! Bienvenue chez Prince Délice à Bangui. Comment pouvons-nous vous aider aujourd'hui ?</p>
              </div>
              {chatMessages.map((m, i) => (
                <div key={i} className={`p-2.5 rounded-xl max-w-[85%] shadow-sm ${m.sender === 'user' ? 'ml-auto bg-[#1E3F20] text-white' : 'bg-white border border-[#EADBC8] text-gray-700'}`}>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[#EADBC8] bg-white flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    void handleChatSend(chatInput);
                  }
                }}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-[#EADBC8] rounded-lg text-xs focus:outline-none"
              />
              <Button
                onClick={() => void handleChatSend(chatInput)}
                disabled={submitSupportRequestMutation.isPending}
                className="bg-[#1E3F20] text-white px-3 py-2 text-xs"
              >
                Envoyer
              </Button>
            </div>
          </div>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 cursor-pointer"
          title="Discutez avec notre support en direct"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.1-1.338C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
          </svg>
        </button>
      </div>

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
