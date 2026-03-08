'use client';

import { Sparkles, Star, Zap, Heart, BookOpen, Mountain } from 'lucide-react';

interface ShenShaItem {
  name: string;
  position: string;
  description: string;
}

interface ShenShaChartProps {
  shenSha: ShenShaItem[];
}

const SHEN_SHA_ICONS: Record<string, React.ReactNode> = {
  '桃花': <Heart className="w-4 h-4 text-pink-400" />,
  '天乙贵人': <Star className="w-4 h-4 text-gold" />,
  '驿马': <Zap className="w-4 h-4 text-yellow-400" />,
  '华盖': <Mountain className="w-4 h-4 text-purple-400" />,
  '文昌': <BookOpen className="w-4 h-4 text-blue-400" />,
  '羊刃': <Sparkles className="w-4 h-4 text-red-400" />,
  '空亡': <Sparkles className="w-4 h-4 text-gray-400" />,
};

const SHEN_SHA_COLORS: Record<string, string> = {
  '桃花': 'border-pink-500/30 bg-pink-500/10',
  '天乙贵人': 'border-gold/30 bg-gold/10',
  '驿马': 'border-yellow-500/30 bg-yellow-500/10',
  '华盖': 'border-purple-500/30 bg-purple-500/10',
  '文昌': 'border-blue-500/30 bg-blue-500/10',
  '羊刃': 'border-red-500/30 bg-red-500/10',
  '空亡': 'border-gray-500/30 bg-gray-500/10',
};

export default function ShenShaChart({ shenSha }: ShenShaChartProps) {
  if (!shenSha || shenSha.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-gold rounded-full"></span>
          神煞
        </h3>
        <p className="text-text-secondary text-sm">无明显神煞</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-gold rounded-full"></span>
        神煞
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shenSha.map((item, idx) => {
          const icon = SHEN_SHA_ICONS[item.name] || <Sparkles className="w-4 h-4" />;
          const colorClass = SHEN_SHA_COLORS[item.name] || 'border-border bg-bg-tertiary/30';
          
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${colorClass} flex items-start gap-3`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{item.name}</span>
                  <span className="text-xs text-text-muted">{item.position}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
