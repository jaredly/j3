export const listen = <T,>(lst: T[], f: T) => {
    lst.push(f);
    return () => {
        const idx = lst.indexOf(f);
        if (idx !== -1) {
            lst.splice(idx, 1);
        }
    };
};
