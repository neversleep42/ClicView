'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Get stored theme or default to 'dark'
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) {
            setThemeState(stored);
        } else {
            // Default to dark mode for this app
            setThemeState('dark');
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;

        const resolveTheme = (): 'light' | 'dark' => {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme;
        };

        const resolved = resolveTheme();
        setResolvedTheme(resolved);

        // Remove both classes first
        root.classList.remove('light', 'dark');
        // Add the resolved theme class
        root.classList.add(resolved);

        // Store the preference
        localStorage.setItem('theme', theme);

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const newResolved = mediaQuery.matches ? 'dark' : 'light';
                setResolvedTheme(newResolved);
                root.classList.remove('light', 'dark');
                root.classList.add(newResolved);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'dark') return 'light';
            if (prev === 'light') return 'dark';
            // If system, toggle to the opposite of resolved
            return resolvedTheme === 'dark' ? 'light' : 'dark';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
