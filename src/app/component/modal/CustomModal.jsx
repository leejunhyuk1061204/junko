'use client'

import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomModal({ editItem, onClose, onSuccess }) {
    const [info, setInfo] = useState({
        custom_name: '',
        custom_owner: '',
        custom_phone: '',
        custom_fax: '',
        custom_type: '',
        business_number: '',
        account_number: '',
        bank: '',
        email: ''
    });

    useEffect(() => {
        if (editItem) {
            setInfo(editItem);
        }
    }, [editItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");

        const url = editItem
            ? "http://localhost:8080/custom/update"
            : "http://localhost:8080/custom/insert";

        const method = editItem ? "put" : "post";

        try {
            const res = await axios[method](url, info, {
                headers: {
                    Authorization: token
                }
            });

            if (res.data.success) {
                alert(editItem ? "수정 완료" : "등록 완료");
                onSuccess();
            } else {
                alert("실패했습니다");
            }
        } catch (err) {
            console.error(err);
            alert("요청 중 오류 발생");
        }
    };

    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content">
                <h3>{editItem ? "거래처 수정" : "거래처 등록"}</h3>
                <form onSubmit={handleSubmit}>
                    {[
                        { label: "거래처명 *", name: "custom_name", required: true },
                        { label: "대표자명", name: "custom_owner" },
                        { label: "연락처", name: "custom_phone" },
                        { label: "팩스번호", name: "custom_fax" },
                        { label: "거래처 유형", name: "custom_type" },
                        { label: "사업자등록번호", name: "business_number" },
                        { label: "계좌번호", name: "account_number" },
                        { label: "은행명", name: "bank" },
                        { label: "이메일", name: "email", type: "email" },
                    ].map(({ label, name, required, type = "text" }) => (
                        <div className="custom-form-row" key={name}>
                            <label>{label}</label>
                            <input
                                type={type}
                                name={name}
                                className="custom-input"
                                value={info[name] || ""}
                                onChange={handleChange}
                                required={required}
                            />
                        </div>
                    ))}

                    <div className="custom-form-actions">
                        <button type="submit" className="product-btn">
                            {editItem ? "수정" : "등록"}
                        </button>
                        <button type="button" className="btn" onClick={onClose}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
