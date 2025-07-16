'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryList from "./categoryList";
import CategoryForm from "./categoryForm";
import Header from "@/app/header";

export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [reload, setReload] = useState(false);
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        axios.get("http://localhost:8080/cate/tree", {
            headers: { Authorization: token },
        })
            .then((res) => {
                setCategories(res.data.list);
            })
            .catch((err) => {
                console.error("카테고리 불러오기 실패:", err);
            });
    }, [reload]);

    const flattenWithDepth = (nodes, depth = 0) => {
        return nodes.reduce((acc, node) => {
            acc.push({ ...node, depth });
            if (Array.isArray(node.children) && node.children.length > 0) {
                acc = acc.concat(flattenWithDepth(node.children, depth + 1));
            }
            return acc;
        }, []);
    };

    // 삭제 함수
    const handleDelete = async (category_idx) => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await axios.delete('http://localhost:8080/cate/delete', {
                headers: { Authorization: token },
                data: { category_idx },
            });
            if (res.data.success) {
                alert("삭제 완료");
                setReload(!reload);
                setEditItem(null);
            } else {
                alert(res.data.message || "삭제 실패");
            }
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제 중 오류 발생");
        }
    };

    return (
        <div className="wrap page-background">
            <Header />
            <h2 className="category-title">카테고리 관리</h2>
            <div className="category-container">
                <div className="category-left margin-left-20">
                    <CategoryList
                        data={categories}
                        onChange={() => setReload(!reload)}
                        onEdit={(item) => setEditItem(item)}
                        onDelete={handleDelete}
                    />
                </div>
                <div className="category-right">
                    <CategoryForm
                        data={flattenWithDepth(categories)}
                        onSuccess={() => {
                            setReload(!reload);
                            setEditItem(null); // 수정 종료
                        }}
                        editItem={editItem}
                        setEditItem={setEditItem}
                    />
                </div>
            </div>
        </div>
    );
}
