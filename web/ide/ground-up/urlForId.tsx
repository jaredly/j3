export const urlForId = (id: string) =>
    location.port === '8224'
        ? `http://localhost:9189/tmp/${id}`
        : `/data/tmp/${id}`;
