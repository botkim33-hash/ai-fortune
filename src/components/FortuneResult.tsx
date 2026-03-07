'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefreshCw, Share2, ChevronDown, ChevronUp } from 'lucide-react';

interface FortuneResultProps {
  result: any;
  type: 'single' | 'compatibility';
  onReset: () => void;
}

// Markdown 渲染组件
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-gold max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-gold mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-gold-light mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-white mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
          strong: ({ children }) => <strong className="text-gold font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside text-text-secondary mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-text-secondary mb-4 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-4">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gold pl-4 italic text-text-secondary my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function FortuneResult({ result, type, onReset }: FortuneResultProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (type === 'single') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* 八字展示卡片 */}
        <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
          
          <p className="text-sm text-gold mb-4 tracking-wider">八字命盘</p>
          
          <div className="text-4xl md:text-5xl font-bold text-white tracking-[0.2em] mb-8 font-display">
            {result.baZiStr}
          </div>
          
          {/* 四柱 */}
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: '年柱', pillar: result.baZi.yearPillar },
              { label: '月柱', pillar: result.baZi.monthPillar },
              { label: '日柱', pillar: result.baZi.dayPillar },
              { label: '时柱', pillar: result.baZi.hourPillar },
            ].map(({ label, pillar }) => (
              pillar && (
                <div key={label} className="text-center p-4 rounded-xl bg-bg-tertiary/50">
                  <p className="text-xs text-text-muted mb-2">{label}</p>
                  <div className="text-2xl font-bold text-gold mb-1">{pillar.heavenly}</div>
                  <div className="text-xl font-bold text-white">{pillar.earthly}</div>
                </div>
              )
            ))}
          </div>

          {/* 五行 */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-text-secondary mb-4">五行分布</p>
            <div className="flex justify-center gap-6">
              {(Object.entries(result.fiveElements) as [string, number][]).map(([element, count]) => {
                const labels: Record<string, string> = {
                  wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
                };
                const colors: Record<string, string> = {
                  wood: 'text-green-400', fire: 'text-red-400', 
                  earth: 'text-yellow-400', metal: 'text-gray-300', water: 'text-blue-400'
                };
                return (
                  <div key={element} className="text-center">
                    <div className={`text-2xl font-bold ${colors[element]}`}>{count}</div>
                    <div className="text-sm text-text-muted">{labels[element]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI 解读 */}
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gold flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full"></span>
              AI 命理解读
            </h3>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-text-muted hover:text-gold transition-colors flex items-center gap-1"
            >
              {showRaw ? (
                <>隐藏原文 <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>显示原文 <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
          {/* Markdown 渲染 */}
          <div className="bg-bg-tertiary/30 rounded-xl p-6">
            <MarkdownContent content={result.rawResponse} />
          </div>
          
          {/* 原始 Markdown（可选） */}
          {showRaw && (
            <div className="mt-4 p-4 bg-bg-tertiary/50 rounded-xl">
              <p className="text-sm text-text-muted mb-2">原始内容：</p>
              <pre className="text-xs text-text-secondary whitespace-pre-wrap">{result.rawResponse}</pre>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-8 py-4 rounded-xl glass hover:border-gold/50 hover:bg-gold/5 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            重新测算
          </button>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('链接已复制！');
            }}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 className="w-5 h-5" />
            分享结果
          </button>
        </div>
      </div>
    );
  }

  // 合盘结果
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* 匹配度卡片 */}
      <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple/10 to-transparent pointer-events-none" />
        
        <p className="text-sm text-purple mb-4 tracking-wider">双方匹配度</p>
        
        <div className="text-7xl md:text-8xl font-bold text-gold-gradient mb-4 font-display">
          {result.result.score}
          <span className="text-3xl">分</span>
        </div>
        
        <div className="w-full max-w-md mx-auto h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-1000"
            style={{ width: `${result.result.score}%` }}
          />
        </div>
        
        <p className="mt-4 text-text-secondary">
          {result.result.score >= 80 ? '天作之合 🎉' : 
           result.result.score >= 60 ? '缘分不浅 💕' : 
           result.result.score >= 40 ? '需要磨合 🤝' : '挑战较大 💪'}
        </p>
      </div>

      {/* 双方八字 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border-l-4 border-gold">
          <p className="text-sm text-gold mb-2">甲方八字</p>
          <div className="text-2xl font-bold text-white font-display">{result.person1.baZiStr}</div>
        </div>
        
        <div className="glass rounded-2xl p-6 border-l-4 border-purple">
          <p className="text-sm text-purple mb-2">乙方八字</p>
          <div className="text-2xl font-bold text-white font-display">{result.person2.baZiStr}</div>
        </div>
      </div>

      {/* AI 合盘分析 */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gold flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full"></span>
            AI 合盘分析
          </h3>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-sm text-text-muted hover:text-gold transition-colors flex items-center gap-1"
          >
            {showRaw ? (
              <>隐藏原文 <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>显示原文 <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
        
        <div className="bg-bg-tertiary/30 rounded-xl p-6">
          <MarkdownContent content={result.result.rawResponse} />
        </div>
        
        {showRaw && (
          <div className="mt-4 p-4 bg-bg-tertiary/50 rounded-xl">
            <p className="text-sm text-text-muted mb-2">原始内容：</p>
            <pre className="text-xs text-text-secondary whitespace-pre-wrap">{result.result.rawResponse}</pre>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-4 rounded-xl glass hover:border-gold/50 hover:bg-gold/5 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          重新测算
        </button>
        
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('链接已复制！');
          }}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity"
        >
          <Share2 className="w-5 h-5" />
          分享结果
        </button>
      </div>
    </div>
  );
}
