import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of GoogleGenAI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    model: 'gemini-3.8-flash',
    timestamp: Date.now(),
  });
});

// Deterministic commercial difference engine for CSV/tabular documents
function analyzeTabularDifferences(prevText: string, newText: string, metadata: any) {
  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map((line) => {
      // Simple CSV split handling quotes
      const values: string[] = [];
      let inQuote = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
          values.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      values.push(cur.trim().replace(/^["']|["']$/g, ''));
      return values;
    });
    return { headers, rows };
  };

  const prevParsed = parseCSV(prevText);
  const newParsed = parseCSV(newText);

  const changes: any[] = [];
  const actionPlan: any[] = [];

  // Check if both have headers with SKU or Product
  const skuIdxPrev = prevParsed.headers.findIndex((h) => /sku|product\s*code|item\s*code|id/i.test(h));
  const skuIdxNew = newParsed.headers.findIndex((h) => /sku|product\s*code|item\s*code|id/i.test(h));
  const nameIdxPrev = prevParsed.headers.findIndex((h) => /product\s*name|description|title|item/i.test(h));
  const nameIdxNew = newParsed.headers.findIndex((h) => /product\s*name|description|title|item/i.test(h));

  if (skuIdxPrev !== -1 && skuIdxNew !== -1) {
    const prevMap = new Map<string, { row: string[]; rawLine: string }>();
    prevParsed.rows.forEach((r) => {
      const sku = r[skuIdxPrev];
      if (sku) prevMap.set(sku, { row: r, rawLine: r.join(', ') });
    });

    const newMap = new Map<string, { row: string[]; rawLine: string }>();
    newParsed.rows.forEach((r) => {
      const sku = r[skuIdxNew];
      if (sku) newMap.set(sku, { row: r, rawLine: r.join(', ') });
    });

    // 1. Check for removed SKUs
    for (const [sku, item] of prevMap.entries()) {
      if (!newMap.has(sku)) {
        const prodName = nameIdxPrev !== -1 ? item.row[nameIdxPrev] : sku;
        changes.push({
          id: `change-${changes.length + 1}`,
          change_type: 'removed',
          category: 'Range',
          title: `SKU ${sku} (${prodName}) removed from range`,
          what_changed: `Product ${prodName} (SKU: ${sku}) was listed in the previous review but is absent in the new range file.`,
          previous_value: `Listed in previous range (${item.rawLine})`,
          new_value: 'Not listed in new version',
          impact: 'high',
          why_it_matters:
            'Indicates a complete delisting or discontinuation by the retailer, leading directly to lost revenue and stranded inventory.',
          recommended_action:
            'Confirm the delisting status with the retailer category manager immediately and prepare a sell-down or transition plan.',
          evidence_previous: `Row in previous document: ${item.rawLine}`,
          evidence_new: 'SKU not found in new document rows.',
        });
      }
    }

    // 2. Check for added SKUs
    for (const [sku, item] of newMap.entries()) {
      if (!prevMap.has(sku)) {
        const prodName = nameIdxNew !== -1 ? item.row[nameIdxNew] : sku;
        changes.push({
          id: `change-${changes.length + 1}`,
          change_type: 'added',
          category: 'Launch',
          title: `New SKU ${sku} (${prodName}) added to range`,
          what_changed: `New product ${prodName} (SKU: ${sku}) introduced into the retailer assortment.`,
          previous_value: 'Not present in previous review',
          new_value: `Listed (${item.rawLine})`,
          impact: 'high',
          why_it_matters:
            'Requires commercial launch readiness, pipeline stock production, supply chain fulfillment, and retail store execution.',
          recommended_action:
            'Align supply chain on launch volume forecasts, verify EDI order connectivity, and schedule promotional launch activity.',
          evidence_previous: 'SKU absent from previous document.',
          evidence_new: `Row in new document: ${item.rawLine}`,
        });
      }
    }

    // 3. Check for modified rows across matching SKUs
    for (const [sku, newItem] of newMap.entries()) {
      const prevItem = prevMap.get(sku);
      if (!prevItem) continue;

      const prodName = nameIdxNew !== -1 ? newItem.row[nameIdxNew] : sku;

      for (let col = 0; col < newParsed.headers.length; col++) {
        const header = newParsed.headers[col];
        const prevCol = prevParsed.headers.indexOf(header);
        if (prevCol === -1) continue;

        const valPrev = prevItem.row[prevCol] ?? '';
        const valNew = newItem.row[col] ?? '';

        if (valPrev.trim() !== valNew.trim() && valPrev !== '' && valNew !== '') {
          let category = 'Product';
          let impact = 'medium';
          let why = `The ${header} for ${prodName} has been revised from ${valPrev} to ${valNew}.`;
          let action = `Review the change in ${header} with the account team.`;

          if (/rrp|price|cost|margin/i.test(header)) {
            category = 'Price';
            impact = 'high';
            why = `Directly impacts gross margin, retailer price-index positioning, and potential consumer price-elasticity.`;
            action = `Audit commercial margin calculations and verify that retailer invoicing matches agreed cost pricing.`;
          } else if (/store|distribution|count/i.test(header)) {
            category = 'Distribution';
            impact = parseInt(valNew) < parseInt(valPrev) ? 'high' : 'medium';
            why = `Change in physical distribution (${valPrev} -> ${valNew} stores) materially shifts baseline rate of sale and weekly production volume.`;
            action = `Adjust demand forecasts and reallocate regional field sales merchandising support.`;
          } else if (/promo|mechanic|discount/i.test(header)) {
            category = 'Promotion';
            impact = 'medium';
            why = `Adjustments to promotional mechanics impact promotional ROI, supplier scanback costs, and promotional uplift volumes.`;
            action = `Evaluate promotional contribution margins against brand profitability targets.`;
          } else if (/lead\s*time|minimum|order|case|supply/i.test(header)) {
            category = 'Supply Chain';
            impact = 'medium';
            why = `Alters operational delivery parameters and pallet holding requirements across distribution centers.`;
            action = `Brief logistics operations and review order batch sizes with inventory planning.`;
          } else if (/status|range/i.test(header)) {
            category = 'Range';
            impact = /delist/i.test(valNew) ? 'high' : 'medium';
            why = `Status change reflects retailer shelf commitment and listing tenure.`;
            action = `Engage with retailer category buyer to discuss range strategy.`;
          }

          changes.push({
            id: `change-${changes.length + 1}`,
            change_type: 'changed',
            category,
            title: `${header} changed for SKU ${sku} (${prodName})`,
            what_changed: `${header} was changed from "${valPrev}" to "${valNew}".`,
            previous_value: valPrev,
            new_value: valNew,
            impact,
            why_it_matters: why,
            recommended_action: action,
            evidence_previous: `Column [${header}] in previous row: ${valPrev}`,
            evidence_new: `Column [${header}] in new row: ${valNew}`,
          });
        }
      }
    }
  }

  // Fallback for non-SKU text documents (e.g. Terms / agreements)
  if (changes.length === 0) {
    const prevLines = prevText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newLines = newText.split('\n').map((l) => l.trim()).filter(Boolean);

    // Look for lines in new doc not in prev doc
    newLines.forEach((nLine) => {
      const matchingPrev = prevLines.find((p) => {
        const prefix = p.slice(0, 20);
        return prefix.length > 5 && nLine.startsWith(prefix);
      });

      if (matchingPrev && matchingPrev !== nLine) {
        let cat = 'Commercial Terms';
        let impact = 'medium';
        if (/price|rrp|cost|fee|scanback|penalty/i.test(nLine)) {
          cat = /price|rrp|cost/i.test(nLine) ? 'Price' : 'Commercial Terms';
          impact = 'high';
        } else if (/delivery|service|hours|rdc/i.test(nLine)) {
          cat = 'Supply Chain';
          impact = 'high';
        } else if (/promo|mechanic|window/i.test(nLine)) {
          cat = 'Promotion';
          impact = 'medium';
        }

        changes.push({
          id: `change-${changes.length + 1}`,
          change_type: 'changed',
          category: cat,
          title: `Revised clause in ${cat.toLowerCase()} terms`,
          what_changed: `Clause was updated in the revised commercial schedule.`,
          previous_value: matchingPrev,
          new_value: nLine,
          impact,
          why_it_matters: `Shifts commercial liability, supplier funding obligations, or delivery requirements.`,
          recommended_action: `Review with Commercial Director and legal / supply chain leads before formal sign-off.`,
          evidence_previous: matchingPrev,
          evidence_new: nLine,
        });
      }
    });
  }

  // Deduplicate and prioritize actions
  const highItems = changes.filter((c) => c.impact === 'high');
  const medItems = changes.filter((c) => c.impact === 'medium');
  const lowItems = changes.filter((c) => c.impact === 'low');

  [...highItems, ...medItems].slice(0, 8).forEach((ch, idx) => {
    actionPlan.push({
      id: `act-${idx + 1}`,
      priority: ch.impact,
      action: ch.recommended_action,
      reason: `${ch.category} modification: ${ch.title}`,
      related_change: ch.title,
      status: 'pending',
    });
  });

  const narrative = `Comparison of "${metadata?.documentName || 'Commercial Documents'}" identified ${changes.length} material changes (${highItems.length} High Impact, ${medItems.length} Medium Impact, ${lowItems.length} Low Impact). High-priority modifications require immediate commercial alignment across range listings, pricing, and operational service levels.`;

  return {
    no_changes_detected: changes.length === 0,
    message: changes.length === 0 ? 'No material changes were identified between these documents.' : '',
    executive_summary: {
      total_changes: changes.length,
      high_impact_count: highItems.length,
      medium_impact_count: medItems.length,
      low_impact_count: lowItems.length,
      narrative_summary: narrative,
    },
    changes,
    action_plan: actionPlan,
  };
}

// Document Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { metadata, previousDoc, newDoc } = req.body;

    if (!previousDoc || !newDoc) {
      return res.status(400).json({ error: 'Both previous document and new document are required.' });
    }

    const ai = getGeminiClient();

    let parsedData: any = null;

    if (ai) {
      try {
        const contents: any[] = [];
        const promptInstructions = `
You are the AI engine of "CPG Change Radar", a commercial intelligence application for Consumer Packaged Goods (CPG) professionals.
Your purpose: "Know what changed. Know what matters. Know what to do."

CRITICAL CPG RELIABILITY RULES:
1. NEVER invent information, numbers, SKUs, prices, or financial calculations.
2. NEVER claim a change exists without exact evidence from the provided documents.
3. If information is not available, explicitly say: "Not available in the supplied documents."
4. Preserve exact numbers, currencies, units, and SKU codes from source documents.
5. Distinguish facts from interpretation. Label potential business impact as potential unless explicitly proven by documents.
6. Avoid treating formatting/layout changes as meaningful commercial changes. Focus on business-critical changes.
7. If no material commercial changes exist between the two documents, set "no_changes_detected": true and provide the message: "No material changes were identified between these documents."

CHANGE CATEGORIES (Every change must be assigned exactly one primary category):
- Product
- Range
- Price
- Promotion
- Distribution
- Sales
- Supply Chain
- Commercial Terms
- Launch
- Packaging
- Marketing
- Compliance
- Timeline
- Other

IMPACT LEVELS:
- HIGH: Potentially requires immediate commercial attention or action (e.g. delisting, major price/cost shift, severe penalty clause, major margin erosion, cancelled slot).
- MEDIUM: Potentially relevant and should be investigated (e.g. date shift, feature space location change, co-op marketing fee increase, lead time change).
- LOW: Useful information but unlikely to require immediate action (e.g. minor description tweak, secondary barcode update, small administrative detail).

METADATA:
Client/Brand: ${metadata?.clientBrand || 'Not specified'}
Retailer: ${metadata?.retailer || 'Not specified'}
Document Name: ${metadata?.documentName || 'Not specified'}
Previous Version Date: ${metadata?.previousVersionDate || 'Not specified'}
New Version Date: ${metadata?.newVersionDate || 'Not specified'}

Analyze the PREVIOUS DOCUMENT and the NEW DOCUMENT below.
Identify all meaningful ADDED, REMOVED, and CHANGED information.

Return valid JSON adhering strictly to this schema:
{
  "no_changes_detected": boolean,
  "message": string,
  "executive_summary": {
    "total_changes": number,
    "high_impact_count": number,
    "medium_impact_count": number,
    "low_impact_count": number,
    "narrative_summary": string
  },
  "changes": [
    {
      "change_type": "added" | "removed" | "changed",
      "category": "Product" | "Range" | "Price" | "Promotion" | "Distribution" | "Sales" | "Supply Chain" | "Commercial Terms" | "Launch" | "Packaging" | "Marketing" | "Compliance" | "Timeline" | "Other",
      "title": string,
      "what_changed": string,
      "previous_value": string,
      "new_value": string,
      "impact": "high" | "medium" | "low",
      "why_it_matters": string,
      "recommended_action": string,
      "evidence_previous": string,
      "evidence_new": string
    }
  ],
  "action_plan": [
    {
      "priority": "high" | "medium" | "low",
      "action": string,
      "reason": string,
      "related_change": string
    }
  ]
}
`;
        contents.push({ text: promptInstructions });

        if (previousDoc.base64 && previousDoc.mimeType) {
          contents.push({ text: `--- PREVIOUS DOCUMENT: "${previousDoc.name}" ---` });
          contents.push({
            inlineData: { mimeType: previousDoc.mimeType, data: previousDoc.base64 },
          });
        } else {
          contents.push({
            text: `--- PREVIOUS DOCUMENT: "${previousDoc.name}" ---\n${previousDoc.textContent || ''}\n--- END PREVIOUS DOCUMENT ---`,
          });
        }

        if (newDoc.base64 && newDoc.mimeType) {
          contents.push({ text: `--- NEW DOCUMENT: "${newDoc.name}" ---` });
          contents.push({
            inlineData: { mimeType: newDoc.mimeType, data: newDoc.base64 },
          });
        } else {
          contents.push({
            text: `--- NEW DOCUMENT: "${newDoc.name}" ---\n${newDoc.textContent || ''}\n--- END NEW DOCUMENT ---`,
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        parsedData = JSON.parse(response.text || '{}');
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic comparator:', geminiError);
        // Fallback to deterministic comparator
        parsedData = analyzeTabularDifferences(previousDoc.textContent || '', newDoc.textContent || '', metadata);
      }
    } else {
      // Deterministic comparator fallback when no API key is provided
      parsedData = analyzeTabularDifferences(previousDoc.textContent || '', newDoc.textContent || '', metadata);
    }

    // Format & normalize output
    const changes = (parsedData.changes || []).map((ch: any, idx: number) => ({
      id: `change-${idx + 1}-${Date.now()}`,
      change_type: ch.change_type || 'changed',
      category: ch.category || 'Other',
      title: ch.title || 'Commercial change detected',
      what_changed: ch.what_changed || '',
      previous_value: ch.previous_value || 'Not available in the supplied documents.',
      new_value: ch.new_value || 'Not available in the supplied documents.',
      impact: (ch.impact || 'medium').toLowerCase(),
      why_it_matters: ch.why_it_matters || '',
      recommended_action: ch.recommended_action || '',
      evidence_previous: ch.evidence_previous || 'N/A',
      evidence_new: ch.evidence_new || 'N/A',
    }));

    const highImpactCount = changes.filter((c: any) => c.impact === 'high').length;
    const mediumImpactCount = changes.filter((c: any) => c.impact === 'medium').length;
    const lowImpactCount = changes.filter((c: any) => c.impact === 'low').length;

    const actionPlan = (parsedData.action_plan || []).map((act: any, idx: number) => ({
      id: `act-${idx + 1}-${Date.now()}`,
      priority: (act.priority || 'medium').toLowerCase(),
      action: act.action || '',
      reason: act.reason || '',
      related_change: act.related_change || '',
      status: 'pending',
    }));

    const result = {
      id: `analysis-${Date.now()}`,
      timestamp: Date.now(),
      metadata: {
        clientBrand: metadata?.clientBrand || '',
        retailer: metadata?.retailer || '',
        documentName: metadata?.documentName || '',
        previousVersionDate: metadata?.previousVersionDate || '',
        newVersionDate: metadata?.newVersionDate || '',
      },
      previousFileName: previousDoc.name,
      newFileName: newDoc.name,
      noChangesDetected: !!parsedData.no_changes_detected || changes.length === 0,
      message: parsedData.message || (changes.length === 0 ? 'No material changes were identified between these documents.' : ''),
      executiveSummary: {
        totalChanges: changes.length,
        highImpactCount: parsedData.executive_summary?.high_impact_count ?? highImpactCount,
        mediumImpactCount: parsedData.executive_summary?.medium_impact_count ?? mediumImpactCount,
        lowImpactCount: parsedData.executive_summary?.low_impact_count ?? lowImpactCount,
        narrativeSummary: parsedData.executive_summary?.narrative_summary || '',
      },
      changes,
      actionPlan,
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error during analysis:', err);
    return res.status(500).json({
      error: err?.message || 'An unexpected error occurred while analyzing the documents.',
    });
  }
});

// Ask AI about changes
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question, analysisData, conversationHistory } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `
You are the AI commercial advisor for "CPG Change Radar".
The user is asking a question about the commercial document changes detected between a previous version and a new version.

STRICT GROUNDING INSTRUCTIONS:
1. Answer using ONLY the supplied analysis and document facts provided below.
2. If the answer cannot be supported by the documents or analysis, explicitly say:
   "This information is not available in the supplied documents or analysis."
3. NEVER fabricate numbers, dates, terms, or financial assumptions.
4. When discussing potential impact, clearly label it as potential commercial risk or opportunity.
5. Be concise, professional, structured, and direct for CPG commercial executives (Sales, Category, RGM, Supply Chain).

CURRENT ANALYSIS CONTEXT:
Document Name: ${analysisData?.metadata?.documentName || 'Document Comparison'}
Client / Brand: ${analysisData?.metadata?.clientBrand || 'N/A'}
Retailer: ${analysisData?.metadata?.retailer || 'N/A'}
Total Changes Detected: ${analysisData?.executiveSummary?.totalChanges || 0}
High Impact: ${analysisData?.executiveSummary?.highImpactCount || 0}, Medium Impact: ${analysisData?.executiveSummary?.mediumImpactCount || 0}, Low Impact: ${analysisData?.executiveSummary?.lowImpactCount || 0}
Executive Summary: ${analysisData?.executiveSummary?.narrativeSummary || 'N/A'}

DETECTED CHANGES LIST:
${JSON.stringify(analysisData?.changes || [], null, 2)}

ACTION PLAN:
${JSON.stringify(analysisData?.actionPlan || [], null, 2)}

PREVIOUS CONVERSATION:
${(conversationHistory || []).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER QUESTION:
"${question}"
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });

        return res.json({ answer: response.text || 'No response generated.' });
      } catch (geminiError) {
        console.warn('Gemini chat failed, falling back to grounded query parser:', geminiError);
      }
    }

    // Fallback answer generation grounded on the analysis data
    const q = question.toLowerCase();
    const changes: any[] = analysisData?.changes || [];
    const high = changes.filter((c) => c.impact === 'high');

    if (/most important|highest impact|top changes|critical/i.test(q)) {
      const topList = high.map((c, i) => `${i + 1}. **${c.title}** (${c.category}): ${c.why_it_matters} Action: ${c.recommended_action}`).join('\n\n');
      return res.json({
        answer: `Based on the audit, there are **${high.length} High Impact changes** requiring immediate attention:\n\n${topList}`,
      });
    }

    if (/price|cost|margin|rrp/i.test(q)) {
      const priceChanges = changes.filter((c) => c.category === 'Price' || /price|rrp|cost|margin/i.test(c.title));
      if (priceChanges.length === 0) {
        return res.json({ answer: 'No price changes were identified in the supplied documents.' });
      }
      const list = priceChanges.map((c, i) => `${i + 1}. **${c.title}**: Previous: ${c.previous_value} &rarr; New: ${c.new_value}. *Commercial note:* ${c.why_it_matters}`).join('\n\n');
      return res.json({
        answer: `Identified **${priceChanges.length} price-related changes**:\n\n${list}`,
      });
    }

    if (/supply|lead\s*time|minimum\s*order|logistics|penalty/i.test(q)) {
      const supplyChanges = changes.filter((c) => c.category === 'Supply Chain' || /lead|order|supply|delivery|service/i.test(c.title));
      if (supplyChanges.length === 0) {
        return res.json({ answer: 'No supply chain changes were identified in the supplied documents.' });
      }
      const list = supplyChanges.map((c, i) => `${i + 1}. **${c.title}**: Previous: ${c.previous_value} &rarr; New: ${c.new_value}. *Why it matters:* ${c.why_it_matters}`).join('\n\n');
      return res.json({
        answer: `Identified **${supplyChanges.length} supply chain changes**:\n\n${list}`,
      });
    }

    if (/sales|discuss|retailer|buyer|meeting/i.test(q)) {
      const actions = analysisData?.actionPlan || [];
      const list = actions.map((a: any, i: number) => `${i + 1}. [${a.priority.toUpperCase()}] **${a.action}** (Driver: ${a.reason})`).join('\n\n');
      return res.json({
        answer: `For the upcoming retailer discussion, prioritize these **${actions.length} action points**:\n\n${list}`,
      });
    }

    if (/ceo|summar|brief/i.test(q)) {
      const exec = analysisData?.executiveSummary;
      return res.json({
        answer: `**Executive Summary for Leadership**\n\n${exec?.narrativeSummary || 'Audit complete.'}\n\n- **Total Detected Changes:** ${exec?.totalChanges}\n- **High Impact:** ${exec?.highImpactCount} items requiring immediate commercial sign-off.\n- **Medium Impact:** ${exec?.mediumImpactCount} operational items to monitor.\n- **Recommended Immediate Action:** ${analysisData?.actionPlan?.[0]?.action || 'Review changes with commercial team.'}`,
      });
    }

    // Generic match
    const matching = changes.filter((c) => c.title.toLowerCase().includes(q) || c.what_changed.toLowerCase().includes(q));
    if (matching.length > 0) {
      const list = matching.map((c, i) => `${i + 1}. **${c.title}** (${c.impact.toUpperCase()} impact): ${c.what_changed}\nPrevious: ${c.previous_value} | New: ${c.new_value}`).join('\n\n');
      return res.json({ answer: `Found ${matching.length} matching change(s):\n\n${list}` });
    }

    return res.json({
      answer: `This information is not explicitly available in the supplied documents or analysis. The analysis currently tracks ${changes.length} detected changes across ${high.length} high-impact items. You can ask specifically about pricing, range delistings, promotional mechanics, or supply chain terms.`,
    });
  } catch (err: any) {
    console.error('Error in /api/ask-ai:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate answer.',
    });
  }
});

// ==========================================
// AUTHENTICATION & USER MANAGEMENT API
// ==========================================

function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return db.getUserBySession(token);
}

// User Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { user, token } = db.registerUser({ email, password, name, role, department });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { user, token } = db.login(email, password);
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Invalid credentials.' });
  }
});

// Quick Demo Login (Executive Director or Category Manager)
app.post('/api/auth/demo', (req, res) => {
  try {
    const roleType = req.body.role === 'category' ? 'category' : 'director';
    const { user, token } = db.demoLogin(roleType);
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initialize demo session.' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized session.' });
  }
  return res.json({ user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.logout(token);
  }
  return res.json({ success: true });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  try {
    const updated = db.updateProfile(user.id, req.body);
    return res.json({ user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

// ==========================================
// DATABASE PERSISTENCE & ANALYSES API
// ==========================================

// Get All Analyses (from DB)
app.get('/api/analyses', (req, res) => {
  const user = getAuthUser(req);
  const query = req.query.q as string | undefined;
  const analyses = db.getAnalyses(user?.id, query);
  return res.json({ analyses });
});

// Get Single Analysis by ID
app.get('/api/analyses/:id', (req, res) => {
  const user = getAuthUser(req);
  const analysis = db.getAnalysisById(req.params.id, user?.id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found in database.' });
  }
  return res.json({ analysis });
});

// Save Analysis to Database
app.post('/api/analyses', (req, res) => {
  const user = getAuthUser(req);
  const userId = user?.id || 'usr-guest';
  try {
    const record = db.saveAnalysis(userId, req.body);
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save analysis to database.' });
  }
});

// Delete Analysis from Database
app.delete('/api/analyses/:id', (req, res) => {
  const user = getAuthUser(req);
  const userId = user?.id || 'usr-guest';
  const success = db.deleteAnalysis(req.params.id, userId);
  return res.json({ success });
});

// Update Action Item Status (Pending / In Progress / Completed)
app.patch('/api/analyses/:id/actions/:actionId', (req, res) => {
  const user = getAuthUser(req);
  const userId = user?.id || 'usr-guest';
  const { status } = req.body;
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const success = db.updateActionItemStatus(req.params.id, req.params.actionId, status, userId);
  return res.json({ success });
});

// Get Live Database Statistics
app.get('/api/database/stats', (req, res) => {
  const user = getAuthUser(req);
  const stats = db.getDatabaseStats(user?.id);
  return res.json({ stats });
});

// Setup Vite or static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CPG Change Radar server running on http://0.0.0.0:${PORT}`);
  });
}

start();
