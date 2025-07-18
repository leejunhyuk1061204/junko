'use client'

import {useEffect, useRef} from "react";
import format from "date-fns/format";

export default function ScheduleDetailModal ({
    open,
    onClose,
    onEditClick,
    onDelete,
    event,
}) {
    const modalRef = useRef(null);

    if (!open || !event) return null;

    const data = event.resource || {};
    const start = event.start;
    const end = event.end;

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-custom-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <h4>일정 상세</h4>

                <label className="label">날짜</label>
                <div className="label" style={{ marginBottom: 8 }}>
                    {format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')
                        ? format(start, 'yyyy-MM-dd')
                        : `${format(start, 'yyyy-MM-dd')} ~ ${format(end, 'yyyy-MM-dd')}`}
                </div>

                <label className="label">제목</label>
                <div className="label">{data.title}</div>

                <label className="label">내용</label>
                <div className="label">{data.description || '-'}</div>

                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <label className="label">시작시간</label>
                        <div className="label">{data.start_time || '-'}</div>
                    </div>
                    <div className="flex column gap_10">
                        <label className="label">종료시간</label>
                        <div className="label">{data.end_time || '-'}</div>
                    </div>
                </div>

                <label className="label">상태</label>
                <div className="label">{data.label || '일정'}</div>

                <div className="modal-btns">
                    <button className="label" onClick={onClose}>닫기</button>
                    <button className="label" onClick={onEditClick}>수정</button>
                    <button className="label" style={{ backgroundColor: '#d9534f', color: 'white' }} onClick={onDelete}>삭제</button>
                </div>
            </div>
        </div>
    );

};