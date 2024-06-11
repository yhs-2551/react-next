"use client";

import { useGlobalContext } from "@/context/GlobalContextProvider";
import {
    clearSky,
    cloudy,
    drizzleIcon,
    navigation,
    rain,
    snow,
} from "@/utils/icon";
import React, { useState } from "react";

import { WeatherResponse } from "@/types/type";

function Temperature() {
    const forecast = useGlobalContext() as WeatherResponse | null;

    if (forecast) {
    }

    const main = forecast?.main;
    const timezone = forecast?.timezone;
    const name = forecast?.name;
    const weather = forecast?.weather;

    if (!forecast || !weather) {
        return <div>Loading...</div>;
    }

    const temp = Math.trunc(main?.temp ?? 0);
    const minTemp = Math.trunc(main?.temp_min ?? 0);
    const maxTemp = Math.trunc(main?.temp_max ?? 0);

    const [localTime, setLocalTime] = useState<string>("");
    const [currentDay, setCurrentDay] = useState<string>("");

    const { main: weatherCondition, description } = weather[0];
    const getIcon = () => {
        switch (weatherCondition) {
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
        <div className='pt-6 pb-5 px-4 border rounded-lg flex flex-col justify-between dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <p className='flex justify-between items-center'>
                <span className='font-medium'>{currentDay}</span>
                <span className='font-medium'>{localTime}</span>
            </p>
            <p className='pt-2 font-bold flex gap-1'>
                <span>{name}</span>
                <span>{navigation}</span>
            </p>
            <p className='py-10 text-9xl font-bold self-center'>{temp}&deg;</p>

            <div>
                <div>
                    <span>
                        {getIcon()}
                        <p className='pt-2 capitalize text-lg font-medium'>
                            {description}
                        </p>
                    </span>
                </div>

                <p>
                    <span>Low: {minTemp}&deg;</span>
                    <span>High: {maxTemp}&deg;</span>
                </p>
            </div>
        </div>
    );
}

export default Temperature;
