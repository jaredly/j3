import { ProduceItem } from '../../ide/ground-up/FullEvalator';
import React from 'react';
import { valueToString } from '../../ide/ground-up/valueToString';

export const displayFunction = (config?: {
    id: string;
    options: any;
}): undefined | ((v: any) => ProduceItem[]) => {
    if (!config) return;
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
