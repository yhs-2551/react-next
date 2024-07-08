export interface WeatherResponse {
    main: {
        temp: number;
        temp_max: number;
        temp_min: number;
    };

    timezone: number;
    name: string;
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
}
