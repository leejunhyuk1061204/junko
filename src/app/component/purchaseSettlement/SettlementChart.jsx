'use client';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#ff4d4f', '#faad14', '#52c41a']; // 미정산, 부분정산, 정산

export default function SettlementChart({ data }) {
    // 상태별 개수 계산
    const statusCount = {
        '미정산': 0,
        '부분정산': 0,
        '정산': 0,
    };

    data.forEach(item => {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });

    const chartData = Object.keys(statusCount).map((key) => ({
        name: key,
        value: statusCount[key],
    }));

    return (
        <div className="settlement-chart">
            <h3>정산 상태 분포</h3>
            <PieChart width={300} height={250}>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}
