import axios from "axios";
import Error from "next/error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;

        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");

        const dailyUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const dailyRes = await fetch(dailyUrl, {
            next: { revalidate: 3600 },
        });

        // const dailyRes = await fetch(dailyUrl);

        const dailyData = await dailyRes.json();

        // const dailyData = await axios.get(dailyUrl);

        return NextResponse.json(dailyData);
    } catch (error) {
        console.log("Error in getting forecast data ", error);
        return new Response("Error fetching forecast data", { status: 500 });
    }
}
