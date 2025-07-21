import {FaRegCalendarCheck} from "react-icons/fa6";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import React from "react";

function FilterBar({
    selectedParent,
    setSelectedParent,
    selectedSub,
    setSelectedSub,
    handleDatePicker,
    parentCategories,
    filteredSubCategories,
    fetchChart,
    showDatePicker = true,
}) {

    return (
        <div className="flex gap_10 align-center justify-right margin-bottom-10">

            {/* 기간 설정 (조건부) */}
            {showDatePicker && (
                <div className='width-fit cursor-pointer'><button className='btn' onClick={handleDatePicker}>
                    <FaRegCalendarCheck /></button></div>
            )}

            {/* 상위 카테고리 */}
            <div className="select-container">
                <Listbox value={selectedParent} onChange={(val) => {
                    setSelectedParent(val);
                    setSelectedSub(null); // 상위 바꾸면 하위 초기화
                    fetchChart({
                        categoryIdx: val?.category_idx ?? null,
                    });
                }}>
                    <ListboxButton className="select-btn">
                        {selectedParent ? selectedParent.category_name : '카테고리 선택'}
                    </ListboxButton>
                    <ListboxOptions className="select-option">
                        {parentCategories.map((option) => (
                            <ListboxOption
                                key={option.category_idx} value={option} className="select-option-item">
                                {option.category_name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Listbox>
            </div>

            {/* 하위 카테고리 */}
            <div className="select-container">
                <Listbox value={selectedSub} onChange={(val) => {
                    setSelectedSub(val);
                    fetchChart({
                        categoryIdx: val?.id ?? selectedParent?.id ?? null,
                    });
                }} disabled={!selectedParent}>
                    <ListboxButton className="select-btn">
                        {selectedSub ? selectedSub.category_name : '카테고리 선택'}
                    </ListboxButton>
                    <ListboxOptions className="select-option">
                        {filteredSubCategories.map(option => (
                            <ListboxOption
                                key={option.category_idx}
                                value={option}
                                className="select-option-item">
                                {option.category_name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Listbox>
            </div>
            <div className="resetBtn">
                <button onClick={() => {
                            setSelectedParent(null);
                            setSelectedSub(null);
                            fetchChart({categoryIdx: null});
                        }}>
                    초기화
                </button>
            </div>
        </div>
    );
}

export default FilterBar;