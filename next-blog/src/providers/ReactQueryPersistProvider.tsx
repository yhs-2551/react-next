// 새로 고침 해도 캐시된 데이터를 사용하기 위해 localstorage를 이용해 persistQueryClinet 사용.
// 새로 고침 시 cacheTime으로 지정해 둔 브라우저의 메모리 캐시가 삭제되기 때문에 이를 위해 로컬 스토리지 캐시를 사용.
// 확인은 브라우저 개발자 도구 -> application 탭 -> localstorage -> REACT_QUERY_OFFLINE_CACHE -> clientState -> queries -> state -> data에서 확인 가능.


"use client";

import React from "react";
import { persistQueryClient } from "react-query/persistQueryClient-experimental";
import { createWebStoragePersistor } from "react-query/createWebStoragePersistor-experimental";
import { QueryClient } from "react-query";

export const queryClient = new QueryClient();

if (typeof window !== "undefined") {
  const localStoragePersistor = createWebStoragePersistor({
    storage: window.localStorage,
  });

  persistQueryClient({
    queryClient,
    persistor: localStoragePersistor,
    // maxAge: 1800000, // 로컬 스토리지에 캐시되는 시간 30분 설정, 즉 새로 고침 및 offline 상태여도 유지 됨. 지정 안하면 무제한으로 저장 된다.
  });


}

export default function ReactQueryPersistProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}