'use client'

import Header from "@/app/header";
import '../../globals.css';
import "react-big-calendar/lib/css/react-big-calendar.css";
import {useCallback, useEffect, useState} from "react";
import {Calendar, dateFnsLocalizer, momentLocalizer} from "react-big-calendar";
import {useRouter} from "next/navigation";
import {useAlertModalStore} from "@/app/zustand/store";
import axios from "axios";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import CustomToolbar from "@/app/component/schedule/CustomToolbar";
import ko from "date-fns/locale/ko";

const locales = {'ko': ko,};
const localizer = dateFnsLocalizer({format, parse, startOfWeek, getDay, locales,});

const user_id = typeof window !== "undefined" ? sessionStorage.getItem("loginId") : "";

export default function SchedulePage() {

    const router = useRouter();
    const {openModal} = useAlertModalStore();

    const [event, setEvent] = useState([]);
    const [iinputInfo, setInputInfo] = useState({open: false, start: null, end: null, x: 0, y: 0});
    const [form, setForm] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        status: '',
    })
    const [detailInfo, setDetailInfo] = useState({open:false, event:null, x:0, y:0});
    const [editForm, setEditForm] = useState(null);
    const [view, setView] = useState('month');

    const LABEL_COLORS = {
        '일정': '#90A4AE',
        '연차': '#A8B88A',
        '반차': '#D6BFA7',
        '회의': '#9FA8DA',
        '외근': '#E0B084',
        '출장': '#A1887F',
        '행사': '#AED9B4',
        '중요': '#D78888',
    }

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
            const {data} = await axios.post('http://localhost:8080/schedule/list', {label_idx: 1}, {headers: {Authorization: token}});

            if (date.loginYN && Array.isArray(data.list)) {
                const mappedEvents = data.list.map(item => ({
                    id: item.schedule_idx,
                    title: item.title,
                    start: new Date(item.start_date+'T'+item.start_time),
                    end: new Date(item.end_date+'T'+item.end_time),
                    allDay: false,
                    resource: item
                }));
                setEvent(mappedEvents);
            }
        }catch (err) {
            console.error("일정 불러오기 실패: ", err);
        }
    }, [openModal, router]);


    // 일정 등록
    const insertEvent = async (formData) => {

    };

    // 일정 수정
    const updateEvent = async (formData) => {

    }

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <div>
            <Header />
            <div style={{padding: '1px', display: 'flex', justifyContent: 'center'}}>
                <div className="schedule-box" style={{height: 700, width: '70%'}}>
                    <Calendar
                        localizer={localizer}
                        events={event}
                        defaultView="month"
                        views={['month', 'week', 'day']}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        components={{ toolbar: CustomToolbar }}
                        eventPropGetter={(event) => {
                            const color = LABEL_COLORS[event.resource.label] || '#90A4AE';
                            return {
                                style: {
                                    backgroundColor: color,
                                    color: '#fff',
                                    borderRadius: '6px',
                                    border: 'none',
                                    padding: '4px 8px',
                                },
                            };
                        }}
                    />
                </div>
            </div>
        </div>
    );
}