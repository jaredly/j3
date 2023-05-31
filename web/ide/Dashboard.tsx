import React, { useState } from 'react';
import { Db, parseColumns } from '../../src/db/tables';

export const Dashboard = ({ db }: { db: Db }) => {
    const [logs, setLogs] = useState([] as any[]);
    const [edit, setEdit] = useState('');
    const addLog = (v: any) => setLogs((l) => l.concat([v]));
    const [show, setShow] = useState(false);
    return (
        <div>
            Dasbboard
            <button onClick={() => setShow(!show)}>Show SQL REPL</button>
            {show ? (
                <div>
                    <textarea
                        value={edit}
                        onChange={(evt) => setEdit(evt.target.value)}
                    />
                    <div>
                        <button
                            onClick={() => {
                                db.all(
                                    'select name, sql from sqlite_schema',
                                ).then((rows) =>
                                    addLog(
                                        rows
                                            .filter((s) => s.sql)
                                            .map(
                                                ({ name, sql }) =>
                                                    `Table: ${name}\n\n${parseColumns(
                                                        sql as string,
                                                    )
                                                        .map(
                                                            ({
                                                                name,
                                                                datatype,
                                                                constraints,
                                                            }) =>
                                                                `${name}\t${
                                                                    datatype.variant
                                                                }/${
                                                                    datatype.affinity
                                                                }\t${JSON.stringify(
                                                                    constraints.map(
                                                                        (m) =>
                                                                            m.variant,
                                                                    ),
                                                                )}`,
                                                        )
                                                        .join('\n')}`,
                                            )
                                            .join('\n\n'),
                                    ),
                                );
                            }}
                        >
                            Get Schemas
                        </button>
                        <button
                            onClick={() => {
                                db.all(edit).then(
                                    (table) => addLog(table),
                                    (err) => {
                                        console.error(err);
                                        addLog(`Failed! ${err}`);
                                    },
                                );
                            }}
                        >
                            Get All
                        </button>
                        <button
                            onClick={() => {
                                db.run(edit).then(
                                    () => addLog('Success'),
                                    (err) => {
                                        console.error(err);
                                        addLog(`Failed! ${err}`);
                                    },
                                );
                            }}
                        >
                            Execute
                        </button>
                    </div>
                    {logs.map((log, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 4,
                                borderBottom: '1px solid #aaa',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {typeof log === 'string'
                                ? log
                                : JSON.stringify(log)}
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
