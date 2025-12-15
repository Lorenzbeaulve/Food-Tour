-- ================================================
-- TABELLA UTENTE
-- ================================================
CREATE TABLE user (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(32) NOT NULL,
    Nome varchar(45) NOT NULL,
    Cognome varchar(45) NOT NULL
);

-- ================================================
-- TABELLA RISTORANTE
-- ================================================
CREATE TABLE Restaurant (
    Name VARCHAR(32) PRIMARY KEY,
    Description VARCHAR(200),
    Location VARCHAR(60),
    Tipologia VARCHAR(35),
    OpeningAndClosingTime VARCHAR(30),
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6)
);

-- ================================================
-- TABELLA RECENSIONE
-- ================================================
CREATE TABLE user_Reviews_A_Restaurant (
    user_email VARCHAR(255),
    Restaurant_Name VARCHAR(32),
    Review VARCHAR(75),
    Consigliato CHAR(1) check(Consigliato in('V','F')),
    PRIMARY KEY (user_email, Restaurant_Name),
    FOREIGN KEY (user_email) REFERENCES user(email)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Restaurant_Name) REFERENCES Restaurant(Name)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- TABELLA PREFERITO
-- ================================================
CREATE TABLE user_Prefere_A_Restaurant (
    user_email VARCHAR(255),
    Restaurant_Name VARCHAR(32),
    Preferito CHAR(1) check(Preferito in('V','F')),
    PRIMARY KEY (user_email, Restaurant_Name),
    FOREIGN KEY (user_email) REFERENCES user(email)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Restaurant_Name) REFERENCES Restaurant(Name)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- INSERIMENTO UTENTI
-- ================================================
INSERT INTO user (email, password,Nome,Cognome)
VALUES
('mario.rossi@example.com', 'pass1234','mario','rossi');
INSERT INTO user (email, password,Nome,Cognome)
VALUES
('luigi.bianchi@example.com', 'ciao5678','luigi','bianchi');
INSERT INTO user (email, password,Nome,Cognome)
VALUES
('anna.verdi@example.com', 'qwerty99','anna','verdi');
INSERT INTO user (email, password,Nome,Cognome)
VALUES
('paolo.neri@example.com', 'securepass','paolo','bianchi');
INSERT INTO user (email, password,Nome,Cognome)
VALUES
('laura.blu@example.com', 'test2025','laura','blu');

-- ================================================
-- INSERIMENTO RISTORANTI
-- ================================================
INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES
('Pizzeria Cardone', 'Pizza, rosticceria e focaccia in un ristorante self-service con sede in un ex fattoria.\n Tra le pizze più particolari ci sono consigliate zucchine pancetta e provola e alla diavola', 'Via le Pietre, 13, 80069 Vico Equense NA','Pizzeria','18:00-00:00', 40.6599, 14.4338);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES
('Gelateria Gabriele', 'Leccornie artigianali, come gelati e semifreddi, e liquori in locale curato con banco dei formaggi e salumi.', 'Corso Umberto I°, 8, 80069 Vico Equense NA','Gelateria','08:30-14:00  16:00-00:00', 40.6611, 14.4325);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES
('Pizzeria da Franco', 'Specialità di Salumi, vini e pizze da asporto incentrato sul farti provare i sapori tipici della Salumeria Vicana.\n Aperto fino a tarda notte ', 'Corso Filangieri, 94, 80069 Vico Equense NA','Salumeria','08:00-02:00', 40.6606, 14.4342);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES
('Rosticceria del Corso', 'Rosticeria con limitati posti a sedere ma rapida consegna al banco utile quando vuoi mangiare qualcosa di buono al volo. Chiuso di Lunedì', 'Via, Corso Filangieri, 87, 80069 Vico Equense NA', 'Rosticeria', '10:30-14:30 17-00', 40.6604, 14.4340);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES
('Ristorante Cerasè', 'Pizza, pasta e piatti a base di pesce e frutti di mare su una terrazza affacciata sul Golfo di Napoli.', 'Corso Filangieri, 4, 80069 Vico Equense NA', 'Pesce', '12-00', 40.6597, 14.4319);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES('Zerilli','Locale con cocktail raffinati e colazioni impareggiabili','Corso Umberto I°, 80069 Vico Equense NA','Cocktail','06:30-00', 40.6609, 14.4322);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES('Ristorante Al Buco','Pizzeria con una ampia gamma di saltimbocca e rustici da asporto con consegne a domicilio velocì e le sue pizze especie le classiche sono tra le migliori','Via Roma, 19, 80069 Vico Equense NA','Pizzeria','12:00-16:00 18:30-00:00', 40.6616, 14.4331);

INSERT INTO Restaurant (Name, Description, Location, Tipologia, OpeningAndClosingTime, Latitude, Longitude)
VALUES('Ristorante Pizza a metro','Piatti di pesce e pizze serviti in un elegante sala luminosa con splendidi lampadari o su una terrazza rigogliosa.','Corso Giovanni Nicotera, 15, 80069 Vico Equense NA','Pizzeria','12:00-00:00', 40.6589, 14.4308);

-- ================================================
-- INSERIMENTO PREFERITI
-- ================================================
INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('mario.rossi@example.com', 'Pizzeria Cardone', 'F');

INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('luigi.bianchi@example.com', 'Gelateria Gabriele', 'F');

INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('anna.verdi@example.com', 'Pizzeria da Franco', 'V');

INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('anna.verdi@example.com', 'Ristorante Pizza a metro', 'V');

INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('paolo.neri@example.com', 'Rosticceria del Corso', 'F');

INSERT INTO user_Prefere_A_Restaurant (user_email, Restaurant_Name, Preferito)
VALUES
('laura.blu@example.com', 'Ristorante Cerasè', 'F');


-- ================================================
-- INSERIMENTO RECENSIONI
-- ================================================
INSERT INTO user_Reviews_A_Restaurant (user_email, Restaurant_Name, Review, Consigliato)
VALUES
('mario.rossi@example.com', 'Pizzeria Cardone', 'Ottima pizza e grande varietà.', 'V');

INSERT INTO user_Reviews_A_Restaurant (user_email, Restaurant_Name, Review, Consigliato)
VALUES
('luigi.bianchi@example.com', 'Gelateria Gabriele', 'Gelati eccezionali, da provare.', 'V');

INSERT INTO user_Reviews_A_Restaurant (user_email, Restaurant_Name, Review, Consigliato)
VALUES
('anna.verdi@example.com', 'Pizzeria da Franco', 'Sapori tipici, molto buono.', 'V');

INSERT INTO user_Reviews_A_Restaurant (user_email, Restaurant_Name, Review, Consigliato)
VALUES
('paolo.neri@example.com', 'Rosticceria del Corso', 'Buon cibo ma pochi posti a sedere.', 'V');

INSERT INTO user_Reviews_A_Restaurant (user_email, Restaurant_Name, Review, Consigliato)
VALUES
('laura.blu@example.com', 'Ristorante Cerasè', 'Vista splendida e piatti ottimi.', 'V');