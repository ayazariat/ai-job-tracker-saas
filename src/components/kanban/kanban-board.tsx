"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { ApplicationForm } from "./application-form";
import { Button } from "@/components/ui/button";
import { type Application, type ApplicationStatus, COLUMNS, STATUS_CONFIG } from "@/lib/types";

interface KanbanBoardProps {
  initialApplications: Application[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnApps = useCallback(
    (status: ApplicationStatus) =>
      applications.filter((app) => app.status === status).sort((a, b) => a.order - b.order),
    [applications]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id);
    if (app) setActiveApp(app);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    const overId = over.id as string;
    const isColumn = COLUMNS.includes(overId as ApplicationStatus);

    let newStatus: ApplicationStatus;
    if (isColumn) {
      newStatus = overId as ApplicationStatus;
    } else {
      const overApp = applications.find((a) => a.id === overId);
      if (!overApp) return;
      newStatus = overApp.status;
    }

    if (activeApp.status !== newStatus) {
      setApplications((prev) =>
        prev.map((app) => (app.id === active.id ? { ...app, status: newStatus } : app))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const app = applications.find((a) => a.id === active.id);
    if (!app) return;

    try {
      await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: app.status }),
      });
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const handleCreate = async (data: Partial<Application>) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const newApp = await res.json();
      setApplications((prev) => [...prev, newApp]);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create application:", error);
    }
  };

  const handleUpdate = async (data: Partial<Application>) => {
    if (!editingApp) return;
    try {
      const res = await fetch(`/api/applications/${editingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
      setEditingApp(null);
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Applications</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {applications.length} total · Drag cards to update status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Application
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={getColumnApps(status)}
              config={STATUS_CONFIG[status]}
              onEdit={setEditingApp}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp ? <KanbanCard application={activeApp} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {(showForm || editingApp) && (
        <ApplicationForm
          application={editingApp}
          onSubmit={editingApp ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingApp(null);
          }}
        />
      )}
    </div>
  );
}
