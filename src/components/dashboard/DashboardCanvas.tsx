'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { ExpandableSection } from '@/components/dashboard/ExpandableSection';
import type { DashboardWidgetId } from '@/types';
import { cn } from '@/lib/utils';

function SortableItem({
  id,
  editing,
  children,
}: {
  id: DashboardWidgetId;
  editing: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-10 opacity-80',
        editing && 'rounded-xl ring-1 ring-dashed ring-zinc-600'
      )}
    >
      {editing ? (
        <button
          type="button"
          className="absolute left-2 top-2 z-10 rounded bg-zinc-900/90 p-1 text-zinc-400 hover:text-zinc-200"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

interface DashboardCanvasProps {
  ids: DashboardWidgetId[];
  editing: boolean;
  onReorder: (active: DashboardWidgetId, over: DashboardWidgetId) => void;
  render: (id: DashboardWidgetId) => React.ReactNode;
  labels: Record<DashboardWidgetId, string>;
}

export function DashboardCanvas({
  ids,
  editing,
  onReorder,
  render,
  labels,
}: DashboardCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(
      active.id as DashboardWidgetId,
      over.id as DashboardWidgetId
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {ids.map((id) => (
            <SortableItem key={id} id={id} editing={editing}>
              <ExpandableSection
                id={`widget-${id}`}
                title={labels[id]}
                defaultOpen
              >
                {render(id)}
              </ExpandableSection>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
