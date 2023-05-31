import React, { useEffect, useState } from 'react';
import { Db, parseColumns } from '../../src/db/tables';
import { Sandbox } from '../../src/to-ast/library';
import { IDEAction } from './IDE';
import { getSandbox, getSandboxes } from '../../src/db/sandbox';
import relative from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

dayjs.extend(relative);

export const Dashboard = ({
    db,
    initial,
    dispatch,
}: {
    db: Db;
    initial: Sandbox['meta'][];
    dispatch: React.Dispatch<IDEAction>;
}) => {
    const [logs, setLogs] = useState([] as any[]);
    const [edit, setEdit] = useState('');
    const [sandboxes, setSandboxes] = useState(initial);
    const addLog = (v: any) => setLogs((l) => l.concat([v]));
    const [show, setShow] = useState(false);
    useEffect(() => {
        getSandboxes(db).then(setSandboxes);
    }, []);
    return (
        <div>
            <div style={{ padding: 8 }}>Dashboard</div>
            <table style={{ borderSpacing: 0 }}>
                <tbody style={{ background: '#111' }}>
                    {sandboxes.map((sb) => (
                        <tr
                            style={{
                                cursor: 'pointer',
                                background: '#111',
                                padding: 16,
                                // marginBottom: 8,
                            }}
                            onClick={() =>
                                getSandbox(db, sb).then((sandbox) => {
                                    dispatch({ type: 'open-sandbox', sandbox });
                                })
                            }
                        >
                            <td
                                style={{ padding: 8 }}
                                onClick={() =>
                                    getSandbox(db, sb).then((sandbox) => {
                                        dispatch({
                                            type: 'open-sandbox',
                                            sandbox,
                                        });
                                    })
                                }
                            >
                                {sb.title}
                            </td>
                            <td>{sb.id}</td>
                            <td>{dayjs(sb.created_date * 1000).fromNow()}</td>
                            <td>{dayjs(sb.updated_date * 1000).fromNow()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => setShow(!show)} style={{ marginTop: 16 }}>
                Show SQL REPL
            </button>
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
