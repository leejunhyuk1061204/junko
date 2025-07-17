'use client'

import {useEffect, useRef} from "react";
import format from "date-fns/format";

export default function ScheduleInsertModal ({
    open,
    form,
    setForm,
    errors = {},
    setErrors = () => {},
    onSubmit = () => {},
    onClose = () => {},
    dateInfo = null,
    inputRef = null,
}) {
    const modalRef = useRef(null);

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

    useEffect(() => {
        if (open && inputRef?.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [open, inputRef]);

    if (!open) return null;

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-custom-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <h4>일정 등록</h4>
                {dateInfo && (
                    <>
                        <label className="label">날짜</label>
                        <div className="label" style={{ marginBottom: 8 }}>
                            {format(dateInfo.start, 'yyyy-MM-dd') === format(dateInfo.end, 'yyyy-MM-dd')
                                ? format(dateInfo.start, 'yyyy-MM-dd')
                                : `${format(dateInfo.start, 'yyyy-MM-dd')} ~ ${format(dateInfo.end, 'yyyy-MM-dd')}`}
                        </div>
                    </>
                )}
                <label className="label">제목</label>
                <input
                    ref={inputRef}
                    type="text"
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={errors.title ? 'input-error' : ''}
                />
                <label className="label">내용</label>
                <input
                    type="text"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <label className="label">시작시간</label>
                        <input
                            type="time"
                            value={form.start_time || ''}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        />
                    </div>
                    <div className="flex column gap_10">
                        <label className="label">종료시간</label>
                        <input
                            type="time"
                            value={form.end_time || ''}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        />
                    </div>
                </div>

                <select
                    className="label"
                    value={form.label_idx || 1}
                    onChange={(e) => setForm({ ...form, label_idx: e.target.value })}
                >
                    {LABEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="modal-btns">
                    <button className="label" onClick={onClose}>취소</button>
                    <button className="label" onClick={onSubmit}>등록</button>
                </div>
            </div>
        </div>
    );

};