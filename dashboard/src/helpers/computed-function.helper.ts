import * as math from 'mathjs';

export const ComputedFunctionHelpers = {
    Eval: (funcRaw: string): ComputedFunctionType | null => {
        try {
            math.evaluate(
                funcRaw
                    .replace(/sourceSensorData/gi, '1')
                    .replace(/data/gi, '1')
            );
            const evalResult = eval(
                `(data, sourceSensorData) => { return ${funcRaw
                    .replace(/document/gi, '')
                    .replace(/eval/gi, '')} }`
            );
            return evalResult;
        } catch (error) {
            return null;
        }
    },
};

export type ComputedFunctionType = (
    data: number,
    sourceSensorData?: number | null
) => void;
