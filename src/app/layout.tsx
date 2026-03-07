import type { Metadata } from 'next';
import { Inter, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-sc',
});

export const metadata: Metadata = {
  title: '天机 · AI 命理',
  description: '传承千年八字智慧，融合现代 AI 技术，为你解读命运密码',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSerifSC.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
