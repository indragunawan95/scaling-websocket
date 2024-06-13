import Providers from './providers/Providers';
import './globals.css';

export const metadata = {
  title: 'My WebSocket App',
  description: 'A proof of concept for WebSocket with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
