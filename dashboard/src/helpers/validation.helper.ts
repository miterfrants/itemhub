import { PinItem } from '@/types/devices.type';
import { Pins } from '@/types/universal.type';
// import { Validation } from '@/types/helpers.type';

export const ValidationHelpers = {
    Require: (validation: string | number | null | undefined) => {
        if (
            (typeof validation === 'number' && isNaN(validation)) ||
            (typeof validation === 'string' && validation === '') ||
            validation == undefined ||
            validation == null
        ) {
            return false;
        }
        return true;
    },
    ValidateSelectedPins: (
        isCreateMode: boolean,
        selectedPins: PinItem[] | null
    ) => {
        if (!isCreateMode && (!selectedPins || selectedPins.length === 0)) {
            return false;
        }
        return true;
    },
    ValidateDeviceForm: (
        isCreateMode: boolean,
        name: string | null,
        microcontroller: number | null,
        selectedPins: PinItem[] | null,
        selectedProtocol?: number
    ) => {
        const result = {
            isValid: false,
            name: false,
            selectedPins: false,
            selectedMicrocontroller: false,
            selectedProtocol: false,
        };

        if (ValidationHelpers.Require(name)) {
            result.name = true;
        }
        if (ValidationHelpers.Require(microcontroller)) {
            result.selectedMicrocontroller = true;
        }
        if (
            ValidationHelpers.ValidateSelectedPins(isCreateMode, selectedPins)
        ) {
            result.selectedPins = true;
        }
        if (ValidationHelpers.Require(selectedProtocol)) {
            result.selectedProtocol = true;
        }

        result.isValid =
            result.name &&
            result.selectedMicrocontroller &&
            result.selectedPins &&
            result.selectedProtocol;

        return result;
    },
    ValidLength: (validation: string | null, limit: number) => {
        if (!validation) {
            return false;
        }
        if (validation.length > limit) {
            return false;
        }
        return true;
    },
    ValidateCustomPinData: (
        customPins: Pins[],
        pinName: string | null,
        pinNumber: string | null
    ) => {
        const result = {
            isValid: false,
            pinName: false,
            pinNumber: false,
            duplicate: false,
        };

        if (
            ValidationHelpers.Require(pinName) &&
            ValidationHelpers.ValidLength(pinName, 5)
        ) {
            result.pinName = true;
        }
        if (
            ValidationHelpers.Require(pinNumber) &&
            ValidationHelpers.ValidLength(pinNumber, 5)
        ) {
            result.pinNumber = true;
        }

        const existCustomPins = (customPins || []).find(
            (customPins) => customPins.name === pinName
        );

        if (existCustomPins) {
            result.duplicate = true;
        }

        result.isValid =
            result.pinName && result.pinNumber && !result.duplicate;
        return result;
    },
    isEmail: (email: string) => {
        return email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },
    isPhone: (phone: string) => {
        return phone.toLowerCase().match(/^09[0-9]{8}$/);
    },
    isValidURL: (string: string) => {
        const res = string.match(
            /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9] {8}\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|w {8}ww\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
        );
        return res !== null;
    },
};
