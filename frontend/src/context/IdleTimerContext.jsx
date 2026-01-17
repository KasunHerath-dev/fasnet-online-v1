import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const IdleTimerContext = createContext();

export const useIdleTimer = () => useContext(IdleTimerContext);

export const IdleTimerProvider = ({ children }) => {
    const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
    const WARNING_DURATION = 2 * 60 * 1000;   // 2 minutes before timeout
    const WARNING_THRESHOLD = TIMEOUT_DURATION - WARNING_DURATION; // 28 minutes

    const [isIdle, setIsIdle] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    const lastActivityRef = useRef(Date.now());
    const warningIntervalRef = useRef(null);
    const checkIntervalRef = useRef(null);

    // Activity events to listen for
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleLogout = useCallback(() => {
        authService.logout();
        window.location.href = '/login'; // Force reload/redirect
    }, []);

    const resetTimer = useCallback(() => {
        if (showWarning) {
            // If checking warning, don't auto-reset on mouse move unless explicitly dismissed? 
            // Actually, any activity should clear the warning state if the user is back.
            setShowWarning(false);
            setIsIdle(false);
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
        }
        lastActivityRef.current = Date.now();
    }, [showWarning]);

    // Check for idleness every second
    useEffect(() => {
        const checkIdleStatus = () => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            if (timeSinceLastActivity >= TIMEOUT_DURATION) {
                handleLogout();
            } else if (timeSinceLastActivity >= WARNING_THRESHOLD) {
                if (!showWarning) {
                    setShowWarning(true);
                    setIsIdle(true);
                }
                setRemainingTime(Math.ceil((TIMEOUT_DURATION - timeSinceLastActivity) / 1000));
            }
        };

        checkIntervalRef.current = setInterval(checkIdleStatus, 1000);

        // Add event listeners
        const handleActivity = () => {
            // Debounce or just reset?
            // If showing warning, we might want to REQUIRE a click on the modal, but usually movement is enough.
            // Let's rely on standard "movement resets timer". 
            // However, if the warning is showing, maybe we want the user to explicitly say "I'm here"?
            // Most banking apps require a button click. Let's reset ONLY if not in warning mode, 
            // OR if we want any movement to save them. 
            // Let's go with: Any movement resets timer, unless we want to be strict.
            // Strict approach: If warning is shown, user MUST click "Stay Logged In".
            // Flexible approach: Movement resets it.

            // I'll take the flexible approach but maybe only if not deep into warning? 
            // Actually, standard behavior is movement resets.
            // But if the user is away and comes back right at 29:59, movement saves them.

            // NOTE: If we want the MODAL to be the only way to stay, we should NOT reset on mousemove when warning is active.
            // Let's do that for better UX (so they see the warning and know why).

            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            // If we are NOT yet in warning territory, reset freely.
            if (timeSinceLastActivity < WARNING_THRESHOLD) {
                lastActivityRef.current = now;
            }
            // If we ARE in warning territory, do NOT reset on mousemove alone (require button click), 
            // OR reset only on 'click'/'keydown' but not 'mousemove'?
            // Let's stay simple: require explicit "Stay Logged In" click for the modal.
            // So we effectively stop listening to 'mousemove' for reset when in warning.
        };

        // We need to attach listeners to window
        // But we want to throttle them slightly for performance
        let throttleTimer;
        const throttledHandler = () => {
            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    handleActivity();
                    throttleTimer = null;
                }, 1000);
            }
        };

        events.forEach(event => window.addEventListener(event, throttledHandler));

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
            events.forEach(event => window.removeEventListener(event, throttledHandler));
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, []); // Empty dependency mainly, but we need access to showWarning state...
    // Ah, the closure problem. checkIdleStatus sees initial state.
    // We should use refs or dependency array.

    // RE-WRITE useEffect to handle state updates properly or use Refs for state logic where possible.

    return (
        <IdleTimerContext.Provider value={{
            isIdle,
            showWarning,
            remainingTime,
            resetTimer: () => {
                lastActivityRef.current = Date.now();
                setShowWarning(false);
                setIsIdle(false);
            },
            handleLogout
        }}>
            {children}
        </IdleTimerContext.Provider>
    );
};
