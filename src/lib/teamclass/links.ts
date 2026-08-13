const PLATFORM_BY_HOSTNAME: { match: (hostname: string, pathname: string) => boolean; label: string }[] = [
  { match: (host) => host.includes("canva.com"), label: "Canva" },
  {
    match: (host, path) => host.includes("docs.google.com") && path.startsWith("/presentation"),
    label: "Google Presentaciones",
  },
  {
    match: (host, path) => host.includes("docs.google.com") && path.startsWith("/document"),
    label: "Google Docs",
  },
  {
    match: (host, path) => host.includes("docs.google.com") && path.startsWith("/spreadsheets"),
    label: "Google Sheets",
  },
  { match: (host) => host.includes("drive.google.com"), label: "Google Drive" },
  { match: (host) => host.includes("prezi.com"), label: "Prezi" },
  { match: (host) => host.includes("figma.com"), label: "Figma" },
  { match: (host) => host.includes("notion.so") || host.includes("notion.site"), label: "Notion" },
  { match: (host) => host.includes("miro.com"), label: "Miro" },
  { match: (host) => host.includes("github.com"), label: "GitHub" },
  { match: (host) => host.includes("youtube.com") || host.includes("youtu.be"), label: "YouTube" },
  { match: (host) => host.includes("dropbox.com"), label: "Dropbox" },
  { match: (host) => host.includes("onedrive.live.com") || host.includes("1drv.ms"), label: "OneDrive" },
];

export function detectLinkPlatform(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const match = PLATFORM_BY_HOSTNAME.find((entry) => entry.match(hostname, parsed.pathname));
    return match?.label ?? null;
  } catch {
    return null;
  }
}

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/gi;

export interface TextSegment {
  type: "text" | "link";
  value: string;
}

// Splits a message body into plain-text and link segments so chat bubbles
// can render detected URLs as clickable text inline, without a separate
// "link" message kind.
export function splitTextWithLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }
    segments.push({ type: "link", value: url });
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
