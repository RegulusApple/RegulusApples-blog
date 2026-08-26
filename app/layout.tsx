import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Halfold’s Blog",
  description: 'Record, Remember, Reinvent, Revolutionize — Halfold’s personal blog.',
  openGraph: {
    title: "Halfold’s Blog",
    description: 'Record, Remember, Reinvent, Revolutionize — Halfold’s personal blog.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Halfold’s Blog",
    description: 'Record, Remember, Reinvent, Revolutionize — Halfold’s personal blog.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
