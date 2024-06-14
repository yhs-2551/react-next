"use client";

import { useGlobalContext } from "@/context/GlobalContextProvider";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { thermo } from "@/utils/icon";
import { Progress } from "@/components/ui/progress";
import { airQualityIndexText } from "@/utils/misc";

function AirPollution() {
    interface AirQualityIndexText {
        rating: number;
        description: string;
    }

    const { airQuality } = useGlobalContext();
    console.log("왜 안댐", airQuality);

    if (
        !airQuality ||
        !airQuality.list ||
        !airQuality.list[0] ||
        !airQuality.list[0].main
    ) {
        return (
            <Skeleton className='h-[1rem] w-full col-span-2 md:col-span-full' />
        );
    }

    const airQualityIndex: number = airQuality.list[0].main.aqi * 10;
    const filteredIndex: AirQualityIndexText | undefined =
        airQualityIndexText.find((item) => {
            return item.rating === airQualityIndex;
        });

    return (
        <div className='air-pollution col-span-full pt-6 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <h2 className='flex items-center gap-2 font-medium'>
                {thermo} Air Pollution
            </h2>
            <Progress value={airQualityIndex} max={100} className='progress' />
            <p>Air quality is {filteredIndex?.description}&#46;</p>
        </div>
    );
}

export default AirPollution;
