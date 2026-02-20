import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ChatWidget from '@/components/ChatWidget';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CeremoLink – Digital Event Programs',
  description:
    'Create QR-powered digital programs for funerals, weddings, and events.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <AuthProvider>
            {children}
            <ChatWidget />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
