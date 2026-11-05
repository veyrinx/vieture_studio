// Link-preview images (Open Graph, 1200×630 PNG) drawn on the fly: logo, page type, title and key facts,
// so links shared on Facebook / Zalo / LinkedIn show what the page is about.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export interface OgCard {
  /** small label top-right, e.g. "TUYỂN DỤNG" */
  label: string;
  title: string;
  /** one or two lines under the title */
  text?: string;
  /** small facts shown as chips (location, salary…) */
  chips?: string[];
  /** call to action bottom-right; defaults to the site address */
  cta?: string;
}

const require = createRequire(import.meta.url);
// Resolved lazily: if the font package is missing at runtime, only OG images fail (the route falls back to og.png).
const fontDir = () =>
  path.join(path.dirname(require.resolve("@fontsource/inter/package.json")), "files");

let assets: Promise<{
  fonts: Parameters<typeof satori>[1]["fonts"];
  logo: string;
}> | null = null;
function load(publicDir: string) {
  assets ??= (async () => {
    // Each subset gets its own family name; the image lists both, so letters missing from the
    // Latin file (ậ, ự, Đ…) are taken from the Vietnamese one.
    const font = async (subset: string, weight: 400 | 700 | 800) => ({
      name: `Inter-${subset}`,
      weight,
      style: "normal" as const,
      data: await readFile(
        path.join(fontDir(), `inter-${subset}-${weight}-normal.woff`),
      ),
    });
    const fonts = await Promise.all(
      (["latin", "vietnamese"] as const).flatMap((s) =>
        ([400, 700, 800] as const).map((w) => font(s, w)),
      ),
    );
    const logo = `data:image/png;base64,${(await readFile(path.join(publicDir, "brand", "icon-192.png"))).toString("base64")}`;
    return { fonts, logo };
  })();
  return assets;
}

/** Short stable id of a card's content, used in the image URL so previews refresh when the page changes. */
export const ogVersion = (card: OgCard) =>
  createHash("sha1").update(JSON.stringify(card)).digest("hex").slice(0, 10);

const cache = new Map<string, Buffer>();

export async function renderOg(
  card: OgCard,
  siteName: string,
  host: string,
  publicDir: string,
): Promise<Buffer> {
  const key = `${ogVersion(card)}|${siteName}|${host}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { fonts, logo } = await load(publicDir);
  const title =
    card.title.length > 110 ? `${card.title.slice(0, 107)}…` : card.title;
  const svg = await satori(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        fontFamily: "Inter-latin, Inter-vietnamese",
        color: "#0b1222",
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(8,145,178,0.16), transparent 45%), radial-gradient(circle at 100% 100%, rgba(192,38,211,0.14), transparent 45%), radial-gradient(circle at 100% 0%, rgba(79,70,229,0.10), transparent 40%)",
      }}
    >
      {/* sizes are content-box in the renderer, so the frame is placed absolutely instead of padding the page */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 56,
          width: 1056,
          height: 534,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={logo}
              width={72}
              height={72}
              style={{ borderRadius: 18 }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              <span style={{ color: "#4f46e5" }}>{siteName.split(" ")[0]}</span>
              <span style={{ marginLeft: 10 }}>
                {siteName.split(" ").slice(1).join(" ")}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "2px solid rgba(79,70,229,0.35)",
              color: "#4f46e5",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            {card.label.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 54 : 66,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {card.text && (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 28,
                lineHeight: 1.4,
                color: "#4b5568",
              }}
            >
              {card.text.length > 140
                ? `${card.text.slice(0, 137)}…`
                : card.text}
            </div>
          )}
          {card.chips && card.chips.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 30,
              }}
            >
              {card.chips.slice(0, 4).map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    padding: "10px 22px",
                    borderRadius: 999,
                    backgroundColor: "rgba(79,70,229,0.09)",
                    color: "#3730a3",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#4b5568",
              fontWeight: 400,
            }}
          >
            Build Ideas. Engineer the Future.
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 30px",
              borderRadius: 999,
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 700,
              backgroundImage:
                "linear-gradient(90deg, #0891b2, #4f46e5, #c026d3)",
            }}
          >
            {/* the font has no arrow glyphs, so the arrow is drawn */}
          {(card.cta ?? host).replace(/\s*[→↓↗]\s*$/, '')}
          {card.cta && (
            <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginLeft: 12 }}>
              <path d="M5 12h13M13 6l6 6-6 6" stroke="#ffffff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          backgroundImage: "linear-gradient(90deg, #0891b2, #4f46e5, #c026d3)",
        }}
      />
    </div>,
    { width: 1200, height: 630, fonts },
  );
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  if (cache.size > 200) cache.delete(cache.keys().next().value!);
  cache.set(key, png);
  return png;
}
