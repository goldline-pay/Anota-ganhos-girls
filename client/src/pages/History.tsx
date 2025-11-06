import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useCustomAuth } from "@/hooks/useCustomAuth";

export default function History() {
  const [, setLocation] = useLocation();
  const { user, token } = useCustomAuth();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
    loadSnapshots();
  }, [user]);

  const loadSnapshots = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/trpc/week.history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSnapshots(data.result?.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">📊 Histórico de Tops</h1>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Lista de Snapshots */}
        {snapshots.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-600">
              Nenhum Top finalizado ainda
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {snapshots.map((snapshot) => {
              const details = JSON.parse(snapshot.detailsByDay || "{}");
              const byPayment = JSON.parse(snapshot.totalsByPaymentMethod || "{}");

              return (
                <Card key={snapshot.id}>
                  <CardHeader>
                    <CardTitle>
                      Semana de {snapshot.weekStartDate} a {snapshot.weekEndDate}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Totais Gerais */}
                    <div>
                      <h3 className="font-semibold mb-2">Totais Gerais</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-100 p-3 rounded">
                          <p className="text-sm text-slate-600">GBP</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(snapshot.totalGbpAmount, "GBP")}
                          </p>
                        </div>
                        <div className="bg-slate-100 p-3 rounded">
                          <p className="text-sm text-slate-600">EUR</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(snapshot.totalEurAmount, "EUR")}
                          </p>
                        </div>
                        <div className="bg-slate-100 p-3 rounded">
                          <p className="text-sm text-slate-600">USD</p>
                          <p className="text-xl font-bold">
                            {formatCurrency(snapshot.totalUsdAmount, "USD")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Duração total: {snapshot.totalDurationMinutes} min
                      </p>
                    </div>

                    {/* Totais por Forma de Pagamento */}
                    <div>
                      <h3 className="font-semibold mb-2">Por Forma de Pagamento</h3>
                      <div className="space-y-2">
                        {Object.entries(byPayment).map(([method, amounts]: [string, any]) => (
                          <div key={method} className="bg-slate-100 p-3 rounded">
                            <p className="font-semibold">{method}</p>
                            <div className="text-sm text-slate-600 space-x-3">
                              {amounts.gbpAmount > 0 && (
                                <span>GBP: {formatCurrency(amounts.gbpAmount, "GBP")}</span>
                              )}
                              {amounts.eurAmount > 0 && (
                                <span>EUR: {formatCurrency(amounts.eurAmount, "EUR")}</span>
                              )}
                              {amounts.usdAmount > 0 && (
                                <span>USD: {formatCurrency(amounts.usdAmount, "USD")}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detalhes por Dia */}
                    <div>
                      <h3 className="font-semibold mb-2">Detalhes por Dia</h3>
                      <div className="space-y-2">
                        {Object.entries(details).map(([date, dayData]: [string, any]) => (
                          <div key={date} className="bg-slate-100 p-3 rounded">
                            <p className="font-semibold">{date}</p>
                            <div className="text-sm text-slate-600 space-x-3">
                              {dayData.totalGbp > 0 && (
                                <span>GBP: {formatCurrency(dayData.totalGbp, "GBP")}</span>
                              )}
                              {dayData.totalEur > 0 && (
                                <span>EUR: {formatCurrency(dayData.totalEur, "EUR")}</span>
                              )}
                              {dayData.totalUsd > 0 && (
                                <span>USD: {formatCurrency(dayData.totalUsd, "USD")}</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {dayData.earnings.length} anotações
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
