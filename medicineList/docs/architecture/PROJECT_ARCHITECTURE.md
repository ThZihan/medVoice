# Medicine List Generator - System Architecture

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[User Interface]
        HTML[HTML5 Pages]
        CSS[Modern Brutalist CSS]
        JS[JavaScript Modules]
    end

    subgraph "Frontend Modules"
        AUTH[auth.js - Authentication]
        SCRIPT[script.js - Core Logic]
        OCR[ocr.js - OCR Scanner]
        COLORS[colors.js - Color System]
        MEDICINES[medicines.js - Database]
    end

    subgraph "Backend Layer - Django"
        VIEWS[views.py - API Endpoints]
        MODELS[models.py - Database Models]
        ADMIN[admin.py - Admin Panel]
    end

    subgraph "External Services"
        GEMINI[Google Gemini 2.5 Flash API]
        JSPDF[jsPDF Library]
    end

    subgraph "Data Layer"
        SQLITE[(SQLite Database)]
        SESSION[(Session Storage)]
    end

    UI --> HTML
    UI --> CSS
    UI --> JS

    JS --> AUTH
    JS --> SCRIPT
    JS --> OCR
    JS --> COLORS
    JS --> MEDICINES

    AUTH --> VIEWS
    SCRIPT --> VIEWS
    OCR --> GEMINI
    OCR --> VIEWS
    COLORS --> VIEWS
    MEDICINES --> VIEWS

    VIEWS --> MODELS
    VIEWS --> ADMIN

    MODELS --> SQLITE
    VIEWS --> SESSION

    SCRIPT --> JSPDF

    style UI fill:#e1f5ff
    style VIEWS fill:#fff4e1
    style MODELS fill:#ffe1e1
    style GEMINI fill:#e1ffe1
    style JSPDF fill:#f0e1ff
```

---

## 🔄 User Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Login
    participant Dashboard
    participant API
    participant DB

    User->>Login: Enter credentials
    Login->>API: POST /api/login/
    API->>DB: Verify user
    DB-->>API: User data
    API-->>Login: Success + token
    Login-->>User: Redirect to Dashboard

    User->>Dashboard: View medicines
    Dashboard->>API: GET /api/medicines/
    API->>DB: Fetch user medicines
    DB-->>API: Medicine list
    API-->>Dashboard: JSON response
    Dashboard-->>User: Display medicines

    User->>Dashboard: Add medicine
    Dashboard->>API: POST /api/medicines/
    API->>DB: Create medicine record
    DB-->>API: Success
    API-->>Dashboard: Confirmation
    Dashboard-->>User: Update list

    User->>Dashboard: Generate PDF
    Dashboard->>Dashboard: Generate with jsPDF
    Dashboard-->>User: Download PDF
```

---

## 🎨 Color System Architecture

```mermaid
graph LR
    subgraph "Base Colors"
        M[Morning<br/>#72CB92]
        N[Noon<br/>#D79E63]
        G[Night<br/>#7DA7D7]
    end

    subgraph "Combined Colors"
        MN[Morning + Noon]
        MG[Morning + Night]
        NG[Noon + Night]
        ALL[All Day<br/>3-way blend]
    end

    subgraph "Variations"
        V1[Base Shade]
        V2[Variation 1<br/>15% darker]
        V3[Variation 2<br/>30% darker]
        V4[Variation 3<br/>45% darker]
    end

    M --> MN
    M --> MG
    N --> MN
    N --> NG
    G --> MG
    G --> NG

    M --> ALL
    N --> ALL
    G --> ALL

    MN --> V1
    MN --> V2
    MN --> V3
    MN --> V4

    style M fill:#72CB92
    style N fill:#D79E63
    style G fill:#7DA7D7
```

---

## 📊 Database Schema

```mermaid
erDiagram
    USER ||--|| PATIENT : "has"
    PATIENT ||--o{ USER_MEDICINE : "owns"
    USER ||--|| USER_COLOR_PREFERENCES : "has"
    GLOBAL_MEDICINE ||--o{ USER_MEDICINE : "references"

    USER {
        int id PK
        string username UK
        string password
        string first_name
        string last_name
        string email
    }

    PATIENT {
        int user_id PK, FK
        int age
        string email
    }

    USER_MEDICINE {
        int id PK
        int patient_id FK
        string medicine_name
        string generic_name
        string dose
        string instructions
        string cycle
        string schedule
        string with_food
        string indication
    }

    USER_COLOR_PREFERENCES {
        int user_id PK, FK
        string palette_type
        string morning_color
        string noon_color
        string night_color
        string morning_noon_color
        string morning_night_color
        string noon_night_color
        string all_day_color
        boolean custom_morning_noon
        boolean custom_morning_night
        boolean custom_noon_night
        boolean custom_all_day
        datetime updated_at
    }

    GLOBAL_MEDICINE {
        int id PK
        string medicine_name
        string generic_name
        string indication
    }
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Client Side"
        BROWSER[Web Browser]
        SESSION[Session Cookie]
    end

    subgraph "Security Layers"
        CSRF[CSRF Protection]
        AUTH[Authentication Middleware]
        PERM[Permission Checks]
        VALID[Input Validation]
    end

    subgraph "Server Side"
        DJANGO[Django Framework]
        ORM[Django ORM]
        DB[(Database)]
    end

    BROWSER --> SESSION
    BROWSER -->|Request| CSRF
    CSRF --> AUTH
    AUTH --> PERM
    PERM --> VALID
    VALID --> DJANGO
    DJANGO --> ORM
    ORM --> DB

    style CSRF fill:#ffe1e1
    style AUTH fill:#fff4e1
    style PERM fill:#e1ffe1
    style VALID fill:#e1f5ff
```

---

## 📱 Component Architecture

```mermaid
graph TB
    subgraph "Application Components"
        AUTH_COMP[Authentication Component]
        PROFILE[Profile Component]
        MED_FORM[Medicine Form]
        MED_LIST[Medicine List]
        OCR_COMP[OCR Scanner]
        COLOR_PICK[Color Picker]
        PDF_GEN[PDF Generator]
    end

    subgraph "Shared Services"
        API[API Service]
        STORAGE[Storage Service]
        VALIDATOR[Form Validator]
    end

    AUTH_COMP --> API
    AUTH_COMP --> STORAGE

    PROFILE --> API
    PROFILE --> VALIDATOR

    MED_FORM --> API
    MED_FORM --> VALIDATOR
    MED_FORM --> STORAGE

    MED_LIST --> API
    MED_LIST --> STORAGE

    OCR_COMP --> API
    OCR_COMP --> STORAGE

    COLOR_PICK --> API
    COLOR_PICK --> STORAGE

    PDF_GEN --> STORAGE

    style AUTH_COMP fill:#e1f5ff
    style MED_FORM fill:#fff4e1
    style OCR_COMP fill:#e1ffe1
    style PDF_GEN fill:#f0e1ff
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV[Local Machine]
        SQLITE_DEV[(SQLite)]
        DJANGO_DEV[Django Dev Server]
    end

    subgraph "Production - PythonAnywhere"
        PA[PythonAnywhere]
        MYSQL[(MySQL)]
        GUNICORN[Gunicorn WSGI]
        NGINX[Nginx Reverse Proxy]
    end

    subgraph "Production - Render"
        RENDER[Render Platform]
        POSTGRES[(PostgreSQL)]
        RENDER_WEB[Render Web Service]
    end

    subgraph "Production - Fly.io"
        FLY[Fly.io]
        DOCKER[Docker Container]
        FLY_DB[(Fly.io Postgres)]
    end

    DEV -->|Deploy| PA
    DEV -->|Deploy| RENDER
    DEV -->|Deploy| FLY

    PA --> GUNICORN
    GUNICORN --> MYSQL
    NGINX --> GUNICORN

    RENDER --> RENDER_WEB
    RENDER_WEB --> POSTGRES

    FLY --> DOCKER
    DOCKER --> FLY_DB

    style PA fill:#ffe1e1
    style RENDER fill:#e1ffe1
    style FLY fill:#e1f5ff
```

---

## 📡 API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Middleware
    participant View
    participant Model
    participant Database

    Client->>Router: HTTP Request
    Router->>Middleware: Pass request
    Middleware->>Middleware: CSRF Check
    Middleware->>Middleware: Auth Check
    Middleware->>View: Authenticated Request
    View->>Model: Query/Save Data
    Model->>Database: SQL Operation
    Database-->>Model: Result
    Model-->>View: Data/Status
    View-->>Middleware: JSON Response
    Middleware-->>Client: HTTP Response
```

---

## 🎯 Feature Dependency Graph

```mermaid
graph TB
    AUTH[Authentication]
    PROFILE[User Profile]
    MED[Medicine Management]
    OCR[OCR Scanner]
    COLORS[Color System]
    PDF[PDF Generation]

    AUTH --> PROFILE
    AUTH --> MED
    AUTH --> COLORS
    PROFILE --> MED
    MED --> PDF
    MED --> OCR
    COLORS --> PDF
    OCR --> MED

    style AUTH fill:#ffe1e1
    style MED fill:#fff4e1
    style OCR fill:#e1ffe1
    style PDF fill:#f0e1ff
```

---

## 📦 Module Dependencies

```mermaid
graph LR
    subgraph "Frontend Dependencies"
        AUTH_JS[auth.js]
        SCRIPT_JS[script.js]
        OCR_JS[ocr.js]
        COLORS_JS[colors.js]
        MED_JS[medicines.js]
        CONFIG_JS[config.js]
    end

    subgraph "External Libraries"
        JSPDF[jsPDF]
        JSPDF_AUTO[jsPDF-AutoTable]
        GEMINI_API[Gemini API]
    end

    AUTH_JS --> CONFIG_JS
    SCRIPT_JS --> CONFIG_JS
    SCRIPT_JS --> MED_JS
    OCR_JS --> CONFIG_JS
    OCR_JS --> GEMINI_API
    COLORS_JS --> CONFIG_JS
    SCRIPT_JS --> JSPDF
    SCRIPT_JS --> JSPDF_AUTO

    style JSPDF fill:#f0e1ff
    style GEMINI_API fill:#e1ffe1
```

---

## 🔄 Data Flow: OCR to Medicine List

```mermaid
flowchart TD
    START[User Uploads Image] --> UPLOAD[Display Preview]
    UPLOAD --> SCAN[Click Scan Button]
    SCAN --> API_CALL[Call Gemini API]
    API_CALL -->|Success| PARSE[Parse JSON Response]
    API_CALL -->|Error| ERROR_MSG[Show Error Message]
    PARSE --> EXTRACTED[Display Extracted Medicines]
    EXTRACTED --> REVIEW{Review & Edit}
    REVIEW -->|Add All| ADD_ALL[Batch Add to List]
    REVIEW -->|Add Individual| ADD_ONE[Add Single Medicine]
    REVIEW -->|Remove| REMOVE[Remove from Extracted]
    ADD_ALL --> MED_LIST[Update Medicine List]
    ADD_ONE --> MED_LIST
    REMOVE --> EXTRACTED
    MED_LIST --> SAVE[Save to Database]
    SAVE --> COMPLETE[Display Updated List]

    style API_CALL fill:#e1ffe1
    style MED_LIST fill:#fff4e1
    style COMPLETE fill:#e1f5ff
```

---

## 🎨 UI Component Hierarchy

```mermaid
graph TB
    APP[Medicine List Generator App]

    subgraph "Pages"
        LOGIN[Login Page]
        DASHBOARD[Dashboard Page]
    end

    subgraph "Dashboard Components"
        HEADER[Header]
        QUICK_ACTIONS[Quick Actions]
        PATIENT_INFO[Patient Information]
        MED_FORM[Medicine Form]
        MED_LIST[Medicine List]
        COLOR_MODAL[Color Settings Modal]
        OCR_MODAL[OCR Scanner Modal]
        EDIT_MODAL[Edit Medicine Modal]
    end

    subgraph "Header Elements"
        TITLE[App Title]
        COLOR_BTN[Color Button]
        LOGOUT_BTN[Logout Button]
    end

    subgraph "Form Elements"
        MED_NAME[Medicine Name + Autocomplete]
        GENERIC[Generic Name]
        DOSE[Dosage]
        TIMING[Timing Selection]
        FREQUENCY[Frequency]
        FOOD[With Food]
        INDICATION[Used For]
        REMARKS[Instructions]
        ACTIONS[Add/Clear Buttons]
    end

    APP --> LOGIN
    APP --> DASHBOARD
    DASHBOARD --> HEADER
    DASHBOARD --> QUICK_ACTIONS
    DASHBOARD --> PATIENT_INFO
    DASHBOARD --> MED_FORM
    DASHBOARD --> MED_LIST
    DASHBOARD --> COLOR_MODAL
    DASHBOARD --> OCR_MODAL
    DASHBOARD --> EDIT_MODAL

    HEADER --> TITLE
    HEADER --> COLOR_BTN
    HEADER --> LOGOUT_BTN

    MED_FORM --> MED_NAME
    MED_FORM --> GENERIC
    MED_FORM --> DOSE
    MED_FORM --> TIMING
    MED_FORM --> FREQUENCY
    MED_FORM --> FOOD
    MED_FORM --> INDICATION
    MED_FORM --> REMARKS
    MED_FORM --> ACTIONS

    style APP fill:#e1f5ff
    style DASHBOARD fill:#fff4e1
    style MED_FORM fill:#e1ffe1
```

---

## 📊 Statistics & Metrics

```mermaid
pie title Code Distribution by Module
    "Backend (views.py)" : 888
    "Frontend (script.js)" : 1737
    "Frontend (ocr.js)" : 902
    "Frontend (colors.js)" : 553
    "Frontend (auth.js)" : 282
    "Frontend (medicines.js)" : 134
    "Frontend (styles.css)" : 2042
    "HTML (index.html)" : 486
    "HTML (login.html)" : 304
```

---

**Document Version**: 1.0.0
**Last Updated**: February 2026
