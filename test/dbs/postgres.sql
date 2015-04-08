create table sys_entity(
  "id" VARCHAR (255) NOT NULL,
  "zone" VARCHAR (255),
  "base" VARCHAR (255),
  "name" VARCHAR (255) NOT NULL,
  "fields" TEXT,
  PRIMARY KEY ("id")
);

CREATE TABLE sys_user (
  "id" VARCHAR (255) NOT NULL,
  "nick" VARCHAR (255) NOT NULL,
  "email" VARCHAR (255) DEFAULT NULL,
  "name" VARCHAR (255) DEFAULT NULL,
  "active" BOOLEAN DEFAULT NULL,
  "when" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmed" BOOLEAN DEFAULT NULL,
  "confirmcode" VARCHAR (255) DEFAULT NULL,
  "salt" VARCHAR (255) DEFAULT NULL,
  "pass" VARCHAR (255) DEFAULT NULL,
  "admin" BOOLEAN,
  "seneca" VARCHAR (255) DEFAULT NULL,
  "events" JSON DEFAULT NULL,
  "perm" JSON DEFAULT NULL,
  PRIMARY KEY ("id")
);

create table event(
  "id" VARCHAR (255) NOT NULL,
  "code" VARCHAR (255) NOT NULL,
  "name" VARCHAR (255) NOT NULL,
  "numcards" SMALLINT NOT NULL,
  "numteams" SMALLINT NOT NULL,
  "users" JSON,
  PRIMARY KEY ("id")
);

create table team(
  "id" VARCHAR (255) NOT NULL,
  "num" SMALLINT NOT NULL,
  "event" VARCHAR (255) NOT NULL,
  "eventcode" VARCHAR (255) NOT NULL,
  "name" VARCHAR (255) NOT NULL,
  "wells" JSON,
  "numwells" SMALLINT DEFAULT 0,
  "users" JSON,
  PRIMARY KEY ("id")
);

CREATE TABLE sys_login (
  "id" VARCHAR (255) NOT NULL,
  "nick" VARCHAR (255) NOT NULL,
  "email" VARCHAR (255) NOT NULL,
  "user" VARCHAR (255) NOT NULL,
  "when" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "why" VARCHAR (255) NOT NULL,
  "token" VARCHAR (255) NOT NULL,
  "active" BOOLEAN NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE session (
  "id" VARCHAR (255) NOT NULL,
  "last" BIGINT NOT NULL,
  "data" JSON NOT NULL,
  PRIMARY KEY ("id")
);