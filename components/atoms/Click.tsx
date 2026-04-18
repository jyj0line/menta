import NextjsLink from "next/link";
import { useTranslations } from "next-intl";

import { LogoSVG } from "@/components/svgs/svgs";
import { getSafePathname } from "@/utils/helper.route";

const COMMON_CN = "border border-(length:--lne-2) p-clk-p16 rounded-all-r9999px cursor-pointer disabled:bg-clk-dsb disabled:cursor-not-allowed";
const BUTTON_CN = "bg-clk-dft text-clktxt-dft border-clktxt-dft";
const TOGGLE_CN = "cursor-pointer";
const LINK_CN = "bg-clk-dfu text-clktxt-dtu border-clktxt-dtu";
const LOGO_SVG_CN = 'w-auto aspect-auto h-full h-[2rem]';

type ButtonProps = {
    type: "button" | "submit"
    label: string;
    disabled: boolean;
    tabIndex: number;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}
export const Button = ({
    type, label, disabled, tabIndex, onClick, className
}: ButtonProps) => {

    return (
        <button
            type={type}
            disabled={disabled}
            tabIndex={tabIndex}
            onClick={onClick}
            className={`${COMMON_CN} ${BUTTON_CN} ${className}`}
        >
            {label}
        </button>
    );
}

type ToggleProps = {
    ariaLabel: string;
    ariaPressed: boolean;
    tabIndex: number;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children: React.ReactNode;
    className?: string;
}
export const Toggle = ({
    ariaLabel, ariaPressed, tabIndex, onClick, children, className
}: ToggleProps) => {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            aria-pressed={ariaPressed}
            tabIndex={tabIndex}
            onClick={onClick}
            className={`${TOGGLE_CN} ${className}`}
        >
            {children}
        </button>
    );
}

type LinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
}
export const Link = ({
    href, children, className
}: LinkProps) => {

    return (
        <NextjsLink href={getSafePathname(href)} className={`${COMMON_CN} ${LINK_CN} ${className}`}>
            {children}
        </NextjsLink>
    );
}

type LogoProps = {
    classNameH: string;
}
export const Logo = ({
    classNameH
}: LogoProps) => {
    const metadataT = useTranslations('aria-label');

    return (
        <NextjsLink href="/" aria-label={metadataT('mentaLogo')} className={classNameH}>
            <LogoSVG className={LOGO_SVG_CN} />
        </NextjsLink>
    );
}