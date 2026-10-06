/// <reference types="react-scripts" />

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.pdf' {
    const src: string;
    export default src;
}

declare module 'react-router-dom' {
    import * as React from 'react';
    export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        to: string;
        replace?: boolean;
    }
    export const Link: React.FC<LinkProps>;
    export const NavLink: React.FC<LinkProps>;
    export const Routes: React.FC<{ children?: React.ReactNode }>;
    export const Route: React.FC<{ path: string; element: React.ReactNode }>;
    export const Navigate: React.FC<{ to: string; replace?: boolean }>;
    export const MemoryRouter: React.FC<{ initialEntries?: string[]; children?: React.ReactNode }>;
    export function useNavigate(): (to: string | number, options?: { replace?: boolean }) => void;
    export function useLocation(): { pathname: string; search: string; hash: string; state: any; key: string };
    export function useParams<T = Record<string, string>>(): T;
}
