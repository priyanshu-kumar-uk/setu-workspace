import React from 'react';
import './Skeletons.css';
export const Skeleton = ({ className = '', style = {} }) => {
  return (
    <div className={`shimmer ${className}`} style={style} />
  );
};
export const SkeletonCard = () => (
  <div className="skeleton-card-layout">
    <Skeleton className="skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '16px' }} />
    <Skeleton className="skeleton-line" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
    <Skeleton className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
    <Skeleton className="skeleton-line" style={{ width: '90%', height: '16px' }} />
  </div>
);
export const SkeletonList = ({ count = 3 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-list-item">
        <Skeleton className="skeleton-avatar" />
        <div className="skeleton-list-content">
          <Skeleton className="skeleton-line" style={{ width: '30%', height: '18px', marginBottom: '8px' }} />
          <Skeleton className="skeleton-line" style={{ width: '60%', height: '14px' }} />
        </div>
      </div>
    ))}
  </div>
);
