'use client'

import {useEffect, useRef} from "react";
import {useTimePickerStore} from "@/app/zustand/store";
import "../../globals.css";
import TimeSelect from "@/app/component/schedule/TimeSelect";

export default function ScheduleUpdateModal({
    open,
    form,
    setForm,
    onSubmit,
    onClose,
    errors,
    setErrors,
}) {
    const inputRef = useRef(null);
    const LABEL_OPTIONS = [
        { label: '일정', value: '1' },
        { label: '연차', value: '2' },
        { label: '반차', value: '3' },
        { label: '회의', value: '4' },
        { label: '외근', value: '5' },
        { label: '출장', value: '6' },
        { label: '행사', value: '7' },
        { label: '중요', value: '8' },
    ];
    const workLabels = [2, 3, 5, 6];

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => {inputRef.current.focus();}, 50);
        }
    }, [open]);

    if (!open) return null;

    const handleLabelChange = (e) => {
        const selectedValue = parseInt(e.target.value, 10);

        setForm(prev => ({
            ...prev,
            label_idx: selectedValue,
            title: workLabels.includes(selectedValue) ? '' : prev.title,
        }));
    };

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-custom-modal" onClick={(e) => e.stopPropagation()}>
                <h4>일정 수정</h4>
                <label className="label">제목</label>
                <input
                    ref={inputRef}
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                        setForm({ ...form, title: e.target.value });
                        setErrors({ ...errors, title: false });
                    }}
                    className="title-input"
                />
                <label className="label">내용</label>
                <input
                    type="textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="description-input"
                />
                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <label className="label">시작시간</label>
                        <TimeSelect
                            value={form.start_time}
                            onChange={(value) => setForm({ ...form, start_time: value })}
                            menuPlacement="auto"
                            menuPosition="absolute"
                        />
                    </div>
                    <div className="flex column gap_10">
                        <label className="label">종료시간</label>
                        <TimeSelect
                            value={form.end_time}
                            onChange={(value) => setForm({ ...form, end_time: value })}
                            menuPlacement="auto"
                            menuPosition="absolute"
                        />
                    </div>
                </div>
                <select
                    className="label-opt-opt"
                    value={form.label_idx}
                    onChange={handleLabelChange}
                >
                    {LABEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="opt-menu">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="modal-btns">
                    <button className="label" onClick={onClose}>취소</button>
                    <button className="label" onClick={onSubmit}>수정</button>
                </div>
            </div>
        </div>
    );

}