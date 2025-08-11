  // 📌 Función para reemplazar los placeholders
 export const replacePlaceholders = (text: string, values: Record<string, string>) => {
    // console.log("🔍 Texto antes del reemplazo:", JSON.stringify(text));
    // console.log("🔍 Valores a reemplazar:", JSON.stringify(values));
    return text
      .replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`)
      .replace(/\\n/g, "<br>")  // 📌 Si los `\n` están escapados
      .replace(/\n/g, "<br>");   // 📌 Si los `\n` son reales
      //.replace('{Observacion}',""); //para evitar que salga {Observacion} que es cuando está vacio
  };