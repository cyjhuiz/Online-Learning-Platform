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

CREATE DATABASE IF NOT EXISTS `section` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `section`;

-- --------------------------------------------------------


CREATE TABLE IF NOT EXISTS `section` (
  `section_ID` int(11) NOT NULL AUTO_INCREMENT,
  `class_ID` int(11) NOT NULL,
  `title` varchar(20) NOT NULL,
  `ranking` int(3) NOT NULL,
  `has_content` boolean NOT NULL DEFAULT False,
  `has_quiz` boolean NOT NULL DEFAULT False,
  PRIMARY KEY (`section_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `section_content` (
  `content_ID` int(11) NOT NULL AUTO_INCREMENT,
  `section_ID` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `content_type` varchar(20) NOT NULL,
  PRIMARY KEY (`content_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `content_view` (
  `content_ID` int(11) NOT NULL,
  `learner_ID` int(11) NOT NULL,
  `section_ID` int(11) NOT NULL,
  PRIMARY KEY (`content_ID`, `leaner_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;



COMMIT;
