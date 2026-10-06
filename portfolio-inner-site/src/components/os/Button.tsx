import React, { useState } from 'react';
import { IconName } from '../../assets/icons';
import Colors from '../../constants/colors';
import { Icon } from '../general';

export interface ButtonProps {
    icon?: IconName;
    text?: string;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ icon, text, onClick }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setIsPressed(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPressed(true);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPressed(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    const outerBorderStyle = Object.assign(
        {},
        styles.outerBorder,
        icon && { width: 16, height: 14 },
        isPressed && {
            borderTopColor: Colors.black,
            borderLeftColor: Colors.black,
            borderRightColor: Colors.white,
            borderBottomColor: Colors.white,
        }
    );

    const innerBorderStyle = Object.assign(
        {},
        styles.innerBorder,
        icon && { width: 12, height: 12 },
        text && { padding: 4 },
        isPressed && {
            borderTopColor: Colors.darkGray,
            borderLeftColor: Colors.darkGray,
            borderRightColor: Colors.lightGray,
            borderBottomColor: Colors.lightGray,
        }
    );

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            style={outerBorderStyle}
        >
            <div
                style={Object.assign(
                    {},
                    isHovering && { backgroundColor: Colors.darkGray },
                    innerBorderStyle
                )}
            >
                {icon && <Icon icon={icon} style={styles.icon} />}
                {text && <p>{text}</p>}
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    outerBorder: {
        border: `1px solid ${Colors.black}`,
        borderTopColor: Colors.white,
        borderLeftColor: Colors.white,
        background: Colors.lightGray,
        cursor: 'pointer',
        userSelect: 'none',
    },
    innerBorder: {
        border: `1px solid ${Colors.darkGray}`,
        borderTopColor: Colors.lightGray,
        borderLeftColor: Colors.lightGray,
        flex: 1,
    },
    icon: {
        pointerEvents: 'none',
    },
};

export default Button;
