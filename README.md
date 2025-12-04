# Food-Tour
Tech Web Project



FoodTour is an application designed to permit tourists find the right gastronomic experience for them.

The app uses Leaflet to display an interactive map and includes a built-in multilingual translation system, ensuring that users can understand the interface regardless of their native language.

From a technical perspective, the project uses HTML, CSS, and JavaScript for the front-end, while the back-end is built with Node.js and a MySQL database to manage users, favorites, and recent activity.

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
npm start  npx http-server -c-1
# il server ascolta su http://localhost:3000 per default entrambi validi
```

5. Apri il login nel browser:

```
http://localhost:3000/hello.html
```

Funzionamento:
- `Iscriviti` invia `POST /api/signup` e salva l'email (hash della password) nel DB.
- `Accedi` invia `POST /api/login`; se le credenziali sono corrette viene aperta `success.html` e dopo 3s si torna al login.

email di prova:anna.verdi@example.com
password di prova:qwerty99
start web page:npx http-server -c-1
start DB Server:node js/server.js
Per ora per vedere i vari html vai in source e clica su di loro
