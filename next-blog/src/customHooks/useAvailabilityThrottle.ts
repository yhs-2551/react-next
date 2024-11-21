// 중복 확인 요청을 1분에 3번으로 제한. 즉 1분에 3회가 넘어가면 다음 요청은 1분 후에 가능하도록 제한.

import { useState, useCallback } from "react";

interface ThrottleState {
    count: number;
    startTime: number | null;
}

export const useAvailabilityThrottle = (limit: number = 3, interval: number = 60000) => {
    const [throttleState, setThrottleState] = useState<Record<string, ThrottleState>>({});
    const [isBlocked, setIsBlocked] = useState<Record<string, boolean>>({});

    // canCheckAvailability함수에 useCallback 쓰면 안되는 이유:
    // 클로저의 문제 때문에 useCallback 쓰면 맨 처음 생성 당시에 외부 변수인 throttleState를 캡쳐해서 가져옴.
    // 따라서 useAvailabilityThrottle를 재실행해서 throttleState가 업데이트 되어도 useCallback을 사용해서 초기에 한번만 생성된 canCheckAvailability 함수는 맨 초기의 클로저 값만을 계속 참조함.
    // useCallback을 사용하지 않으면 매번 함수가 새로 생성될때마다 가장 최신의 클로저 값을 참조하게 됨으로써 원하는 결과값을 가져올 수 있음.
    const canCheckAvailability = (field: string): boolean => {
        const now = Date.now();
        const state = throttleState[field];


        // 첫 요청이거나 시간이 리셋된 경우, 첫 요청때는 throttleState[field]로 가져올때 undefined가 나옴. 즉 중복확인 첫 요청때 !state값은 true가 됨.
        //  (now - state.startTime) > interval)는 interval이 60000이므로 1분이 지나면 초기화.
        if (!state || !state.startTime || now - state.startTime > interval) {
            setThrottleState((prev) => ({
                ...prev,
                [field]: { count: 1, startTime: now },
            }));
            setIsBlocked((prev) => ({ ...prev, [field]: false }));
            return true;
        }

        // 제한 횟수 체크
        if (state.count >= limit) {

            setIsBlocked((prev) => ({ ...prev, [field]: true }));


            // 1분 후 자동으로 제한 해제
            setTimeout(() => {
                setThrottleState((prev) => ({
                    ...prev,
                    [field]: { count: 0, startTime: null },
                }));
                setIsBlocked((prev) => ({ ...prev, [field]: false }));
            }, 60000);

            return false;
        }

        // 카운트 증가
        setThrottleState((prev) => ({
            ...prev,
            [field]: { count: state.count + 1, startTime: state.startTime },
        }));

        return true;
    };

    return { canCheckAvailability, isBlocked };
};
