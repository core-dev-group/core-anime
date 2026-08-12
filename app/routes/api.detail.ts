import type { Route } from "./+types/api.detail";
import { getEnrichedDetail } from "~/lib/providers/registry";

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const id = params.id;
    if (!id) {
      return Response.json({ error: "Missing anime slug/id" }, { status: 400 });
    }
    
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider") || undefined;
    
    const detail = await getEnrichedDetail(id, provider);
    return Response.json({ success: true, data: detail });
    
  } catch (error: any) {
    console.error("API Detail Error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to fetch anime detail" },
      { status: 500 }
    );
  }
}
