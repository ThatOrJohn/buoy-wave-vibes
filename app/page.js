"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Sun, Moon } from "lucide-react";

const BuoyMap = dynamic(() => import("../components/BuoyMap"), { ssr: false });

export default function Home() {
  const [buoys, setBuoys] = useState([]);
  const [maxWave, setMaxWave] = useState(null);
  const [unit, setUnit] = useState("feet"); // Default to feet
  const [theme, setTheme] = useState("dark"); // Default to dark
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    fetchBuoys();
    fetchMaxWave();
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const fetchBuoys = async () => {
    const { data, error } = await supabase.rpc("get_latest_buoy_data");
    if (error) {
      console.error("Error fetching buoy data:", error);
      return;
    }
    setBuoys(data || []);
  };

  const fetchMaxWave = async () => {
    const { data, error } = await supabase.rpc("get_max_wave_last_4_months");
    if (error) {
      console.error("Error fetching max wave:", error);
      return;
    }
    setMaxWave(data[0] || null);
  };

  const convertHeight = (meters) => {
    if (meters === null) return "N/A";
    const value = unit === "feet" ? meters * 3.28084 : meters;
    return Number(value).toFixed(2);
  };

  const isStale = (observation_time) => {
    if (!observation_time) return true;
    const diff = (new Date() - new Date(observation_time)) / (1000 * 60 * 60); // Hours
    return diff > 12;
  };

  const getMaxWaveComparison = (meters) => {
    if (meters < 0.5)
      return {
        text: "a teacup Yorkie!",
        gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTRqMDJ2MnljaHpjeW4zYXQxeWo4Mzg4bThta216a3BhNGt2YWFvdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26DNeXaKYRt3Rci9W/giphy.gif",
      };
    if (meters < 1.5)
      return {
        text: "a mailbox!",
        gif: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW04Nm8wY3dza2kybDFkdWpoNHV1bHZ0cmlsZHljOHlycmtwcHY5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jO1oHMtmybDKAeqrO6/giphy.gif",
      };
    if (meters < 3)
      return {
        text: "Shaq!",
        gif: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnVvbXc3YzdkOHV2dHljcHBkdmQ1cXYxczY5d2w4aHRoa2Z6aHc4dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UO5elnTqo4vSg/giphy.gif",
      };
    return {
      text: "a giraffe!",
      gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTBrNGZ5djJlbDN5OXNjd2txYXd0NmY4cDk1aHNuZDd5dmZqdjkwYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/87djk6WKajv4iLAyR2/giphy.gif",
    };
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-b from-blue-900 to-blue-600 text-white"
          : "bg-gradient-to-b from-blue-100 to-blue-300 text-black"
      }`}
    >
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
        <div className="flex justify-between mb-4">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={`p-2 rounded ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
            }`}
          >
            <option value="feet">Feet</option>
            <option value="meters">Meters</option>
          </select>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
            }`}
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-96 rounded-lg overflow-hidden">
              <BuoyMap buoys={buoys} unit={unit} />
            </div>
            {maxWave && (
              <motion.div
                className="p-4 rounded-lg bg-opacity-20 bg-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-2">
                  Biggest Wave in 4 Months
                </h2>
                <p>
                  {maxWave.name}: {convertHeight(maxWave.wave_height_meters)}{" "}
                  {unit} on{" "}
                  {new Date(maxWave.observation_time).toLocaleDateString()}
                </p>
                <p className="text-sm italic">
                  That’s taller than{" "}
                  {getMaxWaveComparison(maxWave.wave_height_meters).text}
                </p>
                <img
                  src={getMaxWaveComparison(maxWave.wave_height_meters).gif}
                  alt={getMaxWaveComparison(maxWave.wave_height_meters).text}
                  className="mt-2 w-32 h-32 object-contain"
                />
                <p className="text-xs mt-1">
                  Powered by{" "}
                  <a
                    href="https://giphy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    GIPHY
                  </a>
                </p>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={fetchBuoys}
              className={`px-4 py-2 rounded mb-4 transition ${
                theme === "dark"
                  ? "bg-yellow-400 text-black hover:bg-yellow-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
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
                  {buoy.name}: {convertHeight(buoy.wave_height_meters) || "N/A"}{" "}
                  {unit}{" "}
                  {isStale(buoy.observation_time) && (
                    <span className="text-yellow-300">⚠️ Stale</span>
                  )}{" "}
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
                Average Wave Height: {convertHeight(avgWaveHeight) || "N/A"}{" "}
                {unit}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
