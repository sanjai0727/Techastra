import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface LinkProps {
    text: string;
    to: string;
    containerStyle?: React.CSSProperties;
    outsideTo?: string;
}

const Link: React.FC<LinkProps> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const normalizedPath = props.to
        ? props.to.startsWith('/')
            ? props.to
            : `/${props.to}`
        : '/';

    const isHere =
        location.pathname === normalizedPath ||
        (normalizedPath === '/' && location.pathname === '');

    const [active, setActive] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.outsideTo) {
            window.open(props.outsideTo, '_blank');
            return;
        }
        setActive(true);
        setTimeout(() => setActive(false), 150);
        navigate(normalizedPath);
    };

    return (
        <div
            onClick={handleClick}
            style={Object.assign(
                {},
                { display: 'flex', alignItems: 'center', cursor: 'pointer' },
                props.containerStyle
            )}
        >
            {isHere && <div style={styles.hereIndicator} />}
            <h4
                className="router-link"
                style={Object.assign(
                    {},
                    styles.link,
                    active && { color: 'red' }
                )}
            >
                {props.text}
            </h4>
        </div>
    );
};

const styles: StyleSheetCSS = {
    link: {
        cursor: 'pointer',
        fontWeight: 'bolder',
        textDecoration: 'underline',
    },
    hereIndicator: {
        width: 4,
        height: 4,
        borderWidth: 3,
        borderStyle: 'solid',
        borderColor: 'rgb(85, 26, 139)',
        alignSelf: 'center',
        borderRadius: '50%',
        marginRight: 6,
        textDecoration: 'none',
    },
};

export default Link;
