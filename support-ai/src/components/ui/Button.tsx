'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
};

const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
};

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled,
    children,
    className = '',
    onClick,
    type = 'button',
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            className={`btn ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={isDisabled}
            onClick={onClick}
            whileHover={!isDisabled ? { scale: 1.02 } : undefined}
            whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        >
            {loading ? (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
                </>
            )}
        </motion.button>
    );
}

// Icon Button variant
interface IconButtonProps {
    icon: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    tooltip?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const iconSizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
};

export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    tooltip,
    className = '',
    onClick,
    disabled,
}: IconButtonProps) {
    return (
        <motion.button
            type="button"
            className={`btn ${variantStyles[variant]} ${iconSizeStyles[size]} rounded-lg ${className}`}
            title={tooltip}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
            {icon}
        </motion.button>
    );
}
