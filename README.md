
#  Lexical Rich Text Editor

A modern **rich text editor** built using [Lexical](https://lexical.dev/), featuring custom hooks, real-time WebSocket support, and state management with Redux. The editor also persists data locally in the browser (via `localStorage`) for offline use.

This project is designed to be extensible — in the future, authentication and MongoDB integration can be added to support user accounts and persistent cloud storage.

---

##  Features

*  **Lexical-powered Editor** – Google Docs–style rich text editing
*  **Custom Hooks** – Modular, reusable logic for editor functionality
*  **WebSockets** – Real-time collaboration (multi-user editing, live updates)
*  **Redux Toolkit** – Centralized state management
*  **Local Storage** – Saves editor state automatically for persistence
*  **Future Ready** – Easily extendable with authentication & MongoDB

---

## Tech Stack

* **Frontend Framework**: React (Vite / CRA depending on setup)
* **Editor**: [Lexical](https://lexical.dev/)
* **State Management**: Redux Toolkit
* **Networking**: WebSockets
* **Storage**: LocalStorage (future: MongoDB + Authentication)

---



## Installation & Setup

1. Clone the repo:

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run locally:

   ```bash
   npm run dev  
   ```

4. Open in browser:

   ```
   http://localhost:5173  # (Vite default) 
   ```

---

## Usage

* Start typing in the editor and format using the toolbar (bold, italic, headings, lists, links, etc.).
* Data is auto-saved in local storage — refreshing won’t lose your progress.
* With WebSockets enabled, multiple users can edit together in real time.

---

## Roadmap

* [ ] Authentication (JWT / OAuth)
* [ ] User accounts & sessions
* [ ] MongoDB storage for long-term persistence
* [ ] File & image uploads
* [ ] Collaborative cursors & presence indicators

---

## Contributing

Pull requests and suggestions are welcome! If you’d like to contribute, please fork the repo and open a PR.

---

##  License

MIT License © 2025

---

