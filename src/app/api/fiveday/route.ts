import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        const lat = 37.5665;
        const lon = 126.978;

        const dailyUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const dailyRes = await fetch(dailyUrl, {
            next: { revalidate: 3600 },
        });

        const dailyData = await dailyRes.json();

        return NextResponse.json(dailyData);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error fetching forecast data", error.message);
        } else {
            console.error("Unexpected error fetching forecast data", error);
        }

        return new NextResponse("Error Fetching forecast data", {
            status: 500,
        });
    }
}
