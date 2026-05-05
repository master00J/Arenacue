import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArenaCue",
    short_name: "ArenaCue",
    description:
      "Professionele Windows-scoreboardsoftware voor clubs en stadions: live scorebord, sponsorrotatie en display control.",
    lang: "nl-BE",
    dir: "ltr",
    start_url: "/",
    display: "standalone",
    categories: ["sports", "business"],
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/assets/arenacue-icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
