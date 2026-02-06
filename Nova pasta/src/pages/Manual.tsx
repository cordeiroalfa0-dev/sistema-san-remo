import React, { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Search } from 'lucide-react'

interface Section {
  id: string
  title: string
  content: string
  subsections?: Subsection[]
}

interface Subsection {
  id: string
  title: string
  content: string
}

export const Manual: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')

  const sections: Section[] = [
    {
      id: 'acesso',
      title: '1. Acesso ao Sistema',
      content: 'Para acessar o sistema, insira seu e-mail e senha nos campos indicados e clique no botão "Entrar".',
      subsections: [
        {
          id: 'login',
          title: '1.1. Tela de Login',
          content: 'Insira seu e-mail e senha nos campos indicados. Caso não possua uma conta, entre em contato com o administrador do sistema.'
        },
        {
          id: 'recuperacao',
          title: '1.2. Recuperação de Senha',
          content: 'Se você esqueceu sua senha, clique no link "Esqueceu sua senha?" na tela de login e siga as instruções para redefini-la.'
        }
      ]
    },
    {
      id: 'dashboard',
      title: '2. Visão Geral do Dashboard',
      content: 'Após o login, você será direcionado ao Dashboard, que oferece uma visão geral do inventário.',
      subsections: [
        {
          id: 'dashboard-info',
          title: '2.1. Informações do Dashboard',
          content: 'Total de Itens: Número total de materiais registrados. Cards de Destinos: Exibe a quantidade de materiais em cada destino. Atividades Recentes: Lista os últimos materiais registrados.'
        }
      ]
    },
    {
      id: 'materiais',
      title: '3. Gerenciamento de Materiais',
      content: 'Gerencie todos os seus materiais através do sistema.',
      subsections: [
        {
          id: 'adicionar',
          title: '3.1. Adicionar Novo Material',
          content: 'Na tela "Novo Registro", preencha os campos: Código de Controle (gerado automaticamente), Categoria, Nome do Item, Quantidade Inicial, Destino Inicial, Descrição Técnica e faça upload de até 3 imagens.'
        },
        {
          id: 'lista',
          title: '3.2. Lista de Materiais (Inventário Global)',
          content: 'A tela "Inventário Global" exibe todos os materiais. Você pode buscar por nome/código, filtrar por destino, visualizar detalhes, transferir ou excluir materiais.'
        },
        {
          id: 'enviar',
          title: '3.3. Enviar Materiais',
          content: 'Selecione um ou mais itens para transferir para um novo destino. Ajuste a quantidade, escolha o destino final e confirme o envio.'
        }
      ]
    },
    {
      id: 'relatorios',
      title: '4. Relatórios',
      content: 'Gere documentos em PDF ou Excel com base nos materiais registrados. Aplique filtros por destino, período e categoria.'
    },
    {
      id: 'admin',
      title: '5. Gerenciamento de Usuários (Apenas Administradores)',
      content: 'Usuários com perfil de administrador têm acesso a: Admin (painel administrativo), Backup (backups do sistema), Cadastro (novos usuários) e Gerenciamento de Usuários.'
    },
    {
      id: 'suporte',
      title: '6. Suporte',
      content: 'Em caso de dúvidas ou problemas, entre em contato com o suporte técnico da San Remo Construtora.'
    }
  ]

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.subsections?.some(sub =>
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-ciano-500" />
            <span className="text-ciano-500 font-black uppercase tracking-[0.4em] text-[10px]">Documentação</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Manual do <span className="text-grafite-600">Usuário</span></h2>
          <p className="text-grafite-500 font-bold uppercase tracking-widest text-[10px] mt-3">Guia completo de funcionalidades e operações</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-grafite-500 group-focus-within:text-ciano-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar no manual..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-grafite-950/50 border border-grafite-800 rounded-2xl text-white placeholder:text-grafite-600 focus:border-ciano-500/50 focus:ring-0 transition-all font-medium text-sm"
        />
      </div>

      {/* Sections */}
      <div className="space-y-4 md:space-y-6">
        {filteredSections.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl md:rounded-4xl text-center border-dashed border-2 border-grafite-800">
            <p className="text-grafite-600 font-black uppercase tracking-[0.3em] text-[10px]">Nenhum resultado encontrado</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section.id} className="glass-card rounded-3xl md:rounded-4xl overflow-hidden border border-grafite-800 hover:border-ciano-500/30 transition-all duration-300">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-grafite-800/30 transition-colors group"
              >
                <div className="text-left flex-1">
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight group-hover:text-ciano-400 transition-colors">
                    {section.title}
                  </h3>
                  {!expandedSections[section.id] && (
                    <p className="text-sm text-grafite-500 mt-2 line-clamp-1">{section.content}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedSections[section.id] ? (
                    <ChevronUp className="w-6 h-6 text-ciano-500 transition-transform" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-grafite-600 group-hover:text-ciano-500 transition-colors" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div className="border-t border-grafite-800/50 px-6 md:px-8 py-6 md:py-8 space-y-6">
                  <p className="text-grafite-300 leading-relaxed text-sm md:text-base">{section.content}</p>

                  {/* Subsections */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-grafite-800/30">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.id} className="pl-4 md:pl-6 border-l-2 border-ciano-500/30">
                          <h4 className="text-base md:text-lg font-black text-ciano-400 uppercase tracking-tight mb-2">
                            {subsection.title}
                          </h4>
                          <p className="text-grafite-400 leading-relaxed text-sm md:text-base">{subsection.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 bg-ciano-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-ciano-500/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-ciano-500" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-black text-ciano-500 uppercase tracking-widest mb-2">Precisa de Ajuda?</p>
            <p className="text-sm md:text-base text-grafite-300 leading-relaxed">
              Em caso de dúvidas ou problemas não abordados neste manual, entre em contato com o suporte técnico da San Remo Construtora.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
