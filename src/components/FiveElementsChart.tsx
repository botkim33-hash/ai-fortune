'use client';

import { WUXING_COLORS } from '@/lib/constants';

interface FiveElementsChartProps {
  elements: Record<string, number>;
  counts?: Record<string, number>;
  dominant?: string;
  weakest?: string;
}

export default function FiveElementsChart({ 
  elements, 
  counts,
  dominant,
  weakest 
}: FiveElementsChartProps) {
  const elementOrder = ['木', '火', '土', '金', '水'];
  const elementColors: Record<string, { bg: string; text: string; bar: string }> = {
    '木': { bg: 'bg-green-500/20', text: 'text-green-400', bar: 'bg-green-500' },
    '火': { bg: 'bg-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
    '土': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', bar: 'bg-yellow-500' },
    '金': { bg: 'bg-gray-400/20', text: 'text-gray-300', bar: 'bg-gray-400' },
    '水': { bg: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
  };

  // 计算最大值用于缩放
  const maxValue = Math.max(...Object.values(elements));
  const maxCount = counts ? Math.max(...Object.values(counts)) : 0;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gold mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-gold rounded-full"></span>
        五行力量分析
      </h3>

      <div className="space-y-4">
        {elementOrder.map((element) => {
          const value = elements[element] || 0;
          const count = counts?.[element] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const colors = elementColors[element];
          const isDominant = dominant === element;
          const isWeakest = weakest === element;

          return (
            <div key={element} className="relative">
              <div className="flex items-center gap-3">
                {/* 五行标签 */}
                <div 
                  className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-lg ${
                    isDominant ? 'ring-2 ring-gold' : ''
                  } ${isWeakest ? 'opacity-60' : ''}`}
                >
                  {element}
                </div>

                {/* 进度条 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${colors.text}`}>
                      {isDominant && <span className="text-gold">★ 旺</span>}
                      {isWeakest && <span className="text-gray-400">弱</span>}
                    </span>
                    <span className="text-sm text-text-secondary">
                      力量: {value.toFixed(1)} {counts && `| 个数: ${count}`}
                    </span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 五行说明 */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-5 gap-2 text-center text-xs">
        {elementOrder.map((element) => (
          <div key={element} className="text-text-muted">
            <div className={`font-bold ${elementColors[element].text} mb-1`}>{element}</div>
            <div>{getElementOrgan(element)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getElementOrgan(element: string): string {
  const organs: Record<string, string> = {
    '木': '肝胆',
    '火': '心小肠',
    '土': '脾胃',
    '金': '肺大肠',
    '水': '肾膀胱',
  };
  return organs[element] || '';
}
