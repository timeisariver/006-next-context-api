import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "../styles/globals.scss";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import s from "./RootLayout.module.scss";
import clsx from "clsx";
import { ProjectsProvider } from "@/entities/project";

// 英字は Inter、日本語は Noto Sans JP で表示する（globals.scss の --font-family-base）
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 日本語フォントはファイルが大きいため preload しない
const notoSansJp = Noto_Sans_JP({
  preload: false,
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Turvo",
};

export function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={clsx(inter.variable, notoSansJp.variable)}>
      <body className={s.root}>
        <ProjectsProvider>
          <Header />
          <div className={s.content}>
            <div className={s.sidebar}>
              <Sidebar />
            </div>
            <main className={s.main}>{children}</main>
          </div>
        </ProjectsProvider>
      </body>
    </html>
  );
}
