'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";

const ReceiveProductModal = ({open,onClose,idx}) => {

    const [productList,setProductList] = useState([]);

    useEffect(()=>{
        if(idx === 0) return;
        getProductList();
    },[idx])

    const getProductList = async() => {
        const {data} = await axios.post('http://localhost:8080/receiveProduct/list',{receive_idx:idx})
        console.log(data);
        setProductList(data.list);
    }

    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
        setProductList([]);
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
                <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>입고 상품</h3>
                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                           <table>
                               <thead>
                                    <tr>
                                        <th>상품 코드</th>
                                        <th>상품명</th>
                                        <th>옵션명</th>
                                        <th>수량</th>
                                    </tr>
                               </thead>
                               <tbody>
                               {productList?.map((product) => (
                                   <tr key={product.receive_product_idx}>
                                       <th>{product.product_idx || ''}</th>
                                       <th>{product.product_name || ''}</th>
                                       <th>{product.combined_name ? product.combined_name : '없음'}</th>
                                       <th>{product.receive_cnt}</th>
                                   </tr>
                               ))}
                               </tbody>
                           </table>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default ReceiveProductModal;