import React from 'react'

interface LoadingSkeletonProps {
  className?: string
  height?: string
  width?: string
  rounded?: boolean
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full',
  rounded = true 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${height} ${width} ${rounded ? 'rounded' : ''} ${className}`}
    />
  )
}

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LoadingSkeleton height="h-4" width="w-24" />
          <LoadingSkeleton height="h-8" width="w-16" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2">
                <LoadingSkeleton height="h-5" width="w-32" />
                <div className="flex space-x-4">
                  <LoadingSkeleton height="h-4" width="w-24" />
                  <LoadingSkeleton height="h-4" width="w-20" />
                  <LoadingSkeleton height="h-4" width="w-28" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right space-y-2">
                <LoadingSkeleton height="h-6" width="w-16" />
                <LoadingSkeleton height="h-4" width="w-24" />
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
          <LoadingSkeleton height="h-6" width="w-32" />
        </div>
        <LoadingSkeleton height="h-4" width="w-48" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}

