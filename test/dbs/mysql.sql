
CREATE TABLE `sys_entity` (
  `base` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `fields` blob,
  `id` varchar(255) NOT NULL,
  `seneca` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE sys_user (
  `id` varchar (255) NOT NULL,
  `nick` varchar (255) NOT NULL,
  `email` varchar (255) DEFAULT NULL,
  `name` varchar (255) DEFAULT NULL,
  `active` tinyint (1) DEFAULT NULL,
  `when` varchar (255) NOT NULL,
  `confirmed` tinyint (1) DEFAULT NULL,
  `confirmcode` varchar (255) DEFAULT NULL,
  `salt` varchar (255) DEFAULT NULL,
  `pass` varchar (255) DEFAULT NULL,
  `admin` tinyint (1),
  `seneca` blob,
  `events` blob DEFAULT NULL,
  `perm` blob DEFAULT NULL
);

CREATE TABLE event(
  `id` varchar (255) NOT NULL,
  `code` varchar (255) NOT NULL,
  `name` varchar (255) NOT NULL,
  `numcards` smallint NOT NULL,
  `numteams` smallint NOT NULL,
  `seneca` blob,
  `users` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

create table team(
  `id` varchar (255) NOT NULL,
  `num` smallint NOT NULL,
  `event` varchar (255) NOT NULL,
  `eventcode` varchar (255) NOT NULL,
  `name` varchar (255) NOT NULL,
  `wells` blob,
  `numwells` smallint DEFAULT 0,
  `seneca` blob,
  `users` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE sys_login (
  `id` varchar (255) NOT NULL,
  `nick` varchar (255) NOT NULL,
  `email` varchar (255) NOT NULL,
  `user` varchar (255) NOT NULL,
  `when` varchar (255) NOT NULL,
  `why` varchar (255) NOT NULL,
  `token` varchar (255) NOT NULL,
  `active` tinyint (1) NOT NULL,
  `context` varchar (255)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE session (
  `id` varchar (255) NOT NULL,
  `last` bigint NOT NULL,
  `data` blob NOT NULL,
  `seneca` blob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;