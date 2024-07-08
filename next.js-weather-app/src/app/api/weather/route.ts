import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;

        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const weatherRes = await axios.get(weatherUrl);

        return NextResponse.json(weatherRes.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            // Log axios specific error message
            console.error("Axios error fetching weather data", error.message);
        } else {
            // Log generic error message
            console.error("Unexpected error fetching weather data", error);
        }

        // Return error response
        return new Response("Error Fetching weather data", { status: 500 });
    }
}
