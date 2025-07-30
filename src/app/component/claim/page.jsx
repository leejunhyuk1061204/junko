'use client'
import React, {useEffect, useRef, useState} from 'react';
import Header from "@/app/header";
import {FaSearch} from "react-icons/fa";
import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import Pagination from "react-js-pagination";
import ProductModal from "@/app/component/modal/ProductModal";
import ShipmentUpdateModal from "@/app/component/modal/ShipmentUpdateModal";
import {useAlertModalStore, useDatePickerStore} from "@/app/zustand/store";
import axios from "axios";
import HandleClaimModal from "@/app/component/modal/handleClaimModal";
import {format} from "date-fns";

const sortOptions = [
    { id: 1, name: '최신순' , orderColumn : 'claim_date', orderDirection: 'desc' },
    { id: 2, name: '오래된순' , orderColumn : 'claim_date', orderDirection: 'asc' },
    { id: 3, name: '번호순' , orderColumn : 'claim_idx', orderDirection: 'asc'}
];

const statusFilterList = [
    {idx:1, name:'전체'},
    {idx:2, name:'요청접수'},
    {idx:3, name:'처리중'},
    {idx:4, name:'처리완료'},
    {idx:5, name:'취소'},
]

const claimStatusList = [
    {idx:1, name:'요청'},
    {idx:2, name:'처리중'},
    {idx:3, name:'처리완료'},
]

const ClaimPage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const {openDatePicker, closeDatePicker} = useDatePickerStore();
    const [selectedDate, setSelectedDate] = useState({});
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedSort, setSelectedSort] = useState({ id: 1, name: '최신순' , orderColumn : 'claim_date', orderDirection: 'desc' },);
    const [selectedStatus, setSelectedStatus] = useState({idx:1, name:'전체'});
    const [statusClicked, setStatusClicked] = useState({});
    const statusRef = useRef({});
    const [checkboxChecked, setCheckboxChecked] = useState({});

    const [claimList, setClaimList] = useState([]);
    const [handleClaimModalOpen,setHandleClaimModalOpen] = useState({bool:false,claim:null});

    // 초기화
    const listInitialize = () => {
        setPage(1);
        setSearch('');
        setSelectedSort({ id: 1, name: '최신순' , orderColumn : 'claim_date', orderDirection: 'desc' });
        setSelectedStatus({idx:1, name:'전체'});
        setSelectedDate({});
        setCheckboxChecked({});
    }

    useEffect(() => {
        getClaimList();
    },[selectedSort, selectedStatus, page, selectedDate])

    // 클레임 리스트 가져오기
    const getClaimList = async(searchText='') => {
        const {data} = await axios.post('http://localhost:8080/claim/list',{
            page:page,
            status:selectedStatus.name === '전체'?'':selectedStatus.name,
            search:search,
            orderColumn:selectedSort.orderColumn,
            orderDirection:selectedSort.orderDirection,
            claim_date:selectedDate.selectDate||'',
            start_date:selectedDate.startDate||'',
            end_date:selectedDate.endDate||'',
        });
        console.log(data);
        setTotal(data.total*10);
        setClaimList(data.list);
    }

    // 검색 엔터
    const searchEnter = (e)=>{
        if(e.keyCode === 13){
            getClaimList()
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
        getClaimList();
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
        for (let i=0; i<claimList.length; i++) {
            updated[i] = {bool:checked,idx:claimList[i].sales_idx};
        }
        setCheckboxChecked(updated);
    }

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
                    <span className="product-header">클레임 목록 / 상세 조회</span>
                </h3>
                <div className={`order-list-back ${Object.values(statusClicked).some(v=>v === true) ?'overflow-visible-important':''}`}>
                    <div className="flex gap_10 align-center justify-right margin-bottom-10">
                        {/* 검색 */}
                        <div className='width-fit flex gap_15 align-center'>
                            <input style={{padding:'1.5px'}} type='text' placeholder='검색어를 입력해주세요' value={search} onChange={e=>setSearch(e.target.value)} onKeyUp={e=>searchEnter(e)}/>
                            <button className='btn white-space-nowrap height-50' onClick={()=>{getClaimList();setSearch('')}}><FaSearch /></button>
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
                        <div className="select-container" style={{marginRight:0}}>
                            <Listbox value={selectedSort} onChange={handleSortChange}>
                                <ListboxButton className="select-btn" style={{marginRight:0}}>{selectedSort.name}</ListboxButton>
                                <ListboxOptions className="select-option">
                                    {sortOptions.map(option => (
                                        <ListboxOption key={option.id} value={option} className="select-option-item">
                                            {option.name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        </div>
                        <button className='btn width-fit' style={{padding:'8px 15px'}} onClick={listInitialize}>초기화</button>
                    </div>
                    <div>
                    <table className={'text-overflow-table'}>
                        <thead>
                            <tr>
                                {/*<th><input type='checkbox' checked={claimList.length > 0 && claimList.every((_, i) => checkboxChecked[i]?.bool === true)} onChange={e=>allCheck(e.target.checked)}/></th>*/}
                                <th>클레임 번호</th>
                                <th>주문번호</th>
                                <th>타입</th>
                                <th>작성일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claimList?.map((claim,i)=>(
                                <tr key={i} className='cursor-pointer' onClick={()=>setHandleClaimModalOpen({bool:true,claim:claim})}>
                                    {/*<td><input type='checkbox' checked={checkboxChecked[i]?.bool ?? false} onChange={()=>setCheckboxChecked(prev=>({...prev,[i]:{bool:!checkboxChecked[i]?.bool,idx:shipment.shipment_idx}}))}/></td>*/}
                                    <td>{claim.claim_idx}</td>
                                    <td>{claim.sales_idx}</td>
                                    <td>{claim.type}</td>
                                    <td>{claim.claim_date}</td>
                                    <td>{claim.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
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
                        <div className='flex width-fit margin-right-10 gap_10'>
                            <button className='btn white-space-nowrap' onClick={()=>{location.href='/component/claim/insert'}}>클레임 등록</button>
                        </div>
                    </div>
                </div>
            </div>
            {/*<ProductModal open={productModalOpen.bool} onClose={()=>setProductModalOpen({bool:false,idx:0})} sales_idx={productModalOpen.idx}/>*/}
            <HandleClaimModal open={handleClaimModalOpen.bool} onClose={()=>setHandleClaimModalOpen({bool:false,claim:null})} claim={handleClaimModalOpen.claim} getClaimList={getClaimList}/>
        </div>
    );
};

export default ClaimPage;