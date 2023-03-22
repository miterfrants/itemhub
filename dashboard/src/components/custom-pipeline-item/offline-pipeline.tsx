import { useEffect, useState } from 'react';
import { PipelineItemType } from '@/types/pipeline.type';
import { useGetDevicesApi } from '../../hooks/apis/devices.hook';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { useAppSelector } from '@/hooks/redux.hook';
import { DeviceItem } from '@/types/devices.type';
import AutocompletedSearch from '../inputs/autocompleted-search/autocompleted-search';
import { KeyValuePair } from '@/types/common.type';

interface PipelineOffline {
    deviceId?: number;
}

const OfflinePipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const [validation, setValidation] = useState({
        deviceId: {
            errorMessage: '',
            invalid: false,
        },
    });

    const [state, setState] = useState<PipelineOffline | null>(null);
    const allDevices: DeviceItem[] = useAppSelector(selectDevices).devices;
    const { getAllDevicesApi } = useGetAllDevicesApi();

    useEffect(() => {
        getAllDevicesApi();
        // eslint-disable-next-line
    }, []);

    const validate = (state: PipelineOffline) => {
        let result = true;
        const newValidation = { ...validation };
        if (!state.deviceId) {
            result = false;
            newValidation.deviceId.errorMessage = '裝置為必選欄位';
            newValidation.deviceId.invalid = true;
        } else {
            newValidation.deviceId.errorMessage = '';
            newValidation.deviceId.invalid = false;
        }
        setValidation(newValidation);
        return result;
    };

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineOffline);
    }, [pipelineItem]);

    useEffect(() => {
        if (
            !state ||
            !validate(state) ||
            pipelineItem.value === JSON.stringify(state)
        ) {
            return;
        }
        onChangedCallback(JSON.stringify(state));
        // eslint-disable-next-line
    }, [state]);

    return (
        <div className="sensor-pipeline-item">
            <label className="mt-3">
                <div>裝置:</div>
                <AutocompletedSearch
                    datalistId="裝置"
                    placeholder="請輸入裝置名稱搜尋"
                    isError={validation.deviceId.invalid}
                    errorMessage="請輸入裝置名稱"
                    defaultValue={state?.deviceId}
                    isDisabled={pipelineItem?.isRun || false}
                    onValueChanged={(newValue: number | string | undefined) => {
                        setState({
                            ...state,
                            deviceId: newValue ? Number(newValue) : undefined,
                        });
                    }}
                    allSuggestions={(allDevices || []).map(
                        ({ name, id }) =>
                            ({
                                key: name,
                                value: id,
                            } as KeyValuePair)
                    )}
                />
            </label>
        </div>
    );
};

export default OfflinePipelineItem;
