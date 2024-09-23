import { useState, useCallback, useRef, useEffect } from 'react';

interface Offset {
    x: number;
    y: number;
}

export const useScroll = (initialOffset: Offset = { x: 0, y: 0 }) => {
    const [offset, setOffset] = useState<Offset>(initialOffset);
    const isDraggingRef = useRef(false);
    const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);

    const updateOffset = useCallback((dx: number, dy: number) => {
        setOffset(prev => ({
            x: Math.min(0, prev.x + dx),
            y: Math.min(0, prev.y + dy)
        }));
    }, []);

    const handleMouseDown = useCallback((e: MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
            isDraggingRef.current = true;
            lastPositionRef.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current && lastPositionRef.current) {
            const dx = e.clientX - lastPositionRef.current.x;
            const dy = e.clientY - lastPositionRef.current.y;

            updateOffset(dx, dy);

            lastPositionRef.current = { x: e.clientX, y: e.clientY };
        }
    }, [updateOffset]);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        lastPositionRef.current = null;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        updateOffset(-Math.round(e.deltaX), -Math.round(e.deltaY));
    }, [updateOffset]);

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            element.addEventListener('mousedown', handleMouseDown);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('mouseup', handleMouseUp);
            element.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
                element.removeEventListener('mousedown', handleMouseDown);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('mouseup', handleMouseUp);
                element.removeEventListener('wheel', handleWheel);
            };
        }
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

    return { offset, ref: elementRef };
};