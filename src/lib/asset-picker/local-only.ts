import "server-only";

const localHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function isLocalAssetPickerHost(host: string | null) {
  const hostname = host?.split(":")[0]?.toLowerCase();
  return hostname ? localHosts.has(hostname) : false;
}

export function rejectNonLocalAssetPickerRequest(request: Request) {
  return isLocalAssetPickerHost(new URL(request.url).hostname)
    ? null
    : new Response(null, { status: 404 });
}
