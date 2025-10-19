"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import bfox from "../assets/bfox.png";
import Image from "next/image";

export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="mb-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image src={bfox} alt="Logo" className="h-10 w-10 shrink-0 rounded bg-gradient-to-br from-indigo-500 to-emerald-400" />
                    <div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-stone-400">Image Conversion</div>
                        <div className="text-sm text-slate-500 dark:text-stone-500">Fast format conversion UI</div>
                    </div>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
