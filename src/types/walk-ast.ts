import {Term, Expr, Type, FnType, TfnType, TypeArg, TRecord, Shared, Number, NumberKind, Bool, Identifier, Local, Def, DefType, String, Pattern, LocalPattern, recordAccess, AttachedFile, Record, TVar, Loc, NodeArray, Node, Attachment, RichText, spread, accessText, tapply, stringText, CString, NodeExtra} from './ast';

export type Visitor<Ctx> = {
    Term?: (node: Term, ctx: Ctx) => null | false | Term | [Term | null, Ctx],
    TermPost?: (node: Term, ctx: Ctx) => null | Term,
    NumberKind?: (node: NumberKind, ctx: Ctx) => null | false | NumberKind | [NumberKind | null, Ctx],
    NumberKindPost?: (node: NumberKind, ctx: Ctx) => null | NumberKind,
    Bool?: (node: Bool, ctx: Ctx) => null | false | Bool | [Bool | null, Ctx],
    BoolPost?: (node: Bool, ctx: Ctx) => null | Bool,
    Number?: (node: Number, ctx: Ctx) => null | false | Number | [Number | null, Ctx],
    NumberPost?: (node: Number, ctx: Ctx) => null | Number,
    LocalPattern?: (node: LocalPattern, ctx: Ctx) => null | false | LocalPattern | [LocalPattern | null, Ctx],
    LocalPatternPost?: (node: LocalPattern, ctx: Ctx) => null | LocalPattern,
    Pattern?: (node: Pattern, ctx: Ctx) => null | false | Pattern | [Pattern | null, Ctx],
    PatternPost?: (node: Pattern, ctx: Ctx) => null | Pattern,
    String?: (node: String, ctx: Ctx) => null | false | String | [String | null, Ctx],
    StringPost?: (node: String, ctx: Ctx) => null | String,
    recordAccess?: (node: recordAccess, ctx: Ctx) => null | false | recordAccess | [recordAccess | null, Ctx],
    recordAccessPost?: (node: recordAccess, ctx: Ctx) => null | recordAccess,
    DefType?: (node: DefType, ctx: Ctx) => null | false | DefType | [DefType | null, Ctx],
    DefTypePost?: (node: DefType, ctx: Ctx) => null | DefType,
    Def?: (node: Def, ctx: Ctx) => null | false | Def | [Def | null, Ctx],
    DefPost?: (node: Def, ctx: Ctx) => null | Def,
    Expr?: (node: Expr, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost?: (node: Expr, ctx: Ctx) => null | Expr,
    Record?: (node: Record, ctx: Ctx) => null | false | Record | [Record | null, Ctx],
    RecordPost?: (node: Record, ctx: Ctx) => null | Record,
    TVar?: (node: TVar, ctx: Ctx) => null | false | TVar | [TVar | null, Ctx],
    TVarPost?: (node: TVar, ctx: Ctx) => null | TVar,
    Local?: (node: Local, ctx: Ctx) => null | false | Local | [Local | null, Ctx],
    LocalPost?: (node: Local, ctx: Ctx) => null | Local,
    Identifier?: (node: Identifier, ctx: Ctx) => null | false | Identifier | [Identifier | null, Ctx],
    IdentifierPost?: (node: Identifier, ctx: Ctx) => null | Identifier,
    Shared?: (node: Shared, ctx: Ctx) => null | false | Shared | [Shared | null, Ctx],
    SharedPost?: (node: Shared, ctx: Ctx) => null | Shared,
    TypeArg?: (node: TypeArg, ctx: Ctx) => null | false | TypeArg | [TypeArg | null, Ctx],
    TypeArgPost?: (node: TypeArg, ctx: Ctx) => null | TypeArg,
    FnType?: (node: FnType, ctx: Ctx) => null | false | FnType | [FnType | null, Ctx],
    FnTypePost?: (node: FnType, ctx: Ctx) => null | FnType,
    TfnType?: (node: TfnType, ctx: Ctx) => null | false | TfnType | [TfnType | null, Ctx],
    TfnTypePost?: (node: TfnType, ctx: Ctx) => null | TfnType,
    Type?: (node: Type, ctx: Ctx) => null | false | Type | [Type | null, Ctx],
    TypePost?: (node: Type, ctx: Ctx) => null | Type,
    TRecord?: (node: TRecord, ctx: Ctx) => null | false | TRecord | [TRecord | null, Ctx],
    TRecordPost?: (node: TRecord, ctx: Ctx) => null | TRecord,
    Loc?: (node: Loc, ctx: Ctx) => null | false | Loc | [Loc | null, Ctx],
    LocPost?: (node: Loc, ctx: Ctx) => null | Loc,
    NodeArray?: (node: NodeArray, ctx: Ctx) => null | false | NodeArray | [NodeArray | null, Ctx],
    NodeArrayPost?: (node: NodeArray, ctx: Ctx) => null | NodeArray,
    AttachedFile?: (node: AttachedFile, ctx: Ctx) => null | false | AttachedFile | [AttachedFile | null, Ctx],
    AttachedFilePost?: (node: AttachedFile, ctx: Ctx) => null | AttachedFile,
    Attachment?: (node: Attachment, ctx: Ctx) => null | false | Attachment | [Attachment | null, Ctx],
    AttachmentPost?: (node: Attachment, ctx: Ctx) => null | Attachment,
    RichText?: (node: RichText, ctx: Ctx) => null | false | RichText | [RichText | null, Ctx],
    RichTextPost?: (node: RichText, ctx: Ctx) => null | RichText,
    spread?: (node: spread, ctx: Ctx) => null | false | spread | [spread | null, Ctx],
    spreadPost?: (node: spread, ctx: Ctx) => null | spread,
    accessText?: (node: accessText, ctx: Ctx) => null | false | accessText | [accessText | null, Ctx],
    accessTextPost?: (node: accessText, ctx: Ctx) => null | accessText,
    tapply?: (node: tapply, ctx: Ctx) => null | false | tapply | [tapply | null, Ctx],
    tapplyPost?: (node: tapply, ctx: Ctx) => null | tapply,
    stringText?: (node: stringText, ctx: Ctx) => null | false | stringText | [stringText | null, Ctx],
    stringTextPost?: (node: stringText, ctx: Ctx) => null | stringText,
    CString?: (node: CString, ctx: Ctx) => null | false | CString | [CString | null, Ctx],
    CStringPost?: (node: CString, ctx: Ctx) => null | CString,
    NodeExtra?: (node: NodeExtra, ctx: Ctx) => null | false | NodeExtra | [NodeExtra | null, Ctx],
    NodeExtraPost?: (node: NodeExtra, ctx: Ctx) => null | NodeExtra,
    Pattern_local?: (node: LocalPattern, ctx: Ctx) => null | false | Pattern | [Pattern | null, Ctx],
    PatternPost_local?: (node: LocalPattern, ctx: Ctx) => null | Pattern,
    Pattern_number?: (node: Number, ctx: Ctx) => null | false | Pattern | [Pattern | null, Ctx],
    PatternPost_number?: (node: Number, ctx: Ctx) => null | Pattern,
    Pattern_bool?: (node: Bool, ctx: Ctx) => null | false | Pattern | [Pattern | null, Ctx],
    PatternPost_bool?: (node: Bool, ctx: Ctx) => null | Pattern,
    Expr_def?: (node: Def, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_def?: (node: Def, ctx: Ctx) => null | Expr,
    Expr_deftype?: (node: DefType, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_deftype?: (node: DefType, ctx: Ctx) => null | Expr,
    Expr_string?: (node: String, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_string?: (node: String, ctx: Ctx) => null | Expr,
    Expr_recordAccess?: (node: recordAccess, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_recordAccess?: (node: recordAccess, ctx: Ctx) => null | Expr,
    Expr_spread?: (node: spread, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_spread?: (node: spread, ctx: Ctx) => null | Expr,
    Expr_record?: (node: Record, ctx: Ctx) => null | false | Expr | [Expr | null, Ctx],
    ExprPost_record?: (node: Record, ctx: Ctx) => null | Expr,
    Identifier_local?: (node: Local, ctx: Ctx) => null | false | Identifier | [Identifier | null, Ctx],
    IdentifierPost_local?: (node: Local, ctx: Ctx) => null | Identifier,
    Shared_number?: (node: Number, ctx: Ctx) => null | false | Shared | [Shared | null, Ctx],
    SharedPost_number?: (node: Number, ctx: Ctx) => null | Shared,
    Shared_bool?: (node: Bool, ctx: Ctx) => null | false | Shared | [Shared | null, Ctx],
    SharedPost_bool?: (node: Bool, ctx: Ctx) => null | Shared,
    Type_fn?: (node: FnType, ctx: Ctx) => null | false | Type | [Type | null, Ctx],
    TypePost_fn?: (node: FnType, ctx: Ctx) => null | Type,
    Type_tfn?: (node: TfnType, ctx: Ctx) => null | false | Type | [Type | null, Ctx],
    TypePost_tfn?: (node: TfnType, ctx: Ctx) => null | Type,
    Type_record?: (node: TRecord, ctx: Ctx) => null | false | Type | [Type | null, Ctx],
    TypePost_record?: (node: TRecord, ctx: Ctx) => null | Type
}
export const transformFnType = <Ctx>(node: FnType, visitor: Visitor<Ctx>, ctx: Ctx): FnType => {
        if (!node) {
            throw new Error('No FnType provided');
        }
        
        const transformed = visitor.FnType ? visitor.FnType(node, ctx) : null;
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
                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
            let result = updatedNode$args$item1;
            {
                let changed3 = false;
                
                const result$type = transformType(updatedNode$args$item1.type, visitor, ctx);
                changed3 = changed3 || result$type !== updatedNode$args$item1.type;
                if (changed3) {
                    result =  {...result, type: result$type};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$body = transformType(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                if (changed1) {
                    updatedNode =  {...updatedNode, args: updatedNode$args, body: updatedNode$body};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.FnTypePost) {
            const transformed = visitor.FnTypePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTypeArg = <Ctx>(node: TypeArg, visitor: Visitor<Ctx>, ctx: Ctx): TypeArg => {
        if (!node) {
            throw new Error('No TypeArg provided');
        }
        
        const transformed = visitor.TypeArg ? visitor.TypeArg(node, ctx) : null;
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
            
                const updatedNode$bound$1$ = transformType(updatedNode$bound$current, visitor, ctx);
                changed1 = changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
            updatedNode$bound = updatedNode$bound$1$;
        }
        
                if (changed1) {
                    updatedNode =  {...updatedNode, bound: updatedNode$bound};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TypeArgPost) {
            const transformed = visitor.TypeArgPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTfnType = <Ctx>(node: TfnType, visitor: Visitor<Ctx>, ctx: Ctx): TfnType => {
        if (!node) {
            throw new Error('No TfnType provided');
        }
        
        const transformed = visitor.TfnType ? visitor.TfnType(node, ctx) : null;
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
                
                let updatedNode$args = node.args;
                {
                    let changed2 = false;
                    const arr1 = node.args.map((updatedNode$args$item1) => {
                        
                const result = transformTypeArg(updatedNode$args$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$args$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$args = arr1;
                        changed1 = true;
                    }
                }
                

                
                const updatedNode$body = transformType(node.body, visitor, ctx);
                changed1 = changed1 || updatedNode$body !== node.body;
                if (changed1) {
                    updatedNode =  {...updatedNode, args: updatedNode$args, body: updatedNode$body};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TfnTypePost) {
            const transformed = visitor.TfnTypePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformTRecord = <Ctx>(node: TRecord, visitor: Visitor<Ctx>, ctx: Ctx): TRecord => {
        if (!node) {
            throw new Error('No TRecord provided');
        }
        
        const transformed = visitor.TRecord ? visitor.TRecord(node, ctx) : null;
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
                
                const result$value = transformType(updatedNode$entries$item1.value, visitor, ctx);
                changed3 = changed3 || result$value !== updatedNode$entries$item1.value;

                
        let result$default = undefined;
        const result$default$current = updatedNode$entries$item1.default;
        if (result$default$current != null) {
            
                const result$default$3$ = transformExpr(result$default$current, visitor, ctx);
                changed3 = changed3 || result$default$3$ !== result$default$current;
            result$default = result$default$3$;
        }
        
                if (changed3) {
                    result =  {...result, value: result$value, default: result$default};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$entries = arr1;
                        changed1 = true;
                    }
                }
                

                
                let updatedNode$spreads = node.spreads;
                {
                    let changed2 = false;
                    const arr1 = node.spreads.map((updatedNode$spreads$item1) => {
                        
                const result = transformType(updatedNode$spreads$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$spreads$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$spreads = arr1;
                        changed1 = true;
                    }
                }
                
                if (changed1) {
                    updatedNode =  {...updatedNode, entries: updatedNode$entries, spreads: updatedNode$spreads};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.TRecordPost) {
            const transformed = visitor.TRecordPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformNumberKind = <Ctx>(node: NumberKind, visitor: Visitor<Ctx>, ctx: Ctx): NumberKind => {
        if (!node) {
            throw new Error('No NumberKind provided');
        }
        
        const transformed = visitor.NumberKind ? visitor.NumberKind(node, ctx) : null;
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
        
    }

export const transformNumber = <Ctx>(node: Number, visitor: Visitor<Ctx>, ctx: Ctx): Number => {
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
                    updatedNode =  {...updatedNode, kind: updatedNode$kind};
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
        
    }

export const transformBool = <Ctx>(node: Bool, visitor: Visitor<Ctx>, ctx: Ctx): Bool => {
        if (!node) {
            throw new Error('No Bool provided');
        }
        
        const transformed = visitor.Bool ? visitor.Bool(node, ctx) : null;
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
        if (visitor.BoolPost) {
            const transformed = visitor.BoolPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformLocal = <Ctx>(node: Local, visitor: Visitor<Ctx>, ctx: Ctx): Local => {
        if (!node) {
            throw new Error('No Local provided');
        }
        
        const transformed = visitor.Local ? visitor.Local(node, ctx) : null;
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
        if (visitor.LocalPost) {
            const transformed = visitor.LocalPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformIdentifier = <Ctx>(node: Identifier, visitor: Visitor<Ctx>, ctx: Ctx): Identifier => {
        if (!node) {
            throw new Error('No Identifier provided');
        }
        
        const transformed = visitor.Identifier ? visitor.Identifier(node, ctx) : null;
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
        
    }

export const transformShared = <Ctx>(node: Shared, visitor: Visitor<Ctx>, ctx: Ctx): Shared => {
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
                            const transformed = visitor.Shared_number ? visitor.Shared_number(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'bool': {
                            const transformed = visitor.Shared_bool ? visitor.Shared_bool(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }
        }

        let updatedNode = node;

        switch (node.type) {
            case 'number': {
                        updatedNode = transformNumber(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'bool': {
                        updatedNode = transformBool(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'unresolved': break;

            default: {
                        // let changed1 = false;
                        
                const updatedNode$0node = transformIdentifier(node, visitor, ctx);
                changed0 = changed0 || updatedNode$0node !== node;
                        updatedNode = updatedNode$0node;
                    }
        }

switch (updatedNode.type) {
            case 'number': {
                            const transformed = visitor.SharedPost_number ? visitor.SharedPost_number(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'bool': {
                            const transformed = visitor.SharedPost_bool ? visitor.SharedPost_bool(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
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
        
    }

export const transformType = <Ctx>(node: Type, visitor: Visitor<Ctx>, ctx: Ctx): Type => {
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
        
        switch (node.type) {
            case 'fn': {
                            const transformed = visitor.Type_fn ? visitor.Type_fn(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'tfn': {
                            const transformed = visitor.Type_tfn ? visitor.Type_tfn(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'record': {
                            const transformed = visitor.Type_record ? visitor.Type_record(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }
        }

        let updatedNode = node;

        switch (node.type) {
            case 'string': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$templates = updatedNode$0specified.templates;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.templates.map((updatedNode$0node$templates$item2) => {
                        
            let result = updatedNode$0node$templates$item2;
            {
                let changed4 = false;
                
                const result$type = transformType(updatedNode$0node$templates$item2.type, visitor, ctx);
                changed4 = changed4 || result$type !== updatedNode$0node$templates$item2.type;
                if (changed4) {
                    result =  {...result, type: result$type};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$templates = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, templates: updatedNode$0node$templates};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'any': break;

            case 'none': break;

            case 'recur': break;

            case 'loop': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$inner = transformType(updatedNode$0specified.inner, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$inner !== updatedNode$0specified.inner;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, inner: updatedNode$0node$inner};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'task': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$effects = transformType(updatedNode$0specified.effects, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$effects !== updatedNode$0specified.effects;

                
                const updatedNode$0node$result = transformType(updatedNode$0specified.result, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$result !== updatedNode$0specified.result;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, effects: updatedNode$0node$effects, result: updatedNode$0node$result};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'builtin': break;

            case 'apply': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$target = transformType(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformType(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args};
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
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformType(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, args: updatedNode$0node$args};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'fn': {
                        updatedNode = transformFnType(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'tfn': {
                        updatedNode = transformTfnType(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
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
                    const arr2 = updatedNode$0specified.items.map((updatedNode$0node$items$item2) => {
                        
                const result = transformType(updatedNode$0node$items$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$items$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$items = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, items: updatedNode$0node$items};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'record': {
                        updatedNode = transformTRecord(node, visitor, ctx);
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
            case 'fn': {
                            const transformed = visitor.TypePost_fn ? visitor.TypePost_fn(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'tfn': {
                            const transformed = visitor.TypePost_tfn ? visitor.TypePost_tfn(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'record': {
                            const transformed = visitor.TypePost_record ? visitor.TypePost_record(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
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
        
    }

export const transformDef = <Ctx>(node: Def, visitor: Visitor<Ctx>, ctx: Ctx): Def => {
        if (!node) {
            throw new Error('No Def provided');
        }
        
        const transformed = visitor.Def ? visitor.Def(node, ctx) : null;
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
                
                const updatedNode$value = transformExpr(node.value, visitor, ctx);
                changed1 = changed1 || updatedNode$value !== node.value;
                if (changed1) {
                    updatedNode =  {...updatedNode, value: updatedNode$value};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.DefPost) {
            const transformed = visitor.DefPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformDefType = <Ctx>(node: DefType, visitor: Visitor<Ctx>, ctx: Ctx): DefType => {
        if (!node) {
            throw new Error('No DefType provided');
        }
        
        const transformed = visitor.DefType ? visitor.DefType(node, ctx) : null;
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
                
                const updatedNode$value = transformType(node.value, visitor, ctx);
                changed1 = changed1 || updatedNode$value !== node.value;
                if (changed1) {
                    updatedNode =  {...updatedNode, value: updatedNode$value};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.DefTypePost) {
            const transformed = visitor.DefTypePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformString = <Ctx>(node: String, visitor: Visitor<Ctx>, ctx: Ctx): String => {
        if (!node) {
            throw new Error('No String provided');
        }
        
        const transformed = visitor.String ? visitor.String(node, ctx) : null;
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
                
                let updatedNode$templates = node.templates;
                {
                    let changed2 = false;
                    const arr1 = node.templates.map((updatedNode$templates$item1) => {
                        
            let result = updatedNode$templates$item1;
            {
                let changed3 = false;
                
                const result$expr = transformExpr(updatedNode$templates$item1.expr, visitor, ctx);
                changed3 = changed3 || result$expr !== updatedNode$templates$item1.expr;
                if (changed3) {
                    result =  {...result, expr: result$expr};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$templates = arr1;
                        changed1 = true;
                    }
                }
                
                if (changed1) {
                    updatedNode =  {...updatedNode, templates: updatedNode$templates};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.StringPost) {
            const transformed = visitor.StringPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformLocalPattern = <Ctx>(node: LocalPattern, visitor: Visitor<Ctx>, ctx: Ctx): LocalPattern => {
        if (!node) {
            throw new Error('No LocalPattern provided');
        }
        
        const transformed = visitor.LocalPattern ? visitor.LocalPattern(node, ctx) : null;
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
        if (visitor.LocalPatternPost) {
            const transformed = visitor.LocalPatternPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformPattern = <Ctx>(node: Pattern, visitor: Visitor<Ctx>, ctx: Ctx): Pattern => {
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
            case 'local': {
                            const transformed = visitor.Pattern_local ? visitor.Pattern_local(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'number': {
                            const transformed = visitor.Pattern_number ? visitor.Pattern_number(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'bool': {
                            const transformed = visitor.Pattern_bool ? visitor.Pattern_bool(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }
        }

        let updatedNode = node;

        switch (node.type) {
            case 'local': {
                        updatedNode = transformLocalPattern(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'number': {
                        updatedNode = transformNumber(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'bool': {
                        updatedNode = transformBool(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'array': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$left = updatedNode$0specified.left;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.left.map((updatedNode$0node$left$item2) => {
                        
                const result = transformPattern(updatedNode$0node$left$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$left$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$left = arr2;
                        changed2 = true;
                    }
                }
                

                
        let updatedNode$0node$right = null;
        const updatedNode$0node$right$current = updatedNode$0specified.right;
        if (updatedNode$0node$right$current != null) {
            
            let updatedNode$0node$right$2$ = updatedNode$0node$right$current;
            {
                let changed3 = false;
                
        let updatedNode$0node$right$2$$spread = undefined;
        const updatedNode$0node$right$2$$spread$current = updatedNode$0node$right$current.spread;
        if (updatedNode$0node$right$2$$spread$current != null) {
            
                const updatedNode$0node$right$2$$spread$3$ = transformLocalPattern(updatedNode$0node$right$2$$spread$current, visitor, ctx);
                changed3 = changed3 || updatedNode$0node$right$2$$spread$3$ !== updatedNode$0node$right$2$$spread$current;
            updatedNode$0node$right$2$$spread = updatedNode$0node$right$2$$spread$3$;
        }
        

                
                let updatedNode$0node$right$2$$items = updatedNode$0node$right$current.items;
                {
                    let changed4 = false;
                    const arr3 = updatedNode$0node$right$current.items.map((updatedNode$0node$right$2$$items$item3) => {
                        
                const result = transformPattern(updatedNode$0node$right$2$$items$item3, visitor, ctx);
                changed4 = changed4 || result !== updatedNode$0node$right$2$$items$item3;
                        return result
                    })
                    if (changed4) {
                        updatedNode$0node$right$2$$items = arr3;
                        changed3 = true;
                    }
                }
                
                if (changed3) {
                    updatedNode$0node$right$2$ =  {...updatedNode$0node$right$2$, spread: updatedNode$0node$right$2$$spread, items: updatedNode$0node$right$2$$items};
                    changed2 = true;
                }
            }
            
            updatedNode$0node$right = updatedNode$0node$right$2$;
        }
        
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, left: updatedNode$0node$left, right: updatedNode$0node$right};
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
                    const arr2 = updatedNode$0specified.entries.map((updatedNode$0node$entries$item2) => {
                        
            let result = updatedNode$0node$entries$item2;
            {
                let changed4 = false;
                
                const result$value = transformPattern(updatedNode$0node$entries$item2.value, visitor, ctx);
                changed4 = changed4 || result$value !== updatedNode$0node$entries$item2.value;
                if (changed4) {
                    result =  {...result, value: result$value};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$entries = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, entries: updatedNode$0node$entries};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'unresolved': break;

            case 'tag': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformPattern(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, args: updatedNode$0node$args};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }
        }

switch (updatedNode.type) {
            case 'local': {
                            const transformed = visitor.PatternPost_local ? visitor.PatternPost_local(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'number': {
                            const transformed = visitor.PatternPost_number ? visitor.PatternPost_number(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'bool': {
                            const transformed = visitor.PatternPost_bool ? visitor.PatternPost_bool(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
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
        
    }

export const transformrecordAccess = <Ctx>(node: recordAccess, visitor: Visitor<Ctx>, ctx: Ctx): recordAccess => {
        if (!node) {
            throw new Error('No recordAccess provided');
        }
        
        const transformed = visitor.recordAccess ? visitor.recordAccess(node, ctx) : null;
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
                
        let updatedNode$target = null;
        const updatedNode$target$current = node.target;
        if (updatedNode$target$current != null) {
            
                const updatedNode$target$1$ = transformExpr(updatedNode$target$current, visitor, ctx);
                changed1 = changed1 || updatedNode$target$1$ !== updatedNode$target$current;
            updatedNode$target = updatedNode$target$1$;
        }
        
                if (changed1) {
                    updatedNode =  {...updatedNode, target: updatedNode$target};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.recordAccessPost) {
            const transformed = visitor.recordAccessPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformAttachedFile = <Ctx>(node: AttachedFile, visitor: Visitor<Ctx>, ctx: Ctx): AttachedFile => {
        if (!node) {
            throw new Error('No AttachedFile provided');
        }
        
        const transformed = visitor.AttachedFile ? visitor.AttachedFile(node, ctx) : null;
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
        if (visitor.AttachedFilePost) {
            const transformed = visitor.AttachedFilePost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformRecord = <Ctx>(node: Record, visitor: Visitor<Ctx>, ctx: Ctx): Record => {
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
                
                const result$value = transformExpr(updatedNode$entries$item1.value, visitor, ctx);
                changed3 = changed3 || result$value !== updatedNode$entries$item1.value;
                if (changed3) {
                    result =  {...result, value: result$value};
                    changed2 = true;
                }
            }
            
                        return result
                    })
                    if (changed2) {
                        updatedNode$entries = arr1;
                        changed1 = true;
                    }
                }
                

                
                let updatedNode$spreads = node.spreads;
                {
                    let changed2 = false;
                    const arr1 = node.spreads.map((updatedNode$spreads$item1) => {
                        
                const result = transformExpr(updatedNode$spreads$item1, visitor, ctx);
                changed2 = changed2 || result !== updatedNode$spreads$item1;
                        return result
                    })
                    if (changed2) {
                        updatedNode$spreads = arr1;
                        changed1 = true;
                    }
                }
                
                if (changed1) {
                    updatedNode =  {...updatedNode, entries: updatedNode$entries, spreads: updatedNode$spreads};
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
        
    }

export const transformExpr = <Ctx>(node: Expr, visitor: Visitor<Ctx>, ctx: Ctx): Expr => {
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
            case 'def': {
                            const transformed = visitor.Expr_def ? visitor.Expr_def(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'deftype': {
                            const transformed = visitor.Expr_deftype ? visitor.Expr_deftype(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'string': {
                            const transformed = visitor.Expr_string ? visitor.Expr_string(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'recordAccess': {
                            const transformed = visitor.Expr_recordAccess ? visitor.Expr_recordAccess(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'spread': {
                            const transformed = visitor.Expr_spread ? visitor.Expr_spread(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }

            case 'record': {
                            const transformed = visitor.Expr_record ? visitor.Expr_record(node, ctx) : null;
                            if (transformed != null) {
                                if (Array.isArray(transformed)) {
                                    ctx = transformed[1];
                                    if (transformed[0] != null) {
                                        node = transformed[0];
                                    }
                                } else if (transformed == false) {
                                    return node
                                } else  {
                                    node = transformed;
                                }
                            }
                            break
                        }
        }

        let updatedNode = node;

        switch (node.type) {
            case 'builtin': break;

            case 'blank': break;

            case 'recur': break;

            case 'loop': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$inner = transformExpr(updatedNode$0specified.inner, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$inner !== updatedNode$0specified.inner;

                
                const updatedNode$0node$ann = transformType(updatedNode$0specified.ann, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$ann !== updatedNode$0specified.ann;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, inner: updatedNode$0node$inner, ann: updatedNode$0node$ann};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'task': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$inner = transformExpr(updatedNode$0specified.inner, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$inner !== updatedNode$0specified.inner;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, inner: updatedNode$0node$inner};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'def': {
                        updatedNode = transformDef(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'deftype': {
                        updatedNode = transformDefType(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'string': {
                        updatedNode = transformString(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
                        break;
                    }

            case 'if': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$cond = transformExpr(updatedNode$0specified.cond, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$cond !== updatedNode$0specified.cond;

                
                const updatedNode$0node$yes = transformExpr(updatedNode$0specified.yes, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$yes !== updatedNode$0specified.yes;

                
                const updatedNode$0node$no = transformExpr(updatedNode$0specified.no, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$no !== updatedNode$0specified.no;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, cond: updatedNode$0node$cond, yes: updatedNode$0node$yes, no: updatedNode$0node$no};
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
                
                const updatedNode$0node$target = transformExpr(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$cases = updatedNode$0specified.cases;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.cases.map((updatedNode$0node$cases$item2) => {
                        
            let result = updatedNode$0node$cases$item2;
            {
                let changed4 = false;
                
                const result$pattern = transformPattern(updatedNode$0node$cases$item2.pattern, visitor, ctx);
                changed4 = changed4 || result$pattern !== updatedNode$0node$cases$item2.pattern;

                
                const result$body = transformExpr(updatedNode$0node$cases$item2.body, visitor, ctx);
                changed4 = changed4 || result$body !== updatedNode$0node$cases$item2.body;
                if (changed4) {
                    result =  {...result, pattern: result$pattern, body: result$body};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$cases = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, cases: updatedNode$0node$cases};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'recordAccess': {
                        updatedNode = transformrecordAccess(node, visitor, ctx);
                        changed0 = changed0 || updatedNode !== node;
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
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
            let result = updatedNode$0node$args$item2;
            {
                let changed4 = false;
                
                const result$pattern = transformPattern(updatedNode$0node$args$item2.pattern, visitor, ctx);
                changed4 = changed4 || result$pattern !== updatedNode$0node$args$item2.pattern;

                
                const result$type = transformType(updatedNode$0node$args$item2.type, visitor, ctx);
                changed4 = changed4 || result$type !== updatedNode$0node$args$item2.type;
                if (changed4) {
                    result =  {...result, pattern: result$pattern, type: result$type};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$ret = transformType(updatedNode$0specified.ret, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$ret !== updatedNode$0specified.ret;

                
                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map((updatedNode$0node$body$item2) => {
                        
                const result = transformExpr(updatedNode$0node$body$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$body$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, args: updatedNode$0node$args, ret: updatedNode$0node$ret, body: updatedNode$0node$body};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'tfn': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformTypeArg(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                

                
                const updatedNode$0node$body = transformExpr(updatedNode$0specified.body, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$body !== updatedNode$0specified.body;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, args: updatedNode$0node$args, body: updatedNode$0node$body};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'apply': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$target = transformExpr(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformExpr(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'array': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                let updatedNode$0node$values = updatedNode$0specified.values;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.values.map((updatedNode$0node$values$item2) => {
                        
                const result = transformExpr(updatedNode$0node$values$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$values$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$values = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, values: updatedNode$0node$values};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'spread': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$contents = transformExpr(updatedNode$0specified.contents, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$contents !== updatedNode$0specified.contents;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, contents: updatedNode$0node$contents};
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
                
                const updatedNode$0node$target = transformExpr(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
                const result = transformType(updatedNode$0node$args$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$args$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args};
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
                
                const updatedNode$0node$target = transformExpr(updatedNode$0specified.target, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$target !== updatedNode$0specified.target;

                
                let updatedNode$0node$args = updatedNode$0specified.args;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.args.map((updatedNode$0node$args$item2) => {
                        
            let result = updatedNode$0node$args$item2;
            {
                let changed4 = false;
                
        let result$bound = undefined;
        const result$bound$current = updatedNode$0node$args$item2.bound;
        if (result$bound$current != null) {
            
                const result$bound$4$ = transformType(result$bound$current, visitor, ctx);
                changed4 = changed4 || result$bound$4$ !== result$bound$current;
            result$bound = result$bound$4$;
        }
        
                if (changed4) {
                    result =  {...result, bound: result$bound};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$args = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, target: updatedNode$0node$target, args: updatedNode$0node$args};
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
                
                let updatedNode$0node$bindings = updatedNode$0specified.bindings;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.bindings.map((updatedNode$0node$bindings$item2) => {
                        
            let result = updatedNode$0node$bindings$item2;
            {
                let changed4 = false;
                
                const result$type = transformType(updatedNode$0node$bindings$item2.type, visitor, ctx);
                changed4 = changed4 || result$type !== updatedNode$0node$bindings$item2.type;
                if (changed4) {
                    result =  {...result, type: result$type};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$bindings = arr2;
                        changed2 = true;
                    }
                }
                

                
                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map((updatedNode$0node$body$item2) => {
                        
                const result = transformExpr(updatedNode$0node$body$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$body$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, bindings: updatedNode$0node$bindings, body: updatedNode$0node$body};
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
                
                let updatedNode$0node$bindings = updatedNode$0specified.bindings;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.bindings.map((updatedNode$0node$bindings$item2) => {
                        
            let result = updatedNode$0node$bindings$item2;
            {
                let changed4 = false;
                
                const result$pattern = transformPattern(updatedNode$0node$bindings$item2.pattern, visitor, ctx);
                changed4 = changed4 || result$pattern !== updatedNode$0node$bindings$item2.pattern;

                
                const result$value = transformExpr(updatedNode$0node$bindings$item2.value, visitor, ctx);
                changed4 = changed4 || result$value !== updatedNode$0node$bindings$item2.value;

                
        let result$type = undefined;
        const result$type$current = updatedNode$0node$bindings$item2.type;
        if (result$type$current != null) {
            
                const result$type$4$ = transformType(result$type$current, visitor, ctx);
                changed4 = changed4 || result$type$4$ !== result$type$current;
            result$type = result$type$4$;
        }
        
                if (changed4) {
                    result =  {...result, pattern: result$pattern, value: result$value, type: result$type};
                    changed3 = true;
                }
            }
            
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$bindings = arr2;
                        changed2 = true;
                    }
                }
                

                
                let updatedNode$0node$body = updatedNode$0specified.body;
                {
                    let changed3 = false;
                    const arr2 = updatedNode$0specified.body.map((updatedNode$0node$body$item2) => {
                        
                const result = transformExpr(updatedNode$0node$body$item2, visitor, ctx);
                changed3 = changed3 || result !== updatedNode$0node$body$item2;
                        return result
                    })
                    if (changed3) {
                        updatedNode$0node$body = arr2;
                        changed2 = true;
                    }
                }
                
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, bindings: updatedNode$0node$bindings, body: updatedNode$0node$body};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

            case 'tag': break;

            case 'rich-text': break;

            case 'attachment': {
                    const updatedNode$0specified = node;
                    let changed1 = false;
                    
            let updatedNode$0node = updatedNode$0specified;
            {
                let changed2 = false;
                
                const updatedNode$0node$file = transformAttachedFile(updatedNode$0specified.file, visitor, ctx);
                changed2 = changed2 || updatedNode$0node$file !== updatedNode$0specified.file;
                if (changed2) {
                    updatedNode$0node =  {...updatedNode$0node, file: updatedNode$0node$file};
                    changed1 = true;
                }
            }
            
                    updatedNode = updatedNode$0node;
                    break;
                }

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
            case 'def': {
                            const transformed = visitor.ExprPost_def ? visitor.ExprPost_def(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'deftype': {
                            const transformed = visitor.ExprPost_deftype ? visitor.ExprPost_deftype(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'string': {
                            const transformed = visitor.ExprPost_string ? visitor.ExprPost_string(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'recordAccess': {
                            const transformed = visitor.ExprPost_recordAccess ? visitor.ExprPost_recordAccess(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'spread': {
                            const transformed = visitor.ExprPost_spread ? visitor.ExprPost_spread(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
                        }

            case 'record': {
                            const transformed = visitor.ExprPost_record ? visitor.ExprPost_record(updatedNode, ctx) : null;
                            if (transformed != null) {
                                updatedNode = transformed;
                            }
                            break
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
        
    }

export const transformTerm = <Ctx>(node: Term, visitor: Visitor<Ctx>, ctx: Ctx): Term => {
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
                
                const spread: {[key: string]: Type} = {};
                Object.keys(node.types).forEach(key => {
                    
                const updatedNode$types$value = transformType(node.types[+key], visitor, ctx);
                changed2 = changed2 || updatedNode$types$value !== node.types[+key];
                    spread[key] = updatedNode$types$value
                })
                
                if (changed2) {
                    updatedNode$types =  {...updatedNode$types, ...spread};
                    changed1 = true;
                }
            }
            
                if (changed1) {
                    updatedNode =  {...updatedNode, contents: updatedNode$contents, types: updatedNode$types};
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
        
    }

export const transformTVar = <Ctx>(node: TVar, visitor: Visitor<Ctx>, ctx: Ctx): TVar => {
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
            
                const updatedNode$bound$1$ = transformType(updatedNode$bound$current, visitor, ctx);
                changed1 = changed1 || updatedNode$bound$1$ !== updatedNode$bound$current;
            updatedNode$bound = updatedNode$bound$1$;
        }
        

                
        let updatedNode$default_ = undefined;
        const updatedNode$default_$current = node.default_;
        if (updatedNode$default_$current != null) {
            
                const updatedNode$default_$1$ = transformType(updatedNode$default_$current, visitor, ctx);
                changed1 = changed1 || updatedNode$default_$1$ !== updatedNode$default_$current;
            updatedNode$default_ = updatedNode$default_$1$;
        }
        
                if (changed1) {
                    updatedNode =  {...updatedNode, bound: updatedNode$bound, default_: updatedNode$default_};
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
        
    }

export const transformLoc = <Ctx>(node: Loc, visitor: Visitor<Ctx>, ctx: Ctx): Loc => {
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
        
    }

// no transformer for Node

export const transformNodeArray = <Ctx>(node: NodeArray, visitor: Visitor<Ctx>, ctx: Ctx): NodeArray => {
        if (!node) {
            throw new Error('No NodeArray provided');
        }
        
        const transformed = visitor.NodeArray ? visitor.NodeArray(node, ctx) : null;
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
        if (visitor.NodeArrayPost) {
            const transformed = visitor.NodeArrayPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformAttachment = <Ctx>(node: Attachment, visitor: Visitor<Ctx>, ctx: Ctx): Attachment => {
        if (!node) {
            throw new Error('No Attachment provided');
        }
        
        const transformed = visitor.Attachment ? visitor.Attachment(node, ctx) : null;
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
                
        let updatedNode$file = null;
        const updatedNode$file$current = node.file;
        if (updatedNode$file$current != null) {
            
                const updatedNode$file$1$ = transformAttachedFile(updatedNode$file$current, visitor, ctx);
                changed1 = changed1 || updatedNode$file$1$ !== updatedNode$file$current;
            updatedNode$file = updatedNode$file$1$;
        }
        
                if (changed1) {
                    updatedNode =  {...updatedNode, file: updatedNode$file};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.AttachmentPost) {
            const transformed = visitor.AttachmentPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformRichText = <Ctx>(node: RichText, visitor: Visitor<Ctx>, ctx: Ctx): RichText => {
        if (!node) {
            throw new Error('No RichText provided');
        }
        
        const transformed = visitor.RichText ? visitor.RichText(node, ctx) : null;
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
        if (visitor.RichTextPost) {
            const transformed = visitor.RichTextPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformspread = <Ctx>(node: spread, visitor: Visitor<Ctx>, ctx: Ctx): spread => {
        if (!node) {
            throw new Error('No spread provided');
        }
        
        const transformed = visitor.spread ? visitor.spread(node, ctx) : null;
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
        if (visitor.spreadPost) {
            const transformed = visitor.spreadPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformaccessText = <Ctx>(node: accessText, visitor: Visitor<Ctx>, ctx: Ctx): accessText => {
        if (!node) {
            throw new Error('No accessText provided');
        }
        
        const transformed = visitor.accessText ? visitor.accessText(node, ctx) : null;
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
        if (visitor.accessTextPost) {
            const transformed = visitor.accessTextPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformtapply = <Ctx>(node: tapply, visitor: Visitor<Ctx>, ctx: Ctx): tapply => {
        if (!node) {
            throw new Error('No tapply provided');
        }
        
        const transformed = visitor.tapply ? visitor.tapply(node, ctx) : null;
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
        if (visitor.tapplyPost) {
            const transformed = visitor.tapplyPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformstringText = <Ctx>(node: stringText, visitor: Visitor<Ctx>, ctx: Ctx): stringText => {
        if (!node) {
            throw new Error('No stringText provided');
        }
        
        const transformed = visitor.stringText ? visitor.stringText(node, ctx) : null;
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
        if (visitor.stringTextPost) {
            const transformed = visitor.stringTextPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformCString = <Ctx>(node: CString, visitor: Visitor<Ctx>, ctx: Ctx): CString => {
        if (!node) {
            throw new Error('No CString provided');
        }
        
        const transformed = visitor.CString ? visitor.CString(node, ctx) : null;
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
        if (visitor.CStringPost) {
            const transformed = visitor.CStringPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }

export const transformNodeExtra = <Ctx>(node: NodeExtra, visitor: Visitor<Ctx>, ctx: Ctx): NodeExtra => {
        if (!node) {
            throw new Error('No NodeExtra provided');
        }
        
        const transformed = visitor.NodeExtra ? visitor.NodeExtra(node, ctx) : null;
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
                
                const updatedNode$loc = transformLoc(node.loc, visitor, ctx);
                changed1 = changed1 || updatedNode$loc !== node.loc;
                if (changed1) {
                    updatedNode =  {...updatedNode, loc: updatedNode$loc};
                    changed0 = true;
                }
            }
            
        
        node = updatedNode;
        if (visitor.NodeExtraPost) {
            const transformed = visitor.NodeExtraPost(node, ctx);
            if (transformed != null) {
                node = transformed;
            }
        }
        return node;
        
    }
