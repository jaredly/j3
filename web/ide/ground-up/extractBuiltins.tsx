export function extractBuiltins(raw: string) {
    const names: string[] = getConstNames(raw);
    let res: any;
    try {
        res = new Function('', raw + `\nreturn {${names.join(', ')}}`)();
    } catch (err) {
        console.log('Failed to extract builtins');
        console.error(err);
        console.log(raw);
        return {};
    }
    Object.keys(res).forEach((name) => {
        let desan = name;
        Object.entries(res.sanMap).forEach(([key, value]) => {
            desan = desan.replaceAll(value as string, key);
        });
        res[desan] = res[name];
    });
    return res;
}
export function getConstNames(raw: any) {
    const names: string[] = [];
    (raw as string).replaceAll(/^const ([a-zA-Z0-9_$]+)/gm, (v, name) => {
        names.push(name);
        return '';
    });
    return names;
}
