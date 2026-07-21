import axios from "axios";
import { Coordinate } from "../types/route";
import { WeatherInfo } from "../types/weather";

export async function getWeather(coordinate: Coordinate): Promise<WeatherInfo> {
  try {
    const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        current: "temperature_2m,wind_speed_10m,rain,weather_code",
        hourly: "precipitation_probability,visibility",
        forecast_days: 1
      },
      timeout: 12000
    });

    const rainProbability = Number(data.hourly?.precipitation_probability?.[0] ?? 18);
    const windSpeed = Number(data.current?.wind_speed_10m ?? 9);
    const temperature = Number(data.current?.temperature_2m ?? 29);
    const roadCondition = rainProbability > 55 ? "Wet roads likely" : "Normal road grip";

    return {
      temperature,
      conditions: rainProbability > 55 ? "Rain likely" : "Clear",
      rainProbability,
      windSpeed,
      visibility: rainProbability > 55 ? "Reduced" : "Good",
      roadCondition,
      impactScore: Math.max(18, Math.round(rainProbability * 0.6 + windSpeed * 0.8))
    };
  } catch {
    return {
      temperature: 29,
      conditions: "Partly cloudy",
      rainProbability: 22,
      windSpeed: 11,
      visibility: "Good",
      roadCondition: "Normal road grip",
      impactScore: 24
    };
  }
}
