import { DocStage } from '../shared/state2';

export type ServerBackend = {
    docsList(): Promise<{ id: string; title: string }[]>;
    doc(id: string): Promise<DocStage>;
    newDoc(title: string): Promise<string>;
};

export const jsonGitBackend = (baseDir: string): ServerBackend => {
    return {
        //
    };
};
