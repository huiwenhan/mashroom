// @flow

import type {MashroomLogger} from '../../type-definitions';

const TEMPLATE_CODE_REGEX = /\${(.+?)}/g;
const TEMPLATE_CODE_ACCESSED_OBJECTS = /(?:^|\W)(\w+?)\./g;

const isTemplate = (templateStr: string) => templateStr.indexOf('${') !== -1;

const isSafeTemplate = (templateStr: string, context: any) => {
    const objectsAllowedToAccess = Object.keys(context);
    let matchCode = TEMPLATE_CODE_REGEX.exec(templateStr);
    while (matchCode) {
        const code = matchCode[1];
        let matchAccessedObject = TEMPLATE_CODE_ACCESSED_OBJECTS.exec(code);
        while (matchAccessedObject) {
            const accessedObject = matchAccessedObject[1];
            if (objectsAllowedToAccess.indexOf(accessedObject) === -1) {
                return false;
            }
            matchAccessedObject = TEMPLATE_CODE_ACCESSED_OBJECTS.exec(code);
        }
        matchCode = TEMPLATE_CODE_REGEX.exec(templateStr);
    }

    return true;
};

export const safeEvaluateStringTemplate = (templateStr: string, context: any): string => {
    if (!isTemplate(templateStr)) {
        return templateStr;
    }
    if (!isSafeTemplate(templateStr, context)) {
        throw new Error('Template tries to access global objects: ' + templateStr);
    }

    const args = Object.keys(context);
    const values = args.map((arg) => context[arg]);

    // $FlowFixMe
    const template = new Function(...args, `return \`${templateStr}\`;`)

    return template.apply({}, values);
};

export const evaluateTemplatesInConfigObject = (config: any, logger: MashroomLogger): void => {
    // Currently only environment variables can be used in templates
    const context = {
        env: Object.assign({}, process.env),
    };

    const replaceStringValues = (config: any) => {
        for (const propName in config) {
            if (config.hasOwnProperty(propName)) {
                const value = config[propName];
                if (typeof (value) === 'string') {
                    try {
                        config[propName] = safeEvaluateStringTemplate(value, context);
                    } catch (error) {
                        logger.error('Evaluating template string in config failed', error);
                    }
                } else if (typeof (value) === 'object') {
                    replaceStringValues(value);
                }
            }
        }
    };

    replaceStringValues(config);
};
