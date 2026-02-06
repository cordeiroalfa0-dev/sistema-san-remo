import React, { useState, useRef } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Info, FileJson, Clock, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { backupService, BackupData, BackupStatus } from '../services/backupService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const Backup: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [backupInfo, setBackupInfo] = useState<{ size: string; records: number } | null>(null);
  const [fileValidation, setFileValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleExport = async () => {
    setLoading(true);
    setStatus(null);
    setBackupInfo(null);
    try {
      const data = await backupService.exportData(user?.email);
      const size = backupService.calculateBackupSize(data);
      const totalRecords = data.metadata.totalMateriais + data.metadata.totalFotos + data.metadata.totalEnvios;
      
      setBackupInfo({ size, records: totalRecords });
      backupService.downloadBackup(data);
      setStatus({
        success: true,
        message: 'Backup exportado com sucesso!',
        detalhes: {
          materiaisProcessados: data.metadata.totalMateriais,
          fotosProcessadas: data.metadata.totalFotos,
          enviosProcessados: data.metadata.totalEnvios
        }
      });
    } catch (error: any) {
      setStatus({
        success: false,
        message: 'Erro ao exportar backup: ' + error.message,
        detalhes: { erros: [error.message] }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);
    setFileValidation(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data: BackupData = JSON.parse(content);
        
        // Validar arquivo
        const validation = backupService.validateBackupFile(data);
        setFileValidation(validation);

        if (!validation.valid) {
          setStatus({
            success: false,
            message: 'Arquivo de backup inválido. Verifique os erros abaixo.',
            detalhes: { erros: validation.errors }
          });
          setLoading(false);
          return;
        }

        // Importar dados
        const result = await backupService.importData(data);
        setStatus(result);
      } catch (error: any) {
        setStatus({
          success: false,
          message: 'Erro ao processar arquivo: ' + error.message,
          detalhes: { erros: [error.message] }
        });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to="/admin" className="flex items-center gap-2 text-grafite-500 hover:text-ciano-500 transition-colors text-[10px] font-black uppercase tracking-widest w-fit">
          <ArrowLeft size={14} />
          Voltar para Admin
        </Link>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-ciano-500" />
            <span className="text-ciano-500 font-black uppercase tracking-[0.4em] text-[10px]">Administração</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Backup e <span className="text-grafite-600">Restauração</span>
          </h2>
          <p className="text-grafite-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            Gerencie a segurança e integridade dos seus dados
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Export Card */}
        <div className="glass-card rounded-3xl md:rounded-4xl p-6 md:p-8 border border-grafite-800 hover:border-ciano-500/30 transition-all duration-300 group flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-ciano-500/10 rounded-2xl flex items-center justify-center text-ciano-500 group-hover:scale-110 transition-transform">
              <Download size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Exportar Dados</h3>
              <p className="text-[9px] md:text-[10px] text-grafite-500 font-bold uppercase tracking-widest mt-1">Criar backup completo</p>
            </div>
          </div>

          <p className="text-sm md:text-base text-grafite-300 leading-relaxed mb-6 flex-1">
            Baixe uma cópia completa de todos os materiais, fotos e registros de envios em formato JSON. Ideal para backup de segurança ou migração de dados.
          </p>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-4 md:py-5 bg-ciano-600 hover:bg-ciano-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-glow-ciano"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processando...
              </>
            ) : (
              <>
                <Download size={18} />
                Baixar Backup
              </>
            )}
          </button>

          {backupInfo && (
            <div className="mt-4 p-3 md:p-4 bg-ciano-500/5 border border-ciano-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] md:text-xs">
                <span className="text-grafite-500 font-bold uppercase">Tamanho do Arquivo:</span>
                <span className="text-ciano-400 font-black">{backupInfo.size}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] md:text-xs">
                <span className="text-grafite-500 font-bold uppercase">Total de Registros:</span>
                <span className="text-ciano-400 font-black">{backupInfo.records}</span>
              </div>
            </div>
          )}
        </div>

        {/* Import Card */}
        <div className="glass-card rounded-3xl md:rounded-4xl p-6 md:p-8 border border-grafite-800 hover:border-amber-500/30 transition-all duration-300 group flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Restaurar Backup</h3>
              <p className="text-[9px] md:text-[10px] text-grafite-500 font-bold uppercase tracking-widest mt-1">Importar dados salvos</p>
            </div>
          </div>

          <p className="text-sm md:text-base text-grafite-300 leading-relaxed mb-6 flex-1">
            Selecione um arquivo de backup (.json) para restaurar os dados no sistema. Os registros existentes serão atualizados.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={loading}
            className="w-full py-4 md:py-5 bg-grafite-800 hover:bg-grafite-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs md:text-sm transition-all flex items-center justify-center gap-2 border border-grafite-700"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processando...
              </>
            ) : (
              <>
                <Upload size={18} />
                Selecionar Arquivo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`p-6 md:p-8 rounded-3xl md:rounded-4xl border flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          status.success
            ? 'glass-card border-emerald-500/30 bg-emerald-500/5'
            : 'glass-card border-red-500/30 bg-red-500/5'
        }`}>
          <div className="flex-shrink-0 mt-1">
            {status.success ? (
              <CheckCircle2 size={24} className="text-emerald-500" />
            ) : (
              <AlertCircle size={24} className="text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <p className={`font-black text-sm uppercase tracking-wider mb-2 ${status.success ? 'text-emerald-500' : 'text-red-500'}`}>
              {status.success ? 'Sucesso' : 'Erro'}
            </p>
            <p className="text-sm md:text-base text-grafite-300 mb-4">{status.message}</p>

            {status.detalhes && (
              <div className="space-y-2">
                {status.detalhes.materiaisProcessados !== undefined && (
                  <div className="flex items-center justify-between text-[10px] md:text-xs bg-grafite-800/30 p-2 md:p-3 rounded-lg">
                    <span className="text-grafite-500 font-bold uppercase">Materiais Processados:</span>
                    <span className="text-grafite-300 font-black">{status.detalhes.materiaisProcessados}</span>
                  </div>
                )}
                {status.detalhes.fotosProcessadas !== undefined && (
                  <div className="flex items-center justify-between text-[10px] md:text-xs bg-grafite-800/30 p-2 md:p-3 rounded-lg">
                    <span className="text-grafite-500 font-bold uppercase">Fotos Processadas:</span>
                    <span className="text-grafite-300 font-black">{status.detalhes.fotosProcessadas}</span>
                  </div>
                )}
                {status.detalhes.enviosProcessados !== undefined && (
                  <div className="flex items-center justify-between text-[10px] md:text-xs bg-grafite-800/30 p-2 md:p-3 rounded-lg">
                    <span className="text-grafite-500 font-bold uppercase">Envios Processados:</span>
                    <span className="text-grafite-300 font-black">{status.detalhes.enviosProcessados}</span>
                  </div>
                )}
                {status.detalhes.erros && status.detalhes.erros.length > 0 && (
                  <div className="mt-3 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Avisos:</p>
                    <ul className="space-y-1">
                      {status.detalhes.erros.map((erro, idx) => (
                        <li key={idx} className="text-[9px] md:text-xs text-red-400">• {erro}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Info Box 1 */}
        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 bg-ciano-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-ciano-500/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-ciano-500" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-ciano-500 uppercase tracking-widest mb-2">O Que é Incluído</p>
              <ul className="text-[9px] md:text-xs text-grafite-400 space-y-1.5 list-disc ml-4">
                <li>Todos os materiais registrados</li>
                <li>Referências de fotos e links de imagens</li>
                <li>Histórico completo de envios</li>
                <li>Metadados e timestamps</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box 2 */}
        <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Recomendações</p>
              <ul className="text-[9px] md:text-xs text-grafite-400 space-y-1.5 list-disc ml-4">
                <li>Faça backup regularmente</li>
                <li>Guarde em local seguro</li>
                <li>Teste restauração periodicamente</li>
                <li>Mantenha múltiplas cópias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Info */}
      <div className="glass-card p-6 md:p-8 rounded-3xl md:rounded-4xl border border-grafite-800/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-grafite-800 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileJson className="w-5 h-5 md:w-6 md:h-6 text-grafite-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] md:text-xs font-black text-grafite-400 uppercase tracking-widest mb-3">Informações Técnicas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-[9px] md:text-xs text-grafite-400">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-grafite-600" />
                <span>Formato: JSON estruturado</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-grafite-600" />
                <span>Compressão: Recomendada para armazenamento</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-grafite-600" />
                <span>Versionamento: Compatível com v1.0 e v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-grafite-600" />
                <span>Restauração: Não destrutiva (upsert)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
