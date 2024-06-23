"use client";

import { useGlobalContext } from "@/context/global-context";
import { thermometer } from "@/utils/icon";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FeelsLike() {
    const { weather } = useGlobalContext();

    if (!weather) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    const { feels_like, temp_min, temp_max } = weather?.main;

    const feelsLikeText = (
        feelsLike: number,
        minTemp: number,
        maxTemp: number
    ) => {
        const avgTemp = (minTemp + maxTemp) / 2;

        if (feelsLike < avgTemp - 5) {
            return "Feels significantly colder than actual temperature.";
        }

        if (feelsLike >= avgTemp - 5 && feelsLike <= avgTemp + 5) {
            return "Feels close to the actual temperature.";
        }

        if (feelsLike > avgTemp + 5) {
            return "Feels significantly warmer than actual temperature.";
        }
    };

    const feelsLikeDescription = feelsLikeText(feels_like, temp_min, temp_max);
    const feelsLike = Math.trunc(feels_like);

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {thermometer} 체감 온도
                </h2>
                <p className='pt-4 text-2xl'>{feelsLike}&deg;c</p>
            </div>
            <p className="text-sm">{feelsLikeDescription}</p>
        </div>
    );
}

export default FeelsLike;
