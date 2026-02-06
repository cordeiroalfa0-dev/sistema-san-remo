import React, { useState, useEffect } from 'react'
import { materialService } from '../services/materialService'
import { relatorioService } from '../services/relatorioService'
import { Material, Destino, EstatisticasDestino } from '../types/material'
import { useAuth } from '../contexts/AuthContext'
import { FileSpreadsheet, Filter, PieChart as PieIcon, Calendar, Package, TrendingUp, Download, RefreshCw, User, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export const Relatorios: React.FC = () => {
  const { user } = useAuth()
  const [materiais, setMateriais] = useState<Material[]>([])
  const [stats, setStats] = useState<EstatisticasDestino | null>(null)
  const [filtroDestino, setFiltroDestino] = useState<Destino | ''>('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [estatisticas, relatorio] = await Promise.all([
        relatorioService.getEstatisticasPorDestino(),
        materialService.gerarRelatorio({
          destino: filtroDestino || undefined,
          dataInicio,
          dataFim
        })
      ])
      setStats(estatisticas)
      setMateriais(relatorio)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportarExcel = () => {
    if (materiais.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }
    relatorioService.exportarExcel(materiais, 'relatorio-materiais', user?.email)
  }

  const handleGerarPDF = () => {
    if (materiais.length === 0) {
      alert('Nenhum dado para gerar PDF')
      return
    }
    const filtros = `Destino: ${filtroDestino || 'Todos'} | Período: ${dataInicio || 'Início'} até ${dataFim || 'Hoje'}`
    relatorioService.gerarPDF(materiais, filtros, user?.email)
  }

  const chartData = stats ? [
    { name: 'Almoxarifado', value: stats['Almoxarifado'] || 0, color: '#10b981' },
    { name: 'Palazzo Lumini', value: stats['Palazzo Lumini'] || 0, color: '#06b6d4' },
    { name: 'Queen Victoria', value: stats['Queen Victoria'] || 0, color: '#0e7490' },
    { name: 'Chateau Carmelo', value: stats['Chateau Carmelo'] || 0, color: '#3f3f46' }
  ] : []

  const totalItens = materiais.length
  const totalQuantidade = materiais.reduce((acc, m) => acc + m.quantidade, 0)
  const totalCategorias = new Set(materiais.map(m => m.categoria)).size

  const COLORS = ['#10b981', '#06b6d4', '#0e7490', '#3f3f46']

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-ciano-500"></span>
            <span className="text-ciano-500 font-black uppercase tracking-[0.4em] text-[10px]">Inteligência</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">Análise de <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-grafite-500">Dados</span></h2>
        </div>
        
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button 
            onClick={carregarDados}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-grafite-800 hover:bg-grafite-700 disabled:bg-grafite-900 text-white font-bold uppercase text-[10px] md:text-xs tracking-widest rounded-2xl transition-all shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button 
            onClick={handleExportarExcel}
            disabled={materiais.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-grafite-800 text-white font-bold uppercase text-[10px] md:text-xs tracking-widest rounded-2xl transition-all shadow-lg"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button 
            onClick={handleGerarPDF}
            disabled={materiais.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-ciano-600 hover:bg-ciano-500 disabled:bg-grafite-800 text-white font-bold uppercase text-[10px] md:text-xs tracking-widest rounded-2xl transition-all shadow-lg shadow-ciano-900/30"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-ciano-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest">Total de Itens</p>
              <Package className="w-5 h-5 text-ciano-500" />
            </div>
            <p className="text-3xl md:text-4xl font-black text-white mb-2">{totalItens}</p>
            <p className="text-[10px] text-grafite-600 font-bold">Registros encontrados</p>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest">Total de Unidades</p>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl md:text-4xl font-black text-white mb-2">{totalQuantidade}</p>
            <p className="text-[10px] text-grafite-600 font-bold">Quantidade total</p>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 relative overflow-hidden group sm:col-span-2 md:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] text-grafite-500 font-black uppercase tracking-widest">Categorias</p>
              <Filter className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl md:text-4xl font-black text-white mb-2">{totalCategorias}</p>
            <p className="text-[10px] text-grafite-600 font-bold">Tipos diferentes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Filtros Avançados */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 md:p-10 rounded-3xl md:rounded-5xl lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-8 md:mb-10">
              <div className="w-10 h-10 bg-grafite-800 rounded-2xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-ciano-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Filtros Avançados</h3>
            </div>
            
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-grafite-500 uppercase tracking-widest ml-1">Localização</label>
                <select
                  value={filtroDestino}
                  onChange={(e) => setFiltroDestino(e.target.value as Destino | '')}
                  className="input-field font-bold text-[10px] md:text-xs uppercase tracking-widest appearance-none cursor-pointer"
                >
                  <option value="">Todos os Destinos</option>
                  <option value="Almoxarifado">Almoxarifado</option>
                  <option value="Palazzo Lumini">Palazzo Lumini</option>
                  <option value="Queen Victoria">Queen Victoria</option>
                  <option value="Chateau Carmelo">Chateau Carmelo</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-grafite-500 uppercase tracking-widest ml-1">Data Inicial</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-grafite-600 w-4 h-4" />
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-field pl-12 text-[10px] md:text-xs" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-grafite-500 uppercase tracking-widest ml-1">Data Final</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-grafite-600 w-4 h-4" />
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input-field pl-12 text-[10px] md:text-xs" />
                  </div>
                </div>
              </div>

              <button
                onClick={carregarDados}
                disabled={loading}
                className="w-full py-4 md:py-5 bg-white text-grafite-950 hover:bg-ciano-500 hover:text-white rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Atualizar Parâmetros
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics & Results */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Gráfico Pizza */}
          <div className="glass-card p-6 md:p-10 rounded-3xl md:rounded-5xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ciano-950 rounded-2xl flex items-center justify-center border border-ciano-900/50">
                  <PieIcon className="w-5 h-5 text-ciano-500" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Distribuição Geográfica</h3>
              </div>
            </div>
            
            <div className="h-[250px] md:h-[320px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-[10px] font-black text-grafite-500 uppercase tracking-widest ml-2">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-grafite-600 font-black uppercase text-[10px] tracking-widest">Sem dados estatísticos</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabela de Resultados Detalhada */}
          <div className="glass-card rounded-3xl md:rounded-5xl overflow-hidden border border-grafite-800/50">
            <div className="p-6 md:p-8 border-b border-grafite-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="text-ciano-500 w-5 h-5" />
                <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Detalhamento dos Registros</h3>
              </div>
              <span className="text-[10px] font-black text-grafite-500 uppercase tracking-widest">{materiais.length} Itens</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-grafite-900/50">
                    <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-grafite-500 uppercase tracking-widest border-b border-grafite-800/50">Material</th>
                    <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-grafite-500 uppercase tracking-widest border-b border-grafite-800/50">Local</th>
                    <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-grafite-500 uppercase tracking-widest border-b border-grafite-800/50">Qtd</th>
                    <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-grafite-500 uppercase tracking-widest border-b border-grafite-800/50">Enviado por</th>
                    <th className="p-4 md:p-6 text-[9px] md:text-[10px] font-black text-grafite-500 uppercase tracking-widest border-b border-grafite-800/50">Data de Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grafite-800/30">
                  {materiais.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-grafite-600 font-bold uppercase text-[10px] tracking-widest">Nenhum dado encontrado</td>
                    </tr>
                  ) : (
                    materiais.map((m) => (
                      <tr key={m.id} className="hover:bg-grafite-800/20 transition-colors group">
                        <td className="p-4 md:p-6">
                          <p className="text-[10px] font-black text-ciano-500 uppercase tracking-widest mb-1">{m.codigo_remo}</p>
                          <p className="text-xs md:text-sm font-bold text-white uppercase">{m.nome}</p>
                        </td>
                        <td className="p-4 md:p-6">
                          <span className="px-3 py-1 bg-grafite-900 rounded-full text-[9px] md:text-[10px] font-black text-grafite-400 uppercase tracking-widest border border-grafite-800">
                            {m.destino}
                          </span>
                        </td>
                        <td className="p-4 md:p-6">
                          <p className="text-xs md:text-sm font-black text-white">{m.quantidade}</p>
                        </td>
                        <td className="p-4 md:p-6">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-grafite-600" />
                            <p className="text-[10px] md:text-xs font-bold text-grafite-400 uppercase">{m.usuario_nome || 'Sistema'}</p>
                          </div>
                        </td>
                        <td className="p-4 md:p-6">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-grafite-600" />
                            <p className="text-[10px] md:text-xs font-bold text-grafite-400 uppercase">
                              {new Date(m.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
