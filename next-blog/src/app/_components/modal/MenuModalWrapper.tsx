"use client";

import { useEffect, useState } from "react";
import MenuModal from "./MenuModal";
import ClientWrapper from "@/providers/ClientWrapper";

interface MenuModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MenuModalWrapper({ isOpen, onClose }: MenuModalWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        //   캐시 데이터 쓰기 위해 usePersist={true} 필수
        <ClientWrapper usePersist={true}>
            <MenuModal isOpen={isOpen} onClose={onClose} />
        </ClientWrapper>
    );
}
