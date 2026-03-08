'use client';

import { useState } from 'react';
import { WUXING_MAP } from '@/lib/bazi-precise';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DaYunItem {
  startAge: number;
  endAge: number;
  gan: string;
  zhi: string;
  element: string;
  shiShen: string;
}

interface DaYunChartProps {
  daYun: DaYunItem[];
  qiYun?: {
    startAge: number;
    startYear: number;
    direction: string;
  };
  currentAge?: number;
}

export default function DaYunChart({ daYun, qiYun, currentAge }: DaYunChartProps) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5;

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - 1));
  };

  const handleNext = () => {
    setStartIndex(Math.min(daYun.length - visibleCount, startIndex + 1));
  };

  const visibleDaYun = daYun.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gold flex items-center gap-2">
          <span className="w-1 h-5 bg-gold rounded-full"></span>
          大运走势
        </h3>
        
        {qiYun && (
          <div className="text-sm text-text-secondary">
            {qiYun.startAge}岁起运 · {qiYun.direction}
          </div>
        )}
      </div>

      {/* 大运时间轴 */}
      <div className="relative">
        {/* 导航按钮 */}
        {daYun.length > visibleCount && (
          <>
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-bg-tertiary border border-border flex items-center justify-center disabled:opacity-30 hover:border-gold/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex >= daYun.length - visibleCount}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-bg-tertiary border border-border flex items-center justify-center disabled:opacity-30 hover:border-gold/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="grid grid-cols-5 gap-2 px-6">
          {visibleDaYun.map((dy, idx) => {
            const actualIndex = startIndex + idx;
            const isCurrent = currentAge && currentAge >= dy.startAge && currentAge <= dy.endAge;
            
            return (
              <div
                key={actualIndex}
                className={`text-center p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-gold/20 border-gold'
                    : 'bg-bg-tertiary/30 border-border hover:border-gold/30'
                }`}
              >
                <div className="text-xs text-text-muted mb-1">
                  {dy.startAge}-{dy.endAge}岁
                </div>
                
                <div className={`text-xl font-bold mb-1 ${getElementColor(dy.element)}`}>
                  {dy.gan}{dy.zhi}
                </div>
                
                <div className="text-xs text-text-secondary">
                  {dy.element} · {dy.shiShen}
                </div>
                
                {isCurrent && (
                  <div className="mt-2 text-xs text-gold font-medium">
                    ★ 当前
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 大运说明 */}
      <div className="mt-6 pt-4 border-t border-border text-sm text-text-secondary">
        <p>大运是人生每十年的运势周期，每步大运的天干地支会影响这十年的吉凶祸福。当前所处的大运对人生影响最大。</p>
      </div>
    </div>
  );
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    '木': 'text-green-400',
    '火': 'text-red-400',
    '土': 'text-yellow-400',
    '金': 'text-gray-300',
    '水': 'text-blue-400',
  };
  return colors[element] || 'text-text-primary';
}
