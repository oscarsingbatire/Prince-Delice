import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, ShieldCheck, AlertCircle, RefreshCw, Upload, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { toast } from "sonner";

export default function CustomerAccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: orders = [] } = trpc.shop.getUserOrders.useQuery(undefined, { enabled: isAuthenticated });
  const { data: returns = [] } = trpc.shop.getUserReturns.useQuery(undefined, { enabled: isAuthenticated });
  const updateMfaMutation = trpc.auth.updateMfa.useMutation();
  const submitReturnMutation = trpc.shop.submitReturn.useMutation();

  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [mfaMethod, setMfaMethod] = useState<"sms" | "app">(user?.mfaMethod || "app");
  const [phone, setPhone] = useState(user?.phone || "");

  // Return form state
  const [returnOrderId, setReturnOrderId] = useState<number | "" | string>("");
  const [returnReason, setReturnReason] = useState("");
  const [returnPhotoUrl, setReturnPhotoUrl] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#EADBC8] bg-white text-center p-8 shadow-md">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center text-3xl">
              🔐
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1E3F20]">Connexion Requise</h1>
            <p className="text-muted-foreground text-sm">
              Veuillez vous connecter pour accéder à votre espace client, suivre vos commandes et gérer vos réclamations.
            </p>
            <Button onClick={() => startLogin()} className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
              Se connecter avec Manus
            </Button>
            <Link href="/">
              <Button variant="ghost" className="text-sm text-[#1E3F20]">
                Retour à l'accueil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMfaMutation.mutateAsync({
        mfaEnabled,
        mfaMethod,
        phone,
      });
      toast.success("Paramètres de sécurité MFA mis à jour avec succès.");
      utils.auth.me.invalidate();
    } catch {
      toast.error("Erreur lors de la mise à jour du MFA.");
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId || !returnReason || !returnPhotoUrl) {
      toast.error("Veuillez remplir tous les champs et fournir une URL de photo (délai de 24h).");
      return;
    }

    setIsSubmittingReturn(true);
    try {
      await submitReturnMutation.mutateAsync({
        orderId: Number(returnOrderId),
        reason: returnReason,
        photoUrl: returnPhotoUrl,
      });
      toast.success("Réclamation transmise avec succès au service client.");
      setReturnReason("");
      setReturnPhotoUrl("");
      setReturnOrderId("");
      utils.shop.getUserReturns.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission de la réclamation.");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Validée":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Validée</Badge>;
      case "En préparation":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">En préparation</Badge>;
      case "En cours de livraison":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">En cours de livraison</Badge>;
      case "Livrée":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Livrée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      <header className="border-b border-[#EADBC8] bg-white/85 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-[#1E3F20]">
          <span>🍊</span> Fruits Centrafrique
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Bonjour, {user?.name}</span>
          <Button variant="outline" onClick={() => logout()} className="border-[#EADBC8] text-[#1E3F20]">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-[#1E3F20] mb-8">Mon Espace Client</h1>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-[#EADBC8]/40 p-1 border border-[#EADBC8]">
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20]">
              Suivi de Commandes
            </TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20]">
              Retours & Réclamations (24h)
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20]">
              Sécurité & MFA
            </TabsTrigger>
          </TabsList>

          {/* 1. Suivi de Commandes */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">Historique et Suivi en Temps Réel</h2>
            {orders.length === 0 ? (
              <Card className="border-[#EADBC8] bg-white text-center py-12">
                <CardContent>
                  <Package className="w-12 h-12 text-[#D97706] mx-auto mb-3" />
                  <p className="text-muted-foreground">Vous n'avez passé aucune commande pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(ord => (
                  <Card key={ord.id} className="border-[#EADBC8] bg-white shadow-sm">
                    <CardHeader className="pb-3 border-b border-[#EADBC8] flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-lg text-[#1E3F20]">Commande #{ord.id}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(ord.createdAt).toLocaleDateString()} - {ord.arrondissement}</p>
                      </div>
                      <div>{getStatusBadge(ord.status)}</div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        {ord.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.productName} (x{item.quantity})</span>
                            <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString()} XAF</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#EADBC8] pt-3 flex justify-between font-serif font-bold text-[#1E3F20]">
                        <span>Total Payé</span>
                        <span>{Number(ord.totalAmount).toLocaleString()} XAF</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 2. Retours & Réclamations */}
          <TabsContent value="returns" className="space-y-6">
            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-[#1E3F20]">Soumettre une réclamation (Délai de 24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReturn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Numéro de commande concernée</Label>
                    <Select value={returnOrderId.toString()} onValueChange={setReturnOrderId}>
                      <SelectTrigger id="orderId">
                        <SelectValue placeholder="-- Choisir une commande livrée --" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map(o => (
                          <SelectItem key={o.id} value={o.id.toString()}>
                            Commande #{o.id} ({o.arrondissement})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Motif de la réclamation (Défaut de fraîcheur, non-conformité)</Label>
                    <Input
                      id="reason"
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      placeholder="Décrivez le problème constaté sur les fruits..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">URL de la photo justificative (obligatoire sous 24h)</Label>
                    <Input
                      id="photoUrl"
                      value={returnPhotoUrl}
                      onChange={e => setReturnPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo-fruit.jpg"
                    />
                    <p className="text-xs text-muted-foreground">Conformément à notre politique, les réclamations pour produits périssables nécessitent une photo claire dans les 24h.</p>
                  </div>

                  <Button type="submit" disabled={isSubmittingReturn} className="bg-[#1E3F20] hover:bg-[#152e17] text-white">
                    {isSubmittingReturn ? "Envoi..." : "Soumettre la réclamation"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <h2 className="text-xl font-serif font-semibold text-[#1E3F20] pt-4">Suivi de vos Réclamations & Compensations</h2>
            {returns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune réclamation enregistrée.</p>
            ) : (
              <div className="space-y-4">
                {returns.map(ret => (
                  <Card key={ret.id} className="border-[#EADBC8] bg-white shadow-sm">
                    <CardHeader className="pb-3 border-b border-[#EADBC8] flex flex-row items-center justify-between">
                      <CardTitle className="font-serif text-base text-[#1E3F20]">Réclamation #{ret.id} (Commande #{ret.orderId})</CardTitle>
                      <Badge className={ret.status === 'Approuvée' ? 'bg-green-100 text-green-800' : ret.status === 'Rejetée' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                        {ret.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <p><strong>Motif :</strong> {ret.reason}</p>
                      {ret.compensationType && (
                        <p className="text-[#D97706] font-semibold">
                          Compensation accordée : {ret.compensationType.toUpperCase()}
                        </p>
                      )}
                      {ret.adminNotes && (
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">Note admin : {ret.adminNotes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 3. Sécurité & MFA */}
          <TabsContent value="security" className="space-y-4">
            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-[#1E3F20] flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#1E3F20]" /> Authentification Multi-Facteurs (MFA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveMfa} className="space-y-6 max-w-lg">
                  <div className="flex items-center justify-between border border-[#EADBC8] p-4 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Activer le MFA</Label>
                      <p className="text-xs text-muted-foreground">Sécurisez votre compte client ou administrateur avec une double authentification.</p>
                    </div>
                    <Switch
                      checked={mfaEnabled}
                      onCheckedChange={setMfaEnabled}
                    />
                  </div>

                  {mfaEnabled && (
                    <div className="space-y-4 p-4 bg-[#FDFBF7] rounded-lg border border-[#EADBC8]">
                      <div className="space-y-2">
                        <Label htmlFor="method">Méthode de validation MFA</Label>
                        <Select value={mfaMethod} onValueChange={(v: any) => setMfaMethod(v)}>
                          <SelectTrigger id="method">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="app">Application d'authentification (Google Authenticator / TOTP)</SelectItem>
                            <SelectItem value="sms">Code PIN par SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {mfaMethod === 'sms' && (
                        <div className="space-y-2">
                          <Label htmlFor="mfaPhone">Numéro de téléphone pour réception SMS</Label>
                          <Input
                            id="mfaPhone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+236 75 XX XX XX"
                          />
                        </div>
                      )}

                      {mfaMethod === 'app' && (
                        <div className="space-y-3 pt-2 border-t border-[#EADBC8]">
                          <p className="text-sm font-medium text-[#1E3F20]">Configuration Google Authenticator</p>
                          <p className="text-xs text-muted-foreground">Scannez ce QR code avec votre application Google Authenticator, Microsoft Authenticator ou Authy :</p>
                          <div className="bg-white p-4 rounded-xl border border-[#EADBC8] flex flex-col items-center justify-center gap-3">
                            <div className="w-40 h-40 bg-gray-900 text-white rounded-lg flex items-center justify-center p-2 text-center text-xs font-mono">
                              [QR CODE TOTP PRINCEDELICE]
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">Clé secrète : PD-MFA-CENTRAFRIQUE-2026</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="bg-[#1E3F20] hover:bg-[#152e17] text-white">
                    Enregistrer les paramètres de sécurité
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
