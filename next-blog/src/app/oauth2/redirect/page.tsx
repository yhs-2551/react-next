"use client";

import { Suspense } from "react";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";

export default function OAuth2RedirectPage() {
    return (
        <Suspense>
            <OAuth2RedirectHandler />
        </Suspense>
    );
}
