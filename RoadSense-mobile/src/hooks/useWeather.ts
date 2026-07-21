import { useEffect, useState } from "react";
import { getWeather } from "../services/weatherService";
import { Coordinate } from "../types/route";
import { WeatherInfo } from "../types/weather";

export function useWeather(coordinate?: Coordinate) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    if (!coordinate) return;
    getWeather(coordinate).then(setWeather);
  }, [coordinate]);

  return weather;
}
