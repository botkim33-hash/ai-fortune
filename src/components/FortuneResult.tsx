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
        {/* 用户信息卡片 */}
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
          
          <p className="text-sm text-gold mb-4 tracking-wider">测算信息</p>
          
          <div className="text-lg text-text-secondary space-y-2">
            <p><span className="text-white">姓名：</span> {result.personInfo?.name || '未填写'}</p>
            <p><span className="text-white">性别：</span> {result.personInfo?.gender === 'male' ? '男' : '女'}</p>
            <p><span className="text-white">出生时间：</span> {result.personInfo?.year}年{result.personInfo?.month}月{result.personInfo?.day}日 {result.personInfo?.hour >= 0 ? result.personInfo?.hour + ':00' : '时辰未知'}</p>
          </div>
          
          {result.baZiStr && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-gold mb-2">八字</p>
              <div className="text-3xl font-bold text-white font-display tracking-wider">{result.baZiStr}</div>
            </div>
          )}
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
                <>收起 <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>展开 <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
          
          <div className="bg-bg-tertiary/30 rounded-xl p-6">
            <MarkdownContent content={result.rawResponse} />
          </div>
          
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
          {result.result?.score || 70}
          <span className="text-3xl">分</span>
        </div>
        
        <div className="w-full max-w-md mx-auto h-3 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full transition-all duration-1000"
            style={{ width: `${result.result?.score || 70}%` }}
          />
        </div>
        
        <p className="mt-4 text-text-secondary">
          {(result.result?.score || 70) >= 80 ? '天作之合 🎉' : 
           (result.result?.score || 70) >= 60 ? '缘分不浅 💕' : 
           (result.result?.score || 70) >= 40 ? '需要磨合 🤝' : '挑战较大 💪'}
        </p>
      </div>

      {/* 双方信息 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border-l-4 border-gold">
          <p className="text-sm text-gold mb-2">甲方</p>
          <div className="text-text-secondary space-y-1">
            <p>{result.person1Info?.name || '未填写'} · {result.person1Info?.gender === 'male' ? '男' : '女'}</p>
            <p className="text-sm">{result.person1Info?.year}年{result.person1Info?.month}月{result.person1Info?.day}日</p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 border-l-4 border-purple">
          <p className="text-sm text-purple mb-2">乙方</p>
          <div className="text-text-secondary space-y-1">
            <p>{result.person2Info?.name || '未填写'} · {result.person2Info?.gender === 'male' ? '男' : '女'}</p>
            <p className="text-sm">{result.person2Info?.year}年{result.person2Info?.month}月{result.person2Info?.day}日</p>
          </div>
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
              <>收起 <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>展开 <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
        
        <div className="bg-bg-tertiary/30 rounded-xl p-6">
          <MarkdownContent content={result.result?.rawResponse || ''} />
        </div>
        
        {showRaw && (
          <div className="mt-4 p-4 bg-bg-tertiary/50 rounded-xl">
            <p className="text-sm text-text-muted mb-2">原始内容：</p>
            <pre className="text-xs text-text-secondary whitespace-pre-wrap">{result.result?.rawResponse}</pre>
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
