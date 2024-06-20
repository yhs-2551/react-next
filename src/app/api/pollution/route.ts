import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        const lat = 37.5665;
        const lon = 126.978;

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
