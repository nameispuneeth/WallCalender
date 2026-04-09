# Wall Calendar – Interactive React Component

An interactive, responsive **wall calendar component** built with React, inspired by a physical hanging calendar design.
This project was developed as part of a **Frontend Engineering Challenge**, focusing on UI/UX, state management, and responsive design.

---

##  Live Demo

🔗 https://wall-calender-assignmentby-tuf.vercel.app

---

## Objective

The goal of this project was to transform a **static wall calendar design** into a **fully functional, interactive web component** while maintaining:

* Visual appeal (real-world calendar aesthetic)
* Smooth user interaction
* Clean and scalable frontend architecture


---

## Screenshots
<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/97930415-4ed2-4d27-a246-457bf6f3a0f5" />
<img width="385" height="679" alt="image" src="https://github.com/user-attachments/assets/a2aef5d8-8695-46e1-85ad-c70f2ab78d10" />
<img width="1900" height="845" alt="image" src="https://github.com/user-attachments/assets/c1bd85d6-ad67-4786-b505-a3ee3a2d4289" />
<img width="1905" height="858" alt="image" src="https://github.com/user-attachments/assets/592343b1-1fd4-4907-9800-5878d64227b7" />


---

##  Features

### Wall Calendar Aesthetic

* Designed to resemble a **physical wall calendar**
* Includes a **hero image section** paired with the monthly grid
* Balanced layout between visuals and functionality

---

###  Day Range Selection

* Select **start date** and **end date**
* Visual states for:

  * Start date
  * End date
  * Dates in between
* Supports intuitive click-based interaction

---

###  Integrated Notes System

* Add notes linked to selected date ranges
* Notes are stored using **localStorage**
* Persistent across page reloads

---

###  Fully Responsive Design

* **Desktop:**

  * Structured layout with clear separation (image + calendar + notes)
* **Mobile:**

  * Stacked layout
  * Touch-friendly interactions
  * Fully usable selection and notes system

---

## Tech Stack

* **React.js**
* **JavaScript (ES6+)**
* **Tailwind CSS / CSS**
* **localStorage** (for persistence)

---

##  Key Implementation Details

### State Management

* Managed using React state hooks
* Tracks:

  * Selected date range
  * Notes input
  * Active range key

---

###  Notes Storage Logic

* Notes are stored as key-value pairs:

```js
{
  "range-startDate-endDate": "note content"
}
```

* Ensures:

  * Unique mapping per date range
  * Persistent storage using `localStorage`

---

### Range Selection Logic

* First click → Start date
* Second click → End date
* Automatically highlights:

  * Entire selected range
  * Boundary dates

---

##  Project Structure

```
src/
│── components/
│   ├── Calendar.jsx
│   ├── Notes.jsx
│   └── Hero.jsx
│
│── utils/
│   └── dateHelpers.js
│
│── App.jsx
│── index.js
```



```
## Installation & Setup

Clone the repository:

```bash
git clone https://github.com/nameispuneeth/wallcalender.git
cd wallcalender
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

##  Demo Video (Required)

 Add your demo video link here (Loom / YouTube)

```
Demo: [Paste Link Here]
```

---

##  Future Improvements

*  Reminder system
*  Monthly analytics / insights
*  Cloud sync (backend integration)
*  Dynamic theme based on image

---

## Evaluation Focus

This project emphasizes:

* Component architecture
* Clean and maintainable code
* UI/UX attention to detail
* Responsive design handling
* Efficient state management

---

##  Acknowledgment

This project was built as part of a **Frontend Engineering Challenge**, focusing purely on frontend capabilities without backend dependencies.

---

## 📬 Contact

* GitHub: https://github.com/nameispuneeth
* LinkedIn: https://www.linkedin.com/in/puneeth0121/

---

⭐ If you like this project, consider giving it a star!
