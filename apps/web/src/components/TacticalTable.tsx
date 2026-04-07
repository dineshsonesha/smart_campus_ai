import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TacticalTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function TacticalTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
}: TacticalTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar border border-white/5 bg-bg-card/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={cn(
                  "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-white/10 animate-pulse uppercase tracking-widest text-[11px]">
                Decrypting Data Stream...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-white/5 uppercase tracking-widest text-[11px]">
                No Records Found in Database
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-colors hover:bg-white/[0.03]",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "px-6 py-4 text-[12px] font-mono text-gray-300 group-hover:text-white",
                      col.className
                    )}
                  >
                    {(() => {
                      try {
                        return typeof col.accessor === 'function'
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode);
                      } catch (err) {
                        console.error('[TacticalTable] Error rendering cell:', err);
                        return <span className="text-red-500/50 italic text-[10px]">Render Error</span>;
                      }
                    })()}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
