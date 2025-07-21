import { TbSearch } from 'react-icons/tb'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";


export default function SearchBar({ filter, onFilterChange, onSearch, onReset }) {
    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch()
    }

    const statusOptions = [
        {id: '', name: '전체 상태'},
        {id: '작성중', name: '작성중'},
        {id: '제출', name: '제출'},
        {id: '확정', name: '확정'},
        {id: '반려', name: '반려'},
    ]

    return (
        <form className="entryList-searchBar" onSubmit={handleSubmit}>
            <Listbox
                value={filter.status}
                onChange={(value) => {
                    const updated = { ...filter, status: value }
                    onFilterChange(updated)
                    onSearch(updated)
                }}
            >
                <div className="custom-select-wrapper">
                    <ListboxButton className="custom-select-btn">
                        {statusOptions.find(opt => opt.id === filter.status)?.name || '전체 상태'}
                    </ListboxButton>
                    <ListboxOptions className="custom-select-options">
                        {statusOptions.map(item => (
                            <ListboxOption
                                key={item.id}
                                value={item.id}
                                className="custom-select-option-item"
                            >
                                {item.name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>

            <input
                type="text"
                placeholder="거래처명"
                value={filter.custom_name}
                onChange={(e) => {
                    const updated = { ...filter, custom_name: e.target.value };
                    onFilterChange(updated);
                    onSearch(updated);
                }}
            />

            <input
                type="text"
                placeholder="고객명"
                value={filter.customer_name}
                onChange={(e) => {
                    const updated = { ...filter, customer_name: e.target.value };
                    onFilterChange(updated);
                    onSearch(updated);
                }}
            />

            <input
                type="date"
                value={filter.startDate}
                onChange={(e) => {
                    const updated = { ...filter, startDate: e.target.value };
                    onFilterChange(updated);
                    onSearch(updated);
                }}
            />
            <span>~</span>
            <input
                type="date"
                value={filter.endDate}
                onChange={(e) => {
                    const updated = { ...filter, endDate: e.target.value };
                    onFilterChange(updated);
                    onSearch(updated);
                }}
            />

            <button type="submit" className="entryList-fabBtn blue" title="검색">
                <TbSearch size={16} />
            </button>

            <button type="button" className="entryList-fabBtn gray" onClick={onReset}>
                초기화
            </button>
        </form>
    )
}
