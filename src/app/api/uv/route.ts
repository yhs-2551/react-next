import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const lat = 37.5665;
        const lon = 126.978;
        const url = `  https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=uv_index_max,uv_index_clear_sky_max`;

        const uvData = await (
            await fetch(url, {
                next: { revalidate: 900 },
            })
        ).json();

        return NextResponse.json(uvData);
    } catch (error) {
        console.log("Error Getting Uv Data");
        return new Response("Error Getting uv Data", {status: 500});
    }
}
