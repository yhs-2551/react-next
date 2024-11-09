"use client";

import React, { useEffect } from "react";
import CommonSideNavigation from "../../(common-side-navigation)/CommonSideNavigation";

function Tag() {

    // function parseJwt(token: string) {
    //     try {
    //         const base64Url = token.split('.')[1];
    //         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    //             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //         }).join(''));
    //         return JSON.parse(jsonPayload);
    //     } catch (error) {
    //         console.error('Invalid token:', error);
    //         return null;
    //     }
    // }

    // useEffect(() => {
    //     const token = localStorage.getItem('access_token');

    //     console.log("token >>>", token);

    //     if (token) {
    //         const decodedToken = parseJwt(token);
    //         console.log('Token payload:', decodedToken);
    //     }
    // }, []);
    
    // 사용예시

    

    return (
        <div className='manage-wrapper min-h-screen w-full bg-manageBgColor'>
            <CommonSideNavigation />
        </div>
    );
}

export default Tag;
