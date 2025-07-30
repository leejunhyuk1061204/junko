'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from '@headlessui/react';
import {useAlertModalStore} from "@/app/zustand/store";

const EmployeeEdit = ({ user_idx, onClose, getUserDetail }) => {
    const {openModal} = useAlertModalStore();
    const [form, setForm] = useState({});
    const [deptList, setDeptList] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    useEffect(() => {
        if (!token || !user_idx) return;
        // 직원 상세 정보 불러오기
        axios.get(`http://192.168.0.122:8080/user/detail/${user_idx}`, {
            headers: { Authorization: token }
        }).then(res => {
            const detail = res.data.userDetail;
            setForm(detail);
        });

        // 부서 목록
        axios.get(`http://192.168.0.122:8080/dept/list`, {
            headers: { Authorization: token }
        }).then(res => setDeptList(res.data.list));

        // 직책 목록
        axios.get(`http://192.168.0.122:8080/job/list`)
            .then(res => setJobList(res.data));

        // 근무상태 목록
        axios.get(`http://192.168.0.122:8080/status/list`)
            .then(res => setStatusList(res.data));

        }, []);

    const handleUpdate = async () => {
        await axios.post(`http://192.168.0.122:8080/emp/update`, form, {
            headers: { Authorization: token }
        });
        openModal({
            svg: '✔',
            msg1: '수정 완료',
            msg2: '수정되었습니다.',
            showCancel: false,
            onConfirm: async ()=>{
                await getUserDetail();
            }
        });
        onClose();
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
                background: 'none',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                className="info-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '40px 30px',
                    minHeight: '63vh',
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
                <h1 style={{marginTop: '10px', fontSize: '19px', fontWeight: '600'}}>정보 수정</h1>

                <div className="info-table-wrapper">
                    <table className="info-table">
                        <tbody>
                        <tr>
                            <th>아이디</th>
                            <td>
                                <input
                                    value={form.user_id || ''}
                                    readOnly
                                    className="readonly-input"
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>이름</th>
                            <td>{form.user_name || ''}</td>
                        </tr>
                        <tr>
                            <th>이메일</th>
                            <td>
                                <input value={form.email || ''}
                                       onChange={(e) => setForm({...form, email: e.target.value})}/>
                            </td>
                        </tr>
                        <tr>
                            <th>전화번호</th>
                            <td>
                                <input value={form.phone || ''}
                                       onChange={(e) => setForm({...form, phone: e.target.value})}/>
                            </td>
                        </tr>
                        <tr>
                            <th>주소</th>
                            <td>
                                <input value={form.address || ''}
                                       onChange={(e) => setForm({...form, address: e.target.value})}/>
                            </td>
                        </tr>
                        <tr>
                            <th>입사일</th>
                            <td>{form?.hire_date || '-'}</td>
                        </tr>
                        <tr>
                            <th>부서</th>
                            <td>
                                <Listbox
                                    value={form.dept_idx}
                                    onChange={value => setForm({ ...form, dept_idx: value })}
                                >
                                    <ListboxButton className="select-btn">
                                        {deptList.find(d => d.dept_idx === form.dept_idx)?.dept_name || '선택'}
                                    </ListboxButton>
                                    <ListboxOptions className="option-info">
                                        {deptList.map(dept => (
                                            <ListboxOption key={dept.dept_idx} value={dept.dept_idx} className="option-item">
                                                {dept.dept_name}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Listbox>
                            </td>
                        </tr>
                        <tr>
                            <th>직책</th>
                            <td>
                                <Listbox
                                    value={form.job_idx}
                                    onChange={value => setForm({ ...form, job_idx: value })}
                                >
                                    <ListboxButton className="select-btn">
                                        {jobList.find(j => j.job_idx === form.job_idx)?.job_name || '선택'}
                                    </ListboxButton>
                                    <ListboxOptions className="option-info">
                                        {jobList.map(job => (
                                            <ListboxOption key={job.job_idx} value={job.job_idx} className="option-item">
                                                {job.job_name}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Listbox>
                            </td>
                        </tr>
                        <tr>
                            <th>재직상태</th>
                            <td>
                                <Listbox
                                    value={form.status}
                                    onChange={(value) => setForm({ ...form, status: value })}
                                >
                                    <ListboxButton className="select-btn">
                                        {form.status || '선택'}
                                    </ListboxButton>
                                    <ListboxOptions className="option-info">
                                        {statusList.map((item, idx) => (
                                            <ListboxOption key={idx} value={item.status} className="option-item">
                                                {item.status}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                </Listbox>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>


                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                    <button onClick={onClose} className="doc-detail-btn btn-danger">취소</button>
                    <button onClick={handleUpdate} className="doc-detail-btn btn-primary">수정</button>
                </div>


            </div>
        </div>
    );
};

export default EmployeeEdit;