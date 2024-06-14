"use client";

import { useGlobalContext } from "@/context/global-context";
import React from "react";
import { Skeleton } from "../ui/skeleton";

function DailyForecast() {

    const { weather, fiveDayForecast} = useGlobalContext();

    const forecast = weather?.weather;
    const city = fiveDayForecast?.city;
    const list = fiveDayForecast?.list;

    if (!fiveDayForecast || !city || !list) {
        return <Skeleton className="h-[12rem] w-full"/>
    }

    if (!weather || !forecast) {
        return <Skeleton className="h-[12rem] w-full"/>
    }

    

    return (
        <div className=" pt-6 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none col-span-full sm-2:col-span-2 md:col-span-2 xl:col-span-2'">
            DailyForecast
        </div>
    );
}

export default DailyForecast;
