import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCustomAuth } from "@/hooks/useCustomAuth";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, token, logout } = useCustomAuth();

  const [currentWeek, setCurrentWeek] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form para nova anotação
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!token) return;

    try {
      // Carregar semana corrente
      const weekRes = await fetch("/api/trpc/week.current", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const weekData = await weekRes.json();
      setCurrentWeek(weekData.result?.data);

      // Carregar estatísticas
      const statsRes = await fetch("/api/trpc/week.stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const statsData = await statsRes.json();
      setStats(statsData.result?.data);

      // Carregar anotações
      const earningsRes = await fetch("/api/trpc/earnings.list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const earningsData = await earningsRes.json();
      setEarnings(earningsData.result?.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWeek = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/trpc/week.start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao iniciar Top");

      toast.success("Top de 7 Dias iniciado!");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStopWeek = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/trpc/week.stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao parar Top");

      toast.success("Top desativado!");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch("/api/trpc/earnings.create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          durationMinutes: parseInt(duration),
          paymentMethod,
          date,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar anotação");

      toast.success("Anotação criada!");
      setAmount("");
      setDuration("");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteEarning = async (id: number) => {
    if (!token || !confirm("Deletar esta anotação?")) return;

    try {
      const response = await fetch("/api/trpc/earnings.delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Erro ao deletar");

      toast.success("Anotação deletada!");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (cents: number, curr: string) => {
    const value = cents / 100;
    const symbol = curr === "GBP" ? "£" : curr === "EUR" ? "€" : "$";
    return `${symbol}${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">💰 Anota Ganhos Girls</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

        {/* Status do Top */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Top de 7 Dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWeek && currentWeek.isActive ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ Top Ativo</p>
                <p className="text-sm text-slate-600">
                  Iniciado em: {currentWeek.weekStartDate}
                </p>
                <Button variant="destructive" onClick={handleStopWeek}>
                  Desativar Top
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-600">Nenhum Top ativo</p>
                <Button onClick={handleStartWeek}>
                  Iniciar Top de 7 Dias
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">GBP</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalGbp, "GBP")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">EUR</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEur, "EUR")}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">USD</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalUsd, "USD")}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-600">Total de anotações: {stats.earningsCount}</p>
                <p className="text-sm text-slate-600">Duração total: {stats.totalDuration} min</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Nova Anotação */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Anotação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEarning} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="150.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Adicionar Anotação
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Anotações */}
        <Card>
          <CardHeader>
            <CardTitle>Anotações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <p className="text-slate-600 text-center py-4">Nenhuma anotação ainda</p>
            ) : (
              <div className="space-y-2">
                {earnings.slice(0, 10).map((earning) => {
                  const amount = earning.gbpAmount || earning.eurAmount || earning.usdAmount;
                  const curr = earning.gbpAmount ? "GBP" : earning.eurAmount ? "EUR" : "USD";
                  
                  return (
                    <div
                      key={earning.id}
                      className="flex justify-between items-center p-3 bg-slate-100 rounded"
                    >
                      <div>
                        <p className="font-semibold">{formatCurrency(amount, curr)}</p>
                        <p className="text-sm text-slate-600">
                          {earning.paymentMethod} • {earning.durationMinutes}min • {earning.date}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEarning(earning.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link para Histórico */}
        <div className="text-center">
          <Button variant="outline" onClick={() => setLocation("/history")}>
            Ver Histórico de Tops
          </Button>
        </div>
      </div>
    </div>
  );
}
