const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const sourceDir = '/media/leonidas/Backup/Augusto/Backup/Pictures/2023';
const destDir = '/media/leonidas/Backup/Augusto/Backup/Pictures/2023/Fotos';
const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.mov', '.mp4'];

async function copyFiles() {
    // List all files
    const entries = await fg('**', {
        cwd: sourceDir,
        onlyFiles: true,
        extglob: true,
        caseSensitiveMatch: false,
    });

    // Filter files by valid extensions
    const filesToCopy = entries.filter(file => {
        const ext = path.extname(file);
        return validExtensions.includes(ext.toLowerCase());
    });

    console.log(`Total de arquivos encontrados: ${filesToCopy.length}`);

    // Copy files one by one
    for (let i = 0; i < filesToCopy.length; i++) {
        const file = filesToCopy[i];
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, path.basename(file));

        await fs.copy(sourcePath, destPath);

        const progress = ((i + 1) / filesToCopy.length) * 100;
        console.log(`Copiando arquivo ${sourcePath} para ${destPath} (${progress.toFixed(2)}%)`);
    }

    console.log('Cópia concluída.');
}

copyFiles();
