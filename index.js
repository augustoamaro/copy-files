const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');
const inquirer = require('inquirer');

inquirer.registerPrompt('file-tree-selection', require('inquirer-file-tree-selection-prompt'));

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.mov', '.mp4']);

function isSupportedMediaFile(filePath) {
    return VALID_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function selectDirectories() {
    const questions = [
        {
            type: 'file-tree-selection',
            name: 'sourceDir',
            message: 'Selecione o diretório de origem:',
            onlyShowDir: true,
            root: '/',
            onlyShowValid: true,
        },
        {
            type: 'file-tree-selection',
            name: 'destDir',
            message: 'Selecione o diretório de destino:',
            onlyShowDir: true,
            root: '/',
            onlyShowValid: true,
        },
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Confirma a cópia dos arquivos?',
            default: false,
        },
    ];

    const answers = await inquirer.prompt(questions);

    if (!answers.confirm) {
        console.log('Operação cancelada pelo usuário.');
        return null;
    }

    return {
        sourceDir: answers.sourceDir,
        destDir: answers.destDir,
    };
}

async function getMediaFiles(sourceDir) {
    const entries = await fg('**/*', {
        cwd: sourceDir,
        onlyFiles: true,
        extglob: true,
        caseSensitiveMatch: false,
    });

    return entries.filter(isSupportedMediaFile);
}

function buildUniqueDestinationPath(destDir, originalFileName, usedNames) {
    const extension = path.extname(originalFileName);
    const baseName = path.basename(originalFileName, extension);
    const currentCount = usedNames.get(originalFileName) || 0;

    if (currentCount === 0) {
        usedNames.set(originalFileName, 1);
        return path.join(destDir, originalFileName);
    }

    const uniqueName = `${baseName}_${currentCount}${extension}`;
    usedNames.set(originalFileName, currentCount + 1);

    return path.join(destDir, uniqueName);
}

async function copyIfNeeded(sourcePath, destPath) {
    if (!(await fs.pathExists(destPath))) {
        await fs.copy(sourcePath, destPath);
        return { status: 'copied', fileName: path.basename(destPath) };
    }

    const [sourceStats, destStats] = await Promise.all([fs.stat(sourcePath), fs.stat(destPath)]);

    if (sourceStats.mtime > destStats.mtime) {
        await fs.copy(sourcePath, destPath, { overwrite: true });
        return { status: 'updated', fileName: path.basename(destPath) };
    }

    return { status: 'skipped', fileName: path.basename(destPath) };
}

function logCopyResult(result) {
    if (result.status === 'updated') {
        console.log(`Arquivo atualizado: ${result.fileName}`);
    }

    if (result.status === 'skipped') {
        console.log(`Arquivo ignorado (já existe): ${result.fileName}`);
    }
}

async function copyFiles(sourceDir, destDir) {
    await fs.ensureDir(destDir);

    const filesToCopy = await getMediaFiles(sourceDir);

    if (filesToCopy.length === 0) {
        console.log('Nenhum arquivo encontrado para copiar.');
        return;
    }

    console.log(`Total de arquivos encontrados: ${filesToCopy.length}`);

    const { proceed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: `Deseja prosseguir com a cópia de ${filesToCopy.length} arquivos?`,
            default: false,
        },
    ]);

    if (!proceed) {
        console.log('Operação cancelada pelo usuário.');
        return;
    }

    const usedNames = new Map();

    for (let index = 0; index < filesToCopy.length; index += 1) {
        const relativeFile = filesToCopy[index];
        const sourcePath = path.join(sourceDir, relativeFile);
        const destinationPath = buildUniqueDestinationPath(destDir, path.basename(relativeFile), usedNames);
        const result = await copyIfNeeded(sourcePath, destinationPath);

        logCopyResult(result);

        const progress = (((index + 1) / filesToCopy.length) * 100).toFixed(2);
        console.log(`Progresso: ${progress}% - Copiando: ${result.fileName}`);
    }

    console.log('\nResumo da operação:');
    console.log(`Total de arquivos processados: ${filesToCopy.length}`);
    console.log(`Arquivos únicos: ${usedNames.size}`);
    console.log('Cópia concluída com sucesso!');
}

async function main() {
    try {
        console.log('\nSelecione os diretórios para a cópia dos arquivos:');
        const selectedDirectories = await selectDirectories();

        if (!selectedDirectories) {
            return;
        }

        const { sourceDir, destDir } = selectedDirectories;

        console.log('\nDiretórios selecionados:');
        console.log(`Origem: ${sourceDir}`);
        console.log(`Destino: ${destDir}\n`);

        await copyFiles(sourceDir, destDir);
    } catch (error) {
        console.error('Erro durante a cópia:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    VALID_EXTENSIONS,
    buildUniqueDestinationPath,
    copyFiles,
    copyIfNeeded,
    getMediaFiles,
    isSupportedMediaFile,
    selectDirectories,
};
