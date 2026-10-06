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
      <body className={clsx(s.RootLayout, inter.className)}>
        <ProjectsProvider>
          <Header />
          <div className={s.RootLayout__content}>
            <div className={s.RootLayout__sidebar}>
              <Sidebar />
            </div>
            <main className={s.RootLayout__main}>{children}</main>
          </div>
        </ProjectsProvider>
      </body>
    </html>
  );
}
