export interface SamplePair {
  id: string;
  name: string;
  clientBrand: string;
  retailer: string;
  documentName: string;
  prevDate: string;
  newDate: string;
  description: string;
  prevFileName: string;
  newFileName: string;
  prevContent: string;
  newContent: string;
}

export const SAMPLE_PAIRS: SamplePair[] = [
  {
    id: 'tesco-range-review',
    name: 'Tesco Q3 Range Review (Confectionery)',
    clientBrand: 'Apex Foods UK',
    retailer: 'Tesco Stores Ltd',
    documentName: 'Q3 Range Review — Premium Confectionery & Snacking',
    prevDate: '2026-04-15',
    newDate: '2026-08-10',
    description: 'Quarterly assortment review containing SKU listings, store distributions, case sizes, wholesale pricing, and shelf placement.',
    prevFileName: 'Apex_Foods_Tesco_RangeReview_Q2_2026.csv',
    newFileName: 'Apex_Foods_Tesco_RangeReview_Q3_2026_Final.csv',
    prevContent: `SKU,Product Name,Product Code,Category,Pack Size,RRP (£),Cost Price (£),Distribution (Store Count),Range Status,Promo Mechanic,Margin (%),Minimum Order (Cases),Lead Time (Days)
SKU-1001,Apex Salted Caramel Artisan Bar 100g,501002341,Premium Chocolate,100g,2.50,1.45,840,Listed,2 for £4.00 (Slot 4),42.0%,50,3
SKU-1002,Apex Dark Cocoa Nibs 85% 100g,501002342,Premium Chocolate,100g,2.50,1.48,820,Listed,15% Off Week 32,40.8%,50,3
SKU-1003,Apex Hazelnut Praline Sharing Pouch 180g,501002343,Sharing Bags,180g,3.80,2.15,750,Listed,£3.00 Special Buy,43.4%,40,4
SKU-1004,Apex Orange Blossom Truffles 140g,501002344,Seasonal & Gifting,140g,4.50,2.60,620,Listed,None,42.2%,30,5
SKU-1005,Apex Espresso Crunch Snacking Bites 65g,501002345,Countlines,65g,1.40,0.78,920,Listed,2 for £2.20,44.3%,100,3
SKU-1006,Apex Raspberry White Chocolate Bar 90g,501002346,Premium Chocolate,90g,2.30,1.32,410,Trial Listing,None,42.6%,40,4
SKU-1007,Apex Roasted Almond Cluster 120g,501002347,Sharing Bags,120g,3.20,1.85,780,Listed,25% Off Feature,42.2%,60,3`,
    newContent: `SKU,Product Name,Product Code,Category,Pack Size,RRP (£),Cost Price (£),Distribution (Store Count),Range Status,Promo Mechanic,Margin (%),Minimum Order (Cases),Lead Time (Days)
SKU-1001,Apex Salted Caramel Artisan Bar 100g,501002341,Premium Chocolate,100g,2.75,1.58,840,Listed,2 for £4.50 (Slot 4),42.5%,50,3
SKU-1002,Apex Dark Cocoa Nibs 85% 100g,501002342,Premium Chocolate,100g,2.75,1.60,710,Listed,20% Off Week 36,41.8%,50,5
SKU-1003,Apex Hazelnut Praline Sharing Pouch 180g,501002343,Sharing Bags,180g,3.80,2.15,750,Listed,£3.00 Special Buy,43.4%,40,4
SKU-1004,Apex Orange Blossom Truffles 140g,501002344,Seasonal & Gifting,140g,4.50,2.60,0,Delisted,Not listed,Not available in the supplied documents.,0,0
SKU-1005,Apex Espresso Crunch Snacking Bites 65g,501002345,Countlines,65g,1.55,0.85,920,Listed,2 for £2.40,45.1%,120,3
SKU-1007,Apex Roasted Almond Cluster 120g,501002347,Sharing Bags,120g,3.20,1.85,830,Listed,33% Off Feature,42.2%,60,3
SKU-1008,Apex Pistachio Cream Wafer Pouch 160g,501002348,Sharing Bags,160g,3.95,2.20,680,New Launch (Oct 2026),Introductory 20% Off,44.3%,50,4`,
  },
  {
    id: 'sainsburys-promo-plan',
    name: "Sainsbury's Commercial & Promo Agreement",
    clientBrand: 'Revive Botanicals Beverage Co.',
    retailer: "Sainsbury's Supermarkets",
    documentName: 'Q4 National Promotional Agreement & Commercial Terms',
    prevDate: '2026-06-01',
    newDate: '2026-09-05',
    description: 'Retailer commercial terms sheet detailing promotional windows, gondola end feature slots, co-op media fees, and supply service level penalties.',
    prevFileName: 'Revive_Sainsburys_PromoTerms_Q3_Approved.txt',
    newFileName: 'Revive_Sainsburys_PromoTerms_Q4_Revised.txt',
    prevContent: `COMMERCIAL AGREEMENT & PROMOTIONAL SCHEDULE - Q3 2026
Supplier: Revive Botanicals Beverage Co.
Retailer: Sainsbury's Supermarkets Ltd
Agreement Reference: JBP-2026-REV-03

1. BASE PRODUCT PRICING & TERMS
- Revive Sparkling Ginger Lime 330ml (SKU-501): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.65
- Revive Blood Orange Elderflower 330ml (SKU-502): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.65
- Revive Passionfruit Hibiscus 330ml (SKU-503): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.65
- Revive Multipack 4x330ml Assorted (SKU-520): Base Cost £2.90 / Unit, Case Size 6, Standard RRP £5.25

2. PROMOTIONAL MECHANICS & CALENDAR
- Window P8 (Aug 10 - Aug 30): Multibuy 2 for £2.80 on single cans across all 650 Superstores. Supplier funded scanback: £0.18 / unit sold.
- Window P9 (Sep 14 - Oct 04): Multipack £4.25 promotional price. Supplier scanback: £0.45 / unit sold. Gondola End Feature Bay in Top 300 stores.

3. MARKETING & CO-OP INVESTMENT
- Sainsbury's Magazine Full Page Feature: £8,500 contribution.
- Digital App Banner (Week 34): £3,200 contribution.
- Total Q3 Marketing Co-Op Commitment: £11,700.

4. SUPPLY CHAIN & SERVICE LEVELS
- Delivery window: 48 hours order-to-delivery at Daventry RDC.
- Target In-Full Service Level: 97.5%.
- Failure penalty: Warning notice prior to debit charges.`,
    newContent: `COMMERCIAL AGREEMENT & PROMOTIONAL SCHEDULE - Q4 2026
Supplier: Revive Botanicals Beverage Co.
Retailer: Sainsbury's Supermarkets Ltd
Agreement Reference: JBP-2026-REV-04

1. BASE PRODUCT PRICING & TERMS
- Revive Sparkling Ginger Lime 330ml (SKU-501): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.75
- Revive Blood Orange Elderflower 330ml (SKU-502): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.75
- Revive Passionfruit Hibiscus 330ml (SKU-503): Base Cost £0.82 / Unit, Case Size 12, Standard RRP £1.75
- Revive Multipack 4x330ml Assorted (SKU-520): Base Cost £3.10 / Unit, Case Size 6, Standard RRP £5.50

2. PROMOTIONAL MECHANICS & CALENDAR
- Window P11 (Nov 02 - Nov 22): Multibuy 2 for £3.00 on single cans across 650 Superstores. Supplier funded scanback: £0.22 / unit sold.
- Window P12 (Dec 07 - Dec 28): Multipack £4.50 promotional price. Supplier scanback: £0.50 / unit sold. Feature relocated from Gondola End to Secondary Aisle Stack.

3. MARKETING & CO-OP INVESTMENT
- Sainsbury's Magazine Festive Feature: £10,500 contribution.
- Digital App Banner & Nectar App Boost: £4,800 contribution.
- Total Q4 Marketing Co-Op Commitment: £15,300.

4. SUPPLY CHAIN & SERVICE LEVELS
- Delivery window: 24 hours order-to-delivery at Daventry RDC.
- Target In-Full Service Level: 98.5%.
- Failure penalty: Strict £250 per late vehicle charge plus 1.5% deduction on affected PO value.`,
  },
];
