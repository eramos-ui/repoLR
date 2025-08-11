import './CustomLabel.css';


export interface Props {//para cambiar las props del control
   /**
    * Text to display
    */
   label: string;
   /**
    * Label size
    */
   size?:'normal' | 'h1' | 'h2' | 'h3'  | 'normal+'; //definidas en el css
   /**
    * capitalize all label
    */
   allCaps?: boolean;
   /**
    * color
    */
   color?: 'text-primary' | 'text-secondary' | 'text-tertiary' ; //que está en el css como primary, secondary.... ese color 
   /**
    * font color del texto del span
    */
   fontColor?: string;
   theme?: 'light' | 'dark';
   style?: React.CSSProperties; 
}
export const CustomLabel =({
   label,
   size ='normal',
   allCaps= false,
   color= 'text-primary',
   fontColor,
   theme = 'light',
   style,
}: Props) =>{
 return (
    <span className={`${ size } ${ color }  ${theme} label`}
         style ={{...style, color: fontColor}}
    > {(allCaps)?label.toUpperCase(): label}
    </span>
 )
}