import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceLastActivityLog } from '@/types/devices.type';

const initialState: DeviceLastActivityLog[] = [];

export const deviceLastActivityLogsSlice = createSlice({
    name: 'deviceLastActivityLogs',
    initialState: initialState,
    reducers: {
        refresh: (
            state: DeviceLastActivityLog[],
            action: PayloadAction<DeviceLastActivityLog>
        ) => {
            const list = state;
            const newOne = action.payload;
            const target = list.find(
                (item: DeviceLastActivityLog) =>
                    item.deviceId === newOne.deviceId
            );
            if (target) {
                target.createdAt = newOne.createdAt;
            } else {
                list.push(newOne);
            }
            return [...list];
        },
    },
});

export const deviceLastActivityLogsActions =
    deviceLastActivityLogsSlice.actions;

export const selectDeviceLastActivityLogs = (state: RootState) =>
    state.deviceLastActivityLogs;

export default deviceLastActivityLogsSlice.reducer;
