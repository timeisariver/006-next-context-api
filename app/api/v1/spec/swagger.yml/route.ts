import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "app/api/v1/spec/swagger.yml/swagger.yml",
  );

  // ファイルの内容を読み込む
  try {
    const file = fs.readFileSync(filePath, "utf8");

    return new Response(file, {
      status: 200,
    });
  } catch (e) {
    console.error("Got error on endpoint", e);
    return new Response(`Not Found`, {
      status: 404,
    });
  }
}
