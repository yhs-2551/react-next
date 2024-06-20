import moment from "moment";

export const unixToTime = (sunriseOrSunsetTime: number, timezone: number) => {
    return moment
        .unix(sunriseOrSunsetTime)
        .utcOffset(timezone / 60)
        .format("HH:mm");
};

export const airQualityIndexText = [
    {
        rating: 10,
        description: "excellent",
    },
    {
        rating: 20,
        description: "Good",
    },
    {
        rating: 30,
        description: "Good",
    },
    {
        rating: 40,
        description: "fair",
    },
    {
        rating: 50,
        description: "fair",
    },
    {
        rating: 60,
        description: "moderate",
    },
    {
        rating: 70,
        description: "moderate",
    },
    {
        rating: 80,
        description: "poor",
    },
    {
        rating: 90,
        description: "poor",
    },
    {
        rating: 100,
        description: "very poor",
    },
];
