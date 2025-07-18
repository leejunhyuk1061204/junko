'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CategoryForm({ data = [], onSuccess, editItem, setEditItem }) {
    const [name, setName] = useState("");
    const [parent, setParent] = useState("");

    useEffect(() => {
        if (editItem) {
            setName(editItem.category_name);
            setParent(editItem.category_parent || "");
        } else {
            setName("");
            setParent("");
        }
    }, [editItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token");

        const payload = {
            category_name: name,
            category_parent: parent || null,
        };

        if (editItem) {
            // 수정 모드
            payload.category_idx = editItem.category_idx;
            const res = await axios.put("http://localhost:8080/cate/update", {
                headers: { Authorization: sessionStorage.getItem("token") },
            });
            const data = res.data;
            if (data.success) {
                alert("수정 완료");
                setEditItem(null); // 수정 모드 종료
                onSuccess();
            } else {
                alert("수정 실패");
            }
        } else {
            // 등록 모드
            const res = await axios.post("http://localhost:8080/cate/insert", {
                    Authorization: sessionStorage.getItem("token"),
            });
            const data = res.data;
            if (data.success) {
                alert("등록 완료");
                setName("");
                setParent("");
                onSuccess();
            } else {
                alert("등록 실패");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="margin-bottom-10 font-bold" style={{ fontSize: "18px"}}>{editItem ? "카테고리 수정" : "카테고리 등록"}</h3>
            <input
                type="text"
                style={{ width: "50%", marginRight: "10px", height: "25px" }}
                placeholder="카테고리 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <select
                className="category-select"
                style={{ border: "1px solid #ccc", borderRadius: "3px", width: "150px", height: "25px" }}
                value={parent}
                onChange={(e) => setParent(e.target.value)}
            >
                <option value="">상위 카테고리 없음</option>
                {data
                    .filter(cat => !editItem || cat.category_idx !== editItem.category_idx)
                    .map((cat) => (
                        <option key={cat.category_idx} value={cat.category_idx}>
                            {'—'.repeat(cat.depth)} {cat.category_name}
                        </option>
                    ))}
            </select>
            <button type="submit" className="product-btn margin-left-10" style={{ height: "16px" }}>
                {editItem ? "수정" : "추가"}
            </button>
            {editItem && (
                <button
                    className="btn"
                    type="button"
                    onClick={() => setEditItem(null)}
                >
                    취소
                </button>
            )}
        </form>
    );
}
