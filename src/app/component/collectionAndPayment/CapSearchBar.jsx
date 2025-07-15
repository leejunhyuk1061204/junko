'use client';
import React, { useState } from 'react';
import '../../globals.css'

const CapSearchBar = ({ onSearch }) => {
    const [form, setForm] = useState({
        type: '',
        keyword: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        sortBy: 'date',
        sortOrder: 'desc',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(form);
    };

    const handleReset = () => {
        const reset = {
            type: '',
            keyword: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            sortBy: 'date',
            sortOrder: 'desc',
        };
        setForm(reset);
        onSearch(reset);
    };

    return (
        <form className="cap-search-bar" onSubmit={handleSubmit}>
            <select name="type" value={form.type} onChange={handleChange}>
                <option value="">전체</option>
                <option value="수금">수금</option>
                <option value="지급">지급</option>
            </select>

            <input
                type="text"
                name="keyword"
                value={form.keyword}
                placeholder="거래처 / 메모"
                onChange={handleChange}
            />

            <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
            />
            <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
            />

            <input
                type="number"
                name="minAmount"
                value={form.minAmount}
                placeholder="최소금액"
                onChange={handleChange}
            />
            <input
                type="number"
                name="maxAmount"
                value={form.maxAmount}
                placeholder="최대금액"
                onChange={handleChange}
            />

            <select name="sortBy" value={form.sortBy} onChange={handleChange}>
                <option value="date">일자</option>
                <option value="amount">금액</option>
            </select>

            <select name="sortOrder" value={form.sortOrder} onChange={handleChange}>
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
            </select>

            <button type="submit">🔍 검색</button>
            <button type="button" onClick={handleReset}>↩ 초기화</button>
        </form>
    );
};

export default CapSearchBar;