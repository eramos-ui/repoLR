export interface Labels {
    general: {
      botonGoToMenu: string;
      tooltipBotonGotoMenu: string;
      loading:string;
    };
    navbar: {
      botonSalida: string;
      menu: string;
      appName: string;
    };
    sin:{
       sinInvalid:string;
       sinToSmall:string;  
       sinPlaceholder:string;
    };
    rut:{
      rutInvalid:string;
      rutToSmall:string;  
      rutPlaceholder:string;
    };
    grid: {
      buttonAdd: string;
      tooltipsDelete: string;
      tooltipsEdit: string;
      tooltipsZoom:string;
      objectGrid:string;//el objeto editado o agregado o eliminado -label de la grilla en singular
      errorMsgDuplicate: string;
    };
    select: {
      labelSelect:string;
    }
    login: {
      title: string;
      emailPlaceholder: string;
      passwordPlaceholder: string;
      botonLogin: string;
      labelOpcion: string;
      botonGoogle: string;
      linkNewUser: string;
      linkForgotPass: string;
    };
    forgotPassword: {
      title: string;
      botonEnviar: string;
      emailPlaceHolder: string;
      messageEnviado: string;
      mailSubject: string;
      mailText: string;
      mailHtml: string;
      messageSendMail: string;
      messageNotSendMail: string;
      messageErrorMailRequired: string;
    };
    resetPassword: {
      title: string;
      namePlaceholder: string;
      Email: string;
      passwordPlaceholder: string;
      passwordConfirmPlaceholder: string;
      botonResetPassword: string;
      messageFailedPassword: string;
      messageTokenNoValid: string;
      messageResetSuccess: string;
      messageResetInvalid: string;
    };
    registerNewUser: {
      title: string;
      namePlaceholder: string;
      EmailPlaceholder: string;
      passwordPlaceholder: string;
      passwordConfirmPlaceholder: string;
      botonRegister: string;
      urlToLogin: string;
      labelBotonRegister: string;
      messageSuccess: string;
      messageFailed: string;
      messageFailedPassword: string;
    };
  }
  