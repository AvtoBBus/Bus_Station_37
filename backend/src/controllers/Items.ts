import { Request, Response } from 'express';
import { sortMap } from '../utils/sortMap';

const mainStorage = new Map<string, { id: string, order: number, initialOrder: number, selected: boolean }>();

for (let i = 1; i <= 1000000; i++) {
    mainStorage.set(i.toString(), { id: i.toString(), order: i, initialOrder: i, selected: false });
}

export const getItems = async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const search = String(query.search ?? "");
    const offset = Number(query.offset);
    const limit = Number(query.limit);
    const selected = query.selected === 'true';

    if (Number.isNaN(offset) || typeof offset !== 'number') {
      res.status(400).json("Отсутствует параметр offset");
      return;
    }

    if (Number.isNaN(limit) || typeof limit !== 'number') {
      res.status(400).json("Отсутствует параметр limit");
      return;
    }

    const iterator = mainStorage.values();

    let current = iterator.next();
    let i = 0;
    while (!current.done && i < offset) {
      if (current.value.id.includes(search) && selected === current.value.selected) {
        i++;
      }
      current = iterator.next();
    }

    const batch = [];
    i = 0;
    while (!current.done && i < limit) {
      if (current.value.id.includes(search) && selected === current.value.selected) {
        batch.push({
          id: current.value.id,
          order: current.value.order,
          selected: current.value.selected
        });
        i++;
      }
      current = iterator.next();
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
};

export const switchSelected = async (req: Request, res: Response) => {
  try {
    const query = req.query;

    const itemId = String(query.id);

    if (!itemId) {
      res.status(400).json("Отсутствует параметр id");
      return;
    }

    const element = mainStorage.get(itemId);

    if (!element) {
      res.status(404).json("Отсутствует параметр с данным id");
      return;
    }

    element.selected = !element.selected;

    if (!element.selected) {
      element.order = element.initialOrder;

      mainStorage.delete(itemId);
      mainStorage.set(itemId, element);

      sortMap(mainStorage, false);
    }

    res.status(204).json('Success');
    return;
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
};

export const moveItem = async (req: Request, res: Response) => {
  try {
    const { itemId, targetBeforeId, targetAfterId } = req.body;

    const item = mainStorage.get(itemId as string);

    if (!item) {
      res.status(404).json('Элемент не найден');
      return;
    }

    if (!targetBeforeId) {
      const firstItemOrder = mainStorage.get(targetAfterId as string)?.order || 0;
      item.order = Math.round(firstItemOrder) - 0.5;
    } else if (!targetAfterId) {
      const lastItemOrder = mainStorage.get(targetBeforeId as string)?.order || mainStorage.size;
      item.order = Math.round(lastItemOrder) + 0.5;
    } else {
      const orderBefore = mainStorage.get(targetBeforeId)!.order;
      const orderAfter = mainStorage.get(targetAfterId)!.order;
      item.order = (orderBefore + orderAfter) / 2;
    }

    sortMap(mainStorage, true);

    res.status(204).json('Success');
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      res.status(400).json("Отсутствует id")
      return;
    }

    if (mainStorage.has(id)) {
      res.status(400).json(`Элемент с id ${id} уже существует`)
      return;
    }

    mainStorage.set(id, { id, order: mainStorage.size + 1, initialOrder: mainStorage.size + 1, selected: false });

    res.status(204).json('Success');
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
};