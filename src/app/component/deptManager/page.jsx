'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAlertModalStore } from '@/app/zustand/store';
import Header from '@/app/header';

export default function OrgChartPage() {
    const router = useRouter();
    const { openModal } = useAlertModalStore();
    const [treeData, setTreeData] = useState(null);

    // 재귀 트리 렌더링
    const TreeNode = ({ node }) => {
        const [expanded, setExpanded] = useState(true);

        const isDept = !!node.children;
        const isUser = !node.children;

        return (
            <div className="org-tree">
                <div
                    className={`org-node ${isDept ? 'dept-node' : 'user-node'}`}
                    onClick={isDept ? () => setExpanded(!expanded) : undefined}
                >
                    {node.name}
                </div>

                {expanded && node.children && (
                    <div className="org-children">
                        {node.children.map((child, idx) => (
                            <TreeNode key={idx} node={child} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");
            if (!token) {
                openModal({
                    svg: '❗',
                    msg1: '해당 페이지 접근 불가',
                    msg2: '로그인 후 이용해주세요.',
                    showCancel: false,
                    onConfirm: () => router.push('./login'),
                });
                return;
            }

            try {
                const res = await axios.get('http://localhost:8080/orgchart/tree', {
                    headers: { authorization: token },
                });
                const { deptTree, userList } = res.data;
                const tree = convertToTree(deptTree, userList);
                setTreeData(tree);
            } catch (err) {
                console.error('조직도 불러오기 실패', err);
            }
        };
        fetchData();
    }, []);

    // 트리 데이터 변환
    const convertToTree = (flatList, userList) => {
        const deptMap = {};
        flatList.forEach(dept => {
            deptMap[dept.dept_idx] = {
                name: dept.dept_name,
                children: [],
            };
        });

        userList.forEach(user => {
            const dept = deptMap[user.dept_idx];
            if (dept) {
                dept.children.push({ name: `${user.user_name}${user.job_name ? ` ${user.job_name}` : ''}`, info: user });
            }
        });

        const root = { name: '조직도', children: [] };
        flatList.forEach(dept => {
            const node = deptMap[dept.dept_idx];
            if (!dept.parent_idx || dept.parent_idx === 0) {
                root.children.push(node);
            } else {
                deptMap[dept.parent_idx]?.children.push(node);
            }
        });
        return root;
    };

    return (
        <div className="productPage wrap page-background">
            <Header />
            <div className="template-list-back justify-content-between items-center"  style={{ paddingLeft: '40px' }}>
                <div>
                    <h1 className="text-align-left margin-bottom-10 font-bold margin-left-20 doc-manage" style={{ fontSize: "24px" }}>
                        조직도
                    </h1>
                    <div className="org-tree">
                        {treeData ? <TreeNode node={treeData} /> : <p>로딩 중...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}