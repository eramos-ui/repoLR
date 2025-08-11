"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faWindowClose} from "@fortawesome/free-solid-svg-icons";




const GraciasPage = () => {
    const router                        = useRouter();
    const {accion, opcion}              = router.query;
    const [puedeCerrar, setPuedeCerrar] = useState(false);
    console.log('opcion',accion,opcion);
    useEffect(() => {
        // Intenta cerrar automáticamente, pero si no puede, muestra el botón
        if (window.opener) {
          window.close();
        } else {
          setPuedeCerrar(true);
        }
      }, []);
    
      const handleCerrarVentana = () => {
        window.close();
      };
      const getMensaje = () => {
        if (accion === "registrar") {
          return opcion === "cotizar"
            ? "Tu cotización ha sido registrada con éxito."
            : "Tu solicitud de aclaración ha sido enviada.";
        } else {
          return opcion === "cotizar"
            ? "Has cancelado tu cotización. En el correo que te enviamos, puedes volver a cotizar mientras no se cumpla la fecha de vencimiento."
            : "Has cancelado tu solicitud de aclaración. En el correo que te enviamos, puedes volver a solicitar aclaración o cotizar mientras no se cumpla la fecha de vencimiento."
        }
      };
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", 
          justifyContent: "center", height: "100vh", textAlign: "center"
        }}>
          <FontAwesomeIcon icon={accion === "registrar" ? faCheckCircle : faTimesCircle} size="4x" color={accion === "registrar" ? "green" : "red"} />
          <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>
            {accion === "registrar" ? "✅ ¡Gracias por tu respuesta!" : "❌ Acción cancelada"}
          </h1>
          <p>{getMensaje()}</p>
          <p>Puedes cerrar esta ventana.</p>    
          {/* Solo muestra el botón si no se pudo cerrar automáticamente */}
          {puedeCerrar && (
            <button 
              onClick={handleCerrarVentana} 
              style={{
                marginTop: "1rem",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#e3342f",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              <FontAwesomeIcon icon={faWindowClose} style={{ marginRight: "8px" }} />
              Cerrar Ventana
            </button>
          )}
        </div>
      );


//   if (accion==='cancelar') {
//     return (
//       <div className="cotizar-container">
//         <div className="cotizar-welcome-container">
//           <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-4" />
//           {/* <h1 className="text-2xl font-bold text-gray-800">¡Gracias por su solic!</h1> */}
//           <p className="text-gray-600 mt-2">Hemos recibido dejado abierta su página de cotización para que ingresa posteriormente.</p>
//             <p className="text-gray-600">Puede cerrar esta ventana o esperar a que se cierre automáticamente.</p>
//             <button
//           className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
//           onClick={() => window.close()}
//         >
//           Cerrar ventana
//         </button>
//         </div>
//       </div>
//     );
//   }
//   if (opcion==='cotizar') {
//     return (
//         <div className="cotizar-container">
//         {/* <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md"> */}
//         <div className="cotizar-welcome-container">
//           <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-4" />
//           <h1 className="text-2xl font-bold text-gray-800">¡Gracias por su cotización!</h1>
//           <p className="text-gray-600 mt-2">Hemos recibido su oferta y la estamos procesando.</p>
//           <p className="text-gray-600">Puede cerrar esta ventana o esperar a que se cierre automáticamente.</p>
//           <button
//             className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
//             onClick={() => window.close()}
//           >
//             Cerrar ventana
//           </button>
//         </div>
//       </div>
//       );
//   }
//   return (//aclaraión
//     <div className="cotizar-container">
//       <div className="cotizar-welcome-container">
//         <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-4" />
//         <h1 className="text-2xl font-bold text-gray-800">¡Gracias por su solicutd de aclaración!</h1>
//         <p className="text-gray-600 mt-2">Hemos recibido solicitud y la estamos procesando.</p>
//         <p className="text-gray-600">Puede cerrar esta ventana o esperar a que se cierre automáticamente.</p>
//         <button
//           className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
//           onClick={() => window.close()}
//         >
//           Cerrar ventana
//         </button>
//       </div>
//     </div>
//   );
}
export default GraciasPage;
