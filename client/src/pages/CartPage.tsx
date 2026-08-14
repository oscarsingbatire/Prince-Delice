import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export function getCart(): CartItem[] {
  try {
    const stored = localStorage.getItem("rc_cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem("rc_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("cart_updated"));
}

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
    const handleUpdate = () => setCart(getCart());
    window.addEventListener("cart_updated", handleUpdate);
    return () => window.removeEventListener("cart_updated", handleUpdate);
  }, []);

  const updateQty = (id: number, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (id: number) => {
    const updated = cart.filter(item => item.id !== id);
    saveCart(updated);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#EADBC8] bg-white/95 backdrop-blur sticky top-0 z-50 px-3 md:px-6 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg md:text-2xl font-bold tracking-tight text-[#1E3F20] min-w-0">
          <img src="/manus-storage/Screenshot_20260813-194645_c6926745.png" alt="Prince Délice" className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border border-[#D97706] shadow-sm flex-shrink-0" />
          <span className="truncate">Prince Délice</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="gap-1.5 text-[#1E3F20] text-xs md:text-sm px-2">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Continuer mes achats</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-[#1E3F20] mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#D97706]" /> Votre Panier de Fruits Frais
        </h1>

        {cart.length === 0 ? (
          <Card className="border-[#EADBC8] bg-white text-center py-16">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center text-3xl">
                🛒
              </div>
              <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">Votre panier est actuellement vide</h2>
              <p className="text-muted-foreground max-w-md">
                Découvrez notre sélection de mangues, ananas, bananes et fruits de dessert frais récoltés à Bangui.
              </p>
              <Link href="/">
                <Button className="bg-[#1E3F20] hover:bg-[#152e17] text-white mt-4">
                  Découvrir le catalogue
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="border-[#EADBC8] bg-white overflow-hidden shadow-sm">
                  <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-[#EADBC8] flex-shrink-0" />
                      <div className="flex-1 sm:hidden">
                        <h3 className="font-serif font-bold text-sm text-[#1E3F20] leading-tight">{item.name}</h3>
                        <p className="text-xs text-[#D97706] font-medium mt-0.5">{item.price.toLocaleString()} XAF / {item.unit}</p>
                      </div>
                      <div className="text-right font-serif font-bold text-base text-[#1E3F20] sm:hidden ml-auto">
                        {(item.price * item.quantity).toLocaleString()} XAF
                      </div>
                    </div>

                    <div className="hidden sm:block flex-1">
                      <h3 className="font-serif font-bold text-[#1E3F20]">{item.name}</h3>
                      <p className="text-sm text-[#D97706] font-medium">{item.price.toLocaleString()} XAF / {item.unit}</p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#EADBC8]">
                      <div className="flex items-center border border-[#EADBC8] rounded-md">
                        <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-muted-foreground hover:bg-[#FDFBF7]">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-muted-foreground hover:bg-[#FDFBF7]">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1 text-xs sm:text-sm">
                        <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Supprimer</span>
                      </button>
                    </div>

                    <div className="hidden sm:block text-right font-serif font-bold text-lg text-[#1E3F20]">
                      {(item.price * item.quantity).toLocaleString()} XAF
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="border-[#EADBC8] bg-white shadow-sm sticky top-24">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#1E3F20]">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison à Bangui</span>
                    <span className="text-xs text-[#D97706] font-medium">Calculée au checkout</span>
                  </div>
                  <div className="border-t border-[#EADBC8] pt-4 flex justify-between font-serif text-lg font-bold text-[#1E3F20]">
                    <span>Total estimé</span>
                    <span>{subtotal.toLocaleString()} XAF</span>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        if (!isAuthenticated) {
                          startLogin();
                        } else {
                          setLocation("/checkout");
                        }
                      }}
                      className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white py-6 text-base gap-2 font-medium shadow-md"
                    >
                      {isAuthenticated ? "Procéder au paiement" : "Se connecter pour commander"} <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-[#FEF3C7]/40 rounded-lg border border-[#FDE68A] flex items-start gap-3 text-xs text-[#92400E]">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-[#D97706]" />
                    <span>Garantie fraîcheur 24h & Paiement sécurisé via Orange Money ou Carte Bancaire.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
