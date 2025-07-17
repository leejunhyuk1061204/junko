'use client'

import {useEffect, useRef} from "react";
import format from "date-fns/format";

const LABEL_OPTIONS = [
    { label: '일정', value: '1' },
    { label: '연차', value: '2' },
    { label: '반차', value: '3' },
    { label: '회의', value: '4' },
    { label: '외근', value: '5' },
    { label: '출장', value: '6' },
    { label: '행사', value: '7' },
    { label: '중요', value: '8' },
]

export default function ScheduleModal({
    open,
    mode = 'insert', // insert | update | detail
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

    useEffect(() => {
        if (open && inputRef?.current && mode !== 'detail') {
            setTimeout(() => {
                inputRef.current.focus();
            }, 50);
        }
    }, [open, inputRef, mode]);

    if (!open) return null;

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-custom-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <h4>{mode === 'insert' ? '일정 추가' : mode === 'update' ? '일정 수정' : '일정 상세'}</h4>

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
                    disabled={mode === 'detail'}
                />

                <label className="label">내용</label>
                <input
                    type="text"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    disabled={mode === 'detail'}
                />

                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <label className="label">시작시간</label>
                        <input
                            type="time"
                            value={form.start_time || ''}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                            disabled={mode === 'detail'}
                        />
                    </div>
                    <div className="flex column gap_10">
                        <label className="label">종료시간</label>
                        <input
                            type="time"
                            value={form.end_time || ''}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                            disabled={mode === 'detail'}
                        />
                    </div>
                </div>

                <label className="label">상태</label>
                <select
                    className="label"
                    value={form.label_idx || '1'}
                    onChange={(e) => setForm({ ...form, label_idx: e.target.value })}
                    disabled={mode === 'detail'}
                >
                    {LABEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="label">
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className="modal-btns">
                    <button className="label" onClick={onClose}>닫기</button>
                    {mode !== 'detail' && (
                        <button className="label" onClick={onSubmit}>
                            {mode === 'insert' ? '등록' : '수정'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


