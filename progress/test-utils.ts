export const splitCase = (text: string) => {
    const chunks = text.split('\n');
    const code: string[] = [];
    let expected: string | null = null;
    let type: string | null = null;
    let errors: string[] = [];
    chunks.forEach((line) => {
        if (line.startsWith('= ')) {
            expected = line.slice(2);
        } else if (line.startsWith('-> ')) {
            type = line.slice(3);
        } else if (errors.length || line.match(/^-?\d+: /)) {
            errors.push(line);
        } else {
            code.push(line);
        }
    });
    return {
        input: code.join('\n'),
        expected,
        expectedType: type,
        errors: errors.join('\n'),
    };
};
