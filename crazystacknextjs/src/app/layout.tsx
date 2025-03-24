import "./globals.css";
import { AllProviders } from "./providers";
import type { Metadata } from "next";
import { whitelabel } from "@/application/whitelabel";

export const metadata: Metadata = {
  title: `${whitelabel.systemName} | Agendamentos Online`,
  description: `Página de inicial do ${whitelabel.systemName}. Aqui você pode agendar com os melhores estabelecimentos da cidade.`,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <AllProviders>{children}</AllProviders>
      </body>
    </html>
  );
}
