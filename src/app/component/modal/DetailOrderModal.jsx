'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";

const DetailOrderModal = ({open,onClose,idx}) => {

    const [order, setOrder] = useState([]);
    const [orderProducts, setOrderProducts] = useState([]);
    const [orderPlans, setOrderPlans] = useState([]);
    const [planProducts, setPlanProducts] = useState([]);
    const [fileInfo, setFileInfo] = useState({});
    const [file, setFile] = useState(null);

    useEffect(() => {
        if(idx===null) return;
        getOrder();
        getFileInfo();
    }, [idx]);

    useEffect(() => {
        getFile();
    }, [fileInfo]);

    const onLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };


    // 발주서
    const getFileInfo = async ()=>{
        const {data} = await axios.get(`http://localhost:8080/file/search/${idx}`);
        console.log(data);
        if(data.success){
            setFileInfo({success:true, fileInfo:data.file});
        }else {
            setFileInfo({success:false});
        }
    }

    const getFile = async ()=>{
        const {data} = await axios.get(`http://localhost:8080/pdf/preview/${fileInfo?.fileInfo?.new_filename}.pdf`,{
            responseType:'blob',
        });

        console.log(data);
        const fileURL = URL.createObjectURL(data);
        setFile(fileURL);
    }

    // order 가져오기
    const getOrder = async () =>{
        const {data} = await axios.get(`http://localhost:8080/order/full/detail/${idx}`);
        console.log(data);
        setOrder(data.full.order);
        setOrderProducts(data.full.orderProduct);
        setOrderPlans(data.full.orderPlan);
    }


    // 모달이 닫힐 때 상태 초기화
    const handleClose = () => {
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
                    width: '1000px',
                    overflowY: 'auto',
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

                <>

                    {/* 탭 내용 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <>
                            <div className='back-ground-white margin-30  padding-30 width-auto flex back-radius flex-direction-col margin min-width-400'>
                                <div className='flex gap_20 justify-content-between'>
                                    <div className='flex flex-direction-col margin-bottom-20  justify-content-left gap_5' style={{flex:'0 0 30%'}}>
                                        <div className='order-product-text margin-bottom-10 text-align-left'>발주 정보</div>
                                        <div className='flex align-center gap_15'>
                                            <div className='max-width-80 white-space-nowrap width'>담당자</div>
                                            <div><input type='text' className='border-none-important' value={order?.user_name || ''} readOnly={true}/></div>
                                        </div>
                                        <div className='flex align-center gap_15'>
                                            <div className='max-width-80 white-space-nowrap'>거래처</div>
                                            <div><input type='text' className='border-none-important' value={order?.custom_name || ''} readOnly={true}/></div>
                                        </div>
                                        <div className='flex align-center gap_15'>
                                            <div className='max-width-80 white-space-nowrap'>입고 창고</div>
                                            <div><input type='text' className='border-none-important' value={order?.warehouse_name || ''} readOnly={true}/></div>
                                        </div>
                                        <div className='flex align-center gap_15'>
                                            <div className='max-width-80 white-space-nowrap'>날짜</div>
                                            <div><input type='text' className='border-none-important' value={order?.reg_date || ''} readOnly={true}/></div>
                                        </div>
                                    </div>
                                    <div style={{flex:'0 0 60%'}}>
                                        <div className='order-product-text margin-bottom-20 text-align-left'>납품 계획</div>
                                        <table className='plan-table'>
                                            <thead>
                                            <tr>
                                                <th>상품 코드</th>
                                                <th>상품 이름</th>
                                                <th>상품 옵션</th>
                                                <th>상품 수량</th>
                                                <th>납품 일자</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {orderPlans?.map(plan=>(
                                                plan.planProduct?.map(product=>(
                                                    <tr key={product.plan_product_idx}>
                                                        <td>{orderProducts.find(item=>item.order_product_idx === product.order_product_idx).product_idx}</td>
                                                        <td>{orderProducts.find(item=>item.order_product_idx === product.order_product_idx).product_name}</td>
                                                        <td>{orderProducts.find(item=>item.order_product_idx === product.order_product_idx).product_option_idx === 0 ?
                                                            '없음' :
                                                            orderProducts.find(item=>item.order_product_idx === product.order_product_idx).combined_name}</td>
                                                        <td>{product.order_cnt}</td>
                                                        <td>{plan.delivery_date}</td>
                                                    </tr>
                                                ))
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className='margin-y-20 '>
                                    <div className='order-product-text margin-bottom-10 text-align-left'>발주 품목</div>
                                    <table className='order-table text-overflow-ellipsis'>
                                        <thead>
                                        <tr>
                                            <th>상품 코드</th>
                                            <th>상품 이름</th>
                                            <th>상품 옵션</th>
                                            <th>단가</th>
                                            <th>수량</th>
                                            <th>공급가액</th>
                                            <th>부가세</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {orderProducts?.map(p=>(
                                            <tr key={p.order_product_idx}>
                                                <td>{p.product_idx}</td>
                                                <td>{p.product_name}</td>
                                                <td>{p.product_option_idx === 0 ? '없음':p.combined_name}</td>
                                                <td>{p.purchase_price}</td>
                                                <td>{p.order_cnt}</td>
                                                <td>{p.purchase_price*p.order_cnt}</td>
                                                <td>{p.purchase_price*p.order_cnt*0.1}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {fileInfo.success ? (
                                    <div>

                                    </div>
                                ):(<div><p>발주서가 없습니다.</p></div>)}
                            </div>
                        </>
                    </div>
                </>
            </div>
        </div>
    );
};

export default DetailOrderModal;