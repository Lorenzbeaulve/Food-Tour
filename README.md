# Food-Tour
Tech Web Project



App to permit Turrist To Orient Them Self Around The Town of Vico Equense 

Uses The API of Google Maps And Translate to interface with the user with a map to follow destination and translate so that the Turist Understand no matter the languege

Development wise we will use javascript/html/css front-end and Node JS/ also javascript back-end

---

## Avviare il progetto (login + server)

Questi passaggi configurano il server Node che serve i file statici e fornisce le API di `signup`/`login` che usano MySQL.

1. Installa le dipendenze Node (da PowerShell nella cartella del progetto):

```powershell
npm install
```

2. Crea un file `.env` dalla copia di esempio e modifica i valori per la tua istanza MySQL:

```powershell
copy .env.example .env
# poi apri .env e imposta DB_USER, DB_PASSWORD e DB_NAME
```

3. Crea il database MySQL (se non esiste). Esempio SQL da eseguire in MySQL/MariaDB:

```sql
CREATE DATABASE IF NOT EXISTS foodtour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Avvia il server:

```powershell
npm start
# il server ascolta su http://localhost:3000 per default
```

5. Apri il login nel browser:

```
http://localhost:3000/hello.html
```

Funzionamento:
- `Iscriviti` invia `POST /api/signup` e salva l'email (hash della password) nel DB.
- `Accedi` invia `POST /api/login`; se le credenziali sono corrette viene aperta `success.html` e dopo 3s si torna al login.

Se vuoi che io esegua questi passaggi qui (installare dipendenze e avviare il server), dimmi e procedo.
