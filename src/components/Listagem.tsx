import type { ItemListagemProps } from "./ItemListagem";
import ItemListagem from "./ItemListagem"

export type ListagemProps<T> = {
    items: ItemListagemProps<T>[]
}

function Listagem<T>({items = []}: ListagemProps<T>) {

    return items.map(item => (
                <ItemListagem key={item.label} {...item}/>
            ))
}

export default Listagem;