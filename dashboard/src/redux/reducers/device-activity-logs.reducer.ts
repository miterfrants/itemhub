import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceLastActivityLog } from '@/types/devices.type';

type DeviceLastActivityLogsState = DeviceLastActivityLog[] | null;

const initialState: DeviceLastActivityLogsState = [];

export const deviceLastActivityLogsSlice = createSlice({
    name: 'devicesLastActivityLogs',
    initialState: initialState,
    reducers: {
        refresh: (
            state,
            action: PayloadAction<DeviceLastActivityLogsState>
        ) => {
            const items = action.payload || [];
            const oldItems: DeviceLastActivityLog[] = (
                state ? [...state] : []
            ) as DeviceLastActivityLog[];

            // update exists items
            const updatedOldItems = oldItems.map(
                (oldItem: DeviceLastActivityLog) => {
                    const existsInPayload = items?.find(
                        (item) =>
                            item.deviceId === oldItem.deviceId &&
                            oldItem.deviceId &&
                            item.deviceId
                    );

                    if (existsInPayload) {
                        return { ...oldItem, ...existsInPayload };
                    } else {
                        return oldItem;
                    }
                }
            );

            // filter exists items
            const newItemsExcludedExists = items?.filter((item) => {
                return !updatedOldItems
                    .map((oldItem) => oldItem.deviceId)
                    .includes(item.deviceId);
            });

            return [...updatedOldItems, ...newItemsExcludedExists];
        },
    },
});

export const deviceLastActivityLogsActions =
    deviceLastActivityLogsSlice.actions;

export const selectDeviceLastActivityLogs = (state: RootState) =>
    state.deviceLastActivityLogs;

export default deviceLastActivityLogsSlice.reducer;
