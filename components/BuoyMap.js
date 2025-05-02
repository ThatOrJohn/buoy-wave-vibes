"use_client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function BuoyMap({ buoys }) {
  useEffect(() => {
    const map = L.map("map").setView([28.5, -89.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    buoys.forEach((buoy) => {
      L.marker([buoy.latitude, buoy.longitude], {
        icon: L.divIcon({
          html: `<span style="font-size:${
            buoy.wave_height_meters !== null
              ? 10 + buoy.wave_height_meters * 5
              : 10
          }px">⚓🌊</span>`,
          className: "animate-pulse",
        }),
      })
        .addTo(map)
        .bindPopup(
          `${buoy.name}: ${
            buoy.wave_height_meters !== null
              ? `${buoy.wave_height_meters}m`
              : "N/A"
          }${buoy.active === false ? " (Inactive)" : ""}`
        );
    });

    return () => map.remove();
  }, [buoys]);

  return <div id="map" className="h-full w-full" />;
}
