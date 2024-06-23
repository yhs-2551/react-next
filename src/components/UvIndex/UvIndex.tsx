"use client";

import { useGlobalContext } from "@/context/global-context";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { sun } from "@/utils/icon";
import { UvProgress } from "@/components/UvProgress/UvProgress";

function UvIndex() {
    const { uvIndex } = useGlobalContext();

    if (!uvIndex || !uvIndex.daily) {
        return <Skeleton className='h-[12rem] w-full'></Skeleton>;
    }

    const { daily } = uvIndex;
    const { uv_index_max } = daily;

    const uvIndexMax = uv_index_max[0].toFixed(0);

    const uvIndexCategory = (uvIndex: number) => {
        if (uvIndex <= 2) {
            return {
                text: "Low",
                description: "No protection required",
            };
        } else if (uvIndex <= 5) {
            return {
                text: "Moderate",
                description: "Stay in shade near midday.",
            };
        } else if (uvIndex <= 7) {
            return {
                text: "High",
                description: "Wear a hat and sunglasses.",
            };
        } else if (uvIndex <= 10) {
            return {
                text: "Very High",
                description: "Apply sunscreen SPF 30+ evey 2 hours",
            };
        } else {
            return {
                text: "Extreme High",
                description: "Avoid being outside.",
            };
        }
    };

    // 14가 맥시멈 값
    const marginLeftPercentage = (uvIndexMax / 14) * 100;

    return (
        <div className='pt-6 pb-5 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {sun} 자외선 강도
                </h2>
                <div className='pt-4 flex flex-col gap-1'>
                    <p className='text-2xl'>
                        {uvIndexMax}
                        <span className='text-sm'>
                            {uvIndexCategory(uvIndexMax).text}
                        </span>
                    </p>

                    <UvProgress
                        value={marginLeftPercentage}
                        max={14}
                        className='uv'
                    />
                </div>
            </div>

            <p className='text-sm'>{uvIndexCategory(uvIndexMax).description}</p>
        </div>
    );
}

export default UvIndex;
