"use client";

import { useGlobalContext } from "@/context/global-context";
import { people } from "@/utils/icon";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { formatNumber } from "@/utils/misc";

function Population() {
    const { fiveDayForecast } = useGlobalContext();

    const city = fiveDayForecast?.city;

    if (!fiveDayForecast || !city) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {people} Population
                </h2>

                <p className='pt-4 text-2xl'>
                    {formatNumber(city?.population)}
                </p>
            </div>

            <p className='text-sm'>
                Latest UN population data for {city?.name}.
            </p>
        </div>
    );
}

export default Population;
