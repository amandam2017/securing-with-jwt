create table love_user(
    id serial not null primary key,
    username text,
    pass varchar,
    loveCounter integer DEFAULT 0
);