import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;

        const lat = searchParams.get("lat");
        const lon = searchParams.get("lon");

        const pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric
`;
        const pollutionRes = await axios.get(pollutionUrl);

        return NextResponse.json(pollutionRes.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Axios error fetching air pollution data",
                error.message
            );
        } else {
            console.error(
                "Unexpected error fetching air pollution data",
                error
            );
        }

        return new Response("Error Fetching air pollution data", {
            status: 500,
        });
    }
}
