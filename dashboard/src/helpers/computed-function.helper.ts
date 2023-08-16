export const ComputedFunctionHelpers = {
    Eval: (funcRaw: string): ComputedFunctionType | null => {
        try {
            const evalResult = eval(
                `(data) => { return ${funcRaw
                    .replace(/document/gi, '')
                    .replace(/eval/gi, '')} }`
            );
            return evalResult;
        } catch (error) {
            return null;
        }
    },
};

export type ComputedFunctionType = (data: number) => void;
