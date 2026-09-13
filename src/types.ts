export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  is_pro: boolean;
  lemon_squeezy_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Executive {
  name: string;
  title: string;
  tenure: string;
  previousCompany?: string;
}

export interface RevenuePoint {
  year: string;
  revenue: number; // in Millions USD
  grossProfit: number;
  netIncome: number;
  marginPercent: number;
}

export interface Shareholder {
  name: string;
  percentage: number;
  shares: string;
  type: 'Institutional' | 'Insider' | 'Strategic';
  filingDate: string;
}

export interface CapTableData {
  institutionalPct: number;
  insiderPct: number;
  publicFloatPct: number;
  topShareholders: Shareholder[];
}

export interface PatentItem {
  id: string;
  title: string;
  filingDate: string;
  grantDate: string;
  status: 'Granted' | 'Pending' | 'Expired';
  assignee: string;
  classification: string;
  abstractSnippet: string;
}

export interface GeminiRiskAssessment {
  risk_score: number; // 0 to 100
  risk_level: 'Low' | 'Moderate' | 'High' | 'Severe';
  red_flags: string[];
  summary: string;
  confidenceScore?: number;
  sourceFiling?: string;
  lastAnalysisTimestamp?: string;
}

export interface CompetitorMetric {
  ticker: string;
  name: string;
  evToRevenue: number;
  peRatio: number;
  grossMargin: number;
  rdRatio: number;
  aiRiskGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
}

export interface CompanyIntelligence {
  symbol: string;
  cik: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  hqLocation: string;
  incorporationStateOrCountry: string;
  incorporationDate: string;
  ceo: string;
  marketCapFormatted: string;
  enterpriseValueFormatted: string;
  employeeCount: number;
  headcountGrowthYoY: number;
  secEdgarRecentFiling: {
    form: string;
    filingDate: string;
    accessionNumber: string;
    reportUrl?: string;
  };
  companiesHouseReg?: {
    companyNumber: string;
    jurisdiction: string;
    status: string;
    nextFilingDue: string;
  };
  revenueHistory: RevenuePoint[];
  leadership: Executive[];
  capTable: CapTableData;
  patents: PatentItem[];
  riskAssessment: GeminiRiskAssessment;
  competitors: CompetitorMetric[];
}
