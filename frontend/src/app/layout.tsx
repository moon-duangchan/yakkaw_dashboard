// app/layout.tsx
import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe80,transparent_32%),radial-gradient(circle_at_80%_8%,#ede9fe80,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)]"
          />

          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              <main>{children}</main>
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
        </div>
      </body>
    </html>
  );
}
