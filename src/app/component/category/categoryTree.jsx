// CategoryTree.jsx
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

export default function CategoryTree({ data, onReorder }) {
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
            acc.push({
                ...node,
                category_parent: parent, // 부모 설정
                depth, // 깊이 설정
            });
            if (Array.isArray(node.children) && node.children.length > 0) {
                acc = acc.concat(flatten(node.children, node.category_idx, depth + 1)); // 자식에 대해서 재귀 호출
            }
            return acc;
        }, []);
    };

    const buildTree = (flatList) => {
        const map = {};
        flatList.forEach((item) => {
            map[item.category_idx] = { ...item, children: [] }; // 각 항목을 키로 하여 map에 저장
        });

        const root = [];
        flatList.forEach((item) => {
            if (item.category_parent === null) {
                root.push(map[item.category_idx]); // 최상위 아이템은 root에 추가
            } else {
                const parent = map[item.category_parent]; // 부모를 찾아서
                if (parent) parent.children.push(map[item.category_idx]); // 부모의 children 배열에 자식 추가
            }
        });

        return root;
    };

    const findItemById = (id) => flatten(items).find((i) => i.category_idx === id);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const flat = flatten(items);
        const activeItem = flat.find((i) => i.category_idx === active.id);
        const overItem = flat.find((i) => i.category_idx === over.id);

        if (!activeItem || !overItem) return;

        // 1번 밑으로 이동시키려면, overItem의 category_idx를 activeItem의 category_parent로 설정
        const updatedList = flat.map((item) => {
            if (item.category_idx === activeItem.category_idx) {
                return {
                    ...item,
                    category_parent: overItem.category_idx, // 부모를 overItem의 category_idx로 설정
                };
            }
            return item;
        });

        // category_order는 인덱스를 기준으로 갱신
        const finalList = updatedList.map((item, idx) => ({
            ...item,
            category_order: idx, // 순서 업데이트
        }));

        console.log('최종 리스트:', finalList);  // 서버로 보내는 데이터 확인

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
            renderChild={renderItem}
        />
    );

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
                {items.map((item) => renderItem(item))}
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
