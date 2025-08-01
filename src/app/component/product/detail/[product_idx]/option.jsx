import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiTrash2 } from "react-icons/fi";

export default function OptionManager({ productIdx }) {
    const [options, setOptions] = useState([]);
    const [usedOptions, setUsedOptions] = useState([]);
    const [combinedList, setCombinedList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newOption, setNewOption] = useState({ name: '', value: '' });
    const [selectedOptionIdx, setSelectedOptionIdx] = useState(''); // 선택된 기존 옵션
    const token = (typeof window !== "undefined" ? sessionStorage.getItem("token") : "");

    useEffect(() => {
        console.log('usedOptions:', usedOptions);
    }, [usedOptions]);

    const fetchAllOptions = async () => {
        const res = await axios.get('http://localhost:8080/option/list');
        setOptions(res.data.list || []);
    };

    const fetchUsedOptions = async () => {
        const res = await axios.get(`http://localhost:8080/option/using/${productIdx}`);
        const filtered = (res.data.list || []).filter(opt => opt.using_idx !== null);
        setUsedOptions(filtered);
    };

    const fetchCombinedList = async () => {
        const res = await axios.get(`http://localhost:8080/option/combined/list/${productIdx}`);
        setCombinedList(res.data.list || []);
    };

    const handleOptionInsert = async () => {
        if (selectedOptionIdx) {
            // 이미 추가된 옵션인지 체크
            const selectedId = Number(selectedOptionIdx);
            if (usedOptions.some(opt => opt.option_idx === selectedId)) {
                alert('이미 추가된 옵션입니다.');
                setSelectedOptionIdx('');
                return;
            }

            try{
                // 기존 옵션 재사용
                const res = await axios.post('http://localhost:8080/option/use', {
                    product_idx: productIdx,
                    option_idx: selectedId
                },{
                    headers: { Authorization: token }
                });

                if (res.data.success) {
                    await fetchUsedOptions();  // 서버 최신 상태로 갱신
                    setSelectedOptionIdx('');
                }
            } catch (err) {
                console.error(err);
                alert('옵션 추가 중 오류가 발생했습니다.');
            }
        }else {
                try {
                    const res = await axios.post('http://localhost:8080/option/insert', {
                        option_name: newOption.name,
                        option_value: newOption.value
                    }, {
                        headers: { Authorization: token }
                    });

                    if (res.data.success) {
                        const useRes = await axios.post('http://localhost:8080/option/use', {
                            product_idx: productIdx,
                            option_idx: res.data.option_idx
                        }, {
                            headers: { Authorization: token }
                        });

                        if (useRes.data.success) {
                            await fetchUsedOptions();  // 서버 최신 상태로 갱신
                            setOptions(prev => [...prev, {
                                option_idx: res.data.option_idx,
                                option_name: newOption.name,
                                option_value: newOption.value
                            }]);
                            setNewOption({ name: '', value: '' });
                            setSelectedOptionIdx('');
                        }
                    }
                } catch (err) {
                    console.error(err);
                    alert('새 옵션 추가 중 오류가 발생했습니다.');
                }
            }
        };

    const handleOptionUnlink = async (using_idx) => {
        await axios.put(`http://localhost:8080/option/use/del/${using_idx}`, null, {
            headers: { Authorization: token }
        });
        fetchUsedOptions();
    };

    const handleAutoCombine = async () => {
        if (combinedList.length > 0) {
            const confirmed = window.confirm('기존 옵션 조합이 모두 삭제됩니다. 진행할까요?');
            if (!confirmed) return;
        }

        setLoading(true);

        try {
            if (combinedList.length > 0) {
                await axios.put(`http://localhost:8080/option/combined/deleteAll/${productIdx}`, null, {
                    headers: { Authorization: token }
                });
            }

            await axios.post(`http://localhost:8080/option/combined/auto/${productIdx}`);
            await fetchCombinedList();
        } catch (err) {
            console.error('조합 자동 생성 실패:', err);
            alert('조합 생성에 실패했습니다.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (productIdx) {
            fetchAllOptions();
            fetchUsedOptions();
            fetchCombinedList();
        }
    }, [productIdx]);

    return (
        <div>
            <div className="option-input-box">
                <select
                    className="option-select-input width-fit"
                    value={selectedOptionIdx}
                    onChange={e => setSelectedOptionIdx(e.target.value)}
                >
                    <option value=""> 기존 옵션 선택 (선택 시 입력 무시) </option>
                    {options.map(opt => (
                        <option key={opt.option_idx} value={opt.option_idx}>
                            {opt.option_name} ({opt.option_value})
                        </option>
                    ))}
                </select>

                <input
                    className="input"
                    type="text"
                    placeholder="옵션 이름"
                    value={newOption.name}
                    onChange={e => setNewOption({ ...newOption, name: e.target.value })}
                    disabled={selectedOptionIdx !== ''}
                />
                <input
                    className="input"
                    type="text"
                    placeholder="옵션 값 (예: S,M,L)"
                    value={newOption.value}
                    onChange={e => setNewOption({ ...newOption, value: e.target.value })}
                    disabled={selectedOptionIdx !== ''}
                />
                <button className="option-btn" onClick={handleOptionInsert}>옵션 추가</button>
            </div>

            <ul className="flex flex-direction-col gap_10 margin-bottom-10">
                {usedOptions.map(opt => (
                    opt.using_idx ? (
                        <li key={opt.using_idx} className="flex justify-content-between align-center">
                            <div>{opt.option_name} ({opt.option_value})</div>
                            <FiTrash2 className="option-del" onClick={() => handleOptionUnlink(opt.using_idx)} />
                        </li>
                    ) : null
                ))}
            </ul>

            <div className="flex justify-left margin-bottom-10">
                <button className="btn" onClick={handleAutoCombine} disabled={loading}>
                    {loading ? '조합 생성 중...' : '옵션 조합 자동 생성'}
                </button>
            </div>

            {combinedList.length > 0 && (
                <div className="option-combined-scroll-box">
                    {combinedList.map((comb) => (
                        comb?.combined_idx ? (
                            <span key={comb.combined_idx} className="option-tag">{comb.combined_name}</span>
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
}
