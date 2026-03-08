'use client';

import { useState } from 'react';
import { BaZiInput, FortuneFormData } from '@/types/fortune';
import { User, Heart, ArrowRight, Loader2, Clock } from 'lucide-react';
import FortuneResult from './FortuneResult';

type Step = 'type' | 'person1' | 'person2' | 'result';

export default function FortuneForm() {
  const [step, setStep] = useState<Step>('type');
  const [formData, setFormData] = useState<FortuneFormData>({
    readingType: 'single',
    person1: {
      year: 1995,
      month: 6,
      day: 15,
      hour: 12,
      minute: 0,
      gender: 'male',
      calendarType: 'solar', // 默认公历
    },
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTypeSelect = (type: 'single' | 'compatibility') => {
    setFormData(prev => ({ ...prev, readingType: type }));
    setStep('person1');
  };

  const handlePerson1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.readingType === 'compatibility') {
      setStep('person2');
    } else {
      handleSubmit();
    }
  };

  const handlePerson2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 使用新的 fortune-v2 API
      const response = await fetch('/api/fortune-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setStep('result');
      } else {
        console.error('API Error:', data.error);
        alert('测算失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 步骤 1: 选择类型
  if (step === 'type') {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
          选择测算类型
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleTypeSelect('single')}
            className="group p-8 rounded-2xl glass hover:border-gold/50 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">个人命盘</h3>
            <p className="text-text-secondary">详细分析你的八字命格、大运流年、运势走向</p>
          </button>

          <button
            onClick={() => handleTypeSelect('compatibility')}
            className="group p-8 rounded-2xl glass hover:border-gold/50 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-purple/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-purple" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">双人合盘</h3>
            <p className="text-text-secondary">分析两人配对、姻缘、八字互补、合作潜力</p>
          </button>
        </div>
      </div>
    );
  }

  // 步骤 2: 填写第一人信息
  if (step === 'person1') {
    return (
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          填写生辰信息（精确到分钟）
        </h2>
        
        <form onSubmit={handlePerson1Submit} className="glass rounded-2xl p-8">
          <BirthForm
            data={formData.person1}
            onChange={(data) => setFormData(prev => ({ ...prev, person1: data }))}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 正在测算中...
              </>
            ) : formData.readingType === 'compatibility' ? (
              <>下一步 <ArrowRight className="w-5 h-5" /></>
            ) : (
              '开始测算'
            )}
          </button>
        </form>
      </div>
    );
  }

  // 步骤 3: 填写第二人信息（合盘）
  if (step === 'person2') {
    return (
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          填写对方生辰信息
        </h2>
        
        <form onSubmit={handlePerson2Submit} className="glass rounded-2xl p-8">
          <BirthForm
            data={formData.person2 || { year: 1995, month: 6, day: 15, hour: 12, minute: 0, gender: 'female', calendarType: 'solar' }}
            onChange={(data) => setFormData(prev => ({ ...prev, person2: data }))}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 正在测算中...
              </>
            ) : (
                '开始合盘测算'
              )}
          </button>
        </form>
      </div>
    );
  }

  // 步骤 4: 结果展示
  if (step === 'result' && result) {
    return (
      <FortuneResult 
        result={result} 
        type={formData.readingType}
        onReset={() => {
          setStep('type');
          setResult(null);
        }}
      />
    );
  }

  return null;
}

// 生辰信息表单组件
function BirthForm({ 
  data, 
  onChange 
}: { 
  data: BaZiInput; 
  onChange: (data: BaZiInput) => void;
}) {
  // 生成年份选项（1900-今年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 根据年月获取天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const days = Array.from({ length: getDaysInMonth(data.year, data.month) }, (_, i) => i + 1);
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* 姓名（可选） */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">姓名（可选）</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none"
          placeholder="输入姓名"
        />
      </div>

      {/* 性别 */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">性别</label>
        <div className="flex gap-4">
          {[
            { value: 'male', label: '男' },
            { value: 'female', label: '女' },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...data, gender: value as 'male' | 'female' })}
              className={`flex-1 py-3 rounded-xl border transition-all ${
                data.gender === value
                  ? 'border-gold bg-gold/20 text-gold'
                  : 'border-border bg-bg-tertiary text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 出生日期 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-text-secondary">出生日期</label>
          <div className="flex items-center gap-2 bg-[#1a1a25] rounded-lg p-1">
            {[
              { value: 'solar', label: '公历' },
              { value: 'lunar', label: '农历' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...data, calendarType: value as 'solar' | 'lunar' })}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  data.calendarType === value || (value === 'solar' && !data.calendarType)
                    ? 'bg-gold text-bg-primary font-medium'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 历法提示 */}
        <div className="mb-3 p-2 rounded-lg bg-[#1a1a25] border border-[rgba(212,175,55,0.1)]">
          <p className="text-xs text-text-muted">
            {data.calendarType === 'lunar' ? (
              <>
                <span className="text-gold">农历示例：</span>1990年四月廿一（农历）
              </>
            ) : (
              <>
                <span className="text-gold">公历示例：</span>1990年5月15日（公历）
                <span className="ml-2 text-[#666]">中国大陆1996年后出生一般为公历</span>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <select
            value={data.year}
            onChange={(e) => onChange({ ...data, year: parseInt(e.target.value) })}
            className="px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white focus:border-[#d4af37] focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>

          <select
            value={data.month}
            onChange={(e) => onChange({ ...data, month: parseInt(e.target.value) })}
            className="px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white focus:border-[#d4af37] focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>

          <select
            value={data.day}
            onChange={(e) => onChange({ ...data, day: parseInt(e.target.value) })}
            className="px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white focus:border-[#d4af37] focus:outline-none"
          >
            {days.map((d) => (
              <option key={d} value={d}>{d}日</option>
            ))}
          </select>
        </div>
      </div>

      {/* 出生时间（精确到分钟） */}
      <div>
        <label className="block text-sm text-text-secondary mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          出生时间（精确到分钟）
        </label>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={data.hour}
            onChange={(e) => onChange({ ...data, hour: parseInt(e.target.value) })}
            className="px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white focus:border-[#d4af37] focus:outline-none"
          >
            <option value={-1}>不清楚</option>
            {hours.map((h) => (
              <option key={h} value={h}>{h.toString().padStart(2, '0')}时</option>
            ))}
          </select>

          <select
            value={data.minute || 0}
            onChange={(e) => onChange({ ...data, minute: parseInt(e.target.value) })}
            disabled={data.hour < 0}
            className="px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white focus:border-[#d4af37] focus:outline-none disabled:opacity-50"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>{m.toString().padStart(2, '0')}分</option>
            ))}
          </select>

          <div className="flex items-center justify-center text-text-muted text-sm">
            {data.hour >= 0 ? 
              `${data.hour.toString().padStart(2, '0')}:${(data.minute || 0).toString().padStart(2, '0')}` : 
              '时辰未知'}
          </div>
        </div>
        <p className="text-xs text-text-muted mt-2">
          * 时间越精确，八字排盘越准确。不确定可选择最接近的时间。
        </p>
      </div>

      {/* 出生地（可选，用于真太阳时校正） */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">出生地（可选，用于真太阳时校正）</label>
        <input
          type="text"
          value={data.birthPlace || ''}
          onChange={(e) => onChange({ ...data, birthPlace: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a25] border border-[rgba(212,175,55,0.2)] text-white placeholder:text-gray-500 focus:border-[#d4af37] focus:outline-none"
          placeholder="例如：北京市"
        />
      </div>
    </div>
  );
}
