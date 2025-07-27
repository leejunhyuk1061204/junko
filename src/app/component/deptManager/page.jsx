'use client'

import React, {useEffect, useState} from 'react';
import { OrganizationChart } from 'primereact/organizationchart';
import 'primereact/resources/themes/lara-light-blue/theme.css'; // 테마
import 'primereact/resources/primereact.min.css';                    // 컴포넌트 스타일
import 'primeicons/primeicons.css';
import axios from "axios";                                        // 아이콘

export default function OrgChartPage() {
    const [data, setData] = useState([]);
    const [selectedInfo, setSelectedInfo] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        axios.get('https://localhost:8080/orgchart/tree', {
            headers: {Authorization: token},
        }).then(res => {
            console.log("!!!!!!!!!!!!!!!!!!!", res.data);
            const flatList = res.data.deptTree;
            const converted = convertToOrgChartFormat(flatList, handleUserClick);
            setData(converted);
        });
    }, []);

    const handleUserClick = (user) => {
        setSelectedInfo({
            name: user.user_name,
            job: user.job_name,
            phone: user.phone,
            hire_date: user.hire_date,
        });
    };

    return (
        <div className="flex">
            <div className="card overflow-x-auto">
                <OrganizationChart value={data} />
            </div>

            {/*상세정보 영역*/}
            <div>
                <h3>직원 정보</h3>
                {selectedInfo ? (
                    <ul>
                        <li><strong>이름:</strong> {selectedInfo.name}</li>
                        <li><strong>직급:</strong> {selectedInfo.job}</li>
                        <li><strong>전화번호:</strong> {selectedInfo.phone}</li>
                        <li><strong>입사일:</strong> {selectedInfo.hire_date}</li>
                    </ul>
                ) : (
                    <p>직원을 선택하세요.</p>
                )}
            </div>
        </div>
    );
}

// flatList → Primereact용 트리 변환 함수
function convertToOrgChartFormat(flatList, onUserClick) {
    const map = {};
    const roots = [];

    // 1. 모든 dept 초기화
    flatList.forEach(item => {
        map[item.dept_idx] = {
            key: `dept-${item.dept_idx}`,
            label: item.dept_name,
            expanded: true,
            children: []
        };
    });

    // 2. 직원 추가 (부서에)
    flatList.forEach(item => {
        const deptNode = map[item.dept_idx];
        if (!deptNode) return;

        if (item.users && item.users.length > 0) {
            const userNodes = item.users.map(user => ({
                key: `user-${user.user_idx}`,
                label: `${user.user_name} (${user.job_name})`,
                type: 'user',
                selectable: true,
                className: 'cursor-pointer hover:underline',
                command: () => onUserClick(user)
            }));
            deptNode.children.push(...userNodes);
        }
    });

    // 3. 계층 연결
    flatList.forEach(item => {
        const node = map[item.dept_idx];
        if (item.parent_idx && map[item.parent_idx]) {
            map[item.parent_idx].children.push(node);
        } else if (!item.parent_idx) {
            roots.push(node);
        }
    });

    return roots;
}