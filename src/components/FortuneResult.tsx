'use client';

import { RefreshCw, Download, Share2 } from 'lucide-react';

interface FortuneResultProps {
  result: any;
  type: 'single' | 'compatibility';
  onReset: () => void;
}

export default function FortuneResult({ result, type, onReset }: FortuneResultProps) {
  if (type === 'single') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 八字展示 */}
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-gold mb-4">八字命盘</p>
          <div className="text-3xl md:text-5xl font-bold text-white tracking-wider mb-6">
            {result.baZiStr}
          </div>
          
          {/* 四柱 */}
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {['年柱', '月柱', '日柱', '时柱'].map((label, i) => {
              const pillars = [
                result.baZi.yearPillar,
                result.baZi.monthPillar,
                result.baZi.dayPillar,
                result.baZi.hourPillar,
              ];
              const pillar = pillars[i];
              if (!pillar) return null;
              
              return (
                <div key={label} className="text-center">
                  <p className="text-xs text-text-muted mb-2">{label}</p>
                  <div className="text-lg font-bold text-gold">{pillar.heavenly}</div>
                  <div className="text-lg font-bold text-white">{pillar.earthly}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 解读 */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gold mb-6">AI 命理解读</h3>
          
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
              {result.rawResponse}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:border-gold/50 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            重新测算
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-bg-primary font-bold hover:opacity-90 transition-opacity">
            <Share2 className="w-5 h-5" />
            分享结果
          </button>
        </div>
      </div>
    );
  }

  // 合盘结果
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 匹配度 */}
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-gold mb-4">双方匹配度</p>
        <div className="text-6xl md:text-8xl font-bold text-gold-gradient mb-4">
          {result.result.score}分
        </div>
        
        <div className="w-full max-w-md mx-auto h-4 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
            style={{ width: `${result.result.score}%` }}
          />
        </div>
      </div>

      {/* 双方八字 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gold mb-2">甲方八字</p>
          <div className="text-2xl font-bold text-white">{result.person1.baZiStr}</div>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-purple mb-2">乙方八字</p>
          <div className="text-2xl font-bold text-white">{result.person2.baZiStr}</div>
        </div>
      </div>

      {/* AI 合盘分析 */}
      <div className="glass rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gold mb-6">AI 合盘分析</h3>
        
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
            {result.rawResponse}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:border-gold/50 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          重新测算
        </button>
        
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-bg-primary font-bold hover:opacity-90 transition-opacity">
          <Share2 className="w-5 h-5" />
          分享结果
        </button>
      </div>
    </div>
  );
}
