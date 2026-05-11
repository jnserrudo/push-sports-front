import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-gray-700 shadow-sm animate-pulse">
      {/* Imagen skeleton */}
      <div className="aspect-square bg-neutral-200 dark:bg-gray-700"></div>
      
      {/* Contenido skeleton */}
      <div className="p-4 space-y-3">
        {/* Categoría */}
        <div className="h-3 bg-neutral-200 dark:bg-gray-700 rounded w-1/3"></div>
        
        {/* Nombre */}
        <div className="h-5 bg-neutral-200 dark:bg-gray-700 rounded w-3/4"></div>
        
        {/* Marca */}
        <div className="h-3 bg-neutral-200 dark:bg-gray-700 rounded w-1/2"></div>
        
        {/* Precio */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 bg-neutral-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-neutral-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        
        {/* Stock */}
        <div className="h-3 bg-neutral-200 dark:bg-gray-700 rounded w-2/3"></div>
        
        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-neutral-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-10 bg-neutral-200 dark:bg-gray-700 rounded w-10"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;
