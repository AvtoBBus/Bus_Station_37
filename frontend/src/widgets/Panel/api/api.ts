import type { Item } from "$shared/types";
import { BaseApi } from "../../../shared/api/Api"

export class ItemsApi extends BaseApi {
    getSelectedItems(offset: number, limit: number, search: string): Promise<Item[]> {
        return this.doFetch('items', 'GET', { limit: String(limit), offset: String(offset), search: search ?? "", selected: 'true' }).then(r => r.json());
    };
    
    getUnselectedItems(offset: number, limit: number, search: string): Promise<Item[]> {
        return this.doFetch('items', 'GET', { limit: String(limit), offset: String(offset), search: search ?? "", selected: 'false' }).then(r => r.json());
    };

    switchSelected(itemId: string): Promise<unknown> {
        return this.doFetch('switchSelected', 'GET', { id: itemId });
    };

    addItem(newId: string): Promise<unknown> {
        return this.doFetch('addItem', 'POST', null, { id: newId })
    };

    moveItem(itemId: string, targetBeforeId: string, targetAfterId: string): Promise<unknown> {
        return this.doFetch('moveItem', 'POST', null, { itemId, targetBeforeId, targetAfterId })
    }
}