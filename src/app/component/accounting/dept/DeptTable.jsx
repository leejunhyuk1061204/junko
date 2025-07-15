'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import DeptRegistModal from "@/app/component/modal/DeptRegistModal";
import DeptEditModal from "@/app/component/modal/DeptEditModal"

export default function DeptTable({ entry_idx }) {
    const [deptList, setDeptList] = useState([])
    const [selectedDept, setSelectedDept] = useState(null)
    const [showRegistModal, setShowRegistModal] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(null)

    const fetchDeptList = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/accountDeptList/${entry_idx}/detail`)
            setDeptList(res.data.data || [])
        } catch (e) {
            console.error("분개 리스트 로딩 실패", e)
        }
    }

    useEffect(() => {
        if (entry_idx) fetchDeptList()
    }, [entry_idx])

    const handleDelete = async (dept_idx) => {
        if (!window.confirm("정말 삭제할까요?")) return
        try {
            await axios.delete(`http://localhost:8080/accountDeptDelete/${entry_idx}/details/${dept_idx}`)
            alert("삭제 완료!")
            fetchDeptList()
        } catch (e) {
            alert("삭제 중 오류 발생")
        }
    }

    return (
        <div className="flex gap-4">
            {/* 📋 왼쪽: 분개 테이블 */}
            <div className="w-2/3 dept-section">
                <div className="flex justify-between items-center mb-2">
                    <h4>📘 분개 목록</h4>
                    <button className="entryList-fabBtn blue" onClick={() => setShowRegistModal(true)}>분개 등록</button>
                </div>

                <table className="entryList-table">
                    <thead>
                    <tr>
                        <th>분개번호</th>
                        <th>계정과목</th>
                        <th>차/대변</th>
                        <th>금액</th>
                        <th>파일</th>
                        <th>PDF</th>
                        <th>수정/삭제</th>
                    </tr>
                    </thead>
                    <tbody>
                    {deptList.map(dept => (
                        <tr key={dept.dept_idx}>
                            <td>{dept.dept_idx}</td>
                            <td>{dept.as_name}</td>
                            <td>{dept.type}</td>
                            <td>{dept.amount.toLocaleString()}원</td>
                            <td>
                                <a href={`http://localhost:8080/deptfileDown/${dept.file_idx}`} target="_blank">다운로드</a>
                            </td>
                            <td>
                                <button
                                    className="entryList-fabBtn gray"
                                    onClick={async () => {
                                        try {
                                            const res = await axios.post("http://localhost:8080/accountDeptPdf", {
                                                dept_idx: dept.dept_idx,
                                                template_idx: 20 // ← 템플릿 번호에 맞게 변경
                                            })
                                            if (res.data.success) {
                                                const url = `http://localhost:8080/entryFileDown/${res.data.file_idx}?preview=true`
                                                setPreviewUrl(url)
                                            } else {
                                                alert("PDF 생성 실패")
                                            }
                                        } catch (err) {
                                            console.error("PDF 미리보기 오류", err)
                                            alert("PDF 미리보기 실패")
                                        }
                                    }}
                                >
                                    미리보기
                                </button>
                            </td>
                            <td>
                                <button
                                    className="entryList-fabBtn gray"
                                    onClick={() => {
                                        setSelectedDept(dept)
                                        setEditModalOpen(true)
                                    }}
                                >✏️</button>
                                <button
                                    className="entryList-fabBtn red-del"
                                    onClick={() => handleDelete(dept.dept_idx)}
                                >🗑</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {showRegistModal && (
                    <DeptRegistModal
                        entry_idx={entry_idx}
                        onClose={() => {
                            setShowRegistModal(false)
                            fetchDeptList()
                        }}
                    />
                )}

                {editModalOpen && selectedDept && (
                    <DeptEditModal
                        entry_idx={entry_idx}
                        dept={selectedDept}
                        onClose={() => setEditModalOpen(false)}
                        onSuccess={fetchDeptList}
                    />
                )}
            </div>

            {/* 🖼 오른쪽: PDF 미리보기 패널 */}
            <div className="w-1/3">
                {previewUrl && (
                    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h4>📄 PDF 미리보기</h4>
                            <button className="entryList-fabBtn gray" onClick={() => setPreviewUrl(null)}>닫기</button>
                        </div>
                        <iframe
                            src={previewUrl}
                            width="100%"
                            height="600px"
                            style={{ border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
