// app/layout.tsx
import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
        
          <div className="flex-1">
              <main className="">{children}</main>
          </div>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by{" "}
                <a 
                  href="#"
                  className="font-medium underline underline-offset-4"
                >
                  Yakkaw
                </a>
                . The source code is available on{" "}
                <a
                  href="#"
                  className="font-medium underline underline-offset-4"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}