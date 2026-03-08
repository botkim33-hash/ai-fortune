'use client';

import { WUXING_MAP, YINYANG_MAP } from '@/lib/bazi-precise';

interface BaZiPillar {
  gan: string;
  zhi: string;
  naYin?: string;
}

interface BaZiChartProps {
  bazi: {
    year: BaZiPillar;
    month: BaZiPillar;
    day: BaZiPillar;
    hour: BaZiPillar | null;
  };
  shiShen?: {
    year: { gan: string; cangGan: Array<{ gan: string; shiShen: string; weight: number }> };
    month: { gan: string; cangGan: Array<{ gan: string; shiShen: string; weight: number }> };
    day: { gan: string; cangGan: Array<{ gan: string; shiShen: string; weight: number }> };
    hour: { gan: string; cangGan: Array<{ gan: string; shiShen: string; weight: number }> } | null;
  };
  cangGan?: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
}

export default function BaZiChart({ bazi, shiShen, cangGan }: BaZiChartProps) {
  const pillars = [
    { key: 'year', label: '年柱', data: bazi.year },
    { key: 'month', label: '月柱', data: bazi.month },
    { key: 'day', label: '日柱', data: bazi.day },
    { key: 'hour', label: '时柱', data: bazi.hour },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gold mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-gold rounded-full"></span>
        八字排盘
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-center">
              <th className="pb-4 text-text-muted font-normal"></th>
              {pillars.map((pillar) => (
                <th key={pillar.key} className="pb-4 px-2">
                  <div className="text-sm text-gold-light">{pillar.label}</div>
                  {pillar.data?.naYin && (
                    <div className="text-xs text-text-muted mt-1">{pillar.data.naYin}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 天干行 */}
            <tr className="text-center">
              <td className="py-3 px-2 text-text-muted text-sm">天干</td>
              {pillars.map((pillar) => {
                const data = pillar.data;
                if (!data) {
                  return (
                    <td key={pillar.key} className="py-3 px-2">
                      <div className="w-12 h-12 mx-auto rounded-lg bg-bg-tertiary/50 flex items-center justify-center text-text-muted">
                        ?
                      </div>
                    </td>
                  );
                }
                return (
                  <td key={pillar.key} className="py-3 px-2">
                    <div className={`w-12 h-12 mx-auto rounded-lg ${getGanColor(data.gan)} flex flex-col items-center justify-center`}>
                      <span className="text-2xl font-bold">{data.gan}</span>
                      <span className="text-xs opacity-80">{YINYANG_MAP[data.gan]}</span>
                    </div>
                    {shiShen && (
                      <div className="mt-2 text-xs text-text-secondary">
                        {shiShen[pillar.key as keyof typeof shiShen]?.gan || '-'}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* 地支行 */}
            <tr className="text-center">
              <td className="py-3 px-2 text-text-muted text-sm">地支</td>
              {pillars.map((pillar) => {
                const data = pillar.data;
                if (!data) {
                  return (
                    <td key={pillar.key} className="py-3 px-2">
                      <div className="w-12 h-12 mx-auto rounded-lg bg-bg-tertiary/50 flex items-center justify-center text-text-muted">
                        ?
                      </div>
                    </td>
                  );
                }
                return (
                  <td key={pillar.key} className="py-3 px-2">
                    <div className={`w-12 h-12 mx-auto rounded-lg ${getZhiColor(data.zhi)} flex flex-col items-center justify-center`}>
                      <span className="text-2xl font-bold">{data.zhi}</span>
                      <span className="text-xs opacity-80">{YINYANG_MAP[data.zhi]}</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 藏干行 */}
            <tr className="text-center">
              <td className="py-3 px-2 text-text-muted text-sm">藏干</td>
              {pillars.map((pillar) => {
                const hiddenStems = shiShen?.[pillar.key as keyof typeof shiShen]?.cangGan 
                  || cangGan?.[pillar.key as keyof typeof cangGan]?.map(g => ({ gan: g, shiShen: '', weight: 1 }))
                  || [];
                
                if (!bazi[pillar.key as keyof typeof bazi]) {
                  return <td key={pillar.key} className="py-3 px-2 text-text-muted">-</td>;
                }

                return (
                  <td key={pillar.key} className="py-3 px-2">
                    <div className="space-y-1">
                      {hiddenStems.length > 0 ? (
                        hiddenStems.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className={`${getWuxingColor(item.gan)} font-medium`}>{item.gan}</span>
                            {item.shiShen && (
                              <span className="text-text-muted ml-1">{item.shiShen}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 图例 */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/30"></span>
          <span className="text-text-secondary">木</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500/30"></span>
          <span className="text-text-secondary">火</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-500/30"></span>
          <span className="text-text-secondary">土</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-400/30"></span>
          <span className="text-text-secondary">金</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500/30"></span>
          <span className="text-text-secondary">水</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <span className="text-gold">★</span>
          <span className="text-text-secondary">日主</span>
        </div>
      </div>
    </div>
  );
}

function getGanColor(gan: string): string {
  const wx = WUXING_MAP[gan];
  const baseColors: Record<string, string> = {
    '木': 'bg-green-500/20 text-green-400 border border-green-500/30',
    '火': 'bg-red-500/20 text-red-400 border border-red-500/30',
    '土': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    '金': 'bg-gray-400/20 text-gray-300 border border-gray-400/30',
    '水': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  return baseColors[wx] || 'bg-bg-tertiary text-text-primary';
}

function getZhiColor(zhi: string): string {
  const wx = WUXING_MAP[zhi];
  const baseColors: Record<string, string> = {
    '木': 'bg-green-500/15 text-green-400 border border-green-500/20',
    '火': 'bg-red-500/15 text-red-400 border border-red-500/20',
    '土': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    '金': 'bg-gray-400/15 text-gray-300 border border-gray-400/20',
    '水': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  };
  return baseColors[wx] || 'bg-bg-tertiary text-text-primary';
}

function getWuxingColor(gan: string): string {
  const wx = WUXING_MAP[gan];
  const colors: Record<string, string> = {
    '木': 'text-green-400',
    '火': 'text-red-400',
    '土': 'text-yellow-400',
    '金': 'text-gray-300',
    '水': 'text-blue-400',
  };
  return colors[wx] || 'text-text-primary';
}
