import { Suspense } from 'react';
import AgeGroupProgramsContent from './AgeGroupProgramsContent';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-screen-xl mx-auto flex items-center gap-4">
            <div className="p-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
            <div>
              <div className="h-7 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-gray-200 animate-pulse">
                <div className="h-44 bg-gray-300" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <AgeGroupProgramsContent />
    </Suspense>
  );
}