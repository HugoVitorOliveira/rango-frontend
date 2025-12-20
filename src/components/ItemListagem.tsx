export type ItemListagemProps<T> = {
    label: string
    value: T
    clicked: (value: T) => void
}

function ItemListagem<T>({label, value, clicked}: ItemListagemProps<T>) {

    return (
        <>
            <p onClick={() => clicked(value)}>{label}</p>
        </>
    )
}

export default ItemListagem;