// Script para reemplazar 'node:events' por 'events' en node_modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para buscar archivos recursivamente
function findFiles(dir, pattern, callback) {
  console.log(`Buscando en ${dir}...`);
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findFiles(filePath, pattern, callback);
        } else if (pattern.test(file)) {
          callback(filePath);
        }
      } catch (err) {
        console.error(`Error al acceder a ${filePath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error al leer directorio ${dir}: ${err.message}`);
  }
}

// Función para buscar texto en un archivo
function searchInFile(filePath, search) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(search)) {
      console.log(`Encontrado '${search}' en: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error al leer ${filePath}: ${err.message}`);
    return false;
  }
}

// Función para reemplazar texto en un archivo
function replaceInFile(filePath, search, replace) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(search)) {
      console.log(`Encontrado '${search}' en ${filePath}`);
      const newContent = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  Reemplazado por '${replace}' en ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error al procesar ${filePath}: ${err.message}`);
    return false;
  }
}

// Directorios a procesar
const dirsToSearch = [
  path.join(__dirname, 'node_modules', 'mssql'),
  path.join(__dirname, 'node_modules', 'tedious'),
  // También buscar en otros módulos donde pueda ocurrir este problema
  path.join(__dirname, 'node_modules', '@tediousjs'),
  path.join(__dirname, 'node_modules', 'better-sqlite3'),
  path.join(__dirname, 'node_modules', 'node-fetch'),
];

// Términos a buscar
const searchTerms = [
  "node:events",
  "node:stream",
  "node:buffer",
  "node:util",
  "node:path",
  "node:fs",
  "node:crypto",
];

// Patrones a reemplazar
const replacements = [
  { search: "require('node:events')", replace: "require('events')" },
  { search: 'require("node:events")', replace: 'require("events")' },
  { search: "from 'node:events'", replace: "from 'events'" },
  { search: 'from "node:events"', replace: 'from "events"' },
  { search: "require('node:stream')", replace: "require('stream')" },
  { search: 'require("node:stream")', replace: 'require("stream")' },
  { search: "from 'node:stream'", replace: "from 'stream'" },
  { search: 'from "node:stream"', replace: 'from "stream"' },
  { search: "require('node:buffer')", replace: "require('buffer')" },
  { search: 'require("node:buffer")', replace: 'require("buffer")' },
  { search: "require('node:util')", replace: "require('util')" },
  { search: 'require("node:util")', replace: 'require("util")' },
  { search: "require('node:path')", replace: "require('path')" },
  { search: 'require("node:path")', replace: 'require("path")' },
  { search: "require('node:fs')", replace: "require('fs')" },
  { search: 'require("node:fs")', replace: 'require("fs")' },
  { search: "require('node:crypto')", replace: "require('crypto')" },
  { search: 'require("node:crypto")', replace: 'require("crypto")' },
];

// Primero, veamos dónde están los términos problemáticos
console.log("== BUSCANDO TÉRMINOS PROBLEMÁTICOS ==");
for (const dir of dirsToSearch) {
  if (fs.existsSync(dir)) {
    for (const term of searchTerms) {
      findFiles(dir, /\.(js|mjs|cjs|ts)$/, (filePath) => {
        searchInFile(filePath, term);
      });
    }
  } else {
    console.log(`El directorio ${dir} no existe.`);
  }
}

// Ahora, reemplacemos los términos
console.log("\n== REEMPLAZANDO TÉRMINOS PROBLEMÁTICOS ==");
let modifiedFiles = 0;

// Procesar cada directorio
for (const dir of dirsToSearch) {
  if (fs.existsSync(dir)) {
    findFiles(dir, /\.(js|mjs|cjs|ts)$/, (filePath) => {
      let fileModified = false;
      
      for (const { search, replace } of replacements) {
        if (replaceInFile(filePath, search, replace)) {
          fileModified = true;
        }
      }
      
      if (fileModified) {
        modifiedFiles++;
      }
    });
  }
}

console.log(`\nProceso completado. Se modificaron ${modifiedFiles} archivos.`); 