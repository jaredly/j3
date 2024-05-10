import { ProduceItem } from '../../ide/ground-up/FullEvalator';
import React from 'react';
import { valueToString } from '../../ide/ground-up/valueToString';
// import { isValidNode } from '../../../src/types/isStr';

export const displayFunctionIds = ['pre', 'none', null] as const;

export const displayFunction = (config?: {
    id: (typeof displayFunctionIds)[any];
    options: any;
}): undefined | ((v: any) => ProduceItem[]) => {
    if (!config) return;
    // if (config.id === 'node') {
    //     return (value) => {
    //         if (isValidNode(value)) {
    //             return [{ type: 'node', node: value }];
    //         }
    //         return [valueToString(value)];
    //     };
    // }
    if (config.id === 'pre') {
        return (value) => {
            if (typeof value === 'string') {
                return [{ type: 'pre', text: value }];
            }
            return [{ type: 'pre', text: JSON.stringify(value, null, 2) }];
        };
    }
    if (config.id === 'none') {
        return () => [];
    }
    return (value) => [valueToString(value)];
};
