// 要素の style に渡し、CSS の var(--project-color) でプロジェクト色を使えるようにする
export function projectColorStyle(color: string) {
  return { "--project-color": color } as React.CSSProperties;
}
