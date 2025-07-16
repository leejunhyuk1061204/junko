'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ item, depth = 0, renderChild, onEdit, onDelete }) {
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
        <div key={item.category_idx}>
            <div className="category-container" style={{ margin :"0", width: "700px" , gap:"10px" }}>
            {/* 드래그 가능한 영역 */}
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
                >
                    =
                </span>
                <span>{item.category_name}</span>
            </div>

                <button className="cate-btn" onClick={() => onEdit(item)} style={{ marginRight: 8 , marginTop: 6}}>
                    수정
                </button>
                <button className="cate-del-btn" onClick={() => onDelete(item.category_idx)} style={{ marginTop: 6 }}>
                    삭제
                </button>
            </div>

            {(item.children || []).map((child) =>
                renderChild(child, depth + 1, onEdit, onDelete)
            )}
        </div>
    );
}
