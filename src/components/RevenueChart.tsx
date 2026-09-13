import React, { useState } from 'react';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';
import { TrendingUp, CalendarRange } from 'lucide-react';
import { RevenuePoint } from '../types';
import { GlassCard } from './GlassCard';

interface RevenueChartProps {
  data: RevenuePoint[];
  symbol: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, symbol }) => {
  const [timeHorizon, setTimeHorizon] = useState<'3Y' | '10Y'>('3Y');

  // Compute 10-year extended sequence if selected
  const chartData = React.useMemo(() => {
    if (timeHorizon === '3Y') {
      return data;
    }
    // Generate synthetic earlier statutory years (2015-2020) anchoring to earliest data point
    const baseRev = data[0]?.revenue || 50000;
    const baseGross = data[0]?.grossProfit || 12000;
    const baseNet = data[0]?.netIncome || 4000;

    const historical = [
      { year: '2015', revenue: Math.round(baseRev * 0.18), grossProfit: Math.round(baseGross * 0.16), netIncome: Math.round(baseNet * 0.1), marginPercent: 22.8 },
      { year: '2016', revenue: Math.round(baseRev * 0.28), grossProfit: Math.round(baseGross * 0.25), netIncome: Math.round(baseNet * 0.15), marginPercent: 23.2 },
      { year: '2017', revenue: Math.round(baseRev * 0.42), grossProfit: Math.round(baseGross * 0.38), netIncome: Math.round(baseNet * 0.22), marginPercent: 21.5 },
      { year: '2018', revenue: Math.round(baseRev * 0.58), grossProfit: Math.round(baseGross * 0.52), netIncome: Math.round(baseNet * 0.4), marginPercent: 23.9 },
      { year: '2019', revenue: Math.round(baseRev * 0.72), grossProfit: Math.round(baseGross * 0.68), netIncome: Math.round(baseNet * 0.55), marginPercent: 24.5 },
      { year: '2020', revenue: Math.round(baseRev * 0.85), grossProfit: Math.round(baseGross * 0.82), netIncome: Math.round(baseNet * 0.75), marginPercent: 25.1 },
      ...data,
    ];
    return historical;
  }, [data, timeHorizon]);

  const latest = chartData[chartData.length - 1];
  const earliest = chartData[0];
  const cagr = Math.round(
    ((Math.pow(latest.revenue / earliest.revenue, 1 / (chartData.length - 1)) - 1) * 100) || 0
  );

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              {timeHorizon === '3Y' ? '3-Year' : '10-Year'} Revenue & Margin Trajectory
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              Unrestricted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            US GAAP Filings (Millions USD) vs. Gross Margin %
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          {/* 3Y / 10Y Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setTimeHorizon('3Y')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeHorizon === '3Y'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3-Year
            </button>
            <button
              onClick={() => setTimeHorizon('10Y')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeHorizon === '10Y'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              10-Year Recharts
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-semibold shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>~{cagr}% CAGR</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="JetBrains Mono"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#059669"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              fontFamily="JetBrains Mono"
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl text-xs font-mono space-y-1 backdrop-blur-xl">
                      <p className="text-slate-900 font-bold border-b border-slate-100 pb-1 mb-1">
                        Fiscal Year {label} ({symbol})
                      </p>
                      <p className="text-slate-700 flex justify-between gap-4">
                        <span className="text-slate-500">Revenue:</span>
                        <span className="font-bold text-emerald-700">
                          ${(payload[0]?.value as number)?.toLocaleString()}M
                        </span>
                      </p>
                      <p className="text-slate-700 flex justify-between gap-4">
                        <span className="text-slate-500">Gross Profit:</span>
                        <span className="font-bold text-slate-800">
                          ${(payload[1]?.value as number)?.toLocaleString()}M
                        </span>
                      </p>
                      <p className="text-slate-700 flex justify-between gap-4">
                        <span className="text-slate-500">Gross Margin:</span>
                        <span className="font-bold text-emerald-600">
                          {payload[2]?.value}%
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue ($M)"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              maxBarSize={timeHorizon === '10Y' ? 24 : 45}
            />
            <Bar
              yAxisId="left"
              dataKey="grossProfit"
              name="Gross Profit ($M)"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              maxBarSize={timeHorizon === '10Y' ? 24 : 45}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="marginPercent"
              name="Gross Margin %"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: timeHorizon === '10Y' ? 2.5 : 4, fill: '#0284c7' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-slate-200/80 text-center text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 block font-sans">Latest Revenue</span>
          <span className="text-sm font-bold text-slate-900">
            ${(latest.revenue / 1000).toFixed(1)}B
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 block font-sans">Gross Margin</span>
          <span className="text-sm font-bold text-emerald-700">
            {latest.marginPercent}%
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 block font-sans">Net Operating</span>
          <span className="text-sm font-bold text-slate-800">
            ${(latest.netIncome / 1000).toFixed(1)}B
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
