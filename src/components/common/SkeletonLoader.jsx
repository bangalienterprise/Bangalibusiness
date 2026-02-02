
import React from 'react';
import { Skeleton } from "@/components/ui/skeletons";

const SkeletonLoader = ({ variant = "row", count = 3 }) => {
    if (variant === "card") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array(count).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
                        <Skeleton className="h-4 w-1/2 mb-4 bg-slate-800" />
                        <Skeleton className="h-8 w-3/4 bg-slate-800" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "table-row") {
        return (
            <>
                {Array(count).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800">
                        <td className="p-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-48 bg-slate-800" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                    </tr>
                ))}
            </>
        );
    }
    
    if (variant === "list") {
        return (
            <div className="space-y-3">
                 {Array(count).fill(0).map((_, i) => (
                     <div key={i} className="flex items-center space-x-4">
                         <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-[250px] bg-slate-800" />
                             <Skeleton className="h-4 w-[200px] bg-slate-800" />
                         </div>
                     </div>
                 ))}
            </div>
        );
    }

    return null;
};

export default SkeletonLoader;
