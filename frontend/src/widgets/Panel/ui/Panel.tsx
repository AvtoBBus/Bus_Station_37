import type { Item } from "$shared/types";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { PanelProps } from "../model/types";
import { ItemsApi } from "../api/api";
import "./Panel.scss";
import { debounce } from "$shared/utils/debounce";

const Panel = (props: PanelProps) => {
    const [items, setItems] = useState<Map<string, Item>>(new Map());
    const [, setIsLoadingMore] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [addElement, setAddElement] = useState<string>("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    
    const loaderRef = useRef<HTMLDivElement>(null); 
    
    const isLoadingRef = useRef<boolean>(false);

    const loadingOffset = useRef<number>(0);

    const loadingFunction = useRef<(offset: number, limit: number, search: string) => Promise<Item[]>>(null);

    const api = new ItemsApi();

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const mapEntries = Array.from(items.entries());
        const [draggedEntry] = mapEntries.splice(draggedIndex, 1);
        mapEntries.splice(targetIndex, 0, draggedEntry);

        setDraggedIndex(targetIndex);
        setItems(new Map(mapEntries));
    };

    const handleDragEnd = () => {
        console.log(123)
        if (draggedIndex === null) return;

        const currentEntries = Array.from(items.entries());
        
        const [itemId, ] = currentEntries[draggedIndex];

        const beforeEntry = currentEntries[draggedIndex - 1];
        const afterEntry = currentEntries[draggedIndex + 1];

        const targetBeforeId = beforeEntry ? beforeEntry[0] : "";
        const targetAfterId = afterEntry ? afterEntry[0] : "";

        setDraggedIndex(null);

        api.moveItem(itemId, targetBeforeId, targetAfterId)
            .then(updateItems);
    };

    const debouncedSearch = useMemo(() => {
        return debounce((searchValue: unknown) => {
            loadingOffset.current = 0;
            
            loadingFunction.current(0, 20, searchValue as string)
                .then((r: Item[]) => setItems(new Map(r.map(item => [item.id, item]))));
        }, 600);
    }, [loadingOffset.current]);

    function updateItems() {
        loadingOffset.current = 0;

        if (!loadingFunction.current) return;

        loadingFunction.current(loadingOffset.current, 20, search).then((r: Item[]) => setItems(new Map(r.map(item => [item.id, item]))))
    };

    function handleSelect(itemId: string) {
        api.switchSelected(itemId).then(() => {
            if (items.get(itemId)!.selected === props.isSelectedItems)  {
                items.delete(itemId);
                props.onUpdateList();
            }
        });
    };

    function handleSearch(e: ChangeEvent) {
        const value = (e.target as HTMLInputElement).value;
        setSearch(value);
        
        debouncedSearch(value);
    };

    function handleAddElement() {
        api.addItem(addElement).then(() => {
            updateItems();
            setAddElement("");
        });
    };

    useEffect(() => {
        loadingFunction.current = (props.isSelectedItems ? api.getSelectedItems : api.getUnselectedItems).bind(api);
        updateItems();
    }, []);

    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && loadingFunction.current && !isLoadingRef.current) {
                    isLoadingRef.current = true;
                    setIsLoadingMore(true);

                    const nextOffset = loadingOffset.current + 20;

                    loadingFunction.current(nextOffset, 20, search)
                        .then(response => {
                        if (response && response.length > 0) {
                            loadingOffset.current = nextOffset;

                            setItems((prev) => {
                                const next = prev;
                                response.forEach(item => next.set(item.id, item))
                                return next;
                            });
                        }
                        })
                        .finally(() => {
                            isLoadingRef.current = false;
                            setIsLoadingMore(false);
                        });
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(currentLoader);

        return () => {
            observer.disconnect();
        };
    }, [search]);

    useEffect(updateItems, [props.updateTrigger])

    return <>
        <section key={props.panelClass} className={props.panelClass}>
            <div className="actions-panel">
                <div className="actions-panel__search">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Поиск по id"
                    />
                </div>
                {!props.isSelectedItems && <div className="actions-panel__add-element">
                    <input
                        type="text"
                        value={addElement}
                        onChange={(e) => setAddElement(e.target.value)}
                        placeholder="Добавить элемент"
                    />
                    <button onClick={handleAddElement}>
                        +
                    </button>
                </div>}
            </div>
            {Array.from(items).map(([, item], index) => 
                <div
                    draggable={props.isSelectedItems}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    key={item.id}
                    className="panel-item"
                >
                    <p
                        key={'item-' + item.id}
                        id={(props.isSelectedItems ? '' : 'un')+  'selected_' + item.id}
                    >
                        <span>Элемент: {item.id}</span>
                        <span>Порядок: {item.order}</span>
                    </p>
                    <button
                        key={'button-item-' + item.id}
                        onClick={() => handleSelect(item.id)}
                    >
                        {!props.isSelectedItems ? 'Выбрать' : 'Убрать выбор'}
                    </button>
                </div>
            )}
            <div ref={loaderRef}></div>
        </section>
    </>;
}

export default Panel;