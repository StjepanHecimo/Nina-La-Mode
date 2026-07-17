import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nina La Mode",
    short_name: "Nina La Mode",
    description: "Premium trousers designed for tall women.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2E8DC",
    theme_color: "#1C2230",
  };
}
