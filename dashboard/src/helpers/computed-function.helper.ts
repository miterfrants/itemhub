import * as math from 'mathjs';

export const ComputedFunctionHelpers = {
    Eval: (funcRaw: string): ComputedFunctionType | null => {
        try {
            const templateStingRegExp = /^`.+`$/gm;
            const matchedTemplateString = templateStingRegExp.test(funcRaw);
            if (!matchedTemplateString) {
                return ComputedFunctionHelpers.TryParse(funcRaw);
            } else if (matchedTemplateString) {
                const matchIterator = funcRaw.matchAll(/\${([^{|^}]+)}/gi);
                let matched = matchIterator.next();
                const functionArray: ComputedFunctionType[] = [];
                let funcRawTemplate = funcRaw;
                let index = 0;
                while (matched.value) {
                    const funcRawItem = matched.value[1];
                    funcRawTemplate = funcRawTemplate.replace(
                        matched.value[0],
                        `$args${index}`
                    );
                    const tryParseResult =
                        ComputedFunctionHelpers.TryParse(funcRawItem);
                    if (tryParseResult === null) {
                        return null;
                    }
                    functionArray.push(tryParseResult);
                    index++;
                    matched = matchIterator.next();
                }
                return (data, sourceSensorData) => {
                    let template = funcRawTemplate.replace(/`/gi, '');
                    functionArray.forEach((func, index) => {
                        const result = func(data, sourceSensorData);
                        template = template.replace(
                            `$args${index}`,
                            result ? result.toString() : ''
                        );
                    });
                    return template;
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    },
    TryParse: (funcRaw) => {
        const testScope = { data: 1, sourceSensorData: 2 };
        const testNode = math.parse(funcRaw);
        const testCode = testNode.compile();
        testCode.evaluate(testScope);
        return (data, sourceSensorData) => {
            const scope = { data, sourceSensorData: sourceSensorData || 0 };
            const node = math.parse(funcRaw);
            const code = node.compile();
            return code.evaluate(scope);
        };
    },
};

export type ComputedFunctionType = (
    data: number,
    sourceSensorData?: number | null
) => number | string | undefined;
