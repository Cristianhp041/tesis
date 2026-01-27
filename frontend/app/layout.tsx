import "./globals.css";
import type { Metadata } from "next";
import ApolloWrapper from "@/src/lib/apolloWrapper";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sistema de Gestión",
  description: "Gestión administrativa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ApolloWrapper>
          {children}
          <Toaster richColors position="top-right" />
        </ApolloWrapper>
      </body>
    </html>
  );
}
