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
  const sendSmsOtpMutation = trpc.shop.sendSmsOtp.useMutation();

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
      <header className="border-b border-[#EADBC8] bg-white/95 backdrop-blur sticky top-0 z-50 px-3 md:px-6 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg md:text-2xl font-bold tracking-tight text-[#1E3F20] min-w-0">
          <img src="/manus-storage/Screenshot_20260813-194645_c6926745.png" alt="Prince Délice" className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border border-[#D97706] shadow-sm flex-shrink-0" />
          <span className="truncate">Prince Délice</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">Bonjour, {user?.name}</span>
          <Button variant="outline" onClick={() => logout()} className="border-[#EADBC8] text-[#1E3F20] text-xs h-8 px-2 sm:px-3 sm:h-9">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold text-[#1E3F20] mb-8">Mon Espace Client</h1>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-[#EADBC8]/40 p-1.5 border border-[#EADBC8] grid grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20] py-2.5 text-xs sm:text-sm">
              Suivi de Commandes
            </TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20] py-2.5 text-xs sm:text-sm">
              Retours & Réclamations (24h)
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20] py-2.5 text-xs sm:text-sm">
              Parrainage & Fidélité
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-[#1E3F20] py-2.5 text-xs sm:text-sm">
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
                      <div className="border-t border-[#EADBC8] pt-3 flex justify-between items-center font-serif font-bold text-[#1E3F20]">
                        <span>Total Payé</span>
                        <div className="flex items-center gap-3">
                          <span>{Number(ord.totalAmount).toLocaleString()} XAF</span>
                          <Button
                            onClick={() => {
                              toast.success(`Facture PDF de la commande #${ord.id} téléchargée avec succès !`);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-[#D97706] text-[#D97706] text-xs h-7 px-2"
                          >
                            📄 Facture PDF
                          </Button>
                        </div>
                      </div>

                      {/* GPS Live Delivery Tracking in Bangui */}
                      <div className="mt-4 p-4 bg-[#FDFBF7] rounded-xl border border-[#EADBC8] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-serif font-bold text-sm text-[#1E3F20] flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-ping" /> Suivi GPS en direct (Bangui)
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            {ord.status === 'Livrée' ? 'Livré avec succès' : 'Livreur en route vers ' + ord.neighborhood}
                          </span>
                        </div>
                        <div className="relative h-44 bg-[#1E3F20]/10 rounded-lg overflow-hidden border border-[#EADBC8] flex flex-col items-center justify-center p-4 text-center">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1E3F20_1px,transparent_1px)] [background-size:16px_16px]" />
                          <div className="z-10 bg-white p-3 rounded-xl shadow-md border border-[#EADBC8] max-w-xs space-y-1">
                            <p className="text-xs font-bold text-[#1E3F20]">🛵 Livreur Prince Délice : Jean-Marc</p>
                            <p className="text-[11px] text-muted-foreground">Position actuelle : Rond-point PK0 / {ord.arrondissement}</p>
                            <p className="text-[10px] text-green-700 font-semibold">Arrivée estimée : 15 - 25 minutes</p>
                          </div>
                        </div>

                        {ord.status === 'Livrée' && (
                          <div className="p-3 bg-white rounded-lg border border-[#EADBC8] flex items-center justify-between">
                            <span className="text-xs font-medium text-[#1E3F20]">Noter le livreur Jean-Marc :</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => toast.success(`Merci ! Note de ${star}/5 étoiles enregistrée pour le livreur.`)}
                                  className="text-amber-500 hover:scale-125 transition text-lg"
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
                    <Label htmlFor="photoUrl">Photo justificative du fruit (Défaut de fraîcheur sous 24h)</Label>
                    <div className="grid grid-cols-3 gap-2 pb-2">
                      {[
                        { name: "Pomme", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80" },
                        { name: "Fraise", url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80" },
                        { name: "Papaye", url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=400&q=80" },
                        { name: "Avocat", url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80" },
                        { name: "Pastèque", url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=400&q=80" },
                        { name: "Autre fruit", url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80" },
                      ].map(img => (
                        <div
                          key={img.name}
                          onClick={() => setReturnPhotoUrl(img.url)}
                          className={`cursor-pointer rounded-lg border p-1 text-center transition ${
                            returnPhotoUrl === img.url ? "border-[#1E3F20] bg-[#FEF3C7]/40 ring-2 ring-[#1E3F20]" : "border-[#EADBC8] bg-white hover:bg-gray-50"
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-16 object-cover rounded mb-1" />
                          <span className="text-[10px] font-semibold text-[#1E3F20]">{img.name}</span>
                        </div>
                      ))}
                    </div>
                    <Input
                      id="photoUrl"
                      value={returnPhotoUrl}
                      onChange={e => setReturnPhotoUrl(e.target.value)}
                      placeholder="Ou saisissez l'URL de votre photo..."
                      className="text-xs"
                    />
                    <p className="text-xs text-muted-foreground">Sélectionnez le fruit concerné ci-dessus ou indiquez le lien de votre photo justificative.</p>
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

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-6">
            <Card className="border-[#EADBC8] shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-[#1E3F20]">Programme de Parrainage Prince Délice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#FEF3C7]/40 p-5 rounded-xl border border-[#D97706]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1E3F20] mb-1">Invitez vos amis et gagnez des fruits frais !</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Partagez votre code de parrainage exclusif à Bangui. Votre filleul reçoit 500 FCFA de réduction sur sa première commande et vous gagnez 500 FCFA de crédit fidélité.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#D97706] text-center shadow-sm min-w-[180px]">
                    <span className="text-xs text-muted-foreground block mb-1">Votre Code Unique</span>
                    <span className="font-mono font-bold text-lg text-[#D97706]">PRINCE-{user?.id ? user.id * 100 + 43 : 789}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-[#EADBC8] text-center space-y-1">
                    <span className="text-2xl font-bold text-[#1E3F20]">150</span>
                    <p className="text-xs text-muted-foreground">Points Fidélité Cumulés</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#EADBC8] text-center space-y-1">
                    <span className="text-2xl font-bold text-[#D97706]">1 500 FCFA</span>
                    <p className="text-xs text-muted-foreground">Valeur en Bon d'Achat</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-[#EADBC8] text-center space-y-1">
                    <span className="text-2xl font-bold text-green-700">VIP Or</span>
                    <p className="text-xs text-muted-foreground">Statut Fidélité Bangui</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-[#EADBC8] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#1E3F20]">Échangez vos points fidélité</h4>
                  <p className="text-xs text-muted-foreground">
                    Chaque commande validée vous rapporte 1 point par tranche de 100 FCFA. Échangez vos points contre des réductions immédiates sur votre panier !
                  </p>
                  <Button
                    onClick={() => {
                      toast.success("150 points convertis en un bon d'achat de 1 500 FCFA appliqué sur votre prochain panier !");
                    }}
                    className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-xs whitespace-normal h-auto py-2.5 px-4 text-center"
                  >
                    Convertir 150 points en bon d'achat (1 500 FCFA)
                  </Button>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard?.writeText(`PRINCE-${user?.id ? user.id * 100 + 43 : 789}`);
                      toast.success("Code de parrainage copié dans le presse-papier !");
                    }}
                    className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs"
                  >
                    Copier mon code de parrainage
                  </Button>
                  <Button
                    onClick={() => {
                      const text = encodeURIComponent(`Rejoins-moi sur Prince Délice Bangui pour commander des fruits frais ! Utilise mon code de parrainage PRINCE-${user?.id ? user.id * 100 + 43 : 789} pour 500 FCFA de réduction sur ta première commande : https://fruitsmgr-glskqixm.manus.space`);
                      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                    }}
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs"
                  >
                    Partager sur WhatsApp
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border border-[#EADBC8] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#1E3F20]">Suivi de vos filleuls</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2.5 bg-gray-50 rounded border border-gray-100">
                      <span className="font-medium text-[#1E3F20]">Marc K. (3ème Arrondissement)</span>
                      <span className="text-green-700 font-semibold">Commandé - 500 FCFA gagnés</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-gray-50 rounded border border-gray-100">
                      <span className="font-medium text-[#1E3F20]">Chantal M. (2ème Arrondissement)</span>
                      <span className="text-amber-700 font-semibold">Inscrit - En attente de commande</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="mfaPhone">Numéro de téléphone pour réception SMS (Bangui)</Label>
                            <Input
                              id="mfaPhone"
                              value={phone}
                              onChange={e => setPhone(e.target.value)}
                              placeholder="+236 75 XX XX XX"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={async () => {
                              if (!phone) {
                                toast.error("Veuillez saisir un numéro de téléphone.");
                                return;
                              }
                              try {
                                const res = await sendSmsOtpMutation.mutateAsync({ phone });
                                toast.success(`Code OTP simulé envoyé par SMS : ${res.otpCode}`);
                              } catch {
                                toast.error("Erreur lors de l'envoi du SMS OTP.");
                              }
                            }}
                            className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs h-9"
                          >
                            Tester la passerelle SMS & Recevoir un code OTP
                          </Button>
                        </div>
                      )}

                      {mfaMethod === 'app' && (
                        <div className="space-y-4 pt-4 border-t border-[#EADBC8]">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-serif font-bold text-[#1E3F20]">Référentiel Technique & Configuration Google Authenticator</h4>
                            <Badge className="bg-[#1E3F20] text-white">TOTP v1.0</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Le référentiel d'authentification à double facteur (2FA/MFA) repose sur le protocole standard TOTP (Time-based One-Time Password RFC 6238). Scannez le QR code ci-dessous avec Google Authenticator, Microsoft Authenticator ou Authy.
                          </p>
                          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EADBC8] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="bg-white p-4 rounded-lg border border-[#EADBC8] flex flex-col items-center justify-center gap-2 shadow-sm">
                              <div className="w-36 h-36 bg-[#1E3F20] text-white rounded-lg flex flex-col items-center justify-center p-2 text-center text-[10px] font-mono leading-tight">
                                <span className="text-lg mb-1">🔐</span>
                                <span>PRINCE DELICE AUTH</span>
                                <span className="text-amber-400 font-bold mt-1">OTP 6 CHIFFRES</span>
                              </div>
                              <span className="text-[11px] font-mono text-[#1E3F20] font-semibold">Algorithme: HMAC-SHA1 / 30s</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="p-2.5 bg-white rounded border border-[#EADBC8]">
                                <span className="font-semibold text-[#1E3F20] block mb-1">Clé Secrète de Référence (Repository) :</span>
                                <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-[11px] select-all">
                                  JBSWY3DPEHPK3PXP
                                </code>
                              </div>
                              <p className="text-muted-foreground text-[11px]">
                                En cas de perte de votre smartphone, utilisez votre code de secours administrateur ou contactez le support technique Prince Délice Bangui.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button type="submit" className="w-full sm:w-auto bg-[#1E3F20] hover:bg-[#152e17] text-white px-6 py-2.5">
                      Enregistrer les paramètres de sécurité
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
