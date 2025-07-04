# API Documentation - Mass File Copier

## Table of Contents
- [Overview](#overview)
- [Public APIs](#public-apis)
- [Functions](#functions)
- [Constants](#constants)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Dependencies](#dependencies)

## Overview

The Mass File Copier is a Node.js application that provides an interactive interface for copying media files from a source directory to a destination directory. It supports various image and video formats and includes features like duplicate handling, progress tracking, and file modification date comparison.

## Public APIs

### Main Entry Point
The application's main entry point is the `copyFiles()` function, which is automatically executed when the script runs.

## Functions

### `selectDirectories()`

**Description**: Prompts the user to select source and destination directories through an interactive file tree interface.

**Signature**: 
```javascript
async function selectDirectories()
```

**Parameters**: None

**Returns**: 
```javascript
Promise<{
  sourceDir: string,  // Path to the selected source directory
  destDir: string     // Path to the selected destination directory
}>
```

**Behavior**:
- Displays an interactive file tree for source directory selection
- Displays an interactive file tree for destination directory selection
- Requests user confirmation before proceeding
- Exits the process if user cancels the operation

**Example Usage**:
```javascript
const { sourceDir, destDir } = await selectDirectories();
console.log(`Source: ${sourceDir}`);
console.log(`Destination: ${destDir}`);
```

**User Interface Steps**:
1. Navigate using arrow keys (↑↓)
2. Press Enter to expand/enter directories
3. Press Space to select current directory
4. Confirm selection when prompted

---

### `copyFiles()`

**Description**: Main orchestration function that handles the complete file copying workflow from directory selection to file transfer completion.

**Signature**: 
```javascript
async function copyFiles()
```

**Parameters**: None

**Returns**: `Promise<void>`

**Workflow**:
1. **Directory Selection**: Calls `selectDirectories()` to get source and destination paths
2. **File Discovery**: Uses `fast-glob` to recursively find all files in the source directory
3. **File Filtering**: Filters files based on `validExtensions`
4. **User Confirmation**: Shows file count and requests confirmation to proceed
5. **File Processing**: Copies each file with duplicate handling and progress tracking
6. **Summary**: Displays operation summary upon completion

**File Processing Logic**:
- Creates destination directory if it doesn't exist
- Handles duplicate filenames by appending sequential numbers
- Compares modification dates for existing files
- Updates only newer files to avoid unnecessary overwrites
- Provides real-time progress feedback

**Example Console Output**:
```
Total de arquivos encontrados: 150
Progresso: 67.33% - Copiando: photo_1.jpg
Arquivo atualizado: video_2.mp4
Arquivo ignorado (já existe): image_old.png

Resumo da operação:
Total de arquivos processados: 150
Arquivos únicos: 147
Cópia concluída com sucesso!
```

**Error Handling**:
- Catches and logs errors during the copying process
- Gracefully handles file system errors
- Provides meaningful error messages to the user

---

## Constants

### `validExtensions`

**Description**: Array of supported file extensions for media files.

**Type**: `string[]`

**Value**: 
```javascript
['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.mov', '.mp4']
```

**Supported Categories**:
- **Images**: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff`, `.gif`
- **Videos**: `.mov`, `.mp4`

**Usage**: Files are filtered based on this array during the discovery phase. Only files with extensions matching these values (case-insensitive) will be processed.

---

## Usage Examples

### Basic Usage
```bash
# Install dependencies
npm install

# Run the application
npm run copy

# Or run directly
node index.js
```

### Programmatic Usage
If you want to use this as a module in another Node.js application:

```javascript
const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

// You can extract and use individual functions
async function copyMediaFiles(sourceDir, destDir) {
    // Ensure destination directory exists
    await fs.ensureDir(destDir);
    
    // Find all files
    const entries = await fg('**/*', {
        cwd: sourceDir,
        onlyFiles: true,
        extglob: true,
        caseSensitiveMatch: false,
    });
    
    // Filter by valid extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.mov', '.mp4'];
    const filesToCopy = entries.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return validExtensions.includes(ext);
    });
    
    // Copy files (simplified version)
    for (const file of filesToCopy) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, path.basename(file));
        await fs.copy(sourcePath, destPath);
    }
}
```

### Command Line Arguments
You can also provide directories as command line arguments:

```bash
# Using the example script
npm run example
# This runs: node index.js ./origem ./destino
```

**Note**: The current implementation doesn't process command line arguments, but they can be accessed via `process.argv` for custom implementations.

---

## Error Handling

### Common Errors and Solutions

1. **Permission Errors**:
   ```javascript
   // Error: EACCES: permission denied
   // Solution: Ensure read permissions on source and write permissions on destination
   ```

2. **Path Not Found**:
   ```javascript
   // Error: ENOENT: no such file or directory
   // Solution: Verify that selected directories exist and are accessible
   ```

3. **Insufficient Disk Space**:
   ```javascript
   // Error: ENOSPC: no space left on device
   // Solution: Check available disk space in destination directory
   ```

4. **File System Errors**:
   ```javascript
   try {
       await fs.copy(sourcePath, destPath);
   } catch (error) {
       console.error(`Failed to copy ${sourcePath}:`, error.message);
   }
   ```

### Error Recovery
The application includes several error recovery mechanisms:
- Continues processing other files if one file fails
- Provides detailed error messages
- Graceful exit on user cancellation
- Validation of directory selections

---

## Dependencies

### Core Dependencies

1. **fs-extra** (v11.1.1)
   - Enhanced file system operations
   - Used for: `copy()`, `ensureDir()`, `pathExists()`, `stat()`

2. **fast-glob** (v3.2.12)
   - Fast file system globbing
   - Used for: Recursive file discovery with pattern matching

3. **inquirer** (v8.2.5)
   - Interactive command line interface
   - Used for: User prompts and confirmations

4. **inquirer-file-tree-selection-prompt** (v1.0.19)
   - File tree selection prompt for inquirer
   - Used for: Interactive directory selection

5. **path** (v0.12.7)
   - Path manipulation utilities
   - Used for: File path operations and extension checking

### Installation
```bash
npm install fs-extra fast-glob inquirer inquirer-file-tree-selection-prompt path
```

### Version Compatibility
- Node.js: 12.0.0 or higher
- npm: 6.0.0 or higher

---

## Advanced Features

### Duplicate File Handling
The application automatically handles duplicate filenames by:
1. Tracking processed filenames in a `Map`
2. Appending sequential numbers to duplicates
3. Maintaining original file extensions

Example:
```
Original: photo.jpg
Duplicate 1: photo_2.jpg
Duplicate 2: photo_3.jpg
```

### File Update Logic
Files are only copied/updated when:
- The file doesn't exist in the destination
- The source file is newer than the destination file (based on `mtime`)

### Progress Tracking
Real-time progress includes:
- Percentage completion
- Current file being processed
- Total files found vs. processed
- Operation summary

### Memory Efficiency
The application processes files sequentially to:
- Avoid memory overflow with large file sets
- Provide consistent progress feedback
- Allow for interruption and recovery

---

## Customization Options

### Extending Supported File Types
To add support for additional file types, modify the `validExtensions` array:

```javascript
const validExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.webp', '.svg',
    // Videos  
    '.mov', '.mp4', '.avi', '.mkv', '.wmv', '.flv',
    // Documents
    '.pdf', '.doc', '.docx'
];
```

### Custom Glob Patterns
The file discovery can be customized by modifying the `fast-glob` options:

```javascript
const entries = await fg('**/*', {
    cwd: sourceDir,
    onlyFiles: true,
    extglob: true,
    caseSensitiveMatch: false,
    ignore: ['**/node_modules/**', '**/.git/**'], // Ignore certain directories
    followSymbolicLinks: false, // Don't follow symlinks
});
```

### Adding Logging
For production use, consider adding structured logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'file-copy.log' })
    ]
});
```

---

This documentation provides a comprehensive overview of the Mass File Copier's public APIs, functions, and components. For additional questions or feature requests, please refer to the project's README.md or create an issue in the project repository.