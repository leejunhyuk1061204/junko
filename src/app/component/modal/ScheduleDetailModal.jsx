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
    const user_idx = parseInt((typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0), 10);

    const data = event.resource || {};
    const start = event.start;
    const end = event.end;

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div className="schedule-custom-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <h4>일정 상세</h4>
                <div className="label" style={{ marginBottom: 8 }}>
                    {format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')
                        ? format(start, 'yyyy-MM-dd')
                        : `${format(start, 'yyyy-MM-dd')} ~ ${format(end, 'yyyy-MM-dd')}`}
                </div>
                <div className="label" style={{fontSize: '16px', fontWeight: 'bold'}}>{data.title}</div>
                {event?.resource?.label_idx !== 1 && (
                    <p className="writer">작성자 : {event?.resource?.user}</p>
                )}
                <div className="label" style={{fontSize: '13px'}}>{data.description || '-'}</div>
                <div className="flex gap_10">
                    <div className="flex column gap_10">
                        <div className="label">{data.start_time || ''} - {data.end_time || ''}</div>
                    </div>
                </div>
                <div className="label" style={{fontSize: '14px'}}>[{data.label_name}]</div>
                <div className="modal-btns">
                    <button className="label" onClick={onClose}>닫기</button>
                    {event?.resource?.user_idx === user_idx && (
                        <button className="label" style={{ backgroundColor: '#B22222', color: '#EEEEEE' }} onClick={onDelete}>삭제</button>
                    )}
                    <button className="label" onClick={onEditClick}>수정</button>

                </div>
            </div>
        </div>
    );

};