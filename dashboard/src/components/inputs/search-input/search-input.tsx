import { useRef } from 'react';
import searchIcon from '@/assets/images/icon-search.svg';

const SearchInput = ({
    placeholder,
    defaultValue = '',
    onChange,
    onSearch,
}: {
    placeholder: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onSearch: (value: string) => void;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    let shouldBeTwiceEnter = false;
    let enterCount = 0;

    const searchInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing) {
            shouldBeTwiceEnter = true;
        } else if (!e.nativeEvent.isComposing && onChange) {
            onChange(e.currentTarget.value);
        }

        if (e.code === 'Enter') {
            enterCount += 1;
        }

        if (
            (enterCount >= 2 && shouldBeTwiceEnter) ||
            (enterCount == 1 && !shouldBeTwiceEnter)
        ) {
            shouldBeTwiceEnter = false;
            enterCount = 0;
            onSearch(e.currentTarget.value);
        }
    };

    const searchByButton = () => {
        onSearch(inputRef.current ? inputRef.current.value : '');
    };

    return (
        <div className="position-relative search-input">
            <input
                className="form-control border border-black border-opacity-15 rounded-start"
                type="text"
                ref={inputRef}
                placeholder={placeholder}
                defaultValue={defaultValue}
                onKeyUp={searchInputKeyUp}
            />
            <button
                className="position-absolute top-0 end-0 btn d-inline-block shadow-none border-0 p-2"
                type="button"
                onClick={searchByButton}
            >
                <img src={searchIcon} alt="icon-search" />
            </button>
        </div>
    );
};

export default SearchInput;
