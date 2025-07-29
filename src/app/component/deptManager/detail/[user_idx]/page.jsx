'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EmployeeDetailPage({ params }) {
    const user_idx = params.user_idx;
    const router = useRouter();
    const [user, setUser] = useState({});
    const [form, setForm] = useState({});
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) return;
        axios.get(`http://localhost:8080/user/detail/${user_idx}`, {
            headers: { Authorization: token }
        }).then(res => {
            const detail = res.data.userDetail;
            setUser(detail);
            setForm(detail);
        });
    }, [user_idx]);

    const handleUpdateJobDept = async () => {
        const { dept_idx, job_idx } = form;
        await axios.post("http://localhost:8080/JobNdept/update", { dept_idx, job_idx, user_idx }, {
            headers: { Authorization: token }
        });
        alert("직책/부서가 수정되었습니다.");
    };

    const handleResign = async () => {
        if (!confirm("퇴사 처리 하시겠습니까?")) return;
        await axios.post("http://localhost:8080/resign/update", { user_idx }, {
            headers: { Authorization: token }
        });
        alert("퇴사 처리 완료");
        router.push('/component/deptManager'); // 목록으로 이동
    };

    const handleEmpUpdate = async () => {
        await axios.post("http://localhost:8080/emp/update", form, {
            headers: { Authorization: token }
        });
        alert("정보 수정 완료");
    };

    return (
        <div className="wrap page-background">
            <h1>직원 상세</h1>
            <div>
                <label>이름</label>
                <input value={form.user_name || ''} onChange={e => setForm({ ...form, user_name: e.target.value })} />
            </div>
            <div>
                <label>부서</label>
                <input value={form.dept_idx || ''} onChange={e => setForm({ ...form, dept_idx: e.target.value })} />
            </div>
            <div>
                <label>직책</label>
                <input value={form.job_idx || ''} onChange={e => setForm({ ...form, job_idx: e.target.value })} />
            </div>
            <div>
                <button onClick={handleUpdateJobDept}>직책/부서 수정</button>
                <button onClick={handleEmpUpdate}>기타 정보 수정</button>
                <button onClick={handleResign}>퇴사 처리</button>
            </div>
        </div>
    );
}