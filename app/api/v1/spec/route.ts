import fs from "fs";
import path from "path";

const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  const filePath = path.join(process.cwd(), "app/api/v1/spec/index.html");

  // ファイルの内容を読み込む
  try {
    const template = fs.readFileSync(filePath, "utf8");
    const body = template.replace("{{host}}", apiHost);

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });
  } catch (e) {
    console.error("Got error on endpoint", e);
    return new Response(`Not Found`, {
      status: 404,
    });
  }
}
