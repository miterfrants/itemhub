import { PinItem } from '@/types/devices.type';
import { Validation } from '@/types/helpers.type';

export const ValidationHelpers = {
    Require: ({ value }: Validation) => {
        if (!value) {
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
};
