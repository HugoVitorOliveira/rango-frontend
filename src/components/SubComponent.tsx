import Style from './SubComponent.module.css';

export type SubComponentProps = {
    label: string,
    number: number
} 

function SubComponent({label, number}: SubComponentProps) {

    return (
        <>
        <p className={Style.texto_forte}> {label} tem {number} pintos</p>
        <p className={Style.texto_fraco}>Ain bolsonaro goza em mim</p>
        </>
    )
}

export default SubComponent;