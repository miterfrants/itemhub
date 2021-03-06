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
};
