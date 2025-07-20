'use client'

import Select from "react-select";
import {useState} from "react";

const generateTimeOptions = () => {

    const options = [];

    for (let h = 9; h <= 18; h++) {
        for (let m = 0; m < 50; m += 10) {
            if (h === 18 && m > 30) break; // 18:40 이후 제외
            const hour = h.toString().padStart(2, '0');
            const min = m.toString().padStart(2, '0');
            const lab = `${hour}:${min}`;
            options.push({value: lab, label: lab});
        }
    }
    return options;
};

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        display: 'grid',
        gridTemplateColumns: '24px 1fr 24px',
        alignItems: 'center',
        fontSize: '14px',
        height: '32px',
        minHeight: '32px',
        padding: '0',
        borderRadius: '4px',
        borderColor: state.isFocused ? '#2684FF' : 'hsl(0, 0%, 80%)',
        boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none',
        transition: 'all 100ms',
        overflow: 'hidden',
    }),
    valueContainer: (provided) => ({
        ...provided,
        gridColumn: '2 / 3',
        display: 'grid',
        alignItems: 'center',
        justifyItems: 'center',
        padding: 0,
        margin: 0,
        height: '32px',
        overflow: 'hidden',
    }),
    singleValue: (provided) => ({
        ...provided,
        placeSelf: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        color: '#000',
    }),
    input: (provided) => ({
        ...provided,
        height: 0,
        opacity: 0,
        pointerEvents: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        display: 'contents',
    }),
    clearIndicator: (provided) => ({
        ...provided,
        gridColumn: '1 / 2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        visibility: 'visible',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        gridColumn: '3 / 4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
};


export default function TimeSelect({value, onChange, placeholder}) {
    const options = generateTimeOptions();
    const [hovered, setHovered] = useState(false);

    return (
        <div>
            <Select
                options={options}
                styles={customStyles}
                value={options.find(opt => opt.value === value) || null}
                onChange={(selected) => onChange(selected? selected.value : null)}
                placeholder=""
                isClearable
                blurInputOnSelect={true}
            />
        </div>
    );
}