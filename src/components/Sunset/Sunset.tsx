"use client";
import { useGlobalContext } from "@/context/GlobalContextProvider";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function Sunset() {
    const { forecast } = useGlobalContext();

    if (!forecast || !forecast?.sys || !forecast.sys?.sunset) {
        return (
            <Skeleton className='h-[1rem] w-full col-span-2 md:col-span-full' />
        );
    }

    const times = forecast?.sys.sunset;
    const timezone = forecast?.timezone;

    return (
        <div className='pt-6 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            Sunset
        </div>
    );
}

export default Sunset;
