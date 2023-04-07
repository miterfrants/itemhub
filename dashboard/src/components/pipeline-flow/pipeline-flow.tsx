import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    XYPosition,
    Node,
} from 'reactflow';
import CustomPipelineItem from '@/components/custom-pipeline-item/custom-pipeline-item';
import CustomEdge from '@/components/custom-react-flow-edge/custom-react-flow-edge';
import { UniversalOption } from '@/types/universal.type';
import {
    PipelineConnectorType,
    PipelineItemType,
    PipelineType,
} from '@/types/pipeline.type';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
    useCreatePipelineItem,
    useDeletePipelineItem,
    useUpdatePipelineItem,
} from '@/hooks/apis/pipeline-items.hook';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    useCreatePipelineConnector,
    useDeletePipelineConnector,
} from '@/hooks/apis/pipeline-connector.hook';
import { useDebounce } from '@/hooks/debounce.hook';
import { useRunOrStopPipelineApi } from '@/hooks/apis/pipelines.hook';
import plusIcon from '/src/assets/images/plus.svg';
import playIcon from '@/assets/images/play.svg';
import pauseIcon from '@/assets/images/pause.svg';

import disabledPlusIcon from '/src/assets/images/plus-disabled.svg';
import disabledPlayIcon from '@/assets/images/play-disabled.svg';

const nodeTypes = {
    custom: CustomPipelineItem,
};

const edgeTypes = {
    custom: CustomEdge,
};

export const PipelineFlow = ({
    pipeline,
    pipelineItems,
    pipelineConnectors,
    pipelineItemTypes,
    setDirtyForm,
    isDirty,
}: {
    pipeline: PipelineType;
    pipelineItems: PipelineItemType[];
    pipelineConnectors: PipelineConnectorType[];
    pipelineItemTypes: UniversalOption[];
    setDirtyForm: (dirty: boolean) => void;
    isDirty: boolean;
}) => {
    const reactFlowInstance = useReactFlow();
    const compareItem = (
        newOne: PipelineItemType | undefined,
        oldOne: PipelineItemType | undefined
    ): boolean => {
        if (newOne && !oldOne) {
            return true;
        }
        if (!newOne || !oldOne) {
            return false;
        }

        return (
            newOne.value !== oldOne.value ||
            newOne.point?.x !== oldOne.point?.x ||
            newOne.point?.y !== oldOne.point?.y ||
            newOne.itemType !== oldOne.itemType
        );
    };

    const pipelineItemToNode = (pipelineItem: PipelineItemType) => {
        const targetType = pipelineItemTypes.find(
            (itemType) => itemType.value === pipelineItem.itemType
        );
        return {
            id: pipelineItem.id?.toString() || '',
            type: 'custom',
            position: {
                x: pipelineItem.point?.x || 0,
                y: pipelineItem.point?.y || 0,
            },
            data: {
                ...pipelineItem,
                clickCrossButtonCallback: () => {
                    if (!pipelineItem.id) {
                        return;
                    }
                    setShouldBeDeleteId(pipelineItem.id);
                },
                pipelineItemChangedCallback: (
                    nodeId: string,
                    newValue: string,
                    newItemType: number
                ) => {
                    const newNodes = reactFlowInstance.getNodes();
                    const shouldBeChangeNode = newNodes.find(
                        (node) => node.id.toString() === nodeId
                    );

                    if (!shouldBeChangeNode) {
                        return;
                    }

                    // update local node
                    shouldBeChangeNode.data = {
                        ...shouldBeChangeNode.data,
                        value: newValue,
                        itemType: newItemType,
                        itemTypeKey: pipelineItemTypes.find(
                            (itemType) => itemType.value === newItemType
                        )?.key,
                    };

                    reactFlowInstance.setNodes(newNodes);

                    // update api
                    debounceChangeNodes([
                        {
                            ...shouldBeChangeNode.data,
                            value: newValue,
                            itemType: newItemType,
                            itemTypeKey: pipelineItemTypes.find(
                                (itemType) => itemType.value === newItemType
                            )?.key,
                        },
                    ] as PipelineItemType[]);
                },
                itemTypeKey: targetType ? targetType.key : null,
                isRun: pipeline?.isRun,
            },
        };
    };

    const pipelineConnectorToEdge = (connector: PipelineConnectorType) => {
        return {
            id: connector.id?.toString(),
            source: connector.sourcePipelineItemId.toString(),
            target: connector.destPipelineItemId.toString(),
            animated: true,
        } as any;
    };

    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);

    const [edges, setEdges, onEdgesChange] = useEdgesState(
        pipelineConnectors.map(pipelineConnectorToEdge)
    );
    const { id: idFromUrl } = useParams();

    const id: number | undefined = idFromUrl ? Number(idFromUrl) : undefined;
    // delete pipeline item
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<null | number>(
        null
    );
    const [shouldBeDeleteIds, setShouldBeDeleteIds] = useState<null | number[]>(
        null
    );

    const { fetchApi: deletePipelineItem, data: respOfDeletePipelineItem } =
        useDeletePipelineItem({
            pipelineId: id || 0,
            id: shouldBeDeleteId,
        });

    useEffect(() => {
        if (shouldBeDeleteId) {
            deletePipelineItem();
        }
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (!shouldBeDeleteIds || shouldBeDeleteIds.length === 0) {
            return;
        }
        setShouldBeDeleteId(shouldBeDeleteIds[0]);
        // eslint-disable-next-line
    }, [shouldBeDeleteIds]);

    useEffect(() => {
        if (respOfDeletePipelineItem?.status === RESPONSE_STATUS.OK) {
            setNodes(
                nodes.filter((node) => Number(node.id) !== shouldBeDeleteId)
            );
            setShouldBeDeleteIds(
                (shouldBeDeleteIds || []).filter(
                    (item) => item !== shouldBeDeleteId
                )
            );
            setShouldBeDeleteId(null);
        }
        // eslint-disable-next-line
    }, [respOfDeletePipelineItem]);

    // toggle pipeline
    const { fetchApi: togglePipeline } = useRunOrStopPipelineApi({
        isRun: pipeline ? !pipeline.isRun : false,
        id: pipeline ? pipeline.id : 0,
    });

    // create pipeline item
    const [shouldBeCreatePipelineItem, setShouldBeCreatePipelineItem] =
        useState<null | PipelineItemType>(null);
    const { fetchApi: createPipelineItem, data: respOfCreatePipelineItem } =
        useCreatePipelineItem({
            pipelineId: id || 0,
            ...shouldBeCreatePipelineItem,
        });

    useEffect(() => {
        if (!shouldBeCreatePipelineItem) {
            return;
        }
        createPipelineItem();
        // eslint-disable-next-line
    }, [shouldBeCreatePipelineItem]);

    useEffect(() => {
        if (!respOfCreatePipelineItem || !respOfCreatePipelineItem.id) {
            return;
        }
        setShouldBeCreatePipelineItem(null);
        setNodes([...nodes, pipelineItemToNode(respOfCreatePipelineItem)]);
        // eslint-disable-next-line
    }, [respOfCreatePipelineItem]);

    // create connector item
    const [shouldBeCreateConnector, setShouldBeCreateConnector] =
        useState<PipelineConnectorType | null>(null);
    const { fetchApi: createPipelineConnector, data: respOfCreateConnector } =
        useCreatePipelineConnector(
            shouldBeCreateConnector || {
                pipelineId: id || 0,
                sourcePipelineItemId: 0,
                destPipelineItemId: 0,
            }
        );

    useEffect(() => {
        if (!shouldBeCreateConnector) {
            return;
        }
        createPipelineConnector();
        // eslint-disable-next-line
    }, [shouldBeCreateConnector]);

    useEffect(() => {
        if (!respOfCreateConnector || !respOfCreateConnector.id) {
            return;
        }
        setEdges([...edges, pipelineConnectorToEdge(respOfCreateConnector)]);
        setShouldBeCreateConnector(null);
        // eslint-disable-next-line
    }, [respOfCreateConnector]);

    // delete connector item
    const [shouldBeDeleteConnectors, setShouldBeDeleteConnectors] = useState<
        | {
              pipelineId: number;
              id: number;
          }[]
        | null
    >(null);

    const [shouldBeDeleteConnector, setShouldBeDeleteConnector] = useState<{
        pipelineId: number;
        id: number;
    } | null>(null);

    const { fetchApi: deletePipelineConnector, data: respOfDeleteConnector } =
        useDeletePipelineConnector(
            shouldBeDeleteConnector
                ? {
                      pipelineId: shouldBeDeleteConnector.pipelineId || 0,
                      id: shouldBeDeleteConnector.id || 0,
                  }
                : {
                      pipelineId: id || 0,
                      id: 0,
                  }
        );

    useEffect(() => {
        if (!shouldBeDeleteConnector) {
            return;
        }
        deletePipelineConnector();
        // eslint-disable-next-line
    }, [shouldBeDeleteConnector]);

    useEffect(() => {
        if (
            !shouldBeDeleteConnectors ||
            shouldBeDeleteConnectors.length === 0
        ) {
            return;
        }
        setShouldBeDeleteConnector(shouldBeDeleteConnectors[0]);
        // eslint-disable-next-line
    }, [shouldBeDeleteConnectors]);

    useEffect(() => {
        if (
            !respOfDeleteConnector ||
            respOfDeleteConnector.status !== RESPONSE_STATUS.OK
        ) {
            return;
        }
        setEdges(
            edges.filter(
                (edge) => edge.id !== shouldBeDeleteConnector?.id?.toString()
            )
        );

        setShouldBeDeleteConnectors(
            (shouldBeDeleteConnectors || []).filter(
                (item) => item.id !== shouldBeDeleteConnector?.id
            )
        );
        setShouldBeDeleteConnector(null);
        // eslint-disable-next-line
    }, [respOfDeleteConnector]);

    // update node
    const [shouldBeUpdateNode, setShouldBeUpdateNode] =
        useState<PipelineItemType | null>(null);

    const [shouldBeUpdateNodes, setShouldBeUpdateNodes] = useState<
        PipelineItemType[] | null
    >(null);

    const debounceChangeNodes = useDebounce(
        (changeNodes: PipelineItemType[]) => {
            setShouldBeUpdateNodes(
                changeNodes.filter((newOne: PipelineItemType) => {
                    return compareItem(
                        newOne,
                        pipelineItems.find(
                            (oldOne: PipelineItemType) =>
                                Number(oldOne.id) === Number(newOne.id)
                        )
                    );
                })
            );
        },
        800
    );

    const { fetchApi: updatePipelineItem, data: respOfUpdatePipelineItem } =
        useUpdatePipelineItem(
            shouldBeUpdateNode ||
                ({
                    pipelineId: id || 0,
                    id: 0,
                } as PipelineItemType)
        );

    useEffect(() => {
        if (!shouldBeUpdateNode) {
            return;
        }
        updatePipelineItem();
        // eslint-disable-next-line
    }, [shouldBeUpdateNode]);

    useEffect(() => {
        if (shouldBeUpdateNodes === null || shouldBeUpdateNodes.length === 0) {
            return;
        }
        setShouldBeUpdateNode(shouldBeUpdateNodes[0]);
    }, [shouldBeUpdateNodes]);

    useEffect(() => {
        if (
            !respOfUpdatePipelineItem ||
            respOfUpdatePipelineItem?.status !== RESPONSE_STATUS.OK
        ) {
            return;
        }
        const newShouldBeUpdateNodes = shouldBeUpdateNodes?.filter(
            (node) => node.id !== shouldBeUpdateNode?.id
        );

        setShouldBeUpdateNode(null);
        setShouldBeUpdateNodes(newShouldBeUpdateNodes || []);
        // eslint-disable-next-line
    }, [respOfUpdatePipelineItem]);

    // dirty form
    useEffect(() => {
        let isDirty = false;
        if (
            shouldBeDeleteConnector ||
            shouldBeCreateConnector ||
            shouldBeCreatePipelineItem ||
            shouldBeDeleteId ||
            (shouldBeDeleteIds && shouldBeDeleteIds.length > 0) ||
            shouldBeUpdateNode ||
            (shouldBeUpdateNodes && shouldBeUpdateNodes?.length > 0)
        ) {
            isDirty = true;
        }
        setDirtyForm(isDirty);
    }, [
        shouldBeDeleteConnector,
        shouldBeCreateConnector,
        shouldBeCreatePipelineItem,
        shouldBeDeleteId,
        shouldBeDeleteIds,
        shouldBeUpdateNode,
        shouldBeUpdateNodes,
        setDirtyForm,
    ]);

    useEffect(() => {
        if (nodes.length === 0 || pipeline?.isRun === nodes[0]?.data.isRun) {
            return;
        }
        setNodes(pipelineItems.map(pipelineItemToNode));
        // eslint-disable-next-line
    }, [pipeline]);

    useEffect(() => {
        // 只在一次進到這個 hook 才做 setNodes, 否則會一直在操作的過程中 re-render
        if (
            JSON.stringify(nodes.map((item) => item.id).sort()) ===
            JSON.stringify(
                pipelineItems
                    .map((item) => (item.id ? item.id.toString() : ''))
                    .sort()
            )
        ) {
            return;
        }
        setNodes(pipelineItems.map(pipelineItemToNode));
        // eslint-disable-next-line
    }, [pipelineItems]);

    return (
        <ReactFlow
            className="pipeline-flow"
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={!pipeline?.isRun}
            nodesConnectable={!pipeline?.isRun}
            elementsSelectable={!pipeline?.isRun}
            onNodesChange={(changes) => {
                onNodesChange(changes);
            }}
            onNodeDragStop={(event: React.MouseEvent, dropNode: Node) => {
                setDirtyForm(true);

                const changeNodes = reactFlowInstance
                    .getNodes()
                    .filter((node) => node.id === dropNode.id)
                    .map(
                        (item: any) =>
                            ({
                                ...item.data,
                                point: {
                                    x: Math.round(dropNode.position.x),
                                    y: Math.round(dropNode.position.y),
                                },
                            } as PipelineItemType)
                    );

                setShouldBeUpdateNodes(
                    changeNodes.filter((newOne: PipelineItemType) => {
                        return compareItem(
                            newOne,
                            pipelineItems.find(
                                (oldOne: PipelineItemType) =>
                                    Number(oldOne.id) === Number(newOne.id)
                            )
                        );
                    })
                );
            }}
            onEdgesChange={onEdgesChange}
            onConnect={(params) => {
                setDirtyForm(true);
                setShouldBeCreateConnector({
                    pipelineId: id || 0,
                    sourcePipelineItemId: Number(params.source),
                    destPipelineItemId: Number(params.target),
                });
            }}
            onEdgesDelete={(params) => {
                setDirtyForm(true);
                setShouldBeDeleteConnectors(
                    params.map((param) => ({
                        pipelineId: id || 0,
                        id: Number(param.id),
                    }))
                );
            }}
            onNodesDelete={(params) => {
                setDirtyForm(true);
                setShouldBeDeleteIds(params.map((param) => Number(param.id)));
            }}
        >
            <Panel position="top-left">
                <div className="d-flex">
                    <div
                        onClick={() => {
                            if (isDirty) {
                                return;
                            }
                            const nodes = reactFlowInstance.getNodes();
                            const lastNode = nodes[nodes.length - 1];
                            setShouldBeCreatePipelineItem({
                                pipelineId: Number(id || 0),
                                point: {
                                    x: lastNode
                                        ? Math.round(lastNode.position.x)
                                        : 100,
                                    y: lastNode
                                        ? Math.round(
                                              lastNode.position.y +
                                                  (lastNode.height || 0)
                                          ) + 50
                                        : 100,
                                } as XYPosition,
                            });
                        }}
                        role="button"
                        className={`d-flex align-items-center ${
                            isDirty ? 'cursor-na' : ''
                        }`}
                        style={{
                            width: '40px',
                            height: '40px',
                        }}
                    >
                        <img
                            className="icon"
                            src={pipeline?.isRun ? disabledPlusIcon : plusIcon}
                        />
                    </div>
                    <div
                        onClick={() => {
                            if (isDirty) {
                                return;
                            }
                            togglePipeline();
                        }}
                        className={`d-flex align-items-center rounded ms-2 ${
                            isDirty ? 'cursor-na' : ''
                        }`}
                        style={{
                            width: '40px',
                            height: '40px',
                        }}
                        role="button"
                    >
                        <img
                            className="icon"
                            src={
                                isDirty
                                    ? disabledPlayIcon
                                    : pipeline?.isRun
                                    ? pauseIcon
                                    : playIcon
                            }
                        />
                    </div>
                </div>
            </Panel>
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>
    );
};

export const PipelineFlowProvider = (props: any) => {
    return (
        <ReactFlowProvider>
            <PipelineFlow {...props} />
        </ReactFlowProvider>
    );
};
