import FortuneForm from '@/components/FortuneForm';
import { Sparkles, Star, Heart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a25]">
      {/* 星空背景 */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      
      {/* 装饰光晕 */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* 头部 */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold">AI  powered</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-gold-gradient">天机</span>
            <span className="text-white"> · AI 命理</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            传承千年八字智慧，融合现代 AI 技术
            <br />
            为你解读命运密码，指点人生方向
          </p>

          {/* 特色标签 */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: Star, text: '精准八字排盘' },
              { icon: Heart, text: 'AI 智能解读' },
              { icon: Sparkles, text: '双人合盘配对' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                <Icon className="w-4 h-4 text-gold" />
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
        </header>

        {/* 主要内容区 */}
        <FortuneForm />

        {/* 底部说明 */}
        <footer className="mt-20 text-center text-text-muted text-sm">
          <p>本服务仅供娱乐参考，人生方向还需自己把握</p>
          <p className="mt-2">Powered by AI · 传承中华文化</p>
        </footer>
      </div>
    </main>
  );
}
