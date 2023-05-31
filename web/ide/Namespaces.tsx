import React from 'react';
import { useState } from 'react';
import { Builtins, Env } from '../../src/to-ast/library';
import { Library } from '../../src/to-ast/library';
import { HashedTree } from '../../src/db/hash-tree';
import { IDEState } from './IDE';
import { addToHashedTree } from '../../src/db/hash-tree';
import { Tree } from '../../src/db/hash-tree';
import { addToTree } from '../../src/db/hash-tree';
import { makeHash } from './initialData';

const buttonStyle = {
    fontSize: '80%',
    borderRadius: 4,
    padding: '0px 4px',
    display: 'inline-block',
    backgroundColor: '#444',
};

export const Button = ({
    top,
    definitions,
    builtins,
}: {
    top: string;
    definitions: Library['definitions'];
    builtins: Builtins;
}) => {
    if (!top || top === '.') {
        return <span style={buttonStyle}>&nbsp;</span>;
    }
    if (top.startsWith(':builtin:')) {
        const hash = top.slice(':builtin:'.length);
        return (
            <span style={buttonStyle}>
                {builtins[hash]?.type === 'type' ? 'T' : 'e'}
            </span>
        );
    }
    const defn = definitions[top];
    if (!defn) {
        console.log('what', top, definitions);
        return <span>No good</span>;
    }
    if (defn.type === 'term') {
        return <span style={buttonStyle}>e</span>;
    }
    if (defn.type === 'type') {
        return <span style={buttonStyle}>T</span>;
    }
    return <span style={buttonStyle}>unknown</span>;
};

export const NSTree = ({
    root,
    name,
    level,
    builtins,
    namespaces,
    definitions,
}: {
    root: string;
    name: string;
    level: number;
    builtins: Builtins;
    namespaces: HashedTree;
    definitions: Library['definitions'];
}) => {
    const [open, setOpen] = useState(false);
    const canBeOpen = level === 0 || open;

    if (!namespaces[root]) {
        return <div>Ok</div>;
    }

    const top = namespaces[root][''];
    const keys = Object.keys(namespaces[root]).sort();

    if (keys.length === 1 && keys[0] === '' && top !== '.') {
        return (
            <div className="menu-hover" style={{ cursor: 'pointer' }}>
                <span
                    style={{
                        width: '2em',
                        display: 'inline-block',
                        textAlign: 'right',
                        marginRight: 4,
                    }}
                ></span>
                <Button
                    builtins={builtins}
                    top={top}
                    definitions={definitions}
                />
                <span style={{ display: 'inline-block', width: 4 }} />
                {name}
            </div>
        );
    }

    return (
        <div>
            {level > 0 ? (
                <div
                    onMouseDown={() => setOpen(!open)}
                    style={{ cursor: 'pointer' }}
                    className="menu-hover"
                >
                    <span
                        style={{
                            width: '2em',
                            display: 'inline-block',
                            textAlign: 'right',
                            marginRight: 4,
                        }}
                    >
                        {keys.length - (top ? 1 : 0)}
                    </span>
                    <Button
                        builtins={builtins}
                        top={top}
                        definitions={definitions}
                    />
                    <span style={{ display: 'inline-block', width: 4 }} />
                    {name}/
                </div>
            ) : null}

            {canBeOpen &&
                keys
                    .filter((k) => k !== '')
                    .map((name) => {
                        const hash = namespaces[root][name];
                        return (
                            <div key={name}>
                                <div style={{ marginLeft: level > 0 ? 20 : 0 }}>
                                    <NSTree
                                        root={hash}
                                        name={name}
                                        level={level + 1}
                                        builtins={builtins}
                                        // sandboxes={sandboxes}
                                        namespaces={namespaces}
                                        definitions={definitions}
                                    />
                                </div>
                            </div>
                        );
                    })}
        </div>
    );
};

export const addSandboxesToNamespaces = (
    library: Library,
    sandboxes: IDEState['sandboxes'],
) => {
    const tree: Tree = { children: {} };
    sandboxes.forEach((meta) => {
        addToTree(tree, `sandbox/${meta.id}`, '.');
    });
    const namespaces: HashedTree = { ...library.namespaces };
    const root = addToHashedTree(namespaces, tree, makeHash, {
        root: library.root,
        tree: library.namespaces,
    })!;
    return { root, namespaces };
};

export const Namespaces = ({
    env,
    sandboxes,
}: {
    env: Env;
    sandboxes: IDEState['sandboxes'];
}) => {
    const library = env.library; // addSandboxesToNamespaces(env.library, sandboxes);

    const root = library.root; // env.library.root;
    return (
        <div style={{ width: 300, minWidth: 300 }}>
            <NSTree
                root={root}
                level={0}
                name={''}
                // sandboxes={sandboxes}
                builtins={env.builtins}
                namespaces={library.namespaces}
                definitions={env.library.definitions}
            />
        </div>
    );
};
