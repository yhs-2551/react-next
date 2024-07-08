"use client";
import axios from "axios";
import React, { useContext, createContext, useState, useEffect } from "react";

import { WeatherResponse } from "@/types/type";
import defaultStates from "@/utils/defaultStates";

import { debounce } from "lodash";

// interface GlobalContextProps {
//     forecast: WeatherResponse | null;
// }
const GlobalContext = createContext<any>(null);
const GlobalContextUpdate = createContext<any>(() => {});

export const GlobalContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [weather, setWeather] = useState({});
    const [geoCodedList, setGeoCodedList] = useState(defaultStates);
    const [inputValue, setInputValue] = useState("");

    const [activeCityCoords, setActiveCityCoords] = useState([
        37.5667, 126.9783,
    ]);

    const [airQuality, setAirQuality] = useState({});
    const [fiveDayForecast, setFiveDayForecast] = useState({});
    const [uvIndex, setUvIndex] = useState({});

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(`/api/weather?lat=${lat}&lon=${lon}`);

            // setWeather(res.data);
            return res.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Axios error fetching forecast data",
                    error.message
                );
            } else {
                console.error("Unexpected error fetching forecast data", error);
            }
        }
    };

    const fetchAirQuality = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(`/api/pollution?lat=${lat}&lon=${lon}`);
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

    const fetchFiveDayForecast = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(`/api/fiveday?lat=${lat}&lon=${lon}`);
            // setFiveDayForecast(res.data);
            return res.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
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

    const fetchUvIndex = async (lat: number, lon: number) => {
        try {
            const res = await axios.get(`/api/uv?lat=${lat}&lon=${lon}`);
            // setUvIndex(res.data);
            return res.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Log axios specific error message
                console.error("Axios error fetching uv data", error.message);
            } else {
                // Log generic error message
                console.error("Unexpected error fetching uv data", error);
            }
        }
    };

    const fetchGeoCodedList = async (search: string) => {
        try {
            const res = await axios.get(`/api/geocoded?search=${search}`);
          
            setGeoCodedList(res.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
              
                console.error(
                    "Axios error fetching geocoded data",
                    error.message
                );
            } else {
               
                console.error("Unexpected error fetching geocoded data", error);
            }
        }
    };

    const fetchAllData = async () => {
        const [weather, airQuality, forecast, uvIndex] = await Promise.all([
            fetchWeather(activeCityCoords[0], activeCityCoords[1]),
            fetchAirQuality(activeCityCoords[0], activeCityCoords[1]),
            fetchFiveDayForecast(activeCityCoords[0], activeCityCoords[1]),
            fetchUvIndex(activeCityCoords[0], activeCityCoords[1]),
        ]);

        setWeather(weather);
        setAirQuality(airQuality);
        setFiveDayForecast(forecast);
        setUvIndex(uvIndex);
        // setGeoCodedList(geoCodedList);
    };

    useEffect(() => {
        fetchAllData();
    }, [activeCityCoords]);

    const handleInput = (e: any) => {
        setInputValue(e.target.value);

        if (e.target.value === "") {
            setGeoCodedList(defaultStates);
        }
    };

    // debounce function

    useEffect(() => {
        const debouncedFetch = debounce((search: string) => {
            fetchGeoCodedList(search);
        }, 300);

        if (inputValue) {
            debouncedFetch(inputValue);
        }

        return () => debouncedFetch.cancel();
    }, [inputValue]);

    return (
        <GlobalContext.Provider
            value={{
                weather,
                airQuality,
                fiveDayForecast,
                uvIndex,
                geoCodedList,
                inputValue,
                handleInput,
              
            }}
        >
            <GlobalContextUpdate.Provider value={setActiveCityCoords}>
                {children}
            </GlobalContextUpdate.Provider>
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalContextUpdate = () => useContext(GlobalContextUpdate);
