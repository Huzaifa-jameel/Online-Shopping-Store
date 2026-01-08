# Online Shopping Store

An example e-commerce website built with HTML, CSS, JavaScript and PHP. This repository contains the frontend pages (shop, product, blog, cart, wishlist, etc.), styles, images, and a PHP backend for server-side features plus a SQL dump to create the project database.

Live demo: (none included) — to run locally follow the setup below.

## Key features
- Product listing and single product pages
- Shopping cart and checkout flow (thank-you page)
- Wishlist and blog pages
- User login page and basic PHP backend for sessions/auth (see `php/` folder)
- Admin area (in `admin/`) for managing the store (files included)
- SQL file to create the database schema and sample data (`database.sql`)
- Includes styling (`style.css`, `css/`), scripts (`js/`), icons (`icomoon/`) and images (`images/`)

## Languages and composition
- HTML: main markup for pages (index.html, shop.html, single-product.html, etc.)
- CSS: styling and layout (style.css and `css/`)
- JavaScript: client-side interactions (`js/`)
- PHP: server-side logic located in `php/`
- Database: MySQL schema and sample data (`database.sql`)

## Repository layout (high-level)
- index.html — Home page
- shop.html — Product listing
- single-product.html — Product detail page
- cart.html, wishlist.html, checkout/thank-you page
- login.html — User login page
- admin/ — Admin pages (manage products/orders/users)
- php/ — PHP backend (database connection, session handling, server endpoints)
- css/ and style.css — Styles
- js/ — Client scripts
- images/ — Image assets
- database.sql — MySQL dump to create schema & sample data
- xampp_import_guide.md — Quick guide to import DB using XAMPP

## Requirements
- PHP (recommended PHP 7.4+)
- MySQL / MariaDB
- Apache (or any PHP-capable web server)
- XAMPP (recommended for local development on Windows) or LAMP/MAMP

## Quick local setup (XAMPP)
1. Install XAMPP (or MAMP/LAMP) and start Apache + MySQL.
2. Copy the repository into your webroot:
   - XAMPP (Windows): copy files to C:\xampp\htdocs\Online-Shopping-Store
   - MAMP (macOS): copy files to /Applications/MAMP/htdocs/Online-Shopping-Store
3. Create the database:
   - Using phpMyAdmin: open http://localhost/phpmyadmin, create a database (e.g., `online_store`) and import `database.sql`.
   - Or command line:
     - Open terminal / cmd and run:
       mysql -u root -p
       CREATE DATABASE online_store;
       USE online_store;
       SOURCE path/to/database.sql;
4. Configure database credentials:
   - Open the PHP config/connection file in `php/`. Common filenames include `config.php`, `db.php`, `connection.php` — search for DB host/user/password if unsure.
   - Update DB_HOST (usually `localhost`), DB_NAME (`online_store` or your chosen name), DB_USER (`root` for default XAMPP), and DB_PASS (empty for default XAMPP).
5. Access the site:
   - Visit http://localhost/Online-Shopping-Store/ (or the path where you placed the files).
6. Admin / login:
   - Use the credentials present in the database sample (check `database.sql` for user entries) or create an admin user directly in phpMyAdmin.

If you prefer, follow the included `xampp_import_guide.md` for step-by-step screenshots and extra tips.

## Common adjustments & troubleshooting
- Blank pages or PHP errors: ensure Apache serves PHP files and error display is enabled while developing. Check Apache error logs.
- DB connection errors: confirm credentials and database name, ensure MySQL is running.
- Pretty URLs / routing: this project is file-based; if you add rewriting or a framework, configure `.htaccess` as needed.
- Missing images/CSS/JS: ensure asset paths are preserved and `images/`, `css/`, `js/` directories are in the webroot.

## Recommended improvements
- Add environment configuration (e.g., `.env`) and a single `php/config.php` that reads it.
- Secure user authentication (password hashing, prepared statements).
- Move inline SQL to migrations or seeders for repeatable setup.
- Add automated tests for PHP endpoints (PHPUnit) and CI for linting.
- Add a LICENSE file (MIT recommended if you want an open source license).
- Provide a demo or screenshots in the README.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/awesome`
3. Make changes and commit with clear messages
4. Open a pull request describing your changes

Please open issues for bugs or feature requests.

## Adding this README to the repo
You can add this file as `README.md` to the repository root. If you'd like, I can create a PR that adds this README and optionally a LICENSE file — tell me if you want me to proceed.

## Contact
Author: Huzaifa-jameel (repository owner)

---
Thank you — tell me if you want the README tweaked (shorter, more technical, include screenshots, badges, or specific admin credentials) and I will update it.
