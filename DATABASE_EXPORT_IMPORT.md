# Database Export and Import Guide for ICMS Project

This guide will help you export your database and import it on another computer.

---

## PART 1: EXPORTING THE DATABASE (Your Side)

### Option A: If You're Using SQLite (Current Default)

SQLite is simpler - you just need to copy the database file!

#### Step 1: Locate Your Database File

The SQLite database file is located at:
```
database/database.sqlite
```

#### Step 2: Copy the Database File

**Windows:**
1. Navigate to your project folder: `C:\Users\User\icmss\last\icms\icmsreact\database\`
2. Copy the file `database.sqlite`
3. Paste it in a location you can easily find (like Desktop)
4. Rename it to `icms_database_backup.sqlite` (optional)

**Or using Command Line:**
```powershell
cd C:\Users\User\icmss\last\icms\icmsreact
copy database\database.sqlite icms_database_backup.sqlite
```

**Linux/Mac:**
```bash
cd /path/to/icmsreact
cp database/database.sqlite icms_database_backup.sqlite
```

#### Step 3: Include in ZIP or Share Separately

You can either:
- **Option 1:** Include `database.sqlite` in your project ZIP (it's already in the `database` folder)
- **Option 2:** Share the database file separately

---

### Option B: If You're Using MySQL

If you've switched to MySQL, follow these steps:

#### Step 1: Export Database Using phpMyAdmin (Easiest Method)

1. Open phpMyAdmin in your browser: `http://localhost/phpmyadmin`
2. Click on your database name (e.g., `icms`) in the left sidebar
3. Click on the **"Export"** tab at the top
4. Select **"Quick"** export method
5. Select **"SQL"** format
6. Click **"Go"** button
7. Save the file as `icms_database.sql`

#### Step 2: Export Database Using Command Line (Alternative)

**Windows (Command Prompt):**
```cmd
cd C:\xampp\mysql\bin
mysqldump -u root -p icms > C:\Users\User\Desktop\icms_database.sql
```
(Enter your MySQL password when prompted)

**Linux/Mac:**
```bash
mysqldump -u root -p icms > ~/Desktop/icms_database.sql
```

**If you have a password:**
```bash
mysqldump -u root -pYourPassword icms > icms_database.sql
```

#### Step 3: Share the SQL File

Include `icms_database.sql` in your ZIP file or share it separately.

---

## PART 2: IMPORTING THE DATABASE (Your Friend's Side)

### Option A: Importing SQLite Database

#### Step 1: Receive the Database File

Make sure your friend has the `database.sqlite` file.

#### Step 2: Place the Database File

1. Extract the project ZIP file
2. Navigate to the `database` folder
3. If there's already a `database.sqlite` file, **backup or delete it first**
4. Copy the `database.sqlite` file from your friend into the `database` folder

**Windows:**
```powershell
# Navigate to project folder
cd C:\Projects\icmsreact

# Backup existing database (if exists)
if (Test-Path database\database.sqlite) {
    Rename-Item database\database.sqlite database\database.sqlite.backup
}

# Copy the new database file
Copy-Item path\to\database.sqlite database\database.sqlite
```

**Linux/Mac:**
```bash
cd /path/to/icmsreact
mv database/database.sqlite database/database.sqlite.backup  # Backup old one
cp /path/to/database.sqlite database/database.sqlite
```

#### Step 3: Configure .env File

Make sure your `.env` file has SQLite configuration:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

**Note:** For SQLite, you don't need `DB_HOST`, `DB_USERNAME`, or `DB_PASSWORD`.

#### Step 4: Set Permissions (Linux/Mac Only)

```bash
chmod 664 database/database.sqlite
chmod 775 database
```

#### Step 5: Test the Import

Run the Laravel server and check if data appears:
```bash
composer run dev
```

---

### Option B: Importing MySQL Database

#### Step 1: Create the Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on **"New"** in the left sidebar
3. Enter database name: `icms` (or any name you prefer)
4. Select **"utf8mb4_unicode_ci"** as collation
5. Click **"Create"**

**Or using MySQL Command Line:**
```sql
CREATE DATABASE icms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 2: Import Using phpMyAdmin (Easiest Method)

1. Click on your newly created database (`icms`) in the left sidebar
2. Click on the **"Import"** tab at the top
3. Click **"Choose File"** button
4. Select the `icms_database.sql` file
5. Scroll down and click **"Go"** button
6. Wait for the import to complete (may take a few minutes)

#### Step 3: Import Using Command Line (Alternative)

**Windows:**
```cmd
cd C:\xampp\mysql\bin
mysql -u root -p icms < C:\path\to\icms_database.sql
```
(Enter your MySQL password when prompted)

**Linux/Mac:**
```bash
mysql -u root -p icms < ~/path/to/icms_database.sql
```

**If you have a password:**
```bash
mysql -u root -pYourPassword icms < icms_database.sql
```

#### Step 4: Configure .env File

Make sure your `.env` file has MySQL configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=icms
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

**Important:** Replace `your_password_here` with your actual MySQL root password (leave empty if no password).

#### Step 5: Run Migrations (Optional but Recommended)

Even though you imported data, run migrations to ensure all tables are up to date:

```bash
php artisan migrate
```

If you see "Nothing to migrate", that's fine - it means your database is already up to date.

#### Step 6: Test the Import

Run the Laravel server and check if data appears:
```bash
composer run dev
```

---

## QUICK REFERENCE: Complete Export/Import Process

### For SQLite Users:

**Export (Your Side):**
```powershell
# Just copy the database file
copy database\database.sqlite icms_database_backup.sqlite
```

**Import (Friend's Side):**
```powershell
# 1. Place database.sqlite in database/ folder
# 2. Configure .env:
#    DB_CONNECTION=sqlite
#    DB_DATABASE=database/database.sqlite
# 3. Run: composer run dev
```

### For MySQL Users:

**Export (Your Side):**
```bash
# Using phpMyAdmin: Export → Quick → SQL → Go
# OR using command line:
mysqldump -u root -p icms > icms_database.sql
```

**Import (Friend's Side):**
```bash
# 1. Create database in phpMyAdmin
# 2. Import → Choose File → icms_database.sql → Go
# OR using command line:
mysql -u root -p icms < icms_database.sql
# 3. Configure .env with MySQL settings
# 4. Run: composer run dev
```

---

## TROUBLESHOOTING

### Issue 1: "Database file is locked" (SQLite)
**Solution:** 
- Close all applications using the database
- Make sure Laravel server is stopped
- Try again

### Issue 2: "Access denied for user" (MySQL)
**Solution:**
- Check username and password in `.env` file
- Make sure MySQL user has proper permissions
- Try using `root` user with correct password

### Issue 3: "Unknown database" (MySQL)
**Solution:**
- Create the database first before importing
- Make sure database name in `.env` matches the created database

### Issue 4: "Import file too large" (phpMyAdmin)
**Solution:**
- Increase `upload_max_filesize` and `post_max_size` in `php.ini`
- Or use command line import instead
- Or split the SQL file into smaller chunks

### Issue 5: "Table already exists" (MySQL)
**Solution:**
- Drop the existing database and create a new one
- Or use `--force` flag: `mysql -u root -p icms < icms_database.sql --force`

---

## RECOMMENDED APPROACH

**For sharing with a friend, I recommend:**

1. **If you're using SQLite:** Just include `database/database.sqlite` in your ZIP file. It's the simplest method.

2. **If you're using MySQL:** Export to SQL file and include it in the ZIP, or share separately.

3. **Your friend can choose:**
   - Use SQLite (simpler, no setup needed)
   - Use MySQL (more powerful, better for production)

---

## CHECKLIST FOR SHARING

Before sending the project to your friend, make sure:

- [ ] Database file is included (SQLite) OR SQL export file is included (MySQL)
- [ ] `.env.example` file exists (for reference)
- [ ] `README_SETUP.md` is included
- [ ] `DATABASE_EXPORT_IMPORT.md` is included (this file)
- [ ] All code files are included
- [ ] `node_modules` and `vendor` are excluded (to reduce ZIP size)

---

**Good luck with sharing your project!** 🚀
