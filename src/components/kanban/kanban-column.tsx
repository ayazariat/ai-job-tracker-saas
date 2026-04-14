"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { type Application, type ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  config: { label: string; color: string; bgColor: string };
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ status, applications, config, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 min-w-[288px] flex-col rounded-xl border p-3 transition-colors",
        config.bgColor,
        isOver && "ring-2 ring-indigo-400"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-sm font-semibold", config.color)}>{config.label}</h3>
          <span className={cn("inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/60 px-1.5 text-xs font-medium dark:bg-black/20", config.color)}>
            {applications.length}
          </span>
        </div>
      </div>

      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 min-h-[100px]">
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onEdit={() => onEdit(app)}
              onDelete={() => onDelete(app.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
