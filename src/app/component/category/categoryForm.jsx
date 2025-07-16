'use client'

import React, { useState } from "react";

export default function CategoryForm({ data = [], onSuccess }) {
    const [name, setName] = useState("");
    const [parent, setParent] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:8080/cate/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ category_name: name, category_parent: parent || null }),
        });
        const result = await res.json();
        if (result.success) {
            setName("");
            setParent("");
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    style={{ width: "60%" , marginRight: "10px" , height: "25px"}}
                    placeholder="카테고리 이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <select style={{ border: "1px solid #ccc", borderRadius: "3px" , width: "150px" , height: "25px"}} value={parent} onChange={(e) => setParent(e.target.value)}>
                    <option value="">상위 카테고리 없음</option>
                    {data.map((cat) => (
                        <option key={cat.category_idx} value={cat.category_idx}>
                            {'—'.repeat(cat.depth)} {cat.category_name}
                        </option>
                    ))}
                </select>
                <button type="submit" className="product-btn margin-left-10" style={{ height: "16px" }}>추가</button>
        </form>
    );
}