'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ item, depth = 0, renderChild }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.category_idx });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div key={item.category_idx} className="category-row">
            <div
                ref={setNodeRef}
                style={style}
                className={`category-item ${isDragging ? 'dragging' : ''}`}
                {...attributes}
                {...listeners}
            >
                <span
                    className="depth-indent"
                    style={{ marginLeft: depth * 16 }}
                > =
                </span>
                <span>{item.category_name}</span>
            </div>
            {(item.children || []).map((child) =>
                renderChild(child, depth + 1)
            )}
        </div>
    );
}
