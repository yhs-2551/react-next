"use client";

import { eye } from "@/utils/icon";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalContext } from "@/context/global-context";

function Visibility() {
    const { weather } = useGlobalContext();

    const visibility = weather?.visibility;
    if (!weather || !visibility) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    const getVisibilityDescription = (visibility: number) => {
        const visibilityInKm = Math.round(visibility / 1000);

        if (visibilityInKm > 10) {
            return "Excellent: Clear and vast view";
        } else if (visibilityInKm > 5) {
            return "Good: Easily navigable";
        } else if (visibilityInKm > 2) {
            return "Moderate: Some limitations";
        } else if (visibilityInKm <= 2) {
            return "Poor: Restricted and unclear";
        } else {
            return "Unavailable: Visibility data not available";
        }
    };

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {eye} 가시 거리
                </h2>
                <p className='pt-4 text-2xl'>
                    {Math.round(visibility / 1000)} km
                </p>
            </div>
            <p className='text-sm'>{getVisibilityDescription(visibility)}</p>
        </div>
    );
}

export default Visibility;
