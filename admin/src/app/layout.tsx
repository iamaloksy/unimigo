import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UNIMIGO Admin',
  description: 'Admin panel for UNIMIGO - Your Campus, Your Circle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
