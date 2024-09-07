export type AutoCompleteReplace = {
    type: 'update';
    update:
        | {
              type: 'hash';
              hash: string | number;
          }
        | {
              type: 'accessText';
              text: string;
          }
        | {
              type: 'array-hash';
              hash: string;
          };
    exact: boolean;
    text: string;
    // ann?: Type;
};

export type AutoCompleteResult =
    | AutoCompleteReplace
    | { type: 'info'; text: string }; // TODO also autofixers probably?
