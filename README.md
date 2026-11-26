# Stockly - Inventory Management System

Stockly is a simple, browser-based inventory management system for small shops, school canteens and local stores. It replaces paper registers with a clean page where products and stock levels can be recorded, searched and kept up to date. It is built with plain HTML, CSS and JavaScript and needs no installation or internet connection.

## Purpose

Small businesses often track stock on paper or from memory, which leads to counting mistakes, missed low-stock items and wasted time. Stockly keeps all product records in one place, calculates stock value automatically and warns when items are running out.

## Features

- Add, edit and delete products (ID, name, category, quantity, price)
- Quick `+` and `-` buttons to adjust a product's stock
- Search by product name, ID or category
- Filter by category or show low-stock items only
- Automatic value for each product and total stock value
- Summary line showing number of products, units in stock, total value and low-stock count
- Low-stock and out-of-stock highlighting (stock of 10 or fewer is "low")
- Data saved in the browser's Local Storage, so it is still there after closing the page
- Input validation and a duplicate Product ID check
- Responsive layout that works on desktop, tablet and phone

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla, no libraries)
- Browser Local Storage

## Project Structure

```
inventory-system/
├── index.html    page structure
├── style.css     styling and layout
├── script.js     program logic
└── README.md
```

## How to Run

1. Download or copy the project folder.
2. Double-click `index.html` to open it in a web browser (Chrome, Edge or Firefox).
3. Start adding products. Sample products are shown the first time so the page is not empty.

No server or setup is required.

## How to Use

1. Click **Add product**, fill in the form and click **Save product**.
2. Use the search box, category list or **Low stock only** to find products.
3. Click **Edit** to change a product or **Delete** to remove it.
4. Use `+` and `-` beside the quantity for quick stock changes.

## Customising

At the top of `script.js` two values can be changed:

- `LOW_STOCK_LIMIT` - quantity at or below which a product is marked low (default 10)
- `CURRENCY` - currency symbol shown for prices (default `$`)

## Notes

Data is stored only in the browser being used. Clearing the browser's site data will remove the records.
