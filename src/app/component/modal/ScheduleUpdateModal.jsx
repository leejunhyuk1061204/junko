'use client'

import {useEffect, useRef} from "react";

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

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => {inputRef.current.focus();}, 50);
        }
    }, [open]);

    if (!open) return null;

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
                    className={errors.title ? 'input-error' : ''}
                />

                <label className="label">내용</label>
                <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <label className="label">시작시간</label>
                        <input
                            type="time"
                            value={form.start_time}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        />
                    </div>
                    <div className="flex column gap_10">
                        <label className="label">종료시간</label>
                        <input
                            type="time"
                            value={form.end_time}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        />
                    </div>
                </div>

                <select
                    value={form.label_idx}
                    onChange={(e) => setForm({ ...form, label_idx: e.target.value })}
                >
                    <option value="1">일정</option>
                    <option value="2">연차</option>
                    <option value="3">반차</option>
                    <option value="4">회의</option>
                    <option value="5">외근</option>
                    <option value="6">출장</option>
                    <option value="7">행사</option>
                    <option value="8">중요</option>
                </select>

                <div className="modal-btns">
                    <button className="label" onClick={onClose}>취소</button>
                    <button className="label" onClick={onSubmit}>수정</button>
                </div>
            </div>
        </div>
    );

}