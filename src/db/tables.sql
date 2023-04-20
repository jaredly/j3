create table names (
    id text primary key,
    map text check(json_valid(map)) not null,
    root_date integer -- nullable
)
create table definitions (
    id text primary key,
    value text check(json_valid(value)) not null
)
create table sandboxes {
    id text primary key,
    title text not null,
    created_date integer not null,
    updated_date integer not null,
}
create table sandbox_[id]_nodes (
    idx text not null,
    value text check(json_valid(value)) not null,
    primary key (idx, sandbox)
)
create table sandbox_[id]_history (
    id 
)