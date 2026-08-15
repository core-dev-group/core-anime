import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("home", "routes/home.tsx", { id: "home-alias" }),
  route("api/anime/detail/:id", "routes/api.detail.ts"),
  route("anime/:id", "routes/detail.tsx"),
  route("watch/:slug", "routes/watch.tsx"),
  route("batch/:slug", "routes/batch.$slug.tsx"),
  route("complete", "routes/complete.tsx"),
  route("genres", "routes/genres.tsx"),
  route("genre/:id", "routes/genre.$id.tsx"),
  route("directory", "routes/directory.tsx"),
  route("donate", "routes/donate.tsx"),
  route("bookmarks", "routes/bookmarks.tsx"),
  route("profile", "routes/profile.tsx"),
  route("tos", "routes/tos.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("api/saweria", "routes/api.saweria.ts"),
  route("/api/proxy-stream", "routes/api.proxy-stream.ts"),
  route("api/yt-search", "routes/api.yt-search.ts"),
  route("api/sanka", "routes/api.sanka.ts"),
  route("admin/providers", "routes/admin.providers.tsx"),
  route(".well-known/appspecific/com.chrome.devtools.json", "routes/devtools.ts")
] satisfies RouteConfig;
