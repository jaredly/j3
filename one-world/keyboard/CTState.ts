import { CTop } from './keyActionToCRDTUpdate';
import { Top, NodeSelection } from './utils';

export type CTState = { ctop: CTop; top: Top; sel: NodeSelection };

export const ticker = () => {
    let i = 0;
    return () => {
        if (i >= 999) throw new Error('no ahh');
        return (i++).toString().padStart(3, '0');
    };
};
