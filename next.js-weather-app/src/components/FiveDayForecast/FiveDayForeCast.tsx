"use client";

import { useGlobalContext } from "@/context/global-context";
import { calender } from "@/utils/icon";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { unixToDay } from "@/utils/misc";

function FiveDayForeCast() {
    const { fiveDayForecast } = useGlobalContext();

    const city = fiveDayForecast?.city;
    const list = fiveDayForecast?.list;

    if (!fiveDayForecast || !city || !list) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    // 오늘 기준으로 총 5일인데, 오늘 낮 12시 기준으로 시작해서 각각의 요일(총 5개의 요일)마다 12시, 15시, 18시, 21시, 24시 총 5개의 시간을 기준으로 최저 및 최고 온도를 구한다.
    // 예를 들어, 오늘이 월요일 이라고 가정하면, 월요일 12시, 15시, 18시, 21시, 24시를 비교해서 최종적으로 월요일의 최저 온도와 최고 온도를 구한다. 월요일 제외 나머지 4개의 요일도 이와 같은 식으로 구한다.

    const processData = (
        dailyData: {
            main: { temp_min: number; temp_max: number };
            dt: number;
        }[]
    ) => {
        let minTemp;
        let maxTemp;

        dailyData.map(
            (day: {
                main: { temp_min: number; temp_max: number };
                dt: number;
            }) => {
                if (day.main.temp_min < Number.MAX_VALUE) {
                    minTemp = day.main.temp_min.toFixed();
                }

                if (day.main.temp_max > Number.MIN_VALUE) {
                    maxTemp = day.main.temp_max.toFixed();
                }
            }
        );

        return {
            day: unixToDay(dailyData[0].dt),
            minTemp,
            maxTemp,
        };
    };

    const dailyForecast = [];

    for (let i = 0; i < 40; i += 8) {
        const dailyData = list.slice(i, i + 5);
        dailyForecast.push(processData(dailyData));
    }

    return (
        <div className='pt-6 pb-5 px-4 border rounded-lg flex flex-col justify-between dark:bg-dark-grey shadow-sm dark:shadow-none'>
            <div className='top'>
                <h2 className='flex items-center gap-2 font-medium'>
                    {calender} 5-Day Forecast for {city.name}
                </h2>
            </div>

            <div className='forecast-list pt-3'>
                {dailyForecast.map((day, i) => {
                    return (
                        <div
                            key={i}
                            className='daily-forecast py-4 justify-evenly border-b-2'
                        >
                            <p className='text-xl min-w-[3.5rem]'>{day.day}</p>
                            <p className='text-sm flex justify-between'>
                                <span>(low)</span>
                                <span>(high)</span>
                            </p>

                            <div className="flex-1 flex items-center justify-between gap-4">
                                <p className="font-bold">
                                    {day?.minTemp}&deg;C
                                </p>
                                <div className="temperature flex-1 w-full h-2 rounded-lg"></div>
                                <p className="font-bold">
                                    {day?.maxTemp}&deg;C
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FiveDayForeCast;
