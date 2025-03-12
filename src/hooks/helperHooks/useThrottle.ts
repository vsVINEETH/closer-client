import { useEffect, useState } from "react";

export function useThrottle<T>(value: T, delay = 500): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const [lastCallTime, setLastCallTime] = useState<number>(Date.now());

    useEffect(() => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall >= delay) {
            setThrottledValue(value);
            setLastCallTime(now);
        } else {
            const timer = setTimeout(() => {
                setThrottledValue(value);
                setLastCallTime(Date.now());
            }, delay - timeSinceLastCall);

            return () => clearTimeout(timer);
        }
    }, [value, delay, lastCallTime]);

    return throttledValue;
}
