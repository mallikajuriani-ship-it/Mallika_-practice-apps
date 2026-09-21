import * as XLSX from 'xlsx';
import { AnalysisResult } from '../types';

export function exportAnalysisToExcel(analysis: AnalysisResult) {
  const wb = XLSX.utils.book_new();

  // 1. Changes Sheet
  const changesData = [
    [
      'Impact',
      'Change Type',
      'Category',
      'Change Title',
      'What Changed',
      'Previous Value',
      'New Value',
      'Why It Matters',
      'Recommended Action',
      'Evidence (Previous)',
      'Evidence (New)',
    ],
    ...analysis.changes.map((c) => [
      c.impact.toUpperCase(),
      c.change_type.toUpperCase(),
      c.category,
      c.title,
      c.what_changed,
      c.previous_value,
      c.new_value,
      c.why_it_matters,
      c.recommended_action,
      c.evidence_previous,
      c.evidence_new,
    ]),
  ];

  const wsChanges = XLSX.utils.aoa_to_sheet(changesData);
  XLSX.utils.book_append_sheet(wb, wsChanges, 'Detected Changes');

  // 2. Action Plan Sheet
  const actionData = [
    ['Priority', 'Action', 'Reason', 'Related Change', 'Status'],
    ...analysis.actionPlan.map((a) => [
      a.priority.toUpperCase(),
      a.action,
      a.reason,
      a.related_change,
      a.status || 'Pending',
    ]),
  ];

  const wsActions = XLSX.utils.aoa_to_sheet(actionData);
  XLSX.utils.book_append_sheet(wb, wsActions, 'Action Plan');

  // 3. Executive Summary Sheet
  const summaryData = [
    ['CPG CHANGE RADAR — COMMERCIAL INTELLIGENCE REPORT'],
    ['Generated Date', new Date(analysis.timestamp).toLocaleString()],
    [''],
    ['DOCUMENT METADATA'],
    ['Client / Brand', analysis.metadata.clientBrand || 'Not specified'],
    ['Retailer', analysis.metadata.retailer || 'Not specified'],
    ['Document Name', analysis.metadata.documentName || 'Not specified'],
    ['Previous Version File', analysis.previousFileName],
    ['Previous Version Date', analysis.metadata.previousVersionDate || 'Not specified'],
    ['New Version File', analysis.newFileName],
    ['New Version Date', analysis.metadata.newVersionDate || 'Not specified'],
    [''],
    ['EXECUTIVE SUMMARY METRICS'],
    ['Total Changes Detected', analysis.executiveSummary.totalChanges],
    ['High Impact Changes', analysis.executiveSummary.highImpactCount],
    ['Medium Impact Changes', analysis.executiveSummary.mediumImpactCount],
    ['Low Impact Changes', analysis.executiveSummary.lowImpactCount],
    [''],
    ['EXECUTIVE NARRATIVE'],
    [analysis.executiveSummary.narrativeSummary || 'None'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Filename
  const brand = analysis.metadata.clientBrand ? analysis.metadata.clientBrand.replace(/[^a-zA-Z0-9_-]/g, '_') : 'CPG';
  const retailer = analysis.metadata.retailer ? analysis.metadata.retailer.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Retailer';
  const fileName = `CPG_Change_Radar_${brand}_${retailer}_${new Date(analysis.timestamp).toISOString().split('T')[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
