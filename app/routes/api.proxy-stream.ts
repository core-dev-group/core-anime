import { type Route } from "./+types/api.proxy-stream";

// Allowlist domain yang boleh di-proxy. Tambah domain baru di sini bila perlu.
const ALLOWED_HOSTS = new Set([
  "www.sankavollerei.web.id",
  "sankavollerei.web.id",
  "otakudesu.blog",
  "www.otakudesu.blog",
  "invidious.nerdvpn.de",
  "invidious.snopyta.org",
  "inv.tux.pizza",
  "pipedapi.kavin.rocks",
  "piped.video",
  "www.youtube.com",
  "youtu.be",
]);

// Block internal/private IP ranges
const BLOCKED_HOSTNAMES = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|0\.0\.0\.0)/;

function isAllowedUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    if (BLOCKED_HOSTNAMES.test(u.hostname)) return false;
    return ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!isAllowedUrl(targetUrl)) {
    return new Response("Domain tidak diizinkan", { status: 403 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0",
        "Referer": "https://otakudesu.blog/",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch upstream", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";

    // If it's HTML, we need to inject a <base> tag to fix relative asset paths
    if (contentType.includes("text/html")) {
      const html = await response.text();

      // Calculate the directory of the target URL for the base tag
      const baseUrlObj = new URL(targetUrl);
      baseUrlObj.search = '';
      const baseHref = baseUrlObj.toString().replace(/\/[^\/]*$/, '/');

      let modifiedHtml = html;
      if (/<head[^>]*>/i.test(html)) {
        modifiedHtml = html.replace(
          /(<head[^>]*>)/i,
          `$1\n<base href="${baseHref}">`
        );
      } else if (/<html[^>]*>/i.test(html)) {
        modifiedHtml = html.replace(
          /(<html[^>]*>)/i,
          `$1\n<head><base href="${baseHref}"></head>`
        );
      } else {
        modifiedHtml = `<head><base href="${baseHref}"></head>\n` + html;
      }

      return new Response(modifiedHtml, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // For other types, stream it directly but remove CSP headers
    const headers = new Headers(response.headers);
    headers.delete("content-security-policy");
    headers.delete("x-frame-options");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
