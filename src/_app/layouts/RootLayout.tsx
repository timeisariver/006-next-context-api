import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { Header } from "./Header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "006-next-context-api",
};

export function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
