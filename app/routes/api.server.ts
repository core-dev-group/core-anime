import type { Route } from "./+types/api.server";
import { sankaApi } from "~/lib/sankaClient";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return Response.json({ error: "Missing server ID" }, { status: 400 });
  }

  try {
    const res = await sankaApi.getServerUrl(id);
    return Response.json(res);
  } catch (err) {
    return Response.json({ error: "Failed to fetch server URL" }, { status: 500 });
  }
}
