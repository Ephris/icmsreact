# ICMS Project Setup Guide

## Internship and Career Management System

This guide provides step-by-step instructions for sharing and setting up the ICMS project.

---

## PART 1: YOUR SIDE (Sender Instructions)

### Step 0: Export Your Database

**IMPORTANT:** Before zipping, you need to export your database!

📖 **See `DATABASE_EXPORT_IMPORT.md` for detailed database export/import instructions.**

**Quick Summary:**
- **If using SQLite:** The `database/database.sqlite` file is already in your project folder - it will be included in the ZIP automatically.
- **If using MySQL:** Export your database using phpMyAdmin or mysqldump command (see `DATABASE_EXPORT_IMPORT.md` for details).

### Step 1: Prepare the Project for Sharing

Before zipping, make sure to clean up unnecessary files to reduce the zip size.

**Open your terminal in the project folder and run:**

```bash
# Remove node_modules (will be reinstalled by your friend)
rmdir /s /q node_modules

# Remove vendor folder (will be reinstalled by your friend)
rmdir /s /q vendor

# Remove compiled assets
rmdir /s /q public\build
```

Or on **Linux/Mac**:
```bash
rm -rf node_modules
rm -rf vendor
rm -rf public/build
```

### Step 2: Create the ZIP File

**Option A: Using File Explorer (Windows)**
1. Navigate to your project folder: `C:\Users\User\icmss\last\icms\icmsreact`
2. Select the entire `icmsreact` folder
3. Right-click → "Send to" → "Compressed (zipped) folder"
4. Rename the zip file to `icms-project.zip`

**Option B: Using Command Line (Windows PowerShell)**
```powershell
cd C:\Users\User\icmss\last\icms
Compress-Archive -Path .\icmsreact -DestinationPath icms-project.zip
```

**Option C: Using Command Line (Linux/Mac)**
```bash
cd /path/to/project/parent
zip -r icms-project.zip icmsreact -x "icmsreact/node_modules/*" -x "icmsreact/vendor/*"
```

### Step 3: Share the ZIP File

Send the `icms-project.zip` file to your friend via:
- Google Drive
- Dropbox
- WeTransfer
- USB Drive
- Any file sharing service

---

## PART 2: YOUR FRIEND'S SIDE (Receiver Instructions)

### Prerequisites - Install These FIRST (Before Extracting)

Your friend needs to install the following software before setting up the project:

#### 1. PHP 8.1 or Higher

**Windows (Using XAMPP - Recommended):**
1. Download XAMPP from: https://www.apachefriends.org/download.html
2. Install XAMPP (select PHP 8.1+)
3. Add PHP to system PATH:
   - Open "Environment Variables"
   - Add `C:\xampp\php` to the PATH variable

**Verify PHP Installation:**
```bash
php -v
```
Expected output: `PHP 8.1.x` or higher

#### 2. Composer (PHP Package Manager)

**Windows:**
1. Download Composer from: https://getcomposer.org/download/
2. Run the installer
3. Follow the installation wizard

**Verify Composer Installation:**
```bash
composer -V
```
Expected output: `Composer version 2.x.x`

#### 3. Node.js 18+ and NPM

**Windows/Mac/Linux:**
1. Download Node.js from: https://nodejs.org/
2. Choose the LTS version (18.x or higher)
3. Run the installer

**Verify Node.js Installation:**
```bash
node -v
npm -v
```
Expected output: `v18.x.x` or higher for Node, `9.x.x` or higher for npm

#### 4. MySQL Database

**Option A: Using XAMPP (If already installed)**
- XAMPP includes MySQL/MariaDB
- Start MySQL from XAMPP Control Panel

**Option B: Standalone MySQL**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install and note down root password

**Create a Database:**
1. Open phpMyAdmin (http://localhost/phpmyadmin) or MySQL command line
2. Create a new database named `icms` (or any name you prefer)

```sql
CREATE DATABASE icms;
```

---

### Step-by-Step Setup Instructions

Follow these steps IN ORDER after installing all prerequisites:

---

#### STEP 1: Extract the ZIP File

1. Create a folder where you want to place the project (e.g., `C:\Projects\` or `D:\Dev\`)
2. Extract `icms-project.zip` to that folder
3. You should now have a folder like `C:\Projects\icmsreact`

---

#### STEP 2: Open Terminal in Project Folder

**Windows:**
1. Open the extracted `icmsreact` folder
2. Hold `Shift` + Right-click in empty space
3. Select "Open PowerShell window here" or "Open in Terminal"

**Or using Command Prompt:**
```bash
cd C:\Projects\icmsreact
```

---

#### STEP 3: Install PHP Dependencies

Run this command to install all PHP packages:

```bash
composer install
```

Wait for the installation to complete. This may take 2-5 minutes.

---

#### STEP 4: Install Node.js Dependencies

Run this command to install all JavaScript packages:

```bash
npm install
```

Wait for the installation to complete. This may take 3-7 minutes.

---

#### STEP 5: Create Environment File

Copy the example environment file:

**Windows (Command Prompt):**
```bash
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

---

#### STEP 6: Import the Database

**IMPORTANT:** If your friend shared a database file, import it BEFORE running migrations!

📖 **See `DATABASE_EXPORT_IMPORT.md` for detailed database import instructions.**

**Quick Summary:**
- **If using SQLite:** Copy `database.sqlite` file to the `database/` folder
- **If using MySQL:** Import the SQL file using phpMyAdmin or mysql command

#### STEP 7: Configure Database in .env File

**IMPORTANT: Do this BEFORE running migrations!**

1. Open the `.env` file in a text editor (Notepad, VS Code, etc.)

**If using SQLite (Simpler - Recommended for beginners):**
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```
(No need for DB_HOST, DB_USERNAME, or DB_PASSWORD)

**If using MySQL:**
Find these lines and update them with YOUR database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=icms
DB_USERNAME=root
DB_PASSWORD=
```

**Change these values:**
- `DB_DATABASE=icms` → Change `icms` to your database name
- `DB_USERNAME=root` → Change `root` to your MySQL username
- `DB_PASSWORD=` → Add your MySQL password (if you have one)

**Example with password:**
```env
DB_DATABASE=my_icms_database
DB_USERNAME=root
DB_PASSWORD=mypassword123
```

**Save the file after editing!**

---

#### STEP 8: Generate Application Key

Run this command to generate a unique application key:

```bash
php artisan key:generate
```

You should see: `Application key set successfully.`

---

#### STEP 9: Create Storage Link

Run this command to create the storage symbolic link:

```bash
php artisan storage:link
```

You should see: `The [public/storage] link has been created.`

---

#### STEP 10: Run Database Migrations

**If you imported a database file, you can skip this step!**

**If you're starting fresh (no database imported):**

**Make sure your MySQL server is running (if using MySQL)!**

Run this command to create all database tables:

```bash
php artisan migrate
```

If asked "Do you really wish to run this command?", type `yes` and press Enter.

**Note:** If you imported a database, you might see "Nothing to migrate" - that's fine!

---

#### STEP 11: Seed the Database (Optional - Only if starting fresh)

**Skip this if you imported a database with data!**

Run this command to add initial data (only if database is empty):

```bash
php artisan db:seed
```

---

#### STEP 12: Start the Development Server

**IMPORTANT: Use this command to run the project:**

```bash
composer run dev
```

**DO NOT use `php artisan serve` alone!**

The `composer run dev` command runs both:
- PHP backend server
- Vite frontend development server

---

#### STEP 13: Open the Application

Once the server starts, you should see output like:
```
VITE ready in xxx ms
Laravel development server started: http://127.0.0.1:8000
```

Open your browser and go to:
```
http://127.0.0.1:8000
```
or
```
http://localhost:8000
```

---

## Quick Reference - All Commands in Order

```bash
# 1. Navigate to project folder
cd path/to/icmsreact

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Create environment file
copy .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. IMPORT DATABASE (if friend shared one) - See DATABASE_EXPORT_IMPORT.md

# 7. EDIT .env FILE - Configure your database settings!

# 8. Generate application key
php artisan key:generate

# 9. Create storage link
php artisan storage:link

# 10. Run migrations (skip if you imported database)
php artisan migrate

# 11. Seed database (optional, skip if you imported database)
php artisan db:seed

# 12. Start development server
composer run dev
```

---

## Troubleshooting Common Issues

### Issue 1: "php is not recognized as a command"
**Solution:** PHP is not in your system PATH
- Add PHP to PATH environment variable
- Restart your terminal after adding

### Issue 2: "composer is not recognized as a command"
**Solution:** Composer is not installed or not in PATH
- Reinstall Composer
- Restart your terminal

### Issue 3: "SQLSTATE[HY000] [1049] Unknown database"
**Solution:** Database doesn't exist
- Create the database in phpMyAdmin or MySQL
- Make sure the database name in `.env` matches

### Issue 4: "SQLSTATE[HY000] [2002] Connection refused"
**Solution:** MySQL is not running
- Start MySQL from XAMPP Control Panel
- Or start MySQL service manually

### Issue 5: "npm ERR! code ENOENT"
**Solution:** Node.js not installed properly
- Reinstall Node.js
- Restart your terminal

### Issue 6: "Vite manifest not found"
**Solution:** Frontend assets not built
- Run `npm run build` or use `composer run dev`

### Issue 7: Port 8000 already in use
**Solution:** Another application is using port 8000
- Close other applications using that port
- Or use a different port: `php artisan serve --port=8080`

---

## Stopping the Server

To stop the development server:
- Press `Ctrl + C` in the terminal

---

## Additional Commands

### Clear Cache (If having issues):
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### Fresh Migration (Reset database):
```bash
php artisan migrate:fresh --seed
```
**Warning:** This will delete all data!

### Build for Production:
```bash
npm run build
```

---

## Project Structure

```
icmsreact/
├── app/                  # PHP application code
├── bootstrap/            # Framework bootstrap files
├── config/               # Configuration files
├── database/             # Migrations and seeders
├── node_modules/         # JavaScript packages (auto-generated)
├── public/               # Public assets
├── resources/            # Views, JS, CSS files
├── routes/               # Application routes
├── storage/              # File storage
├── vendor/               # PHP packages (auto-generated)
├── .env                  # Environment configuration
├── .env.example          # Example environment file
├── composer.json         # PHP dependencies
├── package.json          # Node.js dependencies
└── vite.config.js        # Vite configuration
```

---

## Support

If you encounter any issues not covered in this guide, check:
1. Laravel documentation: https://laravel.com/docs
2. Inertia.js documentation: https://inertiajs.com
3. React documentation: https://react.dev

---

**Good luck with your setup!** 🚀

