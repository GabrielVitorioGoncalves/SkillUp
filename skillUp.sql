-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: skillup
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `adm_nome` varchar(255) NOT NULL,
  `adm_email` varchar(255) NOT NULL,
  `adm_senha` varchar(255) NOT NULL,
  `adm_foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_admin`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'Ricardao','teste@teste','123',NULL),(2,'BHenois','ttt@gmail.com','123',NULL),(3,'aaaaaaaaaa','a@a.com','123',NULL),(4,'tre','t@t','123',NULL);
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacao`
--

DROP TABLE IF EXISTS `avaliacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `avaliacao` (
  `id_avaliacao` int(11) NOT NULL AUTO_INCREMENT,
  `ava_dataHora` datetime NOT NULL,
  `ava_nota` decimal(3,2) NOT NULL,
  `id_historico` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_video` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_avaliacao`),
  UNIQUE KEY `idx_usuario_video_unico` (`id_usuario`,`id_video`),
  KEY `id_historico` (`id_historico`),
  KEY `id_video` (`id_video`),
  CONSTRAINT `avaliacao_ibfk_1` FOREIGN KEY (`id_historico`) REFERENCES `historico` (`id_historico`),
  CONSTRAINT `avaliacao_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `avaliacao_ibfk_3` FOREIGN KEY (`id_video`) REFERENCES `videos` (`id_video`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacao`
--

LOCK TABLES `avaliacao` WRITE;
/*!40000 ALTER TABLE `avaliacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `avaliacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorizacao`
--

DROP TABLE IF EXISTS `categorizacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorizacao` (
  `id_tema` int(11) NOT NULL,
  `id_video` int(11) NOT NULL,
  PRIMARY KEY (`id_tema`,`id_video`),
  KEY `id_video` (`id_video`),
  CONSTRAINT `categorizacao_ibfk_1` FOREIGN KEY (`id_tema`) REFERENCES `temas` (`id_tema`),
  CONSTRAINT `categorizacao_ibfk_2` FOREIGN KEY (`id_video`) REFERENCES `videos` (`id_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorizacao`
--

LOCK TABLES `categorizacao` WRITE;
/*!40000 ALTER TABLE `categorizacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorizacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificados`
--

DROP TABLE IF EXISTS `certificados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificados` (
  `id_certificado` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `data_emissao` datetime NOT NULL,
  `codigo_unico` varchar(255) NOT NULL,
  PRIMARY KEY (`id_certificado`),
  UNIQUE KEY `codigo_unico_UNIQUE` (`codigo_unico`),
  KEY `fk_certificados_usuario_idx` (`id_usuario`),
  KEY `fk_certificados_curso_idx` (`id_curso`),
  CONSTRAINT `fk_certificados_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_certificados_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificados`
--

LOCK TABLES `certificados` WRITE;
/*!40000 ALTER TABLE `certificados` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario`
--

DROP TABLE IF EXISTS `comentario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentario` (
  `id_comentario` int(11) NOT NULL AUTO_INCREMENT,
  `com_texto` text NOT NULL,
  `com_dataHora` datetime NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_video` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_video` (`id_video`),
  CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`id_video`) REFERENCES `videos` (`id_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario`
--

LOCK TABLES `comentario` WRITE;
/*!40000 ALTER TABLE `comentario` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso_categoria`
--

DROP TABLE IF EXISTS `curso_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `curso_categoria` (
  `id_curso` int(11) NOT NULL,
  `id_tema` int(11) NOT NULL,
  PRIMARY KEY (`id_curso`,`id_tema`),
  KEY `fk_curso_categoria_tema_idx` (`id_tema`),
  CONSTRAINT `fk_curso_categoria_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `fk_curso_categoria_tema` FOREIGN KEY (`id_tema`) REFERENCES `temas` (`id_tema`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso_categoria`
--

LOCK TABLES `curso_categoria` WRITE;
/*!40000 ALTER TABLE `curso_categoria` DISABLE KEYS */;
INSERT INTO `curso_categoria` VALUES (16,44);
/*!40000 ALTER TABLE `curso_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso_video`
--

DROP TABLE IF EXISTS `curso_video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `curso_video` (
  `id_curso` int(11) NOT NULL,
  `id_video` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  PRIMARY KEY (`id_curso`,`id_video`),
  KEY `id_video` (`id_video`),
  CONSTRAINT `curso_video_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`),
  CONSTRAINT `curso_video_ibfk_2` FOREIGN KEY (`id_video`) REFERENCES `videos` (`id_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso_video`
--

LOCK TABLES `curso_video` WRITE;
/*!40000 ALTER TABLE `curso_video` DISABLE KEYS */;
INSERT INTO `curso_video` VALUES (16,15,1);
/*!40000 ALTER TABLE `curso_video` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cursos` (
  `id_curso` int(11) NOT NULL AUTO_INCREMENT,
  `cur_titulo` varchar(255) NOT NULL,
  `cur_descricao` text DEFAULT NULL,
  `cur_nota` decimal(3,2) DEFAULT NULL,
  `cur_categoria` varchar(255) DEFAULT NULL,
  `capa` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (16,'Formula 1','F1',NULL,'F1','1751826230577-largada-do-gp-da-espanha-de-f1-103941.jpg');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico`
--

DROP TABLE IF EXISTS `historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historico` (
  `id_historico` int(11) NOT NULL AUTO_INCREMENT,
  `his_dataHora` datetime NOT NULL,
  `his_concluido` tinyint(1) DEFAULT 0,
  `his_posicao` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_video` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  UNIQUE KEY `idx_usuario_video` (`id_usuario`,`id_video`),
  KEY `id_video` (`id_video`),
  CONSTRAINT `historico_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `historico_ibfk_2` FOREIGN KEY (`id_video`) REFERENCES `videos` (`id_video`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico`
--

LOCK TABLES `historico` WRITE;
/*!40000 ALTER TABLE `historico` DISABLE KEYS */;
INSERT INTO `historico` VALUES (8,'2025-07-06 15:25:13',1,NULL,1,15);
/*!40000 ALTER TABLE `historico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias`
--

DROP TABLE IF EXISTS `preferencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferencias` (
  `id_usuario` int(11) NOT NULL,
  `id_tema` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_tema`),
  KEY `id_tema` (`id_tema`),
  CONSTRAINT `preferencias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `preferencias_ibfk_2` FOREIGN KEY (`id_tema`) REFERENCES `temas` (`id_tema`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias`
--

LOCK TABLES `preferencias` WRITE;
/*!40000 ALTER TABLE `preferencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progresso`
--

DROP TABLE IF EXISTS `progresso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `progresso` (
  `id_progresso` int(11) NOT NULL AUTO_INCREMENT,
  `pro_percentual` decimal(5,2) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_curso` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_progresso`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `progresso_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `progresso_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progresso`
--

LOCK TABLES `progresso` WRITE;
/*!40000 ALTER TABLE `progresso` DISABLE KEYS */;
/*!40000 ALTER TABLE `progresso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temas`
--

DROP TABLE IF EXISTS `temas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL AUTO_INCREMENT,
  `cat_nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id_tema`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temas`
--

LOCK TABLES `temas` WRITE;
/*!40000 ALTER TABLE `temas` DISABLE KEYS */;
INSERT INTO `temas` VALUES (42,'Programa'),(43,'python'),(44,'F1');
/*!40000 ALTER TABLE `temas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `usu_nome` varchar(255) NOT NULL,
  `usu_email` varchar(255) NOT NULL,
  `usu_senha` varchar(255) NOT NULL,
  `usu_foto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usu_email` (`usu_email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'teste','teste@teste','teste',NULL),(2,'galo','galo@galo','321',NULL),(4,'VictoryGrey','victory@gmail.com','Vic123',NULL),(9,'aloha','123@123','123',NULL),(10,'Leandro','ttt@gmail.com','123',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videos` (
  `id_video` int(11) NOT NULL AUTO_INCREMENT,
  `vid_titulo` varchar(255) NOT NULL,
  `vid_sinopse` text DEFAULT NULL,
  `vid_nota` decimal(3,2) DEFAULT NULL,
  `vid_bloqueado` tinyint(1) DEFAULT 0,
  `vid_miniatura` varchar(255) DEFAULT NULL,
  `caminho_do_arquivo` varchar(255) DEFAULT NULL,
  `vid_dataIni` datetime DEFAULT NULL,
  `vid_dataFim` datetime DEFAULT NULL,
  PRIMARY KEY (`id_video`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (15,'MAX ',NULL,NULL,0,NULL,'1751826250983-ð§¬DNA_-A-Max-Verstappen-x-Kendrick-Lamar-Edit-ð§¬.mp4',NULL,NULL);
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-06 15:27:34
