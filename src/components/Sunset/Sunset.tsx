"use client";
import { useGlobalContext } from "@/context/global-context";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { unixToTime } from "@/utils/misc";
import { sunset } from "@/utils/icon";

function Sunset() {
    const { weather } = useGlobalContext();

    if (!weather || !weather?.sys || !weather.sys?.sunset) {
        return (
            <Skeleton className='h-[1rem] w-full col-span-2 md:col-span-full' />
        );
    }

    const sunsetTime = weather?.sys?.sunset;
    const sunriseTime = weather?.sys?.sunrise;
    const timezone = weather?.timezone;

    const convertedSunsetTime = unixToTime(sunsetTime, timezone);
    const convertedSunriseTime = unixToTime(sunriseTime, timezone);

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {sunset}일몰
                    
                </h2>
                <p className="pt-4 text-2xl">{convertedSunsetTime}</p>
            </div>
            
        <p>일출: {convertedSunriseTime}</p>
        </div>
    );
}

export default Sunset;
