import { CGraph, MNode } from './cgraph';
import { CRDT } from './crdt';
import { SerDe } from './serde';

type XML = { id: string; json: { kind: string; value: any }; edges: Record<string, { id: string; dest: string; del?: boolean }[]> };

export const graphToXMLs = (graph: CGraph<MNode<any> & CRDT & SerDe<any>, any>) => {
    const xmls: Record<string, XML> = {};
    xmls.root = {
        id: '<root>',
        json: { kind: '<root>', value: '' },
        edges: {
            root: graph.edgeFrom['root root']?.map((edge) => {
                return { id: edge, dest: graph.edges[edge].dest, del: graph.edges[edge].deleted ? true : undefined };
            }),
        },
    };
    Object.values(graph.nodes).forEach((node) => {
        const xml: XML = { id: node.id, json: node.toJSON(), edges: {} };
        node.outs.forEach((attr) => {
            xml.edges[attr] =
                graph.edgeFrom[`${node.id} ${attr}`]?.map((eid) => {
                    const edge = graph.edges[eid];
                    return { id: edge.id, dest: edge.dest, del: edge.deleted ? true : undefined };
                }) ?? [];
        });
        xmls[node.id] = xml;
    });
    return xmls;
};

export const showXMLs = (xmls: Record<string, XML>) => {
    return Object.values(xmls)
        .map(
            (xml) =>
                `${xml.id}. ${xml.json.kind} : ${JSON.stringify(xml.json.value)}` +
                Object.entries(xml.edges)
                    .map(([attr, edges]) => `\n  ${attr}: ${edges.map((e) => `${e.dest}(${e.id})` + (e.del ? '/D' : '')).join('; ')}`)
                    .join(''),
        )
        .join('\n');
};
