"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { type Application } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  application: Application;
  isOverlay?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function KanbanCard({ application, isOverlay, onEdit, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasUpcomingReminders = application.reminders?.some(
    (r) => !r.sent && new Date(r.sendAt) > new Date()
  );

  const daysAgo = application.appliedAt
    ? Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900",
        isDragging && "opacity-50",
        isOverlay && "rotate-3 shadow-xl"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {application.company}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {application.role}
          </p>
        </div>
        {hasUpcomingReminders && (
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-xs" title="Reminder set">
            🔔
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {application.salaryRange && (
          <Badge variant="secondary" className="text-[10px]">
            {application.salaryRange}
          </Badge>
        )}
        {application.source && (
          <Badge variant="outline" className="text-[10px]">
            {application.source}
          </Badge>
        )}
        {daysAgo !== null && (
          <Badge variant="secondary" className="text-[10px]">
            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
          </Badge>
        )}
      </div>

      {application.deadline && (
        <p className="mt-2 text-[10px] text-zinc-400">
          Deadline: {new Date(application.deadline).toLocaleDateString()}
        </p>
      )}

      {/* Action buttons on hover */}
      <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="rounded px-2 py-1 text-[10px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="rounded px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
