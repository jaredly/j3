// Ok

const effects = `[
    ('modal/alert string ())
    ('modal/confirm string bool)
]`;

export const platform = {
    id: 'modal',
    effects: effects,
    handlers: {
        alert(msg: string) {
            window.alert(msg);
        },
        confirm(msg: string) {
            return window.confirm(msg);
        },
    },
};
