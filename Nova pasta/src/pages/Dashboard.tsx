import React, { useEffect, useState } from 'react'
import { materialService } from '../services/materialService'
import { relatorioService } from '../services/relatorioService'
import { Package, MapPin, Calendar, ArrowRight, TrendingUp, Layers, Plus, BarChart3, Users, Clock } from 'lucide-react'
import { EstatisticasDestino, Material } from '../types/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<EstatisticasDestino | null>(null)
  const [ultimosMateriais, setUltimosMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [estatisticas, { data: materiais }] = await Promise.all([
        relatorioService.getEstatisticasPorDestino(),
        materialService.listarMateriais({ limit: 5 })
      ])
      setStats(estatisticas)
      setUltimosMateriais(materiais)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 md:py-40 gap-6">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-grafite-800 border-t-ciano-500 rounded-full animate-spin"></div>
          <Layers className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-ciano-500 w-6 h-6 md:w-8 md:h-8" />
        </div>
        <p className="text-grafite-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse text-center">Sincronizando Dados...</p>
      </div>
    )
  }

  const total = stats
    ? Object.values(stats).reduce((acc, curr) => acc + (curr || 0), 0)
    : 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-ciano-500"></span>
            <span className="text-ciano-500 font-black uppercase tracking-[0.4em] text-[10px]">Visão Geral</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
            {getGreeting()}, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ciano-400 to-grafite-400">{user?.name || 'Usuário'}</span>
          </h2>
          <p className="text-grafite-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-3">
            Painel de Controle • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={() => navigate('/adicionar')}
          className="btn-primary group w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Registrar Novo Ativo
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total de Itens */}
        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl relative overflow-hidden group hover:border-ciano-500/50 transition-colors">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest">Total de Itens</p>
              <div className="w-10 h-10 bg-ciano-500/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-ciano-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{total}</span>
              <TrendingUp className="text-ciano-500 w-5 h-5" />
            </div>
            <p className="text-[9px] text-grafite-600 font-bold mt-3">Ativos registrados no sistema</p>
          </div>
          <Package className="absolute -right-4 -bottom-4 w-24 md:w-32 h-24 md:h-32 text-grafite-800/20 group-hover:scale-110 group-hover:text-ciano-500/10 transition-all duration-700" />
        </div>

        {/* Cards de Destinos Dinâmicos */}
        {stats && Object.entries(stats).map(([name, val], idx) => {
          const colors = [
            'from-emerald-500 to-emerald-600',
            'from-ciano-500 to-ciano-600',
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-amber-500 to-amber-600',
            'from-rose-500 to-rose-600'
          ];
          const colorClass = colors[idx % colors.length];
          
          return (
            <div key={name} className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl group hover:border-ciano-500/30 transition-all duration-500 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-grafite-800 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-ciano-950 transition-colors">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-grafite-400 group-hover:text-ciano-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-grafite-600 group-hover:text-ciano-700 transition-colors">0{idx + 1}</span>
                </div>
                <div>
                  <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest mb-1 truncate">{name}</p>
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">{val || 0}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl border border-grafite-800/50 flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-ciano-500/10 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-ciano-500" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] text-grafite-600 font-bold uppercase tracking-widest">Usuário Ativo</p>
            <p className="text-base md:text-lg font-black text-white truncate max-w-[150px]">{user?.name}</p>
          </div>
        </div>

        <div className="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl border border-grafite-800/50 flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-ciano-500/10 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-ciano-500" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] text-grafite-600 font-bold uppercase tracking-widest">Horário</p>
            <p className="text-base md:text-lg font-black text-white">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div className="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl border border-grafite-800/50 flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-ciano-500/10 rounded-xl md:rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-ciano-500" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] text-grafite-600 font-bold uppercase tracking-widest">Status</p>
            <p className="text-base md:text-lg font-black text-ciano-400">Sistema Online</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-3xl md:rounded-5xl overflow-hidden">
        <div className="p-6 md:p-10 border-b border-grafite-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-grafite-900/30 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 md:w-2 md:h-8 bg-ciano-600 rounded-full"></div>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Atividades Recentes</h3>
          </div>
          <button 
            onClick={() => navigate('/lista')} 
            className="text-grafite-400 hover:text-ciano-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-2 transition-colors group"
          >
            Ver Catálogo Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="p-2 md:p-4">
          {ultimosMateriais.length === 0 ? (
            <div className="py-16 md:py-24 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-grafite-900 rounded-full flex items-center justify-center border border-grafite-800">
                <Package className="w-8 h-8 md:w-10 md:h-10 text-grafite-700" />
              </div>
              <p className="text-grafite-600 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Aguardando novos registros</p>
            </div>
          ) : (
            <div className="space-y-1 md:space-y-2">
              {ultimosMateriais.map((material) => (
                <div 
                  key={material.id} 
                  className="flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl hover:bg-grafite-800/30 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate('/lista')}
                >
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className="relative flex-shrink-0">
                      {material.fotos && material.fotos[0] ? (
                        <img src={material.fotos[0].url_imagem} alt={material.nome} className="w-12 h-12 md:w-20 md:h-20 object-cover rounded-xl md:rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-grafite-900 rounded-xl md:rounded-2xl flex items-center justify-center border border-grafite-800">
                          <Package className="w-6 h-6 md:w-8 md:h-8 text-grafite-700" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                        <span className="px-1.5 py-0.5 bg-ciano-950 text-ciano-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-md border border-ciano-900/50">
                          {material.codigo_remo}
                        </span>
                        <span className="text-[8px] md:text-[10px] text-grafite-600 font-bold uppercase tracking-widest truncate hidden xs:inline">
                          {material.categoria || 'Sem categoria'}
                        </span>
                      </div>
                      <p className="text-base md:text-xl font-black text-white tracking-tight group-hover:text-ciano-400 transition-colors truncate">{material.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-12 flex-shrink-0">
                    <div className="hidden lg:block text-right">
                       <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest mb-1">Destino</p>
                       <span className="text-sm font-bold text-grafite-300 uppercase">{material.destino}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] md:text-[10px] text-grafite-500 font-black uppercase tracking-widest mb-0.5 md:mb-1">Registro</p>
                      <p className="text-xs md:text-sm font-bold text-grafite-300 flex items-center justify-end">
                        <Calendar className="w-3 h-3 mr-1.5 md:mr-2 text-ciano-600 hidden xs:block" />
                        {new Date(material.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
