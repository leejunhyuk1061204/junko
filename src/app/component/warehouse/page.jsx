'use client'
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import axios from "axios";
import {DndProvider, DragPreviewImage, useDrag, useDrop} from "react-dnd";
import {getEmptyImage, HTML5Backend} from "react-dnd-html5-backend";
import Header from "@/app/header";
import {useAlertModalStore} from "@/app/zustand/store";
import {Preview} from "react-dnd-preview";
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';

const WareHousePage = () => {

    const {openModal,closeModal} = useAlertModalStore();
    const [warehouseList, setWarehouseList] = useState([]);
    const [zoneList, setZoneList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [insertMode, setInsertMode] = useState(false);
    const [insertType, setInsertType] = useState(false);
    const [updateMode, setUpdateMode] = useState(false);
    const [warehouseForm, setWarehouseForm] = useState({});
    const [zoneForm, setZoneForm] = useState({});

    const [user, setUser] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userName, setUserName] = useState('');
    const [userFocused, setUserFocused] = useState(false);

    const [warehouse, setWarehouse] = useState([]);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseFocused, setWarehouseFocused] = useState(false);

    useEffect(() => {
        getWarehouseList();
        getZoneList();
    }, []);

    // 창고 리스트
    const getWarehouse = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/warehouse/list',{page:1,warehouse_name:searchText});
        setWarehouse(data.list);
        // console.log('창고 불러오기');
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setWarehouseName(warehouseSearch);
            // console.log('창고 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [warehouseSearch]);

    useEffect(() => {
        getWarehouse(warehouseName);
    }, [warehouseName]);

    // user 리스트
    const getUser = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/users/list',{page:1,user_name:searchText});
        setUser(data.list);
        // console.log('user',data);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setUserName(userSearch);
            // // console.log('유저 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearch]);

    useEffect(() => {
        getUser(userName);
    }, [userName]);

    const getWarehouseList = async () => {
        const {data} = await axios.post('http://localhost:8080/warehouse/list',{});
        console.log(data);
        setWarehouseList(data.list);
    }

    const getZoneList = async () => {
        const {data} = await axios.post('http://localhost:8080/zone/list',{});
        console.log(data);
        setZoneList(data.list);
    }

    const onSelect = (some,bool) => {
        if(bool){
            if(some.warehouse_idx === selected?.warehouse?.warehouse_idx){
                setSelected(null);
            } else {
                setSelected({warehouse:some,bool:true});
                setUserSearch(some.user_name);
            }
        }else{
            if(some.zone_idx === selected?.zone?.zone_idx){
                setSelected(null);
            } else {
                setSelected({zone:some,bool:false});
            }
        }

    }

    const insertUpdate = () => {
        if(updateMode){
            if(!selected.bool) {
                openModal({
                    svg: '❓',
                    msg1: '변경 확인',
                    msg2: '내용을 변경하시겠습니까?',
                    showCancel: true,
                    onConfirm: () => {
                        closeModal();
                        setTimeout(async () => {
                            try {
                                const {data} = await axios.post('http://localhost:8080/zone/update', {
                                    zone_idx: selected.zone.zone_idx,
                                    zone_name: zoneForm.zone_name,
                                })
                                console.log(data);
                                if (!data.success) {
                                    openModal({
                                        svg: '❗',
                                        msg1: '변경 실패',
                                        msg2: '변경에 실패했습니다',
                                        showCancel: false,
                                    })
                                } else {
                                    openModal({
                                        svg: '✔',
                                        msg1: '변경 성공',
                                        msg2: '변경에 성공했습니다',
                                        showCancel: false,
                                        onConfirm: () => {
                                            closeModal();
                                            getWarehouseList();
                                            getZoneList();
                                            setZoneForm({});
                                            setUpdateMode(false);
                                            setSelected(null);
                                        }
                                    })
                                }
                            } catch (error) {
                                console.log(error);
                                openModal({
                                    svg: '❗',
                                    msg1: '오류 발생',
                                    msg2: '서버 요청 중 문제가 발생했습니다',
                                    showCancel: false,
                                })
                            }
                        }, 100);
                    }
                })
            } else {
                openModal({
                    svg: '❓',
                    msg1: '변경 확인',
                    msg2: '내용을 변경하시겠습니까?',
                    showCancel: true,
                    onConfirm: () => {
                        closeModal();
                        setTimeout(async () => {
                            try {
                                const {data} = await axios.post('http://localhost:8080/warehouse/update', {
                                    warehouse_idx: selected.warehouse.warehouse_idx,
                                    warehouse_name: warehouseForm.warehouse_name || '',
                                    warehouse_address: warehouseForm.warehouse_address || '',
                                    user_idx: warehouseForm.user_idx || 0
                                })
                                console.log(data);
                                if (!data.success) {
                                    openModal({
                                        svg: '❗',
                                        msg1: '변경 실패',
                                        msg2: '변경에 실패했습니다',
                                        showCancel: false,
                                    })
                                } else {
                                    openModal({
                                        svg: '✔',
                                        msg1: '변경 성공',
                                        msg2: '변경에 성공했습니다',
                                        showCancel: false,
                                        onConfirm: () => {
                                            closeModal();
                                            getWarehouseList();
                                            getZoneList();
                                            setZoneForm({});
                                            setUpdateMode(false);
                                            setSelected(null);
                                        }
                                    })
                                }
                            } catch (error) {
                                console.log(error);
                                openModal({
                                    svg: '❗',
                                    msg1: '오류 발생',
                                    msg2: '서버 요청 중 문제가 발생했습니다',
                                    showCancel: false,
                                })
                            }
                        }, 100);
                    }
                })
            }
        } else {
            setInsertMode(!insertMode);
            setZoneForm({});
            setWarehouseForm({});
            setUserSearch('');
            setWarehouseSearch('');
        }
    }

    const insertForm = () => {
        if(insertType){
            openModal({
                svg: '❓',
                msg1: '등록 확인',
                msg2: '창고를 등록하시겠습니까?',
                showCancel: true,
                onConfirm: () => {
                    closeModal();
                    setTimeout(async () => {
                        try {
                            const {data} = await axios.post('http://localhost:8080/warehouse/insert', {
                                warehouse_name: warehouseForm.warehouse_name || '',
                                warehouse_address: warehouseForm.warehouse_address || '',
                                user_idx: warehouseForm.user_idx || 0
                            })
                            console.log(data);
                            if (!data.success) {
                                openModal({
                                    svg: '❗',
                                    msg1: '등록 실패',
                                    msg2: '창고 등록에 실패했습니다',
                                    showCancel: false,
                                })
                            } else {
                                openModal({
                                    svg: '✔',
                                    msg1: '등록 성공',
                                    msg2: '창고 등록에 성공했습니다',
                                    showCancel: false,
                                    onConfirm: () => {
                                        closeModal();
                                        getWarehouseList();
                                        getZoneList();
                                        setWarehouseForm({});
                                        setInsertMode(false);
                                        setSelected(null);
                                        setUserSearch('');
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                            openModal({
                                svg: '❗',
                                msg1: '오류 발생',
                                msg2: '서버 요청 중 문제가 발생했습니다',
                                showCancel: false,
                            })
                        }
                    }, 100);
                }
            })
        } else {
            openModal({
                svg: '❓',
                msg1: '등록 확인',
                msg2: '구역을 등록하시겠습니까?',
                showCancel: true,
                onConfirm: () => {
                    closeModal();
                    setTimeout(async () => {
                        try {
                            const {data} = await axios.post('http://localhost:8080/zone/insert', {
                                warehouse_idx:zoneForm.warehouse_idx||0,
                                zone_name: zoneForm.zone_name || '',
                            })
                            console.log(data);
                            if (!data.success) {
                                openModal({
                                    svg: '❗',
                                    msg1: '등록 실패',
                                    msg2: '구역 등록에 실패했습니다',
                                    showCancel: false,
                                })
                            } else {
                                openModal({
                                    svg: '✔',
                                    msg1: '등록 성공',
                                    msg2: '구역 등록에 성공했습니다',
                                    showCancel: false,
                                    onConfirm: () => {
                                        closeModal();
                                        getWarehouseList();
                                        getZoneList();
                                        setZoneForm({});
                                        setInsertMode(false);
                                        setSelected(null);
                                        setWarehouseSearch('');
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                            openModal({
                                svg: '❗',
                                msg1: '오류 발생',
                                msg2: '서버 요청 중 문제가 발생했습니다',
                                showCancel: false,
                            })
                        }
                    }, 100);
                }
            })
        }
    }

    const selectedDel = () => {
        if(selected == null){
            openModal({
                svg: '❗',
                msg1: '삭제 실패',
                msg2: '삭제할 창고 또는 구역을 선택해주세요',
                showCancel: false,
            })
        }

        if(selected.bool === true){
            openModal({
                svg: '❓',
                msg1: '삭제 확인',
                msg2: '선택한 창고를 삭제하시겠습니까?',
                showCancel: true,
                onConfirm: () => {
                    closeModal();
                    setTimeout(async () => {
                        try {
                            const {data} = await axios.get(`http://localhost:8080/warehouse/del/${selected.warehouse.warehouse_idx}`);
                            console.log(data);
                            if (!data.success) {
                                openModal({
                                    svg: '❗',
                                    msg1: '삭제 실패',
                                    msg2: '창고 삭제에 실패했습니다',
                                    showCancel: false,
                                })
                            } else {
                                openModal({
                                    svg: '✔',
                                    msg1: '삭제 성공',
                                    msg2: '창고 삭제에 성공했습니다',
                                    showCancel: false,
                                    onConfirm: () => {
                                        getWarehouseList();
                                        getZoneList();
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                            openModal({
                                svg: '❗',
                                msg1: '오류 발생',
                                msg2: '서버 요청 중 문제가 발생했습니다',
                                showCancel: false,
                            })
                        }
                    }, 100);
                }
            })
        } else {
            openModal({
                svg: '❓',
                msg1: '삭제 확인',
                msg2: '선택한 구역을 삭제하시겠습니까?',
                showCancel: true,
                onConfirm: () => {
                    closeModal();
                    setTimeout(async () => {
                        try {
                            const {data} = await axios.get(`http://localhost:8080/zone/del/${selected.zone.zone_idx}`);
                            console.log(data);
                            if (!data.success) {
                                openModal({
                                    svg: '❗',
                                    msg1: '삭제 실패',
                                    msg2: '구역 삭제에 실패했습니다',
                                    showCancel: false,
                                })
                            } else {
                                openModal({
                                    svg: '✔',
                                    msg1: '삭제 성공',
                                    msg2: '구역 삭제에 성공했습니다',
                                    showCancel: false,
                                    onConfirm: () => {
                                        getWarehouseList();
                                        getZoneList();
                                    }
                                })
                            }
                        } catch (error) {
                            console.log(error);
                            openModal({
                                svg: '❗',
                                msg1: '오류 발생',
                                msg2: '서버 요청 중 문제가 발생했습니다',
                                showCancel: false,
                            })
                        }
                    }, 100);
                }
            })
        }
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className='productPage wrap page-background'>
                    <Header/>
                    <h3 className="text-align-left margin-bottom-10 margin-0-200 margin-bottom-20">
                        <span className="product-header">창고 목록 / 상세 조회</span>
                    </h3>
                    <div className={`order-list-back flex gap_20 ${userFocused||warehouseFocused?'show-dropdown':''}`} style={{margin:'0 200px'}}>
                        <div className='flex flex-25 flex-direction-col'>
                            <div className='border border-gray border-radius padding-30 margin-20 gap_15 flex flex-direction-col '>
                                {warehouseList.map((warehouse, i) => (
                                    <Warehouse key={i} warehouse={warehouse} zoneList={zoneList} getWarehouseList={getWarehouseList} getZoneList={getZoneList} onSelect={onSelect}/>
                                ))}
                            </div>
                        </div>
                        <div className='margin-20 gap_15 flex flex-direction-col justify-content-between'>
                            {insertMode?
                                <div>
                                    <table>
                                        <thead>
                                        {insertType ?
                                            <tr>
                                                <th>창고이름</th>
                                                <th>창고주소</th>
                                                <th>담당자</th>
                                            </tr>
                                            :
                                            <tr>
                                                <th>구역이름</th>
                                                <th>소속창고</th>
                                            </tr>
                                        }
                                        </thead>
                                        <tbody>
                                        {insertType ?
                                            <tr>
                                                <th><input style={{margin:'0'}} type='text' value={warehouseForm.warehouse_name||''} onChange={(e)=>setWarehouseForm(prev=>({...prev,warehouse_name:e.target.value}))}/></th>
                                                <th><input style={{margin:'0'}} type='text' value={warehouseForm.warehouse_address||''} onChange={(e)=>setWarehouseForm(prev=>({...prev,warehouse_address:e.target.value}))}/></th>
                                                <th>
                                                    <div className='width-100'>
                                                        <div className="listBox-container">
                                                            <input
                                                                type="text"
                                                                className="width-100 border rounded"
                                                                placeholder="담당자 검색"
                                                                value={userSearch}
                                                                onChange={(e) => setUserSearch(e.target.value)}
                                                                onFocus={() => {
                                                                    setUserSearch('');
                                                                    setUserFocused(true);
                                                                    getUser('');
                                                                }}
                                                                onBlur={() => setTimeout(() => setUserFocused(false), 120)}
                                                            />
                                                            {userFocused ? (<>
                                                                {user?.length > 0 && (
                                                                    <ul className="listBox-option">
                                                                        {user?.map((u) => (
                                                                            <li
                                                                                key={u.user_idx}
                                                                                onClick={() => {
                                                                                    setWarehouseForm(prev=>({...prev,user_idx: u.user_idx}));
                                                                                    setUserSearch(u.user_name);
                                                                                }}
                                                                                className="listBox-option-item margin-0"
                                                                            >
                                                                                {u.user_name}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                                {user?.length === 0 && userSearch && (
                                                                    <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                                )}
                                                            </>):('')}
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                            :
                                            <tr>
                                                <th><input style={{margin:'0'}} type='text' value={zoneForm.zone_name||''} onChange={(e)=>setZoneForm(prev=>({...prev,zone_name:e.target.value}))}/></th>
                                                <th>
                                                    <div>
                                                        <div className="listBox-container">
                                                            <input
                                                                type="text"
                                                                className="width-100 border rounded"
                                                                placeholder="창고 검색"
                                                                value={warehouseSearch}
                                                                onChange={(e) => setWarehouseSearch(e.target.value)}
                                                                onFocus={() => {
                                                                    setWarehouseSearch('');
                                                                    setWarehouseFocused(true);
                                                                }}
                                                                onBlur={() => setTimeout(() => setWarehouseFocused(false), 120)}
                                                            />
                                                            {warehouseFocused ? (<>
                                                                {warehouse?.length > 0 && (
                                                                    <ul className="listBox-option">
                                                                        {warehouse?.map((w) => (
                                                                            <li
                                                                                key={w.warehouse_idx}
                                                                                onClick={() => {
                                                                                    setWarehouseSearch(w.warehouse_name);
                                                                                    setZoneForm(prev=>({...prev,warehouse_idx:w.warehouse_idx}));
                                                                                }}
                                                                                className="listBox-option-item margin-0"
                                                                            >
                                                                                {w.warehouse_name}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                                {warehouse?.length === 0 && warehouseSearch && (
                                                                    <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                                )}
                                                            </>):('')}
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                : selected === null ? (<div style={{fontSize:'20px'}}>창고 또는 구역을 선택해주세요</div>):selected?.bool ? (
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>창고번호</th>
                                                <th>창고이름</th>
                                                <th>창고주소</th>
                                                <th>담당자</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {warehouseList.filter(f=>f.warehouse_idx === selected.warehouse.warehouse_idx).map((warehouse,i)=>(
                                                <tr key={i}>
                                                    <td>{warehouse.warehouse_idx}</td>
                                                    <td>{!updateMode?warehouse.warehouse_name:<input style={{margin:'0'}} type='text' value={warehouseForm.warehouse_name||warehouse.warehouse_name} onChange={(e)=>setWarehouseForm(prev=>({...prev,warehouse_name:e.target.value}))}/>}</td>
                                                    <td>{!updateMode?warehouse.warehouse_address:<input style={{margin:'0'}} type='text' value={warehouseForm.warehouse_address||warehouse.warehouse_address} onChange={(e)=>setWarehouseForm(prev=>({...prev,warehouse_address:e.target.value}))}/>}</td>
                                                    <td>{!updateMode?warehouse.user_name:
                                                        <div className='width-100'>
                                                            <div className="listBox-container">
                                                                <input
                                                                    type="text"
                                                                    className="width-100 border rounded"
                                                                    placeholder="담당자 검색"
                                                                    value={userSearch}
                                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                                    onFocus={() => {
                                                                        setUserSearch('');
                                                                        setUserFocused(true);
                                                                        getUser('');
                                                                    }}
                                                                    onBlur={() => setTimeout(() => setUserFocused(false), 120)}
                                                                />
                                                                {userFocused ? (<>
                                                                    {user?.length > 0 && (
                                                                        <ul className="listBox-option">
                                                                            {user?.map((u) => (
                                                                                <li
                                                                                    key={u.user_idx}
                                                                                    onClick={() => {
                                                                                        setWarehouseForm(prev=>({...prev,user_idx: u.user_idx}));
                                                                                        setUserSearch(u.user_name);
                                                                                    }}
                                                                                    className="listBox-option-item margin-0"
                                                                                >
                                                                                    {u.user_name}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                    {user?.length === 0 && userSearch && (
                                                                        <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                                    )}
                                                                </>):('')}
                                                            </div>
                                                        </div>
                                                    }</td>
                                                </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>구역번호</th>
                                            <th>구역이름</th>
                                            <th>소속창고</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {zoneList.filter(f=>f.zone_idx === selected.zone.zone_idx).map((zone,i)=>(
                                            <tr key={i}>
                                                <td>{zone.zone_idx}</td>
                                                <td>{!updateMode?zone.zone_name:<input style={{margin:'0'}} type='text' value={zoneForm.zone_name||zone.zone_name} onChange={(e)=>setZoneForm(prev=>({...prev,zone_name:e.target.value}))}/>}</td>
                                                <td>{zone.warehouse_name}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className='flex gap_10 justify-content-center'>
                                {insertMode?<button className='btn' onClick={insertForm}>등록</button>:''}
                                {insertMode?<button className='btn' onClick={()=>setInsertType(!insertType)}>{!insertType?'창고':'구역'}</button>:''}
                                <button className='btn' onClick={insertUpdate}>{insertMode?'돌아가기':'등록'}</button>
                                {insertMode?'':<button className='btn' onClick={()=>{setUpdateMode(!updateMode);setZoneForm({});setWarehouseForm({});}}>수정</button>}
                                {insertMode?'':<button className='btn' onClick={selectedDel}>삭제</button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Preview generator={generatePreview} />
        </DndProvider>
    );
};

// warehouse
const Warehouse = ({warehouse,zoneList,getWarehouseList,getZoneList,onSelect}) => {
    const {openModal} = useAlertModalStore();
    const [showZone, setShowZone] = useState(false);
    const ref = useRef(null);
    const [, dropRef] = useDrop(()=>({
        accept: 'zone',
        drop:async(item)=>{
            try {
                const {data} = await axios.post('http://localhost:8080/zone/update',{
                    zone_idx:item.idx,
                    warehouse_idx:warehouse.warehouse_idx
                });
                console.log(data);
                if(data.success){
                    await getWarehouseList();
                    await getZoneList();
                }
            } catch (err) {
                openModal({
                    svg: '❗',
                    msg1: '오류',
                    msg2: err.response?.data?.message || err.message,
                    showCancel: false,
                });
            }
        }
    }));

    dropRef(ref);

    return (
        <div className='flex flex-direction-col text-align-left margin-left-5 white-space-nowrap warehouse-div' ref={ref}>
            <div className='flex cursor-pointer' onClick={()=>onSelect(warehouse,true)}>
                {warehouse.warehouse_name}
                {showZone ? (
                    <IoIosArrowUp
                        className='cursor-pointer'
                        onClick={(e)=>{e.stopPropagation();setShowZone(!showZone)}}
                    />
                ) : (
                    <IoIosArrowDown
                        className='cursor-pointer'
                        onClick={(e)=>{e.stopPropagation();setShowZone(!showZone)}}
                    />
                )}
            </div>
            {showZone && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).length > 0 && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).map(zone=>{
                return (
                    <ZoneItem key={zone.zone_idx} zone={zone} onSelect={onSelect}/>
                );
            })}
            {showZone && zoneList.filter(f=>f.warehouse_idx === warehouse.warehouse_idx).length === 0 &&
                <div style={{fontSize:'17px',fontWeight:'normal',padding:'15px 30px'}}>지정된 구역이 없습니다</div>
            }
        </div>
    );
}

// zone
const ZoneItem = ({zone,onSelect}) => {
    const ref = useRef(null);

    const[{ isDragging }, dragRef, dragPreview] = useDrag(()=>({
        type: 'zone',
        item: () => {
            const width = ref.current?.offsetWidth || 0;
            return {
                idx: zone.zone_idx,
                name: zone.zone_name,
                width: width,
            };
        },
        collect: (monitor)=>({
            isDragging : monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [dragPreview]);

    dragRef(ref);

    return (
        <div className={`text-align-left zone-div ${isDragging ? 'dragging-zone' : ''}`}
             style={{marginLeft:'80px'}}
             ref={ref}
             onClick={()=>onSelect(zone,false)}
        >
            {zone.zone_name}
        </div>
    );
}

// preview ?
const generatePreview = ({ itemType, item, style }) => {
    if (itemType === 'zone') {
        return (
            <div style={{
                ...style,
                fontSize:'17px',
                fontWeight:'normal',
                backgroundColor: '#F4F6FA',
                padding: '15px 30px',
                borderRadius: '0.375rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                pointerEvents: 'none',
                opacity: 0.9,
                width: item.width,
                textAlign:"left",
                marginLeft:'5px'
            }}>
                {item.name}
            </div>
        );
    }
    return null;
};


export default WareHousePage;