"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useGlobalContext } from "@/context/global-context";

// @ts-ignore
function FlyToActiveCity({ activeCityCoords }) {
    if (typeof window === "undefined") {
        return;
    }

    const map = useMap();
    useEffect(() => {
        if (activeCityCoords) {
            const zoomLev = 13;
            const flyToOptions = { duration: 1.5 };

            map.flyTo(
                [activeCityCoords.lat, activeCityCoords.lon],
                zoomLev,
                flyToOptions
            );
        }
    }, [activeCityCoords, map]);

    return null;
}

function Mapbox() {
    const { weather } = useGlobalContext();

    const activeCityCoords = weather?.coord;

    if (!weather || !activeCityCoords) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }

    const position: any = [activeCityCoords.lat, activeCityCoords.lon];

    return (
        <div className='flex-1 basis-[50%] border rounded-lg'>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{
                    height: "100%",
                    width: "100%",
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <FlyToActiveCity activeCityCoords={activeCityCoords} />
            </MapContainer>
        </div>
    );
}

export default Mapbox;
