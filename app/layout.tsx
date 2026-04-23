import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clínica Veterinaria App",
  description: "App de gestión veterinaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster 
          position="bottom-center"
          expand={true}
          toastOptions={{
            className: "rounded-3xl p-5 text-lg font-bold shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border-2 border-white bg-white/90 backdrop-blur-3xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-300",
            style: { gap: '1rem' }
          }} 
        />
      </body>
    </html>
  );
}
