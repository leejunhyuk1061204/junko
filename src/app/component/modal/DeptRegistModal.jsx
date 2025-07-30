'use client'
import { useState, useEffect } from "react"
import axios from "axios"

export default function DeptRegistModal({ entry_idx, onClose, onSuccess }) {
    const [form, setForm] = useState({
        as_idx: '',
        amount: '',
        type: '차변',
        file: null,
    })

    const [subjects, setSubjects] = useState([])

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

        if (!form.as_idx || !form.amount) {
            alert("계정과목과 금액을 입력해주세요")
            return
        }

        try {
            // 1. 분개 등록
            const res = await axios.post(
                `http://192.168.0.122:8080/accountDeptAdd/${entry_idx}/details`,
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

            console.log("등록 응답:", res.data)

            const success = res.data.success || res.data.result === 'success'

            if (success) {
                if (form.file) {
                    const fileData = new FormData()
                    fileData.append("file", form.file)
                    await axios.post(`http://192.168.0.122:8080/accountDeptFile/${entry_idx}/details/${res.data.dept_idx}`, fileData)
                }

                alert("분개 등록 완료")
                onSuccess();
                onClose()
            } else {
                alert("분개 등록 실패: " + (res.data.message || '서버 응답 실패'))
            }
        } catch (err) {
            console.error("분개 등록 오류", err)
            alert("오류 발생: " + err.message)
        }

    }

    return (
        <div className="entryRegist-modal" onClick={onClose}>
            <div className="entryRegist-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="entryRegist-modal-close" onClick={onClose}>×</button>
                <h3 className="entryRegist-modal-title">회계 분개 등록</h3>

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

                <div className="entryRegist-form-item">
                    <label>첨부파일</label>
                    <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} />
                </div>

                <button className="entryList-fabBtn blue" onClick={handleSubmit}>등록</button>
            </div>
        </div>
    )
}
