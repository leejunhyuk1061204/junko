'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {FaSearch} from "react-icons/fa";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";
import ProductModal from "@/app/component/modal/ProductModal";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import axios from "axios";
import {format} from "date-fns";
import ShipmentUpdateModal from "@/app/component/modal/ShipmentUpdateModal";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'work_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'work_date', orderDirection: 'asc' },
];

const statusFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'출근'},
    {idx:3, name:'퇴근'},
    {idx:4, name:'지각'},
    {idx:5, name:'결근'},
    {idx:6, name:'연차'},
    {idx:7, name:'반차'},
    {idx:8, name:'출장'},
    {idx:9, name:'외근'},
]

const shipmentStatusList = [
    {idx:1, name:'출고예정'},
    {idx:2, name:'출고완료'},
]

const ShipmentPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [selectedDate, setSelectedDate] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'work_date', orderDirection: 'desc' },);
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const [statusClicked, setStatusClicked] = useState({});
    const statusRef = useRef({});
    const [checkboxChecked, setCheckboxChecked] = useState({});

    const [timecardList, setTimecardList] = useState([]);


    useEffect(() => {
        getTimecardList();
    }, [selectedSort, selectedStatus, page, selectedDate]);

    //  리스트 가져오기
    const getTimecardList = async() => {
        const {data} = await axios.post('http://localhost:8080/timecard/list',{
            page:page,
            total:total,
            search:search,
            start_date:selectedDate.startDate||'',
            end_date:selectedDate.endDate||'',
            work_date:selectedDate.selectDate||'',
            status:selectedStatus.name === '전체'?'':selectedStatus.name,
            orderColumn:selectedSort.orderColumn||'',
            orderDirection:selectedSort.orderDirection||''
        });
        console.log(data);
        setTimecardList(data.list);
        setTotal(data.total*10);
    }


    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getTimecardList(search);
            setSearch('');
        }
    }
    // 정렬 변경
    const handleSortChange = (sort) => {
        setSelectedSort(sort);
        setPage(1);
    };

    // 스테이터스 필터
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setPage(1);
        getTimecardList();
    }


    // 스테이터스 변경
    const changeStatusClicked = (i) => {
        setStatusClicked(prev=>({
            ...prev,
            [i]:!prev[i]
        }));
    }

    // 외부 클릭 감지
    useEffect(() => {
        document.addEventListener('mousedown',handleClickOutside);
        return () => {
            document.removeEventListener('mousedown',handleClickOutside);
        }
    }, [statusClicked]);

    const handleClickOutside = (e) => {
        Object.entries(statusClicked).forEach(([key, value]) => {
            if(value && statusRef.current[key] && ! statusRef.current[key].contains(e.target)){
                setStatusClicked(prev=>({...prev,[key]:false}));
            }
        })
    }

    // 체크박스 전체 선택
    const allCheck = (checked) => {
        console.log(checkboxChecked);
        const updated = {};
        for (let i=0; i<timecardList.length; i++) {
            updated[i] = {bool:checked,idx:timecardList[i].sales_idx};
            // console.log(updated[i]);
        }
        setCheckboxChecked(updated);
    }

    useEffect(() => {
        console.log('checkboxChecked',checkboxChecked);
    }, [checkboxChecked]);

    // datePicker 핸들러
    const handleDatePicker = () => {
        openDatePicker({
            mode:'single',
            modeSelect:true,
            initialDates:[null,null],
            onConfirm:((_,value)=>{
                if(Array.isArray(value)){
                    const [start,end] = value;
                    setSelectedDate({
                        startDate:start ? format(start,'yyyy-MM-dd') : null,
                        endDate:end ? format(end,'yyyy-MM-dd') : null
                    });
                } else {
                    setSelectedDate({
                        selectDate:format(value, 'yyyy-MM-dd')
                    })
                }
                closeDatePicker();
            })
        })
    }

    return (
        <div>
            <div className='productPage wrap page-background'>
                <Header/>
                <h3 className="text-align-left margin-bottom-10 margin-30">
                    <span className="product-header">출고 목록 / 상세 조회</span>
                </h3>
                <div className={`order-list-back ${Object.values(statusClicked).some(v=>v === true) ?'overflow-visible-important':''}`}>
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        {/* 검색 */}
                        <div className='width-fit flex gap_15 align-center'>
                            <input style={{padding:'1.5px'}} type='text' placeholder='검색어를 입력해주세요' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                            <button className='btn white-space-nowrap height-50' onClick={()=>{getTimecardList();setSearch('')}}><FaSearch /></button>
                        </div>
                        {/* 기간 설정 */}
                        <div className='width-fit cursor-pointer'><button className='btn' onClick={()=>handleDatePicker()}><FaRegCalendarCheck /></button></div>
                        {/* 상태필터 */}
                        <div className="select-container" style={{marginRight:0}}>
                            <Listbox value={selectedStatus} onChange={handleStatusChange}>
                                <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedStatus.name}</ListboxButton>
                                <ListboxOptions className="select-option">
                                    {statusFilterList.map(option => (
                                        <ListboxOption key={option.idx} value={option} className="select-option-item">
                                            {option.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                        {/* 정렬 */}
                        <div className="select-container">
                            <Listbox value={selectedSort} onChange={handleSortChange}>
                                <ListboxButton className="select-btn">{selectedSort.name}</ListboxButton>
                                <ListboxOptions className="select-option">
                                    {sortOptions.map(option => (
                                        <ListboxOption key={option.id} value={option} className="select-option-item">
                                            {option.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                    </div>
                    <table className={'text-overflow-table '}>
                        <thead>
                            <tr>
                                {/*<th><input type='checkbox' checked={timecardList?.length > 0 && timecardList?.every((_, i) => checkboxChecked[i]?.bool === true)} onChange={e=>allCheck(e.target.checked)}/></th>*/}
                                <th>사원이름</th>
                                <th>날짜</th>
                                <th>시간</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timecardList && timecardList?.map((t,i)=>(
                                <tr key={i}>
                                    <th>{t.user_name}</th>
                                    <th>{t.work_date}</th>
                                    <th>{t.work_time}</th>
                                    <th>{t.status}</th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* 페이지네이션 */}
                    <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                        <div className='flex justify-content-center'>
                            <Pagination
                                activePage={page}
                                itemsCountPerPage={10}
                                totalItemsCount={total}
                                pageRangeDisplayed={5}
                                onChange={(page) => setPage(page)}  // set만!
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentPage;