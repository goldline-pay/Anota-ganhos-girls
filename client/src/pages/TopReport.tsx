import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

export default function TopReport() {
  const [, params] = useRoute("/top/:id");
  const topId = parseInt(params?.id || "0");

  const { data: top } = trpc.tops.getById.useQuery({ id: topId });
  const { data: earnings = [] } = trpc.tops.getEarnings.useQuery({ topId });

  // Agrupar ganhos por dia
  const earningsByDay = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    earnings.forEach((earning: any) => {
      const date = earning.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(earning);
    });
    return grouped;
  }, [earnings]);

  // Calcular totais por moeda
  const totalsByCurrency = useMemo(() => {
    const totals = { GBP: 0, EUR: 0, USD: 0 };
    earnings.forEach((e: any) => {
      totals[e.currency as keyof typeof totals] += e.amount;
    });
    return totals;
  }, [earnings]);

  // Calcular totais por forma de pagamento
  const totalsByPayment = useMemo(() => {
    const totals: Record<string, number> = {};
    earnings.forEach((e: any) => {
      if (!totals[e.paymentMethod]) totals[e.paymentMethod] = 0;
      totals[e.paymentMethod] += e.amount;
    });
    return totals;
  }, [earnings]);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
    return `${symbol}${(amount).toFixed(2)}`;
  };

  if (!top) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2" size={16} />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            📊 Relatório Semanal
          </h1>
          <p className="text-gray-600 mt-2">
            {new Date(top.startDate).toLocaleDateString()} - {top.endDate ? new Date(top.endDate).toLocaleDateString() : "Em andamento"}
          </p>
        </div>

        {/* Resumo Consolidado */}
        <Card className="p-6 mb-6 bg-white/80 backdrop-blur">
          <h2 className="text-xl font-bold mb-4 text-purple-700">💰 Resumo Consolidado</h2>
          
          {/* Totais por Moeda */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Totais por Moeda</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">GBP (£)</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalsByCurrency.GBP, "GBP")}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">EUR (€)</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalsByCurrency.EUR, "EUR")}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">USD ($)</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalsByCurrency.USD, "USD")}</p>
              </div>
            </div>
          </div>

          {/* Totais por Forma de Pagamento */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Totais por Forma de Pagamento</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(totalsByPayment).map(([method, total]) => (
                <div key={method} className="bg-gradient-to-br from-pink-50 to-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{method}</p>
                  <p className="text-lg font-bold text-pink-700">
                    {formatCurrency(total, "EUR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Detalhamento Diário */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-700">📅 Detalhamento Diário</h2>
          {Object.entries(earningsByDay).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dayEarnings]) => {
            const dayTotals = { GBP: 0, EUR: 0, USD: 0 };
            dayEarnings.forEach((e: any) => {
              dayTotals[e.currency as keyof typeof dayTotals] += e.amount;
            });

            return (
              <Card key={date} className="p-5 bg-white/80 backdrop-blur">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    {dayTotals.GBP > 0 && <span className="text-green-700 font-semibold">{formatCurrency(dayTotals.GBP, "GBP")}</span>}
                    {dayTotals.EUR > 0 && <span className="text-blue-700 font-semibold">{formatCurrency(dayTotals.EUR, "EUR")}</span>}
                    {dayTotals.USD > 0 && <span className="text-purple-700 font-semibold">{formatCurrency(dayTotals.USD, "USD")}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayEarnings.map((earning: any) => (
                    <div key={earning.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatCurrency(earning.amount, earning.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {earning.paymentMethod} • {earning.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                          {earning.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
