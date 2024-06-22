"use client";
import axios from "axios";
import React, { useContext, createContext, useState, useEffect } from "react";

import { WeatherResponse } from "@/types/type";

// interface GlobalContextProps {
//     forecast: WeatherResponse | null;
// }
const GlobalContext = createContext<any>(null);
const GlobalContextUpdate = createContext<() => void>(() => {});

export const GlobalContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [weather, setWeather] = useState<any>(null);
    const [airQuality, setAirQuality] = useState<any>(null);
    const [fiveDayForecast, setFiveDayForecast] = useState<any>(null);
    const [uvIndex, setUvIndex] = useState({});

    const fetchWeather = async () => {
        try {
            const res = await axios.get("api/weather");

            // setWeather(res.data);
            return res.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Log axios specific error message
                console.error(
                    "Axios error fetching forecast data",
                    error.message
                );
            } else {
                // Log generic error message
                console.error("Unexpected error fetching forecast data", error);
            }
        }
    };

    const fetchAirQuality = async () => {
        try {
            const res = await axios.get("api/pollution");
            // setAirQuality(res.data);
            return res.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Log axios specific error message
                console.error(
                    "Axios error fetching air pollution data",
                    error.message
                );
            } else {
                // Log generic error message
                console.error(
                    "Unexpected error fetching air pollution data",
                    error
                );
            }
        }
    };

    const fetchFiveDayForecast = async () => {
        try {
            const res = await axios.get("api/fiveday");
            // setFiveDayForecast(res.data);
            return res.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Log axios specific error message
                console.error(
                    "Axios error fetching five day data",
                    error.message
                );
            } else {
                // Log generic error message
                console.error("Unexpected error fetching five day data", error);
            }
        }
    };

    const fetchUvIndex = async () => {
        try {
            const res = await axios.get("/api/uv");
            // setUvIndex(res.data);
            return res.data;
        } catch (error) {
            console.error("Unexpected error fetching uv data", error);
        }
    };

    const fetchAllData = async () => {
        const [weather, airQuality, forecast, uvIndex] = await Promise.all([
            fetchWeather(),
            fetchAirQuality(),
            fetchFiveDayForecast(),
            fetchUvIndex(),
        ]);

        setWeather(weather);
        setAirQuality(airQuality);
        setFiveDayForecast(forecast);
        setUvIndex(uvIndex);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    return (
        <GlobalContext.Provider
            value={{ weather, airQuality, fiveDayForecast, uvIndex }}
        >
            <GlobalContextUpdate.Provider value={() => {}}>
                {children}
            </GlobalContextUpdate.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
