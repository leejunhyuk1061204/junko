'use client'

import { useEffect, useState } from "react"
import axios from "axios"

export default function EntryRegistModal({ open, onClose, onSuccess }) {
    const [form, setForm] = useState({
        entry_type: '',
        amount: '',
        entry_date: '',
        custom_name: '',
        customer_name: '',
    })

    const [customIdx, setCustomIdx] = useState(null)
    const [customerIdx, setCustomerIdx] = useState(null)
    const [file, setFile] = useState(null)

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm({...form, [name]: value})
    }

    const fetchCustomIdx = async () => {
        if (!form.custom_name) return
        try {
            const res = await axios.get(`http://192.168.0.122:8080/custom/findByName`, {
                params: {name: form.custom_name}
            })
            setCustomIdx(res.data.custom_idx || null)
        } catch (e) {
            console.error("거래처 조회 실패", e)
        }
    }

    const fetchCustomerIdx = async () => {
        if (!form.customer_name) return
        try {
            const res = await axios.get(`http://192.168.0.122:8080/sales/findByName`, {
                params: {name: form.customer_name}
            })
            setCustomerIdx(res.data.sales_idx || null)
        } catch (e) {
            console.error("고객 조회 실패", e)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.custom_name) fetchCustomIdx()
        }, 300)
        return () => clearTimeout(timer)
    }, [form.custom_name])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.customer_name) fetchCustomerIdx()
        }, 300)
        return () => clearTimeout(timer)
    }, [form.customer_name])

    const handleSubmit = async () => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
        const user_idx = (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0);

        if (!form.entry_type || !form.amount || !form.entry_date) {
            alert("필수 항목을 입력하세요");
            return;
        }

        const data = new FormData();
        data.append("entry_type", form.entry_type);
        data.append("amount", form.amount);
        data.append("entry_date", form.entry_date);


        if (form.custom_name) {
            const res = await axios.get("http://192.168.0.122:8080/custom/findByName", {
                params: {name: form.custom_name.trim()}
            });
            if (res.data.custom_idx !== undefined) {
                data.append("custom_idx", res.data.custom_idx);
            } else {
                alert("유효하지 않은 거래처명입니다!");
                return;
            }
        }

        if (form.customer_name) {
            const res = await axios.get("http://192.168.0.122:8080/sales/findByName", {
                params: {name: form.customer_name.trim()}
            });
            if (res.data.sales_idx !== undefined) {
                data.append("sales_idx", res.data.sales_idx);
            } else {
                alert("유효하지 않은 고객명입니다!");
                return;
            }
        }

        if (file) data.append("file", file);

        const res = await axios.post("http://192.168.0.122:8080/accountRegist", data, {
            headers: {
                Authorization: token,
                user_idx: user_idx
            }
        });

        if (!res.data.success || !res.data.entry_idx) {
            alert("전표 등록 실패");
            return;
        }

        if (res.data.success) {
            const voucher_idx = res.data.entry_idx; // 전표 번호

            const documentInsertRes = await axios.post("http://192.168.0.122:8080/document/insert", {
                template_idx: 10,
                user_idx: user_idx,
                variables: {
                    entry_idx: voucher_idx,
                    entry_code: `JV${form.entry_date.replaceAll('-', '')}${voucher_idx}`,
                    entry_type: form.entry_type,
                    custom_name: form.custom_name.trim(),
                    sales_name: form.customer_name.trim(),
                    amount: Number(form.amount).toLocaleString(),  // "123,400,000"
                    entry_date: form.entry_date,
                    status: "작성중",
                    user_name: (typeof window !== "undefined" ? sessionStorage.getItem("user_name") : "") || "미지정"
                }
            });

            if (documentInsertRes.data.success) {
                const document_idx = documentInsertRes.data.document_idx;

                const pdfRes = await axios.post("http://192.168.0.122:8080/document/pdf", {
                    document_idx: document_idx
                });

                if (!pdfRes.data.success) {
                    alert("PDF 생성 실패");
                    return;
                }
            } else {
                alert("문서 생성 실패");
                return;
            }

            // 파일 업로드 (기존 로직 유지)
            if (res.data.success && voucher_idx && file) {
                const uploadData = new FormData();
                uploadData.append("file", file);

                const uploadRes = await axios.post(
                    `http://192.168.0.122:8080/file/upload/account/${voucher_idx}`,
                    uploadData,
                    {
                        headers: {
                            Authorization: token,
                            user_idx: user_idx,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                for (let pair of data.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }

                if (!uploadRes.data.success) {
                    alert("파일 업로드 실패");
                    return;
                }
            }

            alert("전표 등록 및 문서 생성 완료!");
            onSuccess();
            onClose();

        } else {
            alert("등록 실패 또는 로그인 필요");
        }
    }
        if (!open) return null

        return (
            <div className="entryRegist-modal" onClick={onClose}>
                <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                    <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                    <h3 className="entryRegist-modal-title">회계 전표 등록</h3>

                    <table className="entryRegist-table">
                        <tbody>
                        <tr>
                            <th>전표 유형</th>
                            <td>
                                <select name="entry_type" value={form.entry_type} onChange={handleChange}>
                                    <option value="">선택</option>
                                    <option value="매입">매입</option>
                                    <option value="매출">매출</option>
                                    <option value="환불">환불</option>
                                    <option value="수금">수금</option>
                                    <option value="지급">지급</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>금액</th>
                            <td><input type="number" name="amount" value={form.amount} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <th>전표 일자</th>
                            <td><input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <th>거래처명</th>
                            <td><input type="text" name="custom_name" value={form.custom_name} onChange={handleChange} /></td>
                        </tr>
                        <tr>
                            <th>고객명</th>
                            <td><input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} /></td>
                        </tr>
                        <tr style={{ display: 'none' }}>
                            <th>첨부파일</th>
                            <td><input type="file" onChange={(e) => setFile(e.target.files[0])} /></td>
                        </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                        <button className="entryList-fabBtn blue" onClick={handleSubmit}>등록</button>
                    </div>
                </div>
            </div>
        )

}
