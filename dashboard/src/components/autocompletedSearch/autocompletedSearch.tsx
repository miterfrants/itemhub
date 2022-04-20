import { useState, useRef } from 'react';
import useClickOutsideElement from '@/hooks/clickOutsideElement.hook';
import debounce from 'lodash.debounce';

const AutocompletedSearch = ({
    currentValue,
    updateCurrentValue,
    allSuggestions,
}: {
    currentValue: string;
    updateCurrentValue: (newValue: string) => void;
    allSuggestions: string[];
}) => {
    const [isShowSuggestions, setIsShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
        []
    );
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleChangeValue = (currentValue: string) => {
        const newFilteredOptions = allSuggestions.filter(
            (suggestion) =>
                suggestion
                    .toLowerCase()
                    .indexOf(currentValue.toString().toLowerCase()) > -1
        );
        setActiveSuggestionIndex(0);
        setFilteredSuggestions(newFilteredOptions);
        setIsShowSuggestions(true);
        updateCurrentValue(currentValue);
    };
    const handleChangeValueWithDebounce = debounce(handleChangeValue, 300);

    const handleClickSuggestion = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const currentValue = target.innerText;
        if (inputRef.current) {
            inputRef.current.value = currentValue;
        }
        updateCurrentValue(currentValue);
        setActiveSuggestionIndex(0);
        setFilteredSuggestions([]);
        setIsShowSuggestions(false);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const currentValue = filteredSuggestions[activeSuggestionIndex];
            if (inputRef.current) {
                inputRef.current.value = currentValue;
            }
            updateCurrentValue(currentValue);
            setActiveSuggestionIndex(0);
            setIsShowSuggestions(false);
        } else if (e.key === 'ArrowUp') {
            return activeSuggestionIndex === 0
                ? null
                : setActiveSuggestionIndex(activeSuggestionIndex - 1);
        } else if (e.key === 'ArrowDown') {
            return activeSuggestionIndex - 1 === filteredSuggestions.length
                ? null
                : setActiveSuggestionIndex(activeSuggestionIndex + 1);
        }
    };

    const handleClickOuside = () => {
        setIsShowSuggestions(false);
    };
    useClickOutsideElement({
        elementRef: wrapperRef,
        handleClick: handleClickOuside,
    });

    return (
        <div ref={wrapperRef}>
            <input
                className="form-control"
                ref={inputRef}
                defaultValue={currentValue}
                onFocus={() =>
                    handleChangeValueWithDebounce(inputRef.current?.value || '')
                }
                onChange={() =>
                    handleChangeValueWithDebounce(inputRef.current?.value || '')
                }
                onKeyUp={handleKeyUp}
            />
            {isShowSuggestions ? (
                filteredSuggestions.length > 0 ? (
                    <ul className="autocomplete-wrapper">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;
                            if (index === activeSuggestionIndex) {
                                className = 'active-suggestion';
                            }
                            return (
                                <li
                                    key={suggestion}
                                    className={className}
                                    onClick={handleClickSuggestion}
                                >
                                    {suggestion}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="no-suggestions">
                        <p>沒有資料，請重新搜尋</p>
                    </div>
                )
            ) : null}
        </div>
    );
};
export default AutocompletedSearch;
