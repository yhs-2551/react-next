// import { fetchIsAuthor } from "@/services/api";
// import { useQuery } from "react-query";
 
// function useFetchIsAuthor(id: string, accessToken: string | boolean) {
//     // 아래 코드는 const isAccessToken = accessToken ? true : false 와 같음
//     const isAccessToken = !!accessToken;

//     return useQuery<boolean>(["isAuthor", id], (context) => fetchIsAuthor(context), {
//         // initialData는 쿼리가 실행되기 전에 useQuery에서 기본값으로 사용할 데이터를 의미
//         // 이후 isAccessToken이 true가 되어서 실행하면, 서버로부터 응답을 기다리는 동안 까지의 값이 undefined로 설정. 이후에 서버로 응답을 받으면 해당 데이터를 최종적으로 반환.
//         // isAccessToken이 false면 false를 바로 반환. isAccessToken이 false임에 따라 당연히 쿼리도 실행 안됨.
//         initialData: isAccessToken ? undefined : false,
//         enabled: isAccessToken,
//         refetchOnWindowFocus: false,
//         refetchOnReconnect: true,
//         refetchOnMount: true,
//     });
// }

// export default useFetchIsAuthor;
