create table love_user(
    id serial not null primary key,
    username text,
    pass varchar,
    love_count integer DEFAULT 0
);