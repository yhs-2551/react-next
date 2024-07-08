import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY;

        const city = searchParams.get("search");
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

        const res = await axios.get(url);

        return NextResponse.json(res.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error fetching geocoded data", error.message);
        } else {
            console.error("Unexpected error fetching geocoded data", error);
        }

        return new Response("Error Fetching geocoded data", {
            status: 500,
        });
    }
}
