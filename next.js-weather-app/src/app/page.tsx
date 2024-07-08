import AirPollution from "@/components/AirPollution/AirPollution";
import DailyForecast from "@/components/DailyForecast/DailyForecast";
import FeelsLike from "@/components/FeelsLike/FeelsLike";
import FiveDayForeCast from "@/components/FiveDayForecast/FiveDayForeCast";
import Humidity from "@/components/Humidity/Humidity";

const DynamicMapbox = dynamic(() => import("@/components/Mapbox/Mapbox"), {
    ssr: false,
});
import Navbar from "@/components/Navbar";
import Population from "@/components/Population/Population";
import Pressure from "@/components/Pressure/Pressure";
import Sunset from "@/components/Sunset/Sunset";
import Temperature from "@/components/Temperature/Temperature";
import UvIndex from "@/components/UvIndex/UvIndex";
import Visibility from "@/components/Visibility/Visibility";
import Wind from "@/components/Wind/Wind";
import defaultStates from "@/utils/defaultStates";
import dynamic from "next/dynamic";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <main className='mx-[1rem] lg:mx-[2rem] xl:mx-[6rem] 2xl:mx-[16rem] m-auto'>
                <Navbar />
                <div className='pb-4 flex flex-col gap-4 md:flex-row'>
                    <div className='flex flex-col gap-4 w-full min-w-[18rem] md:w-[35rem]'>
                        <Temperature />
                        <FiveDayForeCast />
                    </div>
                    <div className='flex flex-col w-full'>
                        <div className='instruments grid h-full gap-4 col-span-full sm-2:col-span-2 lg:grid-cols-3 xl:grid-cols-4'>
                            <AirPollution />
                            <Sunset />
                            <Wind />
                            <DailyForecast />
                            <UvIndex />
                            <Population />
                            <FeelsLike />
                            <Humidity />
                            <Visibility />
                            <Pressure />
                        </div>

                        <div className='mapbox-con mt-4 flex gap-4'>
                            <DynamicMapbox />
                            <div className='states flex flex-col gap-3 flex-1'>
                                <h2 className='flex items-center gap-2 font-medium'>
                                    Top Large Cities
                                </h2>
                                <div className='flex flex-col gap-4'>
                                    {defaultStates.map((state, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className='border rounded-lg cursor-pointer dark:bg-dark-grey shadow-sm dark:shadow-none'
                                            >
                                                <p className='px-6 py-4'>
                                                    {state.name}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className='py-4 flex justify-center pb-8'>
                <p className='footer-text text-sm flex items-center gap-1'>
                    Made by
                    <Image
                        src={"/github-mark.svg"}
                        alt='logo image'
                        width={20}
                        height={20}
                    />
                    <a
                        href='https://github.com/yhs-2551'
                        target='_blank'
                        className='text-green-300 font-bold'
                    >
                        Yhs on github
                    </a>
                </p>
            </footer>
        </>
    );
}
