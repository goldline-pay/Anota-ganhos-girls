import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";

export default function History() {
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  const weeksQuery = trpc.history.listWeeks.useQuery();
  const weeks = weeksQuery.data || [];

  // Selecionar primeira semana automaticamente
  if (weeks.length > 0 && !selectedWeek) {
    setSelectedWeek(weeks[0].weekStart);
  }

  const rankingQuery = trpc.history.weeklyRanking.useQuery(
    { weekStart: selectedWeek },
    { enabled: !!selectedWeek }
  );

  const ranking = rankingQuery.data || { rankings: [], totals: { gross: 0, net: 0 }, weekStart: "", weekEnd: "" };

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            📊 Histórico de Tops (Semanal)
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
              ← Voltar
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Selecione a semana</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a semana" />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((week: any) => (
                  <SelectItem key={week.weekStart} value={week.weekStart}>
                    {new Date(week.weekStart).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tabela de Ranking */}
        {rankingQuery.isLoading ? (
          <Card className="p-12 text-center bg-white/95 backdrop-blur shadow-xl border-pink-200">
            <p className="text-gray-500">Carregando...</p>
          </Card>
        ) : ranking.rankings.length === 0 ? (
          <Card className="p-12 text-center bg-white/95 backdrop-blur shadow-xl border-pink-200">
            <p className="text-gray-500 text-lg">Nenhum registro para esta semana.</p>
          </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur shadow-xl border-pink-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuária</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Bruto</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Dias</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Detalhe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ranking.rankings.map((r: any, index: number) => (
                    <tr key={r.userId} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `${index + 1}º`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-500">@{r.nickname}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        €{((r.totalGross || 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">
                        {r.daysWorked}/7
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/history/${r.userId}/${selectedWeek}`}>
                          <Button size="sm" variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé com Totais */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border-t border-pink-200">
              <p className="text-sm font-semibold text-gray-700">
                Total geral da semana: Bruto €{((ranking.totals.gross || 0) / 100).toFixed(2)}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
