/**
 * This defines the kinds of things that can be "exported".
 *
 * This is an incomplete list, you can help by expanding it.
 */

export const exportables = {
    Evaluator: {},
    Backend: {},
    Visualization: {},
};

export type Evaluator = {};

export type Backend = (data: any) => any;

export type Visualization = () => HTMLElement;

// lol idk
