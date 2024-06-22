"use client";

import { useGlobalContext } from "@/context/global-context";
import { droplets } from "@/utils/icon";
import React from "react";
import { Skeleton } from "../ui/skeleton";

function Humidity() {
    const { weather } = useGlobalContext();

    if (!weather) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    const main = weather.main;
    const humidity = weather.main.humidity;

    const getHumidityText = (humidity: number) => {
        if (humidity < 30) {
            return "Dry: May cause skin irritation.";
        } else if (humidity < 50) {
            return "Comfortable: Ideal for health and comfort.";
        } else if (humidity < 70) {
            return "Moderate: Sticky, may increase allergens.";
        } else {
            return "High: Uncomfortable, mold growth risk.";
        }
    };

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {droplets} Humidity
                </h2>
                <p className='pt-4 text-2xl'>{humidity}%</p>
            </div>
            <p className='text-sm'>{getHumidityText(humidity)}</p>
        </div>
    );
}

export default Humidity;
