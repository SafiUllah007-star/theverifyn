import React, { useState } from 'react';
import { X, Printer, FileCheck2, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CompanyIntelligence } from '../types';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompanyIntelligence;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (!isOpen) return null;

  // Build and download high-resolution PDF document
  const generateAndDownloadPdf = async (): Promise<boolean> => {
    setIsExporting(true);
    setExportStatus({ type: 'info', message: 'Generating high-resolution diligence PDF...' });

    const reportElement = document.getElementById('printable-report-area');

    // Strategy A: Capture DOM report via html2canvas for pixel-perfect formatting
    if (reportElement) {
      try {
        const canvas = await html2canvas(reportElement, {
          scale: 2, // 2x density for crisp vector-like print
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: reportElement.scrollWidth,
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const margin = 10;
        const usableWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
        heightLeft -= (pageHeight - (margin * 2));

        while (heightLeft > 0) {
          pdf.addPage();
          position = heightLeft - imgHeight + margin;
          pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
          heightLeft -= (pageHeight - (margin * 2));
        }

        const filename = `Verifyn_Diligence_${data.symbol}_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(filename);
        setExportStatus({
          type: 'success',
          message: `Diligence dossier saved: ${filename}`,
        });
        return true;
      } catch (canvasErr) {
        console.warn('html2canvas rendering warning, falling back to structured vector PDF:', canvasErr);
      }
    }

    // Strategy B: Vector PDF builder fallback using native jsPDF primitives
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let y = 16;
      const margin = 15;

      // Brand Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(5, 150, 105);
      pdf.text('VERIFYN CORPORATE INTELLIGENCE • CONFIDENTIAL DOSSIER', margin, y);
      y += 7;

      pdf.setFontSize(18);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${data.companyName} ($${data.symbol})`, margin, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`CIK: ${data.cik} | Exchange: ${data.exchange} | Sector: ${data.sector} | Generated: ${new Date().toLocaleDateString()}`, margin, y);
      y += 10;

      // Divider Line
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, y, 195, y);
      y += 8;

      // Key Overview
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Executive Overview', margin, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Chief Executive: ${data.ceo}`, margin, y);
      pdf.text(`Market Cap: ${data.marketCapFormatted}`, margin + 65, y);
      y += 5.5;
      pdf.text(`Global HQ: ${data.hqLocation}`, margin, y);
      pdf.text(`Headcount: ${data.employeeCount.toLocaleString()} (+${data.headcountGrowthYoY}% YoY)`, margin + 65, y);
      y += 10;

      // Gemini AI Risk Section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`Gemini AI Forensic Risk Assessment (${data.riskAssessment.risk_score}/100 - ${data.riskAssessment.risk_level.toUpperCase()})`, margin, y);
      y += 6;

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8.5);
      pdf.setTextColor(51, 65, 85);
      const summaryLines = pdf.splitTextToSize(`"${data.riskAssessment.summary}"`, 175);
      pdf.text(summaryLines, margin, y);
      y += (summaryLines.length * 4.5) + 4;

      if (data.riskAssessment.red_flags?.length) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Identified Red Flags:', margin, y);
        y += 5;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        data.riskAssessment.red_flags.forEach((flag) => {
          pdf.text(`• ${flag}`, margin + 2, y);
          y += 4.5;
        });
        y += 4;
      }

      // Cap Table
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Ownership Structure & Float', margin, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Institutional: ${data.capTable.institutionalPct}%  |  Insiders: ${data.capTable.insiderPct}%  |  Public Float: ${data.capTable.publicFloatPct}%`, margin, y);
      y += 10;

      // Patents
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`US Patent Portfolio Excerpt (${data.patents.length} Tracked Filings)`, margin, y);
      y += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      data.patents.slice(0, 5).forEach((p) => {
        pdf.text(`${p.id}: ${p.title} (${p.status})`, margin, y);
        y += 4.5;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Verifyn SaaS Engine • SEC EDGAR Form 10-K & PatentsView Public Registry Data', margin, 285);

      const filename = `Verifyn_Diligence_${data.symbol}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      setExportStatus({
        type: 'success',
        message: `Diligence dossier saved: ${filename}`,
      });
      return true;
    } catch (err) {
      console.error('Vector PDF export error:', err);
      setExportStatus({
        type: 'error',
        message: 'Could not generate PDF directly. Please use the Print button.',
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  // Safe native print invocation
  const handleNativePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Native window.print() failed or was blocked by container:', e);
      setExportStatus({
        type: 'info',
        message: 'Native print dialog blocked by browser iframe. Generating downloadable PDF...',
      });
      generateAndDownloadPdf();
    }
  };

  // Primary Action: Download PDF file & trigger native print
  const handlePrintOrSavePdf = async () => {
    const success = await generateAndDownloadPdf();
    
    // Also attempt browser print dialog if available
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn('Native print restricted:', e);
      }
    }, 400);

    if (success) {
      setTimeout(() => {
        setExportStatus((prev) => 
          prev?.type === 'success' ? prev : { type: 'success', message: 'PDF generated! Download started.' }
        );
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 border border-white/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-900 overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          id="pdf-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer no-print"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 no-print">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 mb-1 font-mono shadow-xs">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              Corporate Intelligence Dossier
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Executive Diligence Memorandum: {data.companyName}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary trigger requested by user */}
            <button
              id="pdf-modal-print-trigger-btn"
              onClick={handlePrintOrSavePdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md shadow-slate-900/20 active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isExporting ? 'Generating PDF...' : 'Print or Save to PDF'}</span>
            </button>

            {/* Direct Download Button */}
            <button
              id="pdf-modal-download-direct-btn"
              onClick={generateAndDownloadPdf}
              disabled={isExporting}
              title="Download PDF file directly"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Download .PDF</span>
            </button>

            {/* Native Browser Print Dialog */}
            <button
              id="pdf-modal-native-print-btn"
              onClick={handleNativePrint}
              title="Open browser print dialog"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium text-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {exportStatus && (
          <div
            id="pdf-export-status-banner"
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 font-mono no-print animate-in fade-in duration-200 ${
              exportStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                : exportStatus.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-sky-50 border border-sky-200 text-sky-800'
            }`}
          >
            {exportStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {exportStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {exportStatus.type === 'info' && <Loader2 className="w-4 h-4 text-sky-600 shrink-0 animate-spin" />}
            <span className="flex-1">{exportStatus.message}</span>
            <button
              onClick={() => setExportStatus(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Printable Report Document Body */}
        <div id="printable-report-area" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-slate-800 space-y-6 font-sans shadow-sm">
          
          {/* Memorandum Top Stamp */}
          <div className="flex justify-between items-start pb-5 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase block">
                VERIFYN CORPORATE INTELLIGENCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {data.companyName} (${data.symbol})
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                CIK: {data.cik} | Exchange: {data.exchange} | Sector: {data.sector}
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-500">
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-[10px] uppercase font-bold block mb-1">
                CONFIDENTIAL DILIGENCE
              </span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Key Executive Profile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">CHIEF EXECUTIVE</span>
              <span className="font-bold text-slate-900">{data.ceo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">MARKET CAP</span>
              <span className="font-bold text-emerald-700">{data.marketCapFormatted}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">HEADCOUNT</span>
              <span className="font-bold text-slate-800">{data.employeeCount.toLocaleString()} (+{data.headcountGrowthYoY}%)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans">GLOBAL HQ</span>
              <span className="font-bold text-slate-800 truncate">{data.hqLocation}</span>
            </div>
          </div>

          {/* Gemini AI Risk Assessment Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-slate-900 uppercase">
                Gemini AI Forensic Risk Assessment
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                Risk Score: {data.riskAssessment.risk_score}/100 ({data.riskAssessment.risk_level.toUpperCase()})
              </span>
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{data.riskAssessment.summary}"
            </p>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-mono text-slate-600 font-bold block mb-1">
                Material Red Flags Identified:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {data.riskAssessment.red_flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cap Table Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase">
              Ownership Concentration & Float
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">INSTITUTIONAL</span>
                <span className="font-bold text-emerald-700">{data.capTable.institutionalPct}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">INSIDERS</span>
                <span className="font-bold text-amber-700">{data.capTable.insiderPct}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans">PUBLIC FLOAT</span>
                <span className="font-bold text-slate-800">{data.capTable.publicFloatPct}%</span>
              </div>
            </div>
          </div>

          {/* Patent Portfolio Excerpt */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase">
              US Patent Registry Overview ({data.patents.length} Filings Tracked)
            </h4>
            <div className="divide-y divide-slate-100 text-xs font-mono">
              {data.patents.slice(0, 3).map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between gap-2">
                  <div>
                    <span className="text-emerald-700 font-bold">{p.id}: </span>
                    <span className="text-slate-800 font-sans font-medium">{p.title}</span>
                  </div>
                  <span className="text-slate-500 shrink-0 font-bold">{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memorandum Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Verifyn SaaS Engine • Acquire.com Certified Handover Spec</span>
            <span>SEC Form 10-K / PatentsView Open REST API Data</span>
          </div>

        </div>

      </div>
    </div>
  );
};
