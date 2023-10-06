import { useEffect } from 'react';
import { useRef } from 'react';
import * as Plot from '@observablehq/plot';
import React from 'react';
import * as d3 from 'd3';

export type Node = { name: string; children: Node[]; x?: number; y?: number };

const run = (data: Node) => {
    // const width = 928;

    // Compute the tree height; this approach will allow the height of the
    // SVG to scale according to the breadth (width) of the tree layout.
    const root = d3.hierarchy<Node>(data);
    const dx = 20;
    // const dy = width / (root.height + 1);
    const dy = 30;

    // Create a tree layout.
    const tree = d3.tree<Node>().nodeSize([dx, dy]);

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    root.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // Compute the adjusted height of the tree.
    const height = x1 - x0 + dx * 2; // + 100;
    const width = (root.height * dy + dy) * 5; // + 100;

    const svg = d3
        .create('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-dy * 2, x0 - dx, width, height])
        .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    const link = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 1.5)
        .selectAll()
        .data(root.links())
        .join('path')
        .attr(
            'd',
            d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x),
        );

    const node = svg
        .append('g')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .selectAll()
        .data(root.descendants())
        .join('g')
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('fill', (d) => (d.children ? '#555' : '#999'))
        .attr('r', 2.5);

    node.append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => (d.children ? -6 : 6))
        .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .text((d) => d.data.name)
        .clone(true)
        .lower()
        .attr('stroke', 'white');

    return svg.node()!;
};

export const Tree = ({ data }: { data: Node }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // const data: Node = {
        //     name: 'hi',
        //     children: [
        //         { name: 'ho', children: [] },
        //         { name: 'hum', children: [] },
        //     ],
        // };

        // const node = Plot.plot({
        //     axis: null,
        //     margin: 10,
        //     height: 100,
        //     marks: [Plot.tree(data, { path: 'name', delimiter: '.' })],
        // });

        const node = run(data ?? {});

        ref.current?.append(node);
        return () => node.remove();
    }, []);

    return (
        <div style={{ color: 'red', backgroundColor: 'white' }}>
            <div ref={ref} />
        </div>
    );
};
