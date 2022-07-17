import { PinItem } from '@/types/devices.type';
// import { Validation } from '@/types/helpers.type';

export const ValidationHelpers = {
    Require: (validation: string | number | null) => {
        if (!validation) {
            return false;
        }
        return true;
    },
    SelectedPins: (isCreateMode: boolean, selectedPins: PinItem[] | null) => {
        if (!isCreateMode && (!selectedPins || selectedPins.length === 0)) {
            return false;
        }
        return true;
    },
    DevicePinData: (
        isCreateMode: boolean,
        name: string | null,
        microcontroller: number | null,
        selectedPins: PinItem[] | null
    ) => {
        const result = {
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
        if (ValidationHelpers.SelectedPins(isCreateMode, selectedPins)) {
            result.selectedPins = true;
        }

        return result;
    },
};
