import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import s from "./RootLayout.module.scss";
import clsx from "clsx";
import { ProjectsProvider } from "../model";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "006-next-context-api",
};

export function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body className={clsx(s.root, inter.className)}>
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
