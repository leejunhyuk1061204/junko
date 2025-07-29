'use client';

import { useEffect, useState } from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import {useAlertModalStore} from "@/app/zustand/store";

const EmployeeDetailModal = ({user_idx, onClose}) => {
    const {openModal, closeModal} = useAlertModalStore();
    const [form, setForm] = useState({});
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) return;
        axios.get(`http://localhost:8080/user/detail/${user_idx}`, {
            headers: { Authorization: token }
        }).then(res => {
            console.log("!!!!!!!!!!!!",res);
            const detail = res.data.userDetail;
            setForm(detail);
        });
    }, [user_idx]);

    const handleUpdateJobDept = async () => {
        const { dept_idx, job_idx } = form;
        await axios.post("http://localhost:8080/JobNdept/update", { dept_idx, job_idx, user_idx }, {
            headers: { Authorization: token }
        });
        openModal({
            svg: '✔',
            msg1: '처리 완료',
            msg2: '수정되었습니다.',
            showCancel: false,
        });
    };

    const handleEmpUpdate = async () => {
        await axios.post("http://localhost:8080/emp/update", form, {
            headers: { Authorization: token }
        });
        alert("정보 수정 완료");
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
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
                className="info-modal-content"
                onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫히는 이벤트 전파 막음
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '40px 30px',
                    minHeight: '55vh',
                    overflowY: 'auto',
                    position: 'relative',
                    width: '550px',
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        background: 'none',
                        border: 'none',
                        fontSize: '2.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={onClose}
                >
                    &times;
                </button>

                <h1 style={{marginTop: '10px', fontSize: '19px', fontWeight: '600'}}>직원 정보</h1>
                <div className="info-table-wrapper">
                    <table className="info-table">
                        <tbody>
                        <tr><th>아이디</th><td>{form?.user_id || '-'}</td></tr>
                        <tr><th>이름</th><td>{form?.user_name || '-'}</td></tr>
                        <tr><th>이메일</th><td>{form?.email || '-'}</td></tr>
                        <tr><th>전화번호</th><td>{form?.phone || '-'}</td></tr>
                        <tr><th>주소</th><td>{form?.address || '-'}</td></tr>
                        <tr><th>입사일</th><td>{form?.hire_date || '-'}</td></tr>
                        <tr><th>재직상태</th><td>{form?.status || '-'}</td></tr>
                        <tr><th>직책(job_idx)</th><td>{form?.job_idx || '-'}</td></tr>
                        <tr><th>부서(dept_idx)</th><td>{form?.dept_idx || '-'}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                    <button onClick={onClose} className="doc-detail-btn btn-danger">취소</button>
                    <button onClick={handleEmpUpdate} className="doc-detail-btn btn-primary">수정</button>
                </div>
            </div>
        </div>

    );
};

export default EmployeeDetailModal;