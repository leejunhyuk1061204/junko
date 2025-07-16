'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";

const receiveInputModal = ({open,onClose,setUpdateInfo,idx}) => {

    const [receiveProducts, setReceiveProducts] = useState([]);
    const [info, setInfo] = useState([]);
    const [row, setRow] = useState(3);

    const [productList, setProductList] = useState([]);
    const [productSearch1, setProductSearch1] = useState('');
    const [productSearch2, setProductSearch2] = useState('');
    const [productFocused, setProductFocused] = useState({});

    const [optionList, setOptionList] = useState([]);
    const [searchOption, setSearchOption] = useState([]);
    const [optionSearch1, setOptionSearch1] = useState('');
    const [optionSearch2, setOptionSearch2] = useState('');
    const [optionFocused, setOptionFocused] = useState([]);

    useEffect(() => {
        if (idx === null) return;
        getReceiveProduct();
    },[idx])

    useEffect(() => {
        console.log('옵션리스트',optionList);
    }, [optionList]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProductSearch2(productSearch1);
            // // console.log('유저 검색');
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearch1]);

    useEffect(() => {
        getReceiveProduct(productSearch2);
    }, [productSearch2]);

    const filterOptionList = (searchText='') => {
        let filteredOptionList = optionList.filter(f=>f.option_name.contain(searchText));
        setSearchOption(filteredOptionList);
    }

    useEffect(() => {
        const timer = setTimeout(()=>{
            setOptionSearch2(optionSearch1);
        },300);

        return () => clearTimeout(timer);
    },[optionSearch1])

    useEffect(()=>{
        filterOptionList();
    },[optionSearch2])

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setReceiveProducts([]);
        setInfo({});
        setProductSearch1('');
        setProductSearch2('');
        setProductFocused({});
        setOptionList([]);
        onClose();
    };

    // info 입력
    const changeInfo = (i,filed,value) => {
        // const {name,value} =e.target;
        setInfo((prev)=>{
            const updated = [...prev];
            const item = updated[i] || {};
            updated[i] = {
                ...item,
                filed:value
            }
            return updated;
        });
    }

    // idx로 receive_product 가져오기
    const getReceiveProduct = async (searchText='') => {
        const {data} = await axios.post('http://localhost:8080/receiveProduct/list',{page:1,receive_idx:idx,search:searchText,limit:false});
        console.log('입고상품',data);
        setReceiveProducts(data.list);
    }

    if (!open) return null;

    return (
        <div
            className="modal_overlay"
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="modal_content"
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '40px 30px',
                    minWidth: '320px',
                    position: 'relative',
                    width: '700px'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '3rem',
                        cursor: 'pointer'
                    }}
                    onClick={handleClose}
                >
                    ×
                </button>
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>입고 정보</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>상품 코드</th>
                                            <th>상품명</th>
                                            <th>옵션명</th>
                                            <th>수량</th>
                                            <th>보관 위치</th>
                                            <th>제조일자</th>
                                            <th>유통기한</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {Array.from({ length: row }, (_, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="상품 검색"
                                                        value={optionSearch1}
                                                        onChange={(e) => setOptionSearch1(e.target.value)}
                                                        onFocus={() => {
                                                            setProductFocused(prev=>({...prev,i:true}));
                                                            getReceiveProduct(productSearch1);
                                                        }}
                                                        onBlur={() => setTimeout(() => setProductFocused(prev=>({...prev,i:false})), 120)}
                                                    />
                                                    {productFocused[i]===true ? (<>
                                                        {receiveProducts?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {receiveProducts?.map((rp) => (
                                                                    <li
                                                                        key={rp.receive_product_idx}
                                                                        onClick={() => {
                                                                            changeInfo(i,'product_idx',rp.product_idx);
                                                                            changeInfo(i,'product_name',rp.product_name);
                                                                            setProductSearch1(rp.product_name);
                                                                            setOptionList(receiveProducts.filter(item=>item.product_idx === rp.product_idx));
                                                                        }}
                                                                        className="listBox-option-item margin-0"
                                                                    >
                                                                        {rp.product_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {receiveProducts?.length === 0 && productSearch1 && (
                                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                        )}
                                                    </>):('')}
                                                </div>
                                            </td>
                                            <td>
                                                <input type='text' value={info[i]?.product_name || ''} />
                                            </td>
                                            <td>
                                                <div className="listBox-container">
                                                    <input
                                                        type="text"
                                                        className="width-100 border rounded"
                                                        placeholder="상품 검색"
                                                        value={optionSearch1}
                                                        onChange={(e) => setOptionSearch1(e.target.value)}
                                                        onFocus={() => {
                                                            setOptionFocused(prev=>({...prev,i:true}));
                                                            filterOptionList(optionSearch1);
                                                        }}
                                                        onBlur={() => setTimeout(() => setProductFocused(prev=>({...prev,i:false})), 120)}
                                                    />
                                                    {productFocused[i]===true ? (<>
                                                        {receiveProducts?.length > 0 && (
                                                            <ul className="listBox-option">
                                                                {receiveProducts?.map((rp) => (
                                                                    <li
                                                                        key={rp.receive_product_idx}
                                                                        onClick={() => {
                                                                            changeInfo(i,'product_idx',rp.product_idx);
                                                                            changeInfo(i,'product_name',rp.product_name);
                                                                            setProductSearch1(rp.product_name);
                                                                            setOptionList(receiveProducts.filter(item=>item.product_idx === rp.product_idx));
                                                                        }}
                                                                        className="listBox-option-item margin-0"
                                                                    >
                                                                        {rp.product_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {receiveProducts?.length === 0 && productSearch1 && (
                                                            <div className="position-absolute z-10 width-100 back-ground-white border px-2 py-1 h-over-sky">검색 결과 없음</div>
                                                        )}
                                                    </>):('')}
                                                </div>
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default receiveInputModal;