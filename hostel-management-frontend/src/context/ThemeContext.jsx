/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { ThemeContext, useTheme } from './ThemeContextCore';
export { useTheme, ThemeContext };

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference
    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPrefs = window.localStorage.getItem('color-theme');
            if (typeof storedPrefs === 'string') {
                return storedPrefs;
            }
            const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (userMedia.matches) {
                return 'dark';
            }
        }
        return 'light'; // default theme
    };

    const [theme, setTheme] = useState(getInitialTheme);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('color-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
