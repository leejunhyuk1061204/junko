'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

export default function CategoryTree({ data, onReorder, onEdit, onDelete }) {
    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        if (Array.isArray(data)) {
            setItems(data);
        }
    }, [data]);

    const flatten = (nodes, parent = null, depth = 0) => {
        return nodes.reduce((acc, node) => {
            acc.push({ ...node, category_parent: parent, depth });
            if (Array.isArray(node.children)) {
                acc = acc.concat(flatten(node.children, node.category_idx, depth + 1));
            }
            return acc;
        }, []);
    };

    const buildTree = (flatList) => {
        const map = {};
        flatList.forEach((item) => {
            map[item.category_idx] = { ...item, children: [] };
        });

        const root = [];
        flatList.forEach((item) => {
            if (item.category_parent === null) {
                root.push(map[item.category_idx]);
            } else {
                const parent = map[item.category_parent];
                if (parent) parent.children.push(map[item.category_idx]);
            }
        });

        return root;
    };

    const findItemById = (id) => flatten(items).find((i) => i.category_idx === id);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const isDescendant = (parentId, targetId, tree) => {
        const findNode = (id, nodes) => {
            for (let node of nodes) {
                if (node.category_idx === id) return node;
                if (node.children) {
                    const found = findNode(id, node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const targetNode = findNode(targetId, tree);
        if (!targetNode) return false;

        const check = (node) => {
            if (!node.children) return false;
            for (let child of node.children) {
                if (child.category_idx === parentId) return true;
                if (check(child)) return true;
            }
            return false;
        };

        return check(targetNode);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const flat = flatten(items);
        const activeItem = flat.find((i) => i.category_idx === active.id);
        const overItem = flat.find((i) => i.category_idx === over.id);
        if (!activeItem || !overItem) return;

        const currentTree = buildTree(flat);
        if (isDescendant(activeItem.category_idx, overItem.category_idx, currentTree)) {
            alert('자기 자신의 하위로 이동할 수 없습니다.');
            return;
        }

        const updatedList = flat.map((item) => {
            if (item.category_idx === activeItem.category_idx) {
                return { ...item, category_parent: overItem.category_idx };
            }
            return item;
        });

        const finalList = updatedList.map((item, idx) => ({
            ...item,
            category_order: idx,
        }));

        setItems(buildTree(finalList));

        const token = sessionStorage.getItem('token');
        try {
            const res = await axios.post('http://localhost:8080/cate/reorder', finalList, {
                headers: { Authorization: token },
            });
            if (res.data.success) alert('순서 및 계층 저장 완료');
            onReorder();
        } catch (err) {
            console.error('계층 저장 실패:', err);
        }
    };

    const renderItem = (item, depth = 0) => (
        <SortableItem
            key={item.category_idx}
            item={item}
            depth={depth}
            renderChild={renderChild}
            onEdit={onEdit}
            onDelete={onDelete}  // 여기 꼭 넘기기!
        />
    );

    const renderChild = (child, depth) => renderItem(child, depth);

    const flatItems = flatten(items);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={flatItems.map(i => i.category_idx)}
                strategy={verticalListSortingStrategy}
            >
                {items.map(item => renderItem(item))}
            </SortableContext>

            <DragOverlay>
                {activeId && (
                    <div style={{ padding: 8, background: '#eee' }}>
                        {findItemById(activeId)?.category_name}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
