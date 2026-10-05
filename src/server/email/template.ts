import { SITE_NAME, SITE_URL } from "@/lib/site";

export type EmailContent = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  highlight?: [label: string, value: string];
  rows?: [label: string, value: string, detail?: string][];
  total?: [label: string, value: string];
  cta?: { label: string; href: string };
  footer: string;
  // [etiqueta, ruta] de los links del pie; por defecto los de la tienda.
  nav?: [label: string, path: string][];
};

export const LOGO_CID = "glamluxe-logo";
const LOGO_FILE = "public/brand/glamluxe-horizontal-email.png";

// Gmail no muestra SVG. Desplegado, el PNG se sirve desde el sitio (Gmail lo
// pasa por su proxy); solo en local, donde esa URL no es pública, va adjunto
// inline (cid:) leído del disco — en Vercel el archivo no viaja en el bundle.
const LOGO_IS_PUBLIC = !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(SITE_URL);
export const logoAttachments = LOGO_IS_PUBLIC
  ? []
  : [{ filename: "glamluxe.png", path: LOGO_FILE, cid: LOGO_CID }];
const logoSrc = LOGO_IS_PUBLIC ? `${SITE_URL}/brand/glamluxe-horizontal-email.png` : `cid:${LOGO_CID}`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Mismos valores que los tokens de globals.css: los clientes de correo no
// leen variables CSS, igual que la imagen OG.
const C = {
  ink: "#0A0A0B",
  muted: "#5B6470",
  border: "#E4E8EE",
  accent: "#1B6FB8",
  iceBlue: "#5CB8F0",
  mist: "#EAF6FD",
  inverseMuted: "#9AA3AE",
  inverseBorder: "#26272D",
};
const SERIF = "'Bodoni Moda',Didot,'Bodoni 72',Georgia,serif";
const SANS = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";

// Tablas e inline styles porque Gmail/Outlook ignoran casi todo lo demás.
export function renderEmail(content: EmailContent) {
  const e = escapeHtml;
  const paragraphs = content.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};white-space:pre-line">${e(p)}</p>`,
    )
    .join("");

  const highlight = content.highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 24px"><tr><td style="background:${C.mist};border-left:3px solid ${C.accent};border-radius:0 12px 12px 0;padding:16px 20px"><p style="margin:0 0 4px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;color:${C.accent}">${e(content.highlight[0])}</p><p style="margin:0;font-family:${SERIF};font-size:22px;color:${C.ink}">${e(content.highlight[1])}</p></td></tr></table>`
    : "";

  const row = ([label, value, detail]: [string, string, string?]) =>
    `<tr><td style="padding:14px 16px 14px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:14px;line-height:1.5;color:${C.ink};white-space:pre-line">${e(label)}${detail ? `<br><span style="font-size:12px;color:${C.muted}">${e(detail)}</span>` : ""}</td><td align="right" valign="top" style="padding:14px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:14px;line-height:1.5;color:${C.ink};white-space:pre-line;word-break:break-word">${e(value)}</td></tr>`;

  const total = content.total
    ? `<tr><td style="padding:18px 16px 0 0;border-top:2px solid ${C.ink};font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2.6px;text-transform:uppercase;color:${C.ink}">${e(content.total[0])}</td><td align="right" style="padding:18px 0 0;border-top:2px solid ${C.ink};font-family:${SERIF};font-size:24px;color:${C.ink};white-space:nowrap">${e(content.total[1])}</td></tr>`
    : "";

  const table =
    content.rows?.length || total
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 28px;border-top:1px solid ${C.border}">${(content.rows ?? []).map(row).join("")}${total}</table>`
      : "";

  const cta = content.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px"><tr><td style="border-radius:999px;background:${C.ink}"><a href="${e(content.cta.href)}" style="display:inline-block;padding:15px 32px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;border-radius:999px">${e(content.cta.label)}</a></td></tr></table>`
    : "";

  const footerLinks = content.nav ?? [
    ["Tienda", "/tienda"],
    ["Contacto", "/contacto"],
    ["Políticas", "/politicas"],
  ];
  const links = footerLinks.map(
    ([label, path]) =>
      `<a href="${SITE_URL}${path}" style="font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:2.2px;text-transform:uppercase;color:#FFFFFF;text-decoration:none">${e(label)}</a>`,
  ).join(`<span style="color:${C.inverseBorder}">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);

  // Texto de vista previa de la bandeja (oculto en el cuerpo).
  const preheader = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${e(content.paragraphs.slice(1).join(" ") || content.heading)}</div>`;

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${e(content.heading)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>@media (max-width:480px){.gl-body{padding:32px 24px 32px !important}.gl-title{font-size:28px !important}}</style></head>
<body style="margin:0;padding:0;background:${C.mist};-webkit-text-size-adjust:100%">${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist}"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td align="center" style="background:${C.ink};border-radius:20px 20px 0 0;padding:36px 32px 30px">
<a href="${SITE_URL}" style="text-decoration:none"><img src="${logoSrc}" width="240" height="60" alt="${e(SITE_NAME)}" style="display:block;border:0;width:240px;height:auto;max-width:100%;font-family:${SERIF};font-size:22px;color:#FFFFFF"></a>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="width:48px;height:1px;background:${C.iceBlue};line-height:1px;font-size:1px">&nbsp;</td></tr></table>
</td></tr>
<tr><td class="gl-body" style="background:#FFFFFF;padding:44px 40px 40px">
<p style="margin:0 0 14px;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:2.6px;text-transform:uppercase;color:${C.accent}">${e(content.eyebrow)}</p>
<h1 class="gl-title" style="margin:0 0 24px;font-family:${SERIF};font-size:32px;line-height:1.15;font-weight:400;color:${C.ink}">${e(content.heading)}</h1>
${paragraphs}${highlight}${table}${cta}
</td></tr>
<tr><td align="center" style="background:${C.ink};border-radius:0 0 20px 20px;padding:30px 32px 34px">
<p style="margin:0 0 18px">${links}</p>
<p style="margin:0 0 6px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.inverseMuted}">${e(content.footer)}</p>
<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.inverseMuted}">© ${new Date().getFullYear()} ${e(SITE_NAME)}</p>
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    content.eyebrow.toUpperCase(),
    content.heading,
    "",
    ...content.paragraphs.flatMap((p) => [p, ""]),
    ...(content.highlight ? [`${content.highlight[0]}: ${content.highlight[1]}`, ""] : []),
    ...(content.rows ?? []).map(([label, value, detail]) => `${label}${detail ? ` (${detail})` : ""}: ${value}`),
    ...(content.total ? [`${content.total[0]}: ${content.total[1]}`] : []),
    ...(content.cta ? ["", `${content.cta.label}: ${content.cta.href}`] : []),
    "",
    "—",
    content.footer,
    `${SITE_NAME} · ${SITE_URL}`,
  ].join("\n");

  return { html, text };
}
