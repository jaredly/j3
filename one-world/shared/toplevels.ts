/*

Ok, so DocumentNode is responsible for
- display
- plugin
- etc.
- metaDataMap
- toplevel
- namespace root
    - I worry this will lead to denormalization issues ... but maybe its fine...
        - if there's an issue, it can be a "highlight that it's different and show a button to either remove this or fix that"


Toplevel
- id
- node map
- next loc (nidx)
- root loc
- docstring loc
-

*/

import { Nodes } from './nodes';

export type Toplevel = {
    id: string;
    nodes: Nodes;
    root: number;
    docstring: number;
    nextLoc: number;
};

export type Toplevels = Record<number, Toplevel>;
