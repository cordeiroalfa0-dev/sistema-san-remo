import { supabase } from './supabase'
import { Envio, EnvioFormData } from '../types/material'
import { materialService } from './materialService'

export const envioService = {
  async criarEnvio(dados: EnvioFormData): Promise<void> {
    // 1. Registrar o envio na tabela 'envios'
    const { error } = await supabase
      .from('envios')
      .insert([{
        ...dados,
        usuario_id: dados.usuario_id,
        usuario_nome: dados.usuario_nome
      }])
    
    if (error) {
      console.error('Erro ao inserir na tabela envios:', error)
      throw error
    }

    // 2. Buscar material atual para verificar quantidade
    const materialAtual = await materialService.buscarPorId(dados.material_id)
    
    if (materialAtual.quantidade < dados.quantidade) {
      throw new Error(`Quantidade insuficiente em estoque. Disponível: ${materialAtual.quantidade}`)
    }

    // 3. Se a quantidade enviada for igual à total, apenas muda o destino
    if (materialAtual.quantidade === dados.quantidade) {
      await materialService.atualizarMaterial(dados.material_id, {
        destino: dados.destino
      })
    } else {
      // 4. Se for parcial, subtrai do original e cria um novo registro no destino
      // Nota: Em um sistema real, isso deveria ser uma transação atômica no banco
      await materialService.atualizarMaterial(dados.material_id, {
        quantidade: materialAtual.quantidade - dados.quantidade
      })

      const { id, created_at, updated_at, fotos, ...dadosNovoMaterial } = materialAtual
      
      // Corrigido: Não gera um novo código REMO, mantém o mesmo do material original
      // para que o rastreio do produto seja mantido pelo mesmo código.
      // Removido o campo 'codigo_remo' do UNIQUE no banco se for necessário múltiplos registros 
      // com o mesmo código em locais diferentes, ou alterada a lógica de duplicidade.
      // Como o usuário pediu para "puxar o código do produto quando foi cadastrado",
      // vamos garantir que ele seja enviado.
      
      await materialService.criarMaterial({
        ...dadosNovoMaterial,
        destino: dados.destino,
        quantidade: dados.quantidade,
        codigo_remo: materialAtual.codigo_remo // Mantém o código original
      })
    }

  },

  async criarEnviosEmLote(envios: EnvioFormData[]): Promise<void> {
    for (const envio of envios) {
      await this.criarEnvio(envio)
    }
  },

  async listarEnvios(): Promise<Envio[]> {
    const { data, error } = await supabase
      .from('envios')
      .select('*, material:materiais(*)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}
