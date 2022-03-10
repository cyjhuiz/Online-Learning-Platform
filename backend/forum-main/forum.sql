-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 12, 2020 at 02:17 AM
-- Server version: 5.7.19
-- PHP Version: 7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


--

CREATE DATABASE IF NOT EXISTS `forum` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `forum`;

-- --------------------------------------------------------


CREATE TABLE IF NOT EXISTS `forum_thread` (
  `thread_ID` int(11) NOT NULL AUTO_INCREMENT,
  `class_ID` int(11) NOT NULL,
  `thread_date` varchar(100) NOT NULL,
  `thread_title` varchar(255) NOT NULL,
  `creator_ID` int(11) NOT NULL,
  `creator_name` varchar(255) NOT NULL,
  PRIMARY KEY (`thread_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `post` (
  `post_ID` int(11) NOT NULL AUTO_INCREMENT,
  `thread_ID` int(11) NOT NULL,
  `post_date` varchar(100) NOT NULL,
  `post_content` varchar(255) NOT NULL,
  `creator_ID` int(11) NOT NULL,
  `creator_name` varchar(255) NOT NULL,
  PRIMARY KEY (`post_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `reply` (
  `reply_ID` int(11) NOT NULL AUTO_INCREMENT,
  `post_ID` int(11) NOT NULL,
  `creator_ID` int(11) NOT NULL,
  `creator_name` varchar(255) NOT NULL,
  `reply_date` varchar(100) NOT NULL,
  `reply_content` varchar(255) NOT NULL,
  PRIMARY KEY (`reply_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `post_like` (
  `user_ID` int(11) NOT NULL,
  `post_ID` int(11) NOT NULL,
  PRIMARY KEY (`user_ID`, `post_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `reply_like` (
  `user_ID` int(11) NOT NULL,
  `reply_ID` int(11) NOT NULL,
  PRIMARY KEY (`user_ID`, `reply_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
COMMIT;
