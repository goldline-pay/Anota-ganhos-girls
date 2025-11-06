import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const [editingEarning, setEditingEarning] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("EUR");
  const [editDuration, setEditDuration] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("");
  const [editDate, setEditDate] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("userRole");
    const savedName = localStorage.getItem("userName");
    if (savedToken) setToken(savedToken);
    if (savedRole) setUserRole(savedRole);
    if (savedName) setUserName(savedName);
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.name);
      setToken(data.token);
      setUserRole(data.role);
      setUserName(data.name);
      toast.success("Login realizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro no login");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", data.name);
      setToken(data.token);
      setUserRole(data.role);
      setUserName(data.name);
      toast.success("Conta criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const activeTopQuery = trpc.tops.getActive.useQuery(undefined, {
    enabled: !!token,
  });

  const earningsQuery = trpc.earnings.list.useQuery(undefined, {
    enabled: !!token,
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

  const updateMutation = trpc.earnings.update.useMutation({
    onSuccess: () => {
      toast.success("Ganho atualizado!");
      setEditingEarning(null);
      earningsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar");
    },
  });

  const startTopMutation = trpc.tops.start.useMutation({
    onSuccess: () => {
      toast.success("Top de 7 Dias iniciado!");
      activeTopQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deactivateTopMutation = trpc.tops.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Top desativado!");
      activeTopQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      if (!name) {
        toast.error("Preencha o nome");
        return;
      }
      registerMutation.mutate({ email, password, name });
    }
  };

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

  const handleEdit = (earning: any) => {
    setEditingEarning(earning);
    setEditAmount((earning.amount / 100).toString());
    setEditCurrency(earning.currency);
    setEditDuration(earning.duration.toString());
    setEditPaymentMethod(earning.paymentMethod);
    setEditDate(earning.date);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount || !editDuration || !editPaymentMethod || !editDate) {
      toast.error("Preencha todos os campos");
      return;
    }
    updateMutation.mutate({
      id: editingEarning.id,
      amount: parseFloat(editAmount),
      currency: editCurrency as "GBP" | "EUR" | "USD",
      duration: parseInt(editDuration),
      paymentMethod: editPaymentMethod as any,
      date: editDate,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setToken(null);
    setUserRole(null);
    setUserName(null);
    toast.success("Logout realizado");
  };

  if (!token) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: "url(/bg-feminine.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <Card className="p-8 max-w-md w-full relative z-10 bg-white/95 backdrop-blur shadow-2xl border-pink-200">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            💰 {APP_TITLE}
          </h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-gray-700">Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
            )}
            
            <div>
              <Label className="text-gray-700">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            
            <div>
              <Label className="text-gray-700">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="border-pink-200 focus:border-pink-400"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending
                ? "⏳ Processando..."
                : isLogin
                ? "Entrar"
                : "Criar Conta"}
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full mt-4 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
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

  const activeTop = activeTopQuery.data;
  const hasActiveTop = !!activeTop;

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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              💰 {APP_TITLE}
            </h1>
            {userName && (
              <p className="text-gray-700 mt-1 text-lg">
                Olá, <span className="font-semibold text-pink-600">{userName}</span>! 💖
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/history">
              <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                📊 Histórico
              </Button>
            </Link>
            {userRole === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  👑 Admin
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={logout} className="border-gray-300">
              Sair
            </Button>
          </div>
        </div>

        {/* Status do Top */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Status do Top</h2>
              {hasActiveTop ? (
                <p className="text-green-600 font-medium mt-1">✅ Top de 7 Dias ATIVO</p>
              ) : (
                <p className="text-gray-500 mt-1">Nenhum Top ativo no momento</p>
              )}
            </div>
            <div>
              {hasActiveTop ? (
                <Button
                  variant="destructive"
                  onClick={() => deactivateTopMutation.mutate()}
                  disabled={deactivateTopMutation.isPending}
                >
                  {deactivateTopMutation.isPending ? "Desativando..." : "Desativar Top"}
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  onClick={() => startTopMutation.mutate()}
                  disabled={startTopMutation.isPending}
                >
                  {startTopMutation.isPending ? "Iniciando..." : "Iniciar Top de 7 Dias"}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Formulário de Ganhos */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Adicionar Ganho</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150.50"
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
              <div>
                <Label className="text-gray-700">Moeda</Label>
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
                <Label className="text-gray-700">Duração (min)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="60"
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
              <div>
                <Label className="text-gray-700">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="border-pink-200">
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

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adicionando..." : "Adicionar Ganho"}
            </Button>
          </form>
        </Card>

        {/* Totais */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Totais</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">GBP</p>
              <p className="text-3xl font-bold text-pink-600">£{(totals.GBP || 0).toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">EUR</p>
              <p className="text-3xl font-bold text-purple-600">€{(totals.EUR || 0).toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">USD</p>
              <p className="text-3xl font-bold text-pink-600">${(totals.USD || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Histórico */}
        <Card className="p-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Ganhos Recentes</h2>
          {earnings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum ganho registrado ainda</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {earnings.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {e.currency === "GBP" && "£"}
                      {e.currency === "EUR" && "€"}
                      {e.currency === "USD" && "$"}
                      {e.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {e.duration}min • {e.paymentMethod} • {e.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(e)}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
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

        {/* Dialog de Edição */}
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
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Moeda</Label>
                  <Select value={editCurrency} onValueChange={setEditCurrency}>
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
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={editPaymentMethod} onValueChange={setEditPaymentMethod}>
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
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingEarning(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
