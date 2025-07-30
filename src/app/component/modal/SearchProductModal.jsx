'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";

const SearchProductModal = ({open,onClose,orderProduct}) => {

    const [products,setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);

    useEffect(() => {
        if(!open) return;
        getProducts();
    },[open,page])

    // 상품 선택

    const selectProdInfo = async (p) =>{
        orderProduct(p);
        setSearch('');
        setPage(1);
        setTotal(1);
        await getProducts();

        onClose();
    }

    // 상품 리스트 검색
    const getProducts = async ()=> {
        const {data} = await axios.post('http://192.168.0.122/productNoption/list',{search:search,page:page});
        console.log(data);
        setProducts(data.list);
        setTotal(data.total);
    }

    const searchEnter = async (e) => {
        if (e.keyCode === 13) {
            await getProducts();
        }
    }

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setProducts([]);
        setSearch('');
        setPage(1);
        setTotal(1);
        onClose();
    };

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
                <h3 style={{fontSize: '15px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>상품 검색</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div className='flex justify-content-between align-items-center gap_20 '>
                                <input style={{margin:'0'}} type='text' value={search} onChange={(e)=>setSearch(e.target.value)} onKeyUp={searchEnter}/>
                                <button className='width-fit btn white-space-nowrap' onClick={getProducts}>검색</button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>상품코드</th>
                                        <th>상품 이름</th>
                                        <th>옵션 이름</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {products && products.map((p,idx)=>(
                                    <tr key={idx} className='cursor-pointer' onClick={()=>selectProdInfo(p)}>
                                        <td>{p.product_idx}</td>
                                        <td className='overflow-hidden text-overflow-ellipsis'>{p.product_name}</td>
                                        <td className='overflow-hidden text-overflow-ellipsis'>{p.combined_name||'없음'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className='flex justify-content-center gap_10'>
                                {page > 1 &&
                                    <button className='btn' onClick={()=>setPage(page-1)}>이전</button>
                                }
                                {page < total &&
                                    <button className='btn' onClick={()=>setPage(page+1)}>다음</button>
                                }
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default SearchProductModal;