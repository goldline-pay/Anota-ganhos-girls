import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";

export default function HistoryDetail() {
  const params = useParams();
  const userId = params.userId ? parseInt(params.userId) : undefined;
  const weekStart = params.weekStart;

  const detailQuery = trpc.history.userWeekDetail.useQuery(
    { userId: userId!, weekStart: weekStart! },
    { enabled: !!userId && !!weekStart }
  );

  const detail = detailQuery.data;

  if (detailQuery.isLoading) {
    return (
      <div
        className="min-h-screen p-4 flex items-center justify-center"
        style={{
          backgroundImage: "url(/bg-feminine.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Card className="p-12 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <p className="text-gray-500">Carregando...</p>
        </Card>
      </div>
    );
  }

  if (!detail) {
    return (
      <div
        className="min-h-screen p-4 flex items-center justify-center"
        style={{
          backgroundImage: "url(/bg-feminine.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <Card className="p-12 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <p className="text-gray-500 text-lg mb-4">Nenhum dado encontrado.</p>
          <Link href="/history">
            <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
              ← Voltar ao Histórico
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            📋 Detalhes da Semana
          </h1>
          <Link href="/history">
            <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
              ← Voltar
            </Button>
          </Link>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{detail.userName}</h2>
          <p className="text-gray-600">
            Semana: {new Date(detail.weekStart).toLocaleDateString('pt-BR')} - {new Date(detail.weekEnd).toLocaleDateString('pt-BR')}
          </p>
        </Card>

        {/* Totais por Moeda */}
        <Card className="p-6 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Totais por Moeda</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">GBP</p>
              <p className="text-2xl font-bold text-pink-600">£{(detail.totals.gbp / 100).toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">EUR</p>
              <p className="text-2xl font-bold text-purple-600">€{(detail.totals.eur / 100).toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">USD</p>
              <p className="text-2xl font-bold text-blue-600">${(detail.totals.usd / 100).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Lista de Ganhos */}
        <Card className="p-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Ganhos Registrados</h3>
          {detail.earnings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum ganho registrado nesta semana.</p>
          ) : (
            <div className="space-y-3">
              {detail.earnings.map((earning: any) => (
                <div
                  key={earning.id}
                  className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {earning.currency === 'GBP' && '£'}
                        {earning.currency === 'EUR' && '€'}
                        {earning.currency === 'USD' && '$'}
                        {(earning.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {earning.duration} min • {earning.paymentMethod}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(earning.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
