import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function History() {
  const historyQuery = trpc.tops.history.useQuery();
  
  const tops = historyQuery.data || [];

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            📊 Histórico de Tops
          </h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-pink-300 text-pink-700 hover:bg-pink-50">
              ← Voltar
            </Button>
          </Link>
        </div>

        {tops.length === 0 ? (
          <Card className="p-12 text-center bg-white/95 backdrop-blur shadow-xl border-pink-200">
            <p className="text-gray-500 text-lg">Nenhum Top registrado ainda</p>
            <p className="text-gray-400 mt-2">Inicie seu primeiro Top de 7 Dias no dashboard</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tops.map((top) => (
              <Card key={top.id} className="p-6 bg-white/95 backdrop-blur shadow-xl border-pink-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Top #{top.id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Início: {new Date(top.startDate).toLocaleDateString('pt-BR')}
                    </p>
                    {top.endDate && (
                      <p className="text-sm text-gray-600">
                        Fim: {new Date(top.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {top.status === "active" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        ✅ Ativo
                      </span>
                    )}
                    {top.status === "completed" && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          ✓ Concluído
                        </span>
                        <Link href={`/top/${top.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                            📊 Ver Relatório
                          </Button>
                        </Link>
                      </>
                    )}
                    {top.status === "cancelled" && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        ✗ Cancelado
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
