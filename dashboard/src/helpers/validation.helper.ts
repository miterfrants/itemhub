import { PinItem } from '@/types/devices.type';
// import { Validation } from '@/types/helpers.type';

export const ValidationHelpers = {
    Require: (validation: string | number | null) => {
        if (!validation) {
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
    ValidateDevicePinData: (
        isCreateMode: boolean,
        name: string | null,
        microcontroller: number | null,
        selectedPins: PinItem[] | null
    ) => {
        const result = {
            isValid: false,
            name: false,
            selectedPins: false,
            selectedMicrocontroller: false,
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

        result.isValid =
            result.name &&
            result.selectedMicrocontroller &&
            result.selectedPins;

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
    ValidateCustomPinData: (name: string | null, value: string | null) => {
        const result = {
            isValid: false,
            name: false,
            value: false,
        };

        if (
            ValidationHelpers.Require(name) &&
            ValidationHelpers.ValidLength(name, 5)
        ) {
            result.name = true;
        }
        if (
            ValidationHelpers.Require(value) &&
            ValidationHelpers.ValidLength(value, 5)
        ) {
            result.value = true;
        }

        result.isValid = result.name && result.value;
        return result;
    },
};
