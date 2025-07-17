import { TbSearch } from 'react-icons/tb'


export default function SearchBar({ filter, onFilterChange, onSearch, onReset }) {
    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch()
    }

    return (
        <form className="entryList-searchBar" onSubmit={handleSubmit}>
            <select
                value={filter.status}
                onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
            >
                <option value="">전체 상태</option>
                <option value="작성중">작성중</option>
                <option value="제출">제출</option>
                <option value="확정">확정</option>
                <option value="반려">반려</option>
            </select>

            <input
                type="text"
                placeholder="거래처명"
                value={filter.custom_name}
                onChange={(e) => onFilterChange({ ...filter, custom_name: e.target.value })}
            />

            <input
                type="text"
                placeholder="고객명"
                value={filter.customer_name}
                onChange={(e) => onFilterChange({ ...filter, customer_name: e.target.value })}
            />

            <input
                type="date"
                value={filter.startDate}
                onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value })}
            />
            <span>~</span>
            <input
                type="date"
                value={filter.endDate}
                onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value })}
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
