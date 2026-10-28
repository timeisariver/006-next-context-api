import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "../styles/globals.scss";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import s from "./RootLayout.module.scss";
import clsx from "clsx";
import { ProjectsProvider } from "@/entities/project";
import { TaskChangesProvider } from "@/entities/task";

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

// デスクトップ向けのレイアウトしかないため、表示幅を 1440px に固定する（RootLayout.module.scss の .root の min-width と合わせる）。
// 既定の initial-scale=1 が残ると縮小して表示されないため、undefined で消す。
export const viewport: Viewport = {
  width: 1440,
  initialScale: undefined,
};

export function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={clsx(s.html, inter.variable, notoSansJp.variable)}
    >
      <body className={s.root}>
        <ProjectsProvider>
          <TaskChangesProvider>
            <Header />
            <div className={s.content}>
              <div className={s.sidebar}>
                <Sidebar />
              </div>
              <main className={s.main}>{children}</main>
            </div>
          </TaskChangesProvider>
        </ProjectsProvider>
      </body>
    </html>
  );
}
