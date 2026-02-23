"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" |"positive" | "edit" | "main";

type Props = {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset" ;
    disabled?: boolean;
    variant?: ButtonVariant;
    className?: string;
}


export default function GenButton({
    children,
    onClick,
    type,
    disabled,
    variant= "primary",
    className,
    }:Props){

        return(
            <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2",
                {
                primary: "border-2 border-mainhighlight bg-mainhighlight text-mainLight hover:bg-[#ff4920]",
                edit: "border-2 border-decision bg-decision text-mainLight hover:bg-[#faa81c]",
                positive: "border-2 border-positive bg-positive text-mainLight hover:bg-[#44a75c] ",
                secondary: "border-2 border-mainGray bg-mainGray text-mainLight hover:bg-mainLightGray hover:text-mainLight ",
                outline:
                    "border-2 border-mainDark text-mainDark hover:bg-mainDark hover:text-mainLight",
                danger: "border-2 border-negative bg-negative text-mainLight hover:bg-red-700",
                main: "border-2 border-mainDark bg-mainBg text-mainLight hover:bg-[#071658] hover:text-mainLight",
                }[variant],
                className
            )}
            >
            {children}
            </button>
        );

    
    }