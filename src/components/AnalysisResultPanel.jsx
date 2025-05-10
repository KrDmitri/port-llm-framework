import React, { useMemo, useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
    Label
} from 'recharts';

function AnalysisResultPanel({ vesselData, selectedDate, selectedPortCode }) {
    const [csvRows, setCsvRows] = useState([]);

    useEffect(() => {
        const cleanRows = rows =>
            rows.map(r => {
                const cleaned = {};
                Object.keys(r).forEach(key => {
                    const k = key.trim();
                    let v = r[key];
                    if (typeof v === 'string') v = v.trim();
                    cleaned[k] = v;
                });
                return cleaned;
            });

        if (vesselData instanceof File) {
            Papa.parse(vesselData, {
                header: true,
                skipEmptyLines: true,
                complete: ({ data, errors }) => {
                    if (errors.length) console.error(errors);
                    setCsvRows(cleanRows(data));
                },
            });
        } else if (Array.isArray(vesselData)) {
            setCsvRows(cleanRows(vesselData));
        } else {
            setCsvRows([]);
        }
    }, [vesselData]);


    const aggregatedByType = useMemo(() => {
        const acc = {};
        csvRows.forEach(row => {
            const port = row['청코드'];
            // selectedPortCode가 있으면 해당 항만(청코드)만
            if (selectedPortCode && port !== selectedPortCode) return;

            const type = row['선종코드'];
            const cnt = Number(row['척수']) || 0;
            const rowYear = String(row['년']);
            const rowMonth = String(row['월']).padStart(2, '0');

            // selectedDate가 있으면 연·월 필터
            if (selectedDate?.year && selectedDate?.month) {
                const selYear = String(selectedDate.year);
                const selMonth = String(selectedDate.month).padStart(2, '0');
                if (rowYear !== selYear || rowMonth !== selMonth) return;
            }

            if (!type) return;
            acc[type] = (acc[type] || 0) + cnt;
        });

        return Object.entries(acc)
            .map(([type, count]) => ({ type, count }));
    }, [csvRows, selectedDate, selectedPortCode]);

    if (aggregatedByType.length === 0) {
        return <div>시각화할 데이터가 없습니다.</div>;
    }

    return (
        // <>
        // </>

        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={aggregatedByType}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="type"
                    label={{ value: '선종코드', position: 'insideBottom', offset: -10 }}
                />
                <YAxis>
                    <Label value="총 척수" angle={-90} position="insideLeft" offset={10} />
                </YAxis>
                <Tooltip formatter={value => `${value} 척`} />
                <Bar dataKey="count" name="척수" fill='#FFB6C1'>
                    <LabelList dataKey="count" position="top" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

export default AnalysisResultPanel;
