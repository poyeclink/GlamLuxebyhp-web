import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const svg = await readFile(path.join(process.cwd(), "public/brand/glamluxe-principal-cromado.svg"));
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0B" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={1050} height={630} alt="" />
      </div>
    ),
    size,
  );
}
