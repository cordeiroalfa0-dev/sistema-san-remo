import { supabase } from './supabase';

export interface BackupData {
  materiais: any[];
  fotos: any[];
  envios: any[];
  timestamp: string;
  version: string;
  metadata: {
    totalMateriais: number;
    totalFotos: number;
    totalEnvios: number;
    dataExportacao: string;
    usuarioExportacao?: string;
  };
}

export interface BackupStatus {
  success: boolean;
  message: string;
  detalhes?: {
    materiaisProcessados?: number;
    fotosProcessadas?: number;
    enviosProcessados?: number;
    erros?: string[];
  };
}

export const backupService = {
  /**
   * Exporta todos os dados do sistema para um arquivo de backup
   */
  async exportData(userEmail?: string): Promise<BackupData> {
    try {
      const { data: materiais, error: mError } = await supabase
        .from('materiais')
        .select('*');
      if (mError) throw new Error(`Erro ao exportar materiais: ${mError.message}`);

      const { data: fotos, error: fError } = await supabase
        .from('fotos')
        .select('*');
      if (fError) throw new Error(`Erro ao exportar fotos: ${fError.message}`);

      const { data: envios, error: eError } = await supabase
        .from('envios')
        .select('*');
      if (eError) throw new Error(`Erro ao exportar envios: ${eError.message}`);

      const backupData: BackupData = {
        materiais: materiais || [],
        fotos: fotos || [],
        envios: envios || [],
        timestamp: new Date().toISOString(),
        version: '2.0',
        metadata: {
          totalMateriais: (materiais || []).length,
          totalFotos: (fotos || []).length,
          totalEnvios: (envios || []).length,
          dataExportacao: new Date().toLocaleString('pt-BR'),
          usuarioExportacao: userEmail
        }
      };

      return backupData;
    } catch (error: any) {
      throw new Error(`Falha ao exportar dados: ${error.message}`);
    }
  },

  /**
   * Importa dados de um arquivo de backup com validação completa
   */
  async importData(data: BackupData): Promise<BackupStatus> {
    const erros: string[] = [];
    let materiaisProcessados = 0;
    let fotosProcessadas = 0;
    let enviosProcessados = 0;

    try {
      // 1. Validar estrutura básica
      if (!data || typeof data !== 'object') {
        throw new Error('Arquivo de backup inválido: estrutura não reconhecida.');
      }

      if (!data.materiais || !Array.isArray(data.materiais)) {
        throw new Error('Formato de backup inválido: tabela de materiais ausente ou corrompida.');
      }

      // 2. Validar versão do backup
      if (data.version && data.version !== '1.0' && data.version !== '2.0') {
        console.warn(`Aviso: Versão do backup (${data.version}) pode não ser totalmente compatível.`);
      }

      // 3. Importar Materiais com tratamento de erro individual
      if (data.materiais.length > 0) {
        try {
          const { error: mError } = await supabase
            .from('materiais')
            .upsert(data.materiais, { onConflict: 'id' });
          
          if (mError) {
            erros.push(`Erro ao importar materiais: ${mError.message}`);
          } else {
            materiaisProcessados = data.materiais.length;
          }
        } catch (err: any) {
          erros.push(`Erro crítico ao importar materiais: ${err.message}`);
        }
      }

      // 4. Importar Fotos com tratamento de erro individual
      if (data.fotos && data.fotos.length > 0) {
        try {
          const { error: fError } = await supabase
            .from('fotos')
            .upsert(data.fotos, { onConflict: 'id' });
          
          if (fError) {
            erros.push(`Erro ao importar fotos: ${fError.message}`);
          } else {
            fotosProcessadas = data.fotos.length;
          }
        } catch (err: any) {
          erros.push(`Erro crítico ao importar fotos: ${err.message}`);
        }
      }

      // 5. Importar Envios com tratamento de erro individual
      if (data.envios && data.envios.length > 0) {
        try {
          const { error: eError } = await supabase
            .from('envios')
            .upsert(data.envios, { onConflict: 'id' });
          
          if (eError) {
            erros.push(`Erro ao importar envios: ${eError.message}`);
          } else {
            enviosProcessados = data.envios.length;
          }
        } catch (err: any) {
          erros.push(`Erro crítico ao importar envios: ${err.message}`);
        }
      }

      // 6. Determinar resultado final
      if (erros.length === 0) {
        return {
          success: true,
          message: `Dados restaurados com sucesso! ${materiaisProcessados} materiais, ${fotosProcessadas} fotos e ${enviosProcessados} envios importados.`,
          detalhes: {
            materiaisProcessados,
            fotosProcessadas,
            enviosProcessados
          }
        };
      } else if (materiaisProcessados > 0 || fotosProcessadas > 0 || enviosProcessados > 0) {
        return {
          success: true,
          message: `Restauração parcial concluída com avisos. ${materiaisProcessados} materiais, ${fotosProcessadas} fotos e ${enviosProcessados} envios importados.`,
          detalhes: {
            materiaisProcessados,
            fotosProcessadas,
            enviosProcessados,
            erros
          }
        };
      } else {
        return {
          success: false,
          message: 'Nenhum dado foi importado. Verifique o arquivo de backup.',
          detalhes: { erros }
        };
      }
    } catch (error: any) {
      console.error('Erro na restauração:', error);
      return {
        success: false,
        message: error.message || 'Erro desconhecido ao restaurar dados.',
        detalhes: { erros: [error.message] }
      };
    }
  },

  /**
   * Baixa o arquivo de backup como JSON
   */
  downloadBackup(data: BackupData) {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      
      link.href = url;
      link.download = `backup-sanremo-${date}-${time}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(`Erro ao baixar backup: ${error.message}`);
    }
  },

  /**
   * Valida se um arquivo é um backup válido
   */
  validateBackupFile(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Arquivo não é um objeto JSON válido.');
      return { valid: false, errors };
    }

    if (!Array.isArray(data.materiais)) {
      errors.push('Campo "materiais" não encontrado ou não é um array.');
    }

    if (data.fotos && !Array.isArray(data.fotos)) {
      errors.push('Campo "fotos" não é um array válido.');
    }

    if (data.envios && !Array.isArray(data.envios)) {
      errors.push('Campo "envios" não é um array válido.');
    }

    if (!data.timestamp) {
      errors.push('Campo "timestamp" não encontrado.');
    }

    if (!data.version) {
      errors.push('Campo "version" não encontrado.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Calcula o tamanho do backup em MB
   */
  calculateBackupSize(data: BackupData): string {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return `${sizeInMB} MB`;
  }
};
