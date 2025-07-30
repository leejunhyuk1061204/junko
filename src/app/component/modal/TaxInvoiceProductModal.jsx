import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../globals.css';

const TaxInvoiceProductModal = ({ open, onClose, invoice_idx, detailData, onSaved }) => {
    const [item, setItem] = useState({
        item_name: '',
        quantity: 1,
        price: 0,
        total_amount: 0,
    });

    useEffect(() => {
        if (detailData) {
            setItem(detailData);
        } else {
            setItem({ item_name: '', quantity: 1, price: 0, total_amount: 0 });
        }
    }, [detailData]);

    useEffect(() => {
        const total = item.quantity * item.price;
        setItem((prev) => ({ ...prev, total_amount: total }));
    }, [item.quantity, item.price]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem({ ...item, [name]: name === 'item_name' ? value : Number(value) });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = detailData
                ? `http://192.168.0.122/prodDetailUpdate/${invoice_idx}/detail/${detailData.detail_idx}`
                : `http://192.168.0.122/addProdDetail/${invoice_idx}/detail`;
            const method = detailData ? 'put' : 'post';

            const res = await axios[method](url, item, {
                headers: { Authorization: token },
            });

            if (res.data.success) {
                alert('품목 저장 완료!');
                onSaved();
                onClose();
            } else {
                alert('저장 실패: ' + res.data.message);
            }
        } catch (err) {
            console.error('품목 저장 오류', err);
        }
    };

    if (!open) return null;

    return (
        <div className="modal">
            <div className="modal-content w-[500px] p-6 bg-white rounded shadow-md">
                <h2 className="text-lg font-bold mb-4">품목 {detailData ? '수정' : '추가'}</h2>

                <div className="mb-3">
                    <label>품목명</label>
                    <input
                        type="text"
                        name="item_name"
                        value={item.item_name}
                        onChange={handleChange}
                        className="input-box w-full"
                    />
                </div>

                <div className="mb-3 flex gap-4">
                    <div className="flex-1">
                        <label>수량</label>
                        <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={handleChange}
                            className="input-box w-full"
                        />
                    </div>

                    <div className="flex-1">
                        <label>단가</label>
                        <input
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={handleChange}
                            className="input-box w-full"
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label>총 금액</label>
                    <input
                        type="number"
                        name="total_amount"
                        value={item.total_amount}
                        readOnly
                        className="input-box w-full bg-gray-100"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button className="btn-blue" onClick={handleSubmit}>저장</button>
                    <button className="btn-gray" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default TaxInvoiceProductModal;
