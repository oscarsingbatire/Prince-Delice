import React, { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, Smartphone } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CartItem, getCart, saveCart } from "./CartPage";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: zones = [] } = trpc.shop.getDeliveryZones.useQuery();
  const createOrderMutation = trpc.shop.createOrder.useMutation();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"orange_money" | "visa_mastercard" | "cash_on_delivery">("orange_money");
  const [orangePhone, setOrangePhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);

  useEffect(() => {
    const items = getCart();
    setCart(items);
    if (items.length === 0 && !successOrderId) {
      setLocation("/cart");
    }
  }, [successOrderId, setLocation]);

  const selectedZone = zones.find(z => z.id.toString() === selectedZoneId);
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress || !selectedZone) {
      toast.error("Veuillez remplir tous les champs de livraison et choisir une zone à Bangui.");
      return;
    }

    if (paymentMethod === "orange_money" && !orangePhone) {
      toast.error("Veuillez saisir votre numéro Orange Money.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrderMutation.mutateAsync({
        customerName,
        customerPhone,
        deliveryAddress,
        arrondissement: selectedZone.arrondissement,
        neighborhood: selectedZone.neighborhood,
        paymentMethod,
        items: cart.map(i => ({
          productId: i.id,
          productName: i.name,
          price: i.price.toString(),
          quantity: i.quantity,
        })),
        deliveryFee: deliveryFee.toString(),
        totalAmount: totalAmount.toString(),
      });

      if (res.success) {
        saveCart([]); // clear cart
        setSuccessOrderId(res.orderId);
        toast.success("Commande validée avec succès !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrderId) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col items-center justify-center p-6">
        <Card className="max-w-lg w-full border-[#EADBC8] bg-white text-center p-8 shadow-md">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1E3F20]">Commande Validée !</h1>
            <p className="text-muted-foreground text-sm">
              Votre commande n° <strong>#{successOrderId}</strong> a été enregistrée avec succès. Nos équipes préparent vos fruits de dessert frais avec le plus grand soin.
            </p>
            <div className="p-4 bg-[#FEF3C7]/40 rounded-lg border border-[#FDE68A] text-xs text-[#92400E] w-full text-left space-y-1">
              <p>📍 <strong>Livraison :</strong> {selectedZone?.arrondissement} ({selectedZone?.neighborhood})</p>
              <p>⏱ <strong>Délai estimé :</strong> {selectedZone?.estimatedTime}</p>
              <p>💳 <strong>Paiement :</strong> {paymentMethod === 'orange_money' ? 'Orange Money' : paymentMethod === 'visa_mastercard' ? 'Carte Bancaire Visa/Mastercard' : 'Paiement à la livraison'}</p>
            </div>
            <div className="flex gap-4 w-full mt-4">
              <Link href="/account" className="flex-1">
                <Button className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
                  Suivre mes commandes
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-[#EADBC8] text-[#1E3F20]">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      <header className="border-b border-[#EADBC8] bg-white/85 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/cart" className="flex items-center gap-2 text-[#1E3F20] font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour au panier
        </Link>
        <h1 className="font-serif text-xl font-bold text-[#1E3F20]">Tunnel de Commande</h1>
        <div className="w-24"></div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Coordonnées */}
            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                  <span>1.</span> Vos Coordonnées à Bangui
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ex: Jean-Marc Kosh"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone / WhatsApp</Label>
                    <Input
                      id="phone"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Ex: +236 75 00 00 00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Livraison par Arrondissement */}
            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#D97706]" /> 2. Zone de Livraison à Bangui
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zone">Sélectionnez votre Arrondissement et Quartier</Label>
                  <Select value={selectedZoneId} onValueChange={setSelectedZoneId}>
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="-- Choisir votre zone de livraison --" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(z => (
                        <SelectItem key={z.id} value={z.id.toString()}>
                          {z.arrondissement} - {z.neighborhood} ({Number(z.fee).toLocaleString()} XAF)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse précise de livraison (Rue, repère)</Label>
                  <Input
                    id="address"
                    required
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: Avenue des Martyrs, près de la pharmacie..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 3. Paiement */}
            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#D97706]" /> 3. Mode de Paiement Sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-3">
                  <div className="flex items-center space-x-3 border border-[#EADBC8] p-3 rounded-lg cursor-pointer hover:bg-[#FDFBF7]">
                    <RadioGroupItem value="orange_money" id="om" />
                    <Label htmlFor="om" className="flex items-center gap-2 font-medium cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5 text-orange-600" /> Orange Money Centrafrique
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-[#EADBC8] p-3 rounded-lg cursor-pointer hover:bg-[#FDFBF7]">
                    <RadioGroupItem value="visa_mastercard" id="visa" />
                    <Label htmlFor="visa" className="flex items-center gap-2 font-medium cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 text-blue-600" /> Carte Bancaire (Visa / Mastercard)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-[#EADBC8] p-3 rounded-lg cursor-pointer hover:bg-[#FDFBF7]">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 font-medium cursor-pointer flex-1">
                      💵 Paiement à la livraison (Espèces)
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "orange_money" && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-2 mt-4">
                    <Label htmlFor="orangePhone" className="text-orange-900 font-medium">Numéro Orange Money pour la transaction</Label>
                    <Input
                      id="orangePhone"
                      value={orangePhone}
                      onChange={e => setOrangePhone(e.target.value)}
                      placeholder="+236 77 XX XX XX"
                    />
                    <p className="text-xs text-orange-700">Une demande de validation sécurisée sera envoyée sur votre mobile.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-[#EADBC8] bg-white shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-[#1E3F20]">Votre Panier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} (x{item.quantity})</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString()} XAF</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#EADBC8] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{subtotal.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span>{deliveryFee.toLocaleString()} XAF</span>
                  </div>
                  <div className="border-t border-[#EADBC8] pt-2 flex justify-between font-serif text-lg font-bold text-[#1E3F20]">
                    <span>Total à payer</span>
                    <span>{totalAmount.toLocaleString()} XAF</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white py-6 text-base font-medium mt-4 shadow-md"
                >
                  {isSubmitting ? "Traitement en cours..." : "Confirmer et Commander"}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#D97706]" /> Protocoles HTTPS & Sécurité Garantis
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
