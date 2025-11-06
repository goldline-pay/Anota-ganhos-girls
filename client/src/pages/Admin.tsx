import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Admin() {
  const [editingEarning, setEditingEarning] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");

  const usersQuery = trpc.admin.listUsers.useQuery();
  const earningsQuery = trpc.admin.listAllEarnings.useQuery();

  const updateMutation = trpc.admin.updateEarning.useMutation({
    onSuccess: () => {
      toast.success("Ganho atualizado!");
      setEditingEarning(null);
      earningsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.admin.deleteEarning.useMutation({
    onSuccess: () => {
      toast.success("Ganho removido!");
      earningsQuery.refetch();
    },
  });

  const users = usersQuery.data || [];
  const earnings = earningsQuery.data || [];

  const handleEdit = (earning: any) => {
    setEditingEarning(earning);
    setAmount((earning.amount / 100).toString());
    setCurrency(earning.currency);
    setDuration(earning.duration.toString());
    setPaymentMethod(earning.paymentMethod);
    setDate(earning.date);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !duration || !paymentMethod || !date) {
      toast.error("Preencha todos os campos");
      return;
    }
    updateMutation.mutate({
      id: editingEarning.id,
      amount: parseFloat(amount),
      currency: currency as "GBP" | "EUR" | "USD",
      duration: parseInt(duration),
      paymentMethod: paymentMethod as any,
      date,
    });
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User #${userId}`;
  };

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        backgroundImage: "url(/bg-feminine.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            👑 Painel Admin
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
              ← Voltar
            </Button>
          </Link>
        </div>

        {/* Usuárias */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Usuárias Cadastradas</h2>
          <div className="space-y-2">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma usuária cadastrada</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === "admin" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role === "admin" ? "👑 Admin" : "👤 Usuária"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Todos os Ganhos */}
        <Card className="p-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Todos os Ganhos</h2>
          {earnings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum ganho registrado</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {earnings.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-800">
                      {e.currency === "GBP" && "£"}
                      {e.currency === "EUR" && "€"}
                      {e.currency === "USD" && "$"}
                      {(e.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getUserName(e.userId)} • {e.duration}min • {e.paymentMethod} • {e.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(e)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: e.id })}
                      disabled={deleteMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingEarning} onOpenChange={() => setEditingEarning(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Editar Ganho</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-pink-200"
                />
              </div>
              <div>
                <Label>Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="border-pink-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="border-pink-200"
                />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="border-pink-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Revolut">Revolut</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Wise">Wise</SelectItem>
                    <SelectItem value="AIB">AIB</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-pink-200"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingEarning(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
