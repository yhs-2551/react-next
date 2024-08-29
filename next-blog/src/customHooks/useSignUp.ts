 
import { queryClient } from "@/providers/ReactQueryPersistProvider";
import { useMutation } from "react-query"

interface SignupRequest {
  username: string;
  email: string;
  password: string;

}

 const useSignup = () => {

  return useMutation((newUser: SignupRequest) => 
    fetch("http://localhost:8000/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(JSON.stringify(errorData));
      }

      return res.json();
    }), 
    {
      onSuccess: () => {
        console.log("회원가입 성공");
        queryClient.invalidateQueries("users");
      }, 
      onError: (error) => {
        console.log("회원가입 실패: ", error);
      },
    }
  );
};
  


export default useSignup;