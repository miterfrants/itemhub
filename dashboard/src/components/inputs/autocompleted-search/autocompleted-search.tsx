import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

const AutocompletedSearch = ({
    isDisabled = false,
    isError = false,
    errorMessage = '請輸入正確的內容',
    datalistId,
    placeholder,
    allSuggestions,
    value,
    updateCurrentValue,
    onEnterKeyUp,
    onClickOption,
}: {
    isDisabled?: boolean;
    isError?: boolean;
    errorMessage?: string;
    datalistId: string;
    placeholder: string;
    allSuggestions: string[];
    value: string;
    updateCurrentValue: (newValue: string) => void;
    onEnterKeyUp?: (newValue?: string) => void;
    onClickOption?: (newValue?: string) => void;
}) => {
    const [filteredSuggestions, setFilteredSuggestions] =
        useState<string[]>(allSuggestions);

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const isTriggerOnClickOption = useRef(false);
    const [isTriggerOnEnterKeyUp, setIsTriggerOnEnterKeyUp] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        if (isTriggerOnClickOption.current && onClickOption) {
            onClickOption(inputRef.current?.value);
            isTriggerOnClickOption.current = false;
        }
    }, [inputRef.current?.value, onClickOption]);

    useEffect(() => {
        if (isTriggerOnEnterKeyUp && onEnterKeyUp) {
            onEnterKeyUp(inputRef.current?.value);
            setIsTriggerOnEnterKeyUp(false);
        }
    }, [inputRef.current?.value, isTriggerOnEnterKeyUp, onEnterKeyUp]);

    useEffect(() => {
        setFilteredSuggestions(allSuggestions);
    }, [allSuggestions]);

    const handleChangeValue = ({
        currentValue,
        nativeEvent,
    }: {
        currentValue: string;
        nativeEvent: InputEvent;
    }) => {
        const isClickOption = !('inputType' in nativeEvent);
        if (isClickOption) {
            isTriggerOnClickOption.current = true;
        }

        updateCurrentValue(inputRef.current?.value || '');
        const newFilteredOptions = allSuggestions.filter((suggestion) => {
            return (
                suggestion
                    .toLowerCase()
                    .indexOf(currentValue.toString().toLowerCase()) > -1
            );
        });
        setFilteredSuggestions(newFilteredOptions);
    };
    const handleChangeValueWithDebounce = debounce(handleChangeValue, 300);

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsTriggerOnEnterKeyUp(true);
        }
    };

    return (
        <div ref={wrapperRef}>
            <input
                className={`form-control ${isError && 'border-danger'}`}
                list={datalistId}
                placeholder={placeholder}
                ref={inputRef}
                disabled={isDisabled}
                value={inputValue}
                onKeyUp={handleKeyUp}
                onChange={(e) => {
                    const nativeEvent = e.nativeEvent as InputEvent;
                    handleChangeValueWithDebounce({
                        currentValue: inputRef.current?.value || '',
                        nativeEvent,
                    });
                    setInputValue(e.target.value);
                }}
            />
            <datalist id={datalistId}>
                {filteredSuggestions.map((suggestion, index) => {
                    return (
                        <option key={`${suggestion}-${index}`}>
                            {suggestion}
                        </option>
                    );
                })}
            </datalist>
            {isError && (
                <div className="text-danger mt-1 fs-5">{errorMessage}</div>
            )}
        </div>
    );
};
export default AutocompletedSearch;
