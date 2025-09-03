"use client";

import { useEffect } from "react";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

export default function ThemeController() {
  useEffect(() => {
    const initThemeChange = async () => {
      const { themeChange } = await import("theme-change");
      themeChange(false);
    };

    initThemeChange();
  }, []);

  return (
    <select className="select w-52 text-base-content" data-choose-theme defaultValue="dark">
      {themes.map((theme) => (
        <option className="text-base-content" key={theme} value={theme}>
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </option>
      ))}
    </select>
  );
}
