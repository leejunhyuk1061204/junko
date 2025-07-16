'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import axios from "axios";
import Pagination from "react-js-pagination";
import {FaRegCalendarAlt, FaSearch} from "react-icons/fa";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import {FaRegCalendarCheck} from "react-icons/fa6";
import { format } from 'date-fns';
import ReceiveInputModal from "@/app/component/modal/receiveInputModal";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'receive_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'receive_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'receive_idx', orderDirection: 'asc'}
];

const receiveStatusList = [
    // {idx:1, name:'입고예정'},
    {idx:2, name:'입고완료'},
]
const statusList = [
    {idx:1, name:'전체'},
    {idx:2, name:'입고예정'},
    {idx:3, name:'입고완료'},
]

const ReceivingPage = () => {

    const {openModal, closeModal} = useAlertModalStore();
    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [receiveList, setReceiveList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'receive_date', orderDirection: 'desc' });
    const [search, setSearch] = useState('');
    const [statusClicked, setStatusClicked] = useState({});
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const statusRef = useRef({});
    const [selectedDate, setSelectedDate] = useState({});
    const [inputModalOpen, setInputModalOpen] = useState({bool:false,idx:0});
    const [updateInfo, setUpdateInfo] = useState({});


    useEffect(() => {
        getReceiveList();
    }, [page,selectedSort,selectedStatus,selectedDate]);

    // 입고 리스트 가져오기
    const getReceiveList = async () => {
        const {data} = await axios.post('http://localhost:8080/receive/list',
            {
                page:page,
                orderColumn : selectedSort.orderColumn,
                orderDirection: selectedSort.orderDirection,
                search:search,
                status:selectedStatus.name==='전체'?'':selectedStatus.name,
                receive_date: 'receiveDate' in selectedDate ?  selectedDate.receiveDate : '',
                start_date: 'startDate' in selectedDate ?  selectedDate.startDate : '',
                end_date: 'endDate' in selectedDate ?  selectedDate.endDate : ''
            });
        console.log(data);
        setReceiveList(data.list);
        setTotal(data.total*10);
    }

    // 입고 상태 수정하기
    const updateReceiveStatus = async (idx,status) => {
        setInputModalOpen({bool:true,idx:idx});
        // const {date} = await axios.post('http://localhost:8080/receive/update',{receive_idx : idx , status : status})
        // console.log(data);
        // if(!data.success){
        //     openModal({
        //         svg: '❗',
        //         msg1: '변경 실패',
        //         msg2: '진행 상태 변경에 실패했습니다',
        //         showCancel: false,
        //         onConfirm: closeModal
        //     })
        // }
        // getReceiveList();

        // 입고 완료 변경 시 모달 띄워서 정보 입력해야함
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

    // 정렬 변경
    const handleSortChange = (sort) => {
        setSelectedSort(sort);
        setPage(1);
    };

    // 스테이터스 필터
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setPage(1);
    }

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getReceiveList();
            setSearch('');
        }
    }

    // 스테이터스 변경
    const changeStatusClicked = (i) => {
        setStatusClicked(prev=>({
            ...prev,
            [i]:!prev[i]
        }));
    }

    // datePicker 핸들러
    const handleDatePicker = () => {
        openDatePicker({
            mode:'range',
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
                        receiveDate:format(value,'yyyy-MM-dd')
                    })
                }
                closeDatePicker();
            })
        })
    }

    return (
        <div className='productPage wrap page-background'>
            <Header/>
            <h3 className="text-align-left margin-bottom-10 margin-30">
                <span className="product-header">입고 목록 / 상세 조회</span>
            </h3>
            <div className="order-list-back">
                <div className="flex gap_10 align-center justify-right margin-bottom-10">
                    {/* 검색 */}
                    <div className='width-fit flex gap_15 align-center'>
                        <input style={{padding:'1.5px'}} type='text' placeholder='검색어를 입력해주세요' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                        <button className='btn white-space-nowrap height-50' onClick={()=>{getReceiveList();setSearch('')}}><FaSearch /></button>
                    </div>
                    {/* 기간 설정 */}
                    <div className='width-fit cursor-pointer'><button className='btn' onClick={handleDatePicker}><FaRegCalendarCheck /></button></div>
                    {/* 상태필터 */}
                    <div className="select-container" style={{marginRight:0}}>
                        <Listbox value={selectedStatus} onChange={handleStatusChange}>
                            <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedStatus.name}</ListboxButton>
                            <ListboxOptions className="select-option">
                                {statusList.map(option => (
                                    <ListboxOption key={option.id} value={option} className="select-option-item">
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
                <table className={'checkbox-table'}>
                    <thead>
                        <tr>
                            <th><input type='checkbox'/></th>
                            <th>입고 번호</th>
                            <th>발주 번호</th>
                            <th>상품</th>
                            <th>입고 창고</th>
                            <th>입고 일자</th>
                            <th>담당자</th>
                            <th>진행 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                    {receiveList.map((receive,i)=>(
                        <tr key={receive.receive_idx}>
                            <td><input type='checkbox'/></td>
                            <td>{receive.receive_idx}</td>
                            <td>{receive.order_idx}</td>
                            <td>{receive.product_name}{receive.product_cnt === 1?'':` 외 ${receive.product_cnt-1}개`}</td>
                            <td>{receive.warehouse_name}</td>
                            <td>{receive.receive_date}</td>
                            <td>{receive.user_name}</td>
                            <td className='position-relative cursor-pointer' onClick={(e)=>{e.stopPropagation();changeStatusClicked(i)}} ref={el => (statusRef.current[i] = el)}>
                                {receive.status}
                                {statusClicked[i]
                                    && receive.status === '입고예정'
                                    ? (
                                        <ul className="listBox-option">
                                            {receiveStatusList?.map((rs) => (
                                                <li
                                                    key={rs.idx}
                                                    className="listBox-option-item margin-0"
                                                    onClick={()=>updateReceiveStatus(receive.receive_idx,rs.name)}
                                                >
                                                    {rs.name}
                                                </li>
                                            ))}
                                        </ul>
                                    ):('')}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {/* 페이지네이션 */}
                <div className="product-pagination flex justify-content-between gap_5 margin-bottom-10">
                    <div>
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
            <ReceiveInputModal open={inputModalOpen.bool} onClose={()=>setInputModalOpen({bool:false,idx:0})} setUpdateInfo={setUpdateInfo} idx={inputModalOpen.idx}/>
        </div>
    );
};

export default ReceivingPage;