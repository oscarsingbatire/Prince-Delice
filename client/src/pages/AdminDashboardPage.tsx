import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, AlertTriangle, ShieldCheck, Truck, Plus, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: orders = [] } = trpc.admin.getAllOrders.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: returns = [] } = trpc.admin.getAllReturns.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: products = [] } = trpc.shop.getProducts.useQuery();

  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation();
  const processReturnMutation = trpc.admin.processReturn.useMutation();
  const addProductMutation = trpc.admin.addProduct.useMutation();
  const updateStockMutation = trpc.admin.updateStock.useMutation();
  const addZoneMutation = trpc.admin.addDeliveryZone.useMutation();

  // New product state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mangues");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newStock, setNewStock] = useState("50");
  const [newImg, setNewImg] = useState("https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80");

  // New zone state
  const [zoneArrond, setZoneArrond] = useState("1er Arrondissement");
  const [zoneNeigh, setZoneNeigh] = useState("");
  const [zoneFee, setZoneFee] = useState("1000");
  const [zoneTime, setZoneTime] = useState("30-45 min");

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#EADBC8] bg-white text-center p-8 shadow-md">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              🚫
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1E3F20]">Accès Réservé aux Administrateurs</h1>
            <p className="text-muted-foreground text-sm">
              Vous devez vous connecter avec un compte administrateur pour accéder à ce back-office.
            </p>
            <Button onClick={() => startLogin()} className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
              Se connecter
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

  const handleUpdateOrderStatus = async (orderId: number, status: any) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Statut de la commande #${orderId} mis à jour : ${status}`);
      utils.admin.getAllOrders.invalidate();
    } catch {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleProcessReturn = async (returnId: number, status: 'Approuvée' | 'Rejetée', compensationType?: any) => {
    try {
      await processReturnMutation.mutateAsync({ returnId, status, compensationType });
      toast.success(`Réclamation #${returnId} traitée avec succès.`);
      utils.admin.getAllReturns.invalidate();
    } catch {
      toast.error("Erreur lors du traitement de la réclamation.");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProductMutation.mutateAsync({
        name: newName,
        category: newCategory,
        description: newDesc,
        price: newPrice,
        unit: newUnit,
        stock: Number(newStock),
        lowStockThreshold: 10,
        freshnessStatus: "Fraîcheur optimale",
        imageUrl: newImg,
        featured: true,
      });
      toast.success("Produit ajouté avec succès.");
      setNewName("");
      setNewDesc("");
      setNewPrice("");
      utils.shop.getProducts.invalidate();
    } catch {
      toast.error("Erreur lors de l'ajout du produit.");
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addZoneMutation.mutateAsync({
        arrondissement: zoneArrond,
        neighborhood: zoneNeigh,
        fee: zoneFee,
        estimatedTime: zoneTime,
      });
      toast.success("Zone de livraison ajoutée avec succès.");
      setZoneNeigh("");
    } catch {
      toast.error("Erreur lors de l'ajout de la zone.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] flex flex-col font-sans">
      <header className="border-b border-[#EADBC8] bg-white/85 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold text-[#1E3F20]">
          <span>🍊</span> Fruits Centrafrique <Badge className="bg-[#D97706] text-white">Admin</Badge>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Admin : {user?.name}</span>
          <Link href="/">
            <Button variant="outline" className="border-[#EADBC8] text-[#1E3F20]">
              Voir la boutique
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#EADBC8] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Chiffre d'Affaires</p>
                <h3 className="text-2xl font-serif font-bold text-[#1E3F20] mt-1">{stats?.totalRevenue.toLocaleString()} XAF</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                <DollarSign className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#EADBC8] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Commandes</p>
                <h3 className="text-2xl font-serif font-bold text-[#1E3F20] mt-1">{stats?.totalOrders}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#EADBC8] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Alertes Stock Bas</p>
                <h3 className="text-2xl font-serif font-bold text-red-600 mt-1">{stats?.lowStockCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#EADBC8] bg-white shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Produits Actifs</p>
                <h3 className="text-2xl font-serif font-bold text-[#1E3F20] mt-1">{stats?.totalProducts}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Management */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-[#EADBC8]/40 p-1 border border-[#EADBC8]">
            <TabsTrigger value="orders">Gestion des Commandes</TabsTrigger>
            <TabsTrigger value="stocks">Catalogue & Stocks</TabsTrigger>
            <TabsTrigger value="returns">Retours & Réclamations</TabsTrigger>
            <TabsTrigger value="delivery">Zones de Livraison</TabsTrigger>
          </TabsList>

          {/* 1. Orders Management */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">Suivi et Mise à Jour des Commandes</h2>
            <div className="space-y-4">
              {orders.map(ord => (
                <Card key={ord.id} className="border-[#EADBC8] bg-white shadow-sm">
                  <CardHeader className="pb-3 border-b border-[#EADBC8] flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-lg text-[#1E3F20]">Commande #{ord.id} - {ord.customerName} ({ord.customerPhone})</CardTitle>
                      <p className="text-xs text-muted-foreground">{ord.arrondissement}, {ord.neighborhood} • Paiement: {ord.paymentMethod.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={ord.status}
                        onValueChange={(val: any) => handleUpdateOrderStatus(ord.id, val)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Validée">Validée</SelectItem>
                          <SelectItem value="En préparation">En préparation</SelectItem>
                          <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                          <SelectItem value="Livrée">Livrée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    {ord.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-muted-foreground">{item.productName} (x{item.quantity})</span>
                        <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString()} XAF</span>
                      </div>
                    ))}
                    <div className="border-t border-[#EADBC8] pt-2 flex justify-between font-serif font-bold text-[#1E3F20]">
                      <span>Total</span>
                      <span>{Number(ord.totalAmount).toLocaleString()} XAF</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 2. Stocks & Products */}
          <TabsContent value="stocks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">État des Stocks de Fruits Frais</h2>
                <div className="space-y-3">
                  {products.map(p => (
                    <Card key={p.id} className="border-[#EADBC8] bg-white shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-lg border" />
                          <div>
                            <h4 className="font-serif font-bold text-[#1E3F20]">{p.name}</h4>
                            <p className="text-xs text-muted-foreground">{p.category} • {Number(p.price).toLocaleString()} XAF / {p.unit}</p>
                            <Badge className={p.stock <= p.lowStockThreshold ? 'bg-red-100 text-red-800 mt-1' : 'bg-green-100 text-green-800 mt-1'}>
                              Stock: {p.stock} {p.unit}s
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            defaultValue={p.stock}
                            className="w-20 text-center"
                            onBlur={async (e) => {
                              const val = Number(e.target.value);
                              if (!isNaN(val)) {
                                await updateStockMutation.mutateAsync({ productId: p.id, stock: val });
                                toast.success(`Stock mis à jour pour ${p.name}`);
                                utils.shop.getProducts.invalidate();
                              }
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Card className="border-[#EADBC8] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg text-[#1E3F20]">Ajouter un Fruit au Catalogue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nom du fruit</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Ex: Mangues Amélie" />
                      </div>
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} required placeholder="Mangues, Ananas..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Prix (XAF)</Label>
                        <Input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} required placeholder="1500" />
                      </div>
                      <div className="space-y-2">
                        <Label>Unité</Label>
                        <Input value={newUnit} onChange={e => setNewUnit(e.target.value)} required placeholder="kg ou pièce" />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock initial</Label>
                        <Input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>URL de l'image</Label>
                        <Input value={newImg} onChange={e => setNewImg(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
                        Ajouter le produit
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 3. Returns & Claims */}
          <TabsContent value="returns" className="space-y-4">
            <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">Gestion des Retours et Réclamations (Produits Périssables)</h2>
            {returns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune réclamation en attente.</p>
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
                    <CardContent className="pt-4 space-y-4">
                      <p className="text-sm"><strong>Motif :</strong> {ret.reason}</p>
                      <div>
                        <a href={ret.photoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                          Voir la photo justificative fournie sous 24h
                        </a>
                      </div>

                      {ret.status === 'En attente' && (
                        <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#EADBC8] space-y-3">
                          <p className="text-xs font-semibold text-[#1E3F20]">Approuver avec compensation :</p>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => handleProcessReturn(ret.id, 'Approuvée', 'avoir')}
                              className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs"
                            >
                              Avoir (Crédit)
                            </Button>
                            <Button
                              onClick={() => handleProcessReturn(ret.id, 'Approuvée', 'remboursement')}
                              className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-xs"
                            >
                              Remboursement
                            </Button>
                            <Button
                              onClick={() => handleProcessReturn(ret.id, 'Approuvée', 'remplacement')}
                              className="bg-purple-700 hover:bg-purple-800 text-white text-xs"
                            >
                              Remplacement
                            </Button>
                            <Button
                              onClick={() => handleProcessReturn(ret.id, 'Rejetée')}
                              variant="destructive"
                              className="text-xs"
                            >
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 4. Delivery Zones */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-[#EADBC8] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-[#1E3F20]">Ajouter une Zone de Livraison à Bangui</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddZone} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Arrondissement</Label>
                      <Select value={zoneArrond} onValueChange={setZoneArrond}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1er Arrondissement">1er Arrondissement</SelectItem>
                          <SelectItem value="2e Arrondissement">2e Arrondissement</SelectItem>
                          <SelectItem value="3e Arrondissement">3e Arrondissement</SelectItem>
                          <SelectItem value="4e Arrondissement">4e Arrondissement</SelectItem>
                          <SelectItem value="5e Arrondissement">5e Arrondissement</SelectItem>
                          <SelectItem value="6e Arrondissement">6e Arrondissement</SelectItem>
                          <SelectItem value="7e Arrondissement">7e Arrondissement</SelectItem>
                          <SelectItem value="8e Arrondissement">8e Arrondissement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quartier</Label>
                      <Input value={zoneNeigh} onChange={e => setZoneNeigh(e.target.value)} required placeholder="Ex: Sica 2, PK5..." />
                    </div>

                    <div className="space-y-2">
                      <Label>Frais de livraison (XAF)</Label>
                      <Input type="number" value={zoneFee} onChange={e => setZoneFee(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Délai estimé</Label>
                      <Input value={zoneTime} onChange={e => setZoneTime(e.target.value)} required placeholder="30-45 min" />
                    </div>

                    <Button type="submit" className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
                      Ajouter la zone
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
