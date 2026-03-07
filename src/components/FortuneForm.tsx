'use client';

import { useState } from 'react';
import { BaZiInput, FortuneFormData } from '@/types/fortune';
import { User, Heart, ArrowRight, Loader2 } from 'lucide-react';
import FortuneResult from './FortuneResult';

type Step = 'type' | 'person1' | 'person2' | 'result';

export default function FortuneForm() {
  const [step, setStep] = useState<Step>('type');
  const [formData, setFormData] = useState<FortuneFormData>({
    readingType: 'single',
    person1: {
      year: new Date().getFullYear() - 25,
      month: 1,
      day: 1,
      hour: 12,
      gender: 'male',
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
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setStep('result');
      }
    } catch (error) {
      console.error('Error:', error);
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
            <p className="text-text-secondary">详细分析你的八字命格、运势走向</p>
          </button>

          <button
            onClick={() => handleTypeSelect('compatibility')}
            className="group p-8 rounded-2xl glass hover:border-gold/50 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-purple/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-purple" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">双人合盘</h3>
            <p className="text-text-secondary">分析两人配对、姻缘、合作潜力</p>
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
          填写你的生辰信息
        </h2>
        
        <form onSubmit={handlePerson1Submit} className="glass rounded-2xl p-8">
          <BirthForm
            data={formData.person1}
            onChange={(data) => setFormData(prev => ({ ...prev, person1: data }))}
          />
          
          <button
            type="submit"
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {formData.readingType === 'compatibility' ? (
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
            data={formData.person2 || { year: 1995, month: 1, day: 1, hour: 12, gender: 'female' }}
            onChange={(data) => setFormData(prev => ({ ...prev, person2: data }))}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg-primary font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>AI 正在测算中... <Loader2 className="w-5 h-5 animate-spin" /></>
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
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* 姓名（可选） */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">姓名（可选）</label>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-white placeholder-text-muted focus:border-gold focus:outline-none"
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

      {/* 出生年月日时 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">出生年份</label>
          <select
            value={data.year}
            onChange={(e) => onChange({ ...data, year: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-white focus:border-gold focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">月份</label>
          <select
            value={data.month}
            onChange={(e) => onChange({ ...data, month: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-white focus:border-gold focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">日期</label>
          <select
            value={data.day}
            onChange={(e) => onChange({ ...data, day: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-white focus:border-gold focus:outline-none"
          >
            {days.map((d) => (
              <option key={d} value={d}>{d}日</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">时辰（可选）</label>
          <select
            value={data.hour}
            onChange={(e) => onChange({ ...data, hour: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-white focus:border-gold focus:outline-none"
          >
            <option value={-1}>不清楚</option>
            {hours.map((h) => (
              <option key={h} value={h}>{h}:00</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
