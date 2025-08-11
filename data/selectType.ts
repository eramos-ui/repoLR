//los typos y valores que se usan en los select, especialmente en DynamicForm
export const OptionsProjectType =[
    { value: "piso", label: "En piso"},
    { value: "techo", label: "En el techo"}
] 
export const optionsLandType =[
  { value: "tierra", label: "Tierra"},
  { value: "arena", label: "Arena"},
  { value: "pantanoso", label: "Pantanoso"},
]
export const optionsStoneType =[
  { value: "bajo", label: "Bajo"},
  { value: "medio", label: "Medio"},
  { value: "alto", label: "Alto"},
] 
export const optionsConectionPointType =[
  { value: "menor70", label: "Menor a 70 mtrs"},
  { value: "mayor70", label: ">= 70 mtrs"},
] 
export const optionsMaterialCielingType =[
  { value: "teja asfaltica", label: "Asfalto"},
  { value: "teja", label: "Teja chilena"},
  { value: "madera", label: "Madera"},
] 

export const optionsCertificadoAccesoType =[
  { value: "conAcceso", label: "Tiene acceso certificado"},
  { value: "sinCertificado", label: "No tiene acceso certificado"},
] 
export const optionsOrientationType = [
  { value: "norte", label: "Norte" },
  { value: "sur", label: "Sur" },
  { value: "este", label: "Este" },
  { value: "oeste", label: "Oeste" },
  { value: "noreste", label: "Noreste" },
  { value: "sureste", label: "Sureste" },
  { value: "noroeste", label: "Noroeste" },
  { value: "suroeste", label: "Suroeste" },
];
export const optionsCeilingElementType = [
  { value: "aireAcondicionado", label: "Aire acondicionado" },
  { value: "tragaluces", label: "Tragaluz" },
];

export const optionsFormularioType = [
  { value: "F4", label: "Formulario F4" },
  { value: "F2", label: "Formulario F2" },
];


export const techoOptions = [
  { value: "aDosAguas", label: "Dos aguas",image:"/techos/dos-aguas.jpg", nroAguas:2 },
  { value: "aCuatroAguas", label: "Cuatro aguas", image:"/techos/cuatro-aguas.jpg", nroAguas:4},
  { value: "techoMariposa", label: "Mariposa", image:"/techos/mariposa.jpg", nroAguas:2 },
  { value: "techoFormaM", label: "Tipo M", image:"/techos/forma-M.jpg" , nroAguas:4 },
  { value: "techoBuhardilla", label: "Dos aguas/buhardilla", image:"/techos/con-buhardilla.jpg" , nroAguas:2 },
  { value: "piramide", label: "Pirámide", image:"/techos/piramide.jpg", nroAguas:4 },
  { value: "cobertizo", label: "Cobertizo", image:"/techos/cobertizo.png", nroAguas:1 },
  { value: "hexagonal", label: "Hexagonal", image:"/techos/hexagonal.jpg", nroAguas:6 },
  { value: "plano", label: "Mediterráneo", image:"/techos/plano-mediterraneo.jpg", nroAguas:1 },
  { value: "otro", label: "Otro", image:"/techos/otro.jpg" , nroAguas:0},
];

export const plazoControlOptions = [
  { label: "diario", value:"dia" },
  { label: "semanal", value:"semana" },
  { label: "mensual", value:"mes" },
  { label: "al término", value:"termino" },
]
export const formEjecucionActividadOptions =[
  { value: "externa", label:"Subcontrato externo" },
  { value: "interna", label:"Ejecución interna" },
]