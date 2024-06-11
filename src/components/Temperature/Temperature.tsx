"use client";

import { useGlobalContext } from "@/context/globalContext";
import { clearSky, cloudy, drizzleIcon, rain, snow } from "@/utils/icon";
import React, { useState } from "react";

function Temperature() {
    const { forecast } = useGlobalContext();

    const { main, timezone, name, weather } = forecast;

    console.log("값", main);

    if (!forecast || !weather) {
        return <div>Loading...</div>;
    }

    const temp = main;
    const minTemp = main.temp_min;
    const maxTemp = main.temp_max;

    const [localTime, setLocalTime] = useState<string>("");
    const [currentDay, setCurrentDay] = useState<string>("");

    const { main: weatherMain, description } = weather[0];
    const getIcon = () => {
        switch (weatherMain) {
            case "Drizzle":
                return drizzleIcon;
            case "Rain":
                return rain;
            case "Snow":
                return snow;
            case "Clear":
                return clearSky;
            case "Clouds":
                return cloudy;
            default:
                return clearSky;
        }
    };
 

    return (
        <div className='pt-6 pb-5 border rounded-lg flex flex-col justify-between dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <p className='flex justify-between items-center'>
                <span className='font-medium'>{currentDay}</span>
                <span className='font-medium'>{localTime}</span>
            </p>
        </div>
    );
}

export default Temperature;
