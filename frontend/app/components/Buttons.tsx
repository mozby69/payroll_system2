"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" |"positive";

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
                primary: "bg-mainhighlight text-mainLight hover:bg-[#ff4920]",
                positive: "bg-positive text-mainLight hover:bg-[#44a75c]",
                secondary: "bg-mainGray text-mainLight hover:bg-gray-300 hover:text-mainGray",
                outline:
                    "border-2 border-mainDark text-mainDark hover:bg-mainDark hover:text-mainLight",
                danger: "bg-negative text-mainLight hover:bg-red-700",
                }[variant],
                className
            )}
            >
            {children}
            </button>
        );

    
    }