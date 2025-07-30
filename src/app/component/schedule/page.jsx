'use client'

import Header from "@/app/header";
import '../../globals.css';
import "react-big-calendar/lib/css/react-big-calendar.css";
import {useCallback, useEffect, useRef, useState} from "react";
import {Calendar, dateFnsLocalizer, momentLocalizer} from "react-big-calendar";
import {useRouter} from "next/navigation";
import {useAlertModalStore, useTimePickerStore} from "@/app/zustand/store";
import axios from "axios";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import addDays from "date-fns/addDays";
import CustomToolbar from "./CustomToolbar";
import ko from "date-fns/locale/ko";
import ScheduleUpdateModal from "../modal/ScheduleUpdateModal";
import ScheduleInsertModal from "../modal/ScheduleInsertModal";
import ScheduleDetailModal from "../modal/ScheduleDetailModal";

const locales = {'ko': ko,};
const localizer = dateFnsLocalizer({format, parse, startOfWeek, getDay, locales,});

const user_id = typeof window !== "undefined" ? sessionStorage.getItem("loginId") : "";

export default function SchedulePage() {

    const router = useRouter();
    const {openModal} = useAlertModalStore();
    const {closeTimePicker} = useTimePickerStore();

    const [event, setEvent] = useState([]);
    const [inputInfo, setInputInfo] = useState({open: false, start: null, end: null, x: 0, y: 0});
    const [form, setForm] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        label_idx: 1,
    });
    const [detailInfo, setDetailInfo] = useState({open:false, event:null, x:0, y:0});
    const [editForm, setEditForm] = useState(null);
    const [view, setView] = useState('month');

    // 에러 상태
    const [errors, setErrors] = useState({});
    const inputRef = useRef();
    const inputModalRef = useRef(null);
    const detailModalRef = useRef(null);

    const LABEL_COLORS = {
        1: '#90A4AE', // 일정
        2: '#D6BFA7', // 연차
        3: '#D6BFA7', // 반차
        4: '#AED9B4', // 회의
        5: '#D6BFA7', // 외근
        6: '#D6BFA7', // 출장
        7: '#AED9B4', // 행사
        8: '#D78888', // 중요
    }
    const workLabels = [2, 3, 5, 6];

    const fetchEvents = useCallback(async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            openModal({
                svg: '❗',
                msg1: '해당 페이지 접근 불가',
                msg2: '로그인 후 이용해주세요.',
                showCancel: false,
                onConfirm: () => router.push('./login'),
            });
            return;
        }

        try {

            // 일정 불러오기
            const [personalRes, deptRes, workRes] = await Promise.all([
                axios.post('http://192.168.0.122/schedule/list', {type: 'personal'}, {headers: {Authorization: token}}),
                axios.post('http://192.168.0.122/schedule/list', {type: 'dept'}, {headers: {Authorization: token}}),
                axios.post('http://192.168.0.122/schedule/list', {type: 'work'}, {headers: {Authorization: token}}),
            ]);

            const allEvents = [
                ...personalRes.data.list,
                ...deptRes.data.list,
                ...workRes.data.list,
            ];

            const mappedEvents = allEvents.map(item => {
                const haveTime = item.start_time && item.end_time;
                const workStatus = [2, 3, 5, 6].includes(item.label_idx); // 연차,반차,외근,출장
                return {
                    id: item.schedule_idx,
                    title: workStatus
                        ? `${item.user} - ${item.label_name}`
                        : item.title,
                    start: new Date(
                        haveTime
                            ? `${item.start_date}T${item.start_time}`
                            : `${item.start_date}T00:00:00`,
                    ),
                    end: new Date(
                        haveTime
                            ? `${item.end_date}T${item.end_time}`
                            : `${item.end_date}T23:59:59`
                    ),
                    allDay: !haveTime,
                    resource: item
                };
            });
            setEvent(mappedEvents);
        }catch (err) {
            console.error("일정 불러오기 실패: ", err);
        }
    }, [openModal, router]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 날짜 클릭
    const handleSelectSlot = (slotInfo) => {
        // slotInfo.start, slotInfo.end: Date 객체
        // slotInfo.action: 'select', 'click', etc.
        const isSingleDay = format(slotInfo.start, 'yyyy-MM-dd') === format(addDays(slotInfo.end,-1), 'yyyy-MM-dd');
        setInputInfo({
            open: true,
            start: slotInfo.start,
            end: addDays(slotInfo.end,-1),
            x: 0,
            y: 0
        });
        setForm((prev) => ({
            ...prev,
            title: '',
            description: '',
            start_time: '',
            end_time: '',
            label_idx: 1,
        }));
        setErrors({});
        setTimeout(() => {
            inputRef.current && inputRef.current.focus();
        }, 50);
    };

    // 일정 클릭 (상세정보)
    const selectEvent = (event) => {
        setDetailInfo({
            open: true,
            event: event,
            x: 0,
            y: 0
        });
        setEditForm(null);
    };

    // 일정 등록
    const insertEvent = async () => {
        const token = sessionStorage.getItem("token");
        const label = parseInt(form.label_idx, 10);
        const titleToSend = workLabels.includes(label) ? '' : form.title?.trim() || '';

        if (!workLabels.includes(label) && (!form.title || form.title.trim() === '')) {
            setErrors({title: true});
            openModal({
                svg: '❗',
                msg1: '입력 오류',
                msg2: '제목을 입력해주세요.',
                showCancel: false,
            });
            setTimeout(() => {
                inputRef.current && inputRef.current.focus();
            }, 50);
            return;
        }
        setErrors({});

        /*날짜, 시간 데이터 가공*/
        const startDate = format(inputInfo.start, 'yyyy-MM-dd');
        const endDate = format(inputInfo.end, 'yyyy-MM-dd');

        try {
            const {data} = await axios.post('http://192.168.0.122/schedule/insert', {
                title: titleToSend,
                description: form.description,
                start_date: startDate,
                end_date: endDate,
                start_time: form.start_time,
                end_time: form.end_time,
                label_idx: parseInt(form.label_idx, 10),
            },{headers: {Authorization: token}});
            console.log("전송하는 label_idx:", form.label_idx);

            if (data.success && data.loginYN) {
                openModal({
                    svg: '✔',
                    msg1: '확인',
                    msg2: '일정 등록을 완료하였습니다.',
                    showCancel: false,
                });
                setInputInfo({...inputInfo, open: false});
                fetchEvents();
            }
        }catch (err) {
            openModal({
                svg: '❗',
                msg1: '등록 실패',
                msg2: err.response?.data?.message || '등록 실패',
                showCancel: false,
            });
        }
    };

    // 일정 수정
    const updateEvent = async (event, editData) => {
        const token = sessionStorage.getItem("token");
        if (!editData.title || editData.title.trim() === '') {
            setEditForm(prev => ({...prev, title: prev.title || ''}));
            openModal({
                svg: '❗',
                msg1: '입력 오류',
                msg2: '제목을 입력해주세요.',
                showCancel: false,
            });
            return;
        }

        try {
            const {data} = await axios.post('http://192.168.0.122/schedule/update', {
                schedule_idx: editData.schedule_idx,
                title: editData.title,
                description: editData.description,
                start_date: editData.start_date,
                end_date: editData.end_date,
                start_time: editData.start_time,
                end_time: editData.end_time,
                label_idx: parseInt(editData.label_idx)
            },{headers: {Authorization: token}});

            if (data.success && data.loginYN) {
                openModal({
                    svg: '✔',
                    msg1: '확인',
                    msg2: '일정 수정을 완료하였습니다.',
                    showCancel: false,
                });
                setDetailInfo({...detailInfo, open: false});
                fetchEvents();
            }else {
                openModal({
                    svg: '❗',
                    msg1: '수정 실패',
                    msg2: err.response?.data?.message || '수정 실패',
                    showCancel: false,
                });
            }
        }catch (err) {
            console.log("일정 수정 실패: ", err);
        }
    };

    // 일정 삭제
     const deleteEvent = async (schedule_idx, user_idx) => {
         const token = sessionStorage.getItem("token");
         openModal({
             svg: '❗',
             msg1: '일정 삭제',
             msg2: '정말 삭제하시겠습니까?',
             showCancel: true,
             onConfirm: async () => {
                 try {
                     const {data} = await axios.put('http://192.168.0.122/schedule/del', null, {
                         params: {schedule_idx, user_idx},
                         headers: {Authorization: token}
                     });
                     if (data.success && data.loginYN) {
                         setDetailInfo({open: false, event: null, x:0, y: 0});
                         setEditForm(null);
                         fetchEvents();
                     }
                 }catch (err) {
                     openModal({
                         svg: '❗',
                         msg1: '삭제 실패',
                         msg2: err.response?.data?.message || '삭제 실패',
                         showCancel: false,
                     });
                 }
             }
         });
     };

     // 상세정보에서 수정 버튼 클릭 시
    const startEdit = () => {
        setEditForm({
            title: detailInfo.event.title,
            description: detailInfo.event.resource.description,
            start_time: detailInfo.event.resource.start_time,
            end_time: detailInfo.event.resource.end_time,
            label_idx: detailInfo.event.resource.label_idx
        });
    };

    //  상세정보 수정 저장
    const saveEdit = async () => {
        await updateEvent(detailInfo.event, editForm);
        setEditForm(null);
    };

    // 이벤트들 커스터마이징
    const eventPropGetter = (event, start, end, isSelected) => {
        const labelIdx = parseInt(event.resource?.label_idx, 10);
        const backgroundColor = LABEL_COLORS[event.resource.label_idx] || '#90A4AE';

        return {
            style: {
                backgroundColor,
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                paddingLeft: 6,
                paddingRight: 6,
                minHeight: 24
            },
        };
    };

    // 캘린더에 보여지는 이벤트
    const CustomEvent = ({event}) => {
        const {title, start_time, end_time} = event.resource || {};

        return (
            <div className="custom-evt">
                <div>{event.title}</div>
                {start_time && end_time && (
                    <div className="evt-time">
                        {start_time} - {end_time}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <Header />
            <div style={{padding: '1px', display: 'flex', justifyContent: 'center'}}>
                <div className="schedule-box" style={{height: 700, width: '70%'}}>
                    <Calendar
                        localizer={localizer}
                        events={event}
                        defaultView={view}
                        onView={setView}
                        views={['month']}
                        startAccessor="start"
                        endAccessor="end"
                        titleAccessor="title"
                        selectable={true}
                        popup={true}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={selectEvent}
                        eventPropGetter={eventPropGetter}
                        style={{ height: '100%' }}
                        messages={{
                            showMore: total => `+${total}개 더보기`
                        }}
                        components={{toolbar: CustomToolbar, event: CustomEvent}}
                    />

                    {/*일정 등록 모달*/}
                    {inputInfo.open && !editForm && (
                        <ScheduleInsertModal
                            open={true}
                            mode="insert"
                            form={form}
                            setForm={setForm}
                            errors={errors}
                            setErrors={setErrors}
                            onSubmit={insertEvent}
                            onClose={() => {
                                setInputInfo({...inputInfo, open: false});
                            }}
                            dateInfo={inputInfo}
                        />
                    )}

                    {/*일정 상세보기 모달*/}
                    {detailInfo.open && !editForm && !inputInfo.open && (
                        <ScheduleDetailModal
                            open={true}
                            mode="detail"
                            form={form}
                            setForm={setForm}
                            onClose={() => {
                                closeTimePicker();
                                setDetailInfo({...detailInfo, open: false});
                            }}
                            dateInfo={detailInfo.event}
                            event={detailInfo.event}
                            onDelete={() => deleteEvent(detailInfo.event?.id)}
                            onEditClick={() => {
                                setForm(detailInfo.event.resource);
                                setDetailInfo({...detailInfo, open: false});
                                setInputInfo({
                                    open: true,
                                    start: detailInfo.event.start,
                                    end: detailInfo.event.end,
                                });
                            }}
                        />
                    )}

                    {/*일정 수정 모달*/}
                    {editForm && (
                        <ScheduleUpdateModal
                            open={detailInfo.open}
                            mode="update"
                            form={editForm}
                            setForm={setEditForm}
                            errors={errors}
                            setErrors={setErrors}
                            onSubmit={(event) => updateEvent(detailInfo.event, editForm)}
                            onClose={() => {
                                setEditForm(null);
                                setDetailInfo({...detailInfo, open: false});
                            }}
                            dateInfo={{
                                start: new Date(editForm.start_date),
                                end: new Date(editForm.end_date),
                            }}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}