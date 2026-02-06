# Sistema de Gestão de Materiais

Sistema completo para gestão de materiais com upload de fotos, relatórios e exportação.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **UI**: Tailwind CSS
- **Gráficos**: Recharts
- **Exportação**: jsPDF, XLSX

## 📋 Funcionalidades

✅ Cadastro de materiais com código REMO automático  
✅ Upload de múltiplas fotos por material  
✅ 3 destinos: Palazzo Lumini, Queen Victoria, Chateau Carmelo  
✅ Lista com busca e filtros  
✅ Relatórios com gráficos  
✅ Exportação em PDF e Excel  
✅ Galeria de fotos  
✅ Layout responsivo  

## 🛠️ Instalação

### 1. Configurar Supabase

1. Acesse https://supabase.com
2. Vá em SQL Editor
3. Execute o arquivo `supabase-setup.sql`
4. Vá em Storage
5. Crie um bucket chamado "fotos-materiais"
6. Configure o bucket como público

### 2. Instalar Dependências

```bash
cd sistema-materiais
npm install
```

### 3. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:5173

## 📦 Build para Produção

```bash
npm run build
npm run preview
```

## 🎨 Cores por Destino

- **Palazzo Lumini**: Azul (#3B82F6)
- **Queen Victoria**: Roxo (#9333EA)
- **Chateau Carmelo**: Verde (#10B981)

## 📸 Screenshots

(Adicione screenshots do sistema em funcionamento)

## 🤝 Contribuindo

Contribuições são bem-vindas!

## 📄 Licença

MIT

## 🚀 Deploy na Vercel

Este projeto está configurado para deploy automático na Vercel.

### Passos para Deploy:

1.  **Variáveis de Ambiente**: No painel da Vercel, adicione as seguintes variáveis:
    *   `VITE_SUPABASE_URL`: Sua URL do Supabase.
    *   `VITE_SUPABASE_ANON_KEY`: Sua Chave Anônima do Supabase.

2.  **Configurações de Build**:
    *   Framework Preset: `Vite`
    *   Build Command: `npm run build`
    *   Output Directory: `dist`

3.  **Roteamento**: O arquivo `vercel.json` já está incluído para garantir que as rotas do React Router funcionem corretamente após o deploy.
