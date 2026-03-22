import React from 'react';

export const Skeleton = ({ className = '', variant = 'default' }) => {
    const variants = {
        default: 'h-4 bg-neutral-200',
        title: 'h-8 bg-neutral-300 w-1/3',
        text: 'h-3 bg-neutral-200',
        card: 'h-48 bg-neutral-200 rounded-xl',
        circle: 'w-12 h-12 rounded-full bg-neutral-200',
        button: 'h-10 bg-neutral-200 rounded-lg w-32'
    };
    
    return (
        <div className={`animate-pulse ${variants[variant]} ${className}`} />
    );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <Skeleton key={j} className="flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonCard = () => (
    <div className="bg-white rounded-xl p-6 space-y-4">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-2/3" />
        <Skeleton variant="text" className="w-1/2" />
        <div className="flex gap-2 mt-4">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
        </div>
    </div>
);
