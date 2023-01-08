import {
    Term,
    Expr,
    Pattern,
    Number,
    NumberKind,
    Type,
    Shared,
    Identifier,
    Record,
    TVar,
    Loc,
} from './ast';

export type Visitor<Ctx> = {
    Term?: (node: Term, ctx: Ctx) => null | false | Term | [Term | null, Ctx];
    TermPost?: (node: Term, ctx: Ctx) => null | Term;
    NumberKind?: (
        node: NumberKind,
        ctx: Ctx,
    ) => null | false | NumberKind | [NumberKind | null, Ctx];
    NumberKindPost?: (node: NumberKind, ctx: Ctx) => null | NumberKind;
    Number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Number | [Number | null, Ctx];
    NumberPost?: (node: Number, ctx: Ctx) => null | Number;
    Pattern?: (
        node: Pattern,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost?: (node: Pattern, ctx: Ctx) => null | Pattern;
    Expr?: (node: Expr, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx];
    ExprPost?: (node: Expr, ctx: Ctx) => null | Expr;
    Record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Record | [Record | null, Ctx];
    RecordPost?: (node: Record, ctx: Ctx) => null | Record;
    TVar?: (node: TVar, ctx: Ctx) => null | false | TVar | [TVar | null, Ctx];
    TVarPost?: (node: TVar, ctx: Ctx) => null | TVar;
    Identifier?: (
        node: Identifier,
        ctx: Ctx,
    ) => null | false | Identifier | [Identifier | null, Ctx];
    IdentifierPost?: (node: Identifier, ctx: Ctx) => null | Identifier;
    Shared?: (
        node: Shared,
        ctx: Ctx,
    ) => null | false | Shared | [Shared | null, Ctx];
    SharedPost?: (node: Shared, ctx: Ctx) => null | Shared;
    Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx];
    TypePost?: (node: Type, ctx: Ctx) => null | Type;
    Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx];
    LocPost?: (node: Loc, ctx: Ctx) => null | Loc;
    Pattern_number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Pattern | [Pattern | null, Ctx];
    PatternPost_number?: (node: Number, ctx: Ctx) => null | Pattern;
    Expr_record?: (
        node: Record,
        ctx: Ctx,
    ) => null | false | Expr | [Expr | null, Ctx];
    ExprPost_record?: (node: Record, ctx: Ctx) => null | Expr;
    Shared_number?: (
        node: Number,
        ctx: Ctx,
    ) => null | false | Shared | [Shared | null, Ctx];
    SharedPost_number?: (node: Number, ctx: Ctx) => null | Shared;
};
export const transformNumberKind = <Ctx>(
    node: NumberKind,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): NumberKind => {
    if (!node) {
        throw new Error('No NumberKind provided');
    }

    const transformed = visitor.NumberKind
        ? visitor.NumberKind(node, ctx)
        : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;
    const updatedNode = node;

    node = updatedNode;
    if (visitor.NumberKindPost) {
        const transformed = visitor.NumberKindPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformNumber = <Ctx>(
    node: Number,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Number => {
    if (!node) {
        throw new Error('No Number provided');
    }

    const transformed = visitor.Number ? visitor.Number(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    let updatedNode = node;
    {
        let changed1 = false;

        const updatedNode$kind = transformNumberKind(node.kind, visitor, ctx);
        changed1 = changed1 || updatedNode$kind !== node.kind;
        if (changed1) {
            updatedNode = { ...updatedNode, kind: updatedNode$kind };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.NumberPost) {
        const transformed = visitor.NumberPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformPattern = <Ctx>(
    node: Pattern,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Pattern => {
    if (!node) {
        throw new Error('No Pattern provided');
    }

    const transformed = visitor.Pattern ? visitor.Pattern(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    switch (node.type) {
        case 'number': {
            const transformed = visitor.Pattern_number
                ? visitor.Pattern_number(node, ctx)
                : null;
            if (transformed != null) {
                if (Array.isArray(transformed)) {
                    ctx = transformed[1];
                    if (transformed[0] != null) {
                        node = transformed[0];
                    }
                } else if (transformed == false) {
                    return node;
                } else {
                    node = transformed;
                }
            }
            break;
        }
    }

    let updatedNode = node;

    switch (node.type) {
        case 'local':
            break;

        case 'number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'record': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$entries = updatedNode$0specified.entries;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.entries.map(
                        (updatedNode$0node$entries$item2) => {
                            let result = updatedNode$0node$entries$item2;
                            {
                                let changed4 = false;

                                const result$value = transformPattern(
                                    updatedNode$0node$entries$item2.value,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$value !==
                                        updatedNode$0node$entries$item2.value;
                                if (changed4) {
                                    result = { ...result, value: result$value };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$entries = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        entries: updatedNode$0node$entries,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'unresolved':
            break;

        case 'tag': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformPattern(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }
    }

    switch (updatedNode.type) {
        case 'number': {
            const transformed = visitor.PatternPost_number
                ? visitor.PatternPost_number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.PatternPost) {
        const transformed = visitor.PatternPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformIdentifier = <Ctx>(
    node: Identifier,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Identifier => {
    if (!node) {
        throw new Error('No Identifier provided');
    }

    const transformed = visitor.Identifier
        ? visitor.Identifier(node, ctx)
        : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;
    const updatedNode = node;

    node = updatedNode;
    if (visitor.IdentifierPost) {
        const transformed = visitor.IdentifierPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformShared = <Ctx>(
    node: Shared,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Shared => {
    if (!node) {
        throw new Error('No Shared provided');
    }

    const transformed = visitor.Shared ? visitor.Shared(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    switch (node.type) {
        case 'number': {
            const transformed = visitor.Shared_number
                ? visitor.Shared_number(node, ctx)
                : null;
            if (transformed != null) {
                if (Array.isArray(transformed)) {
                    ctx = transformed[1];
                    if (transformed[0] != null) {
                        node = transformed[0];
                    }
                } else if (transformed == false) {
                    return node;
                } else {
                    node = transformed;
                }
            }
            break;
        }
    }

    let updatedNode = node;

    switch (node.type) {
        case 'number': {
            updatedNode = transformNumber(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        case 'unresolved':
            break;

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformIdentifier(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'number': {
            const transformed = visitor.SharedPost_number
                ? visitor.SharedPost_number(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.SharedPost) {
        const transformed = visitor.SharedPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformType = <Ctx>(
    node: Type,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Type => {
    if (!node) {
        throw new Error('No Type provided');
    }

    const transformed = visitor.Type ? visitor.Type(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    let updatedNode = node;

    switch (node.type) {
        case 'builtin':
            break;

        case 'apply': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$target = transformType(
                    updatedNode$0specified.target,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$target !== updatedNode$0specified.target;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformType(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        target: updatedNode$0node$target,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'tag': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformType(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'fn': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformType(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                const updatedNode$0node$body = transformType(
                    updatedNode$0specified.body,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$body !== updatedNode$0specified.body;
                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        args: updatedNode$0node$args,
                        body: updatedNode$0node$body,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'union': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$items = updatedNode$0specified.items;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.items.map(
                        (updatedNode$0node$items$item2) => {
                            const result = transformType(
                                updatedNode$0node$items$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$items$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$items = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        items: updatedNode$0node$items,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'record': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$entries = updatedNode$0specified.entries;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.entries.map(
                        (updatedNode$0node$entries$item2) => {
                            let result = updatedNode$0node$entries$item2;
                            {
                                let changed4 = false;

                                const result$value = transformType(
                                    updatedNode$0node$entries$item2.value,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$value !==
                                        updatedNode$0node$entries$item2.value;

                                let result$default = undefined;
                                const result$default$current =
                                    updatedNode$0node$entries$item2.default;
                                if (result$default$current != null) {
                                    const result$default$4$ = transformExpr(
                                        result$default$current,
                                        visitor,
                                        ctx,
                                    );
                                    changed4 =
                                        changed4 ||
                                        result$default$4$ !==
                                            result$default$current;
                                    result$default = result$default$4$;
                                }

                                if (changed4) {
                                    result = {
                                        ...result,
                                        value: result$value,
                                        default: result$default,
                                    };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$entries = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        entries: updatedNode$0node$entries,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformShared(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    node = updatedNode;
    if (visitor.TypePost) {
        const transformed = visitor.TypePost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformRecord = <Ctx>(
    node: Record,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Record => {
    if (!node) {
        throw new Error('No Record provided');
    }

    const transformed = visitor.Record ? visitor.Record(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    let updatedNode = node;
    {
        let changed1 = false;

        let updatedNode$entries = node.entries;
        {
            let changed2 = false;
            const arr1 = node.entries.map((updatedNode$entries$item1) => {
                let result = updatedNode$entries$item1;
                {
                    let changed3 = false;

                    const result$value = transformExpr(
                        updatedNode$entries$item1.value,
                        visitor,
                        ctx,
                    );
                    changed3 =
                        changed3 ||
                        result$value !== updatedNode$entries$item1.value;
                    if (changed3) {
                        result = { ...result, value: result$value };
                        changed2 = true;
                    }
                }

                return result;
            });
            if (changed2) {
                updatedNode$entries = arr1;
                changed1 = true;
            }
        }

        if (changed1) {
            updatedNode = { ...updatedNode, entries: updatedNode$entries };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.RecordPost) {
        const transformed = visitor.RecordPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformExpr = <Ctx>(
    node: Expr,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Expr => {
    if (!node) {
        throw new Error('No Expr provided');
    }

    const transformed = visitor.Expr ? visitor.Expr(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    switch (node.type) {
        case 'record': {
            const transformed = visitor.Expr_record
                ? visitor.Expr_record(node, ctx)
                : null;
            if (transformed != null) {
                if (Array.isArray(transformed)) {
                    ctx = transformed[1];
                    if (transformed[0] != null) {
                        node = transformed[0];
                    }
                } else if (transformed == false) {
                    return node;
                } else {
                    node = transformed;
                }
            }
            break;
        }
    }

    let updatedNode = node;

    switch (node.type) {
        case 'builtin':
            break;

        case 'def': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$value = transformExpr(
                    updatedNode$0specified.value,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$value !== updatedNode$0specified.value;
                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        value: updatedNode$0node$value,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'string': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$templates =
                    updatedNode$0specified.templates;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.templates.map(
                        (updatedNode$0node$templates$item2) => {
                            let result = updatedNode$0node$templates$item2;
                            {
                                let changed4 = false;

                                const result$expr = transformExpr(
                                    updatedNode$0node$templates$item2.expr,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$expr !==
                                        updatedNode$0node$templates$item2.expr;
                                if (changed4) {
                                    result = { ...result, expr: result$expr };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$templates = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        templates: updatedNode$0node$templates,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'if': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$cond = transformExpr(
                    updatedNode$0specified.cond,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$cond !== updatedNode$0specified.cond;

                const updatedNode$0node$yes = transformExpr(
                    updatedNode$0specified.yes,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$yes !== updatedNode$0specified.yes;

                const updatedNode$0node$no = transformExpr(
                    updatedNode$0specified.no,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$no !== updatedNode$0specified.no;
                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        cond: updatedNode$0node$cond,
                        yes: updatedNode$0node$yes,
                        no: updatedNode$0node$no,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'switch': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$target = transformExpr(
                    updatedNode$0specified.target,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$target !== updatedNode$0specified.target;

                let updatedNode$0node$cases = updatedNode$0specified.cases;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.cases.map(
                        (updatedNode$0node$cases$item2) => {
                            let result = updatedNode$0node$cases$item2;
                            {
                                let changed4 = false;

                                const result$pattern = transformPattern(
                                    updatedNode$0node$cases$item2.pattern,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$pattern !==
                                        updatedNode$0node$cases$item2.pattern;

                                const result$body = transformExpr(
                                    updatedNode$0node$cases$item2.body,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$body !==
                                        updatedNode$0node$cases$item2.body;
                                if (changed4) {
                                    result = {
                                        ...result,
                                        pattern: result$pattern,
                                        body: result$body,
                                    };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$cases = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        target: updatedNode$0node$target,
                        cases: updatedNode$0node$cases,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'rest': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$contents = transformExpr(
                    updatedNode$0specified.contents,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$contents !==
                        updatedNode$0specified.contents;
                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        contents: updatedNode$0node$contents,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'fn': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            let result = updatedNode$0node$args$item2;
                            {
                                let changed4 = false;

                                const result$pattern = transformPattern(
                                    updatedNode$0node$args$item2.pattern,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$pattern !==
                                        updatedNode$0node$args$item2.pattern;

                                let result$type = undefined;
                                const result$type$current =
                                    updatedNode$0node$args$item2.type;
                                if (result$type$current != null) {
                                    const result$type$4$ = transformType(
                                        result$type$current,
                                        visitor,
                                        ctx,
                                    );
                                    changed4 =
                                        changed4 ||
                                        result$type$4$ !== result$type$current;
                                    result$type = result$type$4$;
                                }

                                if (changed4) {
                                    result = {
                                        ...result,
                                        pattern: result$pattern,
                                        type: result$type,
                                    };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map(
                        (updatedNode$0node$body$item2) => {
                            const result = transformExpr(
                                updatedNode$0node$body$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$body$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        args: updatedNode$0node$args,
                        body: updatedNode$0node$body,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'recur':
            break;

        case 'apply': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$target = transformExpr(
                    updatedNode$0specified.target,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$target !== updatedNode$0specified.target;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformExpr(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        target: updatedNode$0node$target,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'type-apply': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$target = transformExpr(
                    updatedNode$0specified.target,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$target !== updatedNode$0specified.target;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            const result = transformType(
                                updatedNode$0node$args$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$args$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        target: updatedNode$0node$target,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'type-fn': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                const updatedNode$0node$target = transformExpr(
                    updatedNode$0specified.target,
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 ||
                    updatedNode$0node$target !== updatedNode$0specified.target;

                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map(
                        (updatedNode$0node$args$item2) => {
                            let result = updatedNode$0node$args$item2;
                            {
                                let changed4 = false;

                                let result$bound = undefined;
                                const result$bound$current =
                                    updatedNode$0node$args$item2.bound;
                                if (result$bound$current != null) {
                                    const result$bound$4$ = transformType(
                                        result$bound$current,
                                        visitor,
                                        ctx,
                                    );
                                    changed4 =
                                        changed4 ||
                                        result$bound$4$ !==
                                            result$bound$current;
                                    result$bound = result$bound$4$;
                                }

                                if (changed4) {
                                    result = { ...result, bound: result$bound };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        target: updatedNode$0node$target,
                        args: updatedNode$0node$args,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'let-type': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$bindings =
                    updatedNode$0specified.bindings;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.bindings.map(
                        (updatedNode$0node$bindings$item2) => {
                            let result = updatedNode$0node$bindings$item2;
                            {
                                let changed4 = false;

                                const result$type = transformType(
                                    updatedNode$0node$bindings$item2.type,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$type !==
                                        updatedNode$0node$bindings$item2.type;
                                if (changed4) {
                                    result = { ...result, type: result$type };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$bindings = arr2;
                        changed2 = true;
                    }
                }

                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map(
                        (updatedNode$0node$body$item2) => {
                            const result = transformExpr(
                                updatedNode$0node$body$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$body$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        bindings: updatedNode$0node$bindings,
                        body: updatedNode$0node$body,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'let': {
            const updatedNode$0specified = node;
            let changed1 = false;

            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;

                let updatedNode$0node$bindings =
                    updatedNode$0specified.bindings;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.bindings.map(
                        (updatedNode$0node$bindings$item2) => {
                            let result = updatedNode$0node$bindings$item2;
                            {
                                let changed4 = false;

                                const result$pattern = transformPattern(
                                    updatedNode$0node$bindings$item2.pattern,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$pattern !==
                                        updatedNode$0node$bindings$item2.pattern;

                                const result$value = transformExpr(
                                    updatedNode$0node$bindings$item2.value,
                                    visitor,
                                    ctx,
                                );
                                changed4 =
                                    changed4 ||
                                    result$value !==
                                        updatedNode$0node$bindings$item2.value;

                                let result$type = undefined;
                                const result$type$current =
                                    updatedNode$0node$bindings$item2.type;
                                if (result$type$current != null) {
                                    const result$type$4$ = transformType(
                                        result$type$current,
                                        visitor,
                                        ctx,
                                    );
                                    changed4 =
                                        changed4 ||
                                        result$type$4$ !== result$type$current;
                                    result$type = result$type$4$;
                                }

                                if (changed4) {
                                    result = {
                                        ...result,
                                        pattern: result$pattern,
                                        value: result$value,
                                        type: result$type,
                                    };
                                    changed3 = true;
                                }
                            }

                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$bindings = arr2;
                        changed2 = true;
                    }
                }

                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map(
                        (updatedNode$0node$body$item2) => {
                            const result = transformExpr(
                                updatedNode$0node$body$item2,
                                visitor,
                                ctx,
                            );
                            changed3 =
                                changed3 ||
                                result !== updatedNode$0node$body$item2;
                            return result;
                        },
                    );
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }

                if (changed2) {
                    updatedNode$0node = {
                        ...updatedNode$0node,
                        bindings: updatedNode$0node$bindings,
                        body: updatedNode$0node$body,
                    };
                    changed1 = true;
                }
            }

            updatedNode = updatedNode$0node;
            break;
        }

        case 'tag':
            break;

        case 'record': {
            updatedNode = transformRecord(node, visitor, ctx);
            changed0 = changed0 || updatedNode !== node;
            break;
        }

        default: {
            // let changed1 = false;

            const updatedNode$0node = transformShared(node, visitor, ctx);
            changed0 = changed0 || updatedNode$0node !== node;
            updatedNode = updatedNode$0node;
        }
    }

    switch (updatedNode.type) {
        case 'record': {
            const transformed = visitor.ExprPost_record
                ? visitor.ExprPost_record(updatedNode, ctx)
                : null;
            if (transformed != null) {
                updatedNode = transformed;
            }
            break;
        }
    }

    node = updatedNode;
    if (visitor.ExprPost) {
        const transformed = visitor.ExprPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTerm = <Ctx>(
    node: Term,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Term => {
    if (!node) {
        throw new Error('No Term provided');
    }

    const transformed = visitor.Term ? visitor.Term(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    let updatedNode = node;
    {
        let changed1 = false;

        const updatedNode$contents = transformExpr(node.contents, visitor, ctx);
        changed1 = changed1 || updatedNode$contents !== node.contents;

        let updatedNode$types = node.types;
        {
            let changed2 = false;

            const spread: { [key: string]: Type } = {};
            Object.keys(node.types).forEach((key) => {
                const updatedNode$types$value = transformType(
                    node.types[+key],
                    visitor,
                    ctx,
                );
                changed2 =
                    changed2 || updatedNode$types$value !== node.types[+key];
                spread[key] = updatedNode$types$value;
            });

            if (changed2) {
                updatedNode$types = { ...updatedNode$types, ...spread };
                changed1 = true;
            }
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                contents: updatedNode$contents,
                types: updatedNode$types,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TermPost) {
        const transformed = visitor.TermPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformTVar = <Ctx>(
    node: TVar,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): TVar => {
    if (!node) {
        throw new Error('No TVar provided');
    }

    const transformed = visitor.TVar ? visitor.TVar(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;

    let updatedNode = node;
    {
        let changed1 = false;

        let updatedNode$bound = undefined;
        const updatedNode$bound$current = node.bound;
        if (updatedNode$bound$current != null) {
            const updatedNode$bound$1$ = transformType(
                updatedNode$bound$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
            updatedNode$bound = updatedNode$bound$1$;
        }

        let updatedNode$default_ = undefined;
        const updatedNode$default_$current = node.default_;
        if (updatedNode$default_$current != null) {
            const updatedNode$default_$1$ = transformType(
                updatedNode$default_$current,
                visitor,
                ctx,
            );
            changed1 =
                changed1 ||
                updatedNode$default_$1$ !== updatedNode$default_$current;
            updatedNode$default_ = updatedNode$default_$1$;
        }

        if (changed1) {
            updatedNode = {
                ...updatedNode,
                bound: updatedNode$bound,
                default_: updatedNode$default_,
            };
            changed0 = true;
        }
    }

    node = updatedNode;
    if (visitor.TVarPost) {
        const transformed = visitor.TVarPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};

export const transformLoc = <Ctx>(
    node: Loc,
    visitor: Visitor<Ctx>,
    ctx: Ctx,
): Loc => {
    if (!node) {
        throw new Error('No Loc provided');
    }

    const transformed = visitor.Loc ? visitor.Loc(node, ctx) : null;
    if (transformed === false) {
        return node;
    }
    if (transformed != null) {
        if (Array.isArray(transformed)) {
            ctx = transformed[1];
            if (transformed[0] != null) {
                node = transformed[0];
            }
        } else {
            node = transformed;
        }
    }

    let changed0 = false;
    const updatedNode = node;

    node = updatedNode;
    if (visitor.LocPost) {
        const transformed = visitor.LocPost(node, ctx);
        if (transformed != null) {
            node = transformed;
        }
    }
    return node;
};