CREATE DATABASE IF NOT EXISTS foodtour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodtour;

CREATE TABLE utente (
    email VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    cognome VARCHAR(45) NOT NULL,
    password VARCHAR(32) NOT NULL,
    data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ristorante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(32) NOT NULL,
    indirizzo VARCHAR(45) NOT NULL,
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    tipo VARCHAR(32),
    orario_apertura TIME,
    orario_chiusura TIME,
    telefono VARCHAR(15)
);

CREATE TABLE recensione (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utente_email VARCHAR(255) NOT NULL,
    ristorante_id INT NOT NULL,
    commento TEXT,
    data_recensione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY mi_piace (utente_email, ristorante_id),
    FOREIGN KEY (utente_email) REFERENCES utente(email) ON DELETE CASCADE,
    FOREIGN KEY (ristorante_id) REFERENCES ristorante(id) ON DELETE CASCADE
);


CREATE TABLE preferiti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utente_email VARCHAR(255) NOT NULL,
    ristorante_id INT NOT NULL,
    UNIQUE KEY preferito (utente_email, ristorante_id),
    FOREIGN KEY (utente_email) REFERENCES utente(email) ON DELETE CASCADE,
    FOREIGN KEY (ristorante_id) REFERENCES ristorante(id) ON DELETE CASCADE
);
