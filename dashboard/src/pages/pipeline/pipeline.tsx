import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from '@/components/page-title/page-title';
import Spinner from '@/components/spinner/spinner';
import { useDispatch } from 'react-redux';
import {
    useCreatePipelineApi,
    useGetPipelineApi,
} from '@/hooks/apis/pipelines.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectPipelines } from '@/redux/reducers/pipelines.reducer';
import {
    PipelineConnectorType,
    PipelineItemType,
    PipelineType,
} from '@/types/pipeline.type';
import { useEffect, useState } from 'react';
import { useUpdatePipelineApi } from '../../hooks/apis/pipelines.hook';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { RESPONSE_STATUS } from '@/constants/api';

import 'reactflow/dist/style.css';

import { useGetAllPipelineItems } from '@/hooks/apis/pipeline-items.hook';
import { selectPipelineItems } from '@/redux/reducers/pipeline-items.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { selectPipelineConnectors } from '../../redux/reducers/pipeline-connectors.reducer';

import { useGetAllPipelineConnectors } from '../../hooks/apis/pipeline-connector.hook';
import { useGetPipelineItemTypes } from '@/hooks/apis/universal.hook';
import { PipelineFlowProvider } from '@/components/pipeline-flow/pipeline-flow';
import { useDebounce } from '@/hooks/debounce.hook';
import { useBeforeUnload } from '@/hooks/before-unload.hook';
import usePrompt from '@/hooks/block.hook';

interface ValidationInterface {
    title: { isInvalid: boolean; errorMessage: string[] };
}

const Pipeline = () => {
    const navigate = useNavigate();
    const { id: idFromUrl } = useParams();
    const isCreateMode = !idFromUrl;
    const id: number | undefined = idFromUrl ? Number(idFromUrl) : undefined;
    const dispatch = useDispatch();
    const pipelines = useAppSelector(selectPipelines).pipelines;
    const { pipelineItemTypes } = useAppSelector(selectUniversal);
    const pipelineItemPool = useAppSelector(selectPipelineItems);
    const pipelineConnectorPool = useAppSelector(selectPipelineConnectors);
    const pipelineItems: null | PipelineItemType[] = pipelineItemPool
        ? pipelineItemPool.filter((item) => item.pipelineId === id)
        : null;
    const pipelineConnectors: null | PipelineConnectorType[] =
        pipelineConnectorPool
            ? pipelineConnectorPool.filter((item) => item.pipelineId === id)
            : null;
    const [pipeline, setPipeline] = useState<PipelineType | null>(null);
    const [isDirtyForm, setIsDirtyForm] = useState<boolean>(false);
    const [shouldBeUpdatePipeline, setShouldBeUpdatePipeline] =
        useState<PipelineType | null>(null);
    const [shouldBeCreatePipelineTitle, setShouldBeCreatePipelineTitle] =
        useState<string>('');
    const { fetchApi: getPipelineItems } = useGetAllPipelineItems(id || 0);
    const { fetchApi: getPipelineItemTypes } = useGetPipelineItemTypes();
    const { fetchApi: getPipelineConnectors } = useGetAllPipelineConnectors(
        id || 0
    );

    const [validation, setValidation] = useState<ValidationInterface>({
        title: {
            isInvalid: false,
            errorMessage: [],
        },
    });

    const { isLoading: isGetting, fetchApi: getPipeline } = useGetPipelineApi(
        Number(id)
    );

    const {
        isLoading: isCreating,
        fetchApi: create,
        data: respOfCreate,
    } = useCreatePipelineApi(shouldBeCreatePipelineTitle);

    const { fetchApi: update, data: respOfUpdate } = useUpdatePipelineApi({
        editedData: (shouldBeUpdatePipeline || {}) as Partial<PipelineType>,
    });

    const debounceChangePipeline = useDebounce((changes: PipelineType) => {
        setShouldBeUpdatePipeline(changes);
    }, 800);

    const validate = (_pipeline: PipelineType | null) => {
        if (!_pipeline && !isCreateMode) {
            return false;
        }
        const newValidation: ValidationInterface = {
            ...validation,
            title: {
                ...validation.title,
                errorMessage: [],
            },
        };
        let result = true;

        if (_pipeline?.title && _pipeline?.title.length > 24) {
            newValidation.title.isInvalid = true;
            newValidation.title.errorMessage.push('名稱不能超過 24 個字');
            result = false;
        }

        if (!_pipeline?.title || _pipeline?.title.length === 0) {
            newValidation.title.isInvalid = true;
            newValidation.title.errorMessage.push('名稱必填');
            result = false;
        }

        if (result) {
            newValidation.title.isInvalid = false;
            newValidation.title.errorMessage = [];
        }
        setValidation(newValidation);
        return result;
    };

    const back = () => {
        navigate(`/dashboard/pipelines${location.search}`);
    };

    useBeforeUnload({
        when: isDirtyForm,
        message: '資料還未儲存確定要離開頁面?',
    });

    usePrompt('資料還未儲存確定要離開頁面?', isDirtyForm);

    useEffect(() => {
        const pipeline =
            (pipelines || []).find(
                (item: PipelineType) => item.id === Number(id)
            ) || null;

        if (!isCreateMode && pipeline === null) {
            getPipeline();
            return;
        }
        setPipeline(pipeline);
        // eslint-disable-next-line
    }, [pipelines]);

    useEffect(() => {
        if (id) {
            getPipelineItems();
            getPipelineConnectors();
            getPipelineItemTypes();
        }
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (
            shouldBeUpdatePipeline === null ||
            !validate(shouldBeUpdatePipeline)
        ) {
            return;
        }
        update();
        // eslint-disable-next-line
    }, [shouldBeUpdatePipeline]);

    useEffect(() => {
        if (respOfCreate && respOfCreate.id) {
            navigate(
                `/dashboard/pipelines/${respOfCreate.id}?${location.search}`
            );
            dispatch(
                toasterActions.pushOne({
                    message: '新增成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [respOfCreate]);

    useEffect(() => {
        if (!respOfUpdate) {
            return;
        }
        setIsDirtyForm(false);
        if (respOfUpdate && respOfUpdate.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message: '更新成功',
                    duration: 2,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [respOfUpdate]);

    return (
        <div className="pipeline">
            <PageTitle
                primaryButtonWording="新增 Pipeline"
                secondaryButtonWording="重新整理"
                title={isCreateMode ? '新增 Pipeline' : '編輯 Pipeline'}
            />
            {isGetting && pipeline === null && !isCreateMode ? (
                <Spinner />
            ) : (
                <div className="card">
                    <div className="mb-4">
                        <label className="form-label" htmlFor="title">
                            名稱
                        </label>
                        <input
                            className={`form-control ${
                                validation.title.isInvalid && 'border-danger'
                            }`}
                            type="text"
                            id="title"
                            placeholder="輸入名稱"
                            defaultValue={pipeline?.title}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (isCreateMode) {
                                    setShouldBeCreatePipelineTitle(value);
                                } else {
                                    if (value === pipeline?.title) {
                                        return;
                                    }
                                    setIsDirtyForm(true);
                                    debounceChangePipeline({
                                        ...shouldBeUpdatePipeline,
                                        title: value,
                                        id: pipeline?.id || 0,
                                    });
                                }
                            }}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (isCreateMode) {
                                    setShouldBeCreatePipelineTitle(value);
                                } else {
                                    if (value === pipeline?.title) {
                                        return;
                                    }
                                    setIsDirtyForm(true);
                                    debounceChangePipeline({
                                        ...shouldBeUpdatePipeline,
                                        title: value,
                                        id: pipeline?.id || 0,
                                    });
                                }
                            }}
                        />
                        {validation.title.isInvalid && (
                            <div className="text-danger mt-1 fs-5">
                                {validation.title.errorMessage.join(' ')}
                            </div>
                        )}
                        <div className="flow-canvas mt-4">
                            {!isCreateMode &&
                                pipelineItems &&
                                pipelineConnectors &&
                                pipelineItemTypes.length > 0 && (
                                    <PipelineFlowProvider
                                        pipeline={pipeline}
                                        pipelineItems={pipelineItems}
                                        pipelineConnectors={pipelineConnectors}
                                        pipelineItemTypes={pipelineItemTypes}
                                        setDirtyForm={(isDirty: boolean) => {
                                            setIsDirtyForm(isDirty);
                                        }}
                                    />
                                )}
                        </div>
                    </div>
                    <div className="d-flex">
                        {isCreateMode && (
                            <button
                                type="button"
                                className="btn btn-primary mt-3"
                                onClick={() => {
                                    create();
                                }}
                                disabled={isCreating}
                            >
                                {isCreating ? '新增中' : '確定新增'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-secondary mt-3 ms-3"
                            onClick={back}
                            disabled={isCreating}
                        >
                            返回
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pipeline;
