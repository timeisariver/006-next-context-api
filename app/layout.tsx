import type { Metadata } from "next";
import "@/_app/styles/globals.scss";

export const metadata: Metadata = {
  title: "006-next-context-api",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
