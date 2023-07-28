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
    const [isMultiple, setIsMultiple] = useState(false);
    const [isErrorState, setIsErrorState] = useState<boolean>(isError);
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);

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
    }, [defaultValue, JSON.stringify(allSuggestions)]);

    useEffect(() => {
        setIsErrorState(isError);
    }, [isError]);

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
        const newFilteredOptions = allSuggestions.filter((suggestion) => {
            return (
                suggestion.key
                    .toLowerCase()
                    .indexOf((currentValue || '').toString().toLowerCase()) > -1
            );
        });
        setFilteredSuggestions(newFilteredOptions);
        const filteredResult = allSuggestions.filter(
            (item) => item.key === currentValue
        );
        if (filteredResult.length === 0) {
            setIsMultiple(false);
            setIsErrorState(true);
            return;
        }
        if (filteredResult.length > 1) {
            setIsMultiple(true);
            setIsErrorState(true);
            return;
        }

        setIsMultiple(false);
        setIsErrorState(false);
        onValueChanged(
            filteredResult[0].value || undefined,
            nativeEvent.type === 'keyup'
        );
    };
    const handleChangeValueWithDebounce = debounce(handleChangeValue, 300);

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleChangeValue({
                currentValue: e.currentTarget.value,
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
                    handleChangeValueWithDebounce({
                        currentValue: e.target.value,
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
            {isErrorState && (
                <div className="text-danger mt-1 fs-5">
                    {isMultiple ? multipleErrorMessage : errorMessage}
                </div>
            )}
        </div>
    );
};
export default AutocompletedSearch;
