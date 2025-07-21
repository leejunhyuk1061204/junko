'use client';
import React, {useState} from 'react';
import {TbSearch} from 'react-icons/tb';
import '../../globals.css';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";

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

    const typeOptions = [
        { id: '', name: '전체 유형' },
        { id: '수금', name: '수금' },
        { id: '지급', name: '지급' }
    ];

    const sortByOptions = [
        { id: 'date', name: '일자' },
        { id: 'amount', name: '금액' }
    ];

    const sortOrderOptions = [
        { id: 'desc', name: '내림차순' },
        { id: 'asc', name: '오름차순' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...form, [name]: value };
        setForm(updated);
        onSearch(updated);
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
        <form className="entryList-searchBar" onSubmit={handleSubmit}>
            <Listbox
                value={form.type}
                onChange={(value) => {
                    const updated = { ...form, type: value };
                    setForm(updated);
                    onSearch(updated);
                }}
            >
                <div className="custom-select-wrapper">
                    <ListboxButton className="custom-select-btn">
                        {typeOptions.find(opt => opt.id === form.type)?.name || '전체 유형'}
                    </ListboxButton>
                    <ListboxOptions className="custom-select-options">
                        {typeOptions.map(option => (
                            <ListboxOption
                                key={option.id}
                                value={option.id}
                                className="custom-select-option-item"
                            >
                                {option.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

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
            <span style={{ margin: '0 4px', color: '#666' }}>~</span>
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


            <Listbox
                value={form.sortBy}
                onChange={(value) => {
                    const updated = { ...form, sortBy: value };
                    setForm(updated);
                    onSearch(updated);
                }}
            >
                <div className="custom-select-wrapper">
                    <ListboxButton className="custom-select-btn">
                        {sortByOptions.find(opt => opt.id === form.sortBy)?.name}
                    </ListboxButton>
                    <ListboxOptions className="custom-select-options">
                        {sortByOptions.map(option => (
                            <ListboxOption
                                key={option.id}
                                value={option.id}
                                className="custom-select-option-item"
                            >
                                {option.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

            <Listbox
                value={form.sortOrder}
                onChange={(value) => {
                    const updated = { ...form, sortOrder: value };
                    setForm(updated);
                    onSearch(updated);
                }}
            >
                <div className="custom-select-wrapper">
                    <ListboxButton className="custom-select-btn">
                        {sortOrderOptions.find(opt => opt.id === form.sortOrder)?.name}
                    </ListboxButton>
                    <ListboxOptions className="custom-select-options">
                        {sortOrderOptions.map(option => (
                            <ListboxOption
                                key={option.id}
                                value={option.id}
                                className="custom-select-option-item"
                            >
                                {option.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

            <button type="submit" className="entryList-fabBtn blue" title="검색">
                <TbSearch size={16} />
            </button>
            <button type="button" className="entryList-fabBtn gray" onClick={handleReset}>
                초기화
            </button>
        </form>
    );
};

export default CapSearchBar;
