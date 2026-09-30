import { NextResponse } from "next/server";
import { getProjects } from "../../../../datastore";
import { notFound } from "../../../../lib/renderer";

export async function GET(_, context) {
  const { slug } = (await context.params) || {};
  const project = getProjects().find((it) => it.slug === slug);
  if (!project) {
    return notFound();
  }

  return NextResponse.json({ data: project });
}
