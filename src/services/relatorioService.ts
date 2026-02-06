import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Material } from "../types/material";
import { supabase } from "./supabase";

const LOGO_SAN_REMO =
  "data:image/png;base64,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";

export const relatorioService = {
  async getEstatisticasPorDestino() {
    try {
      const { data, error } = await supabase
        .from("materiais")
        .select("destino");

      if (error) throw error;

      const stats: Record<string, number> = {};
      data.forEach((item: any) => {
        const d = item.destino || "Não Definido";
        stats[d] = (stats[d] || 0) + 1;
      });

      return stats;
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      return {};
    }
  },

  gerarPDF(materiais: Material[], filtros: string, userEmail?: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Cabeçalho com Logotipo
    try {
      const logoWidth = 60;
      const logoHeight = 18;
      const logoX = (pageWidth - logoWidth) / 2;
      // Adicionando fundo branco atrás do logo caso o PDF tenha algum tema ou o logo seja escuro
      doc.addImage(
        LOGO_SAN_REMO,
        "PNG",
        logoX,
        5,
        logoWidth,
        logoHeight,
        undefined,
        "FAST",
      );
    } catch (error) {
      console.warn("Erro ao adicionar logo:", error);
    }

    // Título do relatório
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE MATERIAIS", pageWidth / 2, 32, { align: "center" });

    // Subtítulo com filtros
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(filtros, pageWidth / 2, 40, { align: "center" });

    // Linha decorativa
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);

    // Informações Gerais
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    const dataGeracao = new Date().toLocaleString("pt-BR");
    let yPosition = 55;

    doc.setFont("helvetica", "bold");
    doc.text("Data de Geração:", 14, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(dataGeracao, 45, yPosition);

    if (userEmail) {
      yPosition += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Gerado por:", 14, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(userEmail, 45, yPosition);
    }

    yPosition += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Total Registros:", 14, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(materiais.length.toString(), 45, yPosition);

    // Tabela de Dados com novas colunas
    const tableData = materiais.map((m) => [
      m.codigo_remo,
      m.nome,
      m.destino,
      m.quantidade.toString(),
      m.usuario_nome || "Sistema",
      new Date(m.created_at).toLocaleDateString("pt-BR"),
    ]);

    autoTable(doc, {
      startY: yPosition + 10,
      head: [["CÓDIGO", "NOME", "DESTINO", "QTD", "USUÁRIO", "DATA"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 30, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 35 },
        5: { cellWidth: 25, halign: "center" },
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Rodapé
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
      doc.text(
        "San Remo - Sistema de Gerenciamento de Materiais",
        14,
        pageHeight - 10,
      );
    }

    const timestamp = new Date().getTime();
    doc.save(`relatorio-materiais-${timestamp}.pdf`);
  },

  gerarExcel(materiais: Material[]) {
    const data = materiais.map((m) => ({
      "Código Remo": m.codigo_remo,
      Nome: m.nome,
      Descrição: m.descricao,
      Destino: m.destino,
      Quantidade: m.quantidade,
      Unidade: m.unidade,
      Usuário: m.usuario_nome || "Sistema",
      "Data de Cadastro": new Date(m.created_at).toLocaleString("pt-BR"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materiais");

    const timestamp = new Date().getTime();
    XLSX.writeFile(wb, `relatorio-materiais-${timestamp}.xlsx`);
  },
};
