import { Type } from '../../src/types/ast';

export type Render = {
    id: string;
    expected: Type;
    render(value: any): JSX.Element;
};
