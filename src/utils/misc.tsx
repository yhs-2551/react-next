import moment from "moment";

export const unixToTime = (unix: number, timezone: number) => {
    return moment.unix(unix).utcOffset(timezone / 60).format("HH:mm")
}

export const airQualityIndexText = [
    {
        rating: 20,
        description: "Good",
    },
    {
        rating: 40,
        description: "fair",
    },
    {
        rating: 60,
        description: "moderate",
    },
    {
        rating: 80,
        description: "poor",
    },
    {
        rating: 100,
        description: "very poor",
    },
];
