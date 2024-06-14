"use client";
import axios from "axios";
import React, {
    useContext,
    createContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

import { WeatherResponse } from "@/types/type";

// interface GlobalContextProps {
//     forecast: WeatherResponse | null;
// }
const GlobalContext = createContext<any>(null);
const GlobalContextUpdate = createContext<() => void>(() => {});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [forecast, setForecast] = useState<any>(null);
    const [airQuality, setAirQuality] = useState<any>(null);

    const fetchForecast = async () => {
        try {
            const res = await axios.get("api/weather");

            setForecast(res.data);
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
            setAirQuality(res.data);
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

    useEffect(() => {
        fetchForecast();
        fetchAirQuality();
    }, []);

    return (
        <GlobalContext.Provider value={{ forecast, airQuality }}>
            <GlobalContextUpdate.Provider value={fetchForecast}>
                {children}
            </GlobalContextUpdate.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
