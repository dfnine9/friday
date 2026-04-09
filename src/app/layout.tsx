import type { Metadata } from "next";
import { Poppins, Oswald, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "F.R.I.D.A.Y. — Autonomous AI Dashboard",
  description:
    "Female Replacement Intelligent Digital Assistant Youth — The next evolution beyond J.A.R.V.I.S. 6,502 skills. 942 agents. Infinite capability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${oswald.variable} ${jetbrains.variable} h-full`}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
