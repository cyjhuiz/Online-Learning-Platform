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

CREATE DATABASE IF NOT EXISTS `quiz` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `quiz`;

-- --------------------------------------------------------


CREATE TABLE IF NOT EXISTS `quiz` (
  `quiz_ID` int(11) NOT NULL AUTO_INCREMENT,
  `class_ID` int(11) NOT NULL,
  `section_ID` int(11) NOT NULL,
  `trainer_ID` int(11) NOT NULL,
  `duration` int(4) NOT NULL,
  `passing_rate` float(3,2) NOT NULL,
  `grading_type` varchar(20) NOT NULL,
  PRIMARY KEY (`quiz_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `quiz_question` (
  `quiz_question_ID` int(11) NOT NULL AUTO_INCREMENT,
  `quiz_ID` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` varchar(255) NOT NULL,
  `option1` varchar(255) NOT NULL,
  `option2` varchar(255) NOT NULL,
  `option3` varchar(255),
  `option4` varchar(255),
  `option5` varchar(255),
  `point` int(3),
  PRIMARY KEY (`quiz_question_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `quiz_result` (
  `quiz_ID` int(11) NOT NULL,
  `class_ID` int(11) NOT NULL,
  `section_ID` int(11) NOT NULL,
  `learner_ID` int(11) NOT NULL,
  `quiz_score` int(3),
  `has_passed` boolean NOT NULL,
  PRIMARY KEY (`quiz_ID`, `learner_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;



COMMIT;

