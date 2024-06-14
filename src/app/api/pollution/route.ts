import { WeatherResponse } from "@/types/type";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        const lat = 37.5665;
        const lon = 126.978;

        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}
`;
        const res = await axios.get(url);

        return NextResponse.json(res.data);
        
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
