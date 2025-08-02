# 📝 Notion-like Notes System

A powerful, block-based note-taking system inspired by Notion, built with SAP UI5 and featuring real database storage.

![Notion Notes Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![SAP UI5](https://img.shields.io/badge/SAP%20UI5-1.138.1-blue)
![Database](https://img.shields.io/badge/Database-IndexedDB%2FSQLite-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🗄️ **Real Database Storage**
- **IndexedDB** for modern browsers (primary storage)
- **localStorage** fallback for compatibility
- **Persistent storage** across browser sessions
- **Fast retrieval** with indexed searches

### 🧱 **Block-Based Editor**
- **Multiple block types**: Headings (H1, H2, H3), Paragraphs, Lists, Todos, Quotes, Code
- **Dynamic block creation** with intuitive toolbar
- **Real-time editing** with live updates
- **Block reordering** with drag handles (ready for implementation)

### ⚡ **Real-time Features**
- **Auto-save** every 5 seconds (toggleable)
- **Live word/character counting**
- **Instant search** and filtering
- **Real-time data synchronization**

### 🎨 **Notion-inspired UI**
- **Clean, modern design** with professional typography
- **Responsive layout** for desktop, tablet, and mobile
- **Dark mode support** with CSS media queries
- **Smooth animations** and hover effects

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with IndexedDB support

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/anbumani1/notion-ongoing.git
cd notion-ongoing
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:4004/project1/webapp/index.html
```

## 📖 Usage Guide

### Creating Your First Note

1. **Open the Employee Dashboard**
2. **Click the "📝 Notes" button** in the navigation
3. **Click "+ Add Note"** to create a new note
4. **Start typing** - your note auto-saves every 5 seconds!

### Working with Blocks

#### Adding Blocks
- **Click "+ Add Block"** for a default paragraph
- **Use "Block Types" menu** for specific block types:
  - 📰 **Heading 1** - Main titles
  - 📄 **Heading 2** - Section headers  
  - 📃 **Heading 3** - Subsection headers
  - 📝 **Paragraph** - Regular text
  - • **Bullet List** - Unordered lists
  - 1. **Numbered List** - Ordered lists
  - ☐ **Todo** - Checkable tasks
  - 💬 **Quote** - Highlighted quotes
  - 💻 **Code** - Code snippets
  - ➖ **Divider** - Section separators

#### Editing Blocks
- **Click any block** to start editing
- **Type directly** in the block
- **Changes save automatically** every 5 seconds
- **Use drag handles** to reorder blocks (coming soon)

### Organization Features

#### Categories
- **Personal** - Private notes and thoughts
- **Work** - Professional notes and meetings
- **Projects** - Project planning and tracking
- **Ideas** - Creative concepts and brainstorming
- **Meeting Notes** - Meeting minutes and action items

#### Search & Filter
- **Search by title** or content
- **Filter by category** using the dropdown
- **Sort by date** (newest first)

## 🛠️ Technical Architecture

### Database Layer
```
📁 app/project1/webapp/service/
├── 📄 NotesDatabase.js     # Database abstraction layer
└── 📄 BlockManager.js      # Block CRUD operations
```

**NotesDatabase.js** - Handles all database operations:
- IndexedDB setup and management
- localStorage fallback
- CRUD operations for notes
- Data persistence and retrieval

**BlockManager.js** - Manages block operations:
- Block type definitions
- Block creation and updates
- Content rendering
- Markdown parsing

### UI Components
```
📁 app/project1/webapp/view/
└── 📄 NotesDialog.fragment.xml  # Main notes interface
```

**Features:**
- Responsive sidebar with notes list
- Block-based editor with toolbar
- Real-time editing interface
- Category and search filters

### Styling
```
📁 app/project1/webapp/css/
└── 📄 notion-notes.css     # Notion-inspired styling
```

**Design System:**
- Notion-inspired color palette
- Professional typography
- Responsive breakpoints
- Dark mode support
- Smooth animations

### Controller Logic
```
📁 app/project1/webapp/controller/
└── 📄 EmployeeDashboard.controller.js  # Enhanced with notes functionality
```

**Key Features:**
- Async database operations
- Real-time block rendering
- Auto-save functionality
- Event handling for all interactions

## 🎯 Block Types Reference

| Block Type | Icon | Description | Use Case |
|------------|------|-------------|----------|
| **Heading 1** | 📰 | Large title text | Main document titles |
| **Heading 2** | 📄 | Medium header | Section headers |
| **Heading 3** | 📃 | Small header | Subsection headers |
| **Paragraph** | 📝 | Regular text | Body content |
| **Bullet List** | • | Unordered list | Feature lists, ideas |
| **Numbered List** | 1. | Ordered list | Steps, procedures |
| **Todo** | ☐ | Checkable task | Action items, tasks |
| **Quote** | 💬 | Highlighted text | Important quotes |
| **Code** | 💻 | Code snippet | Code examples |
| **Divider** | ➖ | Section break | Visual separation |

## 🔧 Configuration

### Auto-save Settings
```javascript
// Default: Auto-save every 5 seconds
this._autoSaveInterval = 5000;

// Toggle auto-save
this._autoSaveEnabled = true;
```

### Database Configuration
```javascript
// IndexedDB database name
const DB_NAME = "NotionNotesDB";

// Database version
const DB_VERSION = 1;
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Notion** - Inspiration for the block-based editor design
- **SAP UI5** - Robust framework for enterprise applications
- **IndexedDB** - Client-side database for persistent storage

## 📞 Support

If you have any questions or need help:

1. **Check the documentation** above
2. **Open an issue** on GitHub
3. **Contact the maintainer** through GitHub

---

**Built with ❤️ using SAP UI5 and modern web technologies**

*Transform your note-taking experience with this powerful, Notion-inspired system!* 🚀
