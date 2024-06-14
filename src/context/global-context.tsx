"use client";
import axios from "axios";
import React, {
    useContext,
    createContext,
    useState,
    useEffect,
} from "react";

import { WeatherResponse } from "@/types/type";

// interface GlobalContextProps {
//     forecast: WeatherResponse | null;
// }
const GlobalContext = createContext<any>(null);
const GlobalContextUpdate = createContext<() => void>(() => {});

export const GlobalContextProvider = ({
    children 
}: { children: React.ReactNode }) => {
    const [weather, setWeather] = useState<any>(null);
    const [airQuality, setAirQuality] = useState<any>(null);
    const [fiveDayForecast, setFiveDayForecast] = useState<any>(null);

    const fetchWeather = async () => {
        try {
            const res = await axios.get("api/weather");

            console.log("결과값", res);

            setWeather(res.data);
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
            console.log("유즈222 이펙트 에어", res.data);
            setAirQuality(res.data);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Log axios specific error message
                console.error(
                    "Axios error fetching air pollution data",
                    error.message
                );
            } else {
                // Log generic error message
                console.error("Unexpected error fetching air pollution data", error);
            }
        }
    };

    const fetchFiveDayForecast = async () => {
        try {
            const res = await axios.get("api/fiveday");
            setFiveDayForecast(res.data);
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
    }

    useEffect(() => {
        fetchWeather();
        fetchAirQuality();
        fetchFiveDayForecast();
      
    }, []);

    return (
        <GlobalContext.Provider value={{ weather, airQuality, fiveDayForecast }}>
            <GlobalContextUpdate.Provider value={() => {}}>
                {children}
            </GlobalContextUpdate.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
