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
import { useEffect, useState } from 'react';
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
}: {
    pipeline: PipelineType;
    pipelineItems: PipelineItemType[];
    pipelineConnectors: PipelineConnectorType[];
    pipelineItemTypes: UniversalOption[];
}) => {
    const reactFlowInstance = useReactFlow();
    const compareItem = (
        newOne: PipelineItemType | undefined,
        oldOne: PipelineItemType | undefined
    ): boolean => {
        if (newOne && !oldOne) {
            return false;
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
                    const changeNodes = reactFlowInstance
                        .getNodes()
                        .filter((node) => node.id === nodeId)
                        .map(
                            (item: any) =>
                                ({
                                    ...item.data,
                                    value: newValue,
                                    itemType: newItemType,
                                } as PipelineItemType)
                        );
                    debounceChangeNodes(changeNodes);
                },
                itemTypeKey: targetType ? targetType.key : null,
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
    const [nodes, setNodes, onNodesChange] = useNodesState(
        pipelineItems.map(pipelineItemToNode)
    );

    useEffect(() => {
        setNodes(pipelineItems.map(pipelineItemToNode));
        // eslint-disable-next-line
    }, [pipelineItems]);

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
        setShouldBeCreateConnector(null);
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
            (node) => node.id !== shouldBeUpdateNode?.id?.toString()
        );
        setShouldBeUpdateNodes(newShouldBeUpdateNodes || []);
        // eslint-disable-next-line
    }, [respOfUpdatePipelineItem]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={(changes) => {
                onNodesChange(changes);
            }}
            onNodeDragStop={(event: React.MouseEvent, dropNode: Node) => {
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
                debounceChangeNodes(changeNodes);
            }}
            onEdgesChange={onEdgesChange}
            onConnect={(params) => {
                setShouldBeCreateConnector({
                    pipelineId: id || 0,
                    sourcePipelineItemId: Number(params.source),
                    destPipelineItemId: Number(params.target),
                });
            }}
            onEdgesDelete={(params) => {
                setShouldBeDeleteConnectors(
                    params.map((param) => ({
                        pipelineId: id || 0,
                        id: Number(param.id),
                    }))
                );
            }}
            onNodesDelete={(params) => {
                setShouldBeDeleteIds(params.map((param) => Number(param.id)));
            }}
        >
            <Panel position="top-left">
                <div className="d-flex">
                    <button
                        onClick={() => {
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
                        className="border border-gray d-flex align-items-center rounded"
                        style={{
                            width: '32px',
                            height: '32px',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                        >
                            <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => {
                            togglePipeline();
                        }}
                        className="border border-gray d-flex align-items-center rounded ms-3"
                        style={{
                            width: '32px',
                            height: '32px',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                        >
                            {!pipeline?.isRun && (
                                <path d="M 3.527344 0.148438 C 2.628906 0.480469 2.042969 1.199219 1.707031 2.378906 C 1.597656 2.761719 1.59375 3.386719 1.59375 16 C 1.59375 28.601562 1.597656 29.238281 1.707031 29.625 C 1.914062 30.363281 2.207031 30.882812 2.648438 31.296875 C 3.171875 31.785156 3.582031 31.953125 4.34375 31.984375 C 5.054688 32.015625 5.585938 31.898438 6.339844 31.539062 C 6.957031 31.246094 27.945312 19.226562 28.65625 18.761719 C 29.460938 18.230469 30.027344 17.558594 30.289062 16.820312 C 30.734375 15.5625 30.109375 14.195312 28.65625 13.238281 C 27.945312 12.773438 6.957031 0.753906 6.339844 0.460938 C 5.636719 0.125 5.117188 0 4.4375 0.00390625 C 4.042969 0.0078125 3.808594 0.0429688 3.527344 0.148438 " />
                            )}
                            {pipeline?.isRun && (
                                <path d="M 0 256.002 L 0 512.004 256.250 511.752 L 512.500 511.500 512.752 255.750 L 513.004 0 256.502 0 L 0 0 0 256.002 " />
                            )}
                        </svg>
                    </button>
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
