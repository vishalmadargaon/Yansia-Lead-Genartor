/**
 * Multi-Format Lead Export Utilities (Zero-Cost)
 * Generates CSV, Excel (.xlsx), and PDF reports with clickable Google Maps & WhatsApp links.
 * Works seamlessly on both CRM Leads and Discovery Candidates.
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { CrmLead, CandidateStaging } from '../types/leadDiscovery.ts';

export class ExportUtils {
  /**
   * Export CRM Leads as RFC-4180 CSV
   */
  static exportToCsv(leads: CrmLead[], filename = 'yanisa_crm_leads.csv') {
    if (leads.length === 0) return;

    const headers = [
      'Lead ID',
      'Business Name',
      'City',
      'Area',
      'Address',
      'Service Line',
      'Website',
      'Telephone',
      'Email',
      'Fit Score (%)',
      'Confidence (%)',
      'Pipeline Status',
      'Source Provider',
      'Source Reference',
      'Google Maps URL',
      'WhatsApp Link',
      'Imported At'
    ];

    const rows = leads.map(l => [
      l.lead_id,
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.area || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      l.service_line.toUpperCase(),
      l.website || 'Missing',
      l.phone || 'Missing',
      l.email || 'Missing',
      l.fit_score,
      l.data_confidence,
      l.status,
      l.source_provider,
      l.source_reference,
      l.google_maps_url,
      l.whatsapp_url || '',
      l.imported_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export Discovery Candidates directly as CSV
   */
  static exportCandidatesToCsv(candidates: CandidateStaging[], filename = 'yanisa_discovered_pipeline.csv') {
    if (candidates.length === 0) return;

    const headers = [
      'Rank',
      'Business Name',
      'City',
      'Area',
      'Address',
      'Service Line',
      'Website',
      'Contact Phone',
      'Email',
      'Fit Score (%)',
      'Data Confidence (%)',
      'Source Provider',
      'Source Reference',
      'Evidence'
    ];

    const rows = candidates.map((c, i) => [
      c.ai_selection_rank || i + 1,
      `"${(c.business_name || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.area || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.service_line_primary.toUpperCase(),
      c.website || 'Missing',
      c.phone || 'Missing',
      c.email || 'Missing',
      c.service_fit_score,
      c.data_confidence,
      c.source_provider,
      c.source_reference,
      `"${(c.evidence_summary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export CRM Leads as formatted Excel workbook (.xlsx)
   */
  static exportToXlsx(leads: CrmLead[], filename = 'yanisa_crm_leads.xlsx') {
    if (leads.length === 0) return;

    const dataRows = leads.map(l => ({
      'Lead ID': l.lead_id,
      'Business Name': l.business_name,
      'City': l.city,
      'Area': l.area,
      'Address': l.address,
      'Yanisa Service': l.service_line.toUpperCase(),
      'Official Website': l.website || 'Missing',
      'Phone': l.phone || 'Missing',
      'Email': l.email || 'Missing',
      'Fit Score': `${l.fit_score}%`,
      'Data Confidence': `${l.data_confidence}%`,
      'Status': l.status,
      'Source Provider': l.source_provider,
      'Source Reference': l.source_reference,
      'Google Maps Link': l.google_maps_url,
      'WhatsApp Link': l.whatsapp_url || 'N/A',
      'Imported At': l.imported_at
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CRM Verified Leads');
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export Discovery Candidates directly as Excel workbook (.xlsx)
   */
  static exportCandidatesToXlsx(candidates: CandidateStaging[], filename = 'yanisa_discovered_pipeline.xlsx') {
    if (candidates.length === 0) return;

    const dataRows = candidates.map((c, i) => ({
      'Rank': c.ai_selection_rank || i + 1,
      'Business Name': c.business_name,
      'City': c.city,
      'Area': c.area,
      'Address': c.address,
      'Service Line': c.service_line_primary.toUpperCase(),
      'Official Website': c.website || 'Not Listed',
      'Contact Phone': c.phone || 'Not Listed',
      'Email': c.email || 'Not Listed',
      'Fit Score': `${c.service_fit_score}%`,
      'Data Confidence': `${c.data_confidence}%`,
      'Source Provider': c.source_provider,
      'Evidence Summary': c.evidence_summary
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Discovery Pipeline');
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export Discovery Candidates as clean PDF Executive Report
   */
  static exportCandidatesToPdf(candidates: CandidateStaging[], filename = 'yanisa_discovered_leads.pdf') {
    if (candidates.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [79, 70, 229]; // Indigo-600
    const textColor = [30, 41, 59];
    const grayColor = [100, 116, 139];

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 297, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('YANISA AI-SDR | VERIFIED LEAD DISCOVERY PIPELINE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Total Leads: ${candidates.length} | Generated: ${new Date().toLocaleDateString()}`, 215, 12);

    // Table Header
    let y = 28;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, 269, 8, 'F');

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('#', 16, y);
    doc.text('BUSINESS NAME', 25, y);
    doc.text('LOCATION / CORRIDOR', 95, y);
    doc.text('CONTACT PHONE', 150, y);
    doc.text('EMAIL / DOMAIN', 195, y);
    doc.text('FIT', 260, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    for (let i = 0; i < Math.min(candidates.length, 100); i++) {
      const c = candidates[i];
      if (y > 190) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(String(c.ai_selection_rank || i + 1), 16, y);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(c.business_name.substring(0, 35), 25, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`${c.area || 'Commercial'}, ${c.city}`.substring(0, 30), 95, y);

      if (c.phone) {
        doc.setTextColor(5, 150, 105);
      } else {
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      }
      doc.text(c.phone || '-- (Not Listed)', 150, y);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const emailOrWeb = c.email || (c.website ? c.website.replace(/^https?:\/\//, '') : '--');
      doc.text(emailOrWeb.substring(0, 32), 195, y);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.service_fit_score}%`, 260, y);

      y += 6.5;
    }

    doc.save(filename);
  }

  /**
   * Export CRM Leads as PDF Dossier
   */
  static exportToPdf(leads: CrmLead[], filename = 'yanisa_crm_leads.pdf') {
    if (leads.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [79, 70, 229];
    const textColor = [30, 41, 59];
    const grayColor = [100, 116, 139];

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 297, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('YANISA CRM | VERIFIED PIPELINE DOSSIER', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Total Leads: ${leads.length} | Generated: ${new Date().toLocaleDateString()}`, 215, 12);

    // Table Header
    let y = 28;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, 269, 8, 'F');

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('LEAD ID', 16, y);
    doc.text('BUSINESS NAME', 40, y);
    doc.text('LOCATION', 105, y);
    doc.text('TELEPHONE', 160, y);
    doc.text('EMAIL / DOMAIN', 205, y);
    doc.text('STATUS', 260, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    for (let i = 0; i < Math.min(leads.length, 100); i++) {
      const l = leads[i];
      if (y > 190) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(l.lead_id.substring(0, 12), 16, y);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(l.business_name.substring(0, 32), 40, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`${l.area || ''}, ${l.city}`.substring(0, 28), 105, y);

      if (l.phone) {
        doc.setTextColor(5, 150, 105);
      } else {
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      }
      doc.text(l.phone || '-- (Not Listed)', 160, y);

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text((l.email || l.website || '--').substring(0, 28), 205, y);

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(l.status, 260, y);

      y += 6.5;
    }

    doc.save(filename);
  }
}
