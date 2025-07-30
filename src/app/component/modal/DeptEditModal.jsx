'use client'
import { useState, useEffect } from "react"
import axios from "axios"

export default function DeptEditModal({ entry_idx, dept, onClose, onSuccess }) {
    const [form, setForm] = useState({
        as_idx: '',
        amount: '',
        type: '차변',
    })

    const [subjects, setSubjects] = useState([])

    // 기존 분개 정보 세팅
    useEffect(() => {
        if (dept) {
            setForm({
                as_idx: dept.as_idx || '',
                amount: dept.amount || '',
                type: dept.type || '차변',
            })
        }
    }, [dept])

    // 계정과목 리스트 불러오기
    useEffect(() => {
        axios.get("http://localhost:8080/accountSubjectList")
            .then(res => setSubjects(res.data || []))
            .catch(err => console.error("계정과목 불러오기 실패", err))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async () => {
        const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "")
        const user_idx = (typeof window !== "undefined" ? sessionStorage.getItem("user_idx") : 0)

        try {
            const res = await axios.put(
                `http://192.168.0.122:8080/accountDeptUpdate/${entry_idx}/details/${dept.dept_idx}`,
                {
                    as_idx: form.as_idx,
                    amount: form.amount,
                    type: form.type,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        user_idx
                    }
                }
            )

            if (res.data.result === "success") {
                alert("수정 완료!")
                onSuccess()
                onClose()
            } else {
                alert("수정 실패")
            }
        } catch (err) {
            console.error("수정 오류", err)
            alert("오류 발생")
        }
    }

    if (!dept) return null

    return (
        <div className="entryRegist-modal" onClick={onClose}>
            <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">회계 분개 수정</h3>

                <div className="entryRegist-form-item">
                    <label>계정과목</label>
                    <select name="as_idx" value={form.as_idx} onChange={handleChange}>
                        <option value="">선택</option>
                        {subjects.map(sub => (
                            <option key={sub.as_idx} value={sub.as_idx}>
                                {sub.as_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="entryRegist-form-item">
                    <label>금액</label>
                    <input type="number" name="amount" value={form.amount} onChange={handleChange} />
                </div>

                <div className="entryRegist-form-item">
                    <label>차변/대변</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                        <option value="차변">차변</option>
                        <option value="대변">대변</option>
                    </select>
                </div>

                <button className="entryList-fabBtn blue" onClick={handleSubmit}>수정</button>
            </div>
        </div>
    )
}
