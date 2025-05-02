"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function BuoyMap({ buoys, unit }) {
  useEffect(() => {
    const map = L.map("map").setView([28.5, -89.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    buoys.forEach((buoy) => {
      const waveHeight = buoy.wave_height_meters;
      const size = waveHeight !== null ? 20 + waveHeight * 10 : 20; // Increased base size
      const color =
        waveHeight > 1.5 ? "#FF0000" : waveHeight > 0.5 ? "#FFFF00" : "#00FF00";
      const convertedHeight =
        waveHeight === null
          ? "N/A"
          : (unit === "feet" ? waveHeight * 3.28084 : waveHeight).toFixed(2);
      const unitLabel = unit === "feet" ? "ft" : "m";

      L.marker([buoy.latitude, buoy.longitude], {
        icon: L.divIcon({
          html: `
            <svg width="${size * 2}" height="${size * 2}">
              <circle cx="${size}" cy="${size}" r="${size}" fill="${color}" fill-opacity="0.6" stroke="#FFFFFF" stroke-width="2"/>
              <text x="${size}" y="${size}" font-size="8" fill="#000000" text-anchor="middle" dy=".3em">
                ${convertedHeight} ${unitLabel}
              </text>
            </svg>
          `,
          className: "",
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size],
        }),
      })
        .addTo(map)
        .bindPopup(
          `${buoy.name}: ${
            convertedHeight !== "N/A"
              ? `${convertedHeight} ${unitLabel}`
              : "N/A"
          }${buoy.active === false ? " (Inactive)" : ""}`
        );
    });

    return () => map.remove();
  }, [buoys, unit]);

  return <div id="map" className="h-full w-full" />;
}
