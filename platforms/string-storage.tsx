// Ok

const effects = `[
    ('string/set {id string value string} ())
    ('string/get string (result string 'NotFound))
]`;

export const platform = {
    id: 'string',
    effects: effects,
    handlers: {
        set({ id, value }: { id: string; value: string }) {
            localStorage['ss:' + id] = value;
        },
        get(id: string) {
            const key = 'ss:' + id;
            return key in localStorage
                ? { type: 'Ok', payload: localStorage[key] }
                : { type: 'Err', payload: 'NotFound' };
        },
    },
};
