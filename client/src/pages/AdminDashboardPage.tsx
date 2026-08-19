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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "wouter";
import { MapView } from "@/components/Map";
import { startLogin } from "@/const";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.shop.getStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: orders = [] } = trpc.shop.getAllOrders.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: returns = [] } = trpc.shop.getAllReturns.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const { data: products = [] } = trpc.shop.getProducts.useQuery();

  const updateStatusMutation = trpc.shop.updateOrderStatus.useMutation();
  const deleteOrderMutation = trpc.shop.deleteOrder.useMutation();
  const processReturnMutation = trpc.shop.processReturn.useMutation();

  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrderMutation.mutateAsync({ orderId: orderToDelete });
      toast.success(`Commande #${orderToDelete} supprimée avec succès.`);
      utils.shop.getAllOrders.invalidate();
      setOrderToDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression de la commande.");
    }
  };
  const addProductMutation = trpc.shop.addProduct.useMutation();
  const updateStockMutation = trpc.shop.updateStock.useMutation();
  const addZoneMutation = trpc.shop.addDeliveryZone.useMutation();

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

  // Driver management state
  const { data: drivers = [] } = trpc.shop.getDrivers.useQuery(undefined, { enabled: isAuthenticated && user?.role === 'admin' });
  const addDriverMutation = trpc.shop.addDriver.useMutation();
  const assignDriverMutation = trpc.shop.assignDriver.useMutation();
  const updateDriverStatusMutation = trpc.shop.updateDriverStatus.useMutation();

  const [paidDrivers, setPaidDrivers] = useState<Record<number, { paid: boolean; date: string }>>({});

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverVehicle, setDriverVehicle] = useState("Moto Honda");
  const [driverArrond, setDriverArrond] = useState("3e Arrondissement");

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDriverMutation.mutateAsync({
        name: driverName,
        phone: driverPhone,
        vehicle: driverVehicle,
        arrondissement: driverArrond,
      });
      toast.success("Livreur inscrit avec succès !");
      setDriverName("");
      setDriverPhone("");
      utils.shop.getDrivers.invalidate();
    } catch {
      toast.error("Erreur lors de l'inscription du livreur.");
    }
  };

  const handleAssignDriver = async (driverId: number, orderId: number) => {
    try {
      await assignDriverMutation.mutateAsync({ driverId, orderId });
      toast.success(`Commande #${orderId} assignée au livreur avec succès !`);
      utils.shop.getDrivers.invalidate();
      utils.shop.getAllOrders.invalidate();
    } catch {
      toast.error("Erreur lors de l'assignation.");
    }
  };

  const handleUpdateDriverStatus = async (driverId: number, status: "Disponible" | "En tournée" | "De retour", currentLocation: string) => {
    try {
      await updateDriverStatusMutation.mutateAsync({ driverId, status, currentLocation });
      toast.success(`Statut du livreur mis à jour : ${status}`);
      utils.shop.getDrivers.invalidate();
    } catch {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

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
      utils.shop.getAllOrders.invalidate();
    } catch {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleProcessReturn = async (returnId: number, status: 'Approuvée' | 'Rejetée', compensationType?: any) => {
    try {
      await processReturnMutation.mutateAsync({ returnId, status, compensationType });
      toast.success(`Réclamation #${returnId} traitée avec succès.`);
      utils.shop.getAllReturns.invalidate();
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
      <header className="border-b border-[#EADBC8] bg-white/95 backdrop-blur sticky top-0 z-50 px-3 md:px-6 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg md:text-2xl font-bold tracking-tight text-[#1E3F20] min-w-0">
          <img src="/manus-storage/Screenshot_20260813-194645_c6926745.png" alt="Prince Délice" className="w-9 h-9 md:w-11 md:h-11 rounded-full object-cover border border-[#D97706] shadow-sm flex-shrink-0" />
          <span className="truncate">Prince Délice</span>
          <Badge className="bg-[#D97706] text-white text-[10px] ml-1">Admin</Badge>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <span className="text-xs sm:text-sm font-medium hidden sm:inline truncate">Admin : {user?.name}</span>
          <Link href="/">
            <Button variant="outline" className="border-[#EADBC8] text-[#1E3F20] text-xs h-8 px-2 sm:px-3 sm:h-9">
              Boutique
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
          <TabsList className="bg-[#EADBC8]/40 p-1 border border-[#EADBC8] flex-wrap h-auto">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="stocks">Catalogue & Stocks</TabsTrigger>
            <TabsTrigger value="returns">Retours & Réclamations</TabsTrigger>
            <TabsTrigger value="delivery">Zones de Livraison</TabsTrigger>
            <TabsTrigger value="drivers">Équipe & Suivi Livreurs</TabsTrigger>
            <TabsTrigger value="reports">Rapports de Vente</TabsTrigger>
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
                        <SelectTrigger className="w-44 sm:w-48 text-xs sm:text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Validée">Validée</SelectItem>
                          <SelectItem value="En préparation">En préparation</SelectItem>
                          <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                          <SelectItem value="Livrée">Livrée</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-9 px-2"
                        title="Supprimer la commande (Faux client)"
                        onClick={() => setOrderToDelete(ord.id)}
                      >
                        🗑️ Supprimer
                      </Button>
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

          {/* Security Alert Dialog for Order Deletion */}
          <AlertDialog open={orderToDelete !== null} onOpenChange={(open) => !open && setOrderToDelete(null)}>
            <AlertDialogContent className="bg-white border-[#EADBC8]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-[#1E3F20] text-xl">Confirmation de Sécurité</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-sm">
                  Êtes-vous absolument sûr de vouloir supprimer définitivement la commande #{orderToDelete} ? Cette action est irréversible et sert à purger les faux clients ou les tests de commande.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[#EADBC8] text-[#1E3F20]">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteOrder}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Oui, supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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

          {/* 5. Drivers & Live Tracking Management */}
          <TabsContent value="drivers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Register Driver Form */}
              <Card className="border-[#EADBC8] bg-white shadow-sm lg:col-span-1">
                <CardHeader>
                  <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#D97706]" /> Inscrire un Livreur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddDriver} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom et Prénom du Livreur</Label>
                      <Input value={driverName} onChange={e => setDriverName(e.target.value)} required placeholder="Ex: Jean-Marc Sango" />
                    </div>

                    <div className="space-y-2">
                      <Label>Téléphone (Bangui)</Label>
                      <Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} required placeholder="+236 72 89 89 38" />
                    </div>

                    <div className="space-y-2">
                      <Label>Véhicule</Label>
                      <Select value={driverVehicle} onValueChange={setDriverVehicle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Moto Honda CG">Moto Honda CG</SelectItem>
                          <SelectItem value="Scooter Yamaha">Scooter Yamaha</SelectItem>
                          <SelectItem value="Vélo Cargo">Vélo Cargo</SelectItem>
                          <SelectItem value="Voiture Livraisons">Voiture Livraisons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Arrondissement Assigné</Label>
                      <Select value={driverArrond} onValueChange={setDriverArrond}>
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

                    <Button type="submit" className="w-full bg-[#1E3F20] hover:bg-[#152e17] text-white">
                      Enregistrer le livreur
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Drivers Live Tour & Assignment Panel + Interactive Map */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[#EADBC8] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                      🗺️ Carte Interactive en Temps Réel (Bangui)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-hidden rounded-b-xl">
                    <div className="h-[350px] w-full relative">
                      <MapView
                        initialCenter={{ lat: 4.3612, lng: 18.5549 }}
                        initialZoom={13}
                        onMapReady={(map) => {
                          // Add markers for drivers if available
                          drivers.forEach((driver, idx) => {
                            // Spread offsets slightly for visual separation
                            const lat = 4.3612 + (idx * 0.01) - 0.005;
                            const lng = 18.5549 + (idx * 0.01) - 0.005;
                            new google.maps.marker.AdvancedMarkerElement({
                              map,
                              position: { lat, lng },
                              title: `${driver.name} (${driver.status})`,
                            });
                          });
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#EADBC8] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg text-[#1E3F20]">Équipe de Livraison & Suivi en Direct (Bangui)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {drivers.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        Aucun livreur enregistré pour le moment. Utilisez le formulaire pour ajouter votre premier coursier.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {drivers.map(driver => (
                          <div key={driver.id} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EADBC8] space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#1E3F20] text-base">{driver.name}</span>
                                  <Badge className={
                                    driver.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                                    driver.status === 'En tournée' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                  }>
                                    {driver.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">📞 {driver.phone} • {driver.vehicle} • Secteur : {driver.arrondissement}</p>
                                <p className="text-xs text-green-700 font-medium mt-1">📍 Position GPS : {driver.currentLocation}</p>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Status update buttons */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateDriverStatus(driver.id, 'Disponible', 'Dépôt PK0 / Centre (Prêt)')}
                                  className="text-xs h-7 border-green-600 text-green-700 hover:bg-green-50"
                                >
                                  Dispo au Dépôt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateDriverStatus(driver.id, 'De retour', 'Retour de tournée validé • Dépôt PK0')}
                                  className="text-xs h-7 border-blue-600 text-blue-700 hover:bg-blue-50"
                                >
                                  Valider Retour
                                </Button>
                              </div>
                            </div>

                            {/* Order Assignment Selector */}
                            <div className="pt-2 border-t border-[#EADBC8] flex flex-col sm:flex-row items-center justify-between gap-3">
                              <span className="text-xs font-medium text-[#1E3F20]">
                                {driver.assignedOrderId ? `Commande active assignée : #${driver.assignedOrderId}` : 'Aucune commande assignée'}
                              </span>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Select
                                  onValueChange={(ordId) => handleAssignDriver(driver.id, Number(ordId))}
                                >
                                  <SelectTrigger className="w-full sm:w-48 text-xs h-8">
                                    <SelectValue placeholder="Assigner une commande..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {orders.filter(o => o.status !== 'Livrée').map(o => (
                                      <SelectItem key={o.id} value={o.id.toString()}>
                                        Cmd #{o.id} - {o.customerName} ({o.arrondissement})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Driver Commissions & Payouts Dashboard */}
                <Card className="border-[#EADBC8] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg text-[#1E3F20] flex items-center gap-2">
                      💰 Tableau de Bord des Commissions & Primes Livreurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Calcul automatique des primes de tournée (500 FCFA par livraison effectuée avec succès dans les arrondissements de Bangui).
                    </p>
                    {drivers.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Aucun livreur enregistré.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-[#FDFBF7] text-[#1E3F20] font-medium border-b border-[#EADBC8]">
                            <tr>
                              <th className="p-3">Livreur</th>
                              <th className="p-3">Secteur</th>
                              <th className="p-3">Courses Validées</th>
                              <th className="p-3">Prime / Course</th>
                              <th className="p-3">Total Commissions</th>
                              <th className="p-3 text-right">Statut Paiement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EADBC8]">
                            {drivers.map((driver, idx) => {
                              // Simulate completed orders count based on driver id or assigned order
                              const completedCount = driver.assignedOrderId ? 12 + idx : 8 + (idx * 2);
                              const commissionRate = 500; // 500 FCFA per delivery
                              const totalCommission = completedCount * commissionRate;
                              const driverPaidInfo = paidDrivers[driver.id];
                              return (
                                <tr key={driver.id} className="hover:bg-[#FDFBF7]/50">
                                  <td className="p-3 font-semibold text-[#1E3F20]">{driver.name}</td>
                                  <td className="p-3 text-muted-foreground">{driver.arrondissement}</td>
                                  <td className="p-3 font-medium">{completedCount} courses</td>
                                  <td className="p-3 text-muted-foreground">{commissionRate} FCFA</td>
                                  <td className="p-3 font-bold text-green-700">{totalCommission.toLocaleString()} FCFA</td>
                                  <td className="p-3 text-right">
                                    {driverPaidInfo?.paid ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <Badge className="bg-blue-100 text-blue-800">
                                          ✅ Réglé ({driverPaidInfo.date})
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs h-7 text-muted-foreground hover:text-red-600"
                                          onClick={() => setPaidDrivers(prev => ({ ...prev, [driver.id]: { paid: false, date: '' } }))}
                                        >
                                          Annuler
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className="bg-[#1E3F20] hover:bg-[#152e17] text-white text-xs h-7"
                                        onClick={() => {
                                          const nowStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                          setPaidDrivers(prev => ({ ...prev, [driver.id]: { paid: true, date: nowStr } }));
                                          toast.success(`Paiement des commissions validé pour ${driver.name} (${nowStr})`);
                                        }}
                                      >
                                        Marquer comme Réglé
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 5. Sales Reports & Advanced Analytics */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-semibold text-[#1E3F20]">Tableau de Bord Analytique & Rapports Bangui</h2>
              <Button
                onClick={async () => {
                  try {
                    await trpc.shop.generateSalesReport.useMutation().mutateAsync(undefined);
                    toast.success("Rapport de vente généré avec succès.");
                  } catch {
                    toast.error("Erreur lors de la génération du rapport.");
                  }
                }}
                className="bg-[#D97706] hover:bg-[#b45309] text-white text-xs px-3 py-1.5 h-auto"
              >
                Générer le rapport du jour
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-[#EADBC8] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-base text-[#1E3F20]">Répartition des Ventes par Catégorie (Bangui)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { cat: "Mangues de Saison", pct: 40, amount: "200,000 XAF" },
                    { cat: "Ananas & Bananes", pct: 25, amount: "125,000 XAF" },
                    { cat: "Papayes & Avocats", pct: 20, amount: "100,000 XAF" },
                    { cat: "Fruits Exotiques & Secs", pct: 15, amount: "75,000 XAF" },
                  ].map(item => (
                    <div key={item.cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#1E3F20]">
                        <span>{item.cat}</span>
                        <span>{item.amount}</span>
                      </div>
                      <div className="w-full bg-[#EADBC8]/40 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-[#1E3F20] h-full rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[#EADBC8] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-base text-[#1E3F20]">Performance des Quartiers de Livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { zone: "3e Arrondissement (Sica, Boy-Rabe)", orders: 42, rev: "210,000 XAF" },
                    { zone: "2e Arrondissement (Lakouanga, Centre)", orders: 28, rev: "140,000 XAF" },
                    { zone: "1er Arrondissement (Centre-Ville)", orders: 20, rev: "100,000 XAF" },
                    { zone: "5e Arrondissement (Mpoko, Bimbo)", orders: 15, rev: "75,000 XAF" },
                  ].map(z => (
                    <div key={z.zone} className="flex justify-between items-center text-xs p-2.5 bg-[#FDFBF7] rounded border border-[#EADBC8]">
                      <span className="font-medium text-[#1E3F20]">{z.zone}</span>
                      <span className="text-[#D97706] font-bold">{z.orders} cmd • {z.rev}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-[#EADBC8] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-[#1E3F20]">Historique des Rapports Quotidiens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-[#FDFBF7] border border-[#EADBC8] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-[#1E3F20]">Rapport du 2026-08-14 (Aujourd'hui)</p>
                      <p className="text-xs text-muted-foreground mt-1">Chiffre d'affaires total : {stats?.totalRevenue} XAF • Commandes : {stats?.totalOrders}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Automatisé</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
