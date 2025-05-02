"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const BuoyMap = dynamic(() => import("../components/BuoyMap"), { ssr: false });

export default function Home() {
  const [buoys, setBuoys] = useState([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    fetchBuoys();
  }, []);

  const fetchBuoys = async () => {
    const { data, error } = await supabase.rpc("get_latest_buoy_data");

    if (error) {
      console.error("Error fetching buoy data:", error);
      return;
    }

    setBuoys(data || []);
  };

  const avgWaveHeight = buoys.length
    ? (
        buoys
          .filter((b) => b.wave_height_meters !== null)
          .reduce((sum, b) => sum + b.wave_height_meters, 0) /
        buoys.filter((b) => b.wave_height_meters !== null).length
      ).toFixed(2)
    : "N/A";
  const quip =
    avgWaveHeight > 1.5
      ? "Waves so wild, fish are calling Uber!"
      : avgWaveHeight > 0.5
      ? "Surf’s up, grab your board!"
      : "Chill vibes, grab a floatie!";

  const gaugeData = {
    datasets: [
      {
        data:
          avgWaveHeight !== "N/A" ? [avgWaveHeight, 5 - avgWaveHeight] : [0, 5],
        backgroundColor: [
          avgWaveHeight > 1.5
            ? "#FF0000"
            : avgWaveHeight > 0.5
            ? "#FFFF00"
            : "#00FF00",
          "#E0E0E0",
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const gaugeOptions = {
    plugins: {
      title: {
        display: true,
        text: "Storm Vibe",
        color: "#FFFFFF",
        font: { size: 16 },
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        formatter: () =>
          avgWaveHeight !== "N/A"
            ? avgWaveHeight > 1.5
              ? "Wavepocalypse"
              : avgWaveHeight > 0.5
              ? "Surf's Lit"
              : "Chill Waves"
            : "N/A",
        color: "#FFFFFF",
        font: { size: 14 },
        anchor: "center",
        align: "center",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 text-white">
      <Head>
        <title>Buoy Wave Vibes</title>
      </Head>
      <main className="container mx-auto p-4">
        <motion.h1
          className="text-4xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Gulf Wave Party 🌊
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="h-96 rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BuoyMap buoys={buoys} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={fetchBuoys}
              className="bg-yellow-400 text-black px-4 py-2 rounded mb-4 hover:bg-yellow-500 transition"
            >
              Refresh Waves
            </button>
            <p className="text-xl mb-2 animate-pulse">{quip}</p>
            {buoys.map((buoy) => (
              <motion.div
                key={buoy.buoy_id}
                className="mb-2"
                whileHover={{ scale: 1.05 }}
              >
                <p>
                  {buoy.name}:{" "}
                  {buoy.wave_height_meters !== null
                    ? `${buoy.wave_height_meters}m`
                    : "N/A"}{" "}
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                      fontSize: `${
                        buoy.wave_height_meters !== null
                          ? 20 + buoy.wave_height_meters * 10
                          : 20
                      }px`,
                    }}
                  >
                    {buoy.wave_height_meters > 1.5
                      ? "🌊🚤"
                      : buoy.wave_height_meters > 0.5
                      ? "🌊🏄"
                      : "🌊😴"}
                  </motion.span>
                </p>
                <p className="text-sm">
                  Last updated:{" "}
                  {buoy.observation_time
                    ? new Date(buoy.observation_time).toLocaleString()
                    : "Unknown"}
                  {buoy.active === false && " (Inactive)"}
                </p>
              </motion.div>
            ))}
            <div className="mt-4">
              <p>
                Average Wave Height:{" "}
                {avgWaveHeight !== "N/A" ? `${avgWaveHeight}m` : "N/A"}
              </p>
              {avgWaveHeight !== "N/A" && (
                <Doughnut
                  data={gaugeData}
                  options={gaugeOptions}
                  width={200}
                  height={100}
                />
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
