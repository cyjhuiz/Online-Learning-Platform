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
-- Database: `user`
CREATE DATABASE IF NOT EXISTS `user` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `user`;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_ID` int NOT NULL AUTO_INCREMENT,
  `email` varchar(40) NOT NULL,
  `name` varchar(20) NOT NULL,
  `job_title` varchar(20) NOT NULL,
  `password` varchar(40) NOT NULL,
  `department` varchar(40) NOT NULL,
  PRIMARY KEY (`user_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `learner_completed` (
  `learner_ID` int(11) NOT NULL,
  `course_ID` int(11) NOT NULL,
  `class_ID` int(11) NOT NULL,
  `status` varcahr(20) NOT NULL,
  PRIMARY KEY (`learner_ID`,`course_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
--
-- Dumping data for table `user`
--

CREATE TABLE IF NOT EXISTS `user_role` (
  `user_ID` int(11) NOT NULL,
  `role_ID` int(11) NOT NULL,
  PRIMARY KEY (`user_ID`,`role`)
) NGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `role` (
  `role_ID` int(11) NOT NULL,
  `role` varchar(20) NOT NULL,
  PRIMARY KEY (`user_ID`,`role`)
) NGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

INSERT INTO `user` (`user_ID`, `email`, `name`,  `job_title`, `password`,  `role`) VALUES
(NULL, 'albert_tan@example.com', 'Albert Tan', 'Senior Engineer', '123456', 'trainer'),
(NULL, 'daniel_tan@example.com', 'Daniel Tan', 'Senior Engineer', '123456', 'trainer'),
(NULL, 'john_teo@example.com', 'John Teo', 'Junior Engineer', '123456', 'learner'),
(NULL, 'james_teo@example.com', 'James Teo', 'Junior Engineer', '123456', 'learner'),
(NULL, 'bob_tan@example.com', 'Bob Tan', 'Human Resource', '123456', 'hr');


COMMIT;

