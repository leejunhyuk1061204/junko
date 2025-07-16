'use client'

import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryList from "./categoryList";
import CategoryForm from "./categoryForm";
import Header from "@/app/header";

export default function CategoryPage() {
    const [categories, setCategories] = useState([]);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        axios.get("http://localhost:8080/cate/tree", {
            headers: { Authorization: token },
        })
            .then((res) => {
                console.log("카테고리 응답", res.data);
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

    return (
        <div className="wrap page-background">
            <Header />
            <h2 className="category-title">카테고리 관리</h2>
            <div className="category-container">
                <div className="category-left margin-left-20">
                    <CategoryList data={categories} onChange={() => setReload(!reload)} />
                </div>
                <div className="category-right">
                    <CategoryForm
                        data={flattenWithDepth(categories)}
                        onSuccess={() => setReload(!reload)}
                    />
                </div>
            </div>
        </div>
    );
}