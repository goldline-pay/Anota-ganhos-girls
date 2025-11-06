import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, loading } = useAuth();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const earningsQuery = trpc.earnings.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.earnings.create.useMutation({
    onSuccess: () => {
      toast.success("Ganho adicionado!");
      setAmount("");
      setDuration("");
      setPaymentMethod("");
      earningsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar");
    },
  });

  const deleteMutation = trpc.earnings.delete.useMutation({
    onSuccess: () => {
      toast.success("Ganho removido!");
      earningsQuery.refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !duration || !paymentMethod) {
      toast.error("Preencha todos os campos");
      return;
    }
    createMutation.mutate({
      amount: parseFloat(amount),
      currency: currency as "GBP" | "EUR" | "USD",
      duration: parseInt(duration),
      paymentMethod: paymentMethod as any,
      date: new Date().toISOString().split("T")[0],
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">💰 {APP_TITLE}</h1>
          <p className="text-center mb-6 text-gray-600">Faça login para começar a anotar seus ganhos</p>
          <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
            Entrar com Manus
          </Button>
        </Card>
      </div>
    );
  }

  const earnings = earningsQuery.data || [];
  const totals = earnings.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">💰 {APP_TITLE}</h1>
          <p className="text-sm text-gray-600">Olá, {user.name}</p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Adicionar Ganho</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150.50"
                />
              </div>
              <div>
                <Label>Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
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
                  placeholder="60"
                />
              </div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adicionando..." : "Adicionar Ganho"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Totais</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">GBP</p>
              <p className="text-2xl font-bold">£{(totals.GBP || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">EUR</p>
              <p className="text-2xl font-bold">€{(totals.EUR || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">USD</p>
              <p className="text-2xl font-bold">${(totals.USD || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Histórico</h2>
          {earnings.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum ganho registrado ainda</p>
          ) : (
            <div className="space-y-2">
              {earnings.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">
                      {e.currency === "GBP" && "£"}
                      {e.currency === "EUR" && "€"}
                      {e.currency === "USD" && "$"}
                      {e.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {e.duration}min • {e.paymentMethod} • {e.date}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: e.id })}
                    disabled={deleteMutation.isPending}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
