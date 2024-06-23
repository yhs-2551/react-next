"use client";

import { useGlobalContext } from "@/context/global-context";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { clearSky, cloudy, drizzleIcon, rain, snow } from "@/utils/icon";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import moment from "moment-timezone";

function DailyForecast() {
    const { weather, fiveDayForecast } = useGlobalContext();

    const forecast = weather?.weather;

    const list = fiveDayForecast?.list;

    if (!fiveDayForecast || !list || !weather || !forecast) {
        return <Skeleton className='h-[12rem] w-full' />;
    }

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    //filter the list for today's forecast
    const todaysForecast = list.filter(
        (forecast: { dt_txt: string; main: { temp: number } }) => {
            return forecast.dt_txt.startsWith(todayString);
        }
    );

    if (todaysForecast.length < 1) {
        return (
            <Skeleton className='h-[12rem] w-full     col-span-full sm-2:col-span-2 md:col-span-2 xl:col-span-2' />
        );
    }

    const { main: weatherCondition } = forecast[0];

    const getIcon = () => {
        switch (weatherCondition) {
            case "Drizzle":
                return drizzleIcon;
            case "Rain":
                return rain;
            case "Snow":
                return snow;
            case "Clear":
                return clearSky;
            case "Clouds":
                return cloudy;
            default:
                return clearSky;
        }
    };

    return (
        <div className=' pt-6 px-4 h-[12rem] border rounded-lg flex flex-col gap-8 dark:bg-dark-grey shadow-sm dark:shadow-none col-span-full sm-2:col-span-2 md:col-span-2 xl:col-span-2'>
            <div className='h-full flex gap-10 overflow-hidden'>
                {
                    <div className='w-full'>
                        {/* todaysForecast.map(
                        (forecast: {
                            dt_txt: string;
                            main: { temp: number };
                        }) => {
                            return <div></div>;
                        }
                    ) */}
                        <Carousel>
                            <CarouselContent>
                                {todaysForecast.map(
                                    (forecast: {
                                        dt_txt: string;
                                        main: { temp: number };
                                    }) => {
                                        const temp = Math.trunc(
                                            forecast.main.temp
                                        );

                                        return (
                                            <CarouselItem
                                                className='flex flex-col gap-4 basis-[8.5rem] cursor-grab'
                                                key={forecast.dt_txt}
                                            >
                                                <p className='text-gray-300'>
                                                    {moment(
                                                        forecast.dt_txt
                                                    ).format("HH:MM")}
                                                </p>

                                                <p>{getIcon()}</p>
                                                <p className='mt-4'>
                                                    {temp}&deg;
                                                </p>
                                            </CarouselItem>
                                        );
                                    }
                                )}
                            </CarouselContent>
                        </Carousel>
                    </div>
                }
            </div>
        </div>
    );
}

export default DailyForecast;
