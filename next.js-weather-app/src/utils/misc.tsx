import moment from "moment";

export const unixToTime = (sunriseOrSunsetTime: number, timezone: number) => {
    return moment
        .unix(sunriseOrSunsetTime)
        .utcOffset(timezone / 60)
        .format("HH:mm");
};

export const unixToDay = (unix: number) => {
    return moment.unix(unix).format("ddd");
}

export const formatNumber = (num: number) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    } else {
        return num;
    }
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
