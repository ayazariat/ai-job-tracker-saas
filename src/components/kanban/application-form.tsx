"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Application, type ApplicationStatus, COLUMNS, STATUS_CONFIG } from "@/lib/types";

interface ApplicationFormProps {
  application?: Application | null;
  onSubmit: (data: Partial<Application>) => void;
  onClose: () => void;
}

export function ApplicationForm({ application, onSubmit, onClose }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    company: application?.company || "",
    role: application?.role || "",
    status: application?.status || ("WISHLIST" as ApplicationStatus),
    salaryRange: application?.salaryRange || "",
    source: application?.source || "",
    url: application?.url || "",
    deadline: application?.deadline ? new Date(application.deadline).toISOString().split("T")[0] : "",
    notes: application?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      appliedAt: formData.status !== "WISHLIST" ? new Date().toISOString() : null,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{application ? "Edit Application" : "New Application"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Company *</label>
              <Input
                required
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role *</label>
              <Input
                required
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Senior Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ApplicationStatus }))}
              >
                {COLUMNS.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Salary Range</label>
              <Input
                value={formData.salaryRange}
                onChange={(e) => setFormData((prev) => ({ ...prev, salaryRange: e.target.value }))}
                placeholder="e.g. $120k-$150k"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Source</label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
                placeholder="e.g. LinkedIn, Referral"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Job URL</label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any notes about this application..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {application ? "Update" : "Create"} Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
