## Next.js를 사용한 날씨 정보 웹 애플리케이션 (학습 및 연습용)

날씨 정보를 시각적으로 보기 좋게 표시하는 웹 애플리케이션입니다. OpenWeatherMap API와 같은 외부 API를 활용하여 다양한 날씨 데이터를 제공합니다.

**기술 스택**

-   **프레임워크:** Next.js 14 (App Router)
-   **언어:** TypeScript
-   **스타일링:** Tailwind CSS
-   **UI 컴포넌트:**
    -   Radix UI
    -   shadcn/ui (컴포넌트 시스템)
-   **지도:** React Leaflet
-   **HTTP 통신:** Axios
-   **날짜/시간 처리:** Moment, Moment-timezone
-   **유틸리티:**
    -   Lodash (데이터 조작)
-   **테마:** next-themes (다크/라이트 모드)
-   **아이콘:** Lucide React

**주요 기능**

-   **현재 날씨 정보**
    -   온도, 습도, 기압, 풍속 등 실시간 날씨 데이터 표시
    -   위치 기반 자동 날씨 정보 제공
-   **상세 날씨 데이터**
    -   체감 온도 (FeelsLike)
    -   자외선 지수 (UvIndex)
    -   가시성 (Visibility)
    -   대기 오염도 (AirPollution)
    -   습도 (Humidity)
    -   기압 (Pressure)
    -   인구 밀도 (Population)
    -   일출/일몰 시간 (Sunset)
    -   바람 정보 (Wind)
-   **예보 기능**
    -   일일 예보 (DailyForecast)
    -   5일 예보 (FiveDayForecast)
-   **지도 통합**
    -   인터랙티브 지도
    -   지역별 날씨 확인 가능
-   **사용자 경험**
    -   반응형 디자인
    -   다크/라이트 테마 지원
    -   로딩 상태 표시 (Skeleton)
    -   직관적인 데이터 시각화
-   **데이터 시각화**

    -   온도, 습도, UV 지수 등의 정보를 그래프와 차트로 시각화
    -   컬러 그라디언트를 활용한 수치 표현

-   **외부 데이터 소스**
    -   OpenWeatherMap API, Open-Meteo API
    -   지도 데이터: Leaflet을 통한 지도 시각화
