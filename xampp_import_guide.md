# How to Import Database into XAMPP phpMyAdmin

Since your `database.sql` file already includes the commands to create the database (`CREATE DATABASE IF NOT EXISTS...`), you can simply import the file directly.

1.  **Start XAMPP**:
    *   Open the **XAMPP Control Panel**.
    *   Start **Apache** and **MySQL**.

2.  **Open phpMyAdmin**:
    *   Open your web browser and go to: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

3.  **Import the File**:
    *   Click on the **Import** tab in the top menu bar.
    *   Click on **Choose File** (or "Browse").
    *   Navigate to your project folder: `d:\5th Semester\Web\ultras-1.0.1\ultras-1.0.0\`
    *   Select the file: **`database.sql`** (Make sure to select the one with the correct spelling, not `databse.sql`).
    *   Scroll down to the bottom of the page and click **Go**.

4.  **Verify**:
    *   You should see a green success message.
    *   On the left sidebar, look for a new database named **`clothing_store`**.
    *   Click on it to confirm all your tables (`products`, `users`, `admin_accounts`, etc.) are there.
