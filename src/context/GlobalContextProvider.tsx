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
const GlobalContext = createContext<WeatherResponse | null>(null);
const GlobalContextUpdate = createContext<() => void>(() => {});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [forecast, setForecast] = useState<WeatherResponse | null>(null);

    const fetchForecast = async () => {
        try {
            const res = await axios.get("api/weather");
            console.log("epdlxj", res);
            setForecast(res.data);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error message:", error.message);
            } else {
                console.error("Unknown error:", error);
            }
        }
    };

    useEffect(() => {
        fetchForecast();
    }, []);

    return (
        <GlobalContext.Provider value={ forecast }>
            <GlobalContextUpdate.Provider value={fetchForecast}>
                {children}
            </GlobalContextUpdate.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
