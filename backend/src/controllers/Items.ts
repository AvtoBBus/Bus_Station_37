import { Request, Response } from 'express';
import { sortMap } from '../utils/sortMap';
import { Item } from '../utils/types';

const mainStorage = new Map<string, Item>();

for (let i = 1; i <= 1000000; i++) {
    mainStorage.set(i.toString(), { id: i.toString(), order: i, initialOrder: i, selected: false });
}

const addOrder = new Map<string, () => void>([]);
const switchOrder = new Map<string, () => void>([]);
const moveOrder = new Map<string, () => void>([]);

setInterval(() => {
  addOrder.forEach(item => item());
  addOrder.clear();
}, 10 * 1_000)

setInterval(() => {
  switchOrder.forEach(item => item());
  switchOrder.clear();
}, 1000)

setInterval(() => {
  if (moveOrder.size === 0) return;
  moveOrder.forEach(item => item());
  moveOrder.clear();
  sortMap(mainStorage, true);
}, 1000)

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
      res.status(404).json("Отсутствует элемент с данным id");
      return;
    }

    if (switchOrder.has(itemId)) {
      switchOrder.delete(itemId);
    } else {
      switchOrder.set(itemId, () => {
        element.selected = !element.selected;

        if (!element.selected) {
          element.order = element.initialOrder;
          sortMap(mainStorage, false);
        }
      });
    };

    res.status(202).json('Задача заведена');
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

    moveOrder.set(
      `${itemId}_${targetBeforeId}_${targetAfterId}`,
      () => {
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
    })

    res.status(202).json('Задача заведена');
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

    if (mainStorage.has(id) && addOrder.has(id)) {
      res.status(400).json(`Элемент с id ${id} уже существует`)
      return;
    }

    addOrder.set(
      id,
      () => {
        mainStorage.set(id, { id, order: mainStorage.size + 1, initialOrder: mainStorage.size + 1, selected: false });
      }
    );

    res.status(202).json('Задача заведена');
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
};