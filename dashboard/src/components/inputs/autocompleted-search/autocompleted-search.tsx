import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { KeyValuePair } from '@/types/common.type';

const AutocompletedSearch = ({
    isDisabled = false,
    isError = false,
    errorMessage = '請輸入正確的內容',
    multipleErrorMessage,
    datalistId,
    placeholder,
    allSuggestions,
    defaultValue,
    onValueChanged,
    onClickOption,
    clearInputFlag,
}: {
    isDisabled?: boolean;
    isError?: boolean;
    errorMessage?: string;
    multipleErrorMessage?: string;
    datalistId: string;
    placeholder: string;
    allSuggestions: KeyValuePair[];
    defaultValue: string | number | undefined;
    onValueChanged: (
        newValue: string | number | undefined,
        isTypeEnter?: boolean
    ) => void;
    onClickOption?: (newValue?: string) => void;
    clearInputFlag?: boolean;
}) => {
    const [filteredSuggestions, setFilteredSuggestions] =
        useState<KeyValuePair[]>(allSuggestions);

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const isTriggerOnClickOption = useRef(false);
    const defaultItem = allSuggestions.find((item) => {
        return item.value === defaultValue;
    });
    const [inputValue, setInputValue] = useState(
        defaultItem ? defaultItem.key : null
    );

    useEffect(() => {
        if (isTriggerOnClickOption.current && onClickOption) {
            onClickOption(inputRef.current?.value);
            isTriggerOnClickOption.current = false;
        }
    }, [inputRef.current?.value, onClickOption]);

    useEffect(() => {
        setFilteredSuggestions(allSuggestions);
    }, [allSuggestions]);

    useEffect(() => {
        if (clearInputFlag === undefined) {
            return;
        }
        setInputValue('');
        setTimeout(() => {
            inputRef.current?.focus();
        });
    }, [clearInputFlag]);

    useEffect(() => {
        const defaultItem = allSuggestions.find((item) => {
            return item.value === defaultValue;
        });
        setInputValue(defaultItem ? defaultItem.key : '');
        // eslint-disable-next-line
    }, [defaultValue]);

    const handleChangeValue = ({
        currentValue,
        nativeEvent,
    }: {
        currentValue: string | number | undefined;
        nativeEvent: InputEvent | React.KeyboardEvent<HTMLInputElement>;
    }) => {
        const isClickOption = !('inputType' in nativeEvent);
        if (isClickOption) {
            isTriggerOnClickOption.current = true;
        }
        onValueChanged(currentValue || '', nativeEvent.type === 'keyup');
        const newFilteredOptions = allSuggestions.filter((suggestion) => {
            return (
                suggestion.key
                    .toLowerCase()
                    .indexOf((currentValue || '').toString().toLowerCase()) > -1
            );
        });
        setFilteredSuggestions(newFilteredOptions);
    };
    const handleChangeValueWithDebounce = debounce(handleChangeValue, 300);

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const filteredResult = allSuggestions.filter(
                (item) => item.key === e.currentTarget.value
            );
            if (filteredResult.length === 0) {
                isError = true;
                return;
            }
            if (filteredResult.length > 1) {
                isError = true;
                return;
            }
            handleChangeValue({
                currentValue: filteredResult[0].value,
                nativeEvent: e,
            });
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
                value={inputValue || ''}
                onKeyUp={handleKeyUp}
                onChange={(e) => {
                    const nativeEvent = e.nativeEvent as InputEvent;
                    const selectedDeviceName = e.currentTarget.value;
                    const selectedDatasetItem =
                        e.currentTarget.parentElement?.querySelector(
                            `datalist>option[value="${selectedDeviceName}"]`
                        );

                    const rawId: string | undefined = selectedDatasetItem
                        ? (selectedDatasetItem as HTMLElement).dataset['id']
                        : '';

                    const id = rawId ? Number(rawId) : '';

                    handleChangeValueWithDebounce({
                        currentValue: id,
                        nativeEvent,
                    });
                    setInputValue(e.target.value);
                }}
            />
            <datalist id={datalistId}>
                {filteredSuggestions.map((suggestion, index) => {
                    return (
                        <option
                            value={suggestion.key}
                            data-id={suggestion.value}
                            key={`${suggestion.key}-${index}`}
                        >
                            {suggestion.key}
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
