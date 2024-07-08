"use client";

import { useGlobalContext } from "@/context/global-context";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { gauge } from "@/utils/icon";

function Pressure() {
    const { weather } = useGlobalContext();

    const pressure = weather?.main?.pressure;
    if (!weather || !pressure) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    const getPressureDescription = (pressure: number) => {
        if (pressure < 1000) {
            return "Very low pressure";
        } else if (pressure >= 1000 && pressure < 1015) {
            return "Low Pressure. Except weather changes.";
        } else if (pressure >= 1015 && pressure < 1025) {
            return "Normal Pressure. Expect weather changes.";
        } else if (pressure >= 1025 && pressure < 1040) {
            return "High Pressure. Expect weather changes.";
        } else if (pressure >= 1040) {
            return "Very high pressure. Expect weather changes.";
        } else {
            return "Unavailable pressure data.";
        }
    };

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {gauge} 대기압
                </h2>
                <p className='pt-4 text-2xl'>{pressure} hPa</p>
            </div>
            <p className='text-sm'>{getPressureDescription(pressure)}</p>
        </div>
    );
}

export default Pressure;
